


if (!dorado.touch) {
    dorado.widget.touch = dorado.touch = {};
}
(function () {
    var bind = dorado.widget.Control.prototype.bind, touchEventMap = {onTap:"tap", onDoubleTap:"doubletap", onSwipe:"swipe", onTapHold:"hold"};
    var clickbuster = dorado.clickbuster = {}, lastPosition = null, lastPositionDate;
    clickbuster.handleClick = function (event) {
        var position;
        if (event.type == "click") {
            position = {left:event.clientX, top:event.clientY};
        } else {
            if (event.type == "focusin") {
                if (lastPosition && lastPositionDate && (new Date() - lastPositionDate < 1000)) {
                    position = lastPosition;
                } else {
                    return;
                }
            }
        }
        for (var i = 0; i < clickbuster.coordinates.length; i += 2) {
            var x = clickbuster.coordinates[i], y = clickbuster.coordinates[i + 1];
            if (Math.abs(position.left - x) < 25 && Math.abs(position.top - y) < 25) {
                if (event.type == "focusin") {
                    event.target.blur();
                }
                event.stopImmediatePropagation && event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };
    $fly(document).bind("touchend", function (event) {
        var pointer = (event.originalEvent.changedTouches || event.originalEvent.touches)[0];
        if (pointer) {
            lastPosition = {left:pointer.clientX, top:pointer.clientY};
            lastPositionDate = new Date();
        }
    });
    document.addEventListener("click", clickbuster.handleClick, true);
    jQuery(document).delegate("input, textarea", "focusin", function (event) {
        clickbuster.handleClick(event);
    });
    clickbuster.coordinates = [];
    clickbuster.preventGhostClick = function (x, y) {
        clickbuster.coordinates.push(x, y);
        window.setTimeout(clickbuster.pop, 1000);
    };
    clickbuster.pop = function () {
        clickbuster.coordinates.splice(0, 2);
    };
    dorado.preventGhostClick = function (event) {
        if (!event || !event.gesture) {
            return;
        }
        event.gesture.preventDefault();
        if (dorado.Browser.android && !dorado.Browser.chrome) {
            var center = event.gesture.center;
            clickbuster.preventGhostClick(center.pageX, center.pageY);
        }
    };
    var bindEvent = function (dom, name, control) {
        $fly(dom).hammer({transform:false}).bind(touchEventMap[name], function (event) {
            if (name == "onTap") {
                dorado.preventGhostClick(event);
            }
            control.fireEvent(name, control, event);
        });
    };
    dorado.widget.Control.prototype.bind = function (name, listener, options) {
        var control = this;
        if (name in touchEventMap) {
            if (control._rendered) {
                bindEvent(control._dom, name, control);
            } else {
                if (!control._touchEventCache) {
                    control._touchEventCache = [];
                }
                control._touchEventCache.push([name, listener, options]);
            }
        }
        return bind.apply(control, arguments);
    };
    var getDom = dorado.widget.Control.prototype.getDom;
    dorado.widget.Control.prototype.getDom = function () {
        var control = this;
        if (!control._dom) {
            var touchEventCache = control._touchEventCache;
            if (touchEventCache) {
                var dom = getDom.apply(control, arguments);
                for (var i = 0, j = touchEventCache.length; i < j; i++) {
                    var arg = touchEventCache[i];
                    bindEvent(dom, arg[0], control);
                }
                control._touchEventCache = null;
                return dom;
            }
        }
        return getDom.apply(control, arguments);
    };
    dorado.widget.Control.prototype.doSetFocus = function () {
    };
    if (dorado.Browser.android && dorado.widget.FloatControl.layerModalPool) {
        var layerModalPool = dorado.widget.FloatControl.layerModalPool;
        dorado.bindResize(function (keyboardVisible) {
            if (keyboardVisible === undefined) {
                return;
            }
            var activeNum = layerModalPool.getNumActive();
            if (activeNum > 0) {
                var activePool = layerModalPool._activePool;
                for (var i = 0; i < activeNum; i++) {
                    var element = activePool[i];
                    if (keyboardVisible) {
                        var width = jQuery("body").width(), height = jQuery("body").height();
                        $fly(element).css({width:width, height:height});
                    } else {
                        $fly(element).css({width:"100%", height:"100%"});
                    }
                }
            }
        });
    }
})();


dorado.widget.layout.AbstractCSS3BoxLayout = $extend(dorado.widget.layout.Layout, {$className:"dorado.widget.layout.AbstractCSS3BoxLayout", ATTRIBUTES:{align:{defaultValue:"start"}, pack:{}, direction:{}}, createDom:function () {
    var dom = document.createElement("DIV");
    dom.className = this._className;
    return dom;
}, initCssConfig:function (cssConfig) {
    if (this._padding) {
        cssConfig["padding"] = this._padding;
    }
    if (this._align) {
        cssConfig["box-align"] = this._align;
        cssConfig["-webkit-box-align"] = this._align;
    }
    if (this._pack) {
        cssConfig["box-pack"] = this._pack;
        cssConfig["-webkit-box-pack"] = this._pack;
    }
    if (this._direction) {
        cssConfig["box-direction"] = this._direction;
        cssConfig["-webkit-box-direction"] = this._direction;
    }
}, refreshDom:function (dom) {
    var cssConfig = {};
    this.initCssConfig(cssConfig);
    $fly(dom).css(cssConfig);
    for (var it = this._regions.iterator(); it.hasNext(); ) {
        var region = it.next();
        var constraint = region.constraint;
        if (constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
            continue;
        }
        this.renderControl(region, dom, false, false);
    }
}, onAddControl:function (control) {
    if (!this._attached || this._disableRendering) {
        return;
    }
    var region = this._regions.get(control._id);
    if (region) {
        this.renderControl(region, this._dom, false, false);
    }
}, onRemoveControl:function (control) {
    if (!this._attached || this._disableRendering) {
        return;
    }
    var region = this._regions.get(control._id);
    control.unrender();
}, renderControl:function (region, containerDom, autoWidth, autoHeight) {
    var control = region.control, $controlDom = $fly(control.getDom()), constraint = region.constraint;
    var cssConfig = {};
    if (constraint.margin) {
        cssConfig.margin = parseInt(constraint.margin);
    }
    if (constraint.flex) {
        cssConfig["box-flex"] = constraint.flex;
        cssConfig["-webkit-box-flex"] = constraint.flex;
    }
    $controlDom.css(cssConfig);
    $invokeSuper.call(this, arguments);
}});
dorado.widget.layout.CSS3HBoxLayout = $extend(dorado.widget.layout.AbstractCSS3BoxLayout, {$className:"dorado.widget.layout.CSS3HBoxLayout", _className:"t-css3-hbox-layout", initCssConfig:function (cssConfig) {
    $invokeSuper.call(this, arguments);
    if (this._pack != "start") {
        cssConfig.width = "100%";
    }
}, renderControl:function (region, containerDom, autoWidth, autoHeight) {
    region.width = this._container.getContentContainerSize()[1] - (this._padding || 0) * 2;
    $invokeSuper.call(this, [region, containerDom, autoWidth, true]);
}});
dorado.widget.layout.CSS3VBoxLayout = $extend(dorado.widget.layout.AbstractCSS3BoxLayout, {$className:"dorado.widget.layout.CSS3VBoxLayout", _className:"t-css3-vbox-layout", initCssConfig:function (cssConfig) {
    $invokeSuper.call(this, arguments);
    if (this._pack != "start") {
        cssConfig.height = "100%";
    }
}, renderControl:function (region, containerDom, autoWidth, autoHeight) {
    region.width = this._container.getContentContainerSize()[0] - (this._padding || 0) * 2;
    $invokeSuper.call(this, [region, containerDom, true, autoHeight]);
}});

