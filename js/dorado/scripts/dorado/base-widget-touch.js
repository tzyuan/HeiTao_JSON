


dorado.touch.Button = $extend(dorado.widget.AbstractButton, {$className:"dorado.touch.Button", focusable:true, _inherentClassName:"", ATTRIBUTES:{className:{defaultValue:"t-button"}, width:{independent:true}, height:{independent:false}, caption:{}, type:{defaultValue:"icon-left", writeBeforeReady:true}, icon:{}, iconClass:{setter:function (value) {
    var oldValue = this._iconClass;
    if (this._rendered) {
        var toRemoveIconClasses = this._toRemoveIconClasses;
        if (!toRemoveIconClasses) {
            toRemoveIconClasses = this._toRemoveIconClasses = [];
        }
        this._toRemoveIconClasses.push(oldValue);
    }
    this._iconClass = value;
}}, badgeText:{}, badgeClass:{}}, EVENTS:{}, onClick:function () {
    var button = this, action = button._action || {}, disabled = button._disabled || action._disabled;
    if (!disabled) {
        $invokeSuper.call(this, arguments);
        if (button._menu && button.getListenerCount("onClick") == 0) {
            button.doShowMenu();
        } else {
            if (button._type == "back" && !button.getListenerCount("onClick")) {
                var floatParent = button.findParent(dorado.widget.FloatContainer);
                if (floatParent && floatParent.get("floating") && floatParent.get("visible") !== false) {
                    floatParent.hide();
                } else {
                    var stack = button.findParent(dorado.touch.Stack);
                    if (stack) {
                        stack.pop();
                    }
                }
            }
        }
        document.activeElement.blur();
    }
}, createDom:function () {
    var button = this, doms = {}, dom = $DomUtils.xCreate({tagName:"span", className:this._className, content:{tagName:"span", className:"label", contextKey:"label", content:this._caption}}, null, doms);
    button._doms = doms;
    $fly(dom).addClass(button._className + "-" + button._type);
    button.doCreateIcon(dom);
    button.doCreateBadge(dom);
    return dom;
}, doCreateIcon:function (dom) {
    var button = this, action = button._action || {}, doms = button._doms, icon = button._icon || action._icon, iconClass = button._iconClass || action._iconClass;
    if (icon || iconClass || button._type == "back" || button._type == "forward") {
        dom = dom ? dom : button._dom;
        var iconEl = document.createElement("span");
        iconEl.className = "icon";
        doms.icon = iconEl;
        dom.insertBefore(iconEl, doms.label);
    }
}, doRefreshIcon:function () {
    var button = this, action = button._action || {}, doms = button._doms, dom = button._dom, icon = button.get("icon") || action._icon, iconClass = button._iconClass || action._iconClass;
    if (icon || iconClass || button._type == "back" || button._type == "forward") {
        if (!doms.icon) {
            button.doCreateIcon(dom);
        } else {
            $fly(doms.icon).css("display", "");
        }
    } else {
        if (doms.icon) {
            $fly(doms.icon).css("display", "none");
        }
    }
    if (icon) {
        $DomUtils.setBackgroundImage(doms.icon, icon);
    } else {
        if (doms.icon) {
            $DomUtils.setBackgroundImage(doms.icon, "");
        }
    }
    var toRemoveIconClasses = this._toRemoveIconClasses;
    if (toRemoveIconClasses) {
        $fly(doms.icon).removeClass(toRemoveIconClasses.join(" "));
        this._toRemoveIconClasses = null;
    }
    if (iconClass) {
        $fly(doms.icon).addClass(iconClass);
    }
}, doCreateBadge:function (dom) {
    var button = this, doms = button._doms, badgeText = button._badgeText;
    if (badgeText == null) {
        return;
    }
    dom = dom ? dom : button._dom;
    var badgeEl = document.createElement("span");
    badgeEl.className = "t-badge";
    badgeEl.innerHTML = badgeText;
    doms.badge = badgeEl;
    dom.appendChild(badgeEl);
}, doRefreshBadge:function () {
    var button = this, doms = button._doms, dom = button._dom, className = "t-badge " + (button._badgeClass || "");
    if (button._badgeText) {
        if (!doms.badge) {
            button.doCreateBadge(dom);
        } else {
            $fly(doms.badge).css("display", "");
        }
        $fly(doms.badge).text(button._badgeText).prop("className", className);
    } else {
        if (doms.badge) {
            $fly(doms.badge).text("").css("display", "none").prop("className", className);
        }
    }
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var button = this, action = button._action || {}, doms = button._doms, caption = button._caption || action._caption;
    $fly(doms.label).html(caption || "&nbsp;").css("display", caption == undefined ? "none" : "");
    button.doRefreshIcon();
    button.doRefreshBadge();
}, doShowMenu:function () {
    var button = this, menu = button._menu, dom = button._dom, doms = button._doms, cls = button._className;
    if (menu) {
        menu.bind("onShow", function () {
            if (button._toggleOnShowMenu) {
                $fly(dom).addClass(cls + "-toggled");
            }
            menu.bind("onHide", function () {
                button.doAfterMenuHide();
            }, {once:true});
        }, {once:true});
        menu._focusParent = button;
        menu.show({anchorTarget:button, align:"innerleft", vAlign:"bottom"});
    }
}, doAfterMenuHide:function () {
    var button = this, dom = button._dom;
    if (button._toggleOnShowMenu) {
        $fly(dom).removeClass(button._className + "-toggled");
    }
}});
(function () {
    dorado.touch.AbstractPanel = $extend(dorado.widget.Container, {$className:"dorado.touch.AbstractPanel", ATTRIBUTES:{caption:{skipRefresh:true, path:"_toolbar.caption"}, buttons:{innerComponent:"touch.Button"}, buttonAlign:{defaultValue:"center", skipRefresh:true, setter:function (value) {
        var panel = this, doms = panel._doms, oldValue = panel._buttonAlign;
        if (doms) {
            if (oldValue && oldValue != "center") {
                $fly(doms.buttonPanel).removeClass("button-panel-" + oldValue);
            }
            if (value && value != "center") {
                $fly(doms.buttonPanel).addClass("button-panel-" + value);
            }
        }
        panel._buttonAlign = value;
    }}}, EVENTS:{}, createButtonPanel:function (dom) {
        var panel = this, doms = panel._doms;
        if (doms.buttonPanel) {
            return doms.buttonPanel;
        }
        var buttonPanel = document.createElement("div");
        buttonPanel.className = "button-panel";
        doms.buttonPanel = buttonPanel;
        if (doms.body) {
            doms.body.appendChild(buttonPanel);
        } else {
            dom.appendChild(buttonPanel);
        }
        return buttonPanel;
    }, initButtons:function (dom) {
        var panel = this, doms = panel._doms;
        if (panel._buttons) {
            var buttons = panel._buttons, button, buttonPanel;
            buttonPanel = panel.createButtonPanel(dom);
            for (var i = 0, j = buttons.length; i < j; i++) {
                button = buttons[i];
                panel.registerInnerControl(button);
                button.render(buttonPanel);
            }
            var buttonAlign = panel._buttonAlign;
            if (buttonAlign && buttonAlign != "center") {
                $fly(doms.buttonPanel).addClass("button-panel-" + buttonAlign);
            }
        }
    }});
    dorado.touch.Panel = $extend(dorado.touch.AbstractPanel, {$className:"dorado.touch.Panel", ATTRIBUTES:{className:{defaultValue:"t-panel"}, width:{defaultValue:300}, background:{}, showCaptionBar:{defaultValue:true, writeBeforeReady:true}, tools:{}}, createDom:function () {
        var panel = this, doms = {}, dom;
        dom = $DomUtils.xCreate({tagName:"div", className:panel._className, content:{tagName:"div", className:"panel-body", contextKey:"body", content:{tagName:"div", className:"content-panel", contextKey:"contentPanel"}}}, null, doms);
        panel._doms = doms;
        if (panel._showCaptionBar) {
            var tools = panel._tools, caption = panel._caption;
            var toolbar = panel._toolbar = new dorado.touch.ToolBar({ui:panel._ui, caption:caption, items:tools});
            $fly(dom).addClass(panel._className + "-showcaptionbar");
            if (doms.body) {
                toolbar.render(doms.body.parentNode, doms.body);
            } else {
                toolbar.render(dom, doms.contentPanel);
            }
            panel.registerInnerControl(toolbar);
            doms.toolbar = toolbar._dom;
        }
        panel.initButtons(dom);
        return dom;
    }, doOnResize:function () {
        var panel = this, dom = panel._dom, doms = panel._doms, height = panel.getRealHeight();
        if (typeof height == "number" && height > 0) {
            var buttonPanelHeight = 0, toolbarHeight = 0;
            if (doms.buttonPanel) {
                buttonPanelHeight = $fly(doms.buttonPanel).outerHeight(true);
            }
            if (doms.toolbar) {
                toolbarHeight = $fly(doms.toolbar).outerHeight(true);
            }
            $fly(doms.contentPanel).outerHeight(jQuery(dom).height() - toolbarHeight - buttonPanelHeight);
        }
        $invokeSuper.call(this, arguments);
        if (panel._toolbar && panel._toolbar._rendered) {
            panel._toolbar.onResize();
        }
        $fly(dom).height("auto");
    }, refreshDom:function (dom) {
        var panel = this, doms = panel._doms;
        if (this.background) {
            doms.contentPanel.style.background = this.background;
        }
        $invokeSuper.call(this, arguments);
    }, getContentContainer:function () {
        return this._doms.contentPanel;
    }});
})();
dorado.touch.GroupBox = $extend(dorado.widget.Container, {$className:"dorado.touch.GroupBox", ATTRIBUTES:{className:{defaultValue:"t-group-box"}, caption:{}}, createDom:function () {
    var groupBox = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:groupBox._className, content:[{tagName:"div", className:"group-box-bar", contextKey:"captionContainer", content:[{tagName:"div", className:"bar-caption", content:groupBox._caption, contextKey:"caption"}]}, {tagName:"div", className:"body", contextKey:"body", content:{contextKey:"contentPanel", tagName:"div", className:"content-panel"}}]}, null, doms);
    groupBox._doms = doms;
    return dom;
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var groupbox = this;
    $fly(groupbox._doms.caption).html(groupbox._caption);
}, doOnResize:function () {
    var groupbox = this, dom = groupbox._dom, doms = groupbox._doms, height = groupbox.getRealHeight();
    if (typeof height == "number" && height > 0) {
        var captionCtHeight = 0;
        if (doms.captionContainer) {
            captionCtHeight = $fly(doms.captionContainer).outerHeight(true);
        }
        $fly(doms.contentPanel).outerHeight(height - captionCtHeight - buttonPanelHeight);
        $fly(dom).height("auto");
    }
    $invokeSuper.call(this, arguments);
}, getContentContainer:function () {
    return this._doms.contentPanel;
}});
dorado.touch.FloatPanel = $extend([dorado.touch.Panel, dorado.widget.FloatControl], {$className:"dorado.touch.FloatPanel", focusable:true, ATTRIBUTES:{visible:{defaultValue:false}, slideDirection:{defaultValue:"r2l"}}, EVENTS:{beforeClose:{}, onClose:{}}, doShow:function (options) {
    var panel = this, doms = panel._doms;
    $fly([doms.contentPanel, doms.buttonPanel]).css("display", "");
    options = options || {};
    if (!options.direction) {
        options.direction = this._slideDirection || "r2l";
    }
    document.activeElement.blur();
    $invokeSuper.call(this, arguments);
}, doAfterShow:function () {
    var panel = this;
    panel._minimized = false;
    $invokeSuper.call(this, arguments);
}});
dorado.touch.Dialog = $extend(dorado.touch.FloatPanel, {$className:"dorado.touch.Dialog", ATTRIBUTES:{className:{defaultValue:"t-dialog"}, animateType:{defaultValue:"none"}, draggable:{defaultValue:true}, dragOutside:{defaultValue:false}, center:{defaultValue:true}, modal:{defaultValue:true}, maximizeTarget:{}, minimizeable:{defaultValue:false, setter:function (value) {
    var dialog = this, toolbar = dialog._toolbar, button;
    dialog._minimizeable = value;
    if (toolbar && dialog._rendered) {
        if (value) {
            button = toolbar.getItem(dialog._id + "_minimize");
            if (button) {
                $fly(button._dom).css("display", "");
            } else {
                dialog.createMinimizeButton();
            }
        } else {
            button = toolbar.getItem(dialog._id + "_minimize");
            if (button) {
                $fly(button._dom).css("display", "none");
            }
        }
    }
}}, minimized:{}, maximizeable:{setter:function (value) {
    var dialog = this, toolbar = dialog._toolbar, button;
    dialog._maximizeable = value;
    if (toolbar && dialog._rendered) {
        if (value) {
            button = toolbar.getItem(dialog._id + "_maximize");
            if (button) {
                $fly(button._dom).css("display", "");
            } else {
                dialog.createMaximizeButton();
            }
        } else {
            button = toolbar.getItem(dialog._id + "_maximize");
            if (button) {
                $fly(button._dom).css("display", "none");
            }
        }
    }
}}, maximized:{}, closeable:{defaultValue:false, setter:function (value) {
    var dialog = this, toolbar = dialog._toolbar, button;
    dialog._closeable = value;
    if (toolbar && dialog._rendered) {
        if (value) {
            button = toolbar.getItem(dialog._id + "_close");
            if (button) {
                $fly(button.dom).css("display", "");
            } else {
                dialog.createCloseButton();
            }
        } else {
            button = toolbar.getItem(dialog._id + "_close");
            if (button) {
                $fly(button.dom).css("display", "none");
            }
        }
    }
}}, closeAction:{defaultValue:"hide"}, shadowMode:{defaultValue:"frame", skipRefresh:true}}, EVENTS:{beforeMaximize:{}, onMaximize:{}, beforeMinimize:{}, onMinimize:{}}, setFocus:function () {
    var dialog = this;
    if (dialog._rendered) {
        dialog._dom.focus();
    }
}, applyDraggable:function () {
}, maximizeRestore:function () {
    var dialog = this, dom = dialog._dom, doms = dialog._doms;
    if (dom) {
        $fly(doms.contentPanel).css("display", "");
        if (dialog._maximized) {
            dialog._maximized = false;
            dialog._width = dialog._originalWidth;
            dialog._height = dialog._originalHeight;
            dialog._left = dialog._originalLeft;
            dialog._top = dialog._originalTop;
            dialog.resetDimension();
            dialog.refresh();
            if (dialog._left !== undefined && dialog._top !== undefined) {
                $fly(dom).css({left:dialog._left, top:dialog._top});
            }
            var toolbar = dialog._toolbar;
            if (toolbar) {
                var button = toolbar.getItem(dialog._id + "_maximize");
                if (button) {
                    $fly(button._dom).addClass("t-maximize-button");
                    button._exClassName = "t-maximize-button";
                }
            }
            var $dom = $fly(dom);
            if (dialog._draggable) {
            }
        }
    }
}, maximize:function () {
    var dialog = this, dom = dialog._dom;
    if (dom) {
        var eventArg = {};
        dialog.fireEvent("beforeMaximize", dialog, eventArg);
        if (eventArg.processDefault === false) {
            return;
        }
        dialog._maximized = true;
        dialog._originalWidth = dialog._width;
        dialog._originalHeight = dialog._height;
        dialog._originalLeft = dialog._left;
        dialog._originalTop = dialog._top;
        var maximizeTarget = dialog._maximizeTarget;
        if (typeof maximizeTarget == "String") {
            maximizeTarget = jQuery(maximizeTarget)[0];
        } else {
            if (maximizeTarget && dorado.Object.isInstanceOf(maximizeTarget, dorado.RenderableElement)) {
                maximizeTarget = maximizeTarget._dom;
            }
        }
        if (maximizeTarget) {
            dialog._width = $fly(maximizeTarget).outerWidth(true);
            dialog._height = $fly(maximizeTarget).outerHeight(true);
        } else {
            dialog._width = $fly(window).width();
            dialog._height = $fly(window).height();
        }
        var toolbar = dialog._toolbar;
        if (toolbar) {
            var button = toolbar.getItem(dialog._id + "_maximize");
            if (button) {
                $fly(button._dom).addClass("t-restore-button");
                button._exClassName = "t-restore-button";
            }
        }
        dialog.resetDimension();
        var targetOffset = $fly(maximizeTarget).offset() || {left:0, top:0};
        dialog._left = targetOffset.left;
        dialog._top = targetOffset.top;
        var domEl = $fly(dom);
        domEl.css(targetOffset);
        if (dialog._draggable) {
        }
        dialog.fireEvent("onMaximize", dialog);
    }
}, minimize:function () {
    var dialog = this, dom = dialog._dom;
    if (dom) {
        var eventArg = {};
        dialog.fireEvent("beforeMinimize", dialog, eventArg);
        if (eventArg.processDefault) {
            return;
        }
        dialog._minimized = true;
        dialog.hide();
        dialog.fireEvent("onMinimize", dialog);
    }
}, doOnAttachToDocument:function () {
    $invokeSuper.call(this, arguments);
    if (this._maximized) {
        this.maximize();
    }
}, doOnResize:function () {
    var dialog = this, dom = dialog._dom, doms = dialog._doms, height = dialog.getRealHeight(), width = dialog.getRealWidth();
    if (typeof width == "string") {
        if (width.indexOf("%") == -1) {
            width = parseInt(width, 10);
        } else {
            width = jQuery(window).width() * parseInt(width.replace("%", ""), 10) / 100;
        }
    }
    if (typeof height == "string") {
        if (height.indexOf("%") == -1) {
            height = parseInt(height, 10);
        } else {
            height = jQuery(window).height() * parseInt(height.replace("%", ""), 10) / 100;
        }
    }
    if (typeof height == "number" && height > 0) {
        var headerHeight = doms.header ? $fly(doms.header).outerHeight(true) : 0, footerHeight = doms.footer ? $fly(doms.footer).outerHeight(true) : 0, toolbarHeight = 0, buttonPanelHeight = 0;
        if (doms.toolbar) {
            toolbarHeight = $fly(doms.toolbar).outerHeight(true);
        }
        if (doms.buttonPanel) {
            buttonPanelHeight = $fly(doms.buttonPanel).outerHeight(true);
        }
        $fly(doms.contentPanel).outerHeight(height - headerHeight - footerHeight - toolbarHeight - buttonPanelHeight);
    } else {
        $fly(doms.contentPanel).css("height", "");
    }
    $fly(dom).css("height", "");
    if (typeof width == "number" && width > 0) {
        $fly(dom).outerWidth(width);
    }
    if (dialog._toolbar) {
        dialog._toolbar.onResize();
    }
}, createMinimizeButton:function () {
    var dialog = this, toolbar = dialog._toolbar;
    if (toolbar) {
        toolbar.addItem(new dorado.touch.Button({id:dialog._id + "_minimize", exClassName:"t-minimize-button", caption:"&nbsp", onClick:function () {
            if (!dialog._minimized) {
                dialog.minimize();
            }
        }}), 101);
    }
}, createCloseButton:function () {
    var dialog = this, toolbar = dialog._toolbar;
    if (toolbar) {
        toolbar.addItem(new dorado.touch.Button({id:dialog._id + "_close", exClassName:"t-close-button", onClick:function () {
            dialog.close();
        }}), 103);
    }
}, close:function () {
    var dialog = this, eventArg = {};
    dialog.fireEvent("beforeClose", dialog, eventArg);
    if (eventArg.processDefault === false) {
        return;
    }
    dialog.hide && dialog.hide();
    dialog.fireEvent("onClose", dialog);
    if (dialog._closeAction == "close") {
        dialog.destroy();
    }
}, createMaximizeButton:function () {
    var dialog = this, toolbar = dialog._toolbar;
    if (toolbar) {
        toolbar.addItem(new dorado.touch.Button({id:dialog._id + "_maximize", exClassName:"t-maximize-button", caption:"&nbsp", onClick:function () {
            if (!dialog._maximized) {
                dialog.maximize();
            } else {
                dialog.maximizeRestore();
            }
        }}), 102);
    }
}, createDom:function () {
    var dialog = this, dom = $invokeSuper.call(this, arguments);
    dialog.initButtons();
    if (dialog._minimizeable) {
        dialog.createMinimizeButton();
    }
    if (dialog._maximizeable) {
        dialog.createMaximizeButton();
    }
    if (dialog._closeable) {
        dialog.createCloseButton();
    }
    return dom;
}, getShowPosition:function (options) {
    var dialog = this;
    if (dialog._maximized) {
        var result = {left:0, top:0};
        $fly(dialog._dom).css(result);
        return result;
    } else {
        return $invokeSuper.call(dialog, arguments);
    }
}});
(function () {
    var ANCHOR_OFFSET_ADJ_HORIZENTAL = 5, ANCHOR_OFFSET_ADJ_VERTICAL = 5;
    dorado.touch.Bubble = $extend([dorado.widget.Container, dorado.widget.FloatControl], {$className:"dorado.touch.Bubble", focusable:true, arrowSize:($setting["touch.Bubble.arrowSize"] || 15), ATTRIBUTES:{visible:{defaultValue:false}, className:{defaultValue:"t-bubble"}, shadowMode:{defaultValue:"frame"}, arrowDirection:{defaultValue:"top"}, arrowAlign:{defaultValue:"center"}, arrowOffset:{}}, createDom:function () {
        var dom = $invokeSuper.call(this, arguments);
        this._doms = {};
        return dom;
    }, refreshArrow:function () {
        var bubble = this, dom = this._dom, doms = bubble._doms, arrowDirection = bubble._arrowDirection;
        if (arrowDirection && arrowDirection != "none") {
            if (doms.arrow == null) {
                var arrowEl = document.createElement("div");
                arrowEl.className = "arrow";
                $fly(dom).append(arrowEl);
                doms.arrow = arrowEl;
            }
            $fly(dom).removeClass("t-bubble-top t-bubble-bottom t-bubble-left t-bubble-right");
            $fly(dom).addClass("t-bubble-" + arrowDirection);
        } else {
            $fly(dom).removeClass("t-bubble-top t-bubble-bottom t-bubble-left t-bubble-right");
        }
        if (dom.offsetHeight > 0 && dom.offsetWidth > 0) {
            $fly(doms.arrow).css({left:"", top:""});
            if (arrowDirection != "none") {
                var arrowAlign = bubble._arrowAlign, arrowOffset = bubble._arrowOffset || 0;
                if (arrowAlign) {
                    if (arrowDirection == "left" || arrowDirection == "right") {
                        if (arrowAlign == "center") {
                            $fly(doms.arrow).css("top", (dom.offsetHeight - doms.arrow.offsetHeight) / 2 + arrowOffset);
                        } else {
                            if (arrowAlign == "top") {
                                $fly(doms.arrow).css("top", ANCHOR_OFFSET_ADJ_VERTICAL + arrowOffset);
                            } else {
                                if (arrowAlign == "bottom") {
                                    $fly(doms.arrow).css("top", dom.offsetHeight - doms.arrow.offsetHeight - ANCHOR_OFFSET_ADJ_VERTICAL + arrowOffset);
                                }
                            }
                        }
                    } else {
                        if (arrowAlign == "center") {
                            $fly(doms.arrow).css("left", (dom.offsetWidth - doms.arrow.offsetWidth) / 2 + arrowOffset);
                        } else {
                            if (arrowAlign == "left") {
                                $fly(doms.arrow).css("left", ANCHOR_OFFSET_ADJ_HORIZENTAL + arrowOffset);
                            } else {
                                if (arrowAlign == "right") {
                                    $fly(doms.arrow).css("left", dom.offsetWidth - doms.arrow.offsetWidth - ANCHOR_OFFSET_ADJ_HORIZENTAL + arrowOffset);
                                }
                            }
                        }
                    }
                }
            }
        }
    }, refreshDom:function (dom) {
        $invokeSuper.call(this, arguments);
        this.refreshArrow();
    }, getShowPosition:function (options) {
        var bubble = this, arrowDirection = bubble._arrowDirection, arrowAlign = bubble._arrowAlign, doms = bubble._doms;
        if (arrowDirection && doms.arrow && (options.gapX == null && options.gapY == null)) {
            if (arrowAlign) {
                if (arrowDirection == "left") {
                    options.gapX = doms.arrow.offsetWidth / 2;
                } else {
                    if (arrowDirection == "right") {
                        options.gapX = -1 * doms.arrow.offsetWidth / 2;
                    } else {
                        if (arrowDirection == "top") {
                            options.gapY = doms.arrow.offsetHeight / 2;
                        } else {
                            options.gapY = -1 * doms.arrow.offsetHeight / 2;
                        }
                    }
                }
            }
        }
        var result = $invokeSuper.call(this, arguments);
        return result;
    }});
})();
(function () {
    var layerContainer = null;
    var getLayerContainer = function () {
        if (!layerContainer) {
            layerContainer = document.createElement("div");
            $fly(layerContainer).css({position:"absolute", left:0, top:0, right:0, bottom:0, background:"transparent", overflow:"hidden"}).addClass("layer-container");
            jQuery(function () {
                $fly(document.body).prepend(layerContainer);
            });
            if (dorado.Browser.android) {
                dorado.bindResize(function (keyboardVisible) {
                    if (keyboardVisible === undefined) {
                        return;
                    }
                    if (keyboardVisible) {
                        var width = jQuery("body").width(), height = jQuery("body").height();
                        $fly(layerContainer).css({width:width, height:height, bottom:"", right:""});
                    } else {
                        $fly(layerContainer).css({width:"", height:"", bottom:0, right:0});
                    }
                });
            }
        }
        return layerContainer;
    };
    dorado.touch.Layer = $extend(dorado.widget.FloatContainer, {$className:"dorado.touch.Layer", focusable:true, ATTRIBUTES:{className:{defaultValue:"t-layer"}, maximized:{defaultValue:true}, animateType:{defaultValue:"modernSlide"}, slideDirection:{defaultValue:"r2l"}}, EVENTS:{beforeMaximize:{}, onMaximize:{}}, constructor:function () {
        $invokeSuper.call(this, arguments);
        var renderTo = this._renderTo;
        if (!renderTo) {
            this._renderTo = getLayerContainer();
        }
    }, maximizeRestore:function () {
        var layer = this, dom = layer._dom, doms = layer._doms;
        if (dom) {
            if (layer._maximized) {
                layer._maximized = false;
                layer._width = layer._originalWidth;
                layer._height = layer._originalHeight;
                layer._realWidth = layer._originalRealWidth;
                layer._realHeight = layer._originalRealHeight;
                layer._left = layer._originalLeft;
                layer._top = layer._originalTop;
                layer.resetDimension();
                if (layer._left !== undefined && layer._top !== undefined) {
                    $fly(dom).css({left:layer._left, top:layer._top});
                }
                if (layer._draggable) {
                }
            }
        }
    }, doMaximize:function () {
        var layer = this;
        layer._originalWidth = layer._width;
        layer._originalHeight = layer._height;
        layer._originalRealWidth = layer._realWidth;
        layer._originalRealHeight = layer._realHeight;
        layer._originalLeft = layer._left;
        layer._originalTop = layer._top;
        var docWidth = jQuery(window).width(), docHeight = jQuery(window).height();
        layer._maximized = true;
        layer._width = docWidth;
        layer._height = docHeight;
        layer._realWidth = layer._realHeight = undefined;
        if (layer._originalRealWidth != docWidth || layer._originalRealHeight != docHeight) {
            return true;
        }
        return false;
    }, maximize:function () {
        var layer = this, dom = layer._dom;
        if (dom) {
            var eventArg = {};
            layer.fireEvent("beforeMaximize", layer, eventArg);
            if (eventArg.processDefault === false) {
                return;
            }
            this.doMaximize();
            layer.resetDimension();
            if (layer._draggable) {
            }
            layer.fireEvent("onMaximize", layer);
        }
    }, doOnAttachToDocument:function () {
        if (this._maximized) {
            this.maximize();
        }
        $invokeSuper.call(this, arguments);
    }, refreshDom:function (dom) {
        $fly(dom).toggleClass(this._className + "-maximized", !!this._maximized);
        $invokeSuper.call(this, arguments);
    }, doShow:function (options) {
        options = options || {};
        if (!options.direction) {
            options.direction = this._slideDirection || "r2l";
        }
        document.activeElement.blur();
        var layer = this;
        layer._resizeListener = function (keyboardVisible) {
            if (keyboardVisible != undefined) {
                return;
            }
            if (layer._maximized) {
                layer.doMaximize();
                layer.resetDimension();
            }
        };
        if (dorado.bindResize) {
            dorado.bindResize(layer._resizeListener);
        }
        $invokeSuper.call(this, arguments);
        if (layer._maximized) {
            var needResetDimension = layer.doMaximize();
            if (needResetDimension) {
                layer.resetDimension();
            }
        }
    }, doHide:function () {
        $invokeSuper.call(this, arguments);
        var layer = this;
        if (layer._resizeListener && dorado.unbindResize) {
            dorado.unbindResize(layer._resizeListener);
        }
    }});
})();
(function () {
    var validItemCodes = ["|<", "<", ">", ">|", "goto", "pageSize", "info", "+", "-", "x", "|"];
    var defaultShowTextItemCodes = [];
    dorado.touch.DataPilot = $extend([dorado.widget.Control, dorado.widget.DataControl], {$className:"dorado.touch.DataPilot", ATTRIBUTES:{className:{defaultValue:"t-data-pilot"}, itemCodes:{defaultValue:"pages", setter:function (v) {
        if (this._itemCodes != v) {
            this._itemCodes = v;
            this.compileItemCodes(v);
        }
    }}, height:{independent:true, readOnly:true}, disabled:{}}, EVENTS:{onSubControlRefresh:{}, onSubControlAction:{}}, filterDataSetMessage:function (messageCode, arg, data) {
        var b = true;
        switch (messageCode) {
          case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
          case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
          case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
            var entities = this.getBindingData();
            b = (!this._entities || entities == this._entities || dorado.DataUtil.isOwnerOf(entities, arg.entityList));
            break;
          case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
            var entities = this.getBindingData();
            b = (!this._entities || entities == this._entities || dorado.DataUtil.isOwnerOf(entities, arg.entity));
            break;
          case dorado.widget.DataSet.MESSAGE_DELETED:
          case dorado.widget.DataSet.MESSAGE_INSERTED:
          case dorado.widget.DataSet.MESSAGE_LOADING_START:
          case dorado.widget.DataSet.MESSAGE_LOADING_END:
            b = false;
            break;
        }
        if (b) {
            this._entities = this.getBindingData();
        }
        return b;
    }, processDataSetMessage:function (messageCode, arg, data) {
        switch (messageCode) {
          case dorado.widget.DataSet.MESSAGE_REFRESH:
          case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
          case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
          case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
          case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
            this.refresh(true);
            break;
        }
    }, getBindingData:function (options) {
        var realOptions = {firstResultOnly:true, acceptAggregation:true};
        if (typeof options == "String") {
            realOptions.loadMode = options;
        } else {
            dorado.Object.apply(realOptions, options);
        }
        return $invokeSuper.call(this, [realOptions]);
    }, refreshDom:function (dom) {
        $invokeSuper.call(this, arguments);
        if (this._currentItemCodeExpression === undefined) {
            this.compileItemCodes();
        }
        if (this._itemCodeExpression != this._currentItemCodeExpression) {
            this._currentItemCodeExpression = this._itemCodeExpression || null;
            var itemObjects = this._itemObjects, oldItemObjects = itemObjects;
            if (itemObjects) {
                for (var p in itemObjects) {
                    var item = itemObjects[p];
                    item.unrender();
                    this.unregisterInnerControl(item);
                }
            }
            this._itemObjects = itemObjects = {};
            var itemCodes = this._compiledItemCodes;
            if (itemCodes) {
                for (var i = 0; i < itemCodes.length; i++) {
                    var itemCode = itemCodes[i];
                    var item = oldItemObjects ? oldItemObjects[itemCode.key] : null;
                    if (!item) {
                        item = this.createItem(itemCode);
                    }
                    item.render(dom);
                    this.registerInnerControl(item);
                    itemObjects[itemCode.key] = item;
                }
            }
        }
        if (!this._entities) {
            this._entities = this.getBindingData();
        }
        this.refreshItems();
    }, createItem:function (itemCode) {
        function fireOnActionEvent(code, control) {
            var eventArg = {code:code, control:control, processDefault:true};
            this.fireEvent("onSubControlAction", this, eventArg);
            return eventArg.processDefault;
        }
        function callback() {
            pilot.set("disabled", false);
        }
        var item, pilot = this;
        switch (itemCode.code) {
          case "|<":
            item = new PageButton({iconClass:itemCode.showIcon ? "icon-fast-backward" : null, tip:itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotFirstPage") : null, onClick:function (self) {
                if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                    return;
                }
                var list = pilot.getBindingData();
                if (list instanceof dorado.EntityList && list.pageNo > 1) {
                    pilot.set("disabled", true);
                    list.firstPage(callback);
                }
            }});
            break;
          case "<":
            item = new PageButton({iconClass:itemCode.showIcon ? "icon-step-backward" : null, tip:itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotPreviousPage") : null, onClick:function () {
                if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                    return;
                }
                var list = pilot.getBindingData();
                if (list instanceof dorado.EntityList && list.pageNo > 1) {
                    pilot.set("disabled", true);
                    list.previousPage(callback);
                }
            }});
            break;
          case ">":
            item = new PageButton({iconClass:itemCode.showIcon ? "icon-step-forward" : null, tip:itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotNextPage") : null, onClick:function () {
                if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                    return;
                }
                var list = pilot.getBindingData();
                if (list instanceof dorado.EntityList && list.pageNo < list.pageCount) {
                    pilot.set("disabled", true);
                    list.nextPage(callback);
                }
            }});
            break;
          case ">|":
            item = new PageButton({iconClass:itemCode.showIcon ? "icon-fast-forward" : null, tip:itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotLastPage") : null, onClick:function () {
                if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                    return;
                }
                var list = pilot.getBindingData();
                if (list instanceof dorado.EntityList && list.pageNo < list.pageCount) {
                    pilot.set("disabled", true);
                    list.lastPage(callback);
                }
            }});
            break;
          case "goto":
            item = new GotoPageControl({onAction:function (self, arg) {
                if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                    return;
                }
                var list = pilot.getBindingData();
                if (list instanceof dorado.EntityList && list.pageNo != arg.pageNo && arg.pageNo > 0 && arg.pageNo <= list.pageCount) {
                    item.set("disabled", true);
                    list.gotoPage(arg.pageNo, callback);
                } else {
                    pilot.refreshItems();
                }
            }});
            break;
          case "info":
            item = new dorado.widget.Label();
            break;
          case "pageSize":
            item = new PageSizeControl({onAction:function (self, arg) {
                if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                    return;
                }
                if (arg.pageSize > 0) {
                    var list = pilot.getBindingData();
                    if (list instanceof dorado.EntityList && list.pageSize != arg.pageSize) {
                        var parent = list.parent;
                        if (parent && parent instanceof dorado.Entity && list.parentProperty) {
                            var pd = pilot.getBindingPropertyDef();
                            if (pd) {
                                item.set("disabled", true);
                                pd.set("pageSize", arg.pageSize);
                                parent.reset(list.parentProperty);
                                return;
                            }
                        } else {
                            if (!pilot._dataPath && pilot._dataSet) {
                                item.set("disabled", true);
                                pilot._dataSet.set("pageSize", arg.pageSize);
                                pilot._dataSet.flushAsync();
                                return;
                            }
                        }
                    }
                }
                pilot.refreshItems();
            }});
            break;
          case "+":
            item = new ToolBarButton({iconClass:itemCode.showIcon ? "icon-plus" : null, caption:itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotInsert") : null, onClick:function () {
                if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                    return;
                }
                var list = pilot.getBindingData();
                if (list instanceof dorado.EntityList) {
                    list.createChild();
                }
            }});
            break;
          case "-":
            item = new ToolBarButton({iconClass:itemCode.showIcon ? "icon-minus" : null, caption:itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotDelete") : null, onClick:function () {
                if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                    return;
                }
                dorado.MessageBox.confirm($resource("dorado.baseWidget.DataPilotDeleteConfirm"), function () {
                    var list = pilot.getBindingData();
                    if (list instanceof dorado.EntityList && list.current) {
                        list.current.remove();
                    }
                });
            }});
            break;
          case "x":
            item = new ToolBarButton({iconClass:itemCode.showIcon ? "icon-remove" : null, caption:itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotCancel") : null, onClick:function () {
                if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                    return;
                }
                dorado.MessageBox.confirm($resource("dorado.baseWidget.DataPilotCancelConfirm"), function () {
                    var list = pilot.getBindingData();
                    if (list instanceof dorado.EntityList && list.current) {
                        list.current.cancel();
                    }
                });
            }});
            break;
          case "|":
            item = new dorado.touch.Seperator();
            break;
        }
        if (item) {
            item.set("style", "float: left");
        }
        return item;
    }, compileItemCodes:function () {
        var itemCodes = this._itemCodes;
        if (itemCodes && itemCodes.indexOf("pages") >= 0) {
            itemCodes = itemCodes.replace("pages", "<,>");
        }
        itemCodes = (itemCodes || "").split(",");
        var compiledItemCodes = this._compiledItemCodes = [], itemCodeExpression = "";
        for (var i = 0; i < itemCodes.length; i++) {
            var itemCode = itemCodes[i], index = itemCode.indexOf("/");
            var code, options, showIcon = true, showCaption, options = null;
            if (index > 0) {
                code = itemCode.substring(0, index);
                options = itemCode.substring(index + 1);
                if (code == "pageSize") {
                    options = parseInt(options) || 5;
                } else {
                    showIcon = (options.indexOf("i") >= 0);
                    showCaption = (options.indexOf("c") >= 0);
                    options = undefined;
                }
            } else {
                code = itemCode;
                showCaption = (defaultShowTextItemCodes.indexOf(code) >= 0);
            }
            if (validItemCodes.indexOf(code) >= 0) {
                itemCode = {code:code, showIcon:showIcon, showCaption:showCaption, options:options, key:code + "/" + (showIcon ? "i" : "") + (showCaption ? "c" : "") + i};
                compiledItemCodes.push(itemCode);
                if (itemCodeExpression.length > 0) {
                    itemCodeExpression += ",";
                }
                itemCodeExpression += itemCode.key;
            }
        }
        this._itemCodeExpression = itemCodeExpression;
    }, refreshItems:function () {
        if (this._itemObjects) {
            var itemCodes = this._compiledItemCodes;
            if (itemCodes) {
                for (var i = 0; i < itemCodes.length; i++) {
                    this.refreshItem(itemCodes[i]);
                }
            }
        }
    }, refreshItem:function (itemCode) {
        var item = this._itemObjects[itemCode.key];
        if (!item) {
            return;
        }
        var eventArg = {code:itemCode.code, control:item, processDefault:true};
        this.fireEvent("onSubControlRefresh", this, eventArg);
        if (!eventArg.processDefault) {
            return;
        }
        var list = this._entities;
        if (!(list instanceof dorado.EntityList)) {
            list = null;
        }
        var pageNo = list ? list.pageNo : 1, pageCount = list ? list.pageCount : 1, pageSize = list ? list.pageSize : 0, entityCount = list ? list.entityCount : 0;
        var current = list ? list.current : null, disabled = this._disabled;
        switch (itemCode.code) {
          case "|<":
            item.set("disabled", disabled || pageNo <= 1);
            break;
          case "<":
            item.set("disabled", disabled || pageNo <= 1);
            break;
          case ">":
            item.set("disabled", disabled || pageNo >= pageCount);
            break;
          case ">|":
            item.set("disabled", disabled || pageNo >= pageCount);
            break;
          case "goto":
            item.set({disabled:(disabled || pageCount == 1), pageNo:pageNo, pageCount:pageCount, entityCount:entityCount});
            break;
          case "info":
            var text = $resource("dorado.baseWidget.DataPilotInfo", pageNo, pageCount, entityCount);
            item.set("text", text);
            break;
          case "pageSize":
            item.set({disabled:(disabled || pageSize == 0), pageSize:pageSize});
            break;
          case "+":
            item.set("disabled", disabled || (this._dataSet ? this._dataSet._readOnly : true));
            break;
          case "-":
            item.set("disabled", disabled || !current || this._dataSet._readOnly);
            break;
          case "x":
            item.set("disabled", disabled || !current || (current.state != dorado.Entity.STATE_MODIFIED && current.state != dorado.Entity.STATE_NEW) || this._dataSet._readOnly);
            break;
        }
    }});
    var PageButton = dorado.touch.Button;
    var ToolBarButton = dorado.touch.Button;
    var GotoPageControl = $extend(dorado.widget.Control, {ATTRIBUTES:{className:{defaultValue:"d-goto-page"}, pageNo:{defaultValue:1}, pageCount:{defaultValue:1}, entityCount:{defaultValue:0}, disabled:{}}, EVENTS:{onAction:{interceptor:function (superFire, self, arg) {
        this._pageNo = arg.pageNo;
        return superFire(self, arg);
    }}}, createDom:function (dom) {
        var dom = document.createElement("SPAN");
        var gotoPage = this;
        this._labelPrefix = $DomUtils.xCreate({tagName:"SPAN", className:"text", style:"float: left"});
        dom.appendChild(this._labelPrefix);
        var spinner = this._spinner = new dorado.widget.TextEditor({dataType:"int", value:1, onPost:function (self, arg) {
            var pageNo = spinner.get("value");
            if (gotoPage._currentPageNo != pageNo) {
                gotoPage.fireEvent("onAction", gotoPage, {pageNo:pageNo});
            }
        }, width:40, style:"float: left"});
        spinner.render(dom);
        this.registerInnerControl(spinner);
        this._labelSuffix = $DomUtils.xCreate({tagName:"SPAN", className:"text", style:"float: left"});
        dom.appendChild(this._labelSuffix);
        return dom;
    }, refreshDom:function (dom) {
        $invokeSuper.call(this, arguments);
        var spinner = this._spinner;
        $fly(this._labelPrefix).text($resource("dorado.baseWidget.DataPilotGotoPagePrefix", this._pageNo, this._pageCount, this._entityCount));
        $fly(this._labelSuffix).text($resource("dorado.baseWidget.DataPilotGotoPageSuffix", this._pageNo, this._pageCount, this._entityCount));
        this._currentPageNo = this._pageNo;
        spinner.set({value:this._pageNo, readOnly:this._disabled});
    }});
    var PageSizeControl = $extend(dorado.widget.Control, {ATTRIBUTES:{className:{defaultValue:"d-page-size"}, pageSize:{defaultValue:10}, step:{defaultValue:5}, disabled:{}}, EVENTS:{onAction:{interceptor:function (superFire, self, arg) {
        this._pageSize = arg.pageSize;
        return superFire(self, arg);
    }}}, createDom:function (dom) {
        var dom = document.createElement("SPAN");
        var pageSizeControl = this;
        this._labelPrefix = $DomUtils.xCreate({tagName:"SPAN", className:"text", style:"float: left"});
        dom.appendChild(this._labelPrefix);
        var spinner = this._spinner = new dorado.widget.TextEditor({dataType:"int", onPost:function (self, arg) {
            pageSizeControl.fireEvent("onAction", pageSizeControl, {pageSize:spinner.get("value")});
        }, width:45, style:"float: left"});
        spinner.render(dom);
        this.registerInnerControl(spinner);
        return dom;
    }, refreshDom:function (dom) {
        $invokeSuper.call(this, arguments);
        var spinner = this._spinner;
        $fly(this._labelPrefix).text($resource("dorado.baseWidget.DataPilotPageSize"));
        this._currentPageSize;
        spinner.set({step:this._step, value:this._pageSize, readOnly:this._disabled});
    }});
})();
dorado.touch.SplitView = $extend(dorado.widget.Control, {$className:"dorado.touch.SplitView", ATTRIBUTES:{className:{defaultValue:"t-split-view"}, position:{defaultValue:240}, sideControl:{innerComponent:""}, mainControl:{innerComponent:""}, mainControlActive:{writeBeforeReady:true, defaultValue:false}, hideSideControlOnPortrait:{defaultValue:true, writeBeforeReady:true}, showSideControlMode:{defaultValue:"CoverPanel", writeBeforeReady:true}, backButtonCaption:{writeBeforeReady:true, defaultValue:"Back"}, orientation:{defaultValue:"landscape", setter:function (value) {
    var oldValue = this._orientation;
    this._orientation = value;
    if (oldValue && oldValue != value && this._rendered) {
        this.doOnOrientationChange();
    }
}}}, showMainControl:function () {
    var view = this;
    if (dorado.Browser.isPhone && view._mainControl) {
        view._mainControlActive = true;
        if (!view._mainControl._rendered) {
            view.renderMainPanel();
        }
        view._mainControl.set("visible", true);
        $fly(view._mainControl._dom).css("display", "");
        dorado.Fx.slideIn(view._mainControl._dom, {direction:"r2l"});
        dorado.Fx.slideOut(view._sideControl._dom, {direction:"r2l", complete:function () {
            if (view._sideControl) {
                view._sideControl.set("visible", false);
                $fly(view._sideControl._dom).css("display", "none");
            }
        }});
        view.navButton.set("visible", true);
        $fly(view.navButton._dom).css("display", "");
    }
}, hideMainControl:function () {
    var view = this;
    if (dorado.Browser.isPhone && view._mainControl) {
        view._mainControlActive = false;
        view.navButton.set("visible", false);
        $fly(view.navButton._dom).css("display", "none");
        view._sideControl.set("visible", true);
        $fly(view._sideControl._dom).css("display", "").bringToFront();
        dorado.Fx.slideOut(view._mainControl._dom, {direction:"l2r"});
        dorado.Fx.slideIn(view._sideControl._dom, {direction:"l2r"});
    }
}, hideSideControl:function () {
    var view = this;
    if (view._sideControl) {
        view._sideControl.set("visible", false);
    }
}, hideFloatSideControl:function () {
    this._floatSidePanel.hide();
}, createDom:function () {
    var view = this, dom = document.createElement("div");
    dom.className = view._className;
    view._orientation = window.orientation === 0 ? "portrait" : "landscape";
    jQuery(window).bind("orientationchange", function () {
        view.set("orientation", window.orientation === 0 ? "portrait" : "landscape");
    });
    view.navButton = new dorado.touch.Button({caption:view._backButtonCaption, type:"back", visible:view._hideSideControlOnPortrait && view._orientation == "portrait", listener:{onClick:function (self) {
        if (!dorado.Browser.isPhone) {
            var sideControl = view._sideControl;
            if (sideControl) {
                if (!sideControl._rendered) {
                    view.registerInnerControl(sideControl);
                    sideControl.render(view._dom, view._mainControl && view._mainControl._dom);
                    $fly(sideControl._dom).addClass("side-panel");
                }
                if (view._showSideControlMode == "FloatPanel") {
                    sideControl.set("visible", true);
                    $fly(sideControl._dom).css("display", "");
                    var floatSidePanel = view._floatSidePanel;
                    if (!floatSidePanel) {
                        view._floatSidePanel = new dorado.widget.FloatContainer({children:[sideControl], height:view.getRealHeight() - 100, animateType:"safeSlide", hideAnimateType:"none", onBlur:function () {
                            view.hideFloatSideControl();
                        }});
                    } else {
                        floatSidePanel.addChild(sideControl);
                    }
                    floatSidePanel.set("width", sideControl.getRealWidth());
                    floatSidePanel.set("height", view.getRealHeight() - 100);
                    sideControl.set("height", view.getRealHeight() - 100);
                    floatSidePanel.show({direction:"t2b", anchorTarget:self, vAlign:"bottom"});
                    floatSidePanel.refresh();
                } else {
                    sideControl.set("visible", true);
                    $fly(sideControl._dom).css({display:"", left:-1 * view._position}).animate({left:0}, {complete:function () {
                        view._coverPanelActive = true;
                    }});
                }
            }
        } else {
            view.hideMainControl();
        }
    }}});
    var sideControl = view._sideControl;
    if (sideControl) {
        if (!dorado.Browser.isPhone) {
            sideControl._width = view._position;
        }
        if (dorado.Browser.isPhone || !view._hideSideControlOnPortrait || view._orientation != "portrait") {
            view.registerInnerControl(sideControl);
            sideControl.render(dom);
            $fly(sideControl._dom).addClass("side-panel");
        }
    }
    if (view._mainControl) {
        if (!dorado.Browser.isPhone || view._mainControlActive) {
            view.renderMainPanel(dom);
        }
    }
    if (view._showSideControlMode == "CoverPanel") {
        $fly(dom).addClass("t-split-view-cover-mode");
    } else {
        $fly(dom).addClass("t-split-view-float-mode");
    }
    if (dorado.Browser.isPhone) {
        $fly(dom).addClass("t-split-view-phone");
    }
    if (view._hideSideControlOnPortrait) {
        $fly(dom).addClass("t-split-view-" + view._orientation);
    }
    return dom;
}, renderMainPanel:function (dom) {
    var view = this, mainControl = view._mainControl;
    if (mainControl) {
        if (dorado.Browser.isPhone) {
            mainControl._width = view.getRealWidth();
        }
        mainControl._height = view.getRealHeight();
        view.registerInnerControl(mainControl);
        mainControl.render(dom ? dom : view._dom);
        $fly(mainControl._dom).addClass("main-panel").click(function () {
            if (view._coverPanelActive) {
                $fly(view._sideControl._dom).animate({left:-1 * view._position}, {complete:function () {
                    view._sideControl.set("visible", false);
                }});
                view._coverPanelActive = false;
            }
        });
        if (mainControl._toolbar) {
            mainControl._toolbar.addItem(view.navButton);
            mainControl._toolbar.addItem(new dorado.touch.Spacer());
        }
    }
}, doOnResize:function () {
    var view = this, orientation = view._orientation, mainControl = view._mainControl, sideControl = view._sideControl;
    if (!dorado.Browser.isPhone && mainControl) {
        if (orientation == "landscape" || view._hideSideControlOnPortrait === false) {
            mainControl.set("width", view.getRealWidth() - view._position);
        } else {
            mainControl.set("width", view.getRealWidth());
        }
        mainControl.set("height", view.getRealHeight());
        sideControl.set("height", view.getRealHeight());
        mainControl.resetDimension();
        sideControl.resetDimension();
    } else {
        if (mainControl) {
            if (view._mainControlActive) {
                mainControl.set("width", view.getRealWidth());
            } else {
                if (sideControl) {
                    sideControl.set("width", view.getRealWidth());
                }
            }
            mainControl.set("height", view.getRealHeight());
            sideControl.set("height", view.getRealHeight());
            mainControl.resetDimension();
            sideControl.resetDimension();
        }
    }
    $invokeSuper.call(this, arguments);
}, doOnOrientationChange:function () {
    var view = this, orientation = view._orientation;
    if (view._hideSideControlOnPortrait) {
        $fly(view._dom).removeClass("t-split-view-landscape t-split-view-portrait").addClass("t-split-view-" + view._orientation);
    }
    if (!dorado.Browser.isPhone && view._hideSideControlOnPortrait) {
        var sideControl = view._sideControl;
        if (orientation == "landscape") {
            view.navButton.set("visible", false);
            if (sideControl) {
                var showSideControlMode = view._showSideControlMode;
                if (showSideControlMode == "FloatPanel") {
                    view._floatSidePanel && view._floatSidePanel.removeChild(sideControl);
                    sideControl._parentActualVisible = true;
                    if (sideControl instanceof dorado.widget.Container && sideControl._children) {
                        var parentActualVisible = true;
                        sideControl._children.each(function (child) {
                            if (child._parentActualVisible == parentActualVisible || !(child instanceof dorado.widget.Control)) {
                                return;
                            }
                            child._parentActualVisible = parentActualVisible;
                            child.onActualVisibleChange();
                        });
                    }
                }
                sideControl.set("visible", true);
                $fly(sideControl._dom).css({position:"", display:""});
                sideControl.render(view._dom, view._mainControl && view._mainControl._dom);
                view.registerInnerControl(sideControl);
                if (showSideControlMode == "FloatPanel") {
                    sideControl.set("height", view.getRealHeight());
                    sideControl.resetDimension();
                }
                $fly(sideControl._dom).addClass("side-panel");
            }
        } else {
            if (orientation == "portrait") {
                view.navButton.set("visible", true);
                if (sideControl) {
                    sideControl.set("visible", false);
                    $fly(sideControl._dom).css("display", "none");
                }
            }
        }
    }
    view.resetDimension();
}});
(function () {
    var hasTransform = false, vendor = (function () {
        var tmp = document.createElement("div"), prefixes = "webkit Moz O ms".split(" "), i;
        for (i in prefixes) {
            if (typeof tmp.style[prefixes[i] + "Transition"] !== "undefined") {
                hasTransform = true;
                return prefixes[i];
            }
        }
    })();
    var angleOfDrag = function (gesture) {
        var theta = Math.atan2(-gesture.deltaY, gesture.deltaX);
        if (theta < 0) {
            theta += 2 * Math.PI;
        }
        var degrees = Math.floor(theta * (180 / Math.PI) - 180);
        if (degrees < 0 && degrees > -180) {
            degrees = 360 - Math.abs(degrees);
        }
        return Math.abs(degrees);
    };
    var getMatrix = function (element, index) {
        if (!hasTransform) {
            return parseInt(element.style.left, 10);
        } else {
            var matrix = getComputedStyle(element)[vendor + "Transform"].match(/\((.*)\)/), ieOffset = 8;
            if (matrix) {
                matrix = matrix[1].split(",");
                if (matrix.length === 16) {
                    index += ieOffset;
                }
                return parseInt(matrix[index], 10);
            }
            return 0;
        }
    };
    dorado.touch.DrawerView = $extend(dorado.widget.Control, {$className:"dorado.touch.DrawerView", ATTRIBUTES:{className:{defaultValue:"t-drawer-view"}, touchToDrag:{defaultValue:true}, tapToClose:{defaultValue:true}, hyperExtensible:{defaultValue:true}, slideIntent:{defaultValue:40}, resistance:{defaultValue:0.5}, flickThreshold:{defaultValue:50}, minDragDistance:{defaultValue:5}, opening:{readOnly:true}, leftDrawer:{innerComponent:""}, rightDrawer:{innerComponent:""}, mainControl:{innerComponent:""}, leftDrawerWidth:{defaultValue:240}, rightDrawerWidth:{defaultValue:240}}, createDom:function () {
        var view = this, dom = document.createElement("div");
        dom.className = view._className;
        view.navButton = new dorado.touch.Button({caption:"Open", onTap:function (self, event) {
            if (view._leftDrawer && view._leftDrawer._dom && view._opening) {
                view.hideDrawer();
            } else {
                view.showDrawer();
            }
        }});
        var leftDrawer = view._leftDrawer, rightDrawer = view._rightDrawer;
        if (leftDrawer) {
            leftDrawer._width = view._leftDrawerWidth;
            leftDrawer._height = view.getRealHeight();
            view.registerInnerControl(leftDrawer);
            leftDrawer.render(dom);
            $fly(leftDrawer._dom).addClass("left-drawer");
        }
        if (rightDrawer) {
            rightDrawer._width = view._rightDrawerWidth;
            rightDrawer._height = view.getRealHeight();
            view.registerInnerControl(rightDrawer);
            rightDrawer.render(dom);
            $fly(rightDrawer._dom).addClass("right-drawer");
        }
        if (view._mainControl) {
            view.renderMainPanel(dom);
        }
        return dom;
    }, doOnResize:function () {
        var height = this.getRealHeight();
        if (this._leftDrawer) {
            this._leftDrawer.set("height", height);
        }
        if (this._rightDrawer) {
            this._rightDrawer.set("height", height);
        }
        if (this._mainControl) {
            this._mainControl.set("height", height);
            this._mainControl.refresh();
        }
    }, showDrawer:function (side) {
        var view = this;
        side = side || "left";
        if (side === "left") {
            this.translateMainControl(view._leftDrawerWidth, true, function () {
                view._opening = "left";
            });
        } else {
            if (side === "right") {
                this.translateMainControl(-1 * view._rightDrawerWidth, true, function () {
                    view._opening = "right";
                });
            }
        }
    }, hideDrawer:function () {
        var view = this;
        if (view._mainControl && view._mainControl._rendered) {
            view.translateMainControl(0, true, function () {
                view._opening = "";
            });
        }
    }, refreshDom:function () {
        $invokeSuper.call(this, arguments);
        if (this._leftDrawer && !this._rightDrawer) {
            this._disable = "right";
        } else {
            if (!this._leftDrawer && this._rightDrawer) {
                this._disable = "left";
            }
        }
    }, translateMainControl:function (left, animate, callback) {
        var view = this, element = this._mainControl && this._mainControl._dom, cache = view._cache;
        if (!element) {
            return;
        }
        if ((view._disable === "left" && left > 0) || (view._disable === "right" && left < 0)) {
            return;
        }
        if (!view._hyperExtensible) {
            if (left === view._leftDrawerWidth || left > view._leftDrawerWidth) {
                left = view._leftDrawerWidth;
            } else {
                if (left === -1 * view._rightDrawerWidth || left < -1 * view._rightDrawerWidth) {
                    left = -1 * view._rightDrawerWidth;
                }
            }
        }
        left = parseInt(left, 10);
        if (isNaN(left)) {
            left = 0;
        }
        if (animate) {
            if (cache && cache.translation == left) {
                left += 0.000001;
            }
            jQuery(element).anim({}, 0.3, "ease", function () {
                if (cache) {
                    cache.translation = getMatrix(element, 4);
                }
                if (typeof callback == "function") {
                    callback();
                }
                $fly(element).css({"transition":"", "-webkit-transition":"", "-moz-transition":""});
            });
        }
        dorado.Fx.translateElement(element, left, null);
    }, renderMainPanel:function (dom) {
        var view = this, mainControl = view._mainControl;
        if (mainControl) {
            mainControl._width = view.getRealWidth();
            mainControl._height = view.getRealHeight();
            view.registerInnerControl(view._mainControl);
            mainControl.render(dom ? dom : view._dom);
            if (mainControl._toolbar) {
            }
            var mainControlDom = mainControl._dom;
            $fly(mainControlDom).addClass("main-control");
            var cache = {translation:0}, dragWatchers, leftDrawer, rightDrawer, states = {opening:null, towards:null, hyperExtending:null, halfway:null, flick:null};
            view._cache = cache;
            view._states = states;
            $fly(mainControlDom).hammer({transform:false, dragMinDistance:view._minDragDistance || 5}).bind("dragstart", function (event) {
                var gesture = event.gesture;
                mainControlDom.style[vendor + "Transition"] = "";
                leftDrawer = view._leftDrawer;
                rightDrawer = view._rightDrawer;
                cache.isDragging = true;
                cache.hasIntent = null;
                cache.intentChecked = false;
                cache.leftDrawerVisible = null;
                cache.rightDrawerVisible = null;
                dragWatchers = {current:0, last:0, hold:0, state:""};
                states = {opening:null, towards:null, hyperExtending:null, halfway:null, flick:null};
                if (cache.hasIntent === false || cache.hasIntent === null) {
                    var deg = angleOfDrag(gesture), slideIntent = view._slideIntent, inRightRange = (deg >= 0 && deg <= slideIntent) || (deg <= 360 && deg > (360 - slideIntent)), inLeftRange = (deg >= 180 && deg <= (180 + slideIntent)) || (deg <= 180 && deg >= (180 - slideIntent));
                    if (!inLeftRange && !inRightRange) {
                        cache.hasIntent = false;
                    } else {
                        cache.hasIntent = true;
                    }
                    cache.intentChecked = true;
                }
            }).bind("drag", function (event) {
                if (cache.isDragging && view._touchToDrag) {
                    if ((cache.intentChecked && !cache.hasIntent)) {
                        return;
                    }
                    event.preventDefault();
                    var gesture = event.gesture, center = gesture.center, thePageX = center.pageX, translated = cache.translation, translation = getMatrix(mainControlDom, 4), openingLeft = translation > 0, deltaX = gesture.deltaX, translateTo = deltaX, diff;
                    if (leftDrawer && rightDrawer) {
                        if (openingLeft && cache.leftDrawerVisible !== true) {
                            $fly(leftDrawer._dom).css("display", "");
                            $fly(rightDrawer._dom).css("display", "none");
                            cache.leftDrawerVisible = true;
                            cache.rightDrawerVisible = false;
                        }
                        if (!openingLeft && cache.rightDrawerVisible !== true) {
                            $fly(leftDrawer._dom).css("display", "none");
                            $fly(rightDrawer._dom).css("display", "");
                            cache.leftDrawerVisible = false;
                            cache.rightDrawerVisible = true;
                        }
                    }
                    dragWatchers.current = thePageX;
                    if (dragWatchers.last > thePageX) {
                        if (dragWatchers.state !== "left") {
                            dragWatchers.state = "left";
                            dragWatchers.hold = thePageX;
                        }
                        dragWatchers.last = thePageX;
                    } else {
                        if (dragWatchers.last < thePageX) {
                            if (dragWatchers.state !== "right") {
                                dragWatchers.state = "right";
                                dragWatchers.hold = thePageX;
                            }
                            dragWatchers.last = thePageX;
                        }
                    }
                    var leftDrawerWidth = view._leftDrawerWidth, rightDrawerWidth = view._rightDrawerWidth, resistance = view._resistance, flickThreshold = view._flickThreshold;
                    if (openingLeft) {
                        if (leftDrawerWidth < translation) {
                            diff = (translation - leftDrawerWidth) * resistance;
                            translateTo = deltaX - diff;
                        }
                        states = {opening:"left", towards:dragWatchers.state, hyperExtending:leftDrawerWidth < translation, halfway:translation > (leftDrawerWidth / 2), flick:Math.abs(dragWatchers.current - dragWatchers.hold) > flickThreshold};
                    } else {
                        if (rightDrawerWidth * -1 > translation) {
                            diff = (translation - rightDrawerWidth * -1) * resistance;
                            translateTo = deltaX - diff;
                        }
                        states = {opening:"right", towards:dragWatchers.state, hyperExtending:-1 * rightDrawerWidth > translation, halfway:translation < (-1 * rightDrawerWidth / 2), flick:Math.abs(dragWatchers.current - dragWatchers.hold) > flickThreshold};
                    }
                    view.translateMainControl(translateTo + translated);
                }
            }).bind("dragend", function (event) {
                if (cache.isDragging) {
                    if (states.opening === "left") {
                        if (states.halfway || states.hyperExtending || states.flick) {
                            if (states.flick && states.towards === "left") {
                                view.translateMainControl(0, true, function () {
                                    view._opening = "";
                                });
                            } else {
                                if ((states.flick && states.towards === "right") || (states.halfway || states.hyperExtending)) {
                                    view.translateMainControl(view._leftDrawerWidth, true, function () {
                                        view._opening = "left";
                                    });
                                }
                            }
                        } else {
                            view.translateMainControl(0, true, function () {
                                view._opening = "";
                            });
                        }
                    } else {
                        if (states.opening === "right") {
                            if (states.halfway || states.hyperExtending || states.flick) {
                                if (states.flick && states.towards === "right") {
                                    view.translateMainControl(0, true, function () {
                                        view._opening = "";
                                    });
                                } else {
                                    if ((states.flick && states.towards === "left") || (states.halfway || states.hyperExtending)) {
                                        view.translateMainControl(-1 * view._rightDrawerWidth, true, function () {
                                            view._opening = "right";
                                        });
                                    }
                                }
                            } else {
                                view.translateMainControl(0, true, function () {
                                    view._opening = "";
                                });
                            }
                        }
                    }
                    cache.isDragging = false;
                }
            }).bind("tap", function (event) {
                dorado.preventGhostClick(event);
                if (view._tapToClose && view._opening) {
                    view.translateMainControl(0, true, function () {
                        view._opening = "";
                    });
                    cache.isDragging = false;
                }
            });
        }
    }});
})();
dorado.touch.Toggle = $extend(dorado.widget.AbstractDataEditor, {$className:"dorado.touch.Toggle", ATTRIBUTES:{className:{defaultValue:"t-toggle"}, width:{independent:true}, height:{independent:true}, onValue:{defaultValue:true}, offValue:{defaultValue:false}, value:{defaultValue:false, getter:function () {
    return this._checked ? this._onValue : ((this._checked === null || this._checked === undefined) ? this._mixedValue : this._offValue);
}, setter:function (v) {
    if (this._onValue === v) {
        this._checked = true;
    } else {
        if (this._offValue === v) {
            this._checked = false;
        } else {
            this._checked = null;
        }
    }
}}, checked:{defaultValue:false, setter:function (value) {
    this._checked = !!value;
}}}, EVENTS:{onValueChange:{}}, onTap:function () {
    var toggle = this;
    if (toggle._readOnly || this._readOnly2) {
        return;
    }
    var checked = toggle._checked;
    toggle._checked = !toggle._checked;
    try {
        toggle.post();
    }
    catch (e) {
        toggle._checked = checked;
        throw e;
    }
    toggle.refresh();
    toggle.fireEvent("onValueChange", toggle);
}, initDragRange:function () {
    var toggle = this, dom = toggle._dom;
    if (!toggle._dragRange) {
        var $dom = $fly(dom), clientWidth = $dom.width(), max = clientWidth - toggle._doms.thumb.offsetWidth;
        if (!isNaN(max) && max > 0) {
            toggle._dragRange = [0, max];
        }
    }
    return toggle._dragRange;
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var toggle = this, checked = toggle._checked;
    toggle.refreshExternalReadOnly();
    $fly(dom)[(toggle._readOnly || toggle._readOnly2) ? "addClass" : "removeClass"](toggle._className + "-readonly");
    if (toggle._dataSet) {
        checked = undefined;
        var value, dirty;
        if (toggle._property) {
            var bindingInfo = toggle._bindingInfo;
            var dt = bindingInfo.dataType;
            if (dt) {
                var config;
                switch (dt._code) {
                  case dorado.DataType.BOOLEAN:
                    config = {};
                    break;
                  case dorado.DataType.PRIMITIVE_INT:
                  case dorado.DataType.PRIMITIVE_FLOAT:
                    config = {offValue:0, onValue:1};
                    break;
                  case dorado.DataType.INTEGER:
                  case dorado.DataType.FLOAT:
                    config = {offValue:0, onValue:1};
                    break;
                }
                if (config) {
                    this.set(config, {preventOverwriting:true});
                }
            }
            if (bindingInfo.entity instanceof dorado.Entity) {
                value = bindingInfo.entity.get(toggle._property);
                dirty = bindingInfo.entity.isDirty(toggle._property);
            }
        }
        value += "";
        if (value == (toggle._onValue + "")) {
            checked = true;
        } else {
            if (value == (toggle._offValue + "")) {
                checked = false;
            }
        }
        toggle._checked = checked;
        toggle.setDirty(dirty);
    }
    toggle.initDragRange();
    if (checked) {
        if (toggle._dragRange) {
            toggle._doms.thumb.style.webkitTransform = "translate3d(" + toggle._dragRange[1] + "px, 0px, 0px)";
        }
    } else {
        toggle._doms.thumb.style.webkitTransform = "";
    }
    $fly(dom).toggleClass(toggle._className + "-on", !!checked);
    var readyClass = toggle._className + "-ready";
    if (!$fly(dom).hasClass(readyClass)) {
        setTimeout(function () {
            $fly(dom).addClass(readyClass);
        }, 0);
    }
}, createDom:function () {
    var toggle = this, doms = {}, dom = $DomUtils.xCreate({tagName:"span", className:this._className, content:{tagName:"span", className:"thumb", contextKey:"thumb"}}, null, doms);
    toggle._doms = doms;
    var state = null, activeClass = null, dragRange;
    $fly(doms.thumb).hammer({dragMinDistance:3, transform:false}).bind("dragstart", function (event) {
        if (toggle._readOnly || toggle._readOnly2) {
            return;
        }
        activeClass = toggle._className + "-on";
        if ($fly(dom).hasClass(activeClass)) {
            state = "on";
        } else {
            state = "off";
        }
    }).bind("drag", function (event) {
        event.stopPropagation();
        if (toggle._readOnly || toggle._readOnly2) {
            return;
        }
        dragRange = toggle._dragRange || toggle.initDragRange() || [];
        var transform, min = dragRange[0] || 0, max = dragRange[1] || 0;
        if (state == "on") {
            transform = max + event.gesture.deltaX;
        } else {
            transform = min + event.gesture.deltaX;
        }
        if (transform < min) {
            transform = 0;
        } else {
            if (transform > max) {
                transform = max;
            }
        }
        if (transform > max / 2) {
            $fly(dom).addClass(activeClass);
        } else {
            $fly(dom).removeClass(activeClass);
        }
        doms.thumb.style.webkitTransform = "translate3d(" + transform + "px, 0px, 0px)";
    }).bind("dragend", function () {
        if (toggle._readOnly || toggle._readOnly2) {
            return;
        }
        doms.thumb.style.webkitTransform = "translate3d(" + dragRange[$fly(dom).hasClass(activeClass) ? 1 : 0] + "px, 0px, 0px)";
        activeClass = null;
        dragRange = null;
        state = null;
    });
    $fly(dom).hammer({drag:false, transform:false}).on("tap", function (event) {
        dorado.preventGhostClick(event);
        toggle.onTap();
    });
    return dom;
}});
dorado.touch.NumberSpinner = $extend(dorado.widget.AbstractDataEditor, {$className:"dorado.touch.NumberSpinner", ATTRIBUTES:{className:{defaultValue:"t-spinner"}, width:{defaultValue:160}, height:{independent:true}, min:{defaultValue:-2147483648}, max:{defaultValue:2147483648}, step:{defaultValue:1}, textPattern:{defaultValue:"{value}"}, text:{skipRefresh:true, defaultValue:0, getter:function () {
    return this.doGetText();
}, setter:function (text) {
    this.doSetText(text);
}}, value:{getter:function () {
    var value = parseInt(this.get("text"), 10);
    return this.getValidValue(value);
}, setter:function (value) {
    value = this.getValidValue(value);
    this._value = value;
    this.doSetText((value != null) ? (value + "") : "");
}}, postValueOnSpin:{defaultValue:true}}, createDom:function () {
    var spinner = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:this._className, content:[{tagName:"div", className:"button down-button", contextKey:"downButton", content:{tagName:"div", className:"icon"}}, {tagName:"div", className:"button up-button", contextKey:"upButton", content:{tagName:"div", className:"icon"}}, {tagName:"div", className:"editor-wrap", content:{tagName:"input", type:"text", className:"editor", contextKey:"editor"}}]}, null, doms);
    spinner._doms = doms;
    $fly(doms.downButton).bind("click", function () {
        if (!(spinner._readOnly || spinner._readOnly2)) {
            spinner.doStepDown();
        }
    });
    $fly(doms.upButton).bind("click", function () {
        if (!(spinner._readOnly || spinner._readOnly2)) {
            spinner.doStepUp();
        }
    });
    doms.editor.setAttribute("form", dorado.widget.editor.GET_DEAMON_FORM().id);
    return dom;
}, doGetText:function () {
    return (this._doms.editor) ? this._doms.editor.value : this._text;
}, doSetText:function (text) {
    if (this._doms.editor) {
        this._doms.editor.value = text;
    } else {
        this._text = text;
    }
}, getValidValue:function (value) {
    if (isNaN(value)) {
        value = "";
    } else {
        if (value != null) {
            if (value > this._max) {
                value = this._max;
            } else {
                if (value < this._min) {
                    value = this._min;
                }
            }
        }
    }
    return value;
}, post:function () {
    var value1 = parseInt(this.get("text"), 10);
    var value2 = this.getValidValue(value1);
    if (value2 !== value1) {
        this.set("value", value2);
    }
    $invokeSuper.call(this, arguments);
}, doStepUp:function () {
    var spinner = this, value = spinner.get("value") || 0, step = spinner.get("step") || 1;
    if (!isNaN(value)) {
        value += step;
        if (this._max !== undefined && value > this._max) {
            return;
        }
        spinner.set("value", value);
        if (spinner._postValueOnSpin) {
            spinner.post();
        }
    }
}, doStepDown:function () {
    var spinner = this, value = spinner.get("value") || 0, step = spinner.get("step") || 1;
    if (!isNaN(value)) {
        value -= step;
        if (this._min !== undefined && value < this._min) {
            return;
        }
        spinner.set("value", value);
        if (spinner._postValueOnSpin) {
            spinner.post();
        }
    }
}, formatValue:function (value) {
    var format = this._textPattern || "{value}";
    return format.replace("{value}", value);
}, refreshDom:function () {
    $invokeSuper.call(this, arguments);
    var spinner = this, dom = spinner._dom;
    var doms = spinner._doms, editorEl = doms.editor, value;
    this.refreshExternalReadOnly();
    $fly(dom)[spinner._readOnly || spinner._readOnly2 ? "addClass" : "removeClass"](spinner._className + "-readonly");
    editorEl.readOnly = (spinner._readOnly || spinner._readOnly2);
    if (spinner._dataSet) {
        if (spinner._property) {
            var bindingInfo = spinner._bindingInfo;
            if (bindingInfo.entity instanceof dorado.Entity) {
                value = bindingInfo.entity.get(spinner._property);
            }
        }
    } else {
        value = spinner.get("value");
    }
    if (value != undefined) {
        value = isNaN(value) ? 0 : value;
        editorEl.value = spinner.formatValue(value);
    } else {
        editorEl.value = "";
    }
}});
dorado.touch.Slider = $extend(dorado.widget.Control, {ATTRIBUTES:{className:{defaultValue:"t-slider"}, width:{defaultValue:300}, height:{independent:true}, orientation:{defaultValue:"horizontal"}, minValue:{defaultValue:0, setter:function (value) {
    var parseValue = parseFloat(value);
    if (isNaN(parseValue)) {
        throw new dorado.ResourceException("dorado.baseWidget.NumberFormatInvalid", value);
    }
    this._minValue = parseValue;
}}, maxValue:{defaultValue:100, setter:function (value) {
    var parseValue = parseFloat(value);
    if (isNaN(parseValue)) {
        throw new dorado.ResourceException("dorado.baseWidget.NumberFormatInvalid", value);
    }
    this._maxValue = parseValue;
}}, value:{setter:function (value) {
    var slider = this, minValue = slider._minValue, maxValue = slider._maxValue, parseValue = parseFloat(value);
    if (isNaN(parseValue)) {
        throw new dorado.ResourceException("dorado.baseWidget.NumberFormatInvalid", value);
    }
    if (parseValue < minValue || parseValue > maxValue) {
        throw new dorado.ResourceException("dorado.baseWidget.NumberRangeInvalid", minValue, maxValue, value);
    }
    value = slider.getValidValue(parseValue);
    var eventArg = {value:slider._value};
    slider.fireEvent("beforeValueChange", slider, eventArg);
    if (eventArg.processDefault === false) {
        slider.refresh();
    }
    slider._value = value;
    slider.fireEvent("onValueChange", slider);
}}, precision:{defaultValue:0}, step:{}}, EVENTS:{beforeValueChange:{}, onValueChange:{}}, constructor:function (config) {
    config = config || {};
    var value = config.value;
    delete config.value;
    $invokeSuper.call(this, arguments);
    if (value) {
        this.set({value:value});
    }
}, createDom:function () {
    var slider = this, doms = {}, orientation = slider._orientation, dom = $DomUtils.xCreate({tagName:"div", className:this._className, content:[{tagName:"div", className:"slider-body", contextKey:"body"}, {tagName:"div", className:"slider-current", contextKey:"current"}, {tagName:"div", className:"slider-thumb", contextKey:"thumb"}]}, null, doms);
    slider._doms = doms;
    var startTranslate, thumbSize, dragMin, dragMax, current;
    $fly(doms.thumb).hammer({transform:false}).bind("dragstart", function (event) {
        $fly(dom).addClass("dragging");
        startTranslate = dorado.Fx.getElementTranslate(doms.thumb);
        if (orientation == "horizontal") {
            thumbSize = $fly(doms.thumb).width();
            dragMin = 0;
            dragMax = dom.clientWidth - thumbSize;
        } else {
            thumbSize = $fly(doms.thumb).height();
            dragMin = 0;
            dragMax = dom.clientHeight - thumbSize;
        }
    }).bind("drag", function (event) {
        if (orientation == "horizontal") {
            var deltaX = event.gesture.deltaX;
            current = startTranslate.left + deltaX;
            if (current < dragMin) {
                current = dragMin;
            } else {
                if (current > dragMax) {
                    current = dragMax;
                }
            }
            $fly(doms.current).width(current + thumbSize / 2);
            dorado.Fx.translateElement(doms.thumb, current, null);
        } else {
            var deltaY = event.gesture.deltaY;
            current = startTranslate.top + deltaY;
            if (current < dragMin) {
                current = dragMin;
            } else {
                if (current > dragMax) {
                    current = dragMax;
                }
            }
            $fly(doms.current).height(current + thumbSize / 2);
            dorado.Fx.translateElement(doms.thumb, null, current);
        }
    }).bind("dragend", function (event) {
        $fly(dom).removeClass("dragging");
        var minValue = slider._minValue, maxValue = slider._maxValue, totalSize;
        if (orientation == "horizontal") {
            totalSize = $fly(dom).width() - thumbSize;
        } else {
            totalSize = $fly(dom).height() - thumbSize;
        }
        slider.set("value", (maxValue - minValue) * current / totalSize + minValue);
    });
    $fly(dom).hammer({transform:false}).bind("tap", function (event) {
        dorado.preventGhostClick(event);
        var target = event.target || event.srcElement;
        if (target.className.indexOf("slider-thumb") != -1) {
            return;
        }
        var dom = slider._dom, doms = slider._doms, center = event.gesture.center, pageX = center.pageX, pageY = center.pageY, position = $fly(dom).offset(), offset, size, thumbSize;
        if (slider._orientation == "horizontal") {
            size = $fly(dom).innerWidth();
            thumbSize = $fly(doms.thumb).outerWidth();
            offset = pageX - position.left;
        } else {
            size = $fly(dom).innerHeight();
            thumbSize = $fly(doms.thumb).outerHeight();
            offset = pageY - position.top;
        }
        var percent = (offset - thumbSize / 2) / (size - thumbSize);
        if (percent < 0) {
            percent = 0;
        } else {
            if (percent > 1) {
                percent = 1;
            }
        }
        slider.set("value", (slider._maxValue - slider._minValue) * percent);
    });
    return dom;
}, getValidValue:function (value) {
    function formatDecimal(value, precision) {
        if (precision == null) {
            precision = 0;
        }
        var result = value * Math.pow(10, precision);
        if (result - Math.floor(result) >= 0.5) {
            return (Math.floor(result) + 1) / Math.pow(10, precision);
        } else {
            return Math.floor(result) / Math.pow(10, precision);
        }
    }
    var slider = this, step = slider._step, result, minValue = slider._minValue, maxValue = slider._maxValue;
    if (value != undefined) {
        result = formatDecimal(value, slider._precision);
        if (step != null) {
            var total = (maxValue - minValue) / step, left = Math.floor((result - minValue) / step), right = left + 1;
            if (right > total) {
                result = formatDecimal(maxValue, slider._precision);
            } else {
                if (Math.abs(minValue + step * right - result) > Math.abs(minValue + step * left - result)) {
                    result = formatDecimal(minValue + step * left, slider._precision);
                } else {
                    result = formatDecimal(minValue + step * right, slider._precision);
                }
            }
        }
        return result;
    }
    return null;
}, doOnResize:function () {
    if (!this._ready) {
        return;
    }
    this.refresh();
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var slider = this, doms = slider._doms, orientation = slider._orientation, maxValue = slider._maxValue, minValue = slider._minValue, value = slider._value, thumbSize, step = slider._step, handleIncrease = (step != null), stepCount;
    $fly(dom).addClass(this._className + "-" + orientation);
    if (value == null) {
        value = minValue;
    }
    if (handleIncrease) {
        stepCount = (maxValue - minValue) / step;
        if (stepCount - Math.floor(stepCount) > 1e-11) {
            handleIncrease = false;
        }
    }
    if (orientation == "vertical") {
        thumbSize = $fly(doms.thumb).height();
        var height = $fly(dom).innerHeight();
        $fly(doms.body).height(height);
        dorado.Fx.translateElement(doms.thumb, null, (height - thumbSize) * (value - minValue) / (maxValue - minValue));
        $fly(doms.current).height((height - thumbSize) * (value - minValue) / (maxValue - minValue) + thumbSize / 2);
        if (handleIncrease) {
        }
    } else {
        thumbSize = $fly(doms.thumb).width();
        var width = $fly(dom).innerWidth();
        dorado.Fx.translateElement(doms.thumb, (width - thumbSize) * (value - minValue) / (maxValue - minValue), null);
        $fly(doms.current).width((width - thumbSize) * (value - minValue) / (maxValue - minValue) + thumbSize / 2);
        if (handleIncrease) {
        }
    }
}});
(function () {
    var icons = {WARNING:"warning-icon", ERROR:"error-icon", INFO:"info-icon", QUESTION:"question-icon", "warning-icon":"warning-icon", "error-icon":"error-icon", "info-icon":"info-icon", "question-icon":"question-icon"};
    dorado.MessageBox = {_runStack:[], defaultTitle:"MessageBox", minWidth:240, maxWidth:500, OK:["ok"], CANCEL:["cancel"], OKCANCEL:["ok", "cancel"], YESNO:["yes", "no"], YESNOCANCEL:["yes", "no", "cancel"], WARNING_ICON:"warning-icon", ERROR_ICON:"error-icon", INFO_ICON:"info-icon", QUESTION_ICON:"question-icon", HIGHLIGHT_BUTTONS:["ok", "yes"], SINGLE_EDITOR:null, buttonText:{ok:"dorado.baseWidget.MessageBoxButtonOK", cancel:"dorado.baseWidget.MessageBoxButtonCancel", yes:"dorado.baseWidget.MessageBoxButtonYes", no:"dorado.baseWidget.MessageBoxButtonNo"}, onButtonTap:function (buttonIndex) {
        var buttonId;
        if (dorado.MessageBox._runStack.length > 0) {
            var config = dorado.MessageBox._runStack[0];
            if (buttonIndex == "close") {
                if (config.closeAction) {
                    buttonId = config.closeAction;
                } else {
                    buttonIndex = config.buttons[config.buttons.length - 1];
                }
            }
            if (typeof config.detailCallback == "function" || typeof config.callback == "function") {
                if (!buttonId) {
                    buttonId = config.buttons[buttonIndex];
                }
                var text = null;
                if (config.editor != "none") {
                    if (buttonId != "ok") {
                        text = "";
                    } else {
                        switch (config.editor) {
                          case "single":
                            text = dorado.MessageBox.SINGLE_EDITOR.get("value");
                            break;
                          case "multiple":
                            text = dorado.MessageBox.TEXTAREA.get("value");
                            break;
                        }
                    }
                }
                if (typeof config.callback == "function" && (buttonId == "yes" || buttonId == "ok")) {
                    config.callback.apply(null, [text]);
                }
                if (typeof config.detailCallback == "function") {
                    config.detailCallback.apply(null, [buttonId, text]);
                }
            }
            dorado.MessageBox._runStack.splice(0, 1);
        }
        dorado.MessageBox._dialog.hide();
    }, getDialog:function () {
        if (!dorado.MessageBox._dialog) {
            var dialog = dorado.MessageBox._dialog = new dorado.touch.Dialog({floating:true, focusAfterShow:true, animateType:"none", anchorTarget:window, align:"center", vAlign:"center", modal:true, width:dorado.MessageBox.maxWidth, autoHeight:true, exClassName:"t-message-box", visible:false, closeAction:"hide", buttons:[new dorado.touch.Button({onTap:function () {
                dorado.MessageBox.onButtonTap(0);
            }}), new dorado.touch.Button({onTap:function () {
                dorado.MessageBox.onButtonTap(1);
            }}), new dorado.touch.Button({onTap:function () {
                dorado.MessageBox.onButtonTap(2);
            }})]});
            dorado.MessageBox._dialog.doOnAttachToDocument = function () {
                var dialog = this, dom = dialog.getContentContainer(), doms = dialog._doms;
                if (!doms) {
                    doms = dialog._doms = {};
                }
                if (dom) {
                    var lastIcon = dorado.MessageBox._lastIcon || "";
                    dom.appendChild($DomUtils.xCreate({tagName:"div", className:"msg-content", contextKey:"msgContent", content:[{tagName:"div", className:"msg-icon " + lastIcon, contextKey:"msgIcon"}, {tagName:"div", className:"msg-text", contextKey:"msgText", content:dorado.MessageBox._lastText}]}, null, doms));
                    var editorWrap = $DomUtils.xCreate({tagName:"div", className:"editor-wrap"});
                    doms.editorWrap = editorWrap;
                    var editor = new dorado.widget.TextEditor();
                    editor.render(editorWrap);
                    $fly(editor._dom).css("display", "none");
                    dorado.MessageBox.SINGLE_EDITOR = editor;
                    dialog.registerInnerControl(editor);
                    dom.appendChild(editorWrap);
                    var textareaWrap = $DomUtils.xCreate({tagName:"div", className:"textarea-wrap"});
                    doms.textareaWrap = textareaWrap;
                    var textarea = new dorado.widget.TextArea();
                    textarea.render(textareaWrap);
                    $fly(textarea._dom).css("display", "none");
                    dorado.MessageBox.TEXTAREA = textarea;
                    dialog.registerInnerControl(textarea);
                    dom.appendChild(textareaWrap);
                    dorado.MessageBox.updateText(dorado.MessageBox._lastText, dorado.MessageBox._lastIcon, dorado.MessageBox._lastEditor, dorado.MessageBox._lastValue);
                }
                dialog.addListener("beforeShow", function (self) {
                    var dom = self._dom;
                    $fly(dom).width(dorado.MessageBox.maxWidth);
                    var doms = self._doms, contentWidth = $fly(doms.msgText).outerWidth(true) + $fly(doms.msgIcon).outerWidth(true);
                    var dialogWidth = $fly(dom).width(), msgContentWidth = $fly(doms.msgContent).width();
                    contentWidth = contentWidth + dialogWidth - msgContentWidth;
                    if (contentWidth < dorado.MessageBox.minWidth) {
                        contentWidth = dorado.MessageBox.minWidth;
                    } else {
                        if (contentWidth > dorado.MessageBox.maxWidth) {
                            contentWidth = dorado.MessageBox.maxWidth;
                        }
                    }
                    self._width = contentWidth;
                    $fly(dom).width(self._width);
                    self._height = null;
                    self.onResize();
                });
                dialog.addListener("onShow", function (self) {
                    var buttons = self._buttons, button;
                    if (buttons) {
                        button = buttons[0];
                        if (button && button._dom.display != "none") {
                        }
                    }
                });
                dialog.addListener("beforeHide", function (self, arg) {
                    if (dorado.MessageBox._runStack.length > 0) {
                        arg.processDefault = false;
                        dorado.MessageBox.doShow(dorado.MessageBox._runStack[0]);
                    }
                });
                dialog.addListener("beforeClose", function (self, arg) {
                    dorado.MessageBox.onButtonTap("close");
                    arg.processDefault = false;
                });
            };
        }
        return dorado.MessageBox._dialog;
    }, alert:function (msg, options) {
        if (typeof options == "function") {
            var callback = options;
            options = {callback:callback};
        } else {
            options = options || {};
        }
        options.icon = options.icon == null ? dorado.MessageBox.INFO_ICON : options.icon;
        options.message = msg;
        options.buttons = dorado.MessageBox.OK;
        options.closeAction = "ok";
        dorado.MessageBox.show(options);
    }, confirm:function (msg, options) {
        if (typeof options == "function") {
            var callback = options;
            options = {callback:callback};
        } else {
            options = options || {};
        }
        options.icon = options.icon == null ? dorado.MessageBox.QUESTION_ICON : options.icon;
        options.message = msg;
        options.buttons = dorado.MessageBox.YESNO;
        options.closeAction = "no";
        dorado.MessageBox.show(options);
    }, prompt:function (msg, options) {
        if (typeof options == "function") {
            var callback = options;
            options = {callback:callback};
        } else {
            options = options || {};
        }
        options.message = msg;
        options.buttons = dorado.MessageBox.OKCANCEL;
        options.closeAction = "cancel";
        options.editor = "single";
        dorado.MessageBox.show(options);
    }, promptMultiline:function (msg, options) {
        if (typeof options == "function") {
            var callback = options;
            options = {callback:callback};
        } else {
            options = options || {};
        }
        options.message = msg;
        options.buttons = dorado.MessageBox.OKCANCEL;
        options.closeAction = "cancel";
        options.editor = "multiple";
        dorado.MessageBox.show(options);
    }, resetEditorWidth:function (editor) {
        var dialog = dorado.MessageBox.getDialog(), doms = dialog._doms, width;
        if (editor == "multiple" && dorado.MessageBox.TEXTAREA) {
            width = $fly(doms.textareaWrap).outerWidth();
            dorado.MessageBox.TEXTAREA.set("width", width);
        } else {
            if (editor == "single" && dorado.MessageBox.SINGLE_EDITOR) {
                width = $fly(doms.editorWrap).outerWidth();
                dorado.MessageBox.SINGLE_EDITOR.set("width", width);
            }
        }
    }, updateText:function (text, icon, editor, value) {
        var dialog = dorado.MessageBox.getDialog(), doms = dialog._doms;
        dorado.MessageBox._lastText = text;
        dorado.MessageBox._lastIcon = icon;
        dorado.MessageBox._lastEditor = editor;
        dorado.MessageBox._lastValue = value;
        if (!doms) {
            return;
        }
        text += "";
        if (text) {
            text = text.replace(/&/g, "&amp;").replace(/[<>\"\n]/g, function ($1) {
                switch ($1) {
                  case "<":
                    return "&lt;";
                  case ">":
                    return "&gt;";
                  case "\n":
                    return "<br/>";
                  case "\"":
                    return "&quot;";
                }
            });
        }
        $fly(doms.msgText).html(text || "&nbsp;");
        $fly(doms.msgIcon).prop("className", "msg-icon");
        if (icon in icons) {
            icon = icons[icon];
        }
        if (icon) {
            $fly(doms.msgIcon).addClass(icon).css("display", "");
            $fly(doms.msgContent).addClass("msg-content-hasicon");
        } else {
            $fly(doms.msgIcon).css("display", "none");
            $fly(doms.msgContent).removeClass("msg-content-hasicon");
        }
        if (dorado.MessageBox.SINGLE_EDITOR) {
            switch (editor) {
              case "none":
                $fly(doms.editorWrap).css("display", "none");
                $fly(dorado.MessageBox.SINGLE_EDITOR._dom).css("display", "none");
                $fly(dorado.MessageBox.TEXTAREA._dom).css("display", "none");
                break;
              case "single":
                $fly(doms.editorWrap).css("display", "");
                $fly(dorado.MessageBox.SINGLE_EDITOR._dom).css("display", "");
                $fly(dorado.MessageBox.TEXTAREA._dom).css("display", "none");
                dorado.MessageBox.SINGLE_EDITOR.set("value", value || "");
                break;
              case "multiple":
                $fly(doms.editorWrap).css("display", "");
                $fly(dorado.MessageBox.SINGLE_EDITOR._dom).css("display", "none");
                $fly(dorado.MessageBox.TEXTAREA._dom).css("display", "");
                dorado.MessageBox.TEXTAREA.set("value", value || "");
                break;
            }
        }
    }, show:function (options) {
        dorado.MessageBox._runStack.push(options);
        if (dorado.MessageBox._runStack.length > 1) {
            return;
        }
        dorado.MessageBox.doShow(options);
    }, doShow:function (options) {
        options = options || {};
        var dialog = dorado.MessageBox.getDialog(), msg = options.message, defaultText = options.defaultText, title = options.title || dorado.MessageBox.defaultTitle, icon = options.icon, buttons = options.buttons || [], buttonCount = buttons.length, editor = options.editor || "none", dlgButtons = dialog._buttons;
        dorado.MessageBox.updateText(msg, icon, editor, defaultText);
        dialog.set({caption:title});
        dialog.show({overflowHandler:function (options) {
            dialog._height = options.maxHeight;
            dialog.onResize();
        }});
        if (editor != "none") {
            dorado.MessageBox.resetEditorWidth(editor);
        }
        for (var i = 0; i < 3; i++) {
            var button = buttons[i], dlgButton = dlgButtons[i];
            if (i >= buttonCount) {
                $fly(dlgButton._dom).css("display", "none");
            } else {
                var caption;
                if (dorado.MessageBox.buttonText[button]) {
                    caption = $resource(dorado.MessageBox.buttonText[button]);
                } else {
                    caption = button.toUpperCase();
                }
                dlgButton.set("caption", caption);
                $fly(dlgButton._dom).css("display", "").toggleClass("t-button-highlight", (dorado.MessageBox.HIGHLIGHT_BUTTONS.indexOf(button) >= 0));
            }
        }
    }};
    jQuery(function () {
        dorado.MessageBox.maxWidth = $fly(document).width() - 20;
    });
})();
[dorado.widget.FormConfig, dorado.widget.FormProfile, dorado.widget.FormElement, dorado.widget.autoform.AutoFormElement, dorado.widget.AutoForm].each(function (type) {
    type.prototype.ATTRIBUTES.labelWidth.defaultValue = 100;
    type.prototype.ATTRIBUTES.hintWidth.defaultValue = 4;
});
with (dorado.widget.AutoForm.prototype.ATTRIBUTES) {
    cols.defaultValue = "*";
    rowHeight.defaultValue = 0;
    padding.defaultValue = 0;
    rowPadding.defaultValue = 0;
    colPadding.defaultValue = 0;
}
dorado.widget.AbstractItemGroup = $extend(dorado.widget.Control, {$className:"dorado.widget.AbstractItemGroup", ATTRIBUTES:{items:{innerComponent:"", setter:function (value) {
    var items = this._items;
    this.clearItems && this.clearItems();
    if (value instanceof Array) {
        for (var i = 0; i < value.length; i++) {
            if (this._rendered && this.addItem) {
                this.addItem(value[i]);
            } else {
                var result = this.createItem(value[i]);
                items.insert(result);
            }
        }
    } else {
        if (value) {
            if (this._rendered && this.addItem) {
                this.addItem(value);
            } else {
                var result = this.createItem(value);
                items.insert(result);
            }
        }
    }
    this.doOnItemsChange();
}}}, EVENTS:{onItemsChange:{}}, constructor:function () {
    this._items = new dorado.util.KeyedArray(function (value) {
        if (!value) {
            return null;
        }
        return value._name || value._id;
    });
    $invokeSuper.call(this, arguments);
}, doGet:function (attr) {
    var c = attr.charAt(0);
    if (c == "#" || c == "&") {
        var name = attr.substring(1);
        return this.getItem(name);
    } else {
        return $invokeSuper.call(this, [attr]);
    }
}, clearItems:function () {
    var group = this, items = group._items, fireEvent = false;
    for (var i = 0, j = items.size; i < j; i++) {
        var control = items.get(0);
        fireEvent = true;
        if (group.removeItem) {
            group.removeItem(control, true);
        } else {
            items.remove(control);
            group.unregisterInnerControl(control);
        }
    }
    if (fireEvent) {
        this.doOnItemsChange();
    }
}, getItem:function (id) {
    var group = this, items = group._items;
    if (typeof id == "number" || typeof id == "string") {
        return items.get(id);
    } else {
        return id;
    }
}, getItemCount:function () {
    return this._items.size;
}, doOnItemsChange:function () {
    this.fireEvent("onItemsChange", this, {});
}, createItem:function (item) {
    if (!(item instanceof dorado.widget.Control)) {
        item = dorado.Toolkits.createInstance("widget", item);
    }
    return item;
}});
dorado.widget.ItemGroup = $extend([dorado.widget.AbstractItemGroup, dorado.widget.DataControl], {$className:"dorado.widget.ItemGroup", ATTRIBUTES:{itemTemplate:{}}, constructor:function (options) {
    options = options || {};
    var items = options.items || options.buttons || options.tabs;
    delete options.items;
    delete options.buttons;
    delete options.tabs;
    $invokeSuper.call(this, arguments);
    if (items) {
        if (items.length == 1 && options.dataSet !== undefined && options.itemTemplate === undefined) {
            this._itemTemplate = items[0];
        } else {
            this.set("items", items);
        }
    }
}, createDom:function () {
    var group = this, dom = $invokeSuper.call(this, arguments);
    group._dom = dom;
    return dom;
}, resolveTemplate:function () {
    var itemTemplate = this._itemTemplate, result = {};
    for (var prop in itemTemplate) {
        if (itemTemplate.hasOwnProperty(prop)) {
            var value = itemTemplate[prop], matches = /\{(.+?)\}/g.exec(value);
            if (matches) {
                result[prop] = matches[1];
            }
        }
    }
    return result;
}, rawUpdateDom:function (domRemoves, domInserts) {
    var contentContainer = this.getContentContainer();
    for (var i = 0, j = domRemoves.length; i < j; i++) {
        var toRemove = domRemoves[i];
        contentContainer.removeChild(toRemove.element);
        this.removeItem(toRemove.control);
    }
    for (var i = 0, j = domInserts.length; i < j; i++) {
        var toInsert = domInserts[i], control = toInsert.control;
        if (toInsert.after) {
            if (!control._rendered) {
                control.render(contentContainer);
            }
            $fly(toInsert.element).insertAfter(toInsert.after);
        } else {
            if (!control._rendered) {
                control.render(contentContainer, contentContainer.firstChild);
            } else {
                $fly(contentContainer).prepend(toInsert.element);
            }
        }
    }
}, _generateId:(function () {
    var seed = 1;
    return function () {
        return "item_group_item_" + seed++;
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
}, getItemByEntity:function (entity) {
    var node = this.getNodeByItem(entity);
    if (node) {
        return node.control;
    }
    return null;
}, doRefreshList:function (data) {
    var nodes = this._itemsNode, itemsNodeById = this._itemsNodeById;
    if (!nodes) {
        nodes = this._itemsNode = [];
    }
    if (!itemsNodeById) {
        itemsNodeById = this._itemsNodeById = {};
    }
    var domInserts, domRemoves, item, lastElement, prevNodeNext, node, newNodes, prevNode;
    var dataType = this.getBindingDataType(), bindingConfig = this.resolveTemplate();
    lastElement = null;
    domInserts = [];
    domRemoves = [];
    newNodes = [];
    for (var i = 0, len = nodes.length; i < len; i++) {
        node = nodes[i];
        node.active = false;
    }
    var it = data.iterator();
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
        domRemoves.push({element:node.element, control:node.control});
    }
    prevNode = null;
    it = data.iterator();
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
            domInserts.push({control:node.control, element:node.element, after:prevNode ? prevNode.element : null});
            lastElement = node.element;
            prevNode = node;
            node.active = true;
            newNodes.push(node);
            continue;
        }
        var control = this.createItemByBinding(item, dataType, bindingConfig), element = control.getDom();
        domInserts.push({control:control, element:element, after:lastElement});
        var id = this.getItemId(item);
        node = {$id:id, element:element, control:control, prev:prevNode, next:null, active:true, item:item};
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
}, createItemByBinding:function (entity, dataType, bindingConfig) {
    var itemTemplate = this._itemTemplate, result = dorado.Core.clone(itemTemplate);
    if (dataType) {
        for (var itemProperty in bindingConfig) {
            var bindingProperty = bindingConfig[itemProperty];
            if (entity.getPropertyDef(bindingProperty)) {
                result[itemProperty] = entity.get(bindingProperty);
            }
        }
    } else {
        for (var itemProperty in bindingConfig) {
            var bindingProperty = bindingConfig[itemProperty];
            result[itemProperty] = entity.get(bindingProperty);
        }
    }
    var item = this.addItem(result);
    item._bindEntity = entity;
    return item;
}, refreshItemByEntity:function (entity) {
    var node = this.getNodeByItem(entity), dataType = this.getBindingDataType(), bindingConfig = this.resolveTemplate();
    if (node) {
        var control = node.control, config = {};
        if (dataType) {
            for (var itemProperty in bindingConfig) {
                var bindingProperty = bindingConfig[itemProperty];
                if (entity.getPropertyDef(bindingProperty)) {
                    config[itemProperty] = entity.get(bindingProperty);
                }
            }
        } else {
            for (var itemProperty in bindingConfig) {
                var bindingProperty = bindingConfig[itemProperty];
                config[itemProperty] = entity.get(bindingProperty);
            }
        }
        control.set(config);
    }
}, refreshList:function () {
    var bindingData = this.getBindingData({firstResultOnly:true, acceptAggregation:true});
    this.doRefreshList(bindingData);
}, refreshDom:function () {
    if (this._dataSet) {
        var bindingData = this.getBindingData({firstResultOnly:true, acceptAggregation:true});
        var itemTemplate = this._itemTemplate, items = this._items;
        if (this._lastBindingData != bindingData && itemTemplate && bindingData != null) {
            items.clear();
            this.doRefreshList(bindingData);
            this._lastBindingData = bindingData;
        }
    } else {
        if (!this._itemsRendered) {
            this.doRenderItems();
            this._itemsRendered = true;
        }
    }
    $invokeSuper.call(this, arguments);
}, doRenderItems:function () {
    var group = this, items = group._items;
    var contentContainer = group.getContentContainer();
    for (var i = 0, j = items.size; i < j; i++) {
        var item = items.get(i);
        if (!item._isInnerControl) {
            group.registerInnerControl(item);
        }
        item.render(contentContainer);
        group.initItem && group.initItem(item);
    }
}, getContentContainer:function () {
    return this._dom;
}, addItem:function (item, index) {
    if (!item) {
        return null;
    }
    var group = this;
    item = group.createItem(item);
    group.doAddItem(item, index);
    group.doOnItemsChange();
    return item;
}, removeItem:function (control) {
    var group = this;
    control = group.getItem(control);
    if (control) {
        group.doRemoveItem(control);
        group.doOnItemsChange();
        return control;
    }
    return null;
}, doAddItem:function (item, index) {
    var group = this, items = group._items, refItem;
    if (index != null) {
        refItem = items.get(index);
        items.insert(item, index);
    } else {
        index = items.size;
        items.insert(item);
    }
    if (group._rendered) {
        if (!item._isInnerControl) {
            group.registerInnerControl(item);
        }
        item.render(group.getContentContainer(), refItem ? refItem._dom : null);
        group.initItem && group.initItem(item);
        item.refreshDom(item._dom);
    }
}, doRemoveItem:function (item) {
    var group = this, items = group._items;
    items.remove(item);
    group.unregisterInnerControl(item);
    item.destroy();
}, processDataSetMessage:function (messageCode, arg, data) {
    switch (messageCode) {
      case dorado.widget.DataSet.MESSAGE_DELETED:
      case dorado.widget.DataSet.MESSAGE_INSERTED:
        this.refreshList();
        break;
      case dorado.widget.DataSet.MESSAGE_REFRESH:
        this.refresh(true);
        break;
      case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
      case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
        if (arg.entity) {
            this.refreshItemByEntity(arg.entity);
        }
        break;
      case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
        if (this._syncCurrentItem) {
            this.doSyncCurrentItem();
        }
        break;
      case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
        break;
    }
}});
dorado.widget.SelectableItemGroup = $extend(dorado.widget.ItemGroup, {$className:"dorado.widget.SelectableItemGroup", currentItemClass:null, ATTRIBUTES:{items:{setter:function (value) {
    $invokeSuper.call(this, arguments);
    this._currentItem = null;
    if (this._rendered) {
        var currentItem;
        if (!currentItem) {
            currentItem = this._items.get(0);
        }
        if (currentItem) {
            this.set("currentItem", currentItem);
        }
    }
}}, currentControl:{path:"currentItem"}, currentItem:{skipRefresh:true, setter:function (control) {
    var group = this, items = group._items;
    if (control != null) {
        if (typeof control == "string" || typeof control == "number") {
            control = items.get(control);
        }
    }
    if (group._currentItem == control) {
        return;
    }
    if (!group._ready) {
        group._currentItem = control;
        return;
    }
    this.setCurrentItem(control);
}}, syncCurrentItem:{}, highlightCurrentItem:{defaultValue:false}, currentIndex:{skipRefresh:true, getter:function () {
    var group = this, items = group.get("items"), currentItem = group.get("currentItem");
    if (currentItem) {
        return items.indexOf(currentItem);
    }
    return -1;
}, setter:function (index) {
    var group = this, items = group.get("items");
    group.set("currentItem", items.get(index));
}}}, EVENTS:{beforeCurrentChange:{}, onCurrentChange:{}}, constructor:function (options) {
    options = options || {};
    var currentItem = options.currentItem || options.currentButton || options.currentTab;
    delete options.currentItem;
    delete options.currentButton;
    delete options.currentTab;
    $invokeSuper.call(this, arguments);
    this._itemIdProperty = this._id + "_itemId";
    if (currentItem) {
        this.set("currentItem", currentItem);
    }
}, onReady:function () {
    var currentItem = this._currentItem;
    this._currentItem = null;
    $invokeSuper.call(this);
    if (!currentItem) {
        currentItem = this._items.get(0);
    }
    if (currentItem) {
        this.set("currentItem", currentItem);
    }
}, getFocusableSubControls:function () {
    return [this._currentItem];
}, setCurrentItem:function (item) {
    var oldItem = this.get("currentItem"), eventArg = {newItem:item, oldItem:oldItem};
    this.fireEvent("beforeCurrentChange", this, eventArg);
    if (eventArg.processDefault === false) {
        return;
    }
    this.doSetCurrentItem(item);
    this.fireEvent("onCurrentChange", this, {newItem:item, oldItem:oldItem});
}, doSyncCurrentItem:function () {
    var bindingData = this.getBindingData({firstResultOnly:true, acceptAggregation:true});
    if (bindingData) {
        var current = bindingData.current;
        if (current) {
            var control = this.getItemByEntity(current);
            if (control != this._currentItem) {
                this.set("currentItem", control);
            }
        } else {
            this.set("currentItem", null);
        }
    }
}, doSetCurrentItem:function (item) {
    var group = this, oldItem = group._currentItem;
    if (oldItem == item) {
        return;
    }
    if (group._highlightCurrentItem && group._rendered && group.currentItemClass) {
        if (oldItem && oldItem._dom) {
            $fly(oldItem._dom).removeClass(group.currentItemClass);
        }
        if (item) {
            $fly(item._dom).addClass(group.currentItemClass);
        }
    }
    this._currentItem = item;
    if (group.doOnCurrentChange) {
        group.doOnCurrentChange(item, oldItem);
    }
    if (this._syncCurrentItem) {
        var bindingData = this.getBindingData({firstResultOnly:true, acceptAggregation:true});
        if (bindingData) {
            if (item._bindEntity != bindingData.current) {
                bindingData.setCurrent(item._bindEntity);
            }
        }
    }
    return true;
}, isItemSelectable:function (item) {
    return item._visible;
}, getAvailableItem:function (button) {
    var group = this, items = group._items, index, result;
    if (!button) {
        index = -1;
    } else {
        index = items.indexOf(button);
    }
    for (var i = index - 1; i >= 0; i--) {
        result = items.get(i);
        if (group.isItemSelectable(result)) {
            return result;
        }
    }
    for (var i = index + 1, j = items.size; i < j; i++) {
        result = items.get(i);
        if (group.isItemSelectable(result)) {
            return result;
        }
    }
    return null;
}, addItem:function (item, index, current) {
    var item = $invokeSuper.call(this, arguments);
    if (current) {
        this.set("currentItem", item);
    }
    return item;
}, doRemoveItem:function (item) {
    var group = this, items = group._items;
    if (item != group._currentItem) {
        items.remove(item);
        group.unregisterInnerControl(item);
        item.destroy();
    } else {
        var availableItem = group.getAvailableItem(item);
        items.removeAt(items.indexOf(item));
        group.unregisterInnerControl(item);
        item.destroy();
        group.set("currentItem", availableItem);
    }
}});
dorado.touch.Stack = $extend(dorado.widget.AbstractItemGroup, {$className:"dorado.touch.Stack", ATTRIBUTES:{className:{defaultValue:"t-stack"}, animateType:{defaultValue:"slide"}, destroyControlOnPop:{defaultValue:true}}, EVENTS:{onPopControl:{}, onPushControl:{}, onStackChange:{}, beforeCurrentChange:{}, onCurrentChange:{}}, createDom:function () {
    var doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:this._className, content:[{tagName:"div", className:"items-wrap", contextKey:"itemsWrap"}]}, null, doms);
    this._doms = doms;
    return dom;
}, onReady:function () {
    var currentItem = this._currentItem;
    this._currentItem = null;
    $invokeSuper.call(this);
    if (!currentItem) {
        currentItem = this._items.get(0);
    }
    if (currentItem) {
        this.doSetCurrentItem(currentItem);
    }
    var stack = this._stack;
    if (!stack) {
        stack = this._stack = [];
        if (this._currentItem) {
            stack.push(this._currentItem);
        }
    }
}, isRoot:function () {
    var stack = this._stack || [];
    return stack.length == 1 || stack.length == 0;
}, getFocusableSubControls:function () {
    return [this._currentItem];
}, _resetInnerControlDemension:function (control) {
    var dom = this.getDom(), width, height;
    if (this.getRealWidth()) {
        width = $fly(dom).innerWidth();
        if (width) {
            control.set("width", width, {tryNextOnError:true});
        }
    }
    if (this.getRealHeight()) {
        height = $fly(dom).innerHeight();
        if (height) {
            control.set("height", height, {tryNextOnError:true});
        }
    }
}, getCurrentControl:function () {
    return this._currentItem;
}, doSetCurrentItem:function (control, isPop) {
    var stack = this, oldControl = stack._currentItem, oldDom;
    var eventArg = {oldItem:oldControl, newItem:control};
    stack.fireEvent("beforeCurrentChange", this, eventArg);
    if (eventArg.processDefault === false) {
        return;
    }
    if (oldControl) {
        if (oldControl instanceof dorado.widget.IFrame) {
            if (!oldControl._loaded) {
                oldControl.cancelLoad();
            }
        }
        oldDom = oldControl._dom;
    }
    stack._currentItem = control;
    var dom = stack._dom;
    if (dom && control) {
        if (!control._rendered) {
            this._resetInnerControlDemension(control);
            control.render(this._doms.itemsWrap);
            $fly(control._dom).addClass("stack-item");
        } else {
            $fly(control._dom).css("display", "block");
            control.setActualVisible(true);
            this._resetInnerControlDemension(control);
            control.resetDimension();
            if (control instanceof dorado.widget.IFrame && !control._loaded) {
                control.reloadIfNotLoaded();
            }
        }
        var slideInDir = isPop ? "l2r" : "r2l";
        if (stack._firstChangeCurrent === undefined) {
            if (oldDom) {
                oldDom.style.display = "none";
                oldControl.setActualVisible(false);
            }
            control.refresh();
            stack._firstChangeCurrent = true;
        } else {
            var animateType = stack._animateType;
            if (!animateType || animateType == "none") {
                if (oldDom) {
                    oldDom.style.display = "none";
                    if (stack._destroyControlOnPop) {
                        if (!stack.doDestroyPopedControl(oldControl)) {
                            oldControl.setActualVisible(false);
                        }
                    } else {
                        oldControl.setActualVisible(false);
                    }
                }
            } else {
                stack._changeAnimating = true;
                if (oldDom) {
                    dorado.Fx.hide(animateType, oldDom, {direction:slideInDir, complete:function () {
                        oldDom.style.display = "none";
                        if (stack._destroyControlOnPop) {
                            if (!stack.doDestroyPopedControl(oldControl)) {
                                oldControl.setActualVisible(false);
                            }
                        } else {
                            oldControl.setActualVisible(false);
                        }
                    }});
                }
                dorado.Fx.show(stack._animateType, control._dom, {direction:slideInDir, complete:function () {
                    stack._changeAnimating = false;
                }});
            }
        }
    }
    stack.fireEvent("onCurrentChange", this, eventArg);
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var stack = this, currentItem = stack._currentItem;
    if (currentItem) {
        this._resetInnerControlDemension(currentItem);
        if (!currentItem._rendered) {
            currentItem.render(dom);
            if (!currentItem._isInnerControl) {
                currentItem.registerInnerControl(currentItem);
            }
        } else {
            $fly(currentItem._dom).css("display", "block");
            currentItem.setActualVisible(true);
        }
    }
}, pushControl:function (control) {
    if (this._changeAnimating) {
        return;
    }
    var stack = this._stack;
    if (!stack) {
        stack = this._stack = [];
        if (this._currentItem) {
            stack.push(this._currentItem);
        }
    }
    control = this.createItem(control);
    stack.push(control);
    this.fireEvent("onPushControl", this, {control:control});
    this.fireEvent("onStackChange", this, stack);
    this.doSetCurrentItem(control);
}, popControlTo:function (control) {
    if (this._changeAnimating) {
        return;
    }
    var currentItem = this._currentItem, stack = this._stack;
    if (!stack || stack.indexOf(control) == -1) {
        return;
    }
    if (stack && stack.length > 1 && currentItem) {
        var popedControl;
        while (stack.length > 1) {
            if (popedControl == control) {
                break;
            }
            popedControl = stack.pop();
            this.fireEvent("onPopControl", this, {control:popedControl});
        }
        this.doSetCurrentItem(control, true);
        this.fireEvent("onStackChange", this, stack);
    }
}, doDestroyPopedControl:function (control) {
    var stack = this._stack, items = this._items;
    if (items.indexOf(control) == -1 && stack.indexOf(control) == -1) {
        control.destroy();
        return true;
    }
    return false;
}, popControl:function () {
    if (this._changeAnimating) {
        return;
    }
    var currentItem = this._currentItem, stack = this._stack;
    if (stack && stack.length > 1 && currentItem) {
        var newCurrent = stack[stack.length - 2], control = stack.pop();
        this.fireEvent("onPopControl", this, {control:control});
        this.doSetCurrentItem(newCurrent, true);
        this.fireEvent("onStackChange", this, stack);
    }
}});
dorado.widget.CardBook.prototype.ATTRIBUTES.animateType = {defaultValue:"slide"};
dorado.widget.CardBook.prototype.ATTRIBUTES.verticalSlide = {};
dorado.widget.CardBook.prototype.doSetCurrentControl = function (control) {
    var cardbook = this, oldControl = cardbook._currentControl;
    var eventArg = {oldControl:oldControl, newControl:control};
    cardbook.fireEvent("beforeCurrentChange", this, eventArg);
    if (eventArg.processDefault === false) {
        return;
    }
    var oldDom;
    if (oldControl) {
        if (oldControl instanceof dorado.widget.IFrame) {
            if (!oldControl._loaded) {
                oldControl.cancelLoad();
            }
        }
        oldDom = oldControl._dom;
    }
    cardbook._currentControl = control;
    var dom = cardbook._dom;
    if (dom && control) {
        if (!control._rendered) {
            this._resetInnerControlDemension(control);
            control.render(dom);
            $fly(control._dom).addClass("card-item");
        } else {
            $fly(control._dom).css("display", "block");
            control.setActualVisible(true);
            this._resetInnerControlDemension(control);
            control.resetDimension();
            if (control instanceof dorado.widget.IFrame && !control._loaded) {
                control.reloadIfNotLoaded();
            }
        }
        var currentIndex = cardbook._controls.indexOf(control), oldIndex, verticalSlide = cardbook._verticalSlide, direction = verticalSlide ? "b2t" : "r2l";
        if (oldControl) {
            oldIndex = cardbook._controls.indexOf(oldControl);
            if (oldIndex > currentIndex) {
                direction = verticalSlide ? "t2b" : "l2r";
            }
        }
        if (cardbook._animateType == "flip") {
            direction = "left";
        }
        if (cardbook._firstChangeCurrent === undefined) {
            if (oldDom) {
                oldDom.style.display = "none";
                oldControl.setActualVisible(false);
            }
            cardbook._firstChangeCurrent = true;
        } else {
            if (oldDom) {
                dorado.Fx.hide(cardbook._animateType, oldDom, {direction:direction, complete:function () {
                    oldDom.style.display = "none";
                    oldControl.setActualVisible(false);
                }});
            }
            cardbook._changeAnimating = true;
            dorado.Fx.show(cardbook._animateType, control._dom, {direction:direction, complete:function () {
                cardbook._changeAnimating = false;
            }});
        }
    }
    cardbook.fireEvent("onCurrentChange", this, eventArg);
};
dorado.touch.Carousel = $extend(dorado.widget.SelectableItemGroup, {$className:"dorado.touch.Carousel", ATTRIBUTES:{className:{defaultValue:"t-carousel"}, orientation:{defaultValue:"horizontal", writeBeforeReady:true}}, createDom:function () {
    var carousel = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:carousel._className + " " + carousel._className + "-" + carousel._orientation, content:[{tagName:"div", className:"items-wrap", contextKey:"wrap"}, {tagName:"div", className:"indicators indicators-" + carousel._orientation, contextKey:"indicators"}]}, null, doms);
    carousel._doms = doms;
    return dom;
}, getContentContainer:function () {
    return this._doms.wrap;
}, refreshDom:function () {
    $invokeSuper.call(this, arguments);
    this.refreshIndicators();
}, refreshIndicators:function () {
    var carousel = this, doms = carousel._doms, itemsCount = carousel._items.size, indicatorsDom = doms.indicators, indicatorCount = indicatorsDom.children.length;
    if (indicatorCount < itemsCount) {
        for (var i = indicatorCount; i < itemsCount; i++) {
            var span = document.createElement("span");
            indicatorsDom.appendChild(span);
        }
    } else {
        if (indicatorCount > itemsCount) {
            for (var i = itemsCount; i < indicatorCount; i++) {
                $fly(indicatorsDom.firstChild).remove();
            }
        }
    }
    var currentIndex = carousel.get("currentIndex");
    jQuery("span", indicatorsDom).removeClass("indicator-active");
    if (currentIndex != -1) {
        jQuery("span:nth-child(" + (currentIndex + 1) + ")", indicatorsDom).addClass("indicator-active");
    }
}, doOnItemsChange:function () {
    var carousel = this;
    if (carousel._rendered) {
        carousel.refreshIndicators();
        carousel._scroller && carousel._scroller.refresh();
    }
}, doSetCurrentItem:function (item) {
    $invokeSuper.call(this, arguments);
    var carousel = this;
    carousel._scroller && carousel._scroller.setPos(this.get("currentIndex"));
    this.refreshIndicators();
}, doOnResize:function () {
    var carousel = this, items = carousel._items || [];
    for (var i = 0, j = items.size; i < j; i++) {
        var item = items.get(i);
        item._width = carousel.getRealWidth();
        item._height = carousel.getRealHeight();
        item.resetDimension();
    }
}, previous:function () {
    if (this._scroller) {
        this._scroller.prev();
    }
}, next:function () {
    if (this._scroller) {
        this._scroller.next();
    }
}, doOnAttachToDocument:function () {
    var carousel = this;
    setTimeout(function () {
        carousel._scroller = new Swipe(carousel._dom, {vertical:carousel._orientation == "vertical", disableScroll:true, callback:function (pos) {
            carousel.set("currentItem", pos);
        }});
    }, 0);
}});
dorado.touch.Menu = $extend([dorado.widget.ItemGroup, dorado.widget.FloatControl], {$className:"dorado.touch.Menu", focusable:true, ATTRIBUTES:{className:{defaultValue:"t-menu"}, items:{innerComponent:""}, visible:{defaultValue:false}, focusAfterShow:{defaultValue:true}, animateType:{defaultValue:"none"}, showAnimateType:{defaultValue:"none"}, hideAnimateType:{defaultValue:"none"}}, EVENTS:{onItemTap:{}}, createItem:function (item) {
    if (!item) {
        return null;
    }
    if (!(item instanceof dorado.widget.Control)) {
        item = dorado.Toolkits.createInstance("widget", item);
    }
    var menu = this;
    item._parent = menu;
    return item;
}, createDom:function () {
    var menu = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:menu._className, content:{tagName:"ul", className:"group-content", contextKey:"groupContent"}}, null, doms);
    menu._doms = doms;
    $fly(dom).click(function (event) {
        if (!menu.processDefaultMouseListener()) {
            return;
        }
        if (menu.onClick) {
            defaultReturnValue = menu.onClick(event);
        }
        var defaultReturnValue, target = event.target, item, eventArg = {button:event.button, event:event, returnValue:defaultReturnValue};
        if (target) {
            var items = menu._items;
            for (var i = 0, j = items.size; i < j; i++) {
                var temp = items.get(i);
                if (temp._dom == target || jQuery.contains(temp._dom, target)) {
                    item = temp;
                    eventArg.item = item;
                    break;
                }
            }
        }
        menu.fireEvent("onItemTap", menu, eventArg);
        return eventArg.returnValue;
    });
    return dom;
}, doOnBlur:function () {
    if (this._floating) {
        this.hide();
    }
}, getContentContainer:function () {
    return this._doms.groupContent;
}});
dorado.touch.GroupMenuItem = $extend(dorado.widget.Control, {$className:"dorado.touch.GroupMenuItem", ATTRIBUTES:{className:{defaultValue:"t-group-menu-item"}, caption:{}}, createDom:function () {
    var item = this, doms = {}, dom = $DomUtils.xCreate({tagName:"li", className:item._className, content:[{tagName:"span", className:"caption", content:item._caption, contextKey:"caption"}]}, null, doms);
    this._doms = doms;
    return dom;
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var item = this, doms = item._doms, caption = item._caption;
    $fly(doms.caption).text(caption);
}});
dorado.touch.MenuItem = $extend([dorado.widget.ItemGroup, dorado.widget.ActionSupport], {$className:"dorado.touch.MenuItem", ATTRIBUTES:{hideOnClick:{defaultValue:true}, className:{defaultValue:"t-menu-item"}, caption:{}, icon:{}, iconClass:{}, disabled:{}, items:{innerComponent:"touch.MenuItem"}, name:{}, visible:{defaultValue:true, setter:function (visible) {
    if (visible == null) {
        visible = true;
    }
    if (this._visible != visible) {
        this._visible = visible;
    }
}}, menu:{}}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var item = this, action = item._action || {}, doms = item._doms, disabled = item._disabled || action._disabled, caption = item._caption || action._caption, icon = item._icon || action._icon, iconCls = item._iconClass || action._iconClass;
    $fly(dom)[disabled ? "addClass" : "removeClass"]("menu-item-disabled").css("display", item._visible ? "" : "none");
    $fly(doms.caption).text(caption);
    $DomUtils.setBackgroundImage(doms.icon, icon ? icon : "");
    $fly(doms.icon).prop("className", "icon " + (iconCls ? iconCls : ""));
}, onTap:function (event) {
    var item = this, action = item._action || {}, disabled = item._disabled || action._disabled;
    if (!disabled) {
        action.execute && action.execute();
        if (item._hideOnClick) {
            item.doHideOnClick();
        }
    }
}, doHideOnClick:function () {
    var item = this, parent = item._parent;
    while (parent) {
        if (parent instanceof dorado.touch.Menu) {
            break;
        }
        parent = parent._parent;
    }
    if (parent && parent.hide) {
        parent.hide();
    }
}, createItem:function (item) {
    if (!item) {
        return null;
    }
    if (!(item instanceof dorado.widget.Control)) {
        item = dorado.Toolkits.createInstance("widget", item);
    }
    var self = this;
    item._parent = self;
    return item;
}, createDom:function () {
    var item = this, action = item._action || {}, doms = {}, dom = $DomUtils.xCreate({tagName:"li", className:item._className, content:[{tagName:"span", className:"menu-item-content", contextKey:"itemContent", content:[{tagName:"span", className:"icon", contextKey:"icon", content:"&nbsp;"}, {tagName:"span", className:"caption", content:item._caption || action._caption, contextKey:"caption"}]}, {tagName:"ul", contextKey:"itemsContent"}]}, null, doms), disabled = item._disabled || action._disabled, icon = item._icon || action._icon;
    item._doms = doms;
    $fly(dom).css("display", item._visible ? "" : "none").addClass(disabled ? "menu-item-disabled" : "");
    if (icon) {
        $DomUtils.setBackgroundImage(doms.icon, icon);
    } else {
        $fly(doms.icon).css("background-image", "");
    }
    return dom;
}, getContentContainer:function () {
    return this._doms.itemsContent;
}});
dorado.Toolkits.registerPrototype("touchmenu", {"-":dorado.touch.Separator, Separator:dorado.touch.Separator, Default:dorado.touch.MenuItem, MenuItem:dorado.touch.MenuItem, GroupMenuItem:dorado.touch.GroupMenuItem});
dorado.touch.ButtonGroup = $extend(dorado.widget.SelectableItemGroup, {$className:"dorado.touch.ButtonGroup", focusable:true, currentItemClass:"button-current", firstItemClass:"button-first", lastItemClass:"button-last", ATTRIBUTES:{className:{defaultValue:"t-button-group"}, height:{independent:true, readOnly:true}, currentButton:{path:"currentItem"}, buttons:{path:"items", innerComponent:"touch.Button"}, items:{innerComponent:"touch.Button"}, stretch:{}}, createDom:function () {
    var buttonGroup = this, doms = {}, dom = $DomUtils.xCreate({tagName:"span", className:buttonGroup._className, content:[]}, null, doms);
    buttonGroup._doms = doms;
    buttonGroup._dom = dom;
    return dom;
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    this.refreshButtons();
    if (this._stretch) {
        $fly(dom).addClass(this._className + "-stretch");
    } else {
        $fly(dom).removeClass(this._className + "-stretch");
    }
}, refreshButtons:function () {
    var group = this, items = group._items;
    if (group._rendered) {
        for (var i = 0, j = items.size; i < j; i++) {
            var button = items.get(i);
            $fly(button._dom).removeClass(group.firstItemClass).removeClass(group.lastItemClass);
            if (i == 0) {
                $fly(button._dom).addClass(group.firstItemClass);
            }
            if (i == j - 1) {
                $fly(button._dom).addClass(group.lastItemClass);
            }
            button.set("ui", this._ui).refresh();
        }
    }
}, initItem:function (button) {
    button._parent = this;
    button.onClick = function () {
        var button = this, group = button._parent, disabled = button._disabled || group._disabled;
        if (group && !disabled) {
            group.doSetCurrentItem(button);
        }
        $invokeSuper.call(this, arguments);
    };
}, doOnItemsChange:function () {
    if (this._rendered) {
        this.refreshButtons();
    }
}, isItemSelectable:function (item) {
    return !item._disabled && item._visible;
}, disableButton:function (button) {
    var buttonGroup = this, buttonDom, items = buttonGroup._items, index;
    button = buttonGroup.getItem(button);
    index = items.indexOf(button);
    buttonDom = button._dom;
    button._disabled = true;
    if (buttonDom) {
        $fly(buttonDom).addClass("button-disabled");
        if (button == buttonGroup._currentItem) {
            var newCurrentButton = buttonGroup.getAvailableButton(button);
            buttonGroup.doSetCurrentItem(newCurrentButton);
        }
    }
}, enableButton:function (button) {
    var buttonGroup = this, buttonDom, items = buttonGroup._items, index;
    button = buttonGroup.getItem(button);
    index = items.indexOf(button);
    buttonDom = button._dom;
    button._disabled = false;
    if (buttonDom) {
        $fly(buttonDom).removeClass("button-disabled");
    }
}, doSetButtonVisible:function (button, visible) {
    var buttonGroup = this, buttonDom, items = buttonGroup._items, index;
    button = buttonGroup.getItem(button);
    index = items.indexOf(button);
    buttonDom = button._dom;
    if (button._visible == visible) {
        return;
    }
    if (buttonDom) {
        if (visible) {
            buttonDom.style.display = "";
        } else {
            buttonDom.style.display = "none";
            if (button == buttonGroup._currentItem) {
                var newCurrentButton = buttonGroup.getAvailableButton(button);
                buttonGroup.doSetCurrentItem(newCurrentButton);
            }
        }
    }
}});
dorado.touch.ToolBar = $extend(dorado.widget.ItemGroup, {$className:"dorado.touch.ToolBar", ATTRIBUTES:{className:{defaultValue:"t-toolbar"}, caption:{}, stretchItemIndex:{setter:function (value) {
    this._stretchItemIndex = value;
}}}, createDom:function () {
    var toolbar = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:toolbar._className, content:[{tagName:"div", className:"caption", contextKey:"caption"}, {tagName:"div", contextKey:"wrap", className:"toolbar-wrap"}]}, null, doms);
    toolbar._doms = doms;
    var items = toolbar._items || {};
    if (toolbar._caption && items.size > 0) {
        var hasSpacer = false;
        for (var i = 0, j = items.size; i < j; i++) {
            var tool = items.get(i);
            if (tool instanceof dorado.touch.Spacer) {
                hasSpacer = true;
            }
        }
        if (!hasSpacer) {
            items.insert(new dorado.touch.Spacer());
        }
    }
    return dom;
}, doOnResize:function () {
    $invokeSuper.call(this, arguments);
    var toolbar = this, container = this._doms.wrap, items = this.get("items") || [], containerSize = {width:$fly(container).width(), height:$fly(container).height()};
    var flexItems = [], flexItemValues = [], flexSum = 0, noneFlexSum = 0;
    items.each(function (item, index) {
        var dom = item._dom;
        if (item instanceof dorado.touch.Spacer) {
            if (item.get("width") == undefined) {
                var flex = item._flex || 1;
                flexItems.push(item);
                flexItemValues.push(flex);
                flexSum += flex;
                return;
            }
        }
        if (toolbar._stretchItemIndex == index) {
            flexItems.push(item);
            flexItemValues.push(1);
            flexSum += 1;
            return;
        }
        noneFlexSum += $fly(dom).outerWidth(true);
    });
    var flexSize = containerSize.width - noneFlexSum;
    jQuery.each(flexItems, function (index, flexItem) {
        var flex = flexItemValues[index], width = Math.floor(flex / flexSum * flexSize);
        flexItem._realWidth = width;
        flexItem.refresh();
    });
}, refreshDom:function () {
    $invokeSuper.call(this, arguments);
    var toolbar = this, doms = toolbar._doms;
    doms.caption.innerHTML = toolbar._caption || "";
}, createItem:function (config) {
    if (!config) {
        return null;
    }
    if (typeof config == "string" || config.constructor == Object.prototype.constructor) {
        var result = dorado.Toolkits.createInstance("widget", config);
        result._parent = result._focusParent = this;
        return result;
    } else {
        config._parent = config._focusParent = this;
        return config;
    }
}, doAddItem:function (item, index) {
    if (!item) {
        return null;
    }
    var toolbar = this, items = toolbar._items, doms = toolbar._doms, refDom = null, refItem, rendered = toolbar._rendered;
    if (typeof index == "number" && index >= 100) {
        var prevPriority = 0, target = index, insertIndex, hasSpacer = false;
        item._cbPriority = index;
        for (var i = 0, j = items.size; i < j; i++) {
            var tempItem = items.get(i), priority = tempItem._cbPriority || 0;
            if (tempItem instanceof dorado.touch.Spacer) {
                hasSpacer = true;
            }
            if (prevPriority <= target && priority > target) {
                refItem = tempItem;
                insertIndex = i;
                break;
            }
            prevPriority = priority;
        }
        index = insertIndex;
        if (refItem) {
            refDom = refItem._dom;
        }
        if (!hasSpacer) {
            var spacer = new dorado.touch.Spacer();
            items.insert(spacer, index);
            if (rendered) {
                toolbar.registerInnerControl(spacer);
                spacer.render(doms.wrap, refDom);
            }
            items.insert(item, index + 1);
        } else {
            items.insert(item, index);
        }
        if (rendered) {
            item.render(doms.wrap, refDom);
            if (!item._isInnerControl) {
                toolbar.registerInnerControl(item);
            }
        }
    } else {
        $invokeSuper.call(this, arguments);
    }
}, getContentContainer:function () {
    return this._doms.wrap;
}});
dorado.touch.Spacer = $extend(dorado.widget.Control, {$className:"dorado.touch.Spacer", ATTRIBUTES:{flex:{}}});
dorado.touch.Separator = $extend(dorado.widget.Control, {$className:"dorado.touch.Separator", ATTRIBUTES:{className:{defaultValue:"t-separator"}}, createDom:function () {
    var separator = this, dom = document.createElement("span");
    dom.className = separator._className;
    return dom;
}});
dorado.touch.TabButton = $extend(dorado.touch.Button, {$className:"dorado.touch.TabButton", _inherentClassName:"", ATTRIBUTES:{className:{defaultValue:"tab"}, name:{writeBeforeReady:true}, icon:{getter:function () {
    var isCurrent = !!this._isCurrent;
    if (this._currentIcon && isCurrent) {
        return this._currentIcon;
    }
    return this._icon;
}}, currentIcon:{}, control:{innerComponent:true}}, getControl:function () {
    var result = this._control;
    if (!result) {
        this._control = new dorado.widget.Control();
        return this._control;
    }
    return result;
}, onClick:function () {
    var button = this, group = button._parent, disabled = button._disabled;
    if (group && !disabled) {
        group.doSetCurrentItem && group.set("currentItem", button);
    }
    $invokeSuper.call(this, arguments);
}});
dorado.touch.TabBar = $extend(dorado.widget.SelectableItemGroup, {$className:"dorado.touch.TabBar", _inherentClassName:"", currentItemClass:"tab-current", ATTRIBUTES:{className:{defaultValue:"t-tabbar"}, highlightCurrentItem:{defaultValue:true}, tabs:{innerComponent:"touch.TabButton", path:"items"}, items:{innerComponent:"touch.TabButton"}, currentTab:{path:"currentItem"}, stretch:{getter:function () {
    var parent = this._parent, value = this._stretch;
    if (value === undefined && this._scrollable != true && parent instanceof dorado.touch.TabControl) {
        return parent._tabPlacement == "bottom";
    }
    return value;
}}, scrollable:{writeBeforeReady:true}}, doOnCurrentChange:function (newItem, oldItem) {
    $invokeSuper.call(this, arguments);
    if (!this._rendered) {
        return;
    }
    if (newItem == oldItem) {
        return;
    }
    if (newItem) {
        newItem._isCurrent = true;
        if (newItem._currentIcon) {
            newItem.doRefreshIcon();
        }
    }
    if (oldItem) {
        oldItem._isCurrent = false;
        if (oldItem._currentIcon) {
            oldItem.doRefreshIcon();
        }
    }
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    if (this.get("stretch")) {
        $fly(dom).addClass(this._className + "-stretch");
    } else {
        $fly(dom).removeClass(this._className + "-stretch");
    }
    if (this._modernScroller) {
        this._modernScroller.update();
    }
}, isItemSelectable:function (item) {
    return !item._disabled && item._visible;
}, getTab:dorado.widget.ItemGroup.prototype.getItem, getContentContainer:function () {
    return this._doms.tabsWrap;
}, doOnAttachToDocument:function () {
    $invokeSuper.call(this, arguments);
    if (this._scrollable) {
        this._modernScroller = $DomUtils.modernScroll(this._dom, {showVertScrollbar:false, showHoriScrollbar:false});
    }
}, doOnItemsChange:function () {
    $invokeSuper.call(this, arguments);
    if (this._modernScroller) {
        this._modernScroller.update();
    }
}, createDom:function () {
    var group = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:group._className, contextKey:"tabbar", content:[{tagName:"div", contextKey:"tabsWrap", className:"tabs-wrap"}]}, null, doms);
    group._doms = doms;
    group._dom = dom;
    return dom;
}});
dorado.touch.TabControl = $extend(dorado.widget.SelectableItemGroup, {$className:"dorado.touch.TabControl", _inherentClassName:"", ATTRIBUTES:{className:{defaultValue:"t-tab-control"}, height:{independent:false, readOnly:false}, highlightCurrentItem:{defaultValue:true}, tabs:{innerComponent:"touch.TabButton", path:"items"}, currentTab:{path:"currentItem"}, items:{innerComponent:"touch.TabButton", path:"_tabbar.items"}, stretch:{path:"_tabbar.stretch"}, currentItem:{getter:function () {
    return this._tabbar.get("currentItem");
}, setter:function (value) {
    if (this._cardbook._changeAnimating) {
        return;
    }
    this._tabbar.set("currentItem", value);
    if (typeof value == "number") {
        value = this._tabbar.getItem(value);
    }
    if (this._tabbar.get("currentItem") == value) {
        this._cardbook.set("currentControl", this.get("currentIndex"));
    }
}}, currentIndex:{path:"_tabbar.currentIndex"}, tabPlacement:{defaultValue:"top", writeBeforeReady:true}, verticalSlide:{}, scrollable:{writeBeforeReady:true}}, constructor:function () {
    var tabControl = this;
    this._cardbook = new dorado.widget.CardBook({});
    this._tabbar = new dorado.touch.TabBar({beforeCurrentChange:function (self, arg) {
        tabControl.fireEvent("beforeCurrentChange", tabControl, arg);
    }, onCurrentChange:function (self, arg) {
        tabControl.fireEvent("onCurrentChange", tabControl, arg);
    }});
    this.registerInnerControl(this._cardbook);
    this.registerInnerControl(this._tabbar);
    $invokeSuper.call(this, arguments);
}, doOnAttachToDocument:function () {
    $invokeSuper.call(this, arguments);
    var tabPlacement = this._tabPlacement;
    if (this._verticalSlide !== undefined) {
        this._cardbook._verticalSlide = this._verticalSlide;
    } else {
        if (tabPlacement == "right" || tabPlacement == "left") {
            this._cardbook._verticalSlide = true;
        }
    }
}, createDom:function () {
    var control = this, card = control._cardbook, tabbar = this._tabbar, dom = document.createElement("div"), tabPlacement = control._tabPlacement;
    if (control._scrollable) {
        tabbar._scrollable = true;
    }
    if (tabPlacement == "top" || tabPlacement == "left" || tabPlacement == "right") {
        tabbar.render(dom);
    }
    var controls = [], items = control.get("items");
    for (var i = 0, j = items.size; i < j; i++) {
        var tab = items.get(i);
        controls.push(tab.getControl());
    }
    card.set("controls", controls);
    card.render(dom);
    if (tabPlacement == "bottom") {
        tabbar.render(dom);
    }
    $fly(tabbar._dom).addClass("t-tabbar-" + tabPlacement);
    return dom;
}, getContentContainer:function () {
    return this._tabbar._doms.tabsWrap;
}, doOnResize:function () {
    var control = this, card = control._cardbook, tabbar = control._tabbar;
    if (control._tabPlacement == "top" || control._tabPlacement == "bottom") {
        card.set({width:control.getRealWidth(), height:control.getRealHeight() - $fly(tabbar._dom).outerHeight(true)});
        card.resetDimension();
    } else {
        card.set({width:control.getRealWidth() - $fly(tabbar._dom).outerWidth(true), height:control.getRealHeight()});
        card.resetDimension();
    }
    $invokeSuper.call(this, arguments);
}});
dorado.touch.VBox = $extend(dorado.widget.ItemGroup, {ATTRIBUTES:{className:{defaultValue:"t-vbox"}, align:{}, pack:{}, direction:{}}, doOnResize:function () {
    var items = this._items, dom = this._dom, width = $fly(dom).width();
    for (var i = 0, j = items.size; i < j; i++) {
        var control = items.get(i);
        if (!control.ATTRIBUTES.width.independent || control._fixedWidth) {
            control._realWidth = width;
            control.resetDimension();
        }
    }
}, _layout:{}, refreshLayout:function (dom) {
    dom = dom ? dom : this._dom;
    if (!dom) {
        return;
    }
    var cssConfig = {};
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
    $fly(dom).css(cssConfig);
}, createDom:function () {
    var dom = $invokeSuper.call(this, arguments);
    this.refreshLayout(dom);
    var box = this;
    this._layout.refreshControl = function (item) {
        if (item) {
            item.refresh();
        }
        var parent = box._parent;
        while (parent) {
            if (parent instanceof dorado.widget.Container) {
                parent.updateModernScroller();
                break;
            }
            parent = parent._parent;
        }
    };
    return dom;
}});


(function () {
    dorado.touch.SlotList = $extend(dorado.widget.Control, {$className:"dorado.touch.SlotList", ATTRIBUTES:{className:{defaultValue:"t-slot-list"}, viewItemCount:{defalutValue:5}, items:{}, value:{getter:function () {
        var items = this.doGetItems(), currentIndex = this._currentIndex || 0;
        if (items && currentIndex != undefined) {
            return items[currentIndex];
        }
        return null;
    }, setter:function (value) {
        var items = this.doGetItems(), index = items.indexOf(value);
        this._currentIndex = index;
        if (this.isActualVisible()) {
            this.syncScroll();
        }
    }}, defaultValue:{}, currentIndex:{defalutValue:0}, formatter:{}}, EVENTS:{onValueChange:{}}, syncScroll:function () {
        if (!this._modernScroller) {
            return;
        }
        var items = this.doGetItems(), doms = this._doms, value = this.get("value");
        if (value != undefined) {
            var index = items.indexOf(value), item = $fly(doms.body).find(" > .slot-item")[index - 2];
            if (item) {
                this._disableScrollEvent = true;
                this._modernScroller.scrollTo(null, item.offsetTop, false);
                this._disableScrollEvent = false;
            }
        }
    }, doOnAttachToDocument:function () {
        var list = this, dom = list._dom, doms = list._doms, items = this.doGetItems(), defaultValue = this._defaultValue, scrollTop = 0;
        if (defaultValue != undefined) {
            var index = items.indexOf(defaultValue);
            var item = $fly(doms.body).find(" > *")[index], position = $fly(item).position();
            scrollTop = position.top;
        }
        $fly(dom).bind("modernScrolled", function (event, arg) {
            if (list._disableScrollEvent) {
                return;
            }
            var itemIndex = Math.round(arg.scrollTop / 40), position = itemIndex * 40;
            if (position == arg.scrollTop) {
                list._currentIndex = Math.abs(itemIndex);
                var value = list.get("value");
                if (value != list._value) {
                    list._value = value;
                    list.fireEvent("onValueChange", list, {currentIndex:Math.abs(itemIndex), value:list._value});
                }
            }
        });
        list._modernScroller = $DomUtils.modernScroll(dom, {showVertScrollbar:false, animationDuration:150, snapping:true, snapHeight:40, defaultScrollTop:scrollTop});
    }, createDom:function () {
        var list = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", content:[{tagName:"div", className:"items-wrap", contextKey:"body"}]}, null, doms);
        list._doms = doms;
        var viewItemCount = list._viewItemCount || 5, dummyItemCount = Math.floor(viewItemCount / 2);
        for (var i = 0; i < dummyItemCount; i++) {
            var itemDom = document.createElement("div");
            itemDom.className = "dummy-item";
            doms.body.appendChild(itemDom);
        }
        var items = list.doGetItems(), formatter = this._formatter || function (index, value) {
            return value;
        };
        for (var i = 0; i < items.length; i++) {
            var itemDom = document.createElement("div");
            itemDom.className = "slot-item";
            itemDom.innerHTML = formatter(i, items[i]);
            doms.body.appendChild(itemDom);
        }
        for (var i = 0; i < dummyItemCount; i++) {
            var itemDom = document.createElement("div");
            itemDom.className = "dummy-item";
            doms.body.appendChild(itemDom);
        }
        return dom;
    }, refreshDom:function () {
        var list = this;
        $invokeSuper.call(this, arguments);
        var oldItems = this._oldItems, items = this.doGetItems(), doms = this._doms;
        var viewItemCount = this._viewItemCount || 5, dummyItemCount = Math.floor(viewItemCount / 2);
        var formatter = this._formatter || function (index, value) {
            return value;
        };
        if (this._rangeChanged) {
            var i, itemDom;
            if (items.length <= oldItems.length) {
                for (i = 0; i < items.length; i++) {
                    itemDom = doms.body.childNodes[dummyItemCount + i];
                    itemDom.className = "slot-item";
                    itemDom.innerHTML = formatter(i, items[i]);
                }
                for (i = items.length; i < oldItems.length; i++) {
                    $fly(doms.body.childNodes[dummyItemCount + items.length]).remove();
                }
            } else {
                for (i = 0; i < oldItems.length; i++) {
                    itemDom = doms.body.childNodes[dummyItemCount + i];
                    itemDom.className = "slot-item";
                    itemDom.innerHTML = formatter(i, items[i]);
                }
                var refDom = doms.body.childNodes[doms.body.childNodes.length - dummyItemCount];
                for (i = oldItems.length; i < items.length; i++) {
                    itemDom = document.createElement("div");
                    itemDom.className = "slot-item";
                    itemDom.innerHTML = formatter(i, items[i]);
                    doms.body.insertBefore(itemDom, refDom);
                }
            }
            this._rangeChanged = false;
        }
        if (list._modernScroller) {
            list._modernScroller.update();
            list.syncScroll();
        }
    }, doGetItems:function () {
        return this._items || [];
    }});
    dorado.touch.RangeSlotList = $extend(dorado.touch.SlotList, {$className:"dorado.touch.RangeSlotList", ATTRIBUTES:{range:{setter:function (value) {
        this._oldItems = this.doGetItems();
        this._range = value;
        if (this._rendered) {
            this._rangeChanged = true;
        }
    }}, step:{defaultValue:1}}, doGetItems:function () {
        var range = this._range, items = [];
        if (range && range.length == 2) {
            var start = range[0], step = this._step, itemCount = (range[1] - start) / step + 1;
            for (var i = 0; i < itemCount; i++) {
                items.push(start + i * step);
            }
        }
        return items;
    }});
    dorado.touch.MultiSlotPicker = $extend(dorado.widget.Control, {$className:"dorado.touch.MultiSlotPicker", slotConfigs:[], ATTRIBUTES:{className:{defaultValue:"t-multi-slot-picker"}, height:{independent:true, readOnly:true}}, createDom:function () {
        var picker = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", content:[{tagName:"div", className:"body", contextKey:"body"}]}, null, doms);
        picker._doms = doms;
        picker._slotListMap = {};
        var slotConfigs = picker.slotConfigs, items = [], slotLists = [];
        for (var i = 0, j = slotConfigs.length; i < j; i++) {
            var slotConfig = slotConfigs[i], slotName = slotConfig.name, slotDom = document.createElement("div");
            slotDom.className = "picker-slot";
            slotDom.webkitBoxFlex = 1;
            var slotMask = document.createElement("div");
            slotMask.className = "slot-mask";
            var slotBar = document.createElement("div");
            slotBar.className = "slot-bar";
            slotBar.innerHTML = slotConfig.unit || "";
            slotMask.appendChild(slotBar);
            slotDom.appendChild(slotMask);
            var list;
            if (slotConfig.$type == "Range") {
                list = new dorado.touch.RangeSlotList({range:slotConfig.range, formatter:slotConfig.formatter, height:200, defaultValue:slotConfig.defaultValue, onValueChange:function (self, arg) {
                    var value = self.get("value");
                    picker.setSlotValue(self._slotIndex, value);
                }});
            } else {
                list = new dorado.touch.SlotList({items:slotConfig.items, formatter:slotConfig.formatter, height:200, defaultValue:slotConfig.defaultValue, onValueChange:function (self, arg) {
                    var value = self.get("value");
                    picker.setSlotValue(self._slotIndex, value);
                }});
            }
            list._slotIndex = i;
            picker._slotListMap[slotName] = list;
            list.render(slotDom);
            picker.registerInnerControl(list);
            doms.body.appendChild(slotDom);
            slotLists.push(list);
            items.push(slotDom);
        }
        picker._slotLists = slotLists;
        picker._items = items;
        return dom;
    }, constructor:function () {
        if (this.slotConfigs) {
            this.initSlotConfigs();
        }
        $invokeSuper.call(this, arguments);
    }, initSlotConfigs:function () {
        var slotConfigs = this.slotConfigs, slotMap = this._slotMap = {}, values = this._values = [];
        for (var i = 0, j = slotConfigs.length; i < j; i++) {
            var config = slotConfigs[i], name = config.name;
            config.className = config.className || "slot";
            config.range = config.range || [null, null];
            slotMap[name] = config;
            values[i] = config.defaultValue;
        }
    }, getSlotValue:function (slotIndex) {
        if (typeof slotIndex == "string") {
            slotIndex = this.getSlotIndexByName(slotIndex);
        }
        return this._values[slotIndex];
    }, setSlotValue:function (slotIndex, value) {
        var picker = this;
        if (typeof slotIndex == "string") {
            slotIndex = picker.getSlotIndexByName(slotIndex);
        }
        if (slotIndex < 0) {
            return;
        }
        if (value != null) {
            var config = picker.slotConfigs[slotIndex], range = config.range || [], minValue = range[0], maxValue = range[1];
            value = parseInt(value, 10);
            if (isNaN(value)) {
                value = config.defaultValue || 0;
            }
            if (maxValue != null && value > maxValue) {
                value = maxValue;
            } else {
                if (minValue != null && value < minValue) {
                    value = minValue;
                }
            }
        }
        this._values[slotIndex] = value;
        if (this.isActualVisible() && this._slotLists) {
            this._slotLists[slotIndex].set("value", value);
        }
        dorado.Toolkits.setDelayedAction(picker, "$refreshDelayTimerId", picker.refresh, 50);
    }, getSlotText:function (slotIndex) {
        var picker = this;
        if (typeof slotIndex == "string") {
            slotIndex = picker.getSlotIndexByName(slotIndex);
        }
        if (slotIndex < 0) {
            return "";
        }
        var config = picker.slotConfigs[slotIndex], text = this.getSlotValue(slotIndex);
        if (text == null) {
            if (config.digit > 0) {
                text = "";
                for (var i = 0; i < config.digit; i++) {
                    text += "&nbsp;";
                }
            } else {
                text = "&nbsp;";
            }
        } else {
            var num = text, negative = (num < 0), text = Math.abs(num) + "";
            if (config.digit > 0 && text.length < config.digit) {
                for (var i = text.length; i <= config.digit - 1; i++) {
                    text = "0" + text;
                }
            }
            text = (negative ? "-" : "") + text;
        }
        return text;
    }, getText:function () {
        var picker = this, slotConfigs = picker.slotConfigs, text = "";
        for (var i = 0; i < slotConfigs.length; i++) {
            var config = slotConfigs[i];
            text += config.prefix || "";
            text += picker.getSlotText(i);
            text += config.suffix || "";
        }
        return text;
    }, getSlotIndexByName:function (name) {
        var config = this._slotMap[name];
        return config ? this.slotConfigs.indexOf(config) : -1;
    }, doOnResize:function () {
        var picker = this, items = picker._items || [], dom = picker._dom, flexes = [], i;
        items.each(function (item, index) {
            var width = picker.slotConfigs[index].width || 90;
            flexes.push(width);
        });
        var viewWidth = dom.clientWidth, columnCount = flexes.length, totalFlex = 0;
        for (i = 0; i < columnCount; i++) {
            var flex = flexes[i];
            totalFlex += parseInt(flex, 10) || 90;
        }
        var unitWidth = viewWidth / totalFlex, lastWidth = 0;
        for (i = 0; i < columnCount; i++) {
            if (i != columnCount - 1) {
                $fly(items[i]).css({width:Math.floor(unitWidth * flexes[i])});
                lastWidth += Math.floor(unitWidth * flexes[i]);
            } else {
                $fly(items[i]).css({width:viewWidth - lastWidth});
            }
        }
    }});
    var now = new Date, currentYear = now.getFullYear(), currentMonth = now.getMonth() + 1, currentDate = now.getDate(), currentHours = now.getHours(), currentMinutes = now.getMinutes(), currentSeconds = now.getSeconds();
    var dateTimeSlotConfigs = {year:{$type:"Range", name:"year", range:[currentYear - 50, currentYear + 50], defaultValue:currentYear, unit:$resource("dorado.baseWidget.YearUnit"), width:120}, month:{$type:"Range", name:"month", range:[1, 12], defaultValue:currentMonth, unit:$resource("dorado.baseWidget.MonthUnit"), width:90}, date:{$type:"Range", name:"date", range:[1, 31], defaultValue:currentDate, unit:$resource("dorado.baseWidget.DateUnit"), width:90}, hours:{$type:"Range", name:"hours", range:[0, 23], defaultValue:currentHours, unit:$resource("dorado.baseWidget.HoursUnit"), width:90}, minutes:{$type:"Range", name:"minutes", range:[0, 59], defaultValue:0, unit:$resource("dorado.baseWidget.MinutesUnit"), width:90}, seconds:{$type:"Range", name:"seconds", range:[0, 59], defaultValue:0, unit:$resource("dorado.baseWidget.SecondsUnit"), width:90}};
    function slotAttributeGetter(attr) {
        return this.getSlotValue(attr);
    }
    function slotAttributeSetter(value, attr) {
        this.setSlotValue(attr, value);
    }
    dorado.touch.DateTimePicker = $extend(dorado.touch.MultiSlotPicker, {$className:"dorado.touch.DateTimePicker", slotConfigs:[], ATTRIBUTES:{type:{defaultValue:"date", writeBeforeReady:true}, year:{getter:slotAttributeGetter, setter:slotAttributeSetter}, month:{getter:slotAttributeGetter, setter:slotAttributeSetter}, date:{getter:slotAttributeGetter, setter:slotAttributeSetter}, hours:{getter:slotAttributeGetter, setter:slotAttributeSetter}, minutes:{getter:slotAttributeGetter, setter:slotAttributeSetter}, seconds:{getter:slotAttributeGetter, setter:slotAttributeSetter}, value:{getter:function () {
        var year = this.getSlotValue("year") || 1980;
        var month = (this.getSlotValue("month") - 1) || 0;
        var date = this.getSlotValue("date") || 1;
        var hours = this.getSlotValue("hours") || 0;
        var minutes = this.getSlotValue("minutes") || 0;
        var seconds = this.getSlotValue("seconds") || 0;
        return new Date(year, month, date, hours, minutes, seconds);
    }, setter:function (d) {
        var year = 0, month = 1, date = 1, hours = 0, minutes = 1, seconds = 1;
        if (d) {
            year = d.getFullYear();
            month = d.getMonth() + 1;
            date = d.getDate();
            hours = d.getHours();
            minutes = d.getMinutes();
            seconds = d.getSeconds();
        }
        this.setSlotValue("year", year);
        this.setSlotValue("month", month);
        this.setSlotValue("date", date);
        this.setSlotValue("hours", hours);
        this.setSlotValue("minutes", minutes);
        this.setSlotValue("seconds", seconds);
    }}}, createDom:function () {
        var type = this._type;
        var configs;
        switch (type) {
          case "year":
            configs = [dateTimeSlotConfigs.year];
            break;
          case "month":
            configs = [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month];
            break;
          case "date":
            configs = [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month, dateTimeSlotConfigs.date];
            break;
          case "time":
            configs = [dateTimeSlotConfigs.hours, dateTimeSlotConfigs.minutes, dateTimeSlotConfigs.seconds];
            break;
          case "dateTime":
            configs = [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month, dateTimeSlotConfigs.date, dateTimeSlotConfigs.hours, dateTimeSlotConfigs.minutes, dateTimeSlotConfigs.seconds];
            break;
          case "hours":
            configs = [dateTimeSlotConfigs.hours];
            break;
          case "minutes":
            configs = [dateTimeSlotConfigs.hours, dateTimeSlotConfigs.minutes];
            break;
          case "dateHours":
            configs = [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month, dateTimeSlotConfigs.date, dateTimeSlotConfigs.hours];
            break;
          case "dateMinutes":
            configs = [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month, dateTimeSlotConfigs.date, dateTimeSlotConfigs.hours, dateTimeSlotConfigs.minutes];
            break;
        }
        this.slotConfigs = configs;
        this.initSlotConfigs();
        return $invokeSuper.call(this);
    }, refreshSlotList:function (slotName, value) {
        var picker = this, slotList = picker._slotListMap[slotName];
        if (slotList) {
            if (value != undefined) {
                slotList.set(value);
            }
        }
    }, updateAllSlotList:function () {
        var slots = this._slotListMap;
        for (var slot in slots) {
            var list = slots[slot];
            list._modernScroller && list._modernScroller.update();
        }
    }, setSlotValue:function (slotIndex, value) {
        if (value == null) {
            $invokeSuper.call(this, arguments);
            return;
        }
        var picker = this, slotName;
        if (typeof slotIndex == "number") {
            var config = picker.slotConfigs[slotIndex];
            if (config) {
                slotName = config.name;
            }
        } else {
            slotName = slotIndex;
            slotIndex = picker.getSlotIndexByName(slotIndex);
        }
        if (!slotName || !picker._slotMap[slotName]) {
            return;
        }
        if (!picker._slotMap["date"]) {
            $invokeSuper.call(this, arguments);
            return;
        }
        var dateSlotIndex = picker.getSlotIndexByName("date"), date = picker._values[dateSlotIndex], newDate = 0;
        var year = (slotIndex == 0) ? value : picker._values[0];
        var month = (slotIndex == 1) ? value : picker._values[1];
        var dayCount = new Date(year, month - 1).getDaysInMonth();
        if (slotName == "year" || slotName == "month") {
            picker.refreshSlotList("date", {range:[1, dayCount]});
        }
        if (date >= 28) {
            if (date > dayCount) {
                newDate = dayCount;
            }
        }
        if (newDate) {
            if (slotName == "year" || slotName == "month") {
                picker.setSlotValue("date", newDate);
                picker._slotListMap[slotName]._value = newDate;
                picker.refreshSlotList("date");
                $invokeSuper.call(this, arguments);
            } else {
                $invokeSuper.call(this, [slotIndex, newDate]);
            }
        } else {
            $invokeSuper.call(this, arguments);
        }
    }});
})();
dorado.touch.SettingItem = $extend([dorado.widget.AbstractFormElement], {$className:"dorado.touch.SettingItem", ATTRIBUTES:{className:{defaultValue:"t-setting-item"}, type:{writeBeforeReady:true, defaultValue:"expandable"}, label:{}, icon:{}, iconClass:{}, hint:{}}, createDom:function () {
    if (!this._formProfile) {
        var view = this.get("view") || dorado.widget.View.TOP;
        this.set("formProfile", view.id("defaultFormProfile"));
    }
    var config = [{contextKey:"iconEl", tagName:"DIV", className:"icon"}, {tagName:"DIV", className:"text", content:[{contextKey:"labelEl", tagName:"DIV", className:"label"}, {contextKey:"hintEl", tagName:"DIV", className:"hint"}]}, {contextKey:"contentEl", tagName:"DIV", className:"content"}];
    var type = this._type;
    this._doms = {};
    return $DomUtils.xCreate({tagName:"DIV", className:"t-setting-item-" + type, content:config}, null, this._doms);
}, getControl:function (create) {
    var control = this._control;
    if (!control && create) {
        var propertyDef = this.getBindingPropertyDef();
        if (propertyDef) {
            if (!this._editorType) {
                var propertyDataType = propertyDef.get("dataType");
                if (propertyDataType) {
                    if (propertyDataType._code == dorado.DataType.PRIMITIVE_BOOLEAN || propertyDataType._code == dorado.DataType.BOOLEAN) {
                        this._editorType = (!propertyDef._mapping) ? "CheckBox" : "RadioGroup";
                    }
                }
            }
            if (this._trigger === undefined && propertyDef._mapping) {
                if ((!this._editorType || this._editorType == "TextEditor")) {
                    this._trigger = new dorado.widget.AutoMappingDropDown({items:propertyDef._mapping});
                }
            }
        }
        this._control = control = this.createControl(this._type);
        if (control) {
            this.registerInnerControl(control);
        }
    }
    return control;
}, createControl:function (type) {
    var control;
    switch (type) {
      case "text":
        control = new dorado.widget.Label({width:"auto"});
        break;
      case "expandable":
        control = new dorado.widget.Control();
        break;
      case "checkable":
        control = new dorado.widget.CheckBox();
        break;
      case "toggleable":
        control = new dorado.touch.Toggle();
        break;
    }
    var config = {supportsDirtyFlag:false};
    if (dorado.Object.isInstanceOf(control, dorado.widget.DataControl)) {
        if (this._dataSet && this._property) {
            config.dataSet = this._dataSet;
        } else {
            if (this._entity) {
                config.entity = this._entity;
            }
        }
        if (this._dataPath) {
            config.dataPath = this._dataPath;
        }
        if (this._property) {
            config.property = this._property;
        }
    }
    control.set(config, {skipUnknownAttribute:true});
    return control;
}, getLabel:function () {
    var label = this._label;
    if (!label && this._dataSet && this._property) {
        var p = this.getBindingPropertyDef();
        if (p) {
            label = p._label || p._name;
        }
    }
    return label || this._property || "";
}, refreshDom:function (dom) {
    var height = this._height || this._realHeight;
    $invokeSuper.call(this, arguments);
    var dom = this._dom, doms = this._doms;
    var iconEl = doms.iconEl, labelEl = doms.labelEl, hintEl = doms.hintEl, contentEl = doms.contentEl;
    if (this._iconClass || this._icon) {
        if (this._iconClass) {
            $fly(iconEl).addClass(this._iconClass);
        }
        $DomUtils.setBackgroundImage(iconEl, this._icon);
        iconEl.style.display = "";
    } else {
        iconEl.style.display = "none";
    }
    labelEl.innerText = this.getLabel();
    if (this._hint) {
        hintEl.innerText = this._hint;
        hintEl.style.display = "";
    } else {
        hintEl.innerText = "";
        hintEl.style.display = "none";
    }
    $fly(dom).toggleClass("t-has-hint", !!this._hint);
    var control = this.getControl(true);
    if (!control.get("rendered")) {
        control.render(contentEl);
    } else {
        control.refresh();
    }
}, resetBinding:function () {
    if (!this._ready) {
        return;
    }
    var config = {dataSet:this._dataSet, dataPath:this._dataPath, property:this._property};
    var editor = this.getEditor(false);
    if (editor) {
        editor.set(config);
    }
}});
dorado.touch.DropDown = $extend(dorado.widget.DropDown, {$className:"dorado.widget.DropDown", ATTRIBUTES:{minWidth:{defaultValue:260}, maxWidth:{writerBeforeReady:true, defaultValue:0}, maxHeight:{writerBeforeReady:true}, openMode:{writerBeforeReady:true}, caption:{writerBeforeReady:true}, showCancelButton:{writerBeforeReady:true}, showOkButton:{writerBeforeReady:true}, hMargin:{writerBeforeReady:true, defaultValue:16}, vMargin:{writerBeforeReady:true, defaultValue:16}, fullScreen:{writerBeforeReady:true}}, createDropDownBox:function () {
    var config = {caption:this._caption, showCancelButton:this._showCancelButton, showOkButton:this._showOkButton};
    var box, fullScreen = this._fullScreen;
    if (false && this._openMode == "auto" && !dorado.Browser.isPhone || this._openMode == "bubble") {
        this._realOpenMode = "bubble";
        this._realFullScreen = false;
        return new dorado.touch.BubbleDropDownBox(config);
    } else {
        this._realOpenMode = "layer";
        if (fullScreen === undefined || fullScreen === null) {
            fullScreen = dorado.Browser.isPhone;
        }
        config.maximized = this._realFullScreen = fullScreen;
        return new dorado.touch.LayerDropDownBox(config);
    }
}, shouldAutoRelocate:function () {
    return this._realOpenMode == "bubble";
}, getDefaultWidth:function (editor) {
    return this._minWidth;
}, doLocate:function () {
    if (this._realOpenMode == "layer") {
        var dropdown = this, box = dropdown._box, editor = dropdown._editor;
        var boxDom = box.getDom(), $boxDom = $fly(boxDom);
        var edgeWidth = $boxDom.edgeWidth(), edgeHeight = $boxDom.edgeHeight();
        dropdown._boxVisible = box.get("visible");
        var boxWidth, boxHeight;
        if (this._realFullScreen) {
            box.set({animateType:"modernSlide"});
            dropdown.initDropDownBox(box, editor);
        } else {
            var boxContainer = boxDom.parentNode;
            var boxContainerWidth = boxContainer.clientWidth, boxContainerHeight = boxContainer.clientHeight;
            this._realMaxWidth = boxContainerWidth - this._hMargin * 2 - (box.widthAdjust || 0);
            this._realMaxHeight = boxContainerHeight - this._vMargin * 2 - (box.heightAdjust || 0);
            var boxWidth = dropdown._width || 0;
            if (dropdown._realMaxWidth > 0 && boxWidth > dropdown._realMaxWidth) {
                boxWidth = dropdown._realMaxWidth;
            }
            if (boxWidth < dropdown._minWidth) {
                boxWidth = dropdown._minWidth;
            }
            if (boxWidth < box._edgeWidth) {
                boxWidth = box._edgeWidth;
            }
            var boxHeight = dropdown._height || 0;
            if (dropdown._realMaxHeight > 0 && boxHeight > dropdown._realMaxHeight) {
                boxHeight = dropdown._realMaxHeight;
            }
            if (boxHeight < dropdown._minHeight) {
                boxHeight = dropdown._minHeight;
            }
            if (boxHeight < box._edgeHeight) {
                boxHeight = box._edgeHeight;
            }
            boxDom.style.visibility = "hidden";
            boxDom.style.display = "";
            box.set({animateType:"fade", width:boxWidth, height:boxHeight});
            if (!dropdown._boxVisible) {
                box._visible = true;
                box.setActualVisible(true);
            } else {
                box.refresh();
            }
            var containerDom = box.get("containerDom");
            dropdown._edgeWidth = boxDom.offsetWidth - containerDom.offsetWidth;
            dropdown._edgeHeight = boxDom.offsetHeight - containerDom.offsetHeight;
            var currentBoxWidth = boxWidth, currentBoxHeight = boxHeight;
            dropdown.initDropDownBox(box, editor);
            if (!dropdown._boxVisible) {
                box._visible = false;
                box.setActualVisible(false);
            }
            var containerDom = box.get("containerDom"), control = box.get("control"), controlDom = control ? control.getDom() : containerDom.firstChild;
            if (!dropdown._width) {
                if (controlDom) {
                    boxWidth = controlDom.offsetWidth + dropdown._edgeWidth;
                }
                if (boxWidth > dropdown._realMaxWidth) {
                    boxWidth = dropdown._realMaxWidth;
                }
                if (boxWidth < dropdown._minWidth) {
                    boxWidth = dropdown._minWidth;
                    control.set("width", boxWidth);
                }
            }
            if (!dropdown._height) {
                if (controlDom) {
                    boxHeight = controlDom.offsetHeight + dropdown._edgeHeight;
                }
                if (boxHeight > dropdown._realMaxHeight) {
                    boxHeight = dropdown._realMaxHeight;
                }
                if (boxHeight < dropdown._minHeight) {
                    boxHeight = dropdown._minHeight;
                }
            }
            if (currentBoxWidth < boxWidth || currentBoxHeight != boxHeight) {
                var config = {};
                if (currentBoxWidth < boxWidth) {
                    config.width = boxWidth;
                }
                if (currentBoxHeight != boxHeight) {
                    config.height = boxHeight;
                }
                if (!dropdown._boxVisible) {
                    box._visible = true;
                    dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE = true;
                    box.setActualVisible(true);
                    box.set(config).refresh();
                    box._visible = false;
                    dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE = false;
                    box.setActualVisible(false);
                }
            }
            boxDom.style.visibility = "hidden";
            boxDom.style.display = "none";
        }
        if (!dropdown._boxVisible) {
            box.show({editor:editor});
        }
    } else {
        $invokeSuper.call(this, arguments);
    }
}});
dorado.touch.LayerDropDownBox = $extend(dorado.touch.Layer, {$className:"dorado.touch.LayerDropDownBox", ATTRIBUTES:{exClassName:{defaultValue:"t-drop-down-box"}, focusAfterShow:{defaultValue:true}, continuedFocus:{defaultValue:true}, maximized:{defaultValue:false}, editor:{}, dropDown:{}, control:{writeOnce:true, componentReference:true, setter:function (control) {
    if (this._control == control) {
        return;
    }
    if (this._control) {
        this.removeChild(this._control);
    }
    this._control = control;
    if (control) {
        this.addChild(control);
    }
}}, caption:{}, showCancelButton:{}, showOkButton:{}, dynaFilter:{}, filterOnTyping:{}}, EVENTS:{onDropDownBoxShow:{}}, constructor:function (config) {
    var box = this;
    $invokeSuper.call(box, arguments);
    box._contentOverflow = "visible";
    var showCancelButton, showOkButton;
    if (box._maximized) {
        showCancelButton = (box._showCancelButton !== false);
        showOkButton = (box._showOkButton !== false);
    } else {
        showCancelButton = (box._showCancelButton === true);
        showOkButton = (box._showOkButton === true);
    }
    box._center = true;
    box._cancelButtonControl = new dorado.touch.Button({caption:$resource("dorado.baseWidget.MessageBoxButtonCancel"), hideMode:"display", visible:showCancelButton, onClick:function () {
        box._dropDown.close();
    }});
    box._okButtonControl = new dorado.touch.Button({ui:"highlight", caption:$resource("dorado.baseWidget.MessageBoxButtonOK"), hideMode:"display", visible:showOkButton, onClick:function () {
        var dropDown = box._dropDown;
        dropDown.close(dropDown.getSelectedValue());
    }});
    box._manualClose = showOkButton;
    var toolBar = this._toolBarControl = new dorado.touch.ToolBar({layoutConstraint:{type:"top"}, caption:this._caption, hideMode:"display", visible:!!(showCancelButton || showOkButton || box._caption), items:[box._cancelButtonControl, new dorado.touch.Spacer(), box._okButtonControl]});
    box.addChild(toolBar);
}, doAfterShow:function (editor) {
    $invokeSuper.call(this, arguments);
    this.fireEvent("onDropDownBoxShow", this);
}});
dorado.touch.BubbleDropDownBox = $extend(dorado.touch.Bubble, {$className:"dorado.touch.BubbleDropDownBox", widthAdjust:0, heightAdjust:dorado.touch.Bubble.prototype.arrowSize, ATTRIBUTES:{exClassName:{defaultValue:"t-drop-down-box"}, showAnimateType:{defaultValue:"fade"}, hideAnimateType:{defaultValue:"fade"}, focusAfterShow:{defaultValue:false}, continuedFocus:{defaultValue:true}, editor:{}, dropDown:{}, control:{writeOnce:true, componentReference:true, setter:function (control) {
    if (this._control == control) {
        return;
    }
    if (this._control) {
        this.removeChild(this._control);
    }
    this._control = control;
    this.addChild(control);
}}, caption:{}}, EVENTS:{onDropDownBoxShow:{}}, constructor:function (config) {
    $invokeSuper.call(this, arguments);
    var toolBar = this._toolBarControl = new dorado.touch.ToolBar({layoutConstraint:{type:"top"}, caption:this._caption, hideMode:"display", visible:!!this._caption});
    this.addChild(toolBar);
    this._contentOverflow = "visible";
}, doAfterShow:function (editor) {
    $invokeSuper.call(this, arguments);
    this.fireEvent("onDropDownBoxShow", this);
}});
(function () {
    dorado.touch.RowListDropDown = $extend(dorado.touch.DropDown, {$className:"dorado.widget.RowListDropDown", ATTRIBUTES:{property:{}, displayProperty:{}, dynaFilter:{}, filterOnTyping:{defaultValue:true}, minFilterInterval:{defaultValue:240}, useEmptyItem:{writeBeforeReady:true}}, EVENTS:{onFilterItems:{}, onFilterItem:{}}, getSelectedValue:function () {
        var rowList = this._rowList;
        if (!this._rowSelected) {
            return;
        }
        var value = rowList.getCurrentItem();
        if (value && this._property) {
            if (value instanceof dorado.Entity) {
                value = value.get(this._property);
            } else {
                value = value[this._property];
            }
            if (value === undefined) {
                value = null;
            }
        }
        return value;
    }, getEntityForAssignment:function () {
        var rowList = this._rowList;
        return rowList.getCurrentItem();
    }, createDropDownBox:function () {
        var dropDown = this, box = $invokeSuper.call(this, arguments);
        var triggers = [];
        if (!dropDown._filterOnTyping) {
            triggers.push({$type:"Trigger", iconClass:"d-trigger-icon-search", onExecute:function () {
                dropDown.onFilterItems(filterEditor.get("text"));
            }});
        }
        triggers.push(new dorado.widget.Trigger({exClassName:"d-trigger-clear", iconClass:"d-trigger-icon-clear", onExecute:function () {
            filterEditor.set("text", "");
            dropDown.onFilterItems("");
        }}));
        var filterEditor = this._filterEditor = new dorado.widget.TextEditor({layoutConstraint:{padding:4}, trigger:triggers, blankText:$resource("dorado.form.InputFilterCriteriaTip"), onTextEdit:function () {
            if (dropDown._filterOnTyping) {
                dropDown.onFilterItems(filterEditor.get("text"));
            }
        }});
        var filterEditorContainer = this._filterEditorContainer = new dorado.widget.Container({layoutConstraint:{type:"top"}, hideMode:"display", visible:!!this._dynaFilter, children:[filterEditor]});
        var rowList = this.createListBox();
        box.set({control:{$type:"Container", contentOverflow:"visible", children:[filterEditorContainer, rowList]}});
        return box;
    }, createListBox:function () {
        var dropDown = this;
        return dropDown._rowList = new dorado.touch.ListBox({onItemTap:function (rowList) {
            var box = dropDown._box;
            dropDown._rowSelected = true;
            if (!box._manualClose) {
                dropDown.close(dropDown.getSelectedValue());
            }
        }, onFilterItem:function (rowList, arg) {
            dropDown.fireEvent("onFilterItem", dropDown, arg);
        }});
    }, initDropDownData:function (box, editor) {
        var rowList = this._rowList;
        var items = this.getDropDownItems() || [];
        if (rowList instanceof dorado.touch.ListBox) {
            rowList.set("property", this._displayProperty || this._property);
        }
        rowList.set("items", items);
        var value = editor.get("value"), currentIndex = -1;
        if (items && value) {
            if (items instanceof Array) {
                if (!this._property) {
                    currentIndex = items.indexOf(value);
                } else {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (item === null || item === undefined) {
                            continue;
                        }
                        if (item instanceof dorado.Entity) {
                            if (item.get(this._property) == value) {
                                currentIndex = i;
                                break;
                            }
                        } else {
                            if (item[this._property] == value) {
                                currentIndex = i;
                                break;
                            }
                        }
                    }
                }
            }
        }
        rowList.set("currentIndex", currentIndex);
    }, initDropDownBox:function (box, editor) {
        $invokeSuper.call(this, arguments);
        var rowList = this._rowList;
        if (!box._boxVisible && this.initDropDownData) {
            rowList._ignoreRefresh++;
            this.initDropDownData(box, editor);
            rowList._ignoreRefresh--;
        }
        var itemCount = rowList._itemModel.getItemCount();
        if (this._realFullScreen) {
            rowList.refresh();
        } else {
            if (!this._height) {
                var useMaxHeight = true, refreshed = false;
                if (this._realMaxHeight && (!itemCount || (this._realMaxHeight / ((rowList._rowHeight || 30) + 2) > (itemCount + 1)))) {
                    rowList.set({height:"auto"});
                    rowList._forceRefresh = true;
                    rowList.refresh();
                    rowList._forceRefresh = false;
                    refreshed = true;
                    var height = $fly(rowList._dom).outerHeight();
                    if (height <= this._realMaxHeight) {
                        useMaxHeight = false;
                    }
                }
                if (useMaxHeight && this._realMaxHeight) {
                    rowList.set({height:this._realMaxHeight - (this._edgeHeight || 0), });
                    rowList._forceRefresh = true;
                    rowList.refresh();
                    rowList._forceRefresh = false;
                    refreshed = true;
                }
                if (!refreshed) {
                    rowList.refresh();
                }
            } else {
                rowList.set({height:this._height});
                rowList.refresh();
            }
        }
    }, onFilterItems:function (filterValue) {
        var rowList = this._rowList;
        if (!rowList) {
            return;
        }
        var arg = {filterOperator:"like*", filterValue:filterValue, processDefault:true};
        this.fireEvent("onFilterItems", this, arg);
        if (!arg.processDefault) {
            return;
        }
        var realFilterValue;
        if (filterValue != arg.filterValue) {
            realFilterValue != arg.filterValue;
        } else {
            if (filterValue) {
                realFilterValue = filterValue.toLowerCase();
            }
        }
        var filterParams;
        if (realFilterValue && filterValue.length > 0) {
            var property = this._displayProperty || this._property;
            filterParams = [{property:property, operator:arg.filterOperator, value:realFilterValue}];
        }
        this._rowSelected = false;
        rowList.filter(filterParams);
    }});
    dorado.touch.ListDropDown = $extend(dorado.touch.RowListDropDown, {$className:"dorado.touch.ListDropDown", ATTRIBUTES:{items:{setter:function (items) {
        if (this._useEmptyItem) {
            if (items instanceof Array) {
                var emptyItem = items[0];
                if (!emptyItem || !emptyItem.isEmptyItem) {
                    items.insert({isEmptyItem:true}, 0);
                }
            } else {
                if (items instanceof dorado.EntityList) {
                    var emptyItem = items.getFirst();
                    if (!emptyItem || !emptyItem.isEmptyItem) {
                        emptyItem = items.insert({}, "begin");
                        emptyItem.isEmptyItem = true;
                    }
                } else {
                    if (items == null) {
                        items = [{isEmptyItem:true}];
                    }
                }
            }
        }
        this._items = items;
    }}}, constructor:function (configs) {
        var items = configs.items;
        delete configs.items;
        $invokeSuper.call(this, [configs]);
        if (items) {
            this.set("items", items);
        }
    }, getDropDownItems:function () {
        return this._items;
    }, getSelectedValue:function () {
        var rowList = this._rowList;
        if (!this._rowSelected) {
            return;
        }
        var value = rowList.getCurrentItem();
        if (value && this._property) {
            if (value instanceof dorado.Entity) {
                value = value.get(this._property);
            } else {
                value = value[this._property];
            }
            if (value === undefined) {
                value = null;
            }
        }
        return value;
    }});
    dorado.touch.AutoMappingDropDown = $extend(dorado.touch.RowListDropDown, {$className:"dorado.touch.AutoMappingDropDown", ATTRIBUTES:{dynaFilter:{defaultValue:true}}, getDropDownItems:function () {
        var editor = this._editor, pd = editor._propertyDef;
        var items = editor.get("mapping");
        if (!items) {
            if (!pd) {
                if (dorado.Object.isInstanceOf(editor, dorado.widget.PropertyDataControl)) {
                    var dataType = editor.getBindingDataType();
                    if (dataType) {
                        pd = dataType.getPropertyDef(editor.get("property"));
                    }
                }
            }
            if (!pd) {
                var entity = editor.get("entity");
                if (entity instanceof dorado.Entity) {
                    pd = entity.getPropertyDef(editor.get("property"));
                }
            }
            if (pd) {
                items = pd.get("mapping");
            }
            this._property = "value";
            this._displayProperty = null;
        } else {
            this._property = "key";
            this._displayProperty = "value";
        }
        if (this._useEmptyItem) {
            items = new dorado.EntityList(items);
            items.insert({key:null, value:null}, "begin");
        }
        return items;
    }});
    dorado.widget.View.registerDefaultComponent("autoMappingDropDown1", function () {
        return new dorado.touch.AutoMappingDropDown();
    });
    dorado.widget.View.registerDefaultComponent("autoMappingDropDown2", function () {
        return new dorado.touch.AutoMappingDropDown({useEmptyItem:true});
    });
    dorado.widget.View.registerDefaultComponent("autoOpenMappingDropDown1", function () {
        return new dorado.touch.AutoMappingDropDown({autoOpen:true});
    });
    dorado.widget.View.registerDefaultComponent("autoOpenMappingDropDown2", function () {
        return new dorado.touch.AutoMappingDropDown({autoOpen:true, useEmptyItem:true});
    });
})();
dorado.touch.DataSetDropDown = $extend(dorado.touch.RowListDropDown, {$className:"dorado.touch.DataSetDropDown", ATTRIBUTES:{dataSet:{componentReference:true}, dataPath:{}, useDataBinding:{defaultValue:true}, filterMode:{defaultValue:"serverSide"}, reloadDataOnOpen:{}, dynaFilter:{}, filterOnTyping:{defaultValue:false}}, EVENTS:{onSetFilterParameter:{}}, open:function (editor) {
    var dropdown = this, dataSet = dropdown._dataSet, superClass = $getSuperClass();
    var insertEmptyItem = function (self, arg) {
        if (arg.pageNo == 1) {
            var items = self.getData(self._dataPath);
            if (items instanceof dorado.EntityList) {
                var emptyItem = items.insert(null, "begin");
                emptyItem.isEmptyItem = true;
            }
        }
    };
    var doOpen = function (flush) {
        if (dropdown._useDataBinding) {
            if (dropdown._useDataBinding && dropdown._useEmptyItem) {
                dataSet.addListener("onLoadData", insertEmptyItem);
            }
            dropdown.addListener("onClose", function () {
                if (dropdown._useDataBinding && dropdown._useEmptyItem) {
                    dataSet.removeListener("onLoadData", insertEmptyItem);
                }
            }, {once:true});
        }
        dataSet.getDataAsync(dropdown._dataPath, function (data) {
            if (!dropdown._useDataBinding) {
                dropdown.set("items", data);
            } else {
                if (!flush && dropdown._useEmptyItem && data && data instanceof dorado.EntityList) {
                    var emptyItem = data.getFirst();
                    if (!emptyItem || !emptyItem.isEmptyItem) {
                        emptyItem = data.insert({}, "begin");
                        emptyItem.isEmptyItem = true;
                    }
                }
            }
            superClass.prototype.open.call(dropdown, editor);
        }, {loadMode:"always", flush:flush});
    };
    delete this._lastFilterValue;
    dataSet._sysParameter && dataSet._sysParameter.remove("filterValue");
    doOpen(this._reloadDataOnOpen);
}, createListBox:function () {
    var dropDown = this;
    return dropDown._rowList = new dorado.touch.DataListBox({dataSet:this._dataSet, dataPath:this._dataPath, property:this._displayProperty || this._property, onItemTap:function (rowList) {
        var box = dropDown._box;
        dropDown._rowSelected = true;
        if (!box._manualClose) {
            dropDown.close(dropDown.getSelectedValue());
        }
    }, onFilterItem:function (rowList, arg) {
        dropDown.fireEvent("onFilterItem", dropDown, arg);
    }});
}, initDropDownData:function (box, editor) {
    if (!this._useDataBinding) {
        $invokeSuper.call(this, arguments);
    } else {
        var rowList = this._rowList;
        if (rowList instanceof dorado.touch.ListBox) {
            rowList.set("property", this._displayProperty || this._property);
        }
    }
}, getDropDownItems:function () {
    return this._items;
}, onFilterItems:function (filterValue, callback) {
    var dataSet = this._dataSet;
    if (this._useDataBinding) {
        var arg = {filterValue:filterValue, processDefault:true};
        this.fireEvent("onFilterItems", this, arg);
        if (arg.processDefault) {
            if (this._filterMode == "clientSide") {
                $invokeSuper.call(this, [filterValue, callback]);
                this._lastFilterValue = filterValue;
            } else {
                arg = {dataSet:dataSet, filterValue:filterValue};
                if (this.getListenerCount("onSetFilterParameter") > 0) {
                    this.fireEvent("onSetFilterParameter", this, arg);
                    filterValue = arg.filterValue;
                }
                var sysParameter = dataSet._sysParameter;
                if (!sysParameter) {
                    dataSet._sysParameter = sysParameter = new dorado.util.Map();
                }
                if (filterValue) {
                    sysParameter.put("filterValue", filterValue);
                } else {
                    sysParameter.remove("filterValue");
                }
                dataSet.clear();
                var dropdown = this;
                dataSet.flushAsync(function () {
                    dropdown._lastFilterValue = filterValue;
                    $callback(callback);
                });
            }
        }
    } else {
        $invokeSuper.call(this, [filterValue, callback]);
        this._lastFilterValue = filterValue;
    }
}});
(function () {
    dorado.touch.DateTimeDropDown = $extend(dorado.touch.DropDown, {$className:"dorado.touch.DateTimeDropDown", ATTRIBUTES:{iconClass:{defaultValue:"d-trigger-icon-date"}, openMode:{defaultValue:"layer"}, fullScreen:{defaultValue:false}, type:{defaultValue:"date", writeBeforeReady:true}, showCancelButton:{defaultValue:true}, showOkButton:{defaultValue:true}}, createDropDownBox:function () {
        var dropDown = this, box = $invokeSuper.call(this, arguments), picker = new dorado.touch.DateTimePicker({type:this._type});
        dropDown._picker = picker;
        box.set("control", picker);
        picker.getDom();
        var width = 0, slotConfigs = picker.slotConfigs;
        for (var i = 0; i < slotConfigs.length; i++) {
            width += slotConfigs[i].width || 100;
        }
        picker.set("width", width);
        return box;
    }, initDropDownBox:function (box, editor) {
        var dropDown = this, datePicker = dropDown._picker;
        if (datePicker) {
            var date = editor.get("value");
            if (date && date instanceof Date) {
                datePicker.set("value", new Date(date.getTime()));
            }
        }
    }, getSelectedValue:function () {
        var datePicker = this._picker;
        return datePicker ? datePicker.get("value") : null;
    }});
    dorado.widget.View.registerDefaultComponent("defaultYearMonthDropDown", function () {
        return new dorado.touch.DateTimeDropDown({type:"month"});
    });
    dorado.widget.View.registerDefaultComponent("defaultDateDropDown", function () {
        return new dorado.touch.DateTimeDropDown({type:"date"});
    });
    dorado.widget.View.registerDefaultComponent("defaultTimeDropDown", function () {
        return new dorado.touch.DateTimeDropDown({type:"time"});
    });
})();
dorado.touch.CustomDropDown = $extend(dorado.touch.DropDown, {$className:"dorado.touch.CustomDropDown", ATTRIBUTES:{control:{writeBeforeReady:true, innerComponent:""}, view:{setter:function (view) {
    if (this._view == view) {
        return;
    }
    $invokeSuper.call(this, [view]);
    if (view && this._control) {
        this._control.set("view", view);
    }
}}}, createDropDownBox:function () {
    var box = $invokeSuper.call(this, arguments);
    var control = this._control;
    box.set("control", control);
    box.addListener("beforeShow", function () {
        var $box = jQuery(box.getDom().firstChild), boxWidth = $box.width(), boxHeight = $box.height();
        var $dom = jQuery(control.getDom()), realWidth = $dom.outerWidth(), realHeight = $dom.outerHeight(), shouldRefresh;
        if (realWidth < boxWidth) {
            control.set("width", boxWidth);
            shouldRefresh = true;
        }
        if (realHeight < boxHeight) {
            control.set("height", boxHeight);
            shouldRefresh = true;
        }
        if (shouldRefresh) {
            control.refresh();
        }
    });
    return box;
}});


dorado.widget.list.ListBoxRowRenderer = $extend(dorado.Renderer, {$className:"dorado.widget.list.ListBoxRowRenderer", constructor:function (options) {
    this.template = "";
    this.checkable = false;
    for (var option in options) {
        this[option] = options[option];
    }
}, render:function (dom, arg) {
    var item = arg.data, text;
    if (item != null) {
        if (arg.property) {
            if (this.template) {
                var context = {control:arg.control, dom:dom, item:item};
                if (item instanceof dorado.Entity) {
                    context.data = item.getWrapper({textMode:true, readOnly:true});
                } else {
                    context.data = item;
                }
                text = _.template(this.template, context);
            } else {
                if (item instanceof dorado.Entity) {
                    text = item.getText(arg.property);
                } else {
                    text = item[arg.property];
                }
            }
        } else {
            text = item;
        }
    }
    if (!this.template) {
        dom.innerText = (text === undefined || text === null) ? "" : "" + text;
    } else {
        dom.innerHTML = (text === undefined || text === null) ? "" : "" + text;
    }
    if (this.sortable) {
        var parentNode = dom.parentNode;
        $fly(parentNode).addClass("sortable");
        if ($fly(parentNode).find(".drag-handle").length == 0) {
            var dragHandle = document.createElement("span");
            dragHandle.className = "drag-handle";
            dragHandle.innerHTML = "&#9776;";
            $fly(parentNode).append(dragHandle);
        }
    }
    if (this.checkable) {
        var parentNode = dom.parentNode;
        $fly(parentNode).addClass("checkable");
        if ($fly(parentNode).find(".check-button").length == 0) {
            var checkDom = document.createElement("span");
            checkDom.className = "check-button";
            $fly(parentNode).prepend(checkDom);
        }
    }
}});
dorado.widget.list.TemplateRenderer = $extend(dorado.Renderer, {$className:"dorado.widget.list.TemplateRenderer", constructor:function (options) {
    this.template = "";
    for (var option in options) {
        this[option] = options[option];
    }
}, render:function (dom, arg) {
    var item = arg.data, html = "", context = {control:arg.control, dom:dom, item:item};
    if (item != null) {
        if (item instanceof dorado.Entity) {
            context.data = item.getWrapper({textMode:true, readOnly:true});
        } else {
            context.data = item;
        }
        html = _.template(this.template, context);
    }
    dom.innerHTML = html;
}});
dorado.touch.ListItemModel = $extend(dorado.widget.list.ItemModel, {constructor:function (list) {
    this.list = list;
}, iterator:function (startIndex) {
    var items = this._items;
    if (!items) {
        return this.EMPTY_ITERATOR;
    }
    var index = startIndex;
    if (index == null) {
        index = this._startIndex || 0;
    }
    if (this._groupable) {
        return new dorado.util.ArrayIterator(this._groupItems, index);
    }
    if (items instanceof Array) {
        return new dorado.util.ArrayIterator(this._items, index);
    } else {
        return items.iterator({currentPage:!this.list._supportsPaging, nextIndex:index});
    }
}, resortItem:function (item, index, insertMode) {
    var items = this._items;
    if (items instanceof Array) {
        items.removeAt(index);
        items.insert(item, index);
    } else {
        if (items instanceof dorado.EntityList) {
            if (index === undefined) {
                index = -1;
            }
            var refEntity = items.toArray()[index];
            if (refEntity) {
                items.insert(item, insertMode, refEntity);
            } else {
                items.insert(item);
            }
        }
    }
}, filter:function () {
    $invokeSuper.call(this, arguments);
    if (this._groupable) {
        this.doGroupData();
    }
}, setGroupable:function (groupable) {
    this._groupable = groupable;
}, doGroupData:function () {
    var list = this.list, data = this.toArray();
    if (data) {
        data.sort(function (a, b) {
            var nameA = list.getGroupString(a).toLowerCase(), nameB = list.getGroupString(b).toLowerCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        if (list._groupSortMode == "desc") {
            data.reverse();
        }
        var groupDataArray = [], groupsMap = {}, currentGroup, lastGroup;
        for (var i = 0, j = data.length; i < j; i++) {
            var item = data[i], groupString = list.getGroupString(item);
            if (!lastGroup || lastGroup != groupString) {
                currentGroup = groupsMap[groupString];
                if (!currentGroup) {
                    currentGroup = {group:groupString, data:[]};
                    groupsMap[groupString] = currentGroup;
                }
                groupDataArray.push(currentGroup);
            }
            currentGroup.data.push(item);
            lastGroup = groupString;
        }
        var groupItems = [], groups = [], groupStringsMap = this._groupsMap || {};
        for (i = 0; i < groupDataArray.length; i++) {
            var groupData = groupDataArray[i], group = groupData.group, groupData = groupData.data;
            var groupItem = groupStringsMap[group];
            if (!groupItem) {
                groupItem = {groupString:group, isGroupItem:true};
                groupStringsMap[group] = groupItem;
            }
            groupItems.push(groupItem);
            groups.push(groupItem);
            if (groupData) {
                Array.prototype.push.apply(groupItems, groupData);
            }
        }
        this._groupsMap = groupStringsMap;
        this._groups = groups;
        this._groupItems = groupItems;
    }
}, setItems:function (items) {
    if (this._filterParams) {
        this.filter();
    }
    if (items instanceof Array) {
        this._isItemsArray = true;
        items.indexOf = function (value) {
            for (var i = 0, j = this.length; i < j; i++) {
                if (this[i] == value) {
                    return i;
                }
            }
            return -1;
        };
    }
    this._items = items;
    if (this._groupable) {
        this.doGroupData();
    }
}});
dorado.touch.ListBox = $extend(dorado.widget.AbstractList, {focusable:false, ATTRIBUTES:{className:{defaultValue:"t-list"}, pullDownAction:{setter:function (value) {
    this._pullDownAction = value;
    this._pullDownEnabled = !!value && value != "none";
}}, showLoadNextPageButton:{}, autoLoadNextPageAtBottom:{}, currentIndex:{skipRefresh:true, defaultValue:-1, setter:function (index) {
    if (index >= this._itemModel.getItemCount()) {
        index = -1;
    }
    if (this._currentIndex == index) {
        return;
    }
    this._currentIndex = index;
    var row = this.getItemDomByIndex(index);
    if (row) {
        this.setCurrentRow(row);
        this.scrollCurrentIntoView();
    }
    if (!row) {
        row = this.getItemDomByIndex(index);
        this.setCurrentRow(row);
    }
    this.fireEvent("onCurrentChange", this);
}}, currentItem:{readOnly:true, getter:function () {
    return this.getCurrentItem();
}}, items:{setter:function (value) {
    this.set("selection", null);
    this._currentIndex = -1;
    this._itemModel.setItems(value);
}, getter:function () {
    return this._itemModel.getItems();
}}, property:{setter:function (property) {
    this._property = property;
    if (this._rendered) {
        this.refreshListData();
    }
    this._ignoreItemTimestamp = true;
}}, renderer:{}, groupable:{}, groupProperty:{}, groupSortMode:{defaultValue:"asc"}, showIndexBar:{}, highlightCurrentRow:{defaultValue:true}, leftActionGroup:{innerComponent:"", setter:function (value) {
    this._leftActionGroup = value;
    if (this._leftActionGroup || this._rightActionGroup) {
        this._actionGroupEnabled = true;
    } else {
        this._actionGroupEnabled = false;
    }
}}, rightActionGroup:{innerComponent:"", setter:function (value) {
    this._rightActionGroup = value;
    if (this._leftActionGroup || this._rightActionGroup) {
        this._actionGroupEnabled = true;
    } else {
        this._actionGroupEnabled = false;
    }
}}, actionGroupItem:{}}, EVENTS:{onItemTap:{}, onItemTapHold:{}, onItemSwipe:{}, onGetGroupString:{}, onPullDownRelease:{}, onRenderRow:{}, onRenderGroupTitle:{}}, constructor:function (config) {
    config = config || {};
    var items = config.items;
    if (items) {
        delete config.items;
    }
    $invokeSuper.call(this, arguments);
    this._itemIdProperty = this._id + "_itemId";
    if (config.groupProperty !== undefined && this._groupable === undefined) {
        this._groupable = true;
        this._itemModel.setGroupable(true);
    } else {
        if (this._groupable !== undefined) {
            this._itemModel.setGroupable(this._groupable);
        }
    }
    if (items) {
        this.set("items", items);
    }
    if ((this._showLoadNextPageButton || this._autoLoadNextPageAtBottom) && this._supportsPaging === undefined) {
        this._supportsPaging = true;
    }
    this._pullDownEnabled = !!this._pullDownAction && this._pullDownAction != "none";
}, scrollCurrentIntoView:function () {
    var currentItemId = this.getCurrentItemId(), row = this._currentRow;
    if (currentItemId != null && row) {
        this.scrollItemDomIntoView(row);
    }
}, scrollItemDomIntoView:function (row, time) {
    var modernScrolled = this._modernScroller;
    if (modernScrolled) {
        modernScrolled.scrollToElement(row, time);
    }
}, getItemDom:function (item) {
    if (item == null) {
        return null;
    }
    var node = this.getNodeByItem(item);
    if (node) {
        return node.element;
    }
    return null;
}, getItemTimestamp:function (item) {
    return (item instanceof dorado.Entity) ? item.timestamp : -1;
}, getItemDomByIndex:function (index) {
    var itemModel = this._itemModel;
    if (index >= itemModel.getItemCount()) {
        index = -1;
    }
    if (this._rendered && index >= 0) {
        var item = itemModel.getItemAt(index);
        return this.getItemDom(item);
    }
    return null;
}, setCurrentRow:function (row) {
    if (this._currentRow == row) {
        return;
    }
    if (this._currentRow) {
        $fly(this._currentRow).removeClass("current-row");
    }
    this._currentRow = row;
    if (row && this._highlightCurrentRow) {
        $fly(row).addClass("current-row");
    }
}, refreshCurrentRow:function () {
    if (this._highlightCurrentRow) {
        if (this._currentRow) {
            $fly(this._currentRow).addClass("current-row");
        } else {
            if (this._currentIndex != undefined && this._currentIndex != -1) {
                var row = this._currentRow = this.getItemDomByIndex(this._currentIndex);
                if (row) {
                    $fly(row).addClass("current-row");
                }
            }
        }
    }
}, setSelection:function (selection) {
    this._selection = selection;
}, replaceSelection:function (removed, added, silence) {
    if (removed == added && removed != null) {
        return null;
    }
    var selection = this.get("selection"), selectionMode = this._selectionMode, i;
    switch (selectionMode) {
      case "singleRow":
        removed = selection;
        if (removed) {
            for (i = 0; i < removed.length; i++) {
                this.toggleItemSelection(removed[i], false);
            }
        }
        if (added) {
            for (i = 0; i < added.length; i++) {
                this.toggleItemSelection(added[i], true);
            }
        }
        this.setSelection(added);
        break;
      case "multiRows":
        if (removed && selection) {
            if (removed == selection) {
                removed = selection.slice(0);
                for (i = 0; i < selection.length; i++) {
                    this.toggleItemSelection(selection[i], false);
                }
                selection = null;
            } else {
                if (!(removed instanceof Array)) {
                    removed = [removed];
                }
                for (i = 0; i < removed.length; i++) {
                    selection.remove(removed[i]);
                    this.toggleItemSelection(removed[i], false);
                }
            }
        }
        if (selection == null) {
            this.setSelection(selection = []);
        }
        if (added) {
            for (i = 0; i < added.length; i++) {
                selection.push(added[i]);
                this.toggleItemSelection(added[i], true);
            }
        }
        this.setSelection(selection);
        break;
    }
    if (!silence) {
        this.fireEvent("onSelectionChange", this, {removed:removed, added:added});
    }
    return {removed:removed, added:added};
}, toggleItemSelection:function (item, selected) {
    var row = this.getItemDom(item);
    if (row) {
        $fly(row).toggleClass("selected-row", selected);
    }
}, createDom:function () {
    var list = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", content:[{tagName:"div", className:"list-content", contextKey:"content", content:[{tagName:"div", className:"list-items-wrap", contextKey:"itemsWrap"}]}, {tagName:"div", className:"group-title fixed-group-title ignored", contextKey:"fixedItem", style:{display:"none"}, content:{tagName:"div", className:"title"}}]}, null, doms);
    list._doms = doms;
    var getItem = function (target) {
        var result = target;
        while (result && result != document.body) {
            if (result.className && result.className.indexOf("list-item") != -1) {
                return result;
            }
            result = result.parentNode;
        }
        return null;
    };
    var positionCache = null, targetIndex, dragTarget, listRect, listScroll;
    function initItemsPosition(target) {
        dragTarget = target;
        $fly(target).bringToFront();
        var zero = target.offsetTop + target.offsetHeight / 2;
        positionCache = [];
        $fly(doms.itemsWrap).find("> *").each(function (index, element) {
            if (element == target) {
                targetIndex = index;
                return;
            }
            var offsetTop = element.offsetTop;
            element.style[dorado.Fx.transitionProperty] = dorado.Fx.transformStyleName + " 0.2s ease-in-out";
            var result = {index:index, node:element, pos:offsetTop + (offsetTop < zero ? element.offsetHeight : 0) - zero};
            positionCache.push(result);
        });
        var offset = $fly(list._dom).offset(), height = $fly(list._dom).height();
        listRect = {top:offset.top, bottom:offset.top + height, height:height};
        if (list._modernScroller) {
            listScroll = list._modernScroller.getValues();
        }
    }
    function moveItems(event) {
        var center = event.gesture.center;
        if (list._modernScroller) {
            if (center.pageY < listRect.top + 20) {
                list._modernScroller.scrollBy(null, -10);
            } else {
                if (center.pageY > listRect.bottom - 20) {
                    list._modernScroller.scrollBy(null, 10);
                }
            }
        }
        var deltaY = event.gesture.deltaY, height = dragTarget.offsetHeight;
        if (listScroll) {
            var newScroll = list._modernScroller.getValues();
            deltaY += newScroll.top - listScroll.top;
        }
        dorado.Fx.translateElement(dragTarget, null, deltaY);
        positionCache.forEach(function (object) {
            var off = 0;
            if (object.pos < 0 && deltaY < 0 && object.pos > deltaY) {
                off = height;
            } else {
                if (object.pos > 0 && deltaY > 0 && object.pos < deltaY) {
                    off = -height;
                }
            }
            dorado.Fx.translateElement(object.node, null, off);
        });
    }
    function endMoveItems(event) {
        dorado.Fx.cancelTranslateElement(dragTarget);
        var deltaY = event.gesture.deltaY, newIndex;
        if (listScroll) {
            var newScroll = list._modernScroller.getValues();
            deltaY += newScroll.top - listScroll.top;
        }
        if (deltaY < 0) {
            for (var i = 0; i < positionCache.length; i++) {
                var object = positionCache[i];
                if (object.pos > deltaY) {
                    newIndex = object.index;
                    if (targetIndex == newIndex) {
                        return;
                    }
                    $fly(dragTarget).insertBefore(object.node);
                    list._itemModel.resortItem($fly(dragTarget).data("item"), newIndex, "before");
                    break;
                }
            }
        } else {
            for (var i = positionCache.length - 1; i >= 0; i--) {
                var object = positionCache[i];
                if (object.pos < deltaY) {
                    newIndex = i + 1;
                    if (targetIndex == newIndex) {
                        return;
                    }
                    if (positionCache[i + 1]) {
                        $fly(dragTarget).insertBefore(positionCache[i + 1].node);
                    } else {
                        dragTarget.parentNode.appendChild(dragTarget);
                    }
                    list._itemModel.resortItem($fly(dragTarget).data("item"), newIndex, "after");
                    break;
                }
            }
        }
        positionCache.forEach(function (object) {
            if (!object) {
                return;
            }
            object.node.style[dorado.Fx.transitionProperty] = "";
            dorado.Fx.cancelTranslateElement(object.node);
        });
        dragTarget = null;
        positionCache = null;
        targetIndex = null;
    }
    $fly(doms.itemsWrap).hammer({transform:false, dragMinDistance:4}).bind("hold", function (event) {
        var target = getItem(event.target);
        if (target) {
            var item = $fly(target).data("item");
            if (item) {
                list.setCurrentRow(target);
                list.doOnItemTapHold(item, target);
            }
        }
    }).bind("dragstart", function (event) {
        var target = getItem(event.target);
        if (list._modernScroller && list._modernScroller.__isDragging) {
            return;
        }
        if (target) {
            var item = $fly(target).data("item");
            if (event.target.className.indexOf("drag-handle") != -1) {
                event.stopPropagation();
                list._resorting = true;
                initItemsPosition(target);
                return;
            }
            if (!list._actionGroupEnabled) {
                return;
            }
            if (item) {
                if (event.gesture.direction == "left" || event.gesture.direction == "right") {
                    list._actionGroupDragging = true;
                    list.doOnItemSwipe(item, target, event);
                    event.stopPropagation();
                }
            }
        }
    }).bind("drag", function (event) {
        if (list._resorting) {
            moveItems(event);
            event.stopPropagation();
        }
        if (!list._actionGroupEnabled) {
            return;
        }
        if (list._actionGroupDragging) {
            var leftActionGroup = list._leftActionGroup, rightActionGroup = list._rightActionGroup;
            var deltaX = event.gesture.deltaX;
            if (!leftActionGroup && deltaX > 0) {
                deltaX = 0;
            }
            if (!rightActionGroup && deltaX < 0) {
                deltaX = 0;
            }
            if (list._actionGroupItem) {
                dorado.Fx.translateElement(list._actionGroupItemDom, deltaX, null);
            }
            event.stopPropagation();
        }
    }).bind("dragend", function (event) {
        if (list._resorting) {
            endMoveItems(event);
            list._resorting = false;
        }
        if (!list._actionGroupEnabled) {
            return;
        }
        if (list._actionGroupDragging) {
            list._actionGroupDragging = false;
            var leftActionGroup = list._leftActionGroup, rightActionGroup = list._rightActionGroup, animateDom = list._actionGroupItemDom;
            if (Math.abs(dorado.Fx.getElementTranslate(animateDom).left) < 5) {
                list.hideActionGroup();
                return;
            }
            jQuery(animateDom).anim({}, 0.2, "ease-out", function () {
                jQuery(animateDom).css({"transition":"", "-webkit-transition":"", "-moz-transition":""});
            });
            if (leftActionGroup && event.gesture.deltaX > 0) {
                $fly(leftActionGroup._dom).bringToFront();
                dorado.Fx.translateElement(animateDom, $fly(leftActionGroup._dom).width(), null);
            } else {
                if (rightActionGroup) {
                    $fly(rightActionGroup._dom).bringToFront();
                    dorado.Fx.translateElement(animateDom, -1 * $fly(rightActionGroup._dom).width(), null);
                }
            }
        }
    }).bind("tap", function (event) {
        dorado.preventGhostClick(event);
        var target = getItem(event.target);
        if (target) {
            var item = $fly(target).data("item");
            if (!item) {
                return;
            }
            if (event.target.className.indexOf("check-button") != -1) {
                var selection = list.get("selection"), added = [], removed = [];
                if (selection instanceof Array) {
                    if (selection.indexOf(item) != -1) {
                        removed.push(item);
                    } else {
                        added.push(item);
                    }
                } else {
                    added.push(item);
                }
                list.replaceSelection(removed, added);
            } else {
                list.setCurrentItem(target);
                list.setCurrentRow(target);
                list.doOnItemTap(item, target, event);
            }
        }
    });
    return dom;
}, refreshDom:function (dom) {
    var hasRealWidth = !!this._width, hasRealHeight = !!this._height, oldWidth, oldHeight;
    if (!hasRealWidth || !hasRealHeight) {
        oldWidth = dom.offsetWidth;
        oldHeight = dom.offsetHeight;
    }
    if (this._pullDownEnabled && !this._pullDownDomInited) {
        var pulldownDom = $DomUtils.xCreate({tagName:"div", className:"pull-down-wrap", content:[{tagName:"div", className:"icon"}, {tagName:"div", className:"text", content:($resource("dorado.list.PullToRefresh") || "Pull To Refresh")}]});
        $fly(this._doms.content).prepend(pulldownDom);
        this._doms.pulldown = pulldownDom;
        this._pullDownDomInited = true;
    }
    this.refreshItemDoms();
    this.refreshGroup();
    this.refreshScroller();
    $invokeSuper.call(this, arguments);
    var currentIndex = this._currentIndex;
    if (currentIndex < 0 && !this._allowNoCurrent && this._itemModel.getItemCount()) {
        currentIndex = 0;
        this.set("currentIndex", currentIndex);
    }
    if ((!hasRealWidth || !hasRealHeight) && (oldWidth != dom.offsetWidth || oldHeight != dom.offsetHeight)) {
        this.notifySizeChange();
    }
    var list = this;
    if (list._modernScroller) {
        setTimeout(function () {
            list._modernScroller.update();
            if (list.__loadingNextPage) {
                list.__loadingNextPage = false;
            }
        }, 0);
    }
}, refreshScroller:function () {
    if (this._modernScroller) {
        return;
    }
    var list = this, dom = list._dom, height = list.getRealHeight();
    if (height != undefined) {
        list._modernScroller = $DomUtils.modernScroll(dom, {autoDisable:!list._pullDownEnabled});
        $fly(dom).bind("modernScrolling", $scopify(list, list.doOnScroll));
        if (list._pullDownEnabled) {
            var pulldownDom = list._doms.pulldown, pulldownTextDom = pulldownDom.lastChild, scroller = jQuery.data(dom, "modernScroller");
            scroller.activatePullToRefresh(50, function () {
                $fly(pulldownDom).addClass("pull-down-release");
                $fly(pulldownTextDom).html($resource("dorado.list.ReleaseToRefresh") || "Release to refresh");
            }, function () {
                $fly(pulldownDom).removeClass("pull-down-release");
                $fly(pulldownTextDom).html($resource("dorado.list.PullToRefresh") || "Pull to refresh");
            }, function () {
                $fly(pulldownDom).addClass("pull-down-loading").removeClass("pull-down-release");
                $fly(pulldownTextDom).html($resource("dorado.list.PullRefreshing") || "Refreshing...");
                list.startPullDownAction();
            });
        }
    }
}, doOnScroll:function (event, arg) {
    var list = this, scrollTop = arg.scrollTop, scrollHeight = arg.scrollHeight, clientHeight = arg.clientHeight;
    if (list._autoLoadNextPageAtBottom) {
        var modernScroll = list._modernScroller.scroller;
        if (scrollTop + clientHeight > scrollHeight - 5 && !list.__loadingNextPage) {
            list.__loadingNextPage = true;
            list.loadNextPage && list.loadNextPage(function (lastPage) {
                if (lastPage === true) {
                } else {
                }
            });
        }
    }
    this.refreshGroupTitle(scrollTop);
}, doOnAttachToDocument:function () {
    var list = this;
    list.refreshScroller();
    setTimeout(function () {
        list.refreshGroup();
        list._modernScroller && list._modernScroller.update();
    }, 0);
}, refreshIndexBar:function () {
    var list = this, doms = list._doms, dom = list._dom;
    if (!doms.indexBar) {
        var indexBar = document.createElement("div");
        indexBar.className = "index-bar ignored";
        dom.appendChild(indexBar);
        jQuery(indexBar).hammer({transform:false, dragMinDistance:2}).bind("touch", function (event) {
            list._indexBarMouseDown = true;
            var gesture = event.gesture, startPoint = gesture.center, span = document.elementFromPoint(startPoint.pageX, startPoint.pageY);
            if (span && span.tagName.toLowerCase() == "span") {
                $fly(span).addClass("hovering");
            }
        }).bind("drag", function (event) {
            if (!list._indexBarMouseDown) {
                return;
            }
            var gesture = event.gesture, startPoint = gesture.center, span = document.elementFromPoint(startPoint.pageX, startPoint.pageY);
            if (span && span.tagName.toLowerCase() == "span") {
                $fly(indexBar).find("> span.hovering").removeClass("hovering");
                var spanIndex = $fly(span).addClass("hovering").index();
                list.scrollItemDomIntoView(jQuery(".group-title", dom)[spanIndex], 0);
            }
            event.stopImmediatePropagation();
        }).bind("dragend", function () {
            list._indexBarMouseDown = false;
            $fly(indexBar).find("> span.hovering").removeClass("hovering");
        }).bind("tap", function (event) {
            dorado.preventGhostClick(event);
            var span = event.target;
            if (span && span.tagName.toLowerCase() == "span") {
                var spanIndex = jQuery(span).index();
                list.scrollItemDomIntoView(jQuery(".group-title", dom)[spanIndex], 300);
            }
        }).bind("release", function () {
            $fly(indexBar).find("> span.hovering").removeClass("hovering");
        });
        doms.indexBar = indexBar;
    }
    doms.indexBar.innerHTML = "";
    var groups = list._itemModel._groups || [];
    for (var i = 0; i < groups.length; i++) {
        var span = document.createElement("span");
        span.appendChild(document.createTextNode(groups[i].groupString));
        doms.indexBar.appendChild(span);
    }
}, createItemDom:function (item) {
    var list = this;
    if (item) {
        var itemDom = document.createElement("div"), labelDom = document.createElement("div");
        itemDom.className = "list-item";
        labelDom.className = "item-content";
        itemDom.appendChild(labelDom);
        $fly(itemDom).data("item", item);
    }
    return itemDom;
}, refreshItemDom:function (row, item) {
    var timestamp = this.getItemTimestamp(item);
    if (this._ignoreItemTimestamp || timestamp <= 0 || row.timestamp != timestamp) {
        this.doRefreshItemDomData(row, item);
        row.timestamp = timestamp;
    }
    if (!(item instanceof dorado.Entity) && item.leaf != undefined) {
        $fly(row).toggleClass("disclosure", !item.leaf);
    }
}, doRefreshItemDomData:function (row, item) {
    var contentDom = $fly(row).find(".item-content")[0], processDefault = true, arg = {control:this, dom:contentDom, data:item, property:this._property, processDefault:false};
    if (this.getListenerCount("onRenderRow")) {
        this.fireEvent("onRenderRow", this, arg);
        processDefault = arg.processDefault;
    }
    if (processDefault) {
        (this._renderer || this.getDefaultRenderer()).render(contentDom, arg);
    }
}, rawUpdateDom:function (domRemoves, domInserts) {
    for (var i = 0, j = domRemoves.length; i < j; i++) {
        var toRemoveDom = domRemoves[i];
        this._doms.itemsWrap.removeChild(toRemoveDom);
    }
    for (var i = 0, j = domInserts.length; i < j; i++) {
        var insert = domInserts[i];
        if (insert.after) {
            $fly(insert.element).insertAfter(insert.after);
        } else {
            $fly(this._doms.itemsWrap).prepend(insert.element);
        }
    }
}, _generateId:(function () {
    var seed = 1;
    return function () {
        return "list_item_" + seed++;
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
}, refreshList:function () {
    var nodes = this._itemsNode, itemsNodeById = this._itemsNodeById;
    if (!nodes) {
        nodes = this._itemsNode = [];
    }
    if (!itemsNodeById) {
        itemsNodeById = this._itemsNodeById = {};
    }
    var domInserts, domRemoves, item, lastElement, prevNodeNext, node, newNodes, prevNode;
    lastElement = null;
    domInserts = [];
    domRemoves = [];
    newNodes = [];
    for (var i = 0, len = nodes.length; i < len; i++) {
        node = nodes[i];
        node.active = false;
    }
    var it = this._itemModel.iterator();
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
        domRemoves.push(node.element);
    }
    prevNode = null;
    it = this._itemModel.iterator();
    var l = 0;
    var isItemsArray = this._itemModel._isItemsArray;
    while (it.hasNext()) {
        item = it.next();
        item = item || {};
        if (isItemsArray && typeof item == "string") {
            item = this._itemModel._items[l] = new String(item);
        }
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
        var element;
        if (item.isGroupItem) {
            element = this.createGroupDom(item.groupString);
        } else {
            element = this.createItemDom(item);
            this.refreshItemDom(element, item);
        }
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
    if (domRemoves.length > 0 || domInserts.length > 0) {
        return true;
    }
    return false;
}, refreshListData:function () {
    var it = this._itemModel.iterator();
    while (it.hasNext()) {
        var item = it.next(), element = this.getItemDom(item);
        if (element) {
            this.refreshItemDom(element, item);
        }
    }
}, refreshItemDoms:function () {
    var list = this;
    if (!list._groupable) {
        list.refreshList();
        list.refreshCurrentRow();
    } else {
        if (list._groupable && (list._groupProperty || list.getListenerCount("onGetGroupString") > 0)) {
            var refresh = list.refreshList();
            if (refresh && list._showIndexBar) {
                list.refreshIndexBar();
            }
            list.refreshCurrentRow();
        } else {
            if (list._groupable && !(list._groupProperty || list.getListenerCount("onGetGroupString") > 0)) {
                throw new dorado.Exception("groupProperty or onGetGroupString Listener is required.");
            }
        }
    }
    if (list._doms.itemsWrap.children.length > 0 && list._showLoadNextPageButton && !list._loadNextPageButton) {
        var pressToLoadMore = $resource("dorado.list.PressToLoadMore") || "Press To Load Next Page";
        noMoreDataToLoad = $resource("dorado.list.NoMoreDataToLoad") || "No More Data To Load", LoadingMore = $resource("dorado.list.LoadingMore") || "Loading...";
        var button = $DomUtils.xCreate({tagName:"div", className:"load-next-page-button", content:[{tagName:"div", className:"icon"}, {tagName:"div", className:"text", content:(list._isLastPage ? noMoreDataToLoad : pressToLoadMore)}]});
        if (list._isLastPage) {
            $fly(button).addClass("disabled");
        }
        $fly(button).hammer({drag:false, transform:false}).bind("tap", function (event) {
            $fly(button).addClass("loading");
            $fly(button.lastChild).html(LoadingMore);
            list.loadNextPage && list.loadNextPage(function (lastPage) {
                $fly(button).removeClass("loading").toggleClass("disabled", lastPage === true);
                $fly(button.lastChild).html((lastPage === true) ? noMoreDataToLoad : pressToLoadMore);
            });
        });
        list._doms.content.appendChild(button);
        list._loadNextPageButton = button;
    }
}, getGroupString:function (item) {
    var arg = {item:item, returnValue:undefined}, result;
    this.fireEvent("onGetGroupString", this, arg);
    if (arg.returnValue != undefined) {
        result = arg.returnValue;
    } else {
        if (item instanceof dorado.Entity) {
            result = item.get(this._groupProperty);
        } else {
            result = item[this._groupProperty];
        }
    }
    return result;
}, createGroupDom:function (group) {
    var groupDom = document.createElement("div");
    groupDom.className = "group-title";
    var processDefault = true, arg = {control:this, dom:groupDom, groupString:group, processDefault:false};
    if (this.getListenerCount("onRenderGroupTitle")) {
        this.fireEvent("onRenderGroupTitle", this, arg);
        processDefault = arg.processDefault;
    }
    if (processDefault) {
        var titleDom = document.createElement("span");
        titleDom.innerHTML = group || "";
        titleDom.className = "title";
        groupDom.appendChild(titleDom);
    }
    return groupDom;
}, refreshGroupTitle:function (scrollTop) {
    var list = this, offsets = list._offsets, targets = list._targets, activeTarget = list._activeTarget, i, edge = false;
    if (!list._groupable) {
        return;
    }
    if (scrollTop < 0) {
        $fly(list._doms.fixedItem).css("display", "none");
    } else {
        $fly(list._doms.fixedItem).css("display", "");
    }
    for (i = offsets.length; i--; ) {
        if (scrollTop + 27 > offsets[i] && scrollTop + 27 < offsets[i] + 27) {
            $fly(list._doms.fixedItem).css("top", offsets[i] - scrollTop - 27);
            edge = true;
        } else {
            if (activeTarget != targets[i]) {
                if (scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1])) {
                    list.activate(targets[i], i);
                }
            }
        }
    }
    if (!edge) {
        $fly(list._doms.fixedItem).css("top", 0);
    }
}, activate:function (target, index) {
    var list = this, dom = list._dom, doms = list._doms;
    list._activeTarget = target;
    $fly(dom).find(".group-title").removeClass("active");
    $fly(target).addClass("active");
    $fly(doms.fixedItem).html(target.innerHTML);
    $fly(list._doms.fixedItem).css("top", 0);
}, refreshGroup:function () {
    var list = this, doms = list._doms;
    if (!list._groupable) {
        return;
    }
    list._targets = jQuery(doms.itemsWrap).find(".group-title").map(function () {
        return this;
    });
    list._offsets = jQuery.map(list._targets, function (id) {
        return jQuery(id).position().top;
    });
}, doOnItemTapHold:function (item, dom) {
    var list = this;
    list.fireEvent("onItemTapHold", list, {item:item, dom:dom});
}, doOnItemSwipe:function (item, target, event) {
    var list = this;
    list.fireEvent("onItemSwipe", list, {direction:event.gesture.direction, item:item});
    if (list._actionGroupEnabled && item) {
        list.showActionGroup(item, target);
    }
}, doOnItemTap:function (item, dom, event) {
    var list = this;
    list.fireEvent("onItemTap", list, {item:item, dom:dom, event:event, target:event.target});
    document.activeElement.blur();
}, notifySizeChange:function () {
    $invokeSuper.call(this, arguments);
    if (this._modernScroller) {
        this._modernScroller.update();
    }
}, findItemDomByEvent:function (evt) {
    var target = evt.srcElement || evt.target, body = this._doms.itemsWrap;
    target = target || evt;
    return $DomUtils.findParent(target, function (parentNode) {
        return parentNode.parentNode == body;
    });
}, getDefaultRenderer:function () {
    var result = this._defaultRenderer;
    if (!result) {
        this._defaultRenderer = result = new dorado.widget.list.ListBoxRowRenderer({});
    }
    return result;
}, createItemModel:function () {
    return new dorado.touch.ListItemModel(this);
}, getCurrentItem:function () {
    return this._currentRow ? $fly(this._currentRow).data("item") : null;
}, setCurrentItem:function (row) {
    this.set("currentIndex", row ? this._itemModel.getItemIndex($fly(row).data("item")) : -1);
    return true;
}, getCurrentItemId:function () {
    var current = this.getCurrentItem();
    return current ? this.getItemId(current) : null;
}, getCurrentItemIdForRefresh:function () {
    var current = this._itemModel.getItems().current;
    return current ? this.getItemId(current) : null;
}, hideActionGroup:function () {
    var list = this, leftActionGroup = list._leftActionGroup, rightActionGroup = list._rightActionGroup, actionMask = list._actionMask;
    if (leftActionGroup) {
        leftActionGroup._dom.style.zIndex = "";
    }
    if (rightActionGroup) {
        rightActionGroup._dom.style.zIndex = "";
    }
    var animateDom = list._actionGroupItemDom;
    if (animateDom) {
        jQuery(animateDom).anim({}, 0.2, "ease-out", function () {
            jQuery(animateDom).css({"transition":"", "-webkit-transition":"", "-moz-transition":""});
            if (actionMask) {
                actionMask.style.display = "none";
            }
            if (leftActionGroup) {
                leftActionGroup._dom.style.display = "none";
            }
            if (rightActionGroup) {
                rightActionGroup._dom.style.display = "none";
            }
            dorado.Fx.cancelTranslateElement(list._actionGroupItemDom);
            list._actionGroupItem = null;
            list._actionGroupItemDom = null;
        });
        dorado.Fx.translateElement(animateDom, 0.00001, null);
    } else {
        if (actionMask) {
            actionMask.style.display = "none";
        }
        if (leftActionGroup) {
            leftActionGroup._dom.style.display = "none";
        }
        if (rightActionGroup) {
            rightActionGroup._dom.style.display = "none";
        }
        list._actionGroupItem = null;
    }
}, showActionGroup:function (item, itemDom) {
    var list = this, actionMask = this._actionMask, leftActionGroup = this._leftActionGroup, rightActionGroup = this._rightActionGroup;
    if (!actionMask) {
        actionMask = this._actionMask = document.createElement("div");
        actionMask.className = "t-list-action-mask";
        list._doms.content.appendChild(actionMask);
        if (leftActionGroup) {
            if (!leftActionGroup._bindTapEvent) {
                leftActionGroup.addListener("onTap", function () {
                    list.hideActionGroup();
                });
                leftActionGroup._bindTapEvent = true;
            }
            leftActionGroup.render(list._doms.content, list._doms.itemsWrap);
            leftActionGroup._dom.style.position = "absolute";
            leftActionGroup.refresh();
        }
        if (rightActionGroup) {
            if (!rightActionGroup._bindTapEvent) {
                rightActionGroup.addListener("onTap", function () {
                    list.hideActionGroup();
                });
                rightActionGroup._bindTapEvent = true;
            }
            rightActionGroup.render(list._doms.content, list._doms.itemsWrap);
            rightActionGroup._dom.style.position = "absolute";
            rightActionGroup.refresh();
        }
        Hammer(actionMask, {drag:false, transform:false}).on("touch", function (event) {
            if (rightActionGroup && (rightActionGroup._dom == event.target || jQuery.contains(rightActionGroup._dom, event.target))) {
                return;
            }
            if (leftActionGroup && (leftActionGroup._dom == event.target || jQuery.contains(leftActionGroup._dom, event.target))) {
                return;
            }
            list.hideActionGroup();
            event.stopPropagation();
        });
    }
    list._actionGroupItem = item;
    list._actionGroupItemDom = itemDom;
    actionMask.style.display = "";
    if (itemDom) {
        if (rightActionGroup && rightActionGroup._dom) {
            rightActionGroup._dom.style.display = "";
            rightActionGroup._dom.style.zIndex = "";
            var dom = rightActionGroup._dom;
            $DomUtils.dockAround(dom, itemDom, {vAlign:"center", align:"innerright"});
            var width = dom.offsetWidth, left = parseInt(dom.style.left, 10);
            dom.style.width = 0;
            dom.style.left = left + width + "px";
            jQuery(dom).css({left:left, width:width});
        }
        if (leftActionGroup && leftActionGroup._dom) {
            leftActionGroup._dom.style.display = "";
            leftActionGroup._dom.style.zIndex = "";
            var dom = leftActionGroup._dom;
            $DomUtils.dockAround(dom, itemDom, {vAlign:"center", align:"innerleft"});
            var width = dom.offsetWidth, left = parseInt(dom.style.left, 10);
            dom.style.width = 0;
            dom.style.left = left + width + "px";
            jQuery(dom).css({left:left, width:width});
        }
    }
}, startPullDownAction:function () {
    var list = this;
    list.fireEvent("onPullDownRelease", list, {});
}, finishPullDownAction:function () {
    var list = this, pulldownDom = list._doms.pulldown;
    setTimeout(function () {
        pulldownDom.className = "pull-down-wrap";
        list._modernScroller.scroller.finishPullToRefresh();
    }, 500);
}});
dorado.touch.DataListBox = $extend([dorado.touch.ListBox, dorado.widget.DataControl], {$className:"dorado.touch.DataListBox", ATTRIBUTES:{selection:{setter:function (selection) {
    this.refresh();
    $invokeSuper.call(this, arguments);
}}, pullDownAction:{defaultValue:"none"}, supportsPaging:{}}, setCurrentItem:function (row) {
    var item = (row ? $fly(row).data("item") : null);
    if (item) {
        var entityList = this._itemModel.getItems();
        if (dorado.DataUtil.isOwnerOf(item, entityList)) {
            entityList.setCurrent(item);
            if (entityList.current == item) {
                this.setCurrentEntity(item);
                return true;
            }
        }
    }
    return false;
}, refreshEntity:function (entity) {
    var row = this.getItemDom(entity);
    if (row) {
        this.refreshItemDom(row, entity);
    }
}, refreshDom:function (dom) {
    var entityList = this.getBindingData({firstResultOnly:true, acceptAggregation:true});
    if (entityList && !(entityList instanceof dorado.EntityList)) {
        throw new dorado.ResourceException(dorado.list.BindingTypeMismatch);
    }
    var oldItems = this._itemModel.getItems();
    if (oldItems != entityList) {
        this._itemModel.setItems(entityList);
        this._isLastPage = entityList ? entityList.pageNo == entityList.pageCount : true;
        this.set("selection", null);
    }
    $invokeSuper.call(this, arguments);
}, setCurrentEntity:function (entity) {
    var currentItem = this._currentRow ? $fly(this._currentRow).data("item") : null;
    if (currentItem == entity) {
        return;
    }
    var row = this.getItemDom(entity);
    this.setCurrentRow(row);
    if (row) {
        this.scrollCurrentIntoView();
    }
    this.fireEvent("onCurrentChange", this);
}, filterDataSetMessage:function (messageCode, arg) {
    var itemModel = this._itemModel, items = itemModel.getItems();
    switch (messageCode) {
      case dorado.widget.DataSet.MESSAGE_REFRESH:
        return true;
      case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
        return (!items || arg.entityList == items || dorado.DataUtil.isOwnerOf(items, arg.entityList));
      case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
      case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
        return (!items || items._observer != this._dataSet || arg.entity.parent == items || dorado.DataUtil.isOwnerOf(items, arg.entity));
      case dorado.widget.DataSet.MESSAGE_DELETED:
        return (arg.entity.parent == items || dorado.DataUtil.isOwnerOf(items, arg.entity));
      case dorado.widget.DataSet.MESSAGE_INSERTED:
        return (arg.entityList == items);
      case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
        return (arg.entity.parent == items);
      case dorado.widget.DataSet.MESSAGE_LOADING_START:
      case dorado.widget.DataSet.MESSAGE_LOADING_END:
        if (arg.entityList) {
            return (items == arg.entityList || dorado.DataUtil.isOwnerOf(items, arg.entityList));
        } else {
            if (arg.entity) {
                var asyncExecutionTimes = dorado.DataPipe.MONITOR.asyncExecutionTimes;
                this.getBindingData({firstResultOnly:true, acceptAggregation:true});
                if (dorado.DataPipe.MONITOR.asyncExecutionTimes > asyncExecutionTimes) {
                    return true;
                } else {
                    this.hideLoadingTip();
                    return false;
                }
            } else {
                return true;
            }
        }
      default:
        return false;
    }
}, loadNextPage:function (callback) {
    var list = this, entityList = list.getBindingData();
    if (entityList instanceof dorado.EntityList && entityList.pageNo < entityList.pageCount) {
        var pageCount = entityList.pageCount;
        entityList.nextPage(function (result) {
            var lastPage = false;
            if (result.pageNo == pageCount) {
                lastPage = true;
            }
            callback && callback(lastPage, result);
        });
    } else {
        callback && callback(true);
    }
}, startPullDownAction:function () {
    var list = this;
    $invokeSuper.call(this, arguments);
    if (list._pullDownAction == "flush") {
        var dataSet = list._dataSet;
        if (dataSet) {
            dataSet.flushAsync(function () {
                list.finishPullDownAction();
            });
        } else {
            list.finishPullDownAction();
        }
    }
}, processDataSetMessage:function (messageCode, arg, data) {
    switch (messageCode) {
      case dorado.widget.DataSet.MESSAGE_REFRESH:
        this.refresh(true);
        break;
      case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
        if (arg.entityList == this._itemModel.getItems()) {
            var oldCurrentEntity = this.getCurrentItem();
            if (!oldCurrentEntity || (oldCurrentEntity.page && oldCurrentEntity.page.pageNo != arg.entityList.pageNo)) {
                this.set("items", arg.entityList);
                this.setCurrentEntity(arg.entityList.current);
            } else {
                this.setCurrentEntity(arg.entityList.current);
            }
        } else {
            this.refresh(true);
        }
        break;
      case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
        var items = this._itemModel.getItems();
        if (!items || items._observer != this._dataSet || dorado.DataUtil.isOwnerOf(items, arg.entity)) {
            this.refresh(true);
        }
      case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
        var items = this._itemModel.getItems();
        if (!items || items._observer != this._dataSet) {
            this.refresh(true);
            this.refreshEntity(arg.entity);
            if (arg.newValue && arg.newValue != arg.entity) {
                this.refreshEntity(arg.newValue);
            }
        } else {
            this.refreshEntity(arg.entity);
        }
        break;
      case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
        break;
      case dorado.widget.DataSet.MESSAGE_DELETED:
      case dorado.widget.DataSet.MESSAGE_INSERTED:
        var list = this;
        setTimeout(function () {
            list.refreshList();
            list._modernScroller.update();
        }, 10);
        break;
      case dorado.widget.DataSet.MESSAGE_LOADING_START:
        break;
      case dorado.widget.DataSet.MESSAGE_LOADING_END:
        break;
    }
}});
dorado.touch.AbstractNestedList = $extend(dorado.touch.Panel, {$className:"dorado.touch.AbstractNestedList", ATTRIBUTES:{backButton:{componentReference:true}, renderer:{}, selection:{setter:function (value) {
    if (this._stack) {
        var list = this._stack.getCurrentControl();
        if (list) {
            list.set("selection", value);
        }
    }
}, getter:function () {
    if (this._stack) {
        var list = this._stack.getCurrentControl();
        if (list) {
            return list.get("selection");
        }
    }
}}, selectionMode:{defaultValue:"none", skipRefresh:true}}, EVENTS:{onLeafItemTap:{}, onItemTap:{}, onItemTapHold:{}, onItemSwipe:{}, onRenderRow:{}, onListChange:{}, onCurrentChange:{}, onSelectionChange:{}}, showBackButton:function () {
    var stack = this._stack;
    if (!this._backButton && !this._autoBackButton) {
        this._autoBackButton = new dorado.touch.Button({type:"back", visible:false, onClick:function () {
            stack.popControl();
        }});
        if (this._toolbar) {
            this._toolbar.addItem(this._autoBackButton, 0);
            if (this._toolbar.get("items").size == 1) {
                this._toolbar.addItem(new dorado.touch.Spacer());
            }
        }
    } else {
        if (this._backButton && !this._initSetBackButton) {
            this._backButton.set({visible:false, onClick:function () {
                stack.popControl();
            }});
            this._initSetBackButton = true;
        }
    }
    if (this._backButton) {
        this._backButton.set("visible", true);
        this._backButton.refresh();
    } else {
        this._autoBackButton.set("visible", true);
        this._autoBackButton.refresh();
    }
}, hideBackButton:function () {
    if (this._backButton) {
        this._backButton.set("visible", false);
        this._backButton.refresh();
    } else {
        if (this._autoBackButton) {
            this._autoBackButton.set("visible", false);
            this._autoBackButton.refresh();
        }
    }
}, isRootList:function () {
    if (this._stack) {
        return this._stack.isRoot();
    }
    return true;
}, popList:function () {
    if (this._stack && !this.isRootList()) {
        return this._stack.popControl();
    }
    return null;
}});
dorado.touch.NestedList = $extend(dorado.touch.AbstractNestedList, {$className:"dorado.touch.NestedList", ATTRIBUTES:{caption:{defaultValue:" "}, items:{}, property:{}}, constructor:function () {
    $invokeSuper.call(this, arguments);
    this._listPool = new dorado.util.ObjectPool({makeObject:function () {
        return new dorado.touch.ListBox();
    }, passivateObject:function (control) {
        control.clearListeners("onItemTap");
        control.clearListeners("onItemSwipe");
        control.clearListeners("onItemTapHold");
        control.clearListeners("onCurrentChange");
        control.clearListeners("onRenderRow");
        control.clearListeners("onSelectionChange");
    }});
}, doOnOpenerChange:function (data) {
    var list = this;
    if (data) {
        list.set("caption", data[list._property]);
    } else {
        list.set("caption", list._caption);
    }
    list.fireEvent("onListChange", list, {item:data, list:list._stack.getCurrentControl()});
}, borrowListBox:function (items) {
    var nestedList = this, list = this._listPool.borrowObject();
    for (var i = 0, j = items.length; i < j; i++) {
        var item = items[i];
        item.leaf = !item.items;
    }
    list.set({items:items, property:nestedList._property, selectionMode:nestedList._selectionMode, renderer:nestedList._renderer, listener:{onItemTap:function (list, arg) {
        var item = arg.item, leaf = true;
        if (item.items) {
            nestedList.doOnListItemTap(item);
        } else {
            leaf = false;
            nestedList.fireEvent("onLeafItemTap", nestedList, {item:item});
        }
        nestedList.fireEvent("onItemTap", list, {item:item, leaf:leaf});
    }, onCurrentChange:function (list, arg) {
        if (nestedList && nestedList._stack) {
            if (nestedList._stack.getCurrentControl() == list) {
                nestedList.fireEvent("onCurrentChange", list, arg);
            }
        }
    }, onRenderRow:function (list, arg) {
        if (nestedList && nestedList._stack) {
            if (nestedList.getListenerCount("onRenderRow") && nestedList._stack.getCurrentControl() == list) {
                nestedList.fireEvent("onRenderRow", list, arg);
            } else {
                arg.processDefault = true;
            }
        }
    }, onSelectionChange:function (list, arg) {
        if (nestedList && nestedList._stack) {
            if (nestedList.getListenerCount("onSelectionChange") && nestedList._stack.getCurrentControl() == list) {
                nestedList.fireEvent("onSelectionChange", list, arg);
            }
        }
    }, onItemSwipe:function (list, arg) {
        var item = arg.item, leaf = true;
        if (item && item.items) {
            leaf = false;
        }
        nestedList.fireEvent("onItemSwipe", list, {item:item, leaf:leaf});
    }, onItemTapHold:function (list, arg) {
        var item = arg.item, leaf = true;
        if (item && item.items) {
            leaf = false;
        }
        nestedList.fireEvent("onItemTapHold", list, {item:item, leaf:leaf});
    }}});
    return list;
}, doOnListItemTap:function (item) {
    var nestedList = this, stack = this._stack, list = this.borrowListBox(item.items);
    list._parentData = item;
    nestedList.doOnOpenerChange(item);
    stack.pushControl(list);
}, createDom:function () {
    var nestedList = this, items = this._items || [], topData = [], stack;
    for (var i = 0, j = items.length; i < j; i++) {
        var item = items[i];
        topData.push(item);
    }
    var list = this.borrowListBox(topData);
    stack = new dorado.touch.Stack({items:[list], layoutConstraint:{region:"center"}, destroyControlOnPop:false, onStackChange:function (self, arg) {
        if (arg.length > 1) {
            nestedList.showBackButton();
        } else {
            nestedList.hideBackButton();
        }
    }, onPopControl:function (self, arg) {
        if (arg && arg.control) {
            nestedList._listPool.returnObject(arg.control);
        }
        var innerList = self.getCurrentControl();
        nestedList.doOnOpenerChange(innerList._parentData);
    }});
    this._stack = stack;
    this.addChild(stack);
    return $invokeSuper.call(this, arguments);
}});
dorado.touch.InnerList = $extend(dorado.touch.ListBox, {$className:"dorado.touch.InnerList", ATTRIBUTES:{bindingConfigs:{}, data:{}, parentData:{}, currentIndex:{setter:function () {
    $invokeSuper.call(this, arguments);
    if (this._list && this._list._stack) {
        if (this._list._stack.getCurrentControl() == this) {
            this._list.fireEvent("onCurrentChange", this._list);
        }
    }
}}}, constructor:function () {
    $invokeSuper.call(this, arguments);
}, refreshItemDom:function (row, item) {
    $invokeSuper.call(this, arguments);
    if (this.isHasChild(item)) {
        $fly(row).addClass("disclosure");
    } else {
        $fly(row).removeClass("disclosure");
    }
}, replaceSelection:function () {
    var result = $invokeSuper.call(this, arguments);
    var nestedList = this._list;
    if (nestedList.getListenerCount("onSelectionChange") && nestedList._stack && nestedList._stack.getCurrentControl() == this) {
        nestedList.fireEvent("onSelectionChange", nestedList, result);
    }
}, doRefreshItemDomData:function (row, item) {
    var bindingConfig = this.getBindingConfigForItem(item), nestedList = this._list, contentDom = $fly(row).find(".item-content")[0], processDefault = true, arg = {dom:contentDom, data:item, property:bindingConfig.labelProperty || this._property, bindingConfig:bindingConfig, processDefault:false};
    if (this.getListenerCount("onRenderRow")) {
        this.fireEvent("onRenderRow", this, arg);
        processDefault = arg.processDefault;
    }
    if (nestedList.getListenerCount("onRenderRow") && nestedList._stack && nestedList._stack.getCurrentControl() == this) {
        nestedList.fireEvent("onRenderRow", nestedList, arg);
        processDefault = arg.processDefault;
    }
    if (processDefault) {
        (bindingConfig.renderer || this._renderer || $singleton(dorado.widget.list.ListBoxRowRenderer)).render(contentDom, arg);
    }
}, _getEntityProperty:function (entity, property) {
    if (!entity || !property) {
        return null;
    }
    return (entity instanceof dorado.Entity) ? entity.get(property) : entity[property];
}, isHasChild:function (item) {
    function ifHasChild(entity, property) {
        if (!property) {
            return false;
        }
        var hasChild = false, value;
        if (entity instanceof dorado.Entity) {
            value = entity._data[property];
            if (value === undefined) {
                if (entity.dataType) {
                    var pd = entity.dataType.getPropertyDef(property);
                    hasChild = (pd.getDataPipe && pd.getDataPipe(entity) != null);
                }
            } else {
                if (value) {
                    if (value instanceof dorado.EntityList) {
                        hasChild = (!value.isNull && value.entityCount);
                    } else {
                        if (value.isDataPipeWrapper || typeof value == "object" && !(value instanceof Date)) {
                            hasChild = true;
                        }
                    }
                }
            }
        } else {
            value = entity[property];
            if (value && typeof value == "object" && !(value instanceof Date)) {
                hasChild = true;
            }
        }
        return hasChild;
    }
    var bindingConfig = this.getBindingConfigForItem(item);
    if (bindingConfig.hasChildProperty != undefined) {
        return this._getEntityProperty(item, bindingConfig.hasChildProperty);
    }
    var hasChild = false;
    if (item && item instanceof dorado.Entity) {
        if (bindingConfig.recursive) {
            hasChild = ifHasChild(item, bindingConfig.childrenProperty);
        }
        if (!hasChild && bindingConfig.childBindingConfigs) {
            var childBindingConfigs = bindingConfig.childBindingConfigs;
            if (childBindingConfigs) {
                for (var i = 0; i < childBindingConfigs.length; i++) {
                    hasChild = ifHasChild(item, childBindingConfigs[i].childrenProperty);
                    if (hasChild) {
                        break;
                    }
                }
            }
        }
    }
    return hasChild;
}, doOnItemTapHold:function (item) {
    var list = this;
    list._list.fireEvent("onItemTapHold", list._list, {item:item, leaf:!list.isHasChild(item)});
    $invokeSuper.call(this, arguments);
}, doOnItemSwipe:function (item, target, event) {
    var list = this;
    list._list.fireEvent("onItemSwipe", list._list, {angle:event.angle, direction:event.direction, item:item, leaf:!list.isHasChild(item)});
    $invokeSuper.call(this, arguments);
}, doOnItemTap:function (item) {
    var list = this, bindingConfigs = list._bindingConfigs, leaf = true;
    if (item) {
        if (list.isHasChild(item)) {
            leaf = false;
            var bindingConfig = list.getBindingConfigForItem(item), listBindingConfigs = [];
            for (var i = 0, j = bindingConfigs.length; i < j; i++) {
                if (bindingConfigs[i].recursive && bindingConfigs[i] == bindingConfig) {
                    bindingConfigs[i].expandLevel = bindingConfigs[i].expandLevel ? bindingConfigs[i].expandLevel + 1 : 1;
                    listBindingConfigs.push(bindingConfigs[i]);
                }
            }
            var childBindingConfigs = bindingConfig.childBindingConfigs;
            if (childBindingConfigs) {
                if (childBindingConfigs instanceof Array) {
                    listBindingConfigs = listBindingConfigs.concat(childBindingConfigs);
                } else {
                    listBindingConfigs.push(bindingConfig.childBindingConfigs);
                }
            }
            list._list.doOnListItemTap(item, listBindingConfigs);
        } else {
            list._list.fireEvent("onLeafItemTap", list._list, {item:item});
        }
    }
    list._list.fireEvent("onItemTap", list._list, {item:item, leaf:leaf});
    $invokeSuper.call(this, arguments);
}, getBindingConfigForItem:function (item) {
    if (item) {
        return this._list._bindingConfigMap[item.entityId];
    }
    return null;
}, setBindingConfigForItem:function (item, bindingConfig) {
    if (item) {
        this._list._bindingConfigMap[item.entityId] = bindingConfig;
    }
}, refreshData:function (callback) {
    var nodes = [];
    function processBindingConfig(bindingConfig, entity, startIndex) {
        function addNode(entity) {
            nodes.push(entity);
        }
        if (entity instanceof dorado.EntityList) {
            for (var it = entity.iterator({currentPage:true}); it.hasNext(); ) {
                var d = it.next();
                addNode(d);
                innerList.setBindingConfigForItem(d, bindingConfig);
                startIndex++;
            }
        } else {
            if (entity instanceof dorado.Entity) {
                addNode(entity);
                innerList.setBindingConfigForItem(entity, bindingConfig);
                startIndex++;
            }
        }
        return startIndex;
    }
    this._childrenPrepared = true;
    var innerList = this, list = this._list, bindingConfig = innerList._bindingConfigs;
    var isRoot = (this == list._root), data = this._data, parentData = this._parentData;
    if (isRoot && list) {
        this._data = data = list.getBindingData({firstResultOnly:true, acceptAggregation:true});
    }
    var asyncTasks = [], self = this;
    $waitFor(asyncTasks, {callback:function (success, result) {
        var nodesTimestamp = 0, infos = [];
        var bindingConfig = innerList._bindingConfigs;
        if (isRoot) {
            if (bindingConfig && data) {
                for (var i = 0, j = bindingConfig.length; i < j; i++) {
                    nodesTimestamp += data.timestamp;
                    infos.push({bindingConfig:bindingConfig[i], data:data});
                }
            }
        } else {
            if (bindingConfig) {
                for (var i = 0, j = bindingConfig.length; i < j; i++) {
                    var childrenProperty = bindingConfig[i].childrenProperty;
                    if (childrenProperty && parentData) {
                        var children = parentData.get(childrenProperty);
                        nodesTimestamp += children.timestamp;
                        infos.push({bindingConfig:bindingConfig[i], data:children});
                    }
                }
            }
        }
        if (true || self._nodesTimestamp != nodesTimestamp) {
            self._nodesTimestamp = nodesTimestamp;
            self._visibleChildNodeCount = 0;
            var startIndex = 0;
            try {
                for (var i = 0; i < infos.length; i++) {
                    var info = infos[i];
                    startIndex = processBindingConfig.call(self, info.bindingConfig, info.data, startIndex);
                }
                if (startIndex == 0) {
                    self._hasChild = false;
                }
            }
            finally {
            }
            innerList.set("items", nodes);
        }
        if (callback) {
            $callback(callback, success, result);
        }
    }});
}});
dorado.touch.DataNestedList = $extend([dorado.touch.AbstractNestedList, dorado.widget.DataControl], {$className:"dorado.touch.DataNestedList", ATTRIBUTES:{caption:{defaultValue:" "}, bindingConfigs:{writeBeforeReady:true, setter:function (bindingConfigs) {
    this._root.set("bindingConfigs", bindingConfigs);
}, getter:function () {
    return this._root.get("bindingConfigs");
}}, currentNodeDataPath:{writeBeforeReady:true}}, getBindingConfigForItem:function (item) {
    if (item) {
        return this._bindingConfigMap[item.entityId];
    }
    return null;
}, constructor:function () {
    var list = this;
    list._listPool = new dorado.util.ObjectPool({makeObject:function () {
        var result = new dorado.touch.InnerList();
        result._list = list;
        return result;
    }, passivateObject:function (control) {
    }});
    list._root = list._listPool.borrowObject();
    list._bindingConfigMap = {};
    $invokeSuper.call(list, arguments);
}, onReady:function () {
    var nestedList = this;
    nestedList._root.set({selectionMode:nestedList._selectionMode, property:nestedList._property, renderer:nestedList._renderer});
    if (this._currentNodeDataPath) {
        dorado.DataPath.registerInterceptor(this._currentNodeDataPath, function (data) {
            return nestedList.getCurrentItem();
        }, function (dataType) {
            var entity = nestedList.getCurrentItem();
            return entity ? entity.dataType : dataType;
        });
        this.bind("onCurrentChange", function () {
            nestedList.disableBinding();
            nestedList.get("dataSet").notifyObservers();
            nestedList.enableBinding();
        });
    }
    $invokeSuper.call(nestedList, arguments);
}, doOnListItemTap:function (item, bindingConfigs) {
    var nestedList = this;
    nestedList.showChildren(item, bindingConfigs);
}, showChildren:function (data, bindingConfigs) {
    var nestedList = this, stack = this._stack, list = nestedList._listPool.borrowObject();
    list.set({parentData:data, property:nestedList._property, selectionMode:nestedList._selectionMode, bindingConfigs:bindingConfigs, renderer:nestedList._renderer});
    stack.pushControl(list);
    nestedList.doOnOpenerChange(data);
    list.refreshData();
}, doOnOpenerChange:function (data) {
    var list = this, bindingConfig = list.getBindingConfigForItem(data);
    if (bindingConfig && bindingConfig.labelProperty) {
        list.set("caption", data.get(bindingConfig.labelProperty));
    } else {
        list.set("caption", list._caption);
    }
    list.fireEvent("onListChange", list, {item:data, bindingConfig:bindingConfig, list:list._stack.getCurrentControl()});
}, refreshDom:function (dom) {
    var bindingConfigs = this.get("bindingConfigs");
    if (!bindingConfigs || !bindingConfigs.length) {
        throw new dorado.Exception("NestedDataList " + this._id + ".bindingConfigs is undefined.");
    }
    if (this._dataSet) {
        var data = this.getBindingData({firstResultOnly:true, acceptAggregation:true});
        if (!this._root._childrenPrepared || this._data != data || (this._data && this._data.pageNo != (this._pageNo || 0))) {
            this._data = data;
            this._pageNo = (data ? data.pageNo : 0);
            this._stack.popControlTo(this._root);
            this._root.refreshData(dorado._NULL_FUNCTION);
        }
    }
    $invokeSuper.call(this, [dom]);
}, filterDataSetMessage:function (messageCode, arg) {
    switch (messageCode) {
      case dorado.widget.DataSet.MESSAGE_REFRESH:
      case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
      case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
      case dorado.widget.DataSet.MESSAGE_DELETED:
      case dorado.widget.DataSet.MESSAGE_INSERTED:
      case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
        return true;
      case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
        if (this._data) {
            if (dorado.DataUtil.isOwnerOf(this._data, arg.entityList)) {
                return true;
            }
            if (this._data == arg.entityList && this._pageNo != arg.entityList.pageNo) {
                return true;
            }
        }
        return false;
      case dorado.widget.DataSet.MESSAGE_LOADING_START:
      case dorado.widget.DataSet.MESSAGE_LOADING_END:
        if (arg.entityList) {
            return (this._data == arg.entityList || dorado.DataUtil.isOwnerOf(this._data, arg.entityList));
        } else {
            return true;
        }
      default:
        return false;
    }
}, findInnerListByParentEntity:function (entity) {
    var stack = this._stack._stack;
    for (var i = 0; i < stack.length; i++) {
        var list = stack[i];
        if (list._parentData == entity) {
            return list;
        }
    }
}, findInnerListByEntity:function (entity) {
    var stack = this._stack._stack;
    for (var i = 0; i < stack.length; i++) {
        var list = stack[i], items = list.get("items");
        if (items) {
            if (items.indexOf(entity) != -1) {
                return list;
            }
        }
    }
    return null;
}, isEntityOpenChild:function (entity) {
    var stack = this._stack._stack;
    for (var i = 0; i < stack.length; i++) {
        var list = stack[i];
        if (list._parentData == entity) {
            return true;
        }
    }
    return false;
}, processDataSetMessage:function (messageCode, arg, data) {
    var innerList;
    switch (messageCode) {
      case dorado.widget.DataSet.MESSAGE_REFRESH:
        this.refresh(true);
        break;
      case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
      case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
        if (this.getBindingData() != this._data) {
            this.refresh(true);
        } else {
            innerList = this.findInnerListByEntity(arg.entity);
            if (innerList) {
                innerList.refresh();
            }
        }
        break;
      case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
        if (this.getBindingData() != this._data) {
            this.refresh(true);
        } else {
            innerList = this.findInnerListByEntity(arg.entity);
            if (innerList) {
                innerList.refresh();
            }
        }
        break;
      case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
        break;
      case dorado.widget.DataSet.MESSAGE_DELETED:
        innerList = this.findInnerListByEntity(arg.entity);
        if (innerList) {
            innerList.refreshData();
            if (this.isEntityOpenChild(arg.entity)) {
                this._stack.popControlTo(innerList);
            }
        }
        break;
      case dorado.widget.DataSet.MESSAGE_INSERTED:
        var parentEntity = arg.entity.parent, parentEntityList;
        if (parentEntity) {
            if (parentEntity instanceof dorado.EntityList) {
                parentEntityList = parentEntity;
                parentEntity = parentEntity.parent;
            }
        }
        if (parentEntity instanceof dorado.Entity) {
            innerList = this.findInnerListByParentEntity(parentEntity);
        }
        if (!innerList && parentEntityList == this._root._data) {
            innerList = this._root;
        }
        if (innerList) {
            innerList.refreshData();
        }
        break;
      case dorado.widget.DataSet.MESSAGE_LOADING_START:
        break;
      case dorado.widget.DataSet.MESSAGE_LOADING_END:
        break;
    }
}, getCurrentItem:function () {
    return this._stack && this._stack.getCurrentControl().get("currentItem");
}, createDom:function () {
    var nestedList = this, stack;
    nestedList._root.set({property:nestedList._property, renderer:nestedList._renderer});
    stack = new dorado.touch.Stack({items:[nestedList._root], layoutConstraint:{region:"center"}, destroyControlOnPop:false, onStackChange:function (self, arg) {
        if (arg.length > 1) {
            nestedList.showBackButton();
        } else {
            nestedList.hideBackButton();
        }
    }, onPopControl:function (self, arg) {
        if (arg && arg.control) {
            nestedList._listPool.returnObject(arg.control);
        }
        var innerList = self.getCurrentControl();
        nestedList.doOnOpenerChange(innerList._parentData);
    }});
    this._stack = stack;
    this.addChild(stack);
    return $invokeSuper.call(this, arguments);
}});

