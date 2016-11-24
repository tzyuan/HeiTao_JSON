


(function () {
    var LATLONRG = /(\d+(?:\.\d+)?)[\xb0\s]?\s*(?:(\d+(?:\.\d+)?)['\u2019\u2032\s])?\s*(?:(\d+(?:\.\d+)?)["\u201d\u2033\s])?\s*([SNEW])?/i;
    dorado.widget.map.DefaultElementRenderer = $class({$className:"dorado.widget.map.DefaultElementRenderer", render:function (map, element) {
        var paper = map._paper, path = paper.path(element.path);
        path.attr({fill:map._fill, stroke:map._stroke, "stroke-width":"1", "stroke-opacity":"1"});
        return path;
    }});
    dorado.widget.map.DefaultTextRenderer = $class({$className:"dorado.widget.map.DefaultTextRenderer", render:function (map, text) {
        var paper = map._paper;
        var textEl = paper.text(text.x + 20, text.y, text.content);
        return textEl;
    }});
    dorado.widget.Map = $extend(dorado.widget.Raphael, {$className:"dorado.widget.Map", _inherentClassName:"i-map", ATTRIBUTES:{className:{defaultValue:"d-map"}, scalable:{defaultValue:true}, showTexts:{defaultValue:true}, subMap:{componentReference:true, setter:function (subMap) {
        this._subMap = subMap;
        if (subMap) {
            subMap._parent = this;
        }
    }}, view:{setter:function (view) {
        $invokeSuper.call(this, [view]);
        view && this._subMap && this._subMap.set("view", view);
    }}, data:{defaultValue:dorado.widget.map.China, setter:function (value) {
        this._data = (typeof value == "string") ? eval(value) : value;
        var paper = this._paper, data = this._data;
        if (paper && data.canvasWidth && data.canvasHeight) {
            paper.setViewBox(0, 0, data.canvasWidth, data.canvasHeight);
        }
    }}, stroke:{defaultValue:"#fff"}, fill:{defaultValue:"#96Cee6", setter:function (value) {
        this._fill = value;
    }}, elementRenderer:{setter:function (value) {
        if (typeof value == "string") {
            value = eval("new " + value + "()");
        }
        this._elementRenderer = value;
    }}, textRenderer:{setter:function (value) {
        if (typeof value == "string") {
            value = eval("new " + value + "()");
        }
        this._textRenderer = value;
    }}}, EVENTS:{onRenderElement:{}, onRenderText:{}, onElementMouseOver:{}, onElementMouseOut:{}, onElementClick:{}, onElementDoubleClick:{}, beforeRefreshPaper:{}, onRefreshPaper:{}}, createDom:function (dom) {
        dom = dom || document.createElement("DIV");
        var paper = this._paper = new Raphael(dom), data = this._data;
        if (data && data.canvasWidth && data.canvasHeight) {
            paper.setViewBox(0, 0, data.canvasWidth, data.canvasHeight);
        }
        return dom;
    }, browserScalable:function () {
        if (!dorado.Browser.msie) {
            return true;
        }
        if (dorado.Browser.msie && dorado.Browser.version < 9) {
            return false;
        }
        return true;
    }, onAttachToDocument:function () {
        $invokeSuper.call(this, arguments);
        var dom = this._dom, map = this, doms = {};
        $DomUtils.xCreate({tagName:"div", className:"mapControls", contextKey:"mapControl", content:[{tagName:"div", className:"in", contextKey:"zoomInDom"}, {tagName:"div", className:"out", contextKey:"zoomOutDom"}]}, null, doms);
        var outEl = doms.zoomOutDom, inEl = doms.zoomInDom;
        if (map._scalable && map.browserScalable()) {
            if (dom.zoom == null) {
                $fly(dom).append(doms.mapControl);
                jQuery(outEl).click(function () {
                    map.zoomOut(1);
                }).addClassOnHover("out-hover").addClassOnClick("out-click");
                jQuery(inEl).click(function () {
                    map.zoomIn(1);
                }).addClassOnHover("in-hover").addClassOnClick("in-click");
            } else {
                $fly(dom.zoom).css("display", "");
            }
        } else {
            if (dom.zoom) {
                $fly(dom.zoom).css("display", "none");
            }
        }
        map._RENDER_DATA_TIMER && clearTimeout(map._RENDER_DATA_TIMER);
        map._RENDER_DATA_TIMER = setTimeout(function () {
            map.refreshPaper();
        }, 100);
    }, resetDimension:function (forced) {
        var changed = $invokeSuper.call(this, [forced]);
        if (changed) {
            var supMap = this._subMap;
            supMap && supMap.resetDimension(forced);
        }
        return changed;
    }, refreshPaper:function () {
        var map = this, data = map._data, paper = map._paper, arg = {paper:paper, data:data, processDefault:true};
        paper.clear();
        this.fireEvent("beforeRefreshPaper", map, arg);
        if (arg.processDefault) {
            this._DATA_RENDER_STATES = true;
            if (data.canvasWidth && data.canvasHeight) {
                paper.canvasWidth = data.canvasWidth;
                paper.canvasHeight = data.canvasHeight;
            }
            data.paths && map.renderElements(data.paths);
            this._showTexts && data.texts && map.renderTexts(data.texts);
            if (map._scalable && map.browserScalable()) {
                map._zoom = paper.panzoom();
                map._zoom.enable();
            }
            this.fireEvent("onRefreshPaper", map, arg);
        }
    }, renderElements:function (elements) {
        var map = this, paths = this._elements = new Array();
        for (var i = elements.length - 1; i >= 0; i--) {
            var element = elements[i];
            var path = (this._elementRenderer || $singleton(dorado.widget.map.DefaultElementRenderer)).render(this, element);
            element.transform && path.transform(element.transform);
            element.id && path.data("id", element.id);
            element.name && path.data("name", element.name);
            element._raphaelEl = path;
            paths.push(path);
            path.click(function () {
                map._onElementClick(this);
            });
            path.dblclick(function () {
                map._onElementDoubleClick(this);
            });
            path.mouseover(function () {
                map._onElementMouseOver(this);
            });
            path.mouseout(function () {
                map._onElementMouseOut(this);
            });
            map.fireEvent("onRenderElement", map, {element:path});
        }
    }, renderTexts:function (texts) {
        var text, map = this, _texts = map._texts = new Array();
        for (var i = texts.length - 1; i >= 0; i--) {
            text = texts[i];
            var el = (map._textRenderer || $singleton(dorado.widget.map.DefaultTextRenderer)).render(this, text);
            text._raphaelEl = el;
            el._text = text;
            _texts.push(text);
            map.fireEvent("onRenderText", map, {text:text, raphaelEl:text._raphaelEl});
        }
    }, getZoom:function () {
        return this._zoom;
    }, zoomOut:function (steps) {
        this.getZoom().zoomOut(steps);
    }, zoomIn:function (steps) {
        this.getZoom().zoomIn(steps);
    }, getElements:function () {
        return this._elements;
    }, getTexts:function () {
        return this._texts;
    }, latToY:function (lat) {
        var data = this.get("data");
        return lat * data.cy - data.gy;
    }, lonToX:function (lon) {
        var data = this.get("data"), x = lon * data.cx - data.gx;
        return x - 5;
    }, parseLatLon:function (latlon) {
        var m = String(latlon).split(LATLONRG), lat = m && +m[1] + (m[2] || 0) / 60 + (m[3] || 0) / 3600;
        if (m[4].toUpperCase() == "S") {
            lat = -lat;
        }
        var lon = m && +m[6] + (m[7] || 0) / 60 + (m[8] || 0) / 3600;
        if (m[9].toUpperCase() == "W") {
            lon = -lon;
        }
        return {x:this.lonToX(lon), y:this.latToY(lat)};
    }, _onElementMouseOver:function (element) {
        this.fireEvent("onElementMouseOver", this, {element:element});
    }, _onElementMouseOut:function (element) {
        this.fireEvent("onElementMouseOut", this, {element:element});
    }, _onElementClick:function (element) {
        var map = this;
        clearTimeout(map._ClickTimer);
        map._ClickTimer = setTimeout(function () {
            map.fireEvent("onElementClick", map, {element:element});
        }, 300);
    }, _onElementDoubleClick:function (element) {
        var map = this;
        clearTimeout(map._ClickTimer);
        map.fireEvent("onElementDoubleClick", map, {element:element});
    }});
    dorado.widget.SubMap = $extend([dorado.widget.Map, dorado.widget.FloatControl], {$className:"dorado.widget.SubMap", _inherentClassName:"i-subMap", ATTRIBUTES:{className:{defaultValue:"d-submap"}, closeable:{defaultValue:true}}, createDom:function (dom) {
        $invokeSuper.call(this, arguments);
        var dom = this.canvas = document.createElement("DIV");
        this._paper = new Raphael(dom);
        return dom;
    }, onAttachToDocument:function () {
        $invokeSuper.call(this, arguments);
        var dom = this._dom, map = this, parentDom = map._parent._dom;
        $fly(parentDom).append(dom);
        $fly(dom).width(parentDom.clientWidth);
        $fly(dom).height(parentDom.clientHeight);
        if (map._closeable) {
            if (dom.close == null) {
                var closeEl = document.createElement("div");
                closeEl.className = "close";
                $fly(dom).append(closeEl);
                dom.close = closeEl;
                jQuery(closeEl).click(function () {
                    map.doClose(map);
                }).addClassOnHover("close-hover").addClassOnClick("close-click");
            } else {
                $fly(dom.close).css("display", "");
            }
        } else {
            if (dom.close) {
                $fly(dom.close).css("display", "none");
            }
        }
    }, resetDimension:function (forced) {
        var changed = $invokeSuper.call(this, [forced]), shouldRepaint = false;
        if (changed) {
            var _paper = this.getPaper(), dom = this.getDom(), parentDom = this._parent._dom;
            $fly(parentDom).append(dom);
            $fly(dom).width(parentDom.clientWidth);
            $fly(dom).height(parentDom.clientHeight);
            _paper.setSize(parentDom.clientWidth, parentDom.clientHeight);
        }
        return changed;
    }, doShow:function (options) {
        $invokeSuper.call(this, arguments);
        this.refreshPaper();
    }, doClose:function (closeEl) {
        this.hide();
    }});
    dorado.Toolkits.registerPrototype("map", {Default:dorado.widget.Map, SubMap:dorado.widget.SubMap});
})();


(function () {
    var tokenRegex = /\{([^\}]+)\}/g, objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, replacer = function (all, key, obj) {
        var res = obj;
        key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
            name = name || quotedName;
            if (res) {
                if (name in res) {
                    res = res[name];
                }
                typeof res == "function" && isFunc && (res = res());
            }
        });
        res = (res == null || res == obj ? all : res) + "";
        return res;
    }, fill = function (str, obj) {
        return String(str).replace(tokenRegex, function (all, key) {
            return replacer(all, key, obj);
        });
    };
    Raphael.fn.popup = function (X, Y, set, pos, ret) {
        pos = String(pos || "top-middle").split("-");
        pos[1] = pos[1] || "middle";
        var r = 5, bb = set.getBBox(), w = Math.round(bb.width), h = Math.round(bb.height), x = Math.round(bb.x) - r, y = Math.round(bb.y) - r, gap = Math.min(h / 2, w / 2, 10), shapes = {top:"M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}l-{right},0-{gap},{gap}-{gap}-{gap}-{left},0a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z", bottom:"M{x},{y}l{left},0,{gap}-{gap},{gap},{gap},{right},0a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z", right:"M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}l0-{bottom}-{gap}-{gap},{gap}-{gap},0-{top}a{r},{r},0,0,1,{r}-{r}z", left:"M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}l0,{top},{gap},{gap}-{gap},{gap},0,{bottom}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z"}, offset = {hx0:X - (x + r + w - gap * 2), hx1:X - (x + r + w / 2 - gap), hx2:X - (x + r + gap), vhy:Y - (y + r + h + r + gap), "^hy":Y - (y - gap)}, mask = [{x:x + r, y:y, w:w, w4:w / 4, h4:h / 4, right:0, left:w - gap * 2, bottom:0, top:h - gap * 2, r:r, h:h, gap:gap}, {x:x + r, y:y, w:w, w4:w / 4, h4:h / 4, left:w / 2 - gap, right:w / 2 - gap, top:h / 2 - gap, bottom:h / 2 - gap, r:r, h:h, gap:gap}, {x:x + r, y:y, w:w, w4:w / 4, h4:h / 4, left:0, right:w - gap * 2, top:0, bottom:h - gap * 2, r:r, h:h, gap:gap}][pos[1] == "middle" ? 1 : (pos[1] == "top" || pos[1] == "left") * 2];
        var dx = 0, dy = 0, out = this.path(fill(shapes[pos[0]], mask)).insertBefore(set);
        switch (pos[0]) {
          case "top":
            dx = X - (x + r + mask.left + gap);
            dy = Y - (y + r + h + r + gap);
            break;
          case "bottom":
            dx = X - (x + r + mask.left + gap);
            dy = Y - (y - gap);
            break;
          case "left":
            dx = X - (x + r + w + r + gap);
            dy = Y - (y + r + mask.top + gap);
            break;
          case "right":
            dx = X - (x - gap);
            dy = Y - (y + r + mask.top + gap);
            break;
        }
        out.translate(dx, dy);
        if (ret) {
            ret = out.attr("path");
            out.remove();
            return {path:ret, dx:dx, dy:dy};
        }
        set.translate(dx, dy);
        return out;
    };
})();


(function () {
    Raphael.fn.panzoom = {};
    Raphael.fn.panzoom = function (options) {
        var paper = this;
        return new PanZoom(paper, options);
    };
    var panZoomFunctions = {enable:function () {
        this.enabled = true;
    }, disable:function () {
        this.enabled = false;
    }, zoomIn:function (steps) {
        this.applyZoom(steps);
    }, zoomOut:function (steps) {
        this.applyZoom(steps > 0 ? steps * -1 : steps);
    }, pan:function (deltaX, deltaY) {
    }, isDragging:function () {
        return this.dragTime > this.dragThreshold;
    }, getCurrentPosition:function () {
        return this.currPos;
    }, getCurrentZoom:function () {
        return this.currZoom;
    }}, PanZoom = function (el, options) {
        var paper = el, container = paper.canvas.parentNode, me = this, settings = {}, initialPos = {x:0, y:0}, deltaX = 0, deltaY = 0, mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
        this.enabled = false;
        this.dragThreshold = 5;
        this.dragTime = 0;
        options = options || {};
        settings.maxZoom = options.maxZoom || 9;
        settings.minZoom = options.minZoom || 0;
        settings.zoomStep = options.zoomStep || 0;
        settings.initialZoom = options.initialZoom || 0;
        settings.initialPosition = options.initialPosition || {x:0, y:0};
        this.currZoom = settings.initialZoom;
        this.currPos = settings.initialPosition;
        repaint();
        settings.zoomStep = 0.1;
        container.onmousedown = function (e) {
            var evt = window.event || e;
            if (!me.enabled) {
                return false;
            }
            me.dragTime = 0;
            initialPos = getRelativePosition(evt, container);
            container.className += " grabbing";
            container.onmousemove = dragging;
            document.onmousemove = function () {
                return false;
            };
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
            return false;
        };
        container.onmouseup = function (e) {
            document.onmousemove = null;
            container.className = container.className.replace(/(?:^|\s)grabbing(?!\S)/g, "");
            container.onmousemove = null;
        };
        if (container.attachEvent) {
            container.attachEvent("on" + mousewheelevt, handleScroll);
        } else {
            if (container.addEventListener) {
                container.addEventListener(mousewheelevt, handleScroll, false);
            }
        }
        function handleScroll(e) {
            if (!me.enabled) {
                return false;
            }
            var evt = window.event || e, delta = evt.detail ? evt.detail : evt.wheelDelta * -1, zoomCenter = getRelativePosition(evt, container);
            if (delta > 0) {
                delta = -1;
            } else {
                if (delta < 0) {
                    delta = 1;
                }
            }
            applyZoom(delta, zoomCenter);
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
            return false;
        }
        function applyZoom(val, centerPoint) {
            if (!me.enabled) {
                return false;
            }
            me.currZoom += val;
            if (me.currZoom < settings.minZoom) {
                me.currZoom = settings.minZoom;
            } else {
                if (me.currZoom > settings.maxZoom) {
                    me.currZoom = settings.maxZoom;
                } else {
                    centerPoint = centerPoint || {x:paper.canvasWidth / 2, y:paper.canvasHeight / 2};
                    deltaX = ((paper.canvasWidth * settings.zoomStep) * (centerPoint.x / paper.canvasWidth)) * val;
                    deltaY = (paper.canvasHeight * settings.zoomStep) * (centerPoint.y / paper.canvasHeight) * val;
                    repaint();
                }
            }
        }
        this.applyZoom = applyZoom;
        function dragging(e) {
            if (!me.enabled) {
                return false;
            }
            var evt = window.event || e, newWidth = paper.canvasWidth * (1 - (me.currZoom * settings.zoomStep)), newHeight = paper.canvasHeight * (1 - (me.currZoom * settings.zoomStep)), newPoint = getRelativePosition(evt, container);
            deltaX = (newWidth * (newPoint.x - initialPos.x) / paper.canvasWidth) * -1;
            deltaY = (newHeight * (newPoint.y - initialPos.y) / paper.canvasHeight) * -1;
            initialPos = newPoint;
            repaint();
            me.dragTime++;
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
            return false;
        }
        function repaint() {
            me.currPos.x = me.currPos.x + deltaX;
            me.currPos.y = me.currPos.y + deltaY;
            var canvasWidth = paper.canvasWidth, canvasHeight = paper.canvasHeight;
            if (typeof canvasWidth == "string") {
                canvasWidth = parseFloat(canvasWidth);
            }
            if (typeof canvasHeight == "string") {
                canvasHeight = parseFloat(canvasHeight);
            }
            var newWidth = canvasWidth * (1 - (me.currZoom * settings.zoomStep)), newHeight = canvasHeight * (1 - (me.currZoom * settings.zoomStep));
            if (me.currPos.x < 0) {
                me.currPos.x = 0;
            } else {
                if (me.currPos.x > (paper.canvasWidth * me.currZoom * settings.zoomStep)) {
                    me.currPos.x = (paper.canvasWidth * me.currZoom * settings.zoomStep);
                }
            }
            if (me.currPos.y < 0) {
                me.currPos.y = 0;
            } else {
                if (me.currPos.y > (paper.canvasHeight * me.currZoom * settings.zoomStep)) {
                    me.currPos.y = (paper.canvasHeight * me.currZoom * settings.zoomStep);
                }
            }
            paper.setViewBox(me.currPos.x, me.currPos.y, newWidth, newHeight, true);
        }
    };
    PanZoom.prototype = panZoomFunctions;
    function getRelativePosition(e, obj) {
        var x, y, pos;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        pos = findPos(obj);
        x -= pos[0];
        y -= pos[1];
        return {x:x, y:y};
    }
    function findPos(obj) {
        var posX = obj.offsetLeft, posY = obj.offsetTop, posArray;
        while (obj.offsetParent) {
            if (obj == document.getElementsByTagName("body")[0]) {
                break;
            } else {
                posX = posX + obj.offsetParent.offsetLeft;
                posY = posY + obj.offsetParent.offsetTop;
                obj = obj.offsetParent;
            }
        }
        posArray = [posX, posY];
        return posArray;
    }
})();

