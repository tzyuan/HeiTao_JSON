


var Kinetic = {};
(function () {
    Kinetic.version = "4.6.0";
    Kinetic.Filters = {};
    Kinetic.Node = function (config) {
        this._init(config);
    };
    Kinetic.Shape = function (config) {
        this.__init(config);
    };
    Kinetic.Container = function (config) {
        this.__init(config);
    };
    Kinetic.Stage = function (config) {
        this.___init(config);
    };
    Kinetic.Layer = function (config) {
        this.___init(config);
    };
    Kinetic.Group = function (config) {
        this.___init(config);
    };
    Kinetic.Global = {stages:[], idCounter:0, ids:{}, names:{}, shapes:{}, listenClickTap:false, inDblClickWindow:false, dblClickWindow:400, isDragging:function () {
        var dd = Kinetic.DD;
        if (!dd) {
            return false;
        } else {
            return dd.isDragging;
        }
    }, isDragReady:function () {
        var dd = Kinetic.DD;
        if (!dd) {
            return false;
        } else {
            return !!dd.node;
        }
    }, _addId:function (node, id) {
        if (id !== undefined) {
            this.ids[id] = node;
        }
    }, _removeId:function (id) {
        if (id !== undefined) {
            delete this.ids[id];
        }
    }, _addName:function (node, name) {
        if (name !== undefined) {
            if (this.names[name] === undefined) {
                this.names[name] = [];
            }
            this.names[name].push(node);
        }
    }, _removeName:function (name, _id) {
        if (name !== undefined) {
            var nodes = this.names[name];
            if (nodes !== undefined) {
                for (var n = 0; n < nodes.length; n++) {
                    var no = nodes[n];
                    if (no._id === _id) {
                        nodes.splice(n, 1);
                    }
                }
                if (nodes.length === 0) {
                    delete this.names[name];
                }
            }
        }
    }};
})();
(function (root, factory) {
    if (typeof exports === "object") {
        module.exports = factory();
    } else {
        if (typeof define === "function" && define.amd) {
            define(factory);
        } else {
            root.returnExports = factory();
        }
    }
}(this, function () {
    return Kinetic;
}));
(function () {
    Kinetic.Collection = function () {
        var args = [].slice.call(arguments), length = args.length, i = 0;
        this.length = length;
        for (; i < length; i++) {
            this[i] = args[i];
        }
        return this;
    };
    Kinetic.Collection.prototype = [];
    Kinetic.Collection.prototype.each = function (func) {
        for (var n = 0; n < this.length; n++) {
            func(this[n], n);
        }
    };
    Kinetic.Collection.prototype.toArray = function () {
        var arr = [], len = this.length, n;
        for (n = 0; n < len; n++) {
            arr.push(this[n]);
        }
        return arr;
    };
    Kinetic.Collection.toCollection = function (arr) {
        var collection = new Kinetic.Collection(), len = arr.length, n;
        for (n = 0; n < len; n++) {
            collection.push(arr[n]);
        }
        return collection;
    };
    Kinetic.Collection.mapMethods = function (arr) {
        var leng = arr.length, n;
        for (n = 0; n < leng; n++) {
            (function (i) {
                var method = arr[i];
                Kinetic.Collection.prototype[method] = function () {
                    var len = this.length, i;
                    args = [].slice.call(arguments);
                    for (i = 0; i < len; i++) {
                        this[i][method].apply(this[i], args);
                    }
                };
            })(n);
        }
    };
})();
(function () {
    Kinetic.Transform = function () {
        this.m = [1, 0, 0, 1, 0, 0];
    };
    Kinetic.Transform.prototype = {translate:function (x, y) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
    }, scale:function (sx, sy) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;
    }, rotate:function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = this.m[0] * c + this.m[2] * s;
        var m12 = this.m[1] * c + this.m[3] * s;
        var m21 = this.m[0] * -s + this.m[2] * c;
        var m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
    }, getTranslation:function () {
        return {x:this.m[4], y:this.m[5]};
    }, skew:function (sx, sy) {
        var m11 = this.m[0] + this.m[2] * sy;
        var m12 = this.m[1] + this.m[3] * sy;
        var m21 = this.m[2] + this.m[0] * sx;
        var m22 = this.m[3] + this.m[1] * sx;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
    }, multiply:function (matrix) {
        var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
        var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
        var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
        var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
        var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
        var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        this.m[4] = dx;
        this.m[5] = dy;
    }, invert:function () {
        var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
        var m0 = this.m[3] * d;
        var m1 = -this.m[1] * d;
        var m2 = -this.m[2] * d;
        var m3 = this.m[0] * d;
        var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;
    }, getMatrix:function () {
        return this.m;
    }, setAbsolutePosition:function (x, y) {
        var m0 = this.m[0], m1 = this.m[1], m2 = this.m[2], m3 = this.m[3], m4 = this.m[4], m5 = this.m[5], yt = ((m0 * (y - m5)) - (m1 * (x - m4))) / ((m0 * m3) - (m1 * m2)), xt = (x - m4 - (m2 * yt)) / m0;
        this.translate(xt, yt);
    }};
})();
(function () {
    var CANVAS = "canvas", CONTEXT_2D = "2d", OBJECT_ARRAY = "[object Array]", OBJECT_NUMBER = "[object Number]", OBJECT_STRING = "[object String]", PI_OVER_DEG180 = Math.PI / 180, DEG180_OVER_PI = 180 / Math.PI, HASH = "#", EMPTY_STRING = "", ZERO = "0", KINETIC_WARNING = "Kinetic warning: ", KINETIC_ERROR = "Kinetic error: ", RGB_PAREN = "rgb(", COLORS = {aqua:[0, 255, 255], lime:[0, 255, 0], silver:[192, 192, 192], black:[0, 0, 0], maroon:[128, 0, 0], teal:[0, 128, 128], blue:[0, 0, 255], navy:[0, 0, 128], white:[255, 255, 255], fuchsia:[255, 0, 255], olive:[128, 128, 0], yellow:[255, 255, 0], orange:[255, 165, 0], gray:[128, 128, 128], purple:[128, 0, 128], green:[0, 128, 0], red:[255, 0, 0], pink:[255, 192, 203], cyan:[0, 255, 255], transparent:[255, 255, 255, 0]}, RGB_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/;
    Kinetic.Util = {_isElement:function (obj) {
        return !!(obj && obj.nodeType == 1);
    }, _isFunction:function (obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }, _isObject:function (obj) {
        return (!!obj && obj.constructor == Object);
    }, _isArray:function (obj) {
        return Object.prototype.toString.call(obj) == OBJECT_ARRAY;
    }, _isNumber:function (obj) {
        return Object.prototype.toString.call(obj) == OBJECT_NUMBER;
    }, _isString:function (obj) {
        return Object.prototype.toString.call(obj) == OBJECT_STRING;
    }, _hasMethods:function (obj) {
        var names = [], key;
        for (key in obj) {
            if (this._isFunction(obj[key])) {
                names.push(key);
            }
        }
        return names.length > 0;
    }, _isInDocument:function (el) {
        while (el = el.parentNode) {
            if (el == document) {
                return true;
            }
        }
        return false;
    }, _getXY:function (arg) {
        if (this._isNumber(arg)) {
            return {x:arg, y:arg};
        } else {
            if (this._isArray(arg)) {
                if (arg.length === 1) {
                    var val = arg[0];
                    if (this._isNumber(val)) {
                        return {x:val, y:val};
                    } else {
                        if (this._isArray(val)) {
                            return {x:val[0], y:val[1]};
                        } else {
                            if (this._isObject(val)) {
                                return val;
                            }
                        }
                    }
                } else {
                    if (arg.length >= 2) {
                        return {x:arg[0], y:arg[1]};
                    }
                }
            } else {
                if (this._isObject(arg)) {
                    return arg;
                }
            }
        }
        return null;
    }, _getSize:function (arg) {
        if (this._isNumber(arg)) {
            return {width:arg, height:arg};
        } else {
            if (this._isArray(arg)) {
                if (arg.length === 1) {
                    var val = arg[0];
                    if (this._isNumber(val)) {
                        return {width:val, height:val};
                    } else {
                        if (this._isArray(val)) {
                            if (val.length >= 4) {
                                return {width:val[2], height:val[3]};
                            } else {
                                if (val.length >= 2) {
                                    return {width:val[0], height:val[1]};
                                }
                            }
                        } else {
                            if (this._isObject(val)) {
                                return val;
                            }
                        }
                    }
                } else {
                    if (arg.length >= 4) {
                        return {width:arg[2], height:arg[3]};
                    } else {
                        if (arg.length >= 2) {
                            return {width:arg[0], height:arg[1]};
                        }
                    }
                }
            } else {
                if (this._isObject(arg)) {
                    return arg;
                }
            }
        }
        return null;
    }, _getPoints:function (arg) {
        var arr = [], n, len;
        if (arg === undefined) {
            return [];
        }
        len = arg.length;
        if (this._isArray(arg[0])) {
            for (n = 0; n < len; n++) {
                arr.push({x:arg[n][0], y:arg[n][1]});
            }
            return arr;
        }
        if (this._isObject(arg[0])) {
            return arg;
        } else {
            for (n = 0; n < len; n += 2) {
                arr.push({x:arg[n], y:arg[n + 1]});
            }
            return arr;
        }
    }, _getImage:function (arg, callback) {
        var imageObj, canvas, context, dataUrl;
        if (!arg) {
            callback(null);
        } else {
            if (this._isElement(arg)) {
                callback(arg);
            } else {
                if (this._isString(arg)) {
                    imageObj = new Image();
                    imageObj.onload = function () {
                        callback(imageObj);
                    };
                    imageObj.src = arg;
                } else {
                    if (arg.data) {
                        canvas = document.createElement(CANVAS);
                        canvas.width = arg.width;
                        canvas.height = arg.height;
                        context = canvas.getContext(CONTEXT_2D);
                        context.putImageData(arg, 0, 0);
                        dataUrl = canvas.toDataURL();
                        imageObj = new Image();
                        imageObj.onload = function () {
                            callback(imageObj);
                        };
                        imageObj.src = dataUrl;
                    } else {
                        callback(null);
                    }
                }
            }
        }
    }, _rgbToHex:function (r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }, _hexToRgb:function (hex) {
        hex = hex.replace(HASH, EMPTY_STRING);
        var bigint = parseInt(hex, 16);
        return {r:(bigint >> 16) & 255, g:(bigint >> 8) & 255, b:bigint & 255};
    }, getRandomColor:function () {
        var randColor = (Math.random() * 16777215 << 0).toString(16);
        while (randColor.length < 6) {
            randColor = ZERO + randColor;
        }
        return HASH + randColor;
    }, getRGB:function (color) {
        var rgb;
        if (color in COLORS) {
            rgb = COLORS[color];
            return {r:rgb[0], g:rgb[1], b:rgb[2]};
        } else {
            if (color[0] === HASH) {
                return this._hexToRgb(color.substring(1));
            } else {
                if (color.substr(0, 4) === RGB_PAREN) {
                    rgb = RGB_REGEX.exec(color.replace(/ /g, ""));
                    return {r:parseInt(rgb[1], 10), g:parseInt(rgb[2], 10), b:parseInt(rgb[3], 10)};
                } else {
                    return {r:0, g:0, b:0};
                }
            }
        }
    }, _merge:function (o1, o2) {
        var retObj = this._clone(o2);
        for (var key in o1) {
            if (this._isObject(o1[key])) {
                retObj[key] = this._merge(o1[key], retObj[key]);
            } else {
                retObj[key] = o1[key];
            }
        }
        return retObj;
    }, _clone:function (obj) {
        var retObj = {};
        for (var key in obj) {
            if (this._isObject(obj[key])) {
                retObj[key] = this._clone(obj[key]);
            } else {
                retObj[key] = obj[key];
            }
        }
        return retObj;
    }, _degToRad:function (deg) {
        return deg * PI_OVER_DEG180;
    }, _radToDeg:function (rad) {
        return rad * DEG180_OVER_PI;
    }, _capitalize:function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }, error:function (str) {
        throw new Error(KINETIC_ERROR + str);
    }, warn:function (str) {
        if (window.console && console.warn) {
            console.warn(KINETIC_WARNING + str);
        }
    }, extend:function (c1, c2) {
        for (var key in c2.prototype) {
            if (!(key in c1.prototype)) {
                c1.prototype[key] = c2.prototype[key];
            }
        }
    }, addMethods:function (constructor, methods) {
        var key;
        for (key in methods) {
            constructor.prototype[key] = methods[key];
        }
    }, _getControlPoints:function (p0, p1, p2, t) {
        var x0 = p0.x;
        var y0 = p0.y;
        var x1 = p1.x;
        var y1 = p1.y;
        var x2 = p2.x;
        var y2 = p2.y;
        var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        var d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        var fa = t * d01 / (d01 + d12);
        var fb = t * d12 / (d01 + d12);
        var p1x = x1 - fa * (x2 - x0);
        var p1y = y1 - fa * (y2 - y0);
        var p2x = x1 + fb * (x2 - x0);
        var p2y = y1 + fb * (y2 - y0);
        return [{x:p1x, y:p1y}, {x:p2x, y:p2y}];
    }, _expandPoints:function (points, tension) {
        var length = points.length, allPoints = [], n, cp;
        for (n = 1; n < length - 1; n++) {
            cp = Kinetic.Util._getControlPoints(points[n - 1], points[n], points[n + 1], tension);
            allPoints.push(cp[0]);
            allPoints.push(points[n]);
            allPoints.push(cp[1]);
        }
        return allPoints;
    }, _removeLastLetter:function (str) {
        return str.substring(0, str.length - 1);
    }};
})();
(function () {
    var canvas = document.createElement("canvas"), context = canvas.getContext("2d"), devicePixelRatio = window.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1, _pixelRatio = devicePixelRatio / backingStoreRatio;
    Kinetic.Canvas = function (config) {
        this.init(config);
    };
    Kinetic.Canvas.prototype = {init:function (config) {
        config = config || {};
        var width = config.width || 0, height = config.height || 0, pixelRatio = config.pixelRatio || _pixelRatio, contextType = config.contextType || "2d";
        this.pixelRatio = pixelRatio;
        this.element = document.createElement("canvas");
        this.element.style.padding = 0;
        this.element.style.margin = 0;
        this.element.style.border = 0;
        this.element.style.background = "transparent";
        this.element.style.position = "absolute";
        this.element.style.top = 0;
        this.element.style.left = 0;
        this.context = this.element.getContext(contextType);
        this.setSize(width, height);
    }, getElement:function () {
        return this.element;
    }, getContext:function () {
        return this.context;
    }, setWidth:function (width) {
        this.width = this.element.width = width * this.pixelRatio;
        this.element.style.width = width + "px";
    }, setHeight:function (height) {
        this.height = this.element.height = height * this.pixelRatio;
        this.element.style.height = height + "px";
    }, getWidth:function () {
        return this.width;
    }, getHeight:function () {
        return this.height;
    }, setSize:function (width, height) {
        this.setWidth(width);
        this.setHeight(height);
    }, clear:function (clip) {
        var context = this.getContext(), pos, size;
        if (clip) {
            pos = Kinetic.Util._getXY(clip);
            size = Kinetic.Util._getSize(clip);
            context.clearRect(pos.x || 0, pos.y || 0, size.width, size.height);
        } else {
            context.clearRect(0, 0, this.getWidth(), this.getHeight());
        }
    }, toDataURL:function (mimeType, quality) {
        try {
            return this.element.toDataURL(mimeType, quality);
        }
        catch (e) {
            try {
                return this.element.toDataURL();
            }
            catch (err) {
                Kinetic.Util.warn("Unable to get data URL. " + err.message);
                return "";
            }
        }
    }, fill:function (shape) {
        if (shape.getFillEnabled()) {
            this._fill(shape);
        }
    }, stroke:function (shape) {
        if (shape.getStrokeEnabled()) {
            this._stroke(shape);
        }
    }, fillStroke:function (shape) {
        var fillEnabled = shape.getFillEnabled();
        if (fillEnabled) {
            this._fill(shape);
        }
        if (shape.getStrokeEnabled()) {
            this._stroke(shape, shape.hasShadow() && shape.hasFill() && fillEnabled);
        }
    }, applyShadow:function (shape, drawFunc) {
        var context = this.context;
        context.save();
        this._applyShadow(shape);
        drawFunc();
        context.restore();
        drawFunc();
    }, _applyLineCap:function (shape) {
        var lineCap = shape.getLineCap();
        if (lineCap) {
            this.context.lineCap = lineCap;
        }
    }, _applyOpacity:function (shape) {
        var absOpacity = shape.getAbsoluteOpacity();
        if (absOpacity !== 1) {
            this.context.globalAlpha = absOpacity;
        }
    }, _applyLineJoin:function (shape) {
        var lineJoin = shape.getLineJoin();
        if (lineJoin) {
            this.context.lineJoin = lineJoin;
        }
    }, _applyAncestorTransforms:function (node) {
        var m = node.getAbsoluteTransform().getMatrix();
        this.context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    }, _clip:function (container) {
        var context = this.getContext(), clipX = container.getClipX() || 0, clipY = container.getClipY() || 0, clipWidth = container.getClipWidth(), clipHeight = container.getClipHeight();
        context.save();
        this._applyAncestorTransforms(container);
        context.beginPath();
        context.rect(clipX, clipY, clipWidth, clipHeight);
        context.clip();
        context.setTransform(1, 0, 0, 1, 0, 0);
    }};
    Kinetic.SceneCanvas = function (config) {
        Kinetic.Canvas.call(this, config);
    };
    Kinetic.SceneCanvas.prototype = {setWidth:function (width) {
        var pixelRatio = this.pixelRatio;
        Kinetic.Canvas.prototype.setWidth.call(this, width);
        this.context.scale(pixelRatio, pixelRatio);
    }, setHeight:function (height) {
        var pixelRatio = this.pixelRatio;
        Kinetic.Canvas.prototype.setHeight.call(this, height);
        this.context.scale(pixelRatio, pixelRatio);
    }, _fillColor:function (shape) {
        var context = this.context, fill = shape.getFill();
        context.fillStyle = fill;
        shape._fillFunc(context);
    }, _fillPattern:function (shape) {
        var context = this.context, fillPatternImage = shape.getFillPatternImage(), fillPatternX = shape.getFillPatternX(), fillPatternY = shape.getFillPatternY(), fillPatternScale = shape.getFillPatternScale(), fillPatternRotation = shape.getFillPatternRotation(), fillPatternOffset = shape.getFillPatternOffset(), fillPatternRepeat = shape.getFillPatternRepeat();
        if (fillPatternX || fillPatternY) {
            context.translate(fillPatternX || 0, fillPatternY || 0);
        }
        if (fillPatternRotation) {
            context.rotate(fillPatternRotation);
        }
        if (fillPatternScale) {
            context.scale(fillPatternScale.x, fillPatternScale.y);
        }
        if (fillPatternOffset) {
            context.translate(-1 * fillPatternOffset.x, -1 * fillPatternOffset.y);
        }
        context.fillStyle = context.createPattern(fillPatternImage, fillPatternRepeat || "repeat");
        context.fill();
    }, _fillLinearGradient:function (shape) {
        var context = this.context, start = shape.getFillLinearGradientStartPoint(), end = shape.getFillLinearGradientEndPoint(), colorStops = shape.getFillLinearGradientColorStops(), grd = context.createLinearGradient(start.x, start.y, end.x, end.y);
        if (colorStops) {
            for (var n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            context.fillStyle = grd;
            context.fill();
        }
    }, _fillRadialGradient:function (shape) {
        var context = this.context, start = shape.getFillRadialGradientStartPoint(), end = shape.getFillRadialGradientEndPoint(), startRadius = shape.getFillRadialGradientStartRadius(), endRadius = shape.getFillRadialGradientEndRadius(), colorStops = shape.getFillRadialGradientColorStops(), grd = context.createRadialGradient(start.x, start.y, startRadius, end.x, end.y, endRadius);
        for (var n = 0; n < colorStops.length; n += 2) {
            grd.addColorStop(colorStops[n], colorStops[n + 1]);
        }
        context.fillStyle = grd;
        context.fill();
    }, _fill:function (shape, skipShadow) {
        var context = this.context, hasColor = shape.getFill(), hasPattern = shape.getFillPatternImage(), hasLinearGradient = shape.getFillLinearGradientColorStops(), hasRadialGradient = shape.getFillRadialGradientColorStops(), fillPriority = shape.getFillPriority();
        context.save();
        if (!skipShadow && shape.hasShadow()) {
            this._applyShadow(shape);
        }
        if (hasColor && fillPriority === "color") {
            this._fillColor(shape);
        } else {
            if (hasPattern && fillPriority === "pattern") {
                this._fillPattern(shape);
            } else {
                if (hasLinearGradient && fillPriority === "linear-gradient") {
                    this._fillLinearGradient(shape);
                } else {
                    if (hasRadialGradient && fillPriority === "radial-gradient") {
                        this._fillRadialGradient(shape);
                    } else {
                        if (hasColor) {
                            this._fillColor(shape);
                        } else {
                            if (hasPattern) {
                                this._fillPattern(shape);
                            } else {
                                if (hasLinearGradient) {
                                    this._fillLinearGradient(shape);
                                } else {
                                    if (hasRadialGradient) {
                                        this._fillRadialGradient(shape);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        context.restore();
        if (!skipShadow && shape.hasShadow()) {
            this._fill(shape, true);
        }
    }, _stroke:function (shape, skipShadow) {
        var context = this.context, stroke = shape.getStroke(), strokeWidth = shape.getStrokeWidth(), dashArray = shape.getDashArray();
        if (stroke || strokeWidth) {
            context.save();
            if (!shape.getStrokeScaleEnabled()) {
                context.setTransform(1, 0, 0, 1, 0, 0);
            }
            this._applyLineCap(shape);
            if (dashArray && shape.getDashArrayEnabled()) {
                if (context.setLineDash) {
                    context.setLineDash(dashArray);
                } else {
                    if ("mozDash" in context) {
                        context.mozDash = dashArray;
                    } else {
                        if ("webkitLineDash" in context) {
                            context.webkitLineDash = dashArray;
                        }
                    }
                }
            }
            if (!skipShadow && shape.hasShadow()) {
                this._applyShadow(shape);
            }
            context.lineWidth = strokeWidth || 2;
            context.strokeStyle = stroke || "black";
            shape._strokeFunc(context);
            context.restore();
            if (!skipShadow && shape.hasShadow()) {
                this._stroke(shape, true);
            }
        }
    }, _applyShadow:function (shape) {
        var context = this.context;
        if (shape.hasShadow() && shape.getShadowEnabled()) {
            var aa = shape.getAbsoluteOpacity();
            var color = shape.getShadowColor() || "black";
            var blur = shape.getShadowBlur() || 5;
            var offset = shape.getShadowOffset() || {x:0, y:0};
            if (shape.getShadowOpacity()) {
                context.globalAlpha = shape.getShadowOpacity() * aa;
            }
            context.shadowColor = color;
            context.shadowBlur = blur;
            context.shadowOffsetX = offset.x;
            context.shadowOffsetY = offset.y;
        }
    }};
    Kinetic.Util.extend(Kinetic.SceneCanvas, Kinetic.Canvas);
    Kinetic.HitCanvas = function (config) {
        Kinetic.Canvas.call(this, config);
    };
    Kinetic.HitCanvas.prototype = {_fill:function (shape) {
        var context = this.context;
        context.save();
        context.fillStyle = shape.colorKey;
        shape._fillFuncHit(context);
        context.restore();
    }, _stroke:function (shape) {
        var context = this.context, stroke = shape.getStroke(), strokeWidth = shape.getStrokeWidth();
        if (stroke || strokeWidth) {
            this._applyLineCap(shape);
            context.lineWidth = strokeWidth || 2;
            context.strokeStyle = shape.colorKey;
            shape._strokeFuncHit(context);
        }
    }};
    Kinetic.Util.extend(Kinetic.HitCanvas, Kinetic.Canvas);
})();
(function () {
    var ABSOLUTE_OPACITY = "absoluteOpacity", ABSOLUTE_TRANSFORM = "absoluteTransform", ADD = "add", B = "b", BEFORE = "before", BLACK = "black", CHANGE = "Change", CHILDREN = "children", DEG = "Deg", DOT = ".", EMPTY_STRING = "", G = "g", GET = "get", HASH = "#", ID = "id", KINETIC = "kinetic", LISTENING = "listening", MOUSEENTER = "mouseenter", MOUSELEAVE = "mouseleave", NAME = "name", OFF = "off", ON = "on", PRIVATE_GET = "_get", R = "r", RGB = "RGB", SET = "set", SHAPE = "Shape", SPACE = " ", STAGE = "Stage", TRANSFORM = "transform", UPPER_B = "B", UPPER_G = "G", UPPER_HEIGHT = "Height", UPPER_R = "R", UPPER_WIDTH = "Width", UPPER_X = "X", UPPER_Y = "Y", VISIBLE = "visible", X = "x", Y = "y";
    Kinetic.Factory = {addGetterSetter:function (constructor, attr, def) {
        this.addGetter(constructor, attr, def);
        this.addSetter(constructor, attr);
    }, addPointGetterSetter:function (constructor, attr, def) {
        this.addPointGetter(constructor, attr, def);
        this.addPointSetter(constructor, attr);
        this.addGetter(constructor, attr + UPPER_X, def);
        this.addGetter(constructor, attr + UPPER_Y, def);
        this.addSetter(constructor, attr + UPPER_X);
        this.addSetter(constructor, attr + UPPER_Y);
    }, addBoxGetterSetter:function (constructor, attr, def) {
        this.addBoxGetter(constructor, attr, def);
        this.addBoxSetter(constructor, attr);
        this.addGetter(constructor, attr + UPPER_X, def);
        this.addGetter(constructor, attr + UPPER_Y, def);
        this.addGetter(constructor, attr + UPPER_WIDTH, def);
        this.addGetter(constructor, attr + UPPER_HEIGHT, def);
        this.addSetter(constructor, attr + UPPER_X);
        this.addSetter(constructor, attr + UPPER_Y);
        this.addSetter(constructor, attr + UPPER_WIDTH);
        this.addSetter(constructor, attr + UPPER_HEIGHT);
    }, addPointsGetterSetter:function (constructor, attr) {
        this.addPointsGetter(constructor, attr);
        this.addPointsSetter(constructor, attr);
        this.addPointAdder(constructor, attr);
    }, addRotationGetterSetter:function (constructor, attr, def) {
        this.addRotationGetter(constructor, attr, def);
        this.addRotationSetter(constructor, attr);
    }, addColorGetterSetter:function (constructor, attr) {
        this.addGetter(constructor, attr);
        this.addSetter(constructor, attr);
        this.addColorRGBGetter(constructor, attr);
        this.addColorComponentGetter(constructor, attr, R);
        this.addColorComponentGetter(constructor, attr, G);
        this.addColorComponentGetter(constructor, attr, B);
        this.addColorRGBSetter(constructor, attr);
        this.addColorComponentSetter(constructor, attr, R);
        this.addColorComponentSetter(constructor, attr, G);
        this.addColorComponentSetter(constructor, attr, B);
    }, addColorRGBGetter:function (constructor, attr) {
        var method = GET + Kinetic.Util._capitalize(attr) + RGB;
        constructor.prototype[method] = function () {
            return Kinetic.Util.getRGB(this.attrs[attr]);
        };
    }, addColorComponentGetter:function (constructor, attr, c) {
        var prefix = GET + Kinetic.Util._capitalize(attr), method = prefix + Kinetic.Util._capitalize(c);
        constructor.prototype[method] = function () {
            return this[prefix + RGB]()[c];
        };
    }, addPointsGetter:function (constructor, attr) {
        var that = this, method = GET + Kinetic.Util._capitalize(attr);
        constructor.prototype[method] = function () {
            var val = this.attrs[attr];
            return val === undefined ? [] : val;
        };
    }, addGetter:function (constructor, attr, def) {
        var that = this, method = GET + Kinetic.Util._capitalize(attr);
        constructor.prototype[method] = function () {
            var val = this.attrs[attr];
            return val === undefined ? def : val;
        };
    }, addPointGetter:function (constructor, attr) {
        var that = this, baseMethod = GET + Kinetic.Util._capitalize(attr);
        constructor.prototype[baseMethod] = function () {
            var that = this;
            return {x:that[baseMethod + UPPER_X](), y:that[baseMethod + UPPER_Y]()};
        };
    }, addBoxGetter:function (constructor, attr) {
        var that = this, baseMethod = GET + Kinetic.Util._capitalize(attr);
        constructor.prototype[baseMethod] = function () {
            var that = this;
            return {x:that[baseMethod + UPPER_X](), y:that[baseMethod + UPPER_Y](), width:that[baseMethod + UPPER_WIDTH](), height:that[baseMethod + UPPER_HEIGHT]()};
        };
    }, addRotationGetter:function (constructor, attr, def) {
        var that = this, method = GET + Kinetic.Util._capitalize(attr);
        constructor.prototype[method] = function () {
            var val = this.attrs[attr];
            if (val === undefined) {
                val = def;
            }
            return val;
        };
        constructor.prototype[method + DEG] = function () {
            var val = this.attrs[attr];
            if (val === undefined) {
                val = def;
            }
            return Kinetic.Util._radToDeg(val);
        };
    }, addColorRGBSetter:function (constructor, attr) {
        var method = SET + Kinetic.Util._capitalize(attr) + RGB;
        constructor.prototype[method] = function (obj) {
            var r = obj && obj.r !== undefined ? obj.r | 0 : this.getAttr(attr + UPPER_R), g = obj && obj.g !== undefined ? obj.g | 0 : this.getAttr(attr + UPPER_G), b = obj && obj.b !== undefined ? obj.b | 0 : this.getAttr(attr + UPPER_B);
            this._setAttr(attr, HASH + Kinetic.Util._rgbToHex(r, g, b));
        };
    }, addColorComponentSetter:function (constructor, attr, c) {
        var prefix = SET + Kinetic.Util._capitalize(attr), method = prefix + Kinetic.Util._capitalize(c);
        constructor.prototype[method] = function (val) {
            var obj = {};
            obj[c] = val;
            this[prefix + RGB](obj);
        };
    }, addPointsSetter:function (constructor, attr) {
        var method = SET + Kinetic.Util._capitalize(attr);
        constructor.prototype[method] = function (val) {
            var points = Kinetic.Util._getPoints(val);
            this._setAttr("points", points);
        };
    }, addSetter:function (constructor, attr) {
        var method = SET + Kinetic.Util._capitalize(attr);
        constructor.prototype[method] = function (val) {
            this._setAttr(attr, val);
        };
    }, addPointSetter:function (constructor, attr) {
        var that = this, baseMethod = SET + Kinetic.Util._capitalize(attr);
        constructor.prototype[baseMethod] = function () {
            var pos = Kinetic.Util._getXY([].slice.call(arguments)), oldVal = this.attrs[attr], x = 0, y = 0;
            if (pos) {
                x = pos.x;
                y = pos.y;
                this._fireBeforeChangeEvent(attr, oldVal, pos);
                if (x !== undefined) {
                    this[baseMethod + UPPER_X](x);
                }
                if (y !== undefined) {
                    this[baseMethod + UPPER_Y](y);
                }
                this._fireChangeEvent(attr, oldVal, pos);
            }
        };
    }, addBoxSetter:function (constructor, attr) {
        var that = this, baseMethod = SET + Kinetic.Util._capitalize(attr);
        constructor.prototype[baseMethod] = function () {
            var config = [].slice.call(arguments), pos = Kinetic.Util._getXY(config), size = Kinetic.Util._getSize(config), both = Kinetic.Util._merge(pos, size), oldVal = this.attrs[attr], x, y, width, height;
            if (both) {
                x = both.x;
                y = both.y;
                width = both.width;
                height = both.height;
                this._fireBeforeChangeEvent(attr, oldVal, both);
                if (x !== undefined) {
                    this[baseMethod + UPPER_X](x);
                }
                if (y !== undefined) {
                    this[baseMethod + UPPER_Y](y);
                }
                if (width !== undefined) {
                    this[baseMethod + UPPER_WIDTH](width);
                }
                if (height !== undefined) {
                    this[baseMethod + UPPER_HEIGHT](height);
                }
                this._fireChangeEvent(attr, oldVal, both);
            }
        };
    }, addRotationSetter:function (constructor, attr) {
        var that = this, method = SET + Kinetic.Util._capitalize(attr);
        constructor.prototype[method] = function (val) {
            this._setAttr(attr, val);
        };
        constructor.prototype[method + DEG] = function (deg) {
            this._setAttr(attr, Kinetic.Util._degToRad(deg));
        };
    }, addPointAdder:function (constructor, attr) {
        var that = this, baseMethod = ADD + Kinetic.Util._removeLastLetter(Kinetic.Util._capitalize(attr));
        constructor.prototype[baseMethod] = function () {
            var pos = Kinetic.Util._getXY([].slice.call(arguments)), oldVal = this.attrs[attr];
            if (pos) {
                this._fireBeforeChangeEvent(attr, oldVal, pos);
                this.attrs[attr].push(pos);
                this._fireChangeEvent(attr, oldVal, pos);
            }
        };
    }};
})();
(function () {
    var ABSOLUTE_OPACITY = "absoluteOpacity", ABSOLUTE_TRANSFORM = "absoluteTransform", ADD = "add", B = "b", BEFORE = "before", BLACK = "black", CHANGE = "Change", CHILDREN = "children", DEG = "Deg", DOT = ".", EMPTY_STRING = "", G = "g", GET = "get", HASH = "#", ID = "id", KINETIC = "kinetic", LISTENING = "listening", MOUSEENTER = "mouseenter", MOUSELEAVE = "mouseleave", NAME = "name", OFF = "off", ON = "on", PRIVATE_GET = "_get", R = "r", RGB = "RGB", SET = "set", SHAPE = "Shape", SPACE = " ", STAGE = "stage", TRANSFORM = "transform", UPPER_B = "B", UPPER_G = "G", UPPER_HEIGHT = "Height", UPPER_R = "R", UPPER_STAGE = "Stage", UPPER_WIDTH = "Width", UPPER_X = "X", UPPER_Y = "Y", VISIBLE = "visible", X = "x", Y = "y", transformChangeStr = ["xChange.kinetic", "yChange.kinetic", "scaleXChange.kinetic", "scaleYChange.kinetic", "skewXChange.kinetic", "skewYChange.kinetic", "rotationChange.kinetic", "offsetXChange.kinetic", "offsetYChange.kinetic"].join(SPACE);
    Kinetic.Util.addMethods(Kinetic.Node, {_init:function (config) {
        var that = this;
        this._id = Kinetic.Global.idCounter++;
        this.eventListeners = {};
        this.attrs = {};
        this.cache = {};
        this.setAttrs(config);
        this.on(transformChangeStr, function () {
            this._clearCache(TRANSFORM);
            that._clearSelfAndChildrenCache(ABSOLUTE_TRANSFORM);
        });
        this.on("visibleChange.kinetic", function () {
            that._clearSelfAndChildrenCache(VISIBLE);
        });
        this.on("listeningChange.kinetic", function () {
            that._clearSelfAndChildrenCache(LISTENING);
        });
        this.on("opacityChange.kinetic", function () {
            that._clearSelfAndChildrenCache(ABSOLUTE_OPACITY);
        });
    }, clearCache:function () {
        this.cache = {};
    }, _clearCache:function (attr) {
        delete this.cache[attr];
    }, _getCache:function (attr, privateGetter) {
        var cache = this.cache[attr];
        if (cache === undefined) {
            this.cache[attr] = privateGetter.call(this);
        }
        return this.cache[attr];
    }, _clearSelfAndChildrenCache:function (attr) {
        var that = this;
        this._clearCache(attr);
        if (this.children) {
            this.getChildren().each(function (node) {
                node._clearSelfAndChildrenCache(attr);
            });
        }
    }, on:function (evtStr, handler) {
        var events = evtStr.split(SPACE), len = events.length, n, event, parts, baseEvent, name;
        for (n = 0; n < len; n++) {
            event = events[n];
            parts = event.split(DOT);
            baseEvent = parts[0];
            name = parts[1] || EMPTY_STRING;
            if (!this.eventListeners[baseEvent]) {
                this.eventListeners[baseEvent] = [];
            }
            this.eventListeners[baseEvent].push({name:name, handler:handler});
        }
        return this;
    }, off:function (evtStr) {
        var events = evtStr.split(SPACE), len = events.length, n, i, event, parts, baseEvent, name;
        for (n = 0; n < len; n++) {
            event = events[n];
            parts = event.split(DOT);
            baseEvent = parts[0];
            name = parts[1];
            if (baseEvent) {
                if (this.eventListeners[baseEvent]) {
                    this._off(baseEvent, name);
                }
            } else {
                for (t in this.eventListeners) {
                    this._off(t, name);
                }
            }
        }
        return this;
    }, remove:function () {
        var parent = this.getParent();
        if (parent && parent.children) {
            parent.children.splice(this.index, 1);
            parent._setChildrenIndices();
            delete this.parent;
        }
        this._clearSelfAndChildrenCache(STAGE);
        this._clearSelfAndChildrenCache(ABSOLUTE_TRANSFORM);
        this._clearSelfAndChildrenCache(VISIBLE);
        this._clearSelfAndChildrenCache(LISTENING);
        this._clearSelfAndChildrenCache(ABSOLUTE_OPACITY);
        return this;
    }, destroy:function () {
        var go = Kinetic.Global;
        go._removeId(this.getId());
        go._removeName(this.getName(), this._id);
        this.remove();
    }, getAttr:function (attr) {
        var method = GET + Kinetic.Util._capitalize(attr);
        if (Kinetic.Util._isFunction(this[method])) {
            return this[method]();
        } else {
            return this.attrs[attr];
        }
    }, getAncestors:function () {
        var parent = this.getParent(), ancestors = new Kinetic.Collection();
        while (parent) {
            ancestors.push(parent);
            parent = parent.getParent();
        }
        return ancestors;
    }, setAttr:function () {
        var args = Array.prototype.slice.call(arguments), attr = args[0], method = SET + Kinetic.Util._capitalize(attr), func = this[method];
        args.shift();
        if (Kinetic.Util._isFunction(func)) {
            func.apply(this, args);
        } else {
            this.attrs[attr] = args[0];
        }
        return this;
    }, getAttrs:function () {
        return this.attrs || {};
    }, setAttrs:function (config) {
        var key, method;
        if (config) {
            for (key in config) {
                if (key === CHILDREN) {
                } else {
                    method = SET + Kinetic.Util._capitalize(key);
                    if (Kinetic.Util._isFunction(this[method])) {
                        this[method](config[key]);
                    } else {
                        this._setAttr(key, config[key]);
                    }
                }
            }
        }
        return this;
    }, isListening:function () {
        return this._getCache(LISTENING, this._isListening);
    }, _isListening:function () {
        var listening = this.getListening(), parent = this.getParent();
        if (listening && parent && !parent.isListening()) {
            return false;
        }
        return listening;
    }, isVisible:function () {
        return this._getCache(VISIBLE, this._isVisible);
    }, _isVisible:function () {
        var visible = this.getVisible(), parent = this.getParent();
        if (visible && parent && !parent.isVisible()) {
            return false;
        }
        return visible;
    }, show:function () {
        this.setVisible(true);
        return this;
    }, hide:function () {
        this.setVisible(false);
        return this;
    }, getZIndex:function () {
        return this.index || 0;
    }, getAbsoluteZIndex:function () {
        var level = this.getLevel(), that = this, index = 0, nodes, len, n, child;
        function addChildren(children) {
            nodes = [];
            len = children.length;
            for (n = 0; n < len; n++) {
                child = children[n];
                index++;
                if (child.nodeType !== SHAPE) {
                    nodes = nodes.concat(child.getChildren().toArray());
                }
                if (child._id === that._id) {
                    n = len;
                }
            }
            if (nodes.length > 0 && nodes[0].getLevel() <= level) {
                addChildren(nodes);
            }
        }
        if (that.nodeType !== UPPER_STAGE) {
            addChildren(that.getStage().getChildren());
        }
        return index;
    }, getLevel:function () {
        var level = 0, parent = this.parent;
        while (parent) {
            level++;
            parent = parent.parent;
        }
        return level;
    }, setPosition:function () {
        var pos = Kinetic.Util._getXY([].slice.call(arguments));
        this.setX(pos.x);
        this.setY(pos.y);
        return this;
    }, getPosition:function () {
        return {x:this.getX(), y:this.getY()};
    }, getAbsolutePosition:function () {
        var absoluteTransform = this.getAbsoluteTransform(), o = this.getOffset();
        absoluteTransform.translate(o.x, o.y);
        return absoluteTransform.getTranslation();
    }, setAbsolutePosition:function () {
        var pos = Kinetic.Util._getXY([].slice.call(arguments)), trans = this._clearTransform(), it;
        this.attrs.x = trans.x;
        this.attrs.y = trans.y;
        delete trans.x;
        delete trans.y;
        it = this.getAbsoluteTransform();
        it.invert();
        it.translate(pos.x, pos.y);
        pos = {x:this.attrs.x + it.getTranslation().x, y:this.attrs.y + it.getTranslation().y};
        this.setPosition(pos.x, pos.y);
        this._setTransform(trans);
        return this;
    }, _setTransform:function (trans) {
        var key;
        for (key in trans) {
            this.attrs[key] = trans[key];
        }
        this._clearCache(TRANSFORM);
        this._clearSelfAndChildrenCache(ABSOLUTE_TRANSFORM);
    }, _clearTransform:function () {
        var trans = {x:this.getX(), y:this.getY(), rotation:this.getRotation(), scaleX:this.getScaleX(), scaleY:this.getScaleY(), offsetX:this.getOffsetX(), offsetY:this.getOffsetY(), skewX:this.getSkewX(), skewY:this.getSkewY()};
        this.attrs.x = 0;
        this.attrs.y = 0;
        this.attrs.rotation = 0;
        this.attrs.scaleX = 1;
        this.attrs.scaleY = 1;
        this.attrs.offsetX = 0;
        this.attrs.offsetY = 0;
        this.attrs.skewX = 0;
        this.attrs.skewY = 0;
        this._clearCache(TRANSFORM);
        this._clearSelfAndChildrenCache(ABSOLUTE_TRANSFORM);
        return trans;
    }, move:function () {
        var pos = Kinetic.Util._getXY([].slice.call(arguments)), x = this.getX(), y = this.getY();
        if (pos.x !== undefined) {
            x += pos.x;
        }
        if (pos.y !== undefined) {
            y += pos.y;
        }
        this.setPosition(x, y);
        return this;
    }, _eachAncestorReverse:function (func, includeSelf) {
        var family = [], parent = this.getParent(), len, n;
        if (includeSelf) {
            family.unshift(this);
        }
        while (parent) {
            family.unshift(parent);
            parent = parent.parent;
        }
        len = family.length;
        for (n = 0; n < len; n++) {
            func(family[n]);
        }
    }, rotate:function (theta) {
        this.setRotation(this.getRotation() + theta);
        return this;
    }, rotateDeg:function (deg) {
        this.setRotation(this.getRotation() + Kinetic.Util._degToRad(deg));
        return this;
    }, moveToTop:function () {
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.push(this);
        this.parent._setChildrenIndices();
        return true;
    }, moveUp:function () {
        var index = this.index, len = this.parent.getChildren().length;
        if (index < len - 1) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index + 1, 0, this);
            this.parent._setChildrenIndices();
            return true;
        }
        return false;
    }, moveDown:function () {
        var index = this.index;
        if (index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index - 1, 0, this);
            this.parent._setChildrenIndices();
            return true;
        }
        return false;
    }, moveToBottom:function () {
        var index = this.index;
        if (index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.unshift(this);
            this.parent._setChildrenIndices();
            return true;
        }
        return false;
    }, setZIndex:function (zIndex) {
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.splice(zIndex, 0, this);
        this.parent._setChildrenIndices();
        return this;
    }, getAbsoluteOpacity:function () {
        return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
    }, _getAbsoluteOpacity:function () {
        var absOpacity = this.getOpacity();
        if (this.getParent()) {
            absOpacity *= this.getParent().getAbsoluteOpacity();
        }
        return absOpacity;
    }, moveTo:function (newContainer) {
        Kinetic.Node.prototype.remove.call(this);
        newContainer.add(this);
        return this;
    }, toObject:function () {
        var type = Kinetic.Util, obj = {}, attrs = this.getAttrs(), key, val;
        obj.attrs = {};
        for (key in attrs) {
            val = attrs[key];
            if (!type._isFunction(val) && !type._isElement(val) && !(type._isObject(val) && type._hasMethods(val))) {
                obj.attrs[key] = val;
            }
        }
        obj.className = this.getClassName();
        return obj;
    }, toJSON:function () {
        return JSON.stringify(this.toObject());
    }, getParent:function () {
        return this.parent;
    }, getLayer:function () {
        return this.getParent().getLayer();
    }, getStage:function () {
        return this._getCache(STAGE, this._getStage);
    }, _getStage:function () {
        var parent = this.getParent();
        if (parent) {
            return parent.getStage();
        } else {
            return undefined;
        }
    }, fire:function (eventType, evt, bubble) {
        if (bubble) {
            this._fireAndBubble(eventType, evt || {});
        } else {
            this._fire(eventType, evt || {});
        }
        return this;
    }, getAbsoluteTransform:function () {
        return this._getCache(ABSOLUTE_TRANSFORM, this._getAbsoluteTransform);
    }, _getAbsoluteTransform:function () {
        var am = new Kinetic.Transform(), m;
        this._eachAncestorReverse(function (node) {
            m = node.getTransform();
            am.multiply(m);
        }, true);
        return am;
    }, _getTransform:function () {
        var m = new Kinetic.Transform(), x = this.getX(), y = this.getY(), rotation = this.getRotation(), scaleX = this.getScaleX(), scaleY = this.getScaleY(), skewX = this.getSkewX(), skewY = this.getSkewY(), offsetX = this.getOffsetX(), offsetY = this.getOffsetY();
        if (x !== 0 || y !== 0) {
            m.translate(x, y);
        }
        if (rotation !== 0) {
            m.rotate(rotation);
        }
        if (skewX !== 0 || skewY !== 0) {
            m.skew(skewX, skewY);
        }
        if (scaleX !== 1 || scaleY !== 1) {
            m.scale(scaleX, scaleY);
        }
        if (offsetX !== 0 || offsetY !== 0) {
            m.translate(-1 * offsetX, -1 * offsetY);
        }
        return m;
    }, clone:function (obj) {
        var className = this.getClassName(), node = new Kinetic[className](this.attrs), key, allListeners, len, n, listener;
        for (key in this.eventListeners) {
            allListeners = this.eventListeners[key];
            len = allListeners.length;
            for (n = 0; n < len; n++) {
                listener = allListeners[n];
                if (listener.name.indexOf(KINETIC) < 0) {
                    if (!node.eventListeners[key]) {
                        node.eventListeners[key] = [];
                    }
                    node.eventListeners[key].push(listener);
                }
            }
        }
        node.setAttrs(obj);
        return node;
    }, toDataURL:function (config) {
        config = config || {};
        var mimeType = config.mimeType || null, quality = config.quality || null, stage = this.getStage(), x = config.x || 0, y = config.y || 0, canvas = new Kinetic.SceneCanvas({width:config.width || stage.getWidth(), height:config.height || stage.getHeight(), pixelRatio:1}), context = canvas.getContext();
        context.save();
        if (x || y) {
            context.translate(-1 * x, -1 * y);
        }
        this.drawScene(canvas);
        context.restore();
        return canvas.toDataURL(mimeType, quality);
    }, toImage:function (config) {
        Kinetic.Util._getImage(this.toDataURL(config), function (img) {
            config.callback(img);
        });
    }, setSize:function () {
        var size = Kinetic.Util._getSize(Array.prototype.slice.call(arguments));
        this.setWidth(size.width);
        this.setHeight(size.height);
        return this;
    }, getSize:function () {
        return {width:this.getWidth(), height:this.getHeight()};
    }, getWidth:function () {
        return this.attrs.width || 0;
    }, getHeight:function () {
        return this.attrs.height || 0;
    }, getClassName:function () {
        return this.className || this.nodeType;
    }, getType:function () {
        return this.nodeType;
    }, _get:function (selector) {
        return this.nodeType === selector ? [this] : [];
    }, _off:function (type, name) {
        var evtListeners = this.eventListeners[type], i, evtName;
        for (i = 0; i < evtListeners.length; i++) {
            evtName = evtListeners[i].name;
            if ((evtName !== "kinetic" || name === "kinetic") && (!name || evtName === name)) {
                evtListeners.splice(i, 1);
                if (evtListeners.length === 0) {
                    delete this.eventListeners[type];
                    break;
                }
                i--;
            }
        }
    }, _fireBeforeChangeEvent:function (attr, oldVal, newVal) {
        this._fire(BEFORE + Kinetic.Util._capitalize(attr) + CHANGE, {oldVal:oldVal, newVal:newVal});
    }, _fireChangeEvent:function (attr, oldVal, newVal) {
        this._fire(attr + CHANGE, {oldVal:oldVal, newVal:newVal});
    }, setId:function (id) {
        var oldId = this.getId(), go = Kinetic.Global;
        go._removeId(oldId);
        go._addId(this, id);
        this._setAttr(ID, id);
        return this;
    }, setName:function (name) {
        var oldName = this.getName(), go = Kinetic.Global;
        go._removeName(oldName, this._id);
        go._addName(this, name);
        this._setAttr(NAME, name);
        return this;
    }, _setAttr:function (key, val) {
        var oldVal;
        if (val !== undefined) {
            oldVal = this.attrs[key];
            this._fireBeforeChangeEvent(key, oldVal, val);
            this.attrs[key] = val;
            this._fireChangeEvent(key, oldVal, val);
        }
    }, _fireAndBubble:function (eventType, evt, compareShape) {
        var okayToRun = true;
        if (evt && this.nodeType === SHAPE) {
            evt.targetNode = this;
        }
        if (eventType === MOUSEENTER && compareShape && this._id === compareShape._id) {
            okayToRun = false;
        } else {
            if (eventType === MOUSELEAVE && compareShape && this._id === compareShape._id) {
                okayToRun = false;
            }
        }
        if (okayToRun) {
            this._fire(eventType, evt);
            if (evt && !evt.cancelBubble && this.parent) {
                if (compareShape && compareShape.parent) {
                    this._fireAndBubble.call(this.parent, eventType, evt, compareShape.parent);
                } else {
                    this._fireAndBubble.call(this.parent, eventType, evt);
                }
            }
        }
    }, _fire:function (eventType, evt) {
        var events = this.eventListeners[eventType], len, i;
        if (events) {
            len = events.length;
            for (i = 0; i < len; i++) {
                events[i].handler.call(this, evt);
            }
        }
    }, draw:function () {
        this.drawScene();
        this.drawHit();
        return this;
    }, shouldDrawHit:function () {
        return this.isListening() && this.isVisible() && !Kinetic.Global.isDragging();
    }, isDraggable:function () {
        return false;
    }, getTransform:function () {
        return this._getCache(TRANSFORM, this._getTransform);
    }});
    Kinetic.Node.create = function (json, container) {
        return this._createNode(JSON.parse(json), container);
    };
    Kinetic.Node._createNode = function (obj, container) {
        var className = Kinetic.Node.prototype.getClassName.call(obj), children = obj.children, no, len, n;
        if (container) {
            obj.attrs.container = container;
        }
        no = new Kinetic[className](obj.attrs);
        if (children) {
            len = children.length;
            for (n = 0; n < len; n++) {
                no.add(this._createNode(children[n]));
            }
        }
        return no;
    };
    Kinetic.Factory.addGetterSetter(Kinetic.Node, "x", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.Node, "y", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.Node, "opacity", 1);
    Kinetic.Factory.addGetter(Kinetic.Node, "name");
    Kinetic.Factory.addGetter(Kinetic.Node, "id");
    Kinetic.Factory.addRotationGetterSetter(Kinetic.Node, "rotation", 0);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Node, "scale", 1);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Node, "skew", 0);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Node, "offset", 0);
    Kinetic.Factory.addSetter(Kinetic.Node, "width");
    Kinetic.Factory.addSetter(Kinetic.Node, "height");
    Kinetic.Factory.addGetterSetter(Kinetic.Node, "listening", true);
    Kinetic.Factory.addGetterSetter(Kinetic.Node, "visible", true);
    Kinetic.Collection.mapMethods(["on", "off", "remove", "destroy", "show", "hide", "move", "rotate", "moveToTop", "moveUp", "moveDown", "moveToBottom", "moveTo", "fire", "draw"]);
})();
(function () {
    var BATCH_DRAW_STOP_TIME_DIFF = 500;
    Kinetic.Animation = function (func, layers) {
        this.func = func;
        this.setLayers(layers);
        this.id = Kinetic.Animation.animIdCounter++;
        this.frame = {time:0, timeDiff:0, lastTime:new Date().getTime()};
    };
    Kinetic.Animation.prototype = {setLayers:function (layers) {
        var lays = [];
        if (!layers) {
            lays = [];
        } else {
            if (layers.length > 0) {
                lays = layers;
            } else {
                lays = [layers];
            }
        }
        this.layers = lays;
    }, getLayers:function () {
        return this.layers;
    }, addLayer:function (layer) {
        var layers = this.layers, len, n;
        if (layers) {
            len = layers.length;
            for (n = 0; n < len; n++) {
                if (layers[n]._id === layer._id) {
                    return false;
                }
            }
        } else {
            this.layers = [];
        }
        this.layers.push(layer);
        return true;
    }, isRunning:function () {
        var a = Kinetic.Animation, animations = a.animations;
        for (var n = 0; n < animations.length; n++) {
            if (animations[n].id === this.id) {
                return true;
            }
        }
        return false;
    }, start:function () {
        this.stop();
        this.frame.timeDiff = 0;
        this.frame.lastTime = new Date().getTime();
        Kinetic.Animation._addAnimation(this);
    }, stop:function () {
        Kinetic.Animation._removeAnimation(this);
    }, _updateFrameObject:function (time) {
        this.frame.timeDiff = time - this.frame.lastTime;
        this.frame.lastTime = time;
        this.frame.time += this.frame.timeDiff;
        this.frame.frameRate = 1000 / this.frame.timeDiff;
    }};
    Kinetic.Animation.animations = [];
    Kinetic.Animation.animIdCounter = 0;
    Kinetic.Animation.animRunning = false;
    Kinetic.Animation._addAnimation = function (anim) {
        this.animations.push(anim);
        this._handleAnimation();
    };
    Kinetic.Animation._removeAnimation = function (anim) {
        var id = anim.id, animations = this.animations, len = animations.length;
        for (var n = 0; n < len; n++) {
            if (animations[n].id === id) {
                this.animations.splice(n, 1);
                break;
            }
        }
    };
    Kinetic.Animation._runFrames = function () {
        var layerHash = {}, animations = this.animations, anim, layers, func, n, i, layersLen, layer, key;
        for (n = 0; n < animations.length; n++) {
            anim = animations[n];
            layers = anim.layers;
            func = anim.func;
            anim._updateFrameObject(new Date().getTime());
            layersLen = layers.length;
            for (i = 0; i < layersLen; i++) {
                layer = layers[i];
                if (layer._id !== undefined) {
                    layerHash[layer._id] = layer;
                }
            }
            if (func) {
                func.call(anim, anim.frame);
            }
        }
        for (key in layerHash) {
            layerHash[key].draw();
        }
    };
    Kinetic.Animation._animationLoop = function () {
        var that = this;
        if (this.animations.length > 0) {
            this._runFrames();
            Kinetic.Animation.requestAnimFrame(function () {
                that._animationLoop();
            });
        } else {
            this.animRunning = false;
        }
    };
    Kinetic.Animation._handleAnimation = function () {
        var that = this;
        if (!this.animRunning) {
            this.animRunning = true;
            that._animationLoop();
        }
    };
    RAF = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || FRAF;
    })();
    function FRAF(callback) {
        window.setTimeout(callback, 1000 / 60);
    }
    Kinetic.Animation.requestAnimFrame = function (callback) {
        var raf = Kinetic.DD && Kinetic.DD.isDragging ? FRAF : RAF;
        raf(callback);
    };
    var moveTo = Kinetic.Node.prototype.moveTo;
    Kinetic.Node.prototype.moveTo = function (container) {
        moveTo.call(this, container);
    };
    Kinetic.Layer.prototype.batchDraw = function () {
        var that = this;
        if (!this.batchAnim) {
            this.batchAnim = new Kinetic.Animation(function () {
                if (that.lastBatchDrawTime && new Date().getTime() - that.lastBatchDrawTime > BATCH_DRAW_STOP_TIME_DIFF) {
                    that.batchAnim.stop();
                }
            }, this);
        }
        this.lastBatchDrawTime = new Date().getTime();
        if (!this.batchAnim.isRunning()) {
            this.draw();
            this.batchAnim.start();
        }
    };
    Kinetic.Stage.prototype.batchDraw = function () {
        this.getChildren().each(function (layer) {
            layer.batchDraw();
        });
    };
})();
(function () {
    var blacklist = {node:1, duration:1, easing:1, onFinish:1, yoyo:1}, PAUSED = 1, PLAYING = 2, REVERSING = 3, idCounter = 0;
    Kinetic.Tween = function (config) {
        var that = this, node = config.node, nodeId = node._id, duration = config.duration || 1, easing = config.easing || Kinetic.Easings.Linear, yoyo = !!config.yoyo, key, tween, start, tweenId;
        this.node = node;
        this._id = idCounter++;
        this.anim = new Kinetic.Animation(function () {
            that.tween.onEnterFrame();
        }, node.getLayer() || node.getLayers());
        this.tween = new Tween(key, function (i) {
            that._tweenFunc(i);
        }, easing, 0, 1, duration * 1000, yoyo);
        this._addListeners();
        if (!Kinetic.Tween.attrs[nodeId]) {
            Kinetic.Tween.attrs[nodeId] = {};
        }
        if (!Kinetic.Tween.attrs[nodeId][this._id]) {
            Kinetic.Tween.attrs[nodeId][this._id] = {};
        }
        if (!Kinetic.Tween.tweens[nodeId]) {
            Kinetic.Tween.tweens[nodeId] = {};
        }
        for (key in config) {
            if (blacklist[key] === undefined) {
                this._addAttr(key, config[key]);
            }
        }
        this.reset();
        this.onFinish = config.onFinish;
        this.onReset = config.onReset;
    };
    Kinetic.Tween.attrs = {};
    Kinetic.Tween.tweens = {};
    Kinetic.Tween.prototype = {_addAttr:function (key, end) {
        var node = this.node, nodeId = node._id, start, diff, tweenId, n, len, startVal, endVal;
        tweenId = Kinetic.Tween.tweens[nodeId][key];
        if (tweenId) {
            delete Kinetic.Tween.attrs[nodeId][tweenId][key];
        }
        start = node.getAttr(key);
        if (Kinetic.Util._isArray(end)) {
            end = Kinetic.Util._getPoints(end);
            diff = [];
            len = end.length;
            for (n = 0; n < len; n++) {
                startVal = start[n];
                endVal = end[n];
                diff.push({x:endVal.x - startVal.x, y:endVal.y - startVal.y});
            }
        } else {
            diff = end - start;
        }
        Kinetic.Tween.attrs[nodeId][this._id][key] = {start:start, diff:diff};
        Kinetic.Tween.tweens[nodeId][key] = this._id;
    }, _tweenFunc:function (i) {
        var node = this.node, attrs = Kinetic.Tween.attrs[node._id][this._id], key, attr, start, diff, newVal, n, len, startVal, diffVal;
        for (key in attrs) {
            attr = attrs[key];
            start = attr.start;
            diff = attr.diff;
            if (Kinetic.Util._isArray(start)) {
                newVal = [];
                len = start.length;
                for (n = 0; n < len; n++) {
                    startVal = start[n];
                    diffVal = diff[n];
                    newVal.push({x:startVal.x + (diffVal.x * i), y:startVal.y + (diffVal.y * i)});
                }
            } else {
                newVal = start + (diff * i);
            }
            node.setAttr(key, newVal);
        }
    }, _addListeners:function () {
        var that = this;
        this.tween.onPlay = function () {
            that.anim.start();
        };
        this.tween.onReverse = function () {
            that.anim.start();
        };
        this.tween.onPause = function () {
            that.anim.stop();
        };
        this.tween.onFinish = function () {
            if (that.onFinish) {
                that.onFinish();
            }
        };
        this.tween.onReset = function () {
            if (that.onReset) {
                that.onReset();
            }
        };
    }, play:function () {
        this.tween.play();
        return this;
    }, reverse:function () {
        this.tween.reverse();
        return this;
    }, reset:function () {
        var node = this.node;
        this.tween.reset();
        (node.getLayer() || node.getLayers()).draw();
        return this;
    }, seek:function (t) {
        var node = this.node;
        this.tween.seek(t * 1000);
        (node.getLayer() || node.getLayers()).draw();
        return this;
    }, pause:function () {
        this.tween.pause();
        return this;
    }, finish:function () {
        var node = this.node;
        this.tween.finish();
        (node.getLayer() || node.getLayers()).draw();
        return this;
    }, destroy:function () {
        var nodeId = this.node._id, thisId = this._id, attrs = Kinetic.Tween.tweens[nodeId], key;
        this.pause();
        for (key in attrs) {
            delete Kinetic.Tween.tweens[nodeId][key];
        }
        delete Kinetic.Tween.attrs[nodeId][thisId];
    }};
    var Tween = function (prop, propFunc, func, begin, finish, duration, yoyo) {
        this.prop = prop;
        this.propFunc = propFunc;
        this.begin = begin;
        this._pos = begin;
        this.duration = duration;
        this._change = 0;
        this.prevPos = 0;
        this.yoyo = yoyo;
        this._time = 0;
        this._position = 0;
        this._startTime = 0;
        this._finish = 0;
        this.func = func;
        this._change = finish - this.begin;
        this.pause();
    };
    Tween.prototype = {fire:function (str) {
        var handler = this[str];
        if (handler) {
            handler();
        }
    }, setTime:function (t) {
        if (t > this.duration) {
            if (this.yoyo) {
                this._time = this.duration;
                this.reverse();
            } else {
                this.finish();
            }
        } else {
            if (t < 0) {
                if (this.yoyo) {
                    this._time = 0;
                    this.play();
                } else {
                    this.reset();
                }
            } else {
                this._time = t;
                this.update();
            }
        }
    }, getTime:function () {
        return this._time;
    }, setPosition:function (p) {
        this.prevPos = this._pos;
        this.propFunc(p);
        this._pos = p;
    }, getPosition:function (t) {
        if (t === undefined) {
            t = this._time;
        }
        return this.func(t, this.begin, this._change, this.duration);
    }, play:function () {
        this.state = PLAYING;
        this._startTime = this.getTimer() - this._time;
        this.onEnterFrame();
        this.fire("onPlay");
    }, reverse:function () {
        this.state = REVERSING;
        this._time = this.duration - this._time;
        this._startTime = this.getTimer() - this._time;
        this.onEnterFrame();
        this.fire("onReverse");
    }, seek:function (t) {
        this.pause();
        this._time = t;
        this.update();
        this.fire("onSeek");
    }, reset:function () {
        this.pause();
        this._time = 0;
        this.update();
        this.fire("onReset");
    }, finish:function () {
        this.pause();
        this._time = this.duration;
        this.update();
        this.fire("onFinish");
    }, update:function () {
        this.setPosition(this.getPosition(this._time));
    }, onEnterFrame:function () {
        var t = this.getTimer() - this._startTime;
        if (this.state === PLAYING) {
            this.setTime(t);
        } else {
            if (this.state === REVERSING) {
                this.setTime(this.duration - t);
            }
        }
    }, pause:function () {
        this.state = PAUSED;
        this.fire("onPause");
    }, getTimer:function () {
        return new Date().getTime();
    }};
    Kinetic.Easings = {"BackEaseIn":function (t, b, c, d, a, p) {
        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    }, "BackEaseOut":function (t, b, c, d, a, p) {
        var s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    }, "BackEaseInOut":function (t, b, c, d, a, p) {
        var s = 1.70158;
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    }, "ElasticEaseIn":function (t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    }, "ElasticEaseOut":function (t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    }, "ElasticEaseInOut":function (t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d / 2) == 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    }, "BounceEaseOut":function (t, b, c, d) {
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
    }, "BounceEaseIn":function (t, b, c, d) {
        return c - Kinetic.Easings.BounceEaseOut(d - t, 0, c, d) + b;
    }, "BounceEaseInOut":function (t, b, c, d) {
        if (t < d / 2) {
            return Kinetic.Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
        } else {
            return Kinetic.Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    }, "EaseIn":function (t, b, c, d) {
        return c * (t /= d) * t + b;
    }, "EaseOut":function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    }, "EaseInOut":function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }, "StrongEaseIn":function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    }, "StrongEaseOut":function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    }, "StrongEaseInOut":function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    }, "Linear":function (t, b, c, d) {
        return c * t / d + b;
    }};
})();
(function () {
    Kinetic.DD = {anim:new Kinetic.Animation(), isDragging:false, offset:{x:0, y:0}, node:null, _drag:function (evt) {
        var dd = Kinetic.DD, node = dd.node;
        if (node) {
            node._setDragPosition(evt);
            if (!dd.isDragging) {
                dd.isDragging = true;
                node.fire("dragstart", evt, true);
            }
            node.fire("dragmove", evt, true);
        }
    }, _endDragBefore:function (evt) {
        var dd = Kinetic.DD, go = Kinetic.Global, node = dd.node, nodeType, layer;
        if (node) {
            nodeType = node.nodeType, layer = node.getLayer();
            dd.anim.stop();
            if (dd.isDragging) {
                dd.isDragging = false;
                go.listenClickTap = false;
                if (evt) {
                    evt.dragEndNode = node;
                }
            }
            delete dd.node;
            (layer || node).draw();
        }
    }, _endDragAfter:function (evt) {
        evt = evt || {};
        var dragEndNode = evt.dragEndNode;
        if (evt && dragEndNode) {
            dragEndNode.fire("dragend", evt, true);
        }
    }};
    Kinetic.Node.prototype.startDrag = function () {
        var dd = Kinetic.DD, stage = this.getStage(), layer = this.getLayer(), pos = stage.getPointerPosition(), ap = this.getAbsolutePosition();
        if (pos) {
            if (dd.node) {
                dd.node.stopDrag();
            }
            dd.node = this;
            dd.offset.x = pos.x - ap.x;
            dd.offset.y = pos.y - ap.y;
            dd.anim.setLayers(layer || this.getLayers());
            dd.anim.start();
            this._setDragPosition();
        }
    };
    Kinetic.Node.prototype._setDragPosition = function (evt) {
        var dd = Kinetic.DD;
        pos = this.getStage().getPointerPosition(), dbf = this.getDragBoundFunc(), newNodePos = {x:pos.x - dd.offset.x, y:pos.y - dd.offset.y};
        if (dbf !== undefined) {
            newNodePos = dbf.call(this, newNodePos, evt);
        }
        this.setAbsolutePosition(newNodePos);
    };
    Kinetic.Node.prototype.stopDrag = function () {
        var dd = Kinetic.DD, evt = {};
        dd._endDragBefore(evt);
        dd._endDragAfter(evt);
    };
    Kinetic.Node.prototype.setDraggable = function (draggable) {
        this._setAttr("draggable", draggable);
        this._dragChange();
    };
    var origDestroy = Kinetic.Node.prototype.destroy;
    Kinetic.Node.prototype.destroy = function () {
        var dd = Kinetic.DD;
        if (dd.node && dd.node._id === this._id) {
            this.stopDrag();
        }
        origDestroy.call(this);
    };
    Kinetic.Node.prototype.isDragging = function () {
        var dd = Kinetic.DD;
        return dd.node && dd.node._id === this._id && dd.isDragging;
    };
    Kinetic.Node.prototype._listenDrag = function () {
        this._dragCleanup();
        var that = this;
        this.on("mousedown.kinetic touchstart.kinetic", function (evt) {
            if (!Kinetic.DD.node) {
                that.startDrag(evt);
            }
        });
    };
    Kinetic.Node.prototype._dragChange = function () {
        if (this.attrs.draggable) {
            this._listenDrag();
        } else {
            this._dragCleanup();
            var stage = this.getStage();
            var dd = Kinetic.DD;
            if (stage && dd.node && dd.node._id === this._id) {
                dd.node.stopDrag();
            }
        }
    };
    Kinetic.Node.prototype._dragCleanup = function () {
        this.off("mousedown.kinetic");
        this.off("touchstart.kinetic");
    };
    Kinetic.Factory.addGetterSetter(Kinetic.Node, "dragBoundFunc");
    Kinetic.Factory.addGetter(Kinetic.Node, "draggable", false);
    Kinetic.Node.prototype.isDraggable = Kinetic.Node.prototype.getDraggable;
    var html = document.getElementsByTagName("html")[0];
    html.addEventListener("mouseup", Kinetic.DD._endDragBefore, true);
    html.addEventListener("touchend", Kinetic.DD._endDragBefore, true);
    html.addEventListener("mouseup", Kinetic.DD._endDragAfter, false);
    html.addEventListener("touchend", Kinetic.DD._endDragAfter, false);
})();
(function () {
    Kinetic.Util.addMethods(Kinetic.Container, {__init:function (config) {
        this.children = new Kinetic.Collection();
        Kinetic.Node.call(this, config);
    }, getChildren:function () {
        return this.children;
    }, hasChildren:function () {
        return this.getChildren().length > 0;
    }, removeChildren:function () {
        var children = this.children, child;
        while (children.length > 0) {
            child = children[0];
            if (child.hasChildren()) {
                child.removeChildren();
            }
            child.remove();
        }
        return this;
    }, destroyChildren:function () {
        var children = this.children;
        while (children.length > 0) {
            children[0].destroy();
        }
        return this;
    }, add:function (child) {
        var go = Kinetic.Global, children = this.children;
        this._validateAdd(child);
        child.index = children.length;
        child.parent = this;
        children.push(child);
        this._fire("add", {child:child});
        return this;
    }, destroy:function () {
        if (this.hasChildren()) {
            this.destroyChildren();
        }
        Kinetic.Node.prototype.destroy.call(this);
    }, get:function (selector) {
        var retArr = [], selectorArr = selector.replace(/ /g, "").split(","), len = selectorArr.length, n, i, sel, arr, node, children, clen;
        for (n = 0; n < len; n++) {
            sel = selectorArr[n];
            if (sel.charAt(0) === "#") {
                node = this._getNodeById(sel.slice(1));
                if (node) {
                    retArr.push(node);
                }
            } else {
                if (sel.charAt(0) === ".") {
                    arr = this._getNodesByName(sel.slice(1));
                    retArr = retArr.concat(arr);
                } else {
                    children = this.getChildren();
                    clen = children.length;
                    for (i = 0; i < clen; i++) {
                        retArr = retArr.concat(children[i]._get(sel));
                    }
                }
            }
        }
        return Kinetic.Collection.toCollection(retArr);
    }, _getNodeById:function (key) {
        var go = Kinetic.Global, node = go.ids[key];
        if (node !== undefined && this.isAncestorOf(node)) {
            return node;
        }
        return null;
    }, _getNodesByName:function (key) {
        var go = Kinetic.Global, arr = go.names[key] || [];
        return this._getDescendants(arr);
    }, _get:function (selector) {
        var retArr = Kinetic.Node.prototype._get.call(this, selector);
        var children = this.getChildren();
        var len = children.length;
        for (var n = 0; n < len; n++) {
            retArr = retArr.concat(children[n]._get(selector));
        }
        return retArr;
    }, toObject:function () {
        var obj = Kinetic.Node.prototype.toObject.call(this);
        obj.children = [];
        var children = this.getChildren();
        var len = children.length;
        for (var n = 0; n < len; n++) {
            var child = children[n];
            obj.children.push(child.toObject());
        }
        return obj;
    }, _getDescendants:function (arr) {
        var retArr = [];
        var len = arr.length;
        for (var n = 0; n < len; n++) {
            var node = arr[n];
            if (this.isAncestorOf(node)) {
                retArr.push(node);
            }
        }
        return retArr;
    }, isAncestorOf:function (node) {
        var parent = node.getParent();
        while (parent) {
            if (parent._id === this._id) {
                return true;
            }
            parent = parent.getParent();
        }
        return false;
    }, clone:function (obj) {
        var node = Kinetic.Node.prototype.clone.call(this, obj);
        this.getChildren().each(function (no) {
            node.add(no.clone());
        });
        return node;
    }, getAllIntersections:function () {
        var pos = Kinetic.Util._getXY(Array.prototype.slice.call(arguments));
        var arr = [];
        var shapes = this.get("Shape");
        var len = shapes.length;
        for (var n = 0; n < len; n++) {
            var shape = shapes[n];
            if (shape.isVisible() && shape.intersects(pos)) {
                arr.push(shape);
            }
        }
        return arr;
    }, _setChildrenIndices:function () {
        var children = this.children, len = children.length;
        for (var n = 0; n < len; n++) {
            children[n].index = n;
        }
    }, drawScene:function (canvas) {
        var layer = this.getLayer(), clip = this.getClipWidth() && this.getClipHeight(), children, n, len;
        if (!canvas && layer) {
            canvas = layer.getCanvas();
        }
        if (this.isVisible()) {
            if (clip) {
                canvas._clip(this);
            }
            children = this.children;
            len = children.length;
            for (n = 0; n < len; n++) {
                children[n].drawScene(canvas);
            }
            if (clip) {
                canvas.getContext().restore();
            }
        }
        return this;
    }, drawHit:function () {
        var clip = this.getClipWidth() && this.getClipHeight() && this.nodeType !== "Stage", n = 0, len = 0, children = [], hitCanvas;
        if (this.shouldDrawHit()) {
            if (clip) {
                hitCanvas = this.getLayer().hitCanvas;
                hitCanvas._clip(this);
            }
            children = this.children;
            len = children.length;
            for (n = 0; n < len; n++) {
                children[n].drawHit();
            }
            if (clip) {
                hitCanvas.getContext().restore();
            }
        }
        return this;
    }});
    Kinetic.Util.extend(Kinetic.Container, Kinetic.Node);
    Kinetic.Factory.addBoxGetterSetter(Kinetic.Container, "clip");
})();
(function () {
    var HAS_SHADOW = "hasShadow";
    function _fillFunc(context) {
        context.fill();
    }
    function _strokeFunc(context) {
        context.stroke();
    }
    function _fillFuncHit(context) {
        context.fill();
    }
    function _strokeFuncHit(context) {
        context.stroke();
    }
    function _clearHasShadowCache() {
        this._clearCache(HAS_SHADOW);
    }
    Kinetic.Util.addMethods(Kinetic.Shape, {__init:function (config) {
        this.nodeType = "Shape";
        this._fillFunc = _fillFunc;
        this._strokeFunc = _strokeFunc;
        this._fillFuncHit = _fillFuncHit;
        this._strokeFuncHit = _strokeFuncHit;
        var shapes = Kinetic.Global.shapes;
        var key;
        while (true) {
            key = Kinetic.Util.getRandomColor();
            if (key && !(key in shapes)) {
                break;
            }
        }
        this.colorKey = key;
        shapes[key] = this;
        Kinetic.Node.call(this, config);
        this._setDrawFuncs();
        this.on("shadowColorChange.kinetic shadowBlurChange.kinetic shadowOffsetChange.kinetic shadowOpacityChange.kinetic", _clearHasShadowCache);
    }, hasChildren:function () {
        return false;
    }, getChildren:function () {
        return [];
    }, getContext:function () {
        return this.getLayer().getContext();
    }, getCanvas:function () {
        return this.getLayer().getCanvas();
    }, hasShadow:function () {
        return this._getCache(HAS_SHADOW, this._hasShadow);
    }, _hasShadow:function () {
        return (this.getShadowOpacity() !== 0 && !!(this.getShadowColor() || this.getShadowBlur() || this.getShadowOffsetX() || this.getShadowOffsetY()));
    }, hasFill:function () {
        return !!(this.getFill() || this.getFillPatternImage() || this.getFillLinearGradientColorStops() || this.getFillRadialGradientColorStops());
    }, _get:function (selector) {
        return this.className === selector || this.nodeType === selector ? [this] : [];
    }, intersects:function () {
        var pos = Kinetic.Util._getXY(Array.prototype.slice.call(arguments));
        var stage = this.getStage();
        var hitCanvas = stage.hitCanvas;
        hitCanvas.clear();
        this.drawScene(hitCanvas);
        var p = hitCanvas.context.getImageData(pos.x | 0, pos.y | 0, 1, 1).data;
        return p[3] > 0;
    }, enableFill:function () {
        this._setAttr("fillEnabled", true);
        return this;
    }, disableFill:function () {
        this._setAttr("fillEnabled", false);
        return this;
    }, enableStroke:function () {
        this._setAttr("strokeEnabled", true);
        return this;
    }, disableStroke:function () {
        this._setAttr("strokeEnabled", false);
        return this;
    }, enableStrokeScale:function () {
        this._setAttr("strokeScaleEnabled", true);
        return this;
    }, disableStrokeScale:function () {
        this._setAttr("strokeScaleEnabled", false);
        return this;
    }, enableShadow:function () {
        this._setAttr("shadowEnabled", true);
        return this;
    }, disableShadow:function () {
        this._setAttr("shadowEnabled", false);
        return this;
    }, enableDashArray:function () {
        this._setAttr("dashArrayEnabled", true);
        return this;
    }, disableDashArray:function () {
        this._setAttr("dashArrayEnabled", false);
        return this;
    }, destroy:function () {
        Kinetic.Node.prototype.destroy.call(this);
        delete Kinetic.Global.shapes[this.colorKey];
        return this;
    }, drawScene:function (canvas) {
        canvas = canvas || this.getLayer().getCanvas();
        var drawFunc = this.getDrawFunc(), context = canvas.getContext();
        if (drawFunc && this.isVisible()) {
            context.save();
            canvas._applyOpacity(this);
            canvas._applyLineJoin(this);
            canvas._applyAncestorTransforms(this);
            drawFunc.call(this, canvas);
            context.restore();
        }
        return this;
    }, drawHit:function () {
        var attrs = this.getAttrs(), drawFunc = attrs.drawHitFunc || attrs.drawFunc, canvas = this.getLayer().hitCanvas, context = canvas.getContext();
        if (drawFunc && this.shouldDrawHit()) {
            context.save();
            canvas._applyLineJoin(this);
            canvas._applyAncestorTransforms(this);
            drawFunc.call(this, canvas);
            context.restore();
        }
        return this;
    }, _setDrawFuncs:function () {
        if (!this.attrs.drawFunc && this.drawFunc) {
            this.setDrawFunc(this.drawFunc);
        }
        if (!this.attrs.drawHitFunc && this.drawHitFunc) {
            this.setDrawHitFunc(this.drawHitFunc);
        }
    }});
    Kinetic.Util.extend(Kinetic.Shape, Kinetic.Node);
    Kinetic.Factory.addColorGetterSetter(Kinetic.Shape, "stroke");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "lineJoin");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "lineCap");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "strokeWidth");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "drawFunc");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "drawHitFunc");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "dashArray");
    Kinetic.Factory.addColorGetterSetter(Kinetic.Shape, "shadowColor");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "shadowBlur");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "shadowOpacity");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillPatternImage");
    Kinetic.Factory.addColorGetterSetter(Kinetic.Shape, "fill");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillPatternX");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillPatternY");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillLinearGradientColorStops");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillRadialGradientStartRadius");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillRadialGradientEndRadius");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillRadialGradientColorStops");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillPatternRepeat");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillEnabled", true);
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "strokeEnabled", true);
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "shadowEnabled", true);
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "dashArrayEnabled", true);
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "fillPriority", "color");
    Kinetic.Factory.addGetterSetter(Kinetic.Shape, "strokeScaleEnabled", true);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, "fillPatternOffset", 0);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, "fillPatternScale", 1);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, "fillLinearGradientStartPoint", 0);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, "fillLinearGradientEndPoint", 0);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, "fillRadialGradientStartPoint", 0);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, "fillRadialGradientEndPoint", 0);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, "shadowOffset", 0);
    Kinetic.Factory.addRotationGetterSetter(Kinetic.Shape, "fillPatternRotation", 0);
})();
(function () {
    var STAGE = "Stage", STRING = "string", PX = "px", MOUSEOUT = "mouseout", MOUSELEAVE = "mouseleave", MOUSEOVER = "mouseover", MOUSEENTER = "mouseenter", MOUSEMOVE = "mousemove", MOUSEDOWN = "mousedown", MOUSEUP = "mouseup", CLICK = "click", DBL_CLICK = "dblclick", TOUCHSTART = "touchstart", TOUCHEND = "touchend", TAP = "tap", DBL_TAP = "dbltap", TOUCHMOVE = "touchmove", DIV = "div", RELATIVE = "relative", INLINE_BLOCK = "inline-block", KINETICJS_CONTENT = "kineticjs-content", SPACE = " ", UNDERSCORE = "_", CONTAINER = "container", EMPTY_STRING = "", EVENTS = [MOUSEDOWN, MOUSEMOVE, MOUSEUP, MOUSEOUT, TOUCHSTART, TOUCHMOVE, TOUCHEND, MOUSEOVER], eventsLength = EVENTS.length;
    function addEvent(ctx, eventName) {
        ctx.content.addEventListener(eventName, function (evt) {
            ctx[UNDERSCORE + eventName](evt);
        }, false);
    }
    Kinetic.Util.addMethods(Kinetic.Stage, {___init:function (config) {
        Kinetic.Container.call(this, config);
        this.nodeType = STAGE;
        this._id = Kinetic.Global.idCounter++;
        this._buildDOM();
        this._bindContentEvents();
        Kinetic.Global.stages.push(this);
    }, _validateAdd:function (child) {
        if (child.getType() !== "Layer") {
            Kinetic.Util.error("You may only add layers to the stage.");
        }
    }, setContainer:function (container) {
        if (typeof container === STRING) {
            container = document.getElementById(container);
        }
        this._setAttr(CONTAINER, container);
        return this;
    }, draw:function () {
        Kinetic.Node.prototype.draw.call(this);
        return this;
    }, setHeight:function (height) {
        Kinetic.Node.prototype.setHeight.call(this, height);
        this._resizeDOM();
        return this;
    }, setWidth:function (width) {
        Kinetic.Node.prototype.setWidth.call(this, width);
        this._resizeDOM();
        return this;
    }, clear:function () {
        var layers = this.children, len = layers.length, n;
        for (n = 0; n < len; n++) {
            layers[n].clear();
        }
        return this;
    }, destroy:function () {
        var content = this.content;
        Kinetic.Container.prototype.destroy.call(this);
        if (content && Kinetic.Util._isInDocument(content)) {
            this.getContainer().removeChild(content);
        }
    }, getMousePosition:function () {
        return this.mousePos;
    }, getTouchPosition:function () {
        return this.touchPos;
    }, getPointerPosition:function () {
        return this.getTouchPosition() || this.getMousePosition();
    }, getStage:function () {
        return this;
    }, getContent:function () {
        return this.content;
    }, toDataURL:function (config) {
        config = config || {};
        var mimeType = config.mimeType || null, quality = config.quality || null, x = config.x || 0, y = config.y || 0, canvas = new Kinetic.SceneCanvas({width:config.width || this.getWidth(), height:config.height || this.getHeight(), pixelRatio:1}), context = canvas.getContext(), layers = this.children;
        if (x || y) {
            context.translate(-1 * x, -1 * y);
        }
        function drawLayer(n) {
            var layer = layers[n], layerUrl = layer.toDataURL(), imageObj = new Image();
            imageObj.onload = function () {
                context.drawImage(imageObj, 0, 0);
                if (n < layers.length - 1) {
                    drawLayer(n + 1);
                } else {
                    config.callback(canvas.toDataURL(mimeType, quality));
                }
            };
            imageObj.src = layerUrl;
        }
        drawLayer(0);
    }, toImage:function (config) {
        var cb = config.callback;
        config.callback = function (dataUrl) {
            Kinetic.Util._getImage(dataUrl, function (img) {
                cb(img);
            });
        };
        this.toDataURL(config);
    }, getIntersection:function () {
        var pos = Kinetic.Util._getXY(Array.prototype.slice.call(arguments)), layers = this.getChildren(), len = layers.length, end = len - 1, n, obj;
        for (n = end; n >= 0; n--) {
            obj = layers[n].getIntersection(pos);
            if (obj) {
                return obj;
            }
        }
        return null;
    }, _resizeDOM:function () {
        if (this.content) {
            var width = this.getWidth(), height = this.getHeight(), layers = this.getChildren(), len = layers.length, n, layer;
            this.content.style.width = width + PX;
            this.content.style.height = height + PX;
            this.bufferCanvas.setSize(width, height, 1);
            this.hitCanvas.setSize(width, height);
            for (n = 0; n < len; n++) {
                layer = layers[n];
                layer.getCanvas().setSize(width, height);
                layer.hitCanvas.setSize(width, height);
                layer.draw();
            }
        }
    }, add:function (layer) {
        Kinetic.Container.prototype.add.call(this, layer);
        layer.canvas.setSize(this.attrs.width, this.attrs.height);
        layer.hitCanvas.setSize(this.attrs.width, this.attrs.height);
        layer.draw();
        this.content.appendChild(layer.canvas.element);
        return this;
    }, getParent:function () {
        return null;
    }, getLayer:function () {
        return null;
    }, getLayers:function () {
        return this.getChildren();
    }, _setPointerPosition:function (evt) {
        if (!evt) {
            evt = window.event;
        }
        this._setMousePosition(evt);
        this._setTouchPosition(evt);
    }, _bindContentEvents:function () {
        var that = this, n;
        for (n = 0; n < eventsLength; n++) {
            addEvent(this, EVENTS[n]);
        }
    }, _mouseover:function (evt) {
        this._fire(MOUSEOVER, evt);
    }, _mouseout:function (evt) {
        this._setPointerPosition(evt);
        var go = Kinetic.Global, targetShape = this.targetShape;
        if (targetShape && !go.isDragging()) {
            targetShape._fireAndBubble(MOUSEOUT, evt);
            targetShape._fireAndBubble(MOUSELEAVE, evt);
            this.targetShape = null;
        }
        this.mousePos = undefined;
        this._fire(MOUSEOUT, evt);
    }, _mousemove:function (evt) {
        this._setPointerPosition(evt);
        var go = Kinetic.Global, dd = Kinetic.DD, obj = this.getIntersection(this.getPointerPosition()), shape;
        if (obj) {
            shape = obj.shape;
            if (shape) {
                if (!go.isDragging() && obj.pixel[3] === 255 && (!this.targetShape || this.targetShape._id !== shape._id)) {
                    shape._fireAndBubble(MOUSEOVER, evt, this.targetShape);
                    shape._fireAndBubble(MOUSEENTER, evt, this.targetShape);
                    if (this.targetShape) {
                        this.targetShape._fireAndBubble(MOUSEOUT, evt, shape);
                        this.targetShape._fireAndBubble(MOUSELEAVE, evt, shape);
                    }
                    this.targetShape = shape;
                } else {
                    shape._fireAndBubble(MOUSEMOVE, evt);
                }
            }
        } else {
            this._fire(MOUSEMOVE, evt);
            if (this.targetShape && !go.isDragging()) {
                this.targetShape._fireAndBubble(MOUSEOUT, evt);
                this.targetShape._fireAndBubble(MOUSELEAVE, evt);
                this.targetShape = null;
            }
        }
        if (dd) {
            dd._drag(evt);
        }
        if (evt.preventDefault) {
            evt.preventDefault();
        }
    }, _mousedown:function (evt) {
        this._setPointerPosition(evt);
        var go = Kinetic.Global, obj = this.getIntersection(this.getPointerPosition()), shape = obj && obj.shape ? obj.shape : this;
        go.listenClickTap = true;
        this.clickStartShape = shape;
        shape._fireAndBubble(MOUSEDOWN, evt);
        if (evt.preventDefault) {
            evt.preventDefault();
        }
    }, _mouseup:function (evt) {
        this._setPointerPosition(evt);
        var that = this, go = Kinetic.Global, obj = this.getIntersection(this.getPointerPosition()), shape = obj && obj.shape ? obj.shape : this;
        shape._fireAndBubble(MOUSEUP, evt);
        if (go.listenClickTap && shape._id === this.clickStartShape._id) {
            shape._fireAndBubble(CLICK, evt);
            if (go.inDblClickWindow) {
                shape._fireAndBubble(DBL_CLICK, evt);
                go.inDblClickWindow = false;
            } else {
                go.inDblClickWindow = true;
            }
            setTimeout(function () {
                go.inDblClickWindow = false;
            }, go.dblClickWindow);
        }
        go.listenClickTap = false;
        if (evt.preventDefault) {
            evt.preventDefault();
        }
    }, _touchstart:function (evt) {
        this._setPointerPosition(evt);
        var go = Kinetic.Global, obj = this.getIntersection(this.getPointerPosition()), shape = obj && obj.shape ? obj.shape : this;
        go.listenClickTap = true;
        this.tapStartShape = shape;
        shape._fireAndBubble(TOUCHSTART, evt);
        if (shape.isListening() && evt.preventDefault) {
            evt.preventDefault();
        }
    }, _touchend:function (evt) {
        this._setPointerPosition(evt);
        var that = this, go = Kinetic.Global, obj = this.getIntersection(this.getPointerPosition()), shape = obj && obj.shape ? obj.shape : this;
        shape._fireAndBubble(TOUCHEND, evt);
        if (go.listenClickTap && shape._id === this.tapStartShape._id) {
            shape._fireAndBubble(TAP, evt);
            if (go.inDblClickWindow) {
                shape._fireAndBubble(DBL_TAP, evt);
                go.inDblClickWindow = false;
            } else {
                go.inDblClickWindow = true;
            }
            setTimeout(function () {
                go.inDblClickWindow = false;
            }, go.dblClickWindow);
        }
        go.listenClickTap = false;
        if (shape.isListening() && evt.preventDefault) {
            evt.preventDefault();
        }
    }, _touchmove:function (evt) {
        this._setPointerPosition(evt);
        var dd = Kinetic.DD, obj = this.getIntersection(this.getPointerPosition()), shape = obj && obj.shape ? obj.shape : this;
        shape._fireAndBubble(TOUCHMOVE, evt);
        if (dd) {
            dd._drag(evt);
        }
        if (shape.isListening() && evt.preventDefault) {
            evt.preventDefault();
        }
    }, _setMousePosition:function (evt) {
        var mouseX = evt.clientX - this._getContentPosition().left, mouseY = evt.clientY - this._getContentPosition().top;
        this.mousePos = {x:mouseX, y:mouseY};
    }, _setTouchPosition:function (evt) {
        var touch, touchX, touchY;
        if (evt.touches !== undefined && evt.touches.length === 1) {
            touch = evt.touches[0];
            touchX = touch.clientX - this._getContentPosition().left;
            touchY = touch.clientY - this._getContentPosition().top;
            this.touchPos = {x:touchX, y:touchY};
        }
    }, _getContentPosition:function () {
        var rect = this.content.getBoundingClientRect();
        return {top:rect.top, left:rect.left};
    }, _buildDOM:function () {
        var container = this.getContainer();
        container.innerHTML = EMPTY_STRING;
        this.content = document.createElement(DIV);
        this.content.style.position = RELATIVE;
        this.content.style.display = INLINE_BLOCK;
        this.content.className = KINETICJS_CONTENT;
        container.appendChild(this.content);
        this.bufferCanvas = new Kinetic.SceneCanvas();
        this.hitCanvas = new Kinetic.HitCanvas();
        this._resizeDOM();
    }, _onContent:function (typesStr, handler) {
        var types = typesStr.split(SPACE), len = types.length, n, baseEvent;
        for (n = 0; n < len; n++) {
            baseEvent = types[n];
            this.content.addEventListener(baseEvent, handler, false);
        }
    }});
    Kinetic.Util.extend(Kinetic.Stage, Kinetic.Container);
    Kinetic.Factory.addGetter(Kinetic.Stage, "container");
})();
(function () {
    var HASH = "#", BEFORE_DRAW = "beforeDraw", DRAW = "draw";
    Kinetic.Util.addMethods(Kinetic.Layer, {___init:function (config) {
        this.nodeType = "Layer";
        this.canvas = new Kinetic.SceneCanvas();
        this.hitCanvas = new Kinetic.HitCanvas();
        Kinetic.Container.call(this, config);
    }, _validateAdd:function (child) {
        var type = child.getType();
        if (type !== "Group" && type !== "Shape") {
            Kinetic.Util.error("You may only add groups and shapes to a layer.");
        }
    }, getIntersection:function () {
        var pos = Kinetic.Util._getXY(Array.prototype.slice.call(arguments)), p, colorKey, shape;
        if (this.isVisible() && this.isListening()) {
            p = this.hitCanvas.context.getImageData(pos.x | 0, pos.y | 0, 1, 1).data;
            if (p[3] === 255) {
                colorKey = Kinetic.Util._rgbToHex(p[0], p[1], p[2]);
                shape = Kinetic.Global.shapes[HASH + colorKey];
                return {shape:shape, pixel:p};
            } else {
                if (p[0] > 0 || p[1] > 0 || p[2] > 0 || p[3] > 0) {
                    return {pixel:p};
                }
            }
        }
        return null;
    }, drawScene:function (canvas) {
        canvas = canvas || this.getCanvas();
        this._fire(BEFORE_DRAW, {node:this});
        if (this.getClearBeforeDraw()) {
            canvas.clear();
        }
        Kinetic.Container.prototype.drawScene.call(this, canvas);
        this._fire(DRAW, {node:this});
        return this;
    }, drawHit:function () {
        var layer = this.getLayer();
        if (layer && layer.getClearBeforeDraw()) {
            layer.getHitCanvas().clear();
        }
        Kinetic.Container.prototype.drawHit.call(this);
        return this;
    }, getCanvas:function () {
        return this.canvas;
    }, getHitCanvas:function () {
        return this.hitCanvas;
    }, getContext:function () {
        return this.getCanvas().getContext();
    }, clear:function (clip) {
        this.getCanvas().clear(clip);
        return this;
    }, setVisible:function (visible) {
        Kinetic.Node.prototype.setVisible.call(this, visible);
        if (visible) {
            this.getCanvas().element.style.display = "block";
            this.hitCanvas.element.style.display = "block";
        } else {
            this.getCanvas().element.style.display = "none";
            this.hitCanvas.element.style.display = "none";
        }
        return this;
    }, setZIndex:function (index) {
        Kinetic.Node.prototype.setZIndex.call(this, index);
        var stage = this.getStage();
        if (stage) {
            stage.content.removeChild(this.getCanvas().element);
            if (index < stage.getChildren().length - 1) {
                stage.content.insertBefore(this.getCanvas().element, stage.getChildren()[index + 1].getCanvas().element);
            } else {
                stage.content.appendChild(this.getCanvas().element);
            }
        }
        return this;
    }, moveToTop:function () {
        Kinetic.Node.prototype.moveToTop.call(this);
        var stage = this.getStage();
        if (stage) {
            stage.content.removeChild(this.getCanvas().element);
            stage.content.appendChild(this.getCanvas().element);
        }
    }, moveUp:function () {
        if (Kinetic.Node.prototype.moveUp.call(this)) {
            var stage = this.getStage();
            if (stage) {
                stage.content.removeChild(this.getCanvas().element);
                if (this.index < stage.getChildren().length - 1) {
                    stage.content.insertBefore(this.getCanvas().element, stage.getChildren()[this.index + 1].getCanvas().element);
                } else {
                    stage.content.appendChild(this.getCanvas().element);
                }
            }
        }
    }, moveDown:function () {
        if (Kinetic.Node.prototype.moveDown.call(this)) {
            var stage = this.getStage();
            if (stage) {
                var children = stage.getChildren();
                stage.content.removeChild(this.getCanvas().element);
                stage.content.insertBefore(this.getCanvas().element, children[this.index + 1].getCanvas().element);
            }
        }
    }, moveToBottom:function () {
        if (Kinetic.Node.prototype.moveToBottom.call(this)) {
            var stage = this.getStage();
            if (stage) {
                var children = stage.getChildren();
                stage.content.removeChild(this.getCanvas().element);
                stage.content.insertBefore(this.getCanvas().element, children[1].getCanvas().element);
            }
        }
    }, getLayer:function () {
        return this;
    }, remove:function () {
        var stage = this.getStage(), canvas = this.getCanvas(), element = canvas.element;
        Kinetic.Node.prototype.remove.call(this);
        if (stage && canvas && Kinetic.Util._isInDocument(element)) {
            stage.content.removeChild(element);
        }
        return this;
    }, getStage:function () {
        return this.parent;
    }});
    Kinetic.Util.extend(Kinetic.Layer, Kinetic.Container);
    Kinetic.Factory.addGetterSetter(Kinetic.Layer, "clearBeforeDraw", true);
})();
(function () {
    Kinetic.Util.addMethods(Kinetic.Group, {___init:function (config) {
        this.nodeType = "Group";
        Kinetic.Container.call(this, config);
    }, _validateAdd:function (child) {
        var type = child.getType();
        if (type !== "Group" && type !== "Shape") {
            Kinetic.Util.error("You may only add groups and shapes to groups.");
        }
    }, });
    Kinetic.Util.extend(Kinetic.Group, Kinetic.Container);
})();
(function () {
    Kinetic.Rect = function (config) {
        this.___init(config);
    };
    Kinetic.Rect.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = "Rect";
    }, drawFunc:function (canvas) {
        var context = canvas.getContext(), cornerRadius = this.getCornerRadius(), width = this.getWidth(), height = this.getHeight();
        context.beginPath();
        if (!cornerRadius) {
            context.rect(0, 0, width, height);
        } else {
            context.moveTo(cornerRadius, 0);
            context.lineTo(width - cornerRadius, 0);
            context.arc(width - cornerRadius, cornerRadius, cornerRadius, Math.PI * 3 / 2, 0, false);
            context.lineTo(width, height - cornerRadius);
            context.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2, false);
            context.lineTo(cornerRadius, height);
            context.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false);
            context.lineTo(0, cornerRadius);
            context.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, Math.PI * 3 / 2, false);
        }
        context.closePath();
        canvas.fillStroke(this);
    }};
    Kinetic.Util.extend(Kinetic.Rect, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.Rect, "cornerRadius", 0);
})();
(function () {
    var PIx2 = (Math.PI * 2) - 0.0001, CIRCLE = "Circle";
    Kinetic.Circle = function (config) {
        this.___init(config);
    };
    Kinetic.Circle.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = CIRCLE;
    }, drawFunc:function (canvas) {
        var context = canvas.getContext();
        context.beginPath();
        context.arc(0, 0, this.getRadius(), 0, PIx2, false);
        context.closePath();
        canvas.fillStroke(this);
    }, getWidth:function () {
        return this.getRadius() * 2;
    }, getHeight:function () {
        return this.getRadius() * 2;
    }, setWidth:function (width) {
        Kinetic.Node.prototype.setWidth.call(this, width);
        this.setRadius(width / 2);
    }, setHeight:function (height) {
        Kinetic.Node.prototype.setHeight.call(this, height);
        this.setRadius(height / 2);
    }};
    Kinetic.Util.extend(Kinetic.Circle, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.Circle, "radius", 0);
})();
(function () {
    var PIx2 = (Math.PI * 2) - 0.0001, ELLIPSE = "Ellipse";
    Kinetic.Ellipse = function (config) {
        this.___init(config);
    };
    Kinetic.Ellipse.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = ELLIPSE;
    }, drawFunc:function (canvas) {
        var context = canvas.getContext(), r = this.getRadius();
        context.beginPath();
        context.save();
        if (r.x !== r.y) {
            context.scale(1, r.y / r.x);
        }
        context.arc(0, 0, r.x, 0, PIx2, false);
        context.restore();
        context.closePath();
        canvas.fillStroke(this);
    }, getWidth:function () {
        return this.getRadius().x * 2;
    }, getHeight:function () {
        return this.getRadius().y * 2;
    }, setWidth:function (width) {
        Kinetic.Node.prototype.setWidth.call(this, width);
        this.setRadius({x:width / 2});
    }, setHeight:function (height) {
        Kinetic.Node.prototype.setHeight.call(this, height);
        this.setRadius({y:height / 2});
    }};
    Kinetic.Util.extend(Kinetic.Ellipse, Kinetic.Shape);
    Kinetic.Factory.addPointGetterSetter(Kinetic.Ellipse, "radius", 0);
})();
(function () {
    Kinetic.Wedge = function (config) {
        this.___init(config);
    };
    Kinetic.Wedge.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = "Wedge";
    }, drawFunc:function (canvas) {
        var context = canvas.getContext();
        context.beginPath();
        context.arc(0, 0, this.getRadius(), 0, this.getAngle(), this.getClockwise());
        context.lineTo(0, 0);
        context.closePath();
        canvas.fillStroke(this);
    }};
    Kinetic.Util.extend(Kinetic.Wedge, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.Wedge, "radius", 0);
    Kinetic.Factory.addRotationGetterSetter(Kinetic.Wedge, "angle", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.Wedge, "clockwise", false);
})();
(function () {
    var IMAGE = "Image", CROP = "crop", SET = "set";
    Kinetic.Image = function (config) {
        this.___init(config);
    };
    Kinetic.Image.prototype = {___init:function (config) {
        var that = this;
        Kinetic.Shape.call(this, config);
        this.className = IMAGE;
    }, drawFunc:function (canvas) {
        var width = this.getWidth(), height = this.getHeight(), params, that = this, context = canvas.getContext(), cropX = this.getCropX() || 0, cropY = this.getCropY() || 0, cropWidth = this.getCropWidth(), cropHeight = this.getCropHeight(), image;
        if (this.getFilter() && this._applyFilter) {
            this.applyFilter();
            this._applyFilter = false;
        }
        if (this.filterCanvas) {
            image = this.filterCanvas.getElement();
        } else {
            image = this.getImage();
        }
        context.beginPath();
        context.rect(0, 0, width, height);
        context.closePath();
        canvas.fillStroke(this);
        if (image) {
            if (cropWidth && cropHeight) {
                params = [image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height];
            } else {
                params = [image, 0, 0, width, height];
            }
            if (this.hasShadow()) {
                canvas.applyShadow(this, function () {
                    that._drawImage(context, params);
                });
            } else {
                this._drawImage(context, params);
            }
        }
    }, drawHitFunc:function (canvas) {
        var width = this.getWidth(), height = this.getHeight(), imageHitRegion = this.imageHitRegion, context = canvas.getContext();
        if (imageHitRegion) {
            context.drawImage(imageHitRegion, 0, 0, width, height);
            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            canvas.stroke(this);
        } else {
            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            canvas.fillStroke(this);
        }
    }, applyFilter:function () {
        var image = this.getImage(), that = this, width = this.getWidth(), height = this.getHeight(), filter = this.getFilter(), filterCanvas, context, imageData;
        if (this.filterCanvas) {
            filterCanvas = this.filterCanvas;
        } else {
            filterCanvas = this.filterCanvas = new Kinetic.SceneCanvas({width:width, height:height});
        }
        context = filterCanvas.getContext();
        try {
            this._drawImage(context, [image, 0, 0, width, height]);
            imageData = context.getImageData(0, 0, filterCanvas.getWidth(), filterCanvas.getHeight());
            filter.call(this, imageData);
            context.putImageData(imageData, 0, 0);
        }
        catch (e) {
            this.clearFilter();
            Kinetic.Util.warn("Unable to apply filter. " + e.message);
        }
    }, clearFilter:function () {
        this.filterCanvas = null;
        this._applyFilter = false;
    }, createImageHitRegion:function (callback) {
        var that = this, width = this.getWidth(), height = this.getHeight(), canvas = new Kinetic.Canvas({width:width, height:height}), context = canvas.getContext(), image = this.getImage(), imageData, data, rgbColorKey, i, n;
        context.drawImage(image, 0, 0);
        try {
            imageData = context.getImageData(0, 0, width, height);
            data = imageData.data;
            rgbColorKey = Kinetic.Util._hexToRgb(this.colorKey);
            for (i = 0, n = data.length; i < n; i += 4) {
                if (data[i + 3] > 0) {
                    data[i] = rgbColorKey.r;
                    data[i + 1] = rgbColorKey.g;
                    data[i + 2] = rgbColorKey.b;
                }
            }
            Kinetic.Util._getImage(imageData, function (imageObj) {
                that.imageHitRegion = imageObj;
                if (callback) {
                    callback();
                }
            });
        }
        catch (e) {
            Kinetic.Util.warn("Unable to create image hit region. " + e.message);
        }
    }, clearImageHitRegion:function () {
        delete this.imageHitRegion;
    }, getWidth:function () {
        var image = this.getImage();
        return this.attrs.width || (image ? image.width : 0);
    }, getHeight:function () {
        var image = this.getImage();
        return this.attrs.height || (image ? image.height : 0);
    }, _drawImage:function (context, a) {
        if (a.length === 5) {
            context.drawImage(a[0], a[1], a[2], a[3], a[4]);
        } else {
            if (a.length === 9) {
                context.drawImage(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
            }
        }
    }};
    Kinetic.Util.extend(Kinetic.Image, Kinetic.Shape);
    Kinetic.Factory.addFilterGetterSetter = function (constructor, attr, def) {
        this.addGetter(constructor, attr, def);
        this.addFilterSetter(constructor, attr);
    };
    Kinetic.Factory.addFilterSetter = function (constructor, attr) {
        var that = this, method = SET + Kinetic.Util._capitalize(attr);
        constructor.prototype[method] = function (val) {
            this._setAttr(attr, val);
            this._applyFilter = true;
        };
    };
    Kinetic.Factory.addGetterSetter(Kinetic.Image, "image");
    Kinetic.Factory.addBoxGetterSetter(Kinetic.Image, "crop");
    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, "filter");
})();
(function () {
    Kinetic.Polygon = function (config) {
        this.___init(config);
    };
    Kinetic.Polygon.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = "Polygon";
    }, drawFunc:function (canvas) {
        var context = canvas.getContext(), points = this.getPoints(), length = points.length;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (var n = 1; n < length; n++) {
            context.lineTo(points[n].x, points[n].y);
        }
        context.closePath();
        canvas.fillStroke(this);
    }};
    Kinetic.Util.extend(Kinetic.Polygon, Kinetic.Shape);
    Kinetic.Factory.addPointsGetterSetter(Kinetic.Polygon, "points");
})();
(function () {
    var AUTO = "auto", CALIBRI = "Calibri", CANVAS = "canvas", CENTER = "center", CHANGE_KINETIC = "Change.kinetic", CONTEXT_2D = "2d", DASH = "-", EMPTY_STRING = "", LEFT = "left", NEW_LINE = "\n", TEXT = "text", TEXT_UPPER = "Text", TOP = "top", MIDDLE = "middle", NORMAL = "normal", PX_SPACE = "px ", SPACE = " ", RIGHT = "right", WORD = "word", CHAR = "char", NONE = "none", ATTR_CHANGE_LIST = ["fontFamily", "fontSize", "fontStyle", "padding", "align", "lineHeight", "text", "width", "height", "wrap"], attrChangeListLen = ATTR_CHANGE_LIST.length, dummyContext = document.createElement(CANVAS).getContext(CONTEXT_2D);
    Kinetic.Text = function (config) {
        this.___init(config);
    };
    function _fillFunc(context) {
        context.fillText(this.partialText, 0, 0);
    }
    function _strokeFunc(context) {
        context.strokeText(this.partialText, 0, 0);
    }
    Kinetic.Text.prototype = {___init:function (config) {
        var that = this;
        if (config.width === undefined) {
            config.width = AUTO;
        }
        if (config.height === undefined) {
            config.height = AUTO;
        }
        Kinetic.Shape.call(this, config);
        this._fillFunc = _fillFunc;
        this._strokeFunc = _strokeFunc;
        this.className = TEXT_UPPER;
        for (var n = 0; n < attrChangeListLen; n++) {
            this.on(ATTR_CHANGE_LIST[n] + CHANGE_KINETIC, that._setTextData);
        }
        this._setTextData();
    }, drawFunc:function (canvas) {
        var context = canvas.getContext(), p = this.getPadding(), fontStyle = this.getFontStyle(), fontSize = this.getFontSize(), fontFamily = this.getFontFamily(), textHeight = this.getTextHeight(), lineHeightPx = this.getLineHeight() * textHeight, textArr = this.textArr, textArrLen = textArr.length, totalWidth = this.getWidth();
        context.font = this._getContextFont();
        context.textBaseline = MIDDLE;
        context.textAlign = LEFT;
        context.save();
        context.translate(p, 0);
        context.translate(0, p + textHeight / 2);
        for (var n = 0; n < textArrLen; n++) {
            var obj = textArr[n], text = obj.text, width = obj.width;
            context.save();
            if (this.getAlign() === RIGHT) {
                context.translate(totalWidth - width - p * 2, 0);
            } else {
                if (this.getAlign() === CENTER) {
                    context.translate((totalWidth - width - p * 2) / 2, 0);
                }
            }
            this.partialText = text;
            canvas.fillStroke(this);
            context.restore();
            context.translate(0, lineHeightPx);
        }
        context.restore();
    }, drawHitFunc:function (canvas) {
        var context = canvas.getContext(), width = this.getWidth(), height = this.getHeight();
        context.beginPath();
        context.rect(0, 0, width, height);
        context.closePath();
        canvas.fillStroke(this);
    }, setText:function (text) {
        var str = Kinetic.Util._isString(text) ? text : text.toString();
        this._setAttr(TEXT, str);
    }, getWidth:function () {
        return this.attrs.width === AUTO ? this.getTextWidth() + this.getPadding() * 2 : this.attrs.width;
    }, getHeight:function () {
        return this.attrs.height === AUTO ? (this.getTextHeight() * this.textArr.length * this.getLineHeight()) + this.getPadding() * 2 : this.attrs.height;
    }, getTextWidth:function () {
        return this.textWidth;
    }, getTextHeight:function () {
        return this.textHeight;
    }, _getTextSize:function (text) {
        var context = dummyContext, fontSize = this.getFontSize(), metrics;
        context.save();
        context.font = this._getContextFont();
        metrics = context.measureText(text);
        context.restore();
        return {width:metrics.width, height:parseInt(fontSize, 10)};
    }, _getContextFont:function () {
        return this.getFontStyle() + SPACE + this.getFontSize() + PX_SPACE + this.getFontFamily();
    }, _addTextLine:function (line, width, height) {
        return this.textArr.push({text:line, width:width});
    }, _getTextWidth:function (text) {
        return dummyContext.measureText(text).width;
    }, _setTextData:function () {
        var lines = this.getText().split("\n"), fontSize = +this.getFontSize(), textWidth = 0, lineHeightPx = this.getLineHeight() * fontSize, width = this.attrs.width, height = this.attrs.height, fixedWidth = width !== AUTO, fixedHeight = height !== AUTO, padding = this.getPadding(), maxWidth = width - padding * 2, maxHeightPx = height - padding * 2, currentHeightPx = 0, wrap = this.getWrap(), shouldWrap = wrap !== NONE, wrapAtWord = wrap !== CHAR && shouldWrap;
        this.textArr = [];
        dummyContext.save();
        dummyContext.font = this.getFontStyle() + SPACE + fontSize + PX_SPACE + this.getFontFamily();
        for (var i = 0, max = lines.length; i < max; ++i) {
            var line = lines[i], lineWidth = this._getTextWidth(line);
            if (fixedWidth && lineWidth > maxWidth) {
                while (line.length > 0) {
                    var low = 0, high = line.length, match = "", matchWidth = 0;
                    while (low < high) {
                        var mid = (low + high) >>> 1, substr = line.slice(0, mid + 1), substrWidth = this._getTextWidth(substr);
                        if (substrWidth <= maxWidth) {
                            low = mid + 1;
                            match = substr;
                            matchWidth = substrWidth;
                        } else {
                            high = mid;
                        }
                    }
                    if (match) {
                        if (wrapAtWord) {
                            var wrapIndex = Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) + 1;
                            if (wrapIndex > 0) {
                                low = wrapIndex;
                                match = match.slice(0, low);
                                matchWidth = this._getTextWidth(match);
                            }
                        }
                        this._addTextLine(match, matchWidth);
                        currentHeightPx += lineHeightPx;
                        if (!shouldWrap || (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx)) {
                            break;
                        }
                        line = line.slice(low);
                        if (line.length > 0) {
                            lineWidth = this._getTextWidth(line);
                            if (lineWidth <= maxWidth) {
                                this._addTextLine(line, lineWidth);
                                currentHeightPx += lineHeightPx;
                                break;
                            }
                        }
                    } else {
                        break;
                    }
                }
            } else {
                this._addTextLine(line, lineWidth);
                currentHeightPx += lineHeightPx;
                textWidth = Math.max(textWidth, lineWidth);
            }
            if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
                break;
            }
        }
        dummyContext.restore();
        this.textHeight = fontSize;
        this.textWidth = textWidth;
    }};
    Kinetic.Util.extend(Kinetic.Text, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.Text, "fontFamily", CALIBRI);
    Kinetic.Factory.addGetterSetter(Kinetic.Text, "fontSize", 12);
    Kinetic.Factory.addGetterSetter(Kinetic.Text, "fontStyle", NORMAL);
    Kinetic.Factory.addGetterSetter(Kinetic.Text, "padding", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.Text, "align", LEFT);
    Kinetic.Factory.addGetterSetter(Kinetic.Text, "lineHeight", 1);
    Kinetic.Factory.addGetterSetter(Kinetic.Text, "wrap", WORD);
    Kinetic.Factory.addGetter(Kinetic.Text, TEXT, EMPTY_STRING);
    Kinetic.Factory.addSetter(Kinetic.Text, "width");
    Kinetic.Factory.addSetter(Kinetic.Text, "height");
})();
(function () {
    Kinetic.Line = function (config) {
        this.___init(config);
    };
    Kinetic.Line.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = "Line";
    }, drawFunc:function (canvas) {
        var points = this.getPoints(), length = points.length, context = canvas.getContext(), n, point;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (n = 1; n < length; n++) {
            point = points[n];
            context.lineTo(point.x, point.y);
        }
        canvas.stroke(this);
    }};
    Kinetic.Util.extend(Kinetic.Line, Kinetic.Shape);
    Kinetic.Factory.addPointsGetterSetter(Kinetic.Line, "points");
})();
(function () {
    Kinetic.Spline = function (config) {
        this.___init(config);
    };
    Kinetic.Spline.prototype = {___init:function (config) {
        var that = this;
        Kinetic.Shape.call(this, config);
        this.className = "Spline";
        this.on("pointsChange.kinetic tensionChange.kinetic", function () {
            that._setAllPoints();
        });
        this._setAllPoints();
    }, drawFunc:function (canvas) {
        var points = this.getPoints(), length = points.length, context = canvas.getContext(), tension = this.getTension(), ap, len, n, point;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        if (tension !== 0 && length > 2) {
            ap = this.allPoints;
            len = ap.length;
            n = 2;
            context.quadraticCurveTo(ap[0].x, ap[0].y, ap[1].x, ap[1].y);
            while (n < len - 1) {
                context.bezierCurveTo(ap[n].x, ap[n++].y, ap[n].x, ap[n++].y, ap[n].x, ap[n++].y);
            }
            context.quadraticCurveTo(ap[len - 1].x, ap[len - 1].y, points[length - 1].x, points[length - 1].y);
        } else {
            for (n = 1; n < length; n++) {
                point = points[n];
                context.lineTo(point.x, point.y);
            }
        }
        canvas.stroke(this);
    }, _setAllPoints:function () {
        this.allPoints = Kinetic.Util._expandPoints(this.getPoints(), this.getTension());
    }};
    Kinetic.Util.extend(Kinetic.Spline, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.Spline, "tension", 1);
    Kinetic.Factory.addPointsGetterSetter(Kinetic.Spline, "points");
})();
(function () {
    Kinetic.Blob = function (config) {
        this.___init(config);
    };
    Kinetic.Blob.prototype = {___init:function (config) {
        var that = this;
        Kinetic.Shape.call(this, config);
        this.className = "Blob";
        this.on("pointsChange.kinetic tensionChange.kinetic", function () {
            that._setAllPoints();
        });
        this._setAllPoints();
    }, drawFunc:function (canvas) {
        var points = this.getPoints(), length = points.length, context = canvas.getContext(), tension = this.getTension(), ap, len, n, point;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        if (tension !== 0 && length > 2) {
            ap = this.allPoints;
            len = ap.length;
            n = 0;
            while (n < len - 1) {
                context.bezierCurveTo(ap[n].x, ap[n++].y, ap[n].x, ap[n++].y, ap[n].x, ap[n++].y);
            }
        } else {
            for (n = 1; n < length; n++) {
                point = points[n];
                context.lineTo(point.x, point.y);
            }
        }
        context.closePath();
        canvas.fillStroke(this);
    }, _setAllPoints:function () {
        var points = this.getPoints(), length = points.length, tension = this.getTension(), util = Kinetic.Util, firstControlPoints = util._getControlPoints(points[length - 1], points[0], points[1], tension), lastControlPoints = util._getControlPoints(points[length - 2], points[length - 1], points[0], tension);
        this.allPoints = Kinetic.Util._expandPoints(this.getPoints(), this.getTension());
        this.allPoints.unshift(firstControlPoints[1]);
        this.allPoints.push(lastControlPoints[0]);
        this.allPoints.push(points[length - 1]);
        this.allPoints.push(lastControlPoints[1]);
        this.allPoints.push(firstControlPoints[0]);
        this.allPoints.push(points[0]);
    }};
    Kinetic.Util.extend(Kinetic.Blob, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.Blob, "tension", 1);
    Kinetic.Factory.addPointsGetterSetter(Kinetic.Blob, "points");
})();
(function () {
    Kinetic.Sprite = function (config) {
        this.___init(config);
    };
    Kinetic.Sprite.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = "Sprite";
        this.anim = new Kinetic.Animation();
        var that = this;
        this.on("animationChange.kinetic", function () {
            that.setIndex(0);
        });
    }, drawFunc:function (canvas) {
        var anim = this.getAnimation(), index = this.getIndex(), f = this.getAnimations()[anim][index], context = canvas.getContext(), image = this.getImage();
        if (image) {
            context.drawImage(image, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
        }
    }, drawHitFunc:function (canvas) {
        var anim = this.getAnimation(), index = this.getIndex(), f = this.getAnimations()[anim][index], context = canvas.getContext();
        context.beginPath();
        context.rect(0, 0, f.width, f.height);
        context.closePath();
        canvas.fill(this);
    }, start:function () {
        var that = this;
        var layer = this.getLayer();
        this.anim.setLayers(layer);
        this.interval = setInterval(function () {
            var index = that.getIndex();
            that._updateIndex();
            if (that.afterFrameFunc && index === that.afterFrameIndex) {
                that.afterFrameFunc();
                delete that.afterFrameFunc;
                delete that.afterFrameIndex;
            }
        }, 1000 / this.getFrameRate());
        this.anim.start();
    }, stop:function () {
        this.anim.stop();
        clearInterval(this.interval);
    }, afterFrame:function (index, func) {
        this.afterFrameIndex = index;
        this.afterFrameFunc = func;
    }, _updateIndex:function () {
        var index = this.getIndex(), animation = this.getAnimation(), animations = this.getAnimations(), anim = animations[animation], len = anim.length;
        if (index < len - 1) {
            this.setIndex(index + 1);
        } else {
            this.setIndex(0);
        }
    }};
    Kinetic.Util.extend(Kinetic.Sprite, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, "animation");
    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, "animations");
    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, "image");
    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, "index", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, "frameRate", 17);
})();
(function () {
    Kinetic.Path = function (config) {
        this.___init(config);
    };
    Kinetic.Path.prototype = {___init:function (config) {
        this.dataArray = [];
        var that = this;
        Kinetic.Shape.call(this, config);
        this.className = "Path";
        this.dataArray = Kinetic.Path.parsePathData(this.getData());
        this.on("dataChange.kinetic", function () {
            that.dataArray = Kinetic.Path.parsePathData(this.getData());
        });
    }, drawFunc:function (canvas) {
        var ca = this.dataArray, context = canvas.getContext();
        context.beginPath();
        for (var n = 0; n < ca.length; n++) {
            var c = ca[n].command;
            var p = ca[n].points;
            switch (c) {
              case "L":
                context.lineTo(p[0], p[1]);
                break;
              case "M":
                context.moveTo(p[0], p[1]);
                break;
              case "C":
                context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                break;
              case "Q":
                context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                break;
              case "A":
                var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];
                var r = (rx > ry) ? rx : ry;
                var scaleX = (rx > ry) ? 1 : rx / ry;
                var scaleY = (rx > ry) ? ry / rx : 1;
                context.translate(cx, cy);
                context.rotate(psi);
                context.scale(scaleX, scaleY);
                context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                context.scale(1 / scaleX, 1 / scaleY);
                context.rotate(-psi);
                context.translate(-cx, -cy);
                break;
              case "z":
                context.closePath();
                break;
            }
        }
        canvas.fillStroke(this);
    }};
    Kinetic.Util.extend(Kinetic.Path, Kinetic.Shape);
    Kinetic.Path.getLineLength = function (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    };
    Kinetic.Path.getPointOnLine = function (dist, P1x, P1y, P2x, P2y, fromX, fromY) {
        if (fromX === undefined) {
            fromX = P1x;
        }
        if (fromY === undefined) {
            fromY = P1y;
        }
        var m = (P2y - P1y) / ((P2x - P1x) + 1e-8);
        var run = Math.sqrt(dist * dist / (1 + m * m));
        if (P2x < P1x) {
            run *= -1;
        }
        var rise = m * run;
        var pt;
        if ((fromY - P1y) / ((fromX - P1x) + 1e-8) === m) {
            pt = {x:fromX + run, y:fromY + rise};
        } else {
            var ix, iy;
            var len = this.getLineLength(P1x, P1y, P2x, P2y);
            if (len < 1e-8) {
                return undefined;
            }
            var u = (((fromX - P1x) * (P2x - P1x)) + ((fromY - P1y) * (P2y - P1y)));
            u = u / (len * len);
            ix = P1x + u * (P2x - P1x);
            iy = P1y + u * (P2y - P1y);
            var pRise = this.getLineLength(fromX, fromY, ix, iy);
            var pRun = Math.sqrt(dist * dist - pRise * pRise);
            run = Math.sqrt(pRun * pRun / (1 + m * m));
            if (P2x < P1x) {
                run *= -1;
            }
            rise = m * run;
            pt = {x:ix + run, y:iy + rise};
        }
        return pt;
    };
    Kinetic.Path.getPointOnCubicBezier = function (pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
        function CB1(t) {
            return t * t * t;
        }
        function CB2(t) {
            return 3 * t * t * (1 - t);
        }
        function CB3(t) {
            return 3 * t * (1 - t) * (1 - t);
        }
        function CB4(t) {
            return (1 - t) * (1 - t) * (1 - t);
        }
        var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
        var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
        return {x:x, y:y};
    };
    Kinetic.Path.getPointOnQuadraticBezier = function (pct, P1x, P1y, P2x, P2y, P3x, P3y) {
        function QB1(t) {
            return t * t;
        }
        function QB2(t) {
            return 2 * t * (1 - t);
        }
        function QB3(t) {
            return (1 - t) * (1 - t);
        }
        var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
        var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
        return {x:x, y:y};
    };
    Kinetic.Path.getPointOnEllipticalArc = function (cx, cy, rx, ry, theta, psi) {
        var cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
        var pt = {x:rx * Math.cos(theta), y:ry * Math.sin(theta)};
        return {x:cx + (pt.x * cosPsi - pt.y * sinPsi), y:cy + (pt.x * sinPsi + pt.y * cosPsi)};
    };
    Kinetic.Path.parsePathData = function (data) {
        if (!data) {
            return [];
        }
        var cs = data;
        var cc = ["m", "M", "l", "L", "v", "V", "h", "H", "z", "Z", "c", "C", "q", "Q", "t", "T", "s", "S", "a", "A"];
        cs = cs.replace(new RegExp(" ", "g"), ",");
        for (var n = 0; n < cc.length; n++) {
            cs = cs.replace(new RegExp(cc[n], "g"), "|" + cc[n]);
        }
        var arr = cs.split("|");
        var ca = [];
        var cpx = 0;
        var cpy = 0;
        for (n = 1; n < arr.length; n++) {
            var str = arr[n];
            var c = str.charAt(0);
            str = str.slice(1);
            str = str.replace(new RegExp(",-", "g"), "-");
            str = str.replace(new RegExp("-", "g"), ",-");
            str = str.replace(new RegExp("e,-", "g"), "e-");
            var p = str.split(",");
            if (p.length > 0 && p[0] === "") {
                p.shift();
            }
            for (var i = 0; i < p.length; i++) {
                p[i] = parseFloat(p[i]);
            }
            while (p.length > 0) {
                if (isNaN(p[0])) {
                    break;
                }
                var cmd = null;
                var points = [];
                var startX = cpx, startY = cpy;
                var prevCmd, ctlPtx, ctlPty;
                var rx, ry, psi, fa, fs, x1, y1;
                switch (c) {
                  case "l":
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                  case "L":
                    cpx = p.shift();
                    cpy = p.shift();
                    points.push(cpx, cpy);
                    break;
                  case "m":
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "M";
                    points.push(cpx, cpy);
                    c = "l";
                    break;
                  case "M":
                    cpx = p.shift();
                    cpy = p.shift();
                    cmd = "M";
                    points.push(cpx, cpy);
                    c = "L";
                    break;
                  case "h":
                    cpx += p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                  case "H":
                    cpx = p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                  case "v":
                    cpy += p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                  case "V":
                    cpy = p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                  case "C":
                    points.push(p.shift(), p.shift(), p.shift(), p.shift());
                    cpx = p.shift();
                    cpy = p.shift();
                    points.push(cpx, cpy);
                    break;
                  case "c":
                    points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "C";
                    points.push(cpx, cpy);
                    break;
                  case "S":
                    ctlPtx = cpx, ctlPty = cpy;
                    prevCmd = ca[ca.length - 1];
                    if (prevCmd.command === "C") {
                        ctlPtx = cpx + (cpx - prevCmd.points[2]);
                        ctlPty = cpy + (cpy - prevCmd.points[3]);
                    }
                    points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                    cpx = p.shift();
                    cpy = p.shift();
                    cmd = "C";
                    points.push(cpx, cpy);
                    break;
                  case "s":
                    ctlPtx = cpx, ctlPty = cpy;
                    prevCmd = ca[ca.length - 1];
                    if (prevCmd.command === "C") {
                        ctlPtx = cpx + (cpx - prevCmd.points[2]);
                        ctlPty = cpy + (cpy - prevCmd.points[3]);
                    }
                    points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "C";
                    points.push(cpx, cpy);
                    break;
                  case "Q":
                    points.push(p.shift(), p.shift());
                    cpx = p.shift();
                    cpy = p.shift();
                    points.push(cpx, cpy);
                    break;
                  case "q":
                    points.push(cpx + p.shift(), cpy + p.shift());
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "Q";
                    points.push(cpx, cpy);
                    break;
                  case "T":
                    ctlPtx = cpx, ctlPty = cpy;
                    prevCmd = ca[ca.length - 1];
                    if (prevCmd.command === "Q") {
                        ctlPtx = cpx + (cpx - prevCmd.points[0]);
                        ctlPty = cpy + (cpy - prevCmd.points[1]);
                    }
                    cpx = p.shift();
                    cpy = p.shift();
                    cmd = "Q";
                    points.push(ctlPtx, ctlPty, cpx, cpy);
                    break;
                  case "t":
                    ctlPtx = cpx, ctlPty = cpy;
                    prevCmd = ca[ca.length - 1];
                    if (prevCmd.command === "Q") {
                        ctlPtx = cpx + (cpx - prevCmd.points[0]);
                        ctlPty = cpy + (cpy - prevCmd.points[1]);
                    }
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "Q";
                    points.push(ctlPtx, ctlPty, cpx, cpy);
                    break;
                  case "A":
                    rx = p.shift(), ry = p.shift(), psi = p.shift(), fa = p.shift(), fs = p.shift();
                    x1 = cpx, y1 = cpy;
                    cpx = p.shift(), cpy = p.shift();
                    cmd = "A";
                    points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                    break;
                  case "a":
                    rx = p.shift(), ry = p.shift(), psi = p.shift(), fa = p.shift(), fs = p.shift();
                    x1 = cpx, y1 = cpy;
                    cpx += p.shift(), cpy += p.shift();
                    cmd = "A";
                    points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                    break;
                }
                ca.push({command:cmd || c, points:points, start:{x:startX, y:startY}, pathLength:this.calcLength(startX, startY, cmd || c, points)});
            }
            if (c === "z" || c === "Z") {
                ca.push({command:"z", points:[], start:undefined, pathLength:0});
            }
        }
        return ca;
    };
    Kinetic.Path.calcLength = function (x, y, cmd, points) {
        var len, p1, p2;
        var path = Kinetic.Path;
        switch (cmd) {
          case "L":
            return path.getLineLength(x, y, points[0], points[1]);
          case "C":
            len = 0;
            p1 = path.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
            for (t = 0.01; t <= 1; t += 0.01) {
                p2 = path.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                p1 = p2;
            }
            return len;
          case "Q":
            len = 0;
            p1 = path.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
            for (t = 0.01; t <= 1; t += 0.01) {
                p2 = path.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                p1 = p2;
            }
            return len;
          case "A":
            len = 0;
            var start = points[4];
            var dTheta = points[5];
            var end = points[4] + dTheta;
            var inc = Math.PI / 180;
            if (Math.abs(start - end) < inc) {
                inc = Math.abs(start - end);
            }
            p1 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
            if (dTheta < 0) {
                for (t = start - inc; t > end; t -= inc) {
                    p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                    len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
            } else {
                for (t = start + inc; t < end; t += inc) {
                    p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                    len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
            }
            p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
            return len;
        }
        return 0;
    };
    Kinetic.Path.convertEndpointToCenterParameterization = function (x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
        var psi = psiDeg * (Math.PI / 180);
        var xp = Math.cos(psi) * (x1 - x2) / 2 + Math.sin(psi) * (y1 - y2) / 2;
        var yp = -1 * Math.sin(psi) * (x1 - x2) / 2 + Math.cos(psi) * (y1 - y2) / 2;
        var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
        if (lambda > 1) {
            rx *= Math.sqrt(lambda);
            ry *= Math.sqrt(lambda);
        }
        var f = Math.sqrt((((rx * rx) * (ry * ry)) - ((rx * rx) * (yp * yp)) - ((ry * ry) * (xp * xp))) / ((rx * rx) * (yp * yp) + (ry * ry) * (xp * xp)));
        if (fa == fs) {
            f *= -1;
        }
        if (isNaN(f)) {
            f = 0;
        }
        var cxp = f * rx * yp / ry;
        var cyp = f * -ry * xp / rx;
        var cx = (x1 + x2) / 2 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
        var cy = (y1 + y2) / 2 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
        var vMag = function (v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        };
        var vRatio = function (u, v) {
            return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
        };
        var vAngle = function (u, v) {
            return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
        };
        var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
        var u = [(xp - cxp) / rx, (yp - cyp) / ry];
        var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
        var dTheta = vAngle(u, v);
        if (vRatio(u, v) <= -1) {
            dTheta = Math.PI;
        }
        if (vRatio(u, v) >= 1) {
            dTheta = 0;
        }
        if (fs === 0 && dTheta > 0) {
            dTheta = dTheta - 2 * Math.PI;
        }
        if (fs == 1 && dTheta < 0) {
            dTheta = dTheta + 2 * Math.PI;
        }
        return [cx, cy, rx, ry, theta, dTheta, psi, fs];
    };
    Kinetic.Factory.addGetterSetter(Kinetic.Path, "data");
})();
(function () {
    var EMPTY_STRING = "", CALIBRI = "Calibri", NORMAL = "normal";
    Kinetic.TextPath = function (config) {
        this.___init(config);
    };
    function _fillFunc(context) {
        context.fillText(this.partialText, 0, 0);
    }
    function _strokeFunc(context) {
        context.strokeText(this.partialText, 0, 0);
    }
    Kinetic.TextPath.prototype = {___init:function (config) {
        var that = this;
        this.dummyCanvas = document.createElement("canvas");
        this.dataArray = [];
        Kinetic.Shape.call(this, config);
        this._fillFunc = _fillFunc;
        this._strokeFunc = _strokeFunc;
        this.className = "TextPath";
        this.dataArray = Kinetic.Path.parsePathData(this.attrs.data);
        this.on("dataChange.kinetic", function () {
            that.dataArray = Kinetic.Path.parsePathData(this.attrs.data);
        });
        this.on("textChange.kinetic textStroke.kinetic textStrokeWidth.kinetic", that._setTextData);
        that._setTextData();
    }, drawFunc:function (canvas) {
        var charArr = this.charArr, context = canvas.getContext();
        context.font = this._getContextFont();
        context.textBaseline = "middle";
        context.textAlign = "left";
        context.save();
        var glyphInfo = this.glyphInfo;
        for (var i = 0; i < glyphInfo.length; i++) {
            context.save();
            var p0 = glyphInfo[i].p0;
            var p1 = glyphInfo[i].p1;
            var ht = parseFloat(this.attrs.fontSize);
            context.translate(p0.x, p0.y);
            context.rotate(glyphInfo[i].rotation);
            this.partialText = glyphInfo[i].text;
            canvas.fillStroke(this);
            context.restore();
        }
        context.restore();
    }, getTextWidth:function () {
        return this.textWidth;
    }, getTextHeight:function () {
        return this.textHeight;
    }, setText:function (text) {
        Kinetic.Text.prototype.setText.call(this, text);
    }, _getTextSize:function (text) {
        var dummyCanvas = this.dummyCanvas;
        var context = dummyCanvas.getContext("2d");
        context.save();
        context.font = this._getContextFont();
        var metrics = context.measureText(text);
        context.restore();
        return {width:metrics.width, height:parseInt(this.attrs.fontSize, 10)};
    }, _setTextData:function () {
        var that = this;
        var size = this._getTextSize(this.attrs.text);
        this.textWidth = size.width;
        this.textHeight = size.height;
        this.glyphInfo = [];
        var charArr = this.attrs.text.split("");
        var p0, p1, pathCmd;
        var pIndex = -1;
        var currentT = 0;
        var getNextPathSegment = function () {
            currentT = 0;
            var pathData = that.dataArray;
            for (var i = pIndex + 1; i < pathData.length; i++) {
                if (pathData[i].pathLength > 0) {
                    pIndex = i;
                    return pathData[i];
                } else {
                    if (pathData[i].command == "M") {
                        p0 = {x:pathData[i].points[0], y:pathData[i].points[1]};
                    }
                }
            }
            return {};
        };
        var findSegmentToFitCharacter = function (c, before) {
            var glyphWidth = that._getTextSize(c).width;
            var currLen = 0;
            var attempts = 0;
            var needNextSegment = false;
            p1 = undefined;
            while (Math.abs(glyphWidth - currLen) / glyphWidth > 0.01 && attempts < 25) {
                attempts++;
                var cumulativePathLength = currLen;
                while (pathCmd === undefined) {
                    pathCmd = getNextPathSegment();
                    if (pathCmd && cumulativePathLength + pathCmd.pathLength < glyphWidth) {
                        cumulativePathLength += pathCmd.pathLength;
                        pathCmd = undefined;
                    }
                }
                if (pathCmd === {} || p0 === undefined) {
                    return undefined;
                }
                var needNewSegment = false;
                switch (pathCmd.command) {
                  case "L":
                    if (Kinetic.Path.getLineLength(p0.x, p0.y, pathCmd.points[0], pathCmd.points[1]) > glyphWidth) {
                        p1 = Kinetic.Path.getPointOnLine(glyphWidth, p0.x, p0.y, pathCmd.points[0], pathCmd.points[1], p0.x, p0.y);
                    } else {
                        pathCmd = undefined;
                    }
                    break;
                  case "A":
                    var start = pathCmd.points[4];
                    var dTheta = pathCmd.points[5];
                    var end = pathCmd.points[4] + dTheta;
                    if (currentT === 0) {
                        currentT = start + 1e-8;
                    } else {
                        if (glyphWidth > currLen) {
                            currentT += (Math.PI / 180) * dTheta / Math.abs(dTheta);
                        } else {
                            currentT -= Math.PI / 360 * dTheta / Math.abs(dTheta);
                        }
                    }
                    if (Math.abs(currentT) > Math.abs(end)) {
                        currentT = end;
                        needNewSegment = true;
                    }
                    p1 = Kinetic.Path.getPointOnEllipticalArc(pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], currentT, pathCmd.points[6]);
                    break;
                  case "C":
                    if (currentT === 0) {
                        if (glyphWidth > pathCmd.pathLength) {
                            currentT = 1e-8;
                        } else {
                            currentT = glyphWidth / pathCmd.pathLength;
                        }
                    } else {
                        if (glyphWidth > currLen) {
                            currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                        } else {
                            currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                        }
                    }
                    if (currentT > 1) {
                        currentT = 1;
                        needNewSegment = true;
                    }
                    p1 = Kinetic.Path.getPointOnCubicBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], pathCmd.points[4], pathCmd.points[5]);
                    break;
                  case "Q":
                    if (currentT === 0) {
                        currentT = glyphWidth / pathCmd.pathLength;
                    } else {
                        if (glyphWidth > currLen) {
                            currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                        } else {
                            currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                        }
                    }
                    if (currentT > 1) {
                        currentT = 1;
                        needNewSegment = true;
                    }
                    p1 = Kinetic.Path.getPointOnQuadraticBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3]);
                    break;
                }
                if (p1 !== undefined) {
                    currLen = Kinetic.Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
                }
                if (needNewSegment) {
                    needNewSegment = false;
                    pathCmd = undefined;
                }
            }
        };
        for (var i = 0; i < charArr.length; i++) {
            findSegmentToFitCharacter(charArr[i]);
            if (p0 === undefined || p1 === undefined) {
                break;
            }
            var width = Kinetic.Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
            var kern = 0;
            var midpoint = Kinetic.Path.getPointOnLine(kern + width / 2, p0.x, p0.y, p1.x, p1.y);
            var rotation = Math.atan2((p1.y - p0.y), (p1.x - p0.x));
            this.glyphInfo.push({transposeX:midpoint.x, transposeY:midpoint.y, text:charArr[i], rotation:rotation, p0:p0, p1:p1});
            p0 = p1;
        }
    }};
    Kinetic.TextPath.prototype._getContextFont = Kinetic.Text.prototype._getContextFont;
    Kinetic.Util.extend(Kinetic.TextPath, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.TextPath, "fontFamily", CALIBRI);
    Kinetic.Factory.addGetterSetter(Kinetic.TextPath, "fontSize", 12);
    Kinetic.Factory.addGetterSetter(Kinetic.TextPath, "fontStyle", NORMAL);
    Kinetic.Factory.addGetter(Kinetic.TextPath, "text", EMPTY_STRING);
})();
(function () {
    Kinetic.RegularPolygon = function (config) {
        this.___init(config);
    };
    Kinetic.RegularPolygon.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = "RegularPolygon";
    }, drawFunc:function (canvas) {
        var context = canvas.getContext(), sides = this.attrs.sides, radius = this.attrs.radius, n, x, y;
        context.beginPath();
        context.moveTo(0, 0 - radius);
        for (n = 1; n < sides; n++) {
            x = radius * Math.sin(n * 2 * Math.PI / sides);
            y = -1 * radius * Math.cos(n * 2 * Math.PI / sides);
            context.lineTo(x, y);
        }
        context.closePath();
        canvas.fillStroke(this);
    }};
    Kinetic.Util.extend(Kinetic.RegularPolygon, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.RegularPolygon, "radius", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.RegularPolygon, "sides", 0);
})();
(function () {
    Kinetic.Star = function (config) {
        this.___init(config);
    };
    Kinetic.Star.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = "Star";
    }, drawFunc:function (canvas) {
        var context = canvas.getContext(), innerRadius = this.attrs.innerRadius, outerRadius = this.attrs.outerRadius, numPoints = this.attrs.numPoints;
        context.beginPath();
        context.moveTo(0, 0 - this.attrs.outerRadius);
        for (var n = 1; n < numPoints * 2; n++) {
            var radius = n % 2 === 0 ? outerRadius : innerRadius;
            var x = radius * Math.sin(n * Math.PI / numPoints);
            var y = -1 * radius * Math.cos(n * Math.PI / numPoints);
            context.lineTo(x, y);
        }
        context.closePath();
        canvas.fillStroke(this);
    }};
    Kinetic.Util.extend(Kinetic.Star, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.Star, "numPoints", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.Star, "innerRadius", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.Star, "outerRadius", 0);
})();
(function () {
    var ATTR_CHANGE_LIST = ["fontFamily", "fontSize", "fontStyle", "padding", "lineHeight", "text"], CHANGE_KINETIC = "Change.kinetic", NONE = "none", UP = "up", RIGHT = "right", DOWN = "down", LEFT = "left", LABEL = "Label", attrChangeListLen = ATTR_CHANGE_LIST.length;
    Kinetic.Label = function (config) {
        this.____init(config);
    };
    Kinetic.Label.prototype = {____init:function (config) {
        var that = this;
        this.className = LABEL;
        Kinetic.Group.call(this, config);
        this.on("add.kinetic", function (evt) {
            that._addListeners(evt.child);
            that._sync();
        });
    }, getText:function () {
        return this.get("Text")[0];
    }, getTag:function () {
        return this.get("Tag")[0];
    }, _addListeners:function (context) {
        var that = this, n;
        var func = function () {
            that._sync();
        };
        for (n = 0; n < attrChangeListLen; n++) {
            context.on(ATTR_CHANGE_LIST[n] + CHANGE_KINETIC, func);
        }
    }, getWidth:function () {
        return this.getText().getWidth();
    }, getHeight:function () {
        return this.getText().getHeight();
    }, _sync:function () {
        var text = this.getText(), tag = this.getTag(), width, height, pointerDirection, pointerWidth, x, y;
        if (text && tag) {
            width = text.getWidth(), height = text.getHeight(), pointerDirection = tag.getPointerDirection(), pointerWidth = tag.getPointerWidth(), pointerHeight = tag.getPointerHeight(), x = 0, y = 0;
            switch (pointerDirection) {
              case UP:
                x = width / 2;
                y = -1 * pointerHeight;
                break;
              case RIGHT:
                x = width + pointerWidth;
                y = height / 2;
                break;
              case DOWN:
                x = width / 2;
                y = height + pointerHeight;
                break;
              case LEFT:
                x = -1 * pointerWidth;
                y = height / 2;
                break;
            }
            tag.setAttrs({x:-1 * x, y:-1 * y, width:width, height:height});
            text.setAttrs({x:-1 * x, y:-1 * y});
        }
    }};
    Kinetic.Util.extend(Kinetic.Label, Kinetic.Group);
    Kinetic.Tag = function (config) {
        this.___init(config);
    };
    Kinetic.Tag.prototype = {___init:function (config) {
        Kinetic.Shape.call(this, config);
        this.className = "Tag";
    }, drawFunc:function (canvas) {
        var context = canvas.getContext(), width = this.getWidth(), height = this.getHeight(), pointerDirection = this.getPointerDirection(), pointerWidth = this.getPointerWidth(), pointerHeight = this.getPointerHeight(), cornerRadius = this.getCornerRadius();
        context.beginPath();
        context.moveTo(0, 0);
        if (pointerDirection === UP) {
            context.lineTo((width - pointerWidth) / 2, 0);
            context.lineTo(width / 2, -1 * pointerHeight);
            context.lineTo((width + pointerWidth) / 2, 0);
        }
        context.lineTo(width, 0);
        if (pointerDirection === RIGHT) {
            context.lineTo(width, (height - pointerHeight) / 2);
            context.lineTo(width + pointerWidth, height / 2);
            context.lineTo(width, (height + pointerHeight) / 2);
        }
        context.lineTo(width, height);
        if (pointerDirection === DOWN) {
            context.lineTo((width + pointerWidth) / 2, height);
            context.lineTo(width / 2, height + pointerHeight);
            context.lineTo((width - pointerWidth) / 2, height);
        }
        context.lineTo(0, height);
        if (pointerDirection === LEFT) {
            context.lineTo(0, (height + pointerHeight) / 2);
            context.lineTo(-1 * pointerWidth, height / 2);
            context.lineTo(0, (height - pointerHeight) / 2);
        }
        context.closePath();
        canvas.fillStroke(this);
    }};
    Kinetic.Util.extend(Kinetic.Tag, Kinetic.Shape);
    Kinetic.Factory.addGetterSetter(Kinetic.Tag, "pointerDirection", NONE);
    Kinetic.Factory.addGetterSetter(Kinetic.Tag, "pointerWidth", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.Tag, "pointerHeight", 0);
    Kinetic.Factory.addGetterSetter(Kinetic.Tag, "cornerRadius", 0);
})();
(function () {
    Kinetic.Filters.Grayscale = function (imageData) {
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
            data[i] = brightness;
            data[i + 1] = brightness;
            data[i + 2] = brightness;
        }
    };
})();
(function () {
    Kinetic.Filters.Brighten = function (imageData) {
        var brightness = this.getFilterBrightness();
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            data[i] += brightness;
            data[i + 1] += brightness;
            data[i + 2] += brightness;
        }
    };
    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, "filterBrightness", 0);
})();
(function () {
    Kinetic.Filters.Invert = function (imageData) {
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    };
})();
(function () {
    function BlurStack() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
        this.next = null;
    }
    var mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];
    var shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];
    function filterGaussBlurRGBA(imageData, radius) {
        var pixels = imageData.data, width = imageData.width, height = imageData.height;
        var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
        var div = radius + radius + 1, widthMinus1 = width - 1, heightMinus1 = height - 1, radiusPlus1 = radius + 1, sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2, stackStart = new BlurStack(), stackEnd = null, stack = stackStart, stackIn = null, stackOut = null, mul_sum = mul_table[radius], shg_sum = shg_table[radius];
        for (i = 1; i < div; i++) {
            stack = stack.next = new BlurStack();
            if (i == radiusPlus1) {
                stackEnd = stack;
            }
        }
        stack.next = stackStart;
        yw = yi = 0;
        for (y = 0; y < height; y++) {
            r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }
            for (i = 1; i < radiusPlus1; i++) {
                p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
                a_sum += (stack.a = (pa = pixels[p + 3])) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;
                stack = stack.next;
            }
            stackIn = stackStart;
            stackOut = stackEnd;
            for (x = 0; x < width; x++) {
                pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                if (pa !== 0) {
                    pa = 255 / pa;
                    pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
                    pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                    pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                } else {
                    pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                }
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;
                p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
                r_in_sum += (stackIn.r = pixels[p]);
                g_in_sum += (stackIn.g = pixels[p + 1]);
                b_in_sum += (stackIn.b = pixels[p + 2]);
                a_in_sum += (stackIn.a = pixels[p + 3]);
                r_sum += r_in_sum;
                g_sum += g_in_sum;
                b_sum += b_in_sum;
                a_sum += a_in_sum;
                stackIn = stackIn.next;
                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                a_out_sum += (pa = stackOut.a);
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;
                stackOut = stackOut.next;
                yi += 4;
            }
            yw += width;
        }
        for (x = 0; x < width; x++) {
            g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
            yi = x << 2;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }
            yp = width;
            for (i = 1; i <= radius; i++) {
                yi = (yp + x) << 2;
                r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
                a_sum += (stack.a = (pa = pixels[yi + 3])) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;
                stack = stack.next;
                if (i < heightMinus1) {
                    yp += width;
                }
            }
            yi = x;
            stackIn = stackStart;
            stackOut = stackEnd;
            for (y = 0; y < height; y++) {
                p = yi << 2;
                pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                if (pa > 0) {
                    pa = 255 / pa;
                    pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
                    pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                    pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                } else {
                    pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
                }
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;
                p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
                r_sum += (r_in_sum += (stackIn.r = pixels[p]));
                g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
                b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
                a_sum += (a_in_sum += (stackIn.a = pixels[p + 3]));
                stackIn = stackIn.next;
                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                a_out_sum += (pa = stackOut.a);
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;
                stackOut = stackOut.next;
                yi += width;
            }
        }
    }
    Kinetic.Filters.Blur = function (imageData) {
        var radius = this.getFilterRadius() | 0;
        if (radius > 0) {
            filterGaussBlurRGBA(imageData, radius);
        }
    };
    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, "filterRadius", 0);
})();
(function () {
    function pixelAt(idata, x, y) {
        var idx = (y * idata.width + x) * 4;
        var d = [];
        d.push(idata.data[idx++], idata.data[idx++], idata.data[idx++], idata.data[idx++]);
        return d;
    }
    function rgbDistance(p1, p2) {
        return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2) + Math.pow(p1[2] - p2[2], 2));
    }
    function rgbMean(pTab) {
        var m = [0, 0, 0];
        for (var i = 0; i < pTab.length; i++) {
            m[0] += pTab[i][0];
            m[1] += pTab[i][1];
            m[2] += pTab[i][2];
        }
        m[0] /= pTab.length;
        m[1] /= pTab.length;
        m[2] /= pTab.length;
        return m;
    }
    function backgroundMask(idata, threshold) {
        var rgbv_no = pixelAt(idata, 0, 0);
        var rgbv_ne = pixelAt(idata, idata.width - 1, 0);
        var rgbv_so = pixelAt(idata, 0, idata.height - 1);
        var rgbv_se = pixelAt(idata, idata.width - 1, idata.height - 1);
        var thres = threshold || 10;
        if (rgbDistance(rgbv_no, rgbv_ne) < thres && rgbDistance(rgbv_ne, rgbv_se) < thres && rgbDistance(rgbv_se, rgbv_so) < thres && rgbDistance(rgbv_so, rgbv_no) < thres) {
            var mean = rgbMean([rgbv_ne, rgbv_no, rgbv_se, rgbv_so]);
            var mask = [];
            for (var i = 0; i < idata.width * idata.height; i++) {
                var d = rgbDistance(mean, [idata.data[i * 4], idata.data[i * 4 + 1], idata.data[i * 4 + 2]]);
                mask[i] = (d < thres) ? 0 : 255;
            }
            return mask;
        }
    }
    function applyMask(idata, mask) {
        for (var i = 0; i < idata.width * idata.height; i++) {
            idata.data[4 * i + 3] = mask[i];
        }
    }
    function erodeMask(mask, sw, sh) {
        var weights = [1, 1, 1, 1, 0, 1, 1, 1, 1];
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side / 2);
        var maskResult = [];
        for (var y = 0; y < sh; y++) {
            for (var x = 0; x < sw; x++) {
                var so = y * sw + x;
                var a = 0;
                for (var cy = 0; cy < side; cy++) {
                    for (var cx = 0; cx < side; cx++) {
                        var scy = y + cy - halfSide;
                        var scx = x + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = scy * sw + scx;
                            var wt = weights[cy * side + cx];
                            a += mask[srcOff] * wt;
                        }
                    }
                }
                maskResult[so] = (a === 255 * 8) ? 255 : 0;
            }
        }
        return maskResult;
    }
    function dilateMask(mask, sw, sh) {
        var weights = [1, 1, 1, 1, 1, 1, 1, 1, 1];
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side / 2);
        var maskResult = [];
        for (var y = 0; y < sh; y++) {
            for (var x = 0; x < sw; x++) {
                var so = y * sw + x;
                var a = 0;
                for (var cy = 0; cy < side; cy++) {
                    for (var cx = 0; cx < side; cx++) {
                        var scy = y + cy - halfSide;
                        var scx = x + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = scy * sw + scx;
                            var wt = weights[cy * side + cx];
                            a += mask[srcOff] * wt;
                        }
                    }
                }
                maskResult[so] = (a >= 255 * 4) ? 255 : 0;
            }
        }
        return maskResult;
    }
    function smoothEdgeMask(mask, sw, sh) {
        var weights = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side / 2);
        var maskResult = [];
        for (var y = 0; y < sh; y++) {
            for (var x = 0; x < sw; x++) {
                var so = y * sw + x;
                var a = 0;
                for (var cy = 0; cy < side; cy++) {
                    for (var cx = 0; cx < side; cx++) {
                        var scy = y + cy - halfSide;
                        var scx = x + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = scy * sw + scx;
                            var wt = weights[cy * side + cx];
                            a += mask[srcOff] * wt;
                        }
                    }
                }
                maskResult[so] = a;
            }
        }
        return maskResult;
    }
    Kinetic.Filters.Mask = function (idata) {
        var threshold = this.getFilterThreshold(), mask = backgroundMask(idata, threshold);
        if (mask) {
            mask = erodeMask(mask, idata.width, idata.height);
            mask = dilateMask(mask, idata.width, idata.height);
            mask = smoothEdgeMask(mask, idata.width, idata.height);
            applyMask(idata, mask);
        }
        return idata;
    };
    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, "filterThreshold", 0);
})();
(function () {
    var rgb_to_hsl = function (r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b), chroma = max - min, luminance = chroma / 2, saturation = chroma / (1 - Math.abs(2 * luminance - 1)), hue = 0;
        if (max == r) {
            hue = ((g - b) / chroma) % 6;
        } else {
            if (max == g) {
                hue = (b - r) / chroma + 2;
            } else {
                if (max == b) {
                    hue = (r - g) / chroma + 4;
                }
            }
        }
        return [(hue * 60 + 360) % 360, saturation, luminance];
    };
    var pixelShiftHue = function (r, g, b, deg) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b), chroma = max - min, luminance = chroma / 2, saturation = chroma / (1 - Math.abs(2 * luminance - 1)), hue = 0;
        if (max == r) {
            hue = ((g - b) / chroma) % 6;
        } else {
            if (max == g) {
                hue = (b - r) / chroma + 2;
            } else {
                if (max == b) {
                    hue = (r - g) / chroma + 4;
                }
            }
        }
        hue *= 60;
        hue %= 360;
        hue += deg;
        hue %= 360;
        hue /= 60;
        var rR = 0, rG = 0, rB = 0, tmp = chroma * (1 - Math.abs(hue % 2 - 1)), m = luminance - chroma / 2;
        if (0 <= hue && hue < 1) {
            rR = chroma;
            rG = tmp;
        } else {
            if (1 <= hue && hue < 2) {
                rG = chroma;
                rR = tmp;
            } else {
                if (2 <= hue && hue < 3) {
                    rG = chroma;
                    rB = tmp;
                } else {
                    if (3 <= hue && hue < 4) {
                        rB = chroma;
                        rG = tmp;
                    } else {
                        if (4 <= hue && hue < 5) {
                            rB = chroma;
                            rR = tmp;
                        } else {
                            if (5 <= hue && hue < 6) {
                                rR = chroma;
                                rB = tmp;
                            }
                        }
                    }
                }
            }
        }
        rR += m;
        rG += m;
        rB += m;
        rR = (255 * rR);
        rG = (255 * rG);
        rB = (255 * rB);
        return [rR, rG, rB];
    };
    var shift_hue = function (imageData, deg) {
        var data = imageData.data, pixel;
        for (var i = 0; i < data.length; i += 4) {
            pixel = pixelShiftHue(data[i + 0], data[i + 1], data[i + 2], deg);
            data[i + 0] = pixel[0];
            data[i + 1] = pixel[1];
            data[i + 2] = pixel[2];
        }
    };
    Kinetic.Filters.ShiftHue = function (imageData) {
        shift_hue(imageData, this.getFilterHueShiftDeg() % 360);
    };
    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, "filterHueShiftDeg", 0);
    Kinetic.Filters.Colorize = function (imageData) {
        var data = imageData.data;
        var color = this.getFilterColorizeColor(), hsl = rgb_to_hsl(color[0], color[1], color[2]), hue = hsl[0];
        for (var i = 0; i < data.length; i += 4) {
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
        shift_hue(imageData, hue);
    };
    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, "filterColorizeColor", [255, 0, 0]);
})();
(function () {
    var convolve_internal = function (imageData, matrix) {
        var pixels = imageData.data, imageSizeX = imageData.width, imageSizeY = imageData.height, nPixels = imageSizeX * imageSizeY, pixel;
        var result = [];
        result.length = imageSizeX * imageSizeY * 4;
        var matrixSizeX = matrix.length, matrixSizeY = matrix[0].length, matrixMidX = Math.floor(matrix.length / 2), matrixMidY = Math.floor(matrix[0].length / 2);
        var r, g, b, a, x, y, px, py, pos, i, j;
        for (y = 0; y < imageSizeY; y += 1) {
            for (x = 0; x < imageSizeX; x += 1) {
                r = 0;
                g = 0;
                b = 0;
                a = 0;
                for (i = 0; i < matrixSizeX; i += 1) {
                    for (j = 0; j < matrixSizeY; j += 1) {
                        px = (x + i - matrixMidX) % imageSizeX;
                        px = (px > 0) ? px : -px;
                        py = (y + i - matrixMidY) % imageSizeY;
                        py = (py > 0) ? py : -py;
                        pos = (py * imageSizeX + px) * 4;
                        r += matrix[j][i] * pixels[pos + 0];
                        g += matrix[j][i] * pixels[pos + 1];
                        b += matrix[j][i] * pixels[pos + 2];
                    }
                }
                pos = (y * imageSizeX + x) * 4;
                result[pos + 0] = r;
                result[pos + 1] = g;
                result[pos + 2] = b;
            }
        }
        var lastPos = nPixels * 4;
        for (pos = 0; pos < lastPos; pos += 4) {
            pixels[pos + 0] = result[pos + 0];
            pixels[pos + 1] = result[pos + 1];
            pixels[pos + 2] = result[pos + 2];
        }
    };
    var gaussian = function (x, mean, sigma) {
        var dx = x - mean;
        return Math.pow(Math.E, -dx * dx / (2 * sigma * sigma));
    };
    var make_blur_kernel = function (size, scale, sigma) {
        if (size % 2 === 0) {
            size += 1;
        }
        var kernel = [], i, j, row;
        for (i = 0; i < size; i += 1) {
            row = [];
            for (j = 0; j < size; j += 1) {
                row.push(scale * gaussian(i, size / 2, sigma) * gaussian(j, size / 2, sigma));
            }
            kernel.push(row);
        }
        return kernel;
    };
    var make_edge_detect_kernel = function (size, scale, sigma) {
        if (size % 2 === 0) {
            size += 1;
        }
        var kernel = [], i, j, row, g;
        for (i = 0; i < size; i += 1) {
            row = [];
            for (j = 0; j < size; j += 1) {
                g1 = gaussian(i, size / 2, sigma) * gaussian(j, size / 2, sigma);
                g2 = gaussian(i, size / 2, sigma * 1.6) * gaussian(j, size / 2, sigma * 1.6);
                row.push(scale * (g2 - g1));
            }
            kernel.push(row);
        }
        return kernel;
    };
    var make_soft_blur_kernel = function (size, percent) {
        var kernel = make_blur_kernel(size, percent, 1), mid = Math.floor(size / 2);
        kernel[mid][mid] += 1 - percent;
        return kernel;
    };
    var make_unsharp_kernel = function (size, percent) {
        var kernel = make_blur_kernel(size, -percent, 1), mid = Math.floor(size / 2);
        kernel[mid][mid] += 1 + percent;
        return kernel;
    };
    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, "filterAmount", 50);
    Kinetic.Filters.UnsharpMask = function (imageData) {
        convolve_internal(imageData, make_unsharp_kernel(5, this.getFilterAmount() / 100));
    };
    Kinetic.Filters.SoftBlur = function (imageData) {
        convolve_internal(imageData, make_soft_blur_kernel(5, this.getFilterAmount() / 100));
    };
    Kinetic.Filters.Edge = function (imageData) {
        var s = this.getFilterAmount() / 100;
        if (s === 0) {
            return;
        }
        convolve_internal(imageData, [[0, -1 * s, 0], [-1 * s, (1 - s) + 4 * s, -1 * s], [0, -1 * s, 0]]);
    };
    Kinetic.Filters.Emboss = function (imageData) {
        var s = this.getFilterAmount() / 100;
        if (s === 0) {
            return;
        }
        convolve_internal(imageData, [[-1 * s, -0.5 * s, 0], [-0.5 * s, 1 + 0.5 * s, 0.5 * s], [0, 0.5 * s, 1 * s]]);
    };
})();

