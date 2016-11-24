


(function () {
    var currentException, exceptionDialog, detailExceptionDialog;
    var exceptionDialogMinWidth = 300;
    var exceptionDialogMaxWidth = 800;
    var exceptionDialogMaxHeight = 500;
    dorado.widget.UpdateAction.alertException = function (e) {
        currentException = e;
        $import("grid", function () {
            var dialog = getExceptionDialog();
            dialog.set({ caption: $resource("dorado.baseWidget.ExceptionDialogTitle"), left: undefined, top: undefined, width: exceptionDialogMaxWidth, height: undefined });
            dialog._textDom.innerText = dorado.Exception.getExceptionMessage(e) + "\n";
            dialog.show();
        });
    };
    function getExceptionDialog() {
        if (!exceptionDialog) {
            var doms = {};
            var contentDom = $DomUtils.xCreate({ tagName: "DIV", className: "d-exception-content", content: [{ tagName: "SPAN", className: "d-exception-icon", contextKey: "iconDom" }, { tagName: "SPAN", className: "d-exception-text", contextKey: "textDom" }] }, null, doms);
            exceptionDialog = new dorado.widget.Dialog({
                center: true, modal: true, resizeable: false, contentOverflow: "visible", layout: { $type: "Native" }, buttonAlign: "right", buttons: [{
                    caption: $resource("dorado.baseWidget.ExceptionDialogOK"), width: 85, onClick: function () {
                        exceptionDialog.hide();
                    }
                }], afterShow: function (dialog) {
                    var buttons = dialog._buttons, button;
                    if (buttons) {
                        button = buttons[0];
                        if (button && button._dom.style.display != "none") {
                            button.setFocus();
                        }
                    }
                }, beforeShow: function (dialog) {
                    getDetailLink().render(dialog._textDom);
                    var dom = dialog._dom;
                    var $dom = jQuery(dom), $contentDom = jQuery(contentDom);
                    var contentWidth = $fly(doms.iconDom).outerWidth() + $fly(doms.textDom).outerWidth();
                    if (contentWidth < exceptionDialogMinWidth) {
                        contentWidth = exceptionDialogMinWidth;
                    } else {
                        if (contentWidth > exceptionDialogMaxWidth) {
                            contentWidth = exceptionDialogMaxWidth;
                        }
                    }
                    var dialogWidth = $dom.width(), panelWidth = $contentDom.width();
                    dialog._width = contentWidth + dialogWidth - panelWidth;
                    var contentHeight = $contentDom.outerHeight();
                    if (contentHeight > exceptionDialogMaxHeight) {
                        contentHeight = exceptionDialogMaxHeight;
                    } else {
                        contentHeight = null;
                    }
                    if (contentHeight) {
                        var dialogHeight = $dom.height(), panelHeight = $contentDom.height();
                        dialog._height = contentHeight + dialogHeight - panelHeight;
                    }
                    dialog.doOnResize();
                }
            });
            var containerDom = exceptionDialog.get("containerDom");
            containerDom.appendChild(contentDom);
            exceptionDialog._contentDom = contentDom;
            exceptionDialog._iconDom = doms.iconDom;
            exceptionDialog._textDom = doms.textDom;
        }
        return exceptionDialog;
    }
    var detailLink, detailDialog;
    function getDetailLink() {
        if (!detailLink) {
            detailLink = new dorado.widget.Link({
                text: $resource("dorado.baseWidget.ShowSubmitValidationDetail"), onClick: function (self, arg) {
                    arg.returnValue = false;
                    try {
                        showDetailExceptionDialog(currentException);
                    }
                    catch (e) {
                        dorado.Exception.processException(e);
                    }
                }
            });
        }
        return detailLink;
    }
    function showDetailExceptionDialog(e) {
        function translateMessage(items, messages) {
            messages.each(function (message) {
                var item = dorado.Object.clone(message);
                if (item.entity && item.property) {
                    var pd = item.entity.getPropertyDef(item.property);
                    if (pd) {
                        item.propertyCaption = pd.get("label");
                    }
                }
                items.push(item);
            });
        }
        var dialog = getDetailExceptionDialog();
        var items = [], validateContext = e.validateContext;
        if (validateContext) {
            if (validateContext.error) {
                translateMessage(items, validateContext.error);
            }
            if (validateContext.warn) {
                translateMessage(items, validateContext.warn);
            }
        }
        dialog._grid.set("items", items);
        dialog.show();
    }
    function getDetailExceptionDialog() {
        if (!detailExceptionDialog) {
            var grid = new dorado.widget.Grid({
                readOnly: true, dynaRowHeight: true, columns: [{
                    property: "state", caption: $resource("dorado.baseWidget.SubmitValidationDetailState"), width: 36, align: "center", onRenderCell: function (self, arg) {
                        var iconClass;
                        switch (arg.data.state) {
                            case "error":
                                iconClass = "d-update-action-icon-error";
                                break;
                            case "warn":
                                iconClass = "d-update-action-icon-warn";
                                break;
                        }
                        var $dom = $fly(arg.dom);
                        $dom.empty().xCreate({ tagName: "LABEL", className: iconClass, style: { width: 16, height: 16, display: "inline-block" } });
                        arg.processDefault = false;
                    }
                }, { property: "text", caption: $resource("dorado.baseWidget.SubmitValidationDetailMessage"), wrappable: true }, {
                    property: "property", caption: $resource("dorado.baseWidget.SubmitValidationDetailProperty"), width: 200, resizeable: true, onRenderCell: function (self, arg) {
                        if (arg.data.propertyCaption && arg.data.propertyCaption != arg.data.property) {
                            arg.dom.innerText = arg.data.propertyCaption + "(" + arg.data.property + ")";
                            arg.processDefault = false;
                        } else {
                            arg.processDefault = true;
                        }
                    }
                }], onDataRowDoubleClick: function (self, arg) {
                    var currentItem = self.get("currentEntity");
                    if (currentItem && currentItem.entity) {
                        currentItem.entity.setCurrent(true);
                    }
                }
            });
            detailExceptionDialog = new dorado.widget.Dialog({ caption: $resource("dorado.baseWidget.ShowSubmitValidationDetail"), width: 800, height: 280, center: true, modal: true, resizeable: true, layout: { regionPadding: 8 }, children: [{ $type: "ToolTip", text: $resource("dorado.baseWidget.SubmitValidationDetailTip"), floating: false, arrowDirection: "bottom", arrowAlign: "left" }, grid] });
            detailExceptionDialog._grid = grid;
        }
        return detailExceptionDialog;
    }
})();
(function () {
    var BUTTON_HOVER_CLASS = "-hover", BUTTON_CLICK_CLASS = "-click", BUTTON_TOGGLED_CLASS = "-toggled", BUTTON_TRIGGER_CLASS = "-trigger", ICON_CLASS = "d-icon";
    dorado.widget.Button = $extend(dorado.widget.AbstractButton, {
        $className: "dorado.widget.Button", focusable: true, ATTRIBUTES: { className: { defaultValue: "d-button" }, caption: {}, icon: {}, iconClass: {}, triggerToggled: {}, showTrigger: { writeBeforeReady: true }, splitButton: { writeBeforeReady: true }, width: { independent: true }, height: { independent: true, readOnly: true } }, EVENTS: { onTriggerClick: {} }, needSplit: function () {
            return this._showTrigger !== false && (this._splitButton === true || (this._splitButton !== false && !!(this.getListenerCount("onClick") && this._menu)));
        }, doOnKeyDown: function (event) {
            var retValue = true;
            var button = this;
            if (event.keyCode == 32 || event.keyCode == 13) {
                button.fireEvent("onClick", button);
                retValue = false;
            }
            return retValue;
        }, doSetToggle: function () {
            var button = this, dom = button._dom, doms = button._doms, cls = button._className;
            if (dom) {
                if (button._toggled) {
                    $fly(dom).addClass(cls + BUTTON_TOGGLED_CLASS);
                    $fly(doms.buttonLeft).addClass("button-left-toggled");
                    $fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-toggled");
                } else {
                    $fly(dom).removeClass(cls + BUTTON_TOGGLED_CLASS);
                    $fly(doms.buttonLeft).removeClass("button-left-toggled");
                    $fly(doms.buttonRight).removeClass("button-right-toggled");
                }
            }
        }, doShowMenu: function () {
            var button = this, menu = button._menu, dom = button._dom, doms = button._doms, cls = button._className;
            if (menu) {
                menu.bind("onShow", function () {
                    if (button._toggleOnShowMenu && !button._triggerToggled) {
                        if (!button.needSplit()) {
                            $fly(dom).addClass(cls + BUTTON_TOGGLED_CLASS);
                            $fly(doms.buttonLeft).addClass("button-left-toggled");
                            $fly(doms.buttonRight).addClass("button-right-toggled");
                        } else {
                            $fly(doms.buttonRight).addClass("button-right-toggled");
                        }
                        button._triggerToggled = true;
                    }
                    menu.bind("onHide", function () {
                        button.doAfterMenuHide();
                    }, { once: true });
                    if (!menu.doBeforeHide) {
                        menu.doBeforeHide = function () {
                            button.doBeforeMenuHide && button.doBeforeMenuHide();
                        };
                    }
                }, { once: true });
                menu._focusParent = button;
                menu.show({ anchorTarget: button, align: "innerleft", vAlign: "bottom" });
            }
        }, doAfterMenuHide: function () {
            var button = this, dom = button._dom;
            if (button._toggleOnShowMenu) {
                if (!button.needSplit()) {
                    $fly(dom).removeClass(button._className + BUTTON_TOGGLED_CLASS);
                    $fly(button._doms.buttonLeft).removeClass("button-left-toggled");
                    $fly(button._doms.buttonRight).removeClass("button-right-toggled");
                } else {
                    $fly(button._doms.buttonRight).removeClass("button-right-toggled");
                }
                button._triggerToggled = false;
            }
        }, _createIconSpan: function (dom) {
            var button = this, doms = button._doms, action = button._action || {};
            dom = dom || button._dom;
            if (dom) {
                var icon = document.createElement("span");
                icon.className = ICON_CLASS;
                icon.innerHTML = "&nbsp;";
                $fly(icon).prependTo(doms.buttonLeft).addClass(button._iconClass || action._iconClass);
                $DomUtils.setBackgroundImage(icon, button._icon || action._icon);
                doms.icon = icon;
            }
        }, onClick: function () {
            var button = this, action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
            if (!disabled) {
                $invokeSuper.call(this, arguments);
                if (this._menu && this.getListenerCount("onClick") == 0) {
                    this.doShowMenu();
                }
            }
        }, doOnResize: function () {
            if (dorado.Browser.msie && dorado.Browser.version < 7) {
                var button = this, dom = button._dom, width = button.getRealWidth();
                if (dom && width != null) {
                    $fly(dom).width(width);
                    var leftWidth = dom.offsetWidth - button._doms.buttonRight.offsetWidth - parseInt($fly(button._doms.buttonLeft).css("margin-left"), 10);
                    if (leftWidth > 0) {
                        $fly(button._doms.buttonLeft).outerWidth(leftWidth);
                    }
                }
            }
        }, onDisabledChange: function () {
            var button = this, dom = button._dom, cls = button._className;
            if (dom) {
                $fly(dom).removeClass(cls + BUTTON_HOVER_CLASS).removeClass(cls + "-focused");
                $fly(button._doms.buttonLeft).removeClass("button-left-hover");
                $fly(button._doms.buttonRight).removeClass("button-right-hover");
            }
        }, createDom: function () {
            var button = this, cls = button._className, doms = {}, action = button._action || {};
            var dom = $DomUtils.xCreate({ tagName: "span", content: [{ tagName: "span", className: "button-left", contextKey: "buttonLeft", content: { tagName: "span", className: "caption", content: button._caption || action._caption, contextKey: "caption" } }, { tagName: "span", className: "button-right", contextKey: "buttonRight" }] }, null, doms);
            button._doms = doms;
            $fly(doms.buttonLeft).hover(function () {
                var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
                if (!disabled && !button._toggled) {
                    $fly(dom).addClass(cls + BUTTON_HOVER_CLASS);
                    $fly(doms.buttonLeft).addClass("button-left-hover");
                    $fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-hover");
                }
            }, function () {
                $fly(dom).removeClass(cls + BUTTON_HOVER_CLASS);
                $fly(doms.buttonLeft).removeClass("button-left-hover");
                $fly(doms.buttonRight).removeClass("button-right-hover");
            }).mousedown(function () {
                var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
                if (!disabled) {
                    $fly(dom).addClass(cls + BUTTON_CLICK_CLASS);
                    $fly(doms.buttonLeft).addClass("button-left-click");
                    $fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-click");
                    $fly(document).one("mouseup", function () {
                        $fly(dom).removeClass(cls + BUTTON_CLICK_CLASS);
                        $fly(doms.buttonLeft).removeClass("button-left-click");
                        $fly(doms.buttonRight).removeClass("button-right-click");
                    });
                }
            });
            $fly(doms.buttonRight).hover(function () {
                var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
                if (!disabled) {
                    $fly(dom).addClass(button.needSplit() ? "" : cls + BUTTON_HOVER_CLASS);
                    $fly(doms.buttonLeft).addClass(button.needSplit() ? "" : "button-left-hover");
                    $fly(doms.buttonRight).addClass("button-right-hover");
                }
            }, function () {
                $fly(dom).removeClass(cls + BUTTON_HOVER_CLASS);
                $fly(doms.buttonLeft).removeClass("button-left-hover");
                $fly(doms.buttonRight).removeClass("button-right-hover");
            }).mousedown(function () {
                var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
                if (!disabled) {
                    $fly(dom).addClass(button.needSplit() ? "" : cls + BUTTON_CLICK_CLASS);
                    $fly(doms.buttonLeft).addClass(button.needSplit() ? "" : "button-left-click");
                    $fly(doms.buttonRight).addClass("button-right-click");
                    $fly(document).one("mouseup", function () {
                        $fly(dom).removeClass(cls + BUTTON_CLICK_CLASS);
                        $fly(doms.buttonLeft).removeClass("button-left-click");
                        $fly(doms.buttonRight).removeClass("button-right-click");
                    });
                }
            }).click(function (event) {
                var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
                if (!disabled) {
                    button.fireEvent("onTriggerClick", button);
                    if (button._menu) {
                        button.doShowMenu();
                    } else {
                        if (button.onClick(event) === false) {
                            return false;
                        }
                        button.fireEvent("onClick", button, { button: event.button, event: event });
                    }
                }
                event.stopImmediatePropagation();
            });
            if (button._toggleable) {
                if (button._toggled) {
                    $fly(dom).addClass(button._className + BUTTON_TOGGLED_CLASS);
                    $fly(doms.buttonLeft).addClass("button-left-toggled");
                    $fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-toggled");
                } else {
                    $fly(dom).removeClass(button._className + BUTTON_TOGGLED_CLASS);
                    $fly(doms.buttonLeft).removeClass("button-left-toggled");
                    $fly(doms.buttonRight).removeClass("button-right-toggled");
                }
            }
            $fly(dom).toggleClass("d-button-trigger " + cls + BUTTON_TRIGGER_CLASS, button._showTrigger === true || (!!button._menu && button._showTrigger !== false)).toggleClass(cls + "-disabled", !!(button._disabled || action._disabled || action._sysDisabled));
            var icon = button._icon || action._icon, iconCls = button._iconClass || action._iconClass;
            if (icon || iconCls) {
                button._createIconSpan(dom);
            }
            return dom;
        }, refreshDom: function (dom) {
            $invokeSuper.call(this, arguments);
            var button = this, cls = button._className, doms = button._doms, action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
            $fly(button._doms.caption).html(button._caption || action._caption);
            button._dom.disabled = disabled;
            $fly(dom).toggleClass("d-button-trigger " + cls + BUTTON_TRIGGER_CLASS, button._showTrigger === true || (!!button._menu && button._showTrigger !== false)).toggleClass(cls + "-disabled", !!(button._disabled || action._disabled || action._sysDisabled));
            if (button._toggleable) {
                if (button._toggled) {
                    $fly(dom).addClass(cls + BUTTON_TOGGLED_CLASS);
                    $fly(doms.buttonLeft).addClass("button-left-toggled");
                    $fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-toggled");
                } else {
                    $fly(dom).removeClass(cls + BUTTON_TOGGLED_CLASS);
                    $fly(doms.buttonLeft).removeClass("button-left-toggled");
                    $fly(doms.buttonRight).removeClass("button-right-toggled");
                }
            } else {
                if (!button.needSplit()) {
                    $fly(dom).toggleClass(cls + BUTTON_TOGGLED_CLASS, !!button._triggerToggled);
                    $fly(doms.buttonLeft).toggleClass("button-left-toggled", !!button._triggerToggled);
                    $fly(doms.buttonRight).toggleClass("button-right-toggled", !!button._triggerToggled);
                } else {
                    $fly(doms.buttonRight).toggleClass("button-right-toggled", !!button._triggerToggled);
                }
            }
            var icon = button._icon || action._icon, iconCls = button._iconClass || action._iconClass;
            if (!icon && !iconCls && doms.icon) {
                $fly(doms.icon).css("display", "none");
            } else {
                if (doms.icon) {
                    $fly(doms.icon).prop("className", ICON_CLASS).css("display", "");
                }
                if ((icon || iconCls) && !doms.icon) {
                    button._createIconSpan();
                }
                if (doms.icon) {
                    $DomUtils.setBackgroundImage(doms.icon, icon);
                }
                if (iconCls) {
                    $fly(doms.icon).addClass(iconCls);
                }
            }
            button.onResize();
        }
    });
})();
(function () {
    var MENU_ITEM_DISABLED_CLASS = "menu-item-disabled", CHECKED_ICON = "checked-icon", UN_CHECKED_ICON = "unchecked-icon", HAS_GROUP_CLASS = "has-subgroup", MENU_ITEM_OVER_CLASS = "menu-item-hover";
    dorado.widget.menu = {};
    dorado.widget.menu.AbstractMenuItem = $extend(dorado.widget.RenderableViewElement, {
        $className: "dorado.widget.menu.AbstractMenuItem", ATTRIBUTES: {
            name: {}, parent: { readOnly: true }, visible: {
                defaultValue: true, setter: function (value) {
                    var item = this, dom = item._dom;
                    item._visible = value;
                    if (dom) {
                        dom.style.display = value ? "" : "none";
                    }
                }
            }
        }, getTopMenu: function () {
            var menu = this._parent, opener = menu.opener, result;
            while (opener) {
                var parent = opener._parent;
                if (opener instanceof dorado.widget.menu.AbstractMenuItem && parent instanceof dorado.widget.Menu) {
                    result = parent;
                }
                opener = parent ? parent.opener : null;
            }
            return result;
        }
    });
    dorado.widget.menu.Separator = $extend(dorado.widget.menu.AbstractMenuItem, {
        $className: "dorado.widget.menu.Separator", ATTRIBUTES: { className: { defaultValue: "menu-item-separator" } }, createDom: function () {
            var item = this, dom = document.createElement("li");
            dom.className = item._className;
            dom.style.display = item._visible ? "" : "none";
            return dom;
        }, refreshDom: function (dom) {
            var item = this;
            if (dom) {
                dom.style.display = item._visible ? "" : "none";
            }
        }
    });
    dorado.widget.menu.TextMenuItem = $extend([dorado.widget.menu.AbstractMenuItem, dorado.widget.ActionSupport], {
        $className: "dorado.widget.menu.TextMenuItem", ATTRIBUTES: { hideOnClick: { defaultValue: true }, className: { defaultValue: "menu-item" }, disabled: {}, caption: {}, icon: {}, iconClass: {}, action: { componentReference: true } }, EVENTS: { onClick: {} }, doOnRemove: function () {
            this.set("action", null);
            this._dom && $fly(this._dom).remove();
        }, refreshDom: function (dom) {
            var item = this, action = item._action || {}, disabled = item._disabled || action._disabled || action._sysDisabled, icon = item._icon || action._icon, iconCls = item._iconClass || action._iconClass, doms = item._doms;
            $fly(dom)[disabled ? "addClass" : "removeClass"](MENU_ITEM_DISABLED_CLASS).css("display", item._visible ? "" : "none");
            $fly(doms.caption).text(item._caption || action._caption);
            if (icon) {
                $DomUtils.setBackgroundImage(doms.icon, icon);
            } else {
                $fly(doms.icon).css("background-image", "");
            }
            $fly(doms.icon).prop("className", "d-icon");
            if (iconCls) {
                $fly(doms.icon).addClass(iconCls);
            }
        }, createDom: function () {
            var item = this, action = item._action || {}, doms = {}, dom = $DomUtils.xCreate({ tagName: "li", className: "menu-item", content: { tagName: "span", className: "menu-item-content", contextKey: "itemContent", content: [{ tagName: "span", className: "d-icon", contextKey: "icon", content: "&nbsp;" }, { tagName: "span", className: "caption", content: item._caption || action._caption, contextKey: "caption" }] } }, null, doms), disabled = item._disabled || action._disabled || action._sysDisabled, icon = item._icon || action._icon;
            item._doms = doms;
            $fly(dom).css("display", item._visible ? "" : "none").addClass(disabled ? MENU_ITEM_DISABLED_CLASS : "").hover(function () {
                item._parent.focusItem(item, true);
            }, dorado._NULL_FUNCTION);
            if (icon) {
                $DomUtils.setBackgroundImage(doms.icon, icon);
            } else {
                $fly(doms.icon).css("background-image", "");
            }
            return dom;
        }, hideTopMenu: function () {
            var item = this;
            if (item._parent) {
                item._parent.hideTopMenu();
            }
        }
    });
    dorado.widget.menu.ControlMenuItem = $extend(dorado.widget.menu.TextMenuItem, {
        $className: "dorado.widget.menu.ControlMenuItem", focusable: true, ATTRIBUTES: {
            control: {
                setter: function (control) {
                    if (this._control) {
                        this.unregisterInnerViewElement(this._control);
                    }
                    if (!(control instanceof dorado.widget.Control)) {
                        control = dorado.Toolkits.createInstance("widget", control, function (type) {
                            return dorado.Toolkits.getPrototype("widget");
                        });
                    }
                    if (control) {
                        this.unregisterInnerViewElement(control);
                    }
                    this._control = control;
                }
            }, view: {
                setter: function (view) {
                    $invokeSuper.call(this, arguments);
                    if (this._control) {
                        this._control.set("view", view);
                    }
                }
            }
        }, createDom: function () {
            var item = this, dom = $invokeSuper.call(this, arguments);
            $fly(dom).click(function (event) {
                item.onClick(event);
            }).addClass(item._control ? HAS_GROUP_CLASS : "");
            return dom;
        }, hideControl: function () {
            var item = this;
            if (item._showControlTimer) {
                clearTimeout(item._showControlTimer);
                item._showControlTimer = null;
            } else {
                if (item._control) {
                    item._control.hide();
                }
            }
        }, onSelect: function () {
            var item = this;
            item.hideControl();
            item.hideTopMenu();
        }, onClick: function () {
            var item = this, action = item._action || {}, disabled = item._disabled || action._disabled || action._sysDisabled;
            if (!disabled) {
                action.execute && action.execute();
                item.fireEvent("onClick", item);
            }
        }, onFocus: function () {
            var item = this, dom = item._dom;
            $fly(dom).addClass(MENU_ITEM_OVER_CLASS);
            item.showControl();
        }, showControl: function () {
            var item = this;
            if (item._control) {
                item._showControlTimer = setTimeout(function () {
                    item._control.show({
                        anchorTarget: item, align: "right", vAlign: "innertop", delay: 300, onHide: function (self) {
                            self.opener = null;
                        }
                    });
                    item._control._focusParent = item._parent;
                    item._control.opener = item;
                    item._showControlTimer = null;
                }, 300);
            }
        }, onBlur: function () {
            var item = this, dom = item._dom;
            $fly(dom).removeClass(MENU_ITEM_OVER_CLASS);
            item.hideControl();
        }
    });
    dorado.widget.menu.MenuItem = $extend(dorado.widget.menu.TextMenuItem, {
        $className: "dorado.widget.menu.MenuItem", focusable: true, ATTRIBUTES: {
            submenu: {
                setter: function (value) {
                    if (this._submenu) {
                        this.unregisterInnerViewElement(this._submenu);
                    }
                    var submenu;
                    if (!value) {
                        submenu = null;
                    } else {
                        if (value.constructor == Object.prototype.constructor) {
                            submenu = new dorado.widget.Menu(value);
                        } else {
                            if (value instanceof dorado.widget.Menu) {
                                submenu = value;
                            }
                        }
                    }
                    if (submenu) {
                        this.registerInnerViewElement(submenu);
                    }
                    this._submenu = submenu;
                    var dom = this._dom;
                    if (dom) {
                        $fly(dom)[this._submenu ? "addClass" : "removeClass"](HAS_GROUP_CLASS);
                    }
                }
            }, items: {
                getter: function () {
                    if (this._submenu) {
                        return this._submenu.get("items");
                    }
                    return null;
                }, setter: function (value) {
                    var parentItem = this, submenu = parentItem._submenu;
                    if (value.constructor == Array.prototype.constructor) {
                        var originSkipRefresh;
                        if (submenu) {
                            originSkipRefresh = submenu._skipRefresh;
                            submenu._skipRefresh = true;
                        }
                        parentItem.clearItems();
                        value.each(function (item) {
                            parentItem.addItem(item);
                        });
                        if (submenu) {
                            submenu._skipRefresh = originSkipRefresh;
                        }
                    }
                }
            }
        }, doGet: function (attr) {
            var c = attr.charAt(0);
            if (c == "#" || c == "&") {
                var itemName = attr.substring(1);
                return this.getItem(itemName);
            } else {
                return $invokeSuper.call(this, [attr]);
            }
        }, hasSubmenu: function () {
            return !!this._submenu;
        }, getItem: function (name) {
            var menuItem = this, submenu = menuItem._submenu;
            if (submenu) {
                return submenu.getItem(name);
            }
            return null;
        }, addItem: function (item, index) {
            var menuItem = this, submenu = menuItem._submenu;
            if (item) {
                if (!submenu) {
                    submenu = new dorado.widget.Menu();
                    menuItem.set("submenu", submenu);
                }
                submenu.addItem(item, index);
            }
        }, removeItem: function (item) {
            var menuItem = this, submenu = menuItem._submenu;
            if (item != null && submenu) {
                submenu.removeItem(item);
            }
        }, clearItems: function () {
            var menuItem = this, submenu = menuItem._submenu;
            if (submenu) {
                submenu.clearItems();
            }
        }, onFocus: function (showSubmenu) {
            var item = this, dom = item._dom;
            $fly(dom).addClass(MENU_ITEM_OVER_CLASS);
            if (item._submenu && showSubmenu) {
                item.showSubmenu();
            }
        }, onBlur: function () {
            var item = this, dom = item._dom;
            $fly(dom).removeClass(MENU_ITEM_OVER_CLASS);
            if (item._submenu) {
                item.hideSubmenu();
            }
        }, showSubmenu: function (focusfirst) {
            var item = this, submenu = item._submenu;
            if (submenu) {
                item._showSubmenuTimer = setTimeout(function () {
                    var owner = item._parent;
                    if (owner && owner.getListenerCount("onContextMenu") > 0 && submenu.getListenerCount("onContextMenu") == 0) {
                        var handles = item._parent._events["onContextMenu"];
                        for (var i = 0, j = handles.length; i < j; i++) {
                            var handler = handles[i];
                            submenu.bind("onContextMenu", handler.listener, handler.options);
                        }
                        submenu._inheritContextMenu = true;
                    }
                    if (submenu._parent != owner) {
                        owner.registerInnerControl(submenu);
                    }
                    submenu.show({ anchorTarget: item, align: "right", vAlign: "innertop", focusFirst: focusfirst });
                    submenu._focusParent = item._parent;
                    item._showSubmenuTimer = null;
                }, 300);
            }
        }, onClick: function (event) {
            var item = this, action = item._action || {}, disabled = item._disabled || action._disabled || action._sysDisabled;
            if (!disabled) {
                if (item.hasSubmenu()) {
                    action.execute && action.execute();
                    item.fireEvent("onClick", item);
                } else {
                    action.execute && action.execute();
                    item.fireEvent("onClick", item);
                    if (item._hideOnClick) {
                        item._parent.hideTopMenu();
                    }
                }
            }
        }, hideSubmenu: function () {
            var item = this, submenu = this._submenu;
            if (submenu) {
                if (item._showSubmenuTimer) {
                    clearTimeout(item._showSubmenuTimer);
                    item._showSubmenuTimer = null;
                } else {
                    if (submenu._inheritContextMenu) {
                        submenu.clearListeners("onContextMenu");
                    }
                    submenu.hide();
                }
            }
        }, createDom: function () {
            var item = this, dom = $invokeSuper.call(this, arguments);
            $fly(dom).click(function (event) {
                item.onClick(event);
            }).addClass(item.hasSubmenu() ? HAS_GROUP_CLASS : "");
            return dom;
        }
    });
    dorado.widget.menu.CheckGroupManager = {
        groups: {}, addCheckItem: function (groupName, item) {
            if (!groupName || !item) {
                return;
            }
            var manager = this, groups = manager.groups, group = groups[groupName];
            if (!group) {
                group = groups[groupName] = { current: null, items: [] };
            }
            group.items.push(item);
            if (item._checked) {
                dorado.widget.menu.CheckGroupManager.setGroupCurrent(groupName, item);
            }
        }, removeCheckItem: function (groupName, item) {
            if (!groupName || !item) {
                return;
            }
            var manager = this, groups = manager.groups, group = groups[groupName];
            if (group) {
                if (group.current == item) {
                    group.current = null;
                }
                group.items.remove(item);
            }
        }, setGroupCurrent: function (groupName, item) {
            if (!groupName || !item) {
                return;
            }
            var manager = this, groups = manager.groups, group = groups[groupName];
            if (group) {
                var current = group.current;
                if (current == item) {
                    return;
                }
                if (current instanceof dorado.widget.menu.CheckableMenuItem) {
                    current.set("checked", false);
                }
                group.current = item;
            }
        }
    };
    dorado.widget.menu.CheckableMenuItem = $extend(dorado.widget.menu.MenuItem, {
        $className: "dorado.widget.menu.CheckableMenuItem", ATTRIBUTES: {
            checked: {
                setter: function (value) {
                    var item = this;
                    if (value && item._group) {
                        dorado.widget.menu.CheckGroupManager.setGroupCurrent(item._group, item);
                    }
                    item._checked = value;
                }
            }, group: {
                setter: function (value) {
                    var item = this, oldValue = item._group;
                    if (oldValue) {
                        dorado.widget.menu.CheckGroupManager.removeCheckItem(oldValue, item);
                    }
                    if (value) {
                        dorado.widget.menu.CheckGroupManager.addCheckItem(value, item);
                    }
                    item._group = value;
                }
            }
        }, EVENTS: { onCheckedChange: {} }, refreshDom: function (dom) {
            $invokeSuper.call(this, arguments);
            var item = this;
            if (item._dom) {
                if (item._checked) {
                    $fly(item._doms.icon).removeClass(UN_CHECKED_ICON).addClass(CHECKED_ICON);
                } else {
                    $fly(item._doms.icon).removeClass(CHECKED_ICON).addClass(UN_CHECKED_ICON);
                }
            }
        }, onClick: function () {
            var item = this, parent = item._parent, action = item._action || {}, disabled = item._disabled || action._disabled || action._sysDisabled;
            if (!disabled) {
                action.execute && action.execute();
                item.fireEvent("onClick", item);
                if (!item.hasSubmenu() && item._hideOnClick) {
                    parent.hideTopMenu();
                }
                item.set("checked", !item._checked);
                item.fireEvent("onCheckedChange", item);
            }
        }, createDom: function () {
            var item = this, dom = $invokeSuper.call(this, arguments);
            $fly(item._doms.icon).addClass(item._checked ? CHECKED_ICON : UN_CHECKED_ICON);
            $fly(dom).hover(function () {
                item._parent.focusItem(item, true);
            }, dorado._NULL_FUNCTION);
            return dom;
        }
    });
    dorado.Toolkits.registerPrototype("menu", { "-": dorado.widget.menu.Separator, Separator: dorado.widget.menu.Separator, Checkable: dorado.widget.menu.CheckableMenuItem, Control: dorado.widget.menu.ControlMenuItem, Default: dorado.widget.menu.MenuItem });
})();
(function () {
    var GROUP_CONTENT_CLASS = "group-content", GROUP_OVERFLOW_CLASS = "d-menu-overflow";
    var SKIP_REFRESH = false;
    dorado.widget.AbstractMenu = $extend([dorado.widget.Control, dorado.widget.FloatControl], {
        $className: "dorado.widget.AbstractMenu", ATTRIBUTES: {
            items: {
                setter: function (value) {
                    var menu = this, items = menu._items, doms = menu._doms, rendered = menu._rendered, i, l;
                    if (items) {
                        menu.clearItems();
                    }
                    if (value && value instanceof Array) {
                        var originSkipRefresh = menu._skipRefresh;
                        menu._skipRefresh = true;
                        for (i = 0, l = value.length; i < l; i++) {
                            menu.addItem(value[i]);
                        }
                        menu._skipRefresh = originSkipRefresh;
                        if (rendered) {
                            menu.refresh();
                        }
                    }
                }
            }
        }, doGet: function (attr) {
            var c = attr.charAt(0);
            if (c == "#" || c == "&") {
                var itemName = attr.substring(1);
                return this.getItem(itemName);
            } else {
                return $invokeSuper.call(this, [attr]);
            }
        }, addItem: function (item, index) {
            var menu = this, items = menu._items, doms = menu._doms, refItem;
            items = menu._items = items ? menu._items : new dorado.util.KeyedArray(function (value) {
                return value._name;
            });
            if (item.constructor == Object.prototype.constructor || typeof item == "string") {
                item = menu.createMenuItem(item);
            }
            menu.registerInnerViewElement(item);
            if (typeof index == "number") {
                items.insert(item, index);
                refItem = items.get(index + 1);
            } else {
                if (index instanceof dorado.widget.menu.AbstractMenuItem) {
                    refItem = items.indexOf(index);
                    if (index != -1) {
                        items.insert(item, index);
                    } else {
                        throw new dorado.ResourceException("dorado.base.ItemNotInGroup");
                    }
                } else {
                    items.insert(item);
                }
            }
            if (!menu._skipRefresh) {
                menu.refresh();
            }
            return item;
        }, getItem: function (name) {
            var menu = this, items = menu._items;
            if (items) {
                if (typeof name == "number" || typeof name == "string") {
                    return items.get(name);
                } else {
                    return name;
                }
            }
            return null;
        }, findItem: function (path) {
            var menu = this, items = menu._items, item, itemgroup, i, j;
            if (!items) {
                return null;
            }
            if (typeof path == "string") {
                var index = path.indexOf("/"), mainpath, subpath;
                if (index != -1) {
                    mainpath = path.substring(0, index);
                    subpath = path.substring(index + 1);
                } else {
                    mainpath = path;
                }
                if (subpath) {
                    for (i = 0, j = items.size; i < j; i++) {
                        item = items.get(i);
                        if (item._name == mainpath) {
                            itemgroup = item._submenu;
                            if (itemgroup) {
                                return itemgroup.findItem(subpath);
                            }
                        }
                    }
                } else {
                    for (i = 0, j = items.size; i < j; i++) {
                        item = items.get(i);
                        if (item._name == mainpath) {
                            return item;
                        }
                    }
                    return null;
                }
            }
            return null;
        }, removeItem: function (item) {
            var menu = this, items = menu._items, dom;
            if (items) {
                if (typeof item == "number" || typeof item == "string") {
                    item = items.get(item);
                }
                if (item) {
                    item.doOnRemove && item.doOnRemove();
                    menu.unregisterInnerViewElement(item);
                    items.remove(item);
                }
            }
            if (!menu._skipRefresh) {
                menu.refresh();
            }
            return item;
        }, clearItems: function (deep) {
            var menu = this, items = menu._items, dom;
            if (items) {
                var originSkipRefresh = menu._skipRefresh;
                menu._skipRefresh = true;
                var innerItems = items.items;
                for (var i = innerItems.length - 1; i >= 0; i--) {
                    var item = innerItems[i];
                    if (deep && item instanceof dorado.widget.menu.MenuItem) {
                        var subGroup = item._submenu;
                        if (subGroup) {
                            subGroup.clearItems(deep);
                            subGroup.destroy();
                        }
                    }
                    item.doOnRemove && item.doOnRemove();
                    menu.unregisterInnerViewElement(item);
                    items.removeAt(i);
                }
                menu._skipRefresh = originSkipRefresh;
                menu.refresh();
            }
        }, getTopMenu: function () {
            var menu = this, opener = menu.opener, result = menu;
            while (opener) {
                var parent = opener._parent;
                if (opener instanceof dorado.widget.menu.AbstractMenuItem && parent instanceof dorado.widget.Menu) {
                    result = parent;
                }
                opener = parent ? parent.opener : null;
            }
            return result;
        }
    });
    dorado.widget.Menu = $extend(dorado.widget.AbstractMenu, {
        $className: "dorado.widget.Menu", focusable: true, selectable: false, ATTRIBUTES: { className: { defaultValue: "d-menu" }, floatingClassName: { defaultValue: "d-menu-floating" }, visible: { defaultValue: false }, animateType: { defaultValue: "slide", skipRefresh: true }, hideAnimateType: { defaultValue: "fade", skipRefresh: true }, iconPosition: { defaultValue: "left" }, iconSize: { defaultValue: "normal" }, focusItem: {} }, EVENTS: { onHideTopMenu: {}, onClick: {} }, createMenuItem: function (config) {
            if (!config) {
                return null;
            }
            var menu = this, item;
            if (config instanceof dorado.widget.menu.AbstractMenuItem) {
                item = config;
            } else {
                item = dorado.Toolkits.createInstance("menu", config);
            }
            item._parent = menu;
            return item;
        }, createOverflowArrow: function () {
            var menu = this, dom = menu._dom, doms = menu._doms;
            if (dom) {
                var topArrow = $DomUtils.xCreate({ tagName: "div", className: "overflow-top-arrow" });
                var bottomArrow = $DomUtils.xCreate({ tagName: "div", className: "overflow-bottom-arrow" });
                $fly(dom).prepend(topArrow);
                dom.appendChild(bottomArrow);
                jQuery(topArrow).repeatOnClick(function () {
                    menu.doScrollUp();
                }, 120).addClassOnHover("overflow-top-arrow-hover");
                jQuery(bottomArrow).repeatOnClick(function () {
                    menu.doScrollDown();
                }, 120).addClassOnHover("overflow-bottom-arrow-hover");
                doms.overflowTopArrow = topArrow;
                doms.overflowBottomArrow = bottomArrow;
            }
        }, clearOverflow: function () {
            var menu = this, dom = menu._dom, doms = menu._doms;
            if (dom) {
                menu._overflowing = false;
                if (dorado.Browser.msie && dorado.Browser.version == 6) {
                    $fly(dom).css("width", "");
                }
                $fly(dom).css("height", "").removeClass(GROUP_OVERFLOW_CLASS);
                $fly(doms.groupContent).scrollTop(0).css("height", "");
            }
        }, handleOverflow: function (overflowHeight) {
            var menu = this, dom = menu._dom, doms = menu._doms;
            if (dom) {
                $fly(dom).addClass(GROUP_OVERFLOW_CLASS).outerHeight(overflowHeight);
                if (!doms.overflowTopArrow) {
                    menu.createOverflowArrow();
                }
                menu._overflowing = true;
                var contentHeight = $fly(dom).innerHeight() - $fly(doms.overflowTopArrow).outerHeight() - $fly(doms.overflowBottomArrow).outerHeight(), contentWidth = $fly(dom).width();
                if (dorado.Browser.msie && dorado.Browser.version == 6) {
                    $fly(dom).width(contentWidth);
                    $fly(doms.groupContent).outerHeight(contentHeight);
                } else {
                    $fly(doms.groupContent).outerHeight(contentHeight);
                }
                $fly([doms.overflowTopArrow, doms.overflowBottomArrow]).outerWidth(contentWidth);
            }
        }, clearFocusItem: function () {
            var menu = this, focusItem = menu._focusItem;
            if (focusItem && focusItem.focusable) {
                focusItem.onBlur();
            }
            menu._focusItem = null;
        }, getFocusableItem: function (mode) {
            var menu = this, items = menu._items, focusItem = menu._focusItem, focusIndex = -1, result = null, i, j, item;
            if (!items) {
                return null;
            }
            mode = mode || "next";
            if (focusItem) {
                focusIndex = items.indexOf(focusItem);
            }
            if (mode == "next") {
                for (i = focusIndex + 1, j = items.size; i < j; i++) {
                    item = items.get(i);
                    if (!item._disabled && item._visible && !(item instanceof dorado.widget.menu.Separator)) {
                        result = item;
                        break;
                    }
                }
                if (result == null) {
                    mode = "first";
                } else {
                    return result;
                }
            } else {
                if (mode == "prev") {
                    for (i = focusIndex - 1; i >= 0; i--) {
                        item = items.get(i);
                        if (!item._disabled && item._visible && !(item instanceof dorado.widget.menu.Separator)) {
                            result = item;
                            break;
                        }
                    }
                    if (result == null) {
                        mode = "last";
                    } else {
                        return result;
                    }
                }
            }
            if (mode == "first") {
                for (i = 0, j = items.size; i < j; i++) {
                    item = items.get(i);
                    if (!item._disabled && item._visible && !(item instanceof dorado.widget.menu.Separator)) {
                        result = item;
                        break;
                    }
                }
                return result;
            } else {
                if (mode == "last") {
                    for (i = items.size - 1; i >= 0; i--) {
                        item = items.get(i);
                        if (!item._disabled && item._visible && !(item instanceof dorado.widget.menu.Separator)) {
                            result = item;
                            break;
                        }
                    }
                    return result;
                }
            }
        }, focusItem: function (item, showSubmenu) {
            var menu = this, focusItem = menu._focusItem;
            if (menu._freeze) {
                return;
            }
            if (item && focusItem !== item) {
                menu._focusItem = item;
                if (menu._overflowing) {
                    var itemDom = item._dom, doms = menu._doms, viewTop = $fly(doms.groupContent).prop("scrollTop"), contentTop = $fly(doms.groupContent).prop("offsetTop"), itemTop = itemDom.offsetTop, itemHeight = itemDom.offsetHeight, itemBottom = itemTop + itemHeight, contentHeight = $fly(doms.groupContent).innerHeight(), viewBottom = contentHeight + viewTop;
                    if (!dorado.Browser.msie) {
                        itemTop = itemTop - contentTop;
                        itemBottom = itemTop + itemHeight;
                    }
                    if (itemTop < viewTop) {
                        $fly(doms.groupContent).prop("scrollTop", itemTop);
                    } else {
                        if (itemBottom > viewBottom) {
                            $fly(doms.groupContent).prop("scrollTop", itemBottom - contentHeight);
                        }
                    }
                }
                if (focusItem && focusItem.focusable) {
                    focusItem.onBlur();
                }
                if (!item._disabled && item.onFocus) {
                    item.onFocus(showSubmenu);
                }
            }
        }, hideTopMenu: function () {
            var menu = this, opener = menu.opener, parent;
            if (menu._floating) {
                menu.hide();
                menu.fireEvent("onHideTopMenu", menu);
                if (opener) {
                    parent = opener._parent;
                    parent.hideTopMenu();
                }
            }
        }, doScrollUp: function () {
            var menu = this, doms = menu._doms, groupContent = doms.groupContent, st = $fly(groupContent).scrollTop(), target = st - 22;
            if (target >= 0) {
                $fly(groupContent).scrollTop(target);
            } else {
                $fly(groupContent).scrollTop(0);
            }
        }, doScrollDown: function () {
            var menu = this, doms = menu._doms, groupContent = doms.groupContent, st = $fly(groupContent).scrollTop(), target = st + 22, scrollHeight = $fly(groupContent).prop("scrollHeight");
            if (target <= scrollHeight) {
                $fly(groupContent).scrollTop(target);
            } else {
                $fly(groupContent).scrollTop(scrollHeight - $fly(groupContent).innerHeight());
            }
        }, doOnBlur: function () {
            if (this._floating) {
                this.hide();
            } else {
                this.clearFocusItem();
            }
        }, doOnKeyDown: function (event) {
            var menu = this, opener, focusItem;
            switch (event.keyCode) {
                case 37:
                    if (menu) {
                        opener = menu.opener;
                        if (opener) {
                            opener.hideSubmenu && opener.hideSubmenu();
                        }
                    }
                    break;
                case 38:
                    menu.focusItem(menu.getFocusableItem("prev"));
                    break;
                case 39:
                    if (menu._focusItem) {
                        menu._focusItem.showSubmenu && menu._focusItem.showSubmenu(true);
                    }
                    break;
                case 40:
                    menu.focusItem(menu.getFocusableItem("next"));
                    break;
                case 13:
                    focusItem = menu._focusItem;
                    if (focusItem) {
                        focusItem.onClick && focusItem.onClick();
                    }
                    return false;
                case 27:
                    menu.hideTopMenu();
                    break;
            }
        }, freeze: function (deep) {
            this._freeze = true;
            if (deep !== false) {
                var opener = this.opener;
                while (opener) {
                    var parent = opener._parent;
                    if (opener instanceof dorado.widget.menu.AbstractMenuItem && parent instanceof dorado.widget.Menu) {
                        parent._freeze = true;
                    }
                    opener = parent ? parent.opener : null;
                }
            }
        }, unfreeze: function (deep) {
            this._freeze = false;
            if (deep !== false) {
                var opener = this.opener;
                while (opener) {
                    var parent = opener._parent;
                    if (opener instanceof dorado.widget.menu.AbstractMenuItem && parent instanceof dorado.widget.Menu) {
                        parent._freeze = false;
                    }
                    opener = parent ? parent.opener : null;
                }
            }
        }, createDom: function () {
            var menu = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", content: { tagName: "ul", className: "group-content", contextKey: "groupContent" } }, null, doms), items = menu._items;
            menu._doms = doms;
            var groupContent = doms.groupContent;
            if (items) {
                items.each(function (item) {
                    item.render(groupContent);
                });
            }
            $fly(dom).hover(function () {
                menu.notifyOpenerOnMouseEnter();
            }, function () {
                var focusItem = menu._focusItem;
                menu.notifyOpenerOnMouseLeave();
                if (menu._freeze) {
                    return;
                }
                if (focusItem) {
                    if (focusItem instanceof dorado.widget.menu.MenuItem) {
                        if (!focusItem._submenu) {
                            menu.clearFocusItem();
                        }
                    } else {
                        if (focusItem instanceof dorado.widget.menu.ControlMenuItem) {
                            if (!focusItem._control) {
                                menu.clearFocusItem();
                            }
                        } else {
                            menu.clearFocusItem();
                        }
                    }
                }
            }).click(function (event) {
                if (!menu.processDefaultMouseListener()) {
                    return;
                }
                var defaultReturnValue;
                if (menu.onClick) {
                    defaultReturnValue = menu.onClick(event);
                }
                var arg = { button: event.button, event: event, returnValue: defaultReturnValue };
                var target = event.target, item;
                if (target) {
                    var items = menu._items;
                    for (var i = 0, j = items.size; i < j; i++) {
                        var temp = items.get(i);
                        if (temp._dom == target || jQuery.contains(temp._dom, target)) {
                            item = temp;
                            arg.item = item;
                            break;
                        }
                    }
                }
                menu.fireEvent("onClick", menu, arg);
                event.stopImmediatePropagation();
                return arg.returnValue;
            });
            $fly(groupContent).mousewheel(function (event, delta) {
                if (menu._overflowing) {
                    if (delta < 0) {
                        menu.doScrollDown();
                    } else {
                        if (delta > 0) {
                            menu.doScrollUp();
                        }
                    }
                }
            });
            if (menu._iconPosition == "top") {
                $fly(dom).addClass(menu._className + "-icon-top");
            }
            return dom;
        }, refreshDom: function (dom) {
            $invokeSuper.call(this, arguments);
            var menu = this, doms = menu._doms, menuContentHeight = $fly(doms.groupContent).outerHeight();
            if (menuContentHeight > dom.offsetHeight) {
                menu.handleOverflow();
            }
            var items = menu._items || {}, visibleItemCount = 0;
            for (var i = 0, j = items.size; i < j; i++) {
                var item = items.get(i);
                if (item._visible === false) {
                    continue;
                }
                visibleItemCount++;
            }
            if (visibleItemCount == 0) {
                if (!menu._noContentEl) {
                    menu._noContentEl = document.createElement("div");
                    menu._noContentEl.className = "no-content-group";
                    menu._noContentEl.innerHTML = "&lt;Empty Panel&gt;";
                    dom.appendChild(menu._noContentEl);
                }
                $fly(dom).addClass(menu._className + "-no-content");
            } else {
                if (menu._noContentEl) {
                    $fly(dom).removeClass(menu._className + "-no-content");
                }
            }
        }, getShowPosition: function (options) {
            var menu = this, anchorTarget = options.anchorTarget, dom = menu._dom, fixedElement, result;
            options = options || {};
            options.overflowHandler = function (options) {
                menu.handleOverflow(options.maxHeight);
            };
            if (anchorTarget && anchorTarget instanceof dorado.widget.menu.MenuItem) {
                fixedElement = anchorTarget._dom;
                menu.opener = anchorTarget;
                menu._focusParent = anchorTarget._parent;
                result = $DomUtils.dockAround(dom, fixedElement, options);
                return result;
            } else {
                return $invokeSuper.call(this, arguments);
            }
        }, doAfterShow: function (options) {
            var menu = this, focusfirst = (options || {}).focusFirst;
            if (focusfirst) {
                var item = menu.getFocusableItem("first");
                if (item) {
                    menu.focusItem(item);
                }
            }
            $invokeSuper.call(this, arguments);
        }, doAfterHide: function () {
            var menu = this, dom = menu._dom;
            if (!dom) {
                return;
            }
            menu.clearFocusItem();
            if (dom) {
                if (menu._overflowing) {
                    menu.clearOverflow();
                }
            }
            menu.opener = null;
            $invokeSuper.call(this, arguments);
        }, notifyOpenerOnMouseEnter: function () {
            var menu = this, focusParent = menu._focusParent;
            if (focusParent instanceof dorado.widget.Menu) {
                focusParent.notifyOpenerOnMouseEnter();
            } else {
                if (focusParent instanceof dorado.widget.AbstractButton) {
                    focusParent.doCancelHideMenuOnMouseEnter && focusParent.doCancelHideMenuOnMouseEnter();
                }
            }
        }, notifyOpenerOnMouseLeave: function () {
            var menu = this, focusParent = menu._focusParent;
            if (focusParent instanceof dorado.widget.Menu) {
                focusParent.notifyOpenerOnMouseLeave();
            } else {
                if (focusParent instanceof dorado.widget.AbstractButton) {
                    focusParent.doHideMenuOnMouseLeave && focusParent.doHideMenuOnMouseLeave();
                }
            }
        }
    });
})();
dorado.widget.Slider = $extend(dorado.widget.Control, {
    $className: "dorado.widget.Slider", selectable: false, focusable: true, ATTRIBUTES: {
        className: { defaultValue: "d-slider" }, height: { independent: true }, orientation: { defaultValue: "horizontal" }, minValue: {
            defaultValue: 0, setter: function (value) {
                var parseValue = parseFloat(value);
                if (isNaN(parseValue)) {
                    throw new dorado.ResourceException("dorado.baseWidget.NumberFormatInvalid", value);
                }
                this._minValue = parseValue;
            }
        }, maxValue: {
            defaultValue: 100, setter: function (value) {
                var parseValue = parseFloat(value);
                if (isNaN(parseValue)) {
                    throw new dorado.ResourceException("dorado.baseWidget.NumberFormatInvalid", value);
                }
                this._maxValue = parseValue;
            }
        }, value: {
            setter: function (value) {
                var slider = this, minValue = slider._minValue, maxValue = slider._maxValue, parseValue = parseFloat(value);
                if (isNaN(parseValue)) {
                    throw new dorado.ResourceException("dorado.baseWidget.NumberFormatInvalid", value);
                }
                if (parseValue < minValue || parseValue > maxValue) {
                    throw new dorado.ResourceException("dorado.baseWidget.NumberRangeInvalid", minValue, maxValue, value);
                }
                value = slider.getValidValue(parseValue);
                var eventArg = { value: value };
                slider.fireEvent("beforeValueChange", slider, eventArg);
                if (eventArg.processDefault === false) {
                    return;
                }
                slider._value = value;
                slider.fireEvent("onValueChange", slider);
            }
        }, precision: { defaultValue: 0 }, step: {}
    }, EVENTS: { beforeValueChange: {}, onValueChange: {} }, constructor: function (config) {
        config = config || {};
        var value = config.value;
        delete config.value;
        $invokeSuper.call(this, arguments);
        if (value) {
            this.set({ value: value });
        }
    }, createDom: function () {
        var slider = this, dom, doms = {}, orientation = slider._orientation;
        dom = $DomUtils.xCreate({ tagName: "div", content: [{ tagName: "div", className: "slider-start", contextKey: "start" }, { tagName: "div", className: "slider-end", contextKey: "end" }, { tagName: "div", className: "slider-body", contextKey: "body" }, { tagName: "div", className: "slider-current", contextKey: "current" }, { tagName: "div", className: "slider-thumb", contextKey: "thumb", style: { position: "absolute" } }] }, null, doms);
        slider._doms = doms;
        var axis = (orientation == "vertical") ? "y" : "x";
        var tip;
        if (!dorado.Browser.isTouch) {
            tip = new dorado.widget.Tip({ animateType: "none" });
        }
        jQuery(doms.thumb).addClassOnHover("slider-thumb-hover").addClassOnClick("slider-thumb-click").draggable({
            addClasses: false, containment: "parent", axis: axis, stop: function (event, ui) {
                var helper = ui.helper[0], minValue = slider._minValue, maxValue = slider._maxValue, offset, size, thumbSize;
                if (orientation == "horizontal") {
                    thumbSize = doms.thumb.offsetWidth;
                    size = $fly(dom).width() - thumbSize;
                    offset = parseInt($fly(helper).css("left"), 10);
                } else {
                    thumbSize = doms.thumb.offsetHeight;
                    size = $fly(dom).height() - thumbSize;
                    offset = parseInt($fly(helper).css("top"), 10);
                }
                slider.set("value", (maxValue - minValue) * offset / size + minValue);
                if (tip) {
                    tip.hide();
                }
            }, drag: function (event, ui) {
                var helper = ui.helper[0], minValue = slider._minValue, maxValue = slider._maxValue, offset, size, thumbSize;
                if (orientation == "horizontal") {
                    thumbSize = doms.thumb.offsetWidth;
                    size = $fly(dom).width() - thumbSize;
                    offset = parseInt($fly(helper).css("left"), 10);
                    $fly(doms.current).css("width", offset);
                } else {
                    thumbSize = doms.thumb.offsetHeight;
                    size = $fly(dom).height() - thumbSize;
                    offset = parseInt($fly(helper).css("top"), 10);
                    $fly(doms.current).css("height", offset);
                }
                if (tip) {
                    tip.set("text", slider.getValidValue((maxValue - minValue) * offset / size) + minValue);
                    tip.refresh();
                    if (!tip._dom) {
                        return;
                    }
                    if (orientation == "horizontal") {
                        $DomUtils.dockAround(tip._dom, slider._doms.thumb, { align: "center", vAlign: "top", offsetTop: -10 });
                    } else {
                        $DomUtils.dockAround(tip._dom, slider._doms.thumb, { align: "right", vAlign: "center", offsetLeft: 10 });
                    }
                }
            }, start: function (event, ui) {
                if (!tip) {
                    return;
                }
                tip.set("text", slider._value);
                tip.show({ anchorTarget: ui.helper[0], align: "center", vAlign: "top" });
            }
        });
        return dom;
    }, getValidValue: function (value) {
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
    }, onClick: function (event) {
        var target = event.target || event.srcElement;
        if (target.className.indexOf("slider-thumb") != -1) {
            return;
        }
        var slider = this, dom = slider._dom, doms = slider._doms, pageX = event.pageX, pageY = event.pageY, position = $fly(dom).offset(), offset, size, thumbSize;
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
    }, doOnResize: function () {
        if (!this._ready) {
            return;
        }
        this.refresh();
    }, refreshDom: function (dom) {
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
            thumbSize = doms.thumb.offsetHeight;
            var height, startHeight, endHeight;
            height = $fly(dom).innerHeight();
            startHeight = $fly(doms.start).innerHeight();
            endHeight = $fly(doms.end).innerHeight();
            $fly(doms.body).height(height - startHeight - endHeight);
            $fly(doms.thumb).css("top", (height - thumbSize) * (value - minValue) / (maxValue - minValue));
            $fly(doms.current).css("height", (height - thumbSize) * (value - minValue) / (maxValue - minValue));
            if (handleIncrease) {
                $fly(doms.thumb).draggable("option", "grid", [0, (height - thumbSize) / stepCount]);
            }
        } else {
            thumbSize = doms.thumb.offsetWidth;
            var width = $fly(dom).innerWidth();
            $fly(doms.thumb).css("left", (width - thumbSize) * (value - minValue) / (maxValue - minValue));
            $fly(doms.current).css("width", (width - thumbSize) * (value - minValue) / (maxValue - minValue));
            if (handleIncrease) {
                $fly(doms.thumb).draggable("option", "grid", [(width - thumbSize) / stepCount, 0]);
            }
        }
    }
});
(function () {
    var TAB_CLOSEABLE_CLASS = "-closeable", TAB_DISABLED_CLASS = "-disabled", ICON_CLASS = "d-icon";
    dorado.widget.tab = {};
    dorado.widget.tab.Tab = $extend(dorado.widget.RenderableViewElement, {
        $className: "dorado.widget.tab.Tab", ATTRIBUTES: {
            className: { defaultValue: "tab" }, name: {}, caption: {}, closeable: {}, icon: {}, iconClass: {}, disabled: {
                setter: function (value) {
                    var tab = this, tabbar = tab._parent;
                    if (tabbar) {
                        if (value) {
                            tabbar.disableTab(tab);
                        } else {
                            tabbar.enableTab(tab);
                        }
                    } else {
                        tab._disabled = value;
                    }
                }
            }, visible: {
                defaultValue: true, skipRefresh: true, setter: function (value) {
                    var tab = this, tabbar = tab._parent;
                    if (tabbar && tab) {
                        tabbar.doSetTabVisible(tab, value);
                    }
                    tab._visible = value;
                }
            }, tip: { skipRefresh: true }
        }, EVENTS: { beforeClose: {}, onClose: {}, onClick: {} }, destroy: function () {
            dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
            var tab = this, dom = tab._dom, doms = tab._doms;
            if (dom) {
                doms.close && $fly(doms.close).unbind();
                $fly(dom).remove();
            }
            delete tab._dom;
            delete tab._doms;
        }, _createIconSpan: function () {
            var tab = this, doms = tab._doms;
            var iconEl = document.createElement("span");
            iconEl.className = ICON_CLASS;
            doms.icon = iconEl;
            $fly(iconEl).prependTo(doms.tabLeft);
            $DomUtils.setBackgroundImage(iconEl, tab._icon);
        }, refreshDom: function (dom) {
            var tab = this, closeable = tab._closeable, disabled = tab._disabled, visible = tab._visible, doms = tab._doms, captionDom = doms.caption, closeEl = doms.close, width = tab._width, tabbar = tab._parent, tabMinWidth;
            $DomUtils.disableUserSelection(dom);
            $fly(captionDom).text(tab._caption);
            if (closeable) {
                if (!closeEl) {
                    tab.createCloseDom(dom, doms);
                }
            } else {
                if (closeEl) {
                    $fly(closeEl).remove();
                    $fly(dom).removeClass(tab._className + TAB_CLOSEABLE_CLASS);
                }
            }
            $fly(dom).css("display", visible ? "" : "none");
            if (disabled) {
                $fly(dom).addClass(tab._className + TAB_DISABLED_CLASS);
            } else {
                $fly(dom).removeClass(tab._className + TAB_DISABLED_CLASS);
            }
            jQuery(dom).addClassOnHover(tab._className + "-hover", null, function () {
                return !tab._disabled;
            });
            if (tabbar && !width) {
                tabMinWidth = tabbar._tabMinWidth;
                if (dom.offsetWidth < tabMinWidth) {
                    width = tab._width = tabMinWidth;
                }
            }
            var icon = tab._icon, iconCls = tab._iconClass;
            if (!icon && !iconCls && doms.icon) {
                $fly(doms.icon).css("display", "none");
            } else {
                if (doms.icon) {
                    $fly(doms.icon).prop("className", ICON_CLASS).css("display", "");
                }
                if ((icon || iconCls) && !doms.icon) {
                    tab._createIconSpan();
                }
                if (icon) {
                    $DomUtils.setBackgroundImage(doms.icon, icon);
                } else {
                    if (doms.icon) {
                        $fly(doms.icon).css("background-image", "none");
                    }
                }
                if (iconCls) {
                    $fly(doms.icon).addClass(iconCls);
                }
            }
            if (this._tip && dorado.TipManager) {
                this._currentTip = this._tip;
                dorado.TipManager.initTip(dom, { text: this._tip });
            } else {
                if (this._currentTip) {
                    dorado.TipManager.deleteTip(dom);
                }
            }
            if (width) {
                tab.doOnResize();
            }
        }, close: function () {
            var tab = this, tabbar = tab._parent, eventArg = {};
            if (tabbar) {
                tab.fireEvent("beforeClose", tab, eventArg);
                if (eventArg.processDefault === false) {
                    return;
                }
                tabbar.removeTab(tab);
                tab.fireEvent("onClose", tab);
            }
        }, render: function (ctEl, index) {
            var dom = this.getDom();
            if (!dom) {
                return;
            }
            if (!ctEl) {
                ctEl = document.body;
            }
            if (dom.parentNode != ctEl) {
                if (index != null) {
                    var refEl = ctEl.childNodes[index];
                    if (!refEl) {
                        ctEl.appendChild(dom);
                    } else {
                        ctEl.insertBefore(dom, refEl);
                    }
                } else {
                    ctEl.appendChild(dom);
                }
            }
            this._rendered = true;
        }, createDom: function () {
            var tab = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "li", className: tab._className, content: [{ tagName: "span", className: "tab-left", contextKey: "tabLeft", content: { tagName: "span", className: "caption", content: tab._caption, contextKey: "caption" } }, { tagName: "span", className: "tab-right", contextKey: "tabRight" }] }, null, doms);
            tab._doms = doms;
            $fly(dom).click(function () {
                var tabbar = tab._parent, disabled = tab._disabled;
                if (tabbar) {
                    if (!disabled) {
                        tab.fireEvent("onClick", tab);
                        tabbar.doChangeCurrentTab(tab);
                    }
                }
            }).addClass(tab._exClassName ? tab._exClassName : "");
            if (tab._closeable) {
                tab.createCloseDom(dom, doms);
            }
            jQuery(dom).addClassOnHover(tab._className + "-hover", null, function () {
                return !tab._disabled;
            }).bind("contextmenu", function (event) {
                event = jQuery.event.fix(event || window.event);
                event.preventDefault();
                event.returnValue = false;
                var tabbar = tab._parent, arg = { tab: tab, event: event };
                tabbar._contextMenuTab = tab;
                tabbar.fireEvent("onTabContextMenu", tabbar, arg);
                return false;
            });
            if (tab._icon || tab._iconClass) {
                tab._createIconSpan();
            }
            return dom;
        }, getControl: function () {
            return (this.doGetControl) ? this.doGetControl() : null;
        }, doOnResize: function () {
            var tab = this, dom = tab._dom, doms = tab._doms, width = tab._width;
            if (tab._parent instanceof dorado.widget.TabColumn) {
                return;
            }
            $fly(dom).outerWidth(width);
            var leftEl = $fly(doms.tabLeft);
            var leftWidth = jQuery(dom).width() - (parseInt(leftEl.css("margin-left"), 10) || 0) - (parseInt(leftEl.css("margin-right"), 10) || 0) - (parseInt(leftEl.css("padding-left"), 10) || 0) - (parseInt(leftEl.css("padding-right"), 10) || 0);
            leftEl.width(leftWidth);
            var captionEl = $fly(doms.caption);
            captionEl.width(leftWidth - jQuery(doms.icon).outerWidth(true) - (parseInt(captionEl.css("padding-left"), 10) || 0) - (parseInt(captionEl.css("padding-right"), 10) || 0));
        }, createCloseDom: function (dom, doms) {
            var tab = this, closeEl = $DomUtils.xCreate({ tagName: "span", className: "close", contextKey: "close" }, null, doms);
            if (tab._parent instanceof dorado.widget.TabBar) {
                doms.tabLeft.appendChild(closeEl);
            } else {
                dom.insertBefore(closeEl, doms.tabRight);
            }
            jQuery(closeEl).click(function (event) {
                if (!tab._disabled) {
                    tab.close();
                }
                event.stopImmediatePropagation();
            }).addClassOnHover("close-hover", null, function () {
                return !tab._disabled;
            }).addClassOnClick("close-click", null, function () {
                return !tab._disabled;
            });
            $fly(dom).addClass(tab._className + TAB_CLOSEABLE_CLASS);
        }, doSetParentViewElement: function (parentViewElement) {
            this._parent = parentViewElement;
        }
    });
    dorado.widget.tab.ControlTab = $extend(dorado.widget.tab.Tab, {
        $className: "dorado.widget.tab.ControlTab", ATTRIBUTES: {
            control: {
                setter: function (control) {
                    var oldValue = this._control;
                    if (control && control.constructor == Object.prototype.constructor) {
                        control = dorado.Toolkits.createInstance("widget", control);
                    }
                    this._control = control;
                    if (oldValue) {
                        var tabgroup = this._parent;
                        if (tabgroup && tabgroup._cardBook) {
                            tabgroup._cardBook.replaceControl(oldValue, control);
                        }
                    }
                }
            }
        }, destroy: function () {
            this._control && this._control.destroy();
            $invokeSuper.call(this);
        }, doGetControl: function () {
            var result = this._control;
            if (!result) {
                result = this._control = new dorado.widget.Control();
            }
            return result;
        }
    });
    dorado.widget.tab.IFrameTab = $extend(dorado.widget.tab.ControlTab, {
        $className: "dorado.widget.tab.IFrameTab", ATTRIBUTES: { path: { path: "_control.path" } }, doGetControl: function () {
            var tab = this, iframe = this._control;
            if (!iframe) {
                iframe = this._control = new dorado.widget.IFrame({ path: tab._path });
            }
            return iframe;
        }
    });
})();
(function () {
    var LEFT_BUTTON_CLASS = "left-button", RIGHT_BUTTON_CLASS = "right-button", MENU_BUTTON_CLASS = "menu-button", TOP_BUTTON_CLASS = "top-button", BOTTOM_BUTTON_CLASS = "bottom-button";
    dorado.widget.TabGroup = $extend(dorado.widget.Control, {
        $className: "dorado.widget.TabGroup", focusable: true, tabShortTypeName: "tab", ATTRIBUTES: {
            currentTab: {
                setter: function (value) {
                    var tabgroup = this, tabs = tabgroup._tabs, rendered = tabgroup._rendered, realTab;
                    if (typeof value == "number" || typeof value == "string") {
                        realTab = tabs.get(value);
                    } else {
                        realTab = value;
                    }
                    if (rendered) {
                        if (realTab && !realTab._disabled) {
                            tabgroup.doChangeCurrentTab(realTab);
                        }
                    } else {
                        if (realTab == null) {
                            tabgroup._currentTab = value;
                        } else {
                            tabgroup._currentTab = realTab;
                        }
                    }
                }
            }, currentIndex: {
                skipRefresh: true, getter: function () {
                    var tabgroup = this, tabs = tabgroup._tabs, currentTab = tabgroup._currentTab;
                    if (currentTab) {
                        if (typeof currentTab == "number") {
                            return currentTab;
                        } else {
                            return tabs.indexOf(currentTab);
                        }
                    }
                    return -1;
                }, setter: function (index) {
                    this.set("currentTab", index);
                }
            }, tabs: {
                setter: function (value) {
                    var tabgroup = this, tabs = tabgroup._tabs;
                    if (tabs) {
                        tabgroup.clearTabs();
                    }
                    if (value && value instanceof Array) {
                        for (var i = 0, j = value.length; i < j; i++) {
                            var tab = value[i];
                            tabgroup.addTab(tab, null, false);
                        }
                    }
                    var currentTab = tabgroup._currentTab;
                    if (typeof currentTab == "number" || typeof currentTab == "string") {
                        var result = tabgroup._tabs.get(currentTab);
                        if (result) {
                            tabgroup._currentTab = result;
                        }
                    }
                }
            }, alwaysShowNavButtons: {
                skipRefresh: true, setter: function (value) {
                    var tabgroup = this;
                    tabgroup._alwaysShowNavButtons = value;
                    if (value) {
                        tabgroup.showNavButtons();
                        tabgroup.refreshNavButtons();
                    } else {
                        tabgroup.hideNavButtons();
                    }
                }
            }, tabPlacement: {
                skipRefresh: true, setter: function (value) {
                    if (this._rendered) {
                        this.doChangeTabPlacement(value);
                    } else {
                        this._tabPlacement = value;
                    }
                }
            }, contextMenuTab: { readOnly: true }
        }, EVENTS: { beforeTabChange: {}, onTabChange: {}, onTabRemove: {}, onTabContextMenu: {} }, constructor: function () {
            this._tabs = new dorado.util.KeyedArray(function (value) {
                return value._name;
            });
            $invokeSuper.call(this, arguments);
        }, destroy: function () {
            var tabgroup = this, tabs = tabgroup._tabs;
            for (var i = tabs.size - 1; i >= 0; i--) {
                tabs.get(i).destroy();
            }
            tabs.clear();
            $invokeSuper.call(tabgroup);
        }, doGet: function (attr) {
            var c = attr.charAt(0);
            if (c == "#" || c == "&") {
                var name = attr.substring(1);
                return this.getTab(name);
            } else {
                return $invokeSuper.call(this, [attr]);
            }
        }, disableTab: function (tab) {
            var tabgroup = this, tabDom, navmenu = tabgroup._navmenu, tabs = tabgroup._tabs, index;
            tab = tabgroup.getTab(tab);
            index = tabs.indexOf(tab);
            tabDom = tab._dom;
            tab._disabled = true;
            if (tabDom) {
                $fly(tabDom).addClass("tab-disabled");
                if (tab == tabgroup._currentTab) {
                    var newCurrentTab = tabgroup.getAvialableTab(tab);
                    tabgroup.doChangeCurrentTab(newCurrentTab);
                }
            }
            if (navmenu) {
                navmenu.getItem(index).set("disabled", true);
            }
        }, enableTab: function (tab) {
            var tabgroup = this, tabDom, navmenu = tabgroup._navmenu, tabs = tabgroup._tabs, index;
            tab = tabgroup.getTab(tab);
            index = tabs.indexOf(tab);
            tabDom = tab._dom;
            tab._disabled = false;
            if (tabDom) {
                $fly(tabDom).removeClass("tab-disabled");
            }
            if (navmenu) {
                navmenu.getItem(index).set("disabled", false);
            }
        }, doSetTabVisible: function (tab, visible) {
            var tabgroup = this, tabDom, navmenu = tabgroup._navmenu, tabs = tabgroup._tabs, index;
            tab = tabgroup.getTab(tab);
            index = tabs.indexOf(tab);
            tabDom = tab._dom;
            if (tab._visible == visible) {
                return;
            }
            if (tabDom) {
                if (visible) {
                    tabDom.style.display = "";
                } else {
                    tabDom.style.display = "none";
                    if (tab == tabgroup._currentTab) {
                        var newCurrentTab = tabgroup.getAvialableTab(tab);
                        tabgroup.doChangeCurrentTab(newCurrentTab);
                    }
                }
                tabgroup.refreshNavButtons();
            }
            if (navmenu) {
                navmenu.getItem(index).set("visible", visible);
            }
        }, getTab: function (tab) {
            var tabgroup = this, tabs = tabgroup._tabs;
            if (typeof tab == "number" || typeof tab == "string") {
                return tabs.get(tab);
            } else {
                return tab;
            }
        }, addTab: function (tab, index, current) {
            if (!tab) {
                throw new dorado.ResourceException("dorado.base.TabUndefined");
            }
            var tabgroup = this, tabs = tabgroup._tabs;
            if (tabs) {
                if (!(tab instanceof dorado.widget.tab.Tab)) {
                    tab = dorado.Toolkits.createInstance(tabgroup.tabShortTypeName, tab);
                }
                tabgroup.doAddTab(tab, index, current);
                return tab;
            }
            return null;
        }, doAddTab: function (tab, index, current) {
            var tabgroup = this, tabs = tabgroup._tabs, doms = tabgroup._doms, navmenu = tabgroup._navmenu;
            if (index != null) {
                tabs.insert(tab, index);
            } else {
                index = tabs.size;
                tabs.insert(tab);
            }
            if (navmenu) {
                tabgroup.insertNavMenuItem(tab, index);
            }
            tabgroup.registerInnerViewElement(tab);
            if (tabgroup._rendered) {
                tab.render(doms.tabs, index);
                tab.refresh();
            }
            if (current) {
                tabgroup.doChangeCurrentTab(tab);
            }
        }, removeTab: function (tab) {
            var tabgroup = this, tabs = tabgroup._tabs, navmenu = tabgroup._navmenu, index;
            if (tabs) {
                tab = tabgroup.getTab(tab);
                if (navmenu) {
                    index = tabs.indexOf(tab);
                    navmenu.removeItem(index);
                }
                tabgroup.unregisterInnerViewElement(tab);
                tabgroup.doRemoveTab(tab);
                tabgroup.fireEvent("onTabRemove", self, { tab: tab });
            }
        }, doRemoveTab: function (tab) {
            var tabgroup = this, tabs = tabgroup._tabs;
            if (tab != tabgroup._currentTab) {
                tabs.remove(tab);
                tab.destroy();
            } else {
                var avialableTab = tabgroup.getAvialableTab(tab);
                tabs.removeAt(tabs.indexOf(tab));
                tab.destroy();
                tabgroup.doChangeCurrentTab(avialableTab);
            }
            tab.destroy();
            tabgroup.refreshNavButtons();
        }, getAvialableTab: function (tab) {
            var tabgroup = this, tabs = tabgroup._tabs, index, result, i, j;
            if (tabs) {
                if (!tab) {
                    index = -1;
                } else {
                    index = tabs.indexOf(tab);
                }
                for (i = index - 1; i >= 0; i--) {
                    result = tabs.get(i);
                    if (!result._disabled && result._visible) {
                        return result;
                    }
                }
                for (i = index + 1, j = tabs.size; i < j; i++) {
                    result = tabs.get(i);
                    if (!result._disabled && result._visible) {
                        return result;
                    }
                }
            }
            return null;
        }, clearTabs: function () {
            var tabgroup = this, tabs = tabgroup._tabs;
            if (tabs.size) {
                tabgroup._currentTab = null;
            }
            for (var i = 0, j = tabs.size; i < j; i++) {
                tabgroup.removeTab(tabs.get(0));
            }
        }, closeTab: function (tab) {
            if (tab) {
                tab.close();
            }
        }, closeOtherTabs: function (tab, force) {
            if (!tab) {
                return;
            }
            var tabgroup = this, tabs = tabgroup.get("tabs").toArray();
            jQuery.each(tabs, function (index, target) {
                if (target != tab && (force || (!target._disabled && target._closeable))) {
                    target.close();
                }
            });
        }, closeAllTabs: function (force) {
            var tabgroup = this, tabs = tabgroup.get("tabs").toArray();
            jQuery.each(tabs, function (index, tab) {
                if (force || (!tab._disabled && tab._closeable)) {
                    tab.close();
                }
            });
        }, doFilterTabs: function (tabs) {
            var result = new dorado.util.KeyedArray(function (value) {
                return value._name;
            });
            for (var i = 0, j = tabs.size; i < j; i++) {
                var tab = tabs.get(i);
                if (tab._visible) {
                    result.append(tab);
                }
            }
            return result;
        }, doChangeCurrentTab: function (tab, force) {
            var tabgroup = this, doms = tabgroup._doms || {}, currentTab = tabgroup._currentTab;
            if (force !== true && tab == currentTab) {
                return false;
            }
            var eventArg = { newTab: tab, oldTab: currentTab };
            tabgroup.fireEvent("beforeTabChange", tabgroup, eventArg);
            if (eventArg.processDefault === false) {
                return;
            }
            if (currentTab && currentTab._dom) {
                $fly(currentTab._dom).removeClass("tab-selected");
            }
            if (tab && tab._dom) {
                tabgroup.scrollTabIntoView(tab);
            }
            tabgroup._currentTab = tab;
            tabgroup.doOnTabChange(eventArg);
            return true;
        }, doOnTabChange: function (eventArg) {
            var tabgroup = this;
            tabgroup.fireEvent("onTabChange", tabgroup, eventArg);
        }, doChangeTabPlacement: function (value) {
            var tabgroup = this, cls = tabgroup._className, doms = tabgroup._doms, tabbarDom = doms.tabbar;
            if (tabbarDom) {
                var oldValue = tabgroup._tabPlacement;
                $fly(tabbarDom).addClass("d-tabbar-" + value + " " + cls + "-" + value);
                if (oldValue) {
                    $fly(tabbarDom).removeClass("d-tabbar-" + oldValue + " " + cls + "-" + oldValue);
                }
            }
            tabgroup._tabPlacement = value;
            return true;
        }
    });
    dorado.widget.TabColumn = $extend(dorado.widget.TabGroup, {
        $className: "dorado.widget.TabColumn", focusable: true, ATTRIBUTES: { className: { defaultValue: "d-tabcolumn" }, tabPlacement: { skipRefresh: true, defaultValue: "left" }, verticalText: {} }, createDom: function () {
            var tabcolumn = this, tabs = tabcolumn._tabs, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", className: tabcolumn._className, contextKey: "tabbar", content: [{ tagName: "div", className: "tabs-wrap column-tabs-wrap", contextKey: "tabsWrap", content: { tagName: "ul", className: "tabs column-tabs", contextKey: "tabs" } }] }, null, doms), jDom = jQuery(dom);
            tabcolumn._doms = doms;
            if (tabcolumn._verticalText) {
                jDom.addClass(tabcolumn._className + "-vtext");
                if (dorado.Browser.msie && dorado.Browser.version == 6) {
                    jDom.addClass(tabcolumn._className + "-vtext-" + tabcolumn._tabPlacement);
                }
            }
            jDom.addClass(tabcolumn._tabPlacement == "left" ? tabcolumn._className + "-left" : tabcolumn._className + "-right");
            if (tabcolumn._alwaysShowNavButtons) {
                tabcolumn.createNavButtons(dom);
            }
            var tabsEl = doms.tabs, currentTab = tabcolumn._currentTab;
            if (tabs) {
                for (var i = 0, j = tabs.size; i < j; i++) {
                    var tab = tabs.get(i);
                    if (tab._current) {
                        currentTab = tab;
                    }
                    tab.render(tabsEl);
                }
                if (!currentTab) {
                    currentTab = tabcolumn.getAvialableTab();
                }
                if (currentTab) {
                    tabcolumn.doChangeCurrentTab(currentTab, true);
                }
            }
            $fly(doms.tabsWrap).mousewheel(function (event, delta) {
                if (tabcolumn._overflowing) {
                    if (delta < 0) {
                        tabcolumn.doScrollBottom(false);
                    } else {
                        if (delta > 0) {
                            tabcolumn.doScrollTop(false);
                        }
                    }
                }
            });
            return dom;
        }, refreshTabColumn: function () {
            var tabbar = this, tabs = tabbar._tabs;
            if (tabs) {
                for (var i = 0, j = tabs.size; i < j; i++) {
                    var tab = tabs.get(i);
                    tab.refreshDom(tab._dom);
                }
            }
            tabbar.onToolButtonVisibleChange();
            tabbar.refreshNavButtons();
        }, doChangeTabPlacement: function (value) {
            var tabgroup = this, cls = tabgroup._className, doms = tabgroup._doms, tabbarDom = doms.tabbar;
            if (tabbarDom) {
                var oldValue = tabgroup._tabPlacement;
                $fly(tabbarDom).addClass(this._className + "-" + value + " " + cls + "-" + value);
                if (oldValue) {
                    $fly(tabbarDom).removeClass(this._className + "-" + oldValue + " " + cls + "-" + oldValue);
                }
            }
            tabgroup._tabPlacement = value;
            return true;
        }, refreshDom: function (dom) {
            $invokeSuper.call(this, arguments);
            this.refreshTabColumn();
        }, scrollTabIntoView: function (tab) {
            var tabbar = this, doms = tabbar._doms, tabDom = tab._dom, tabsEl = doms.tabs, offsetTop = tabDom.offsetTop, offsetHeight = tabDom.offsetHeight, top = (parseInt(tabsEl.style.top, 10) || 0) * -1, viewHeight = $fly(doms.tabsWrap).height();
            $fly(tabDom).addClass("tab-selected");
            if (top > offsetTop) {
                $fly(tabsEl).animate({ top: -1 * offsetTop }, 300, null, function () {
                    tabbar.refreshNavButtons();
                });
            } else {
                if ((top + viewHeight) < (offsetTop + offsetHeight)) {
                    $fly(tabsEl).animate({ top: -1 * (offsetTop + offsetHeight - viewHeight) }, 300, null, function () {
                        tabbar.refreshNavButtons();
                    });
                } else {
                    tabbar.refreshNavButtons();
                }
            }
        }, refreshNavButtons: function () {
            var tabcolumn = this, dom = tabcolumn._dom, tabs = tabcolumn._tabs, doms = tabcolumn._doms;
            if (!dom || !tabs) {
                return;
            }
            var topButton = tabcolumn._topButton, bottomButton = tabcolumn._bottomButton;
            var tabsHeight = tabcolumn.getTabsHeight(), tabsEl = doms.tabs, currentTop = parseInt(tabsEl.style.top || 0, 10);
            var visibleHeight = $fly(doms.tabsWrap).height();
            if (tabsHeight > 0) {
                if (tabcolumn._alwaysShowNavButtons !== true && visibleHeight > tabsHeight) {
                    tabcolumn._overflowing = false;
                    if (bottomButton) {
                        bottomButton.set("disabled", true);
                        if (tabsHeight + currentTop <= visibleHeight) {
                            $fly(tabsEl).top(0);
                            if (!tabcolumn._alwaysShowNavButtons) {
                                tabcolumn.hideNavButtons();
                            }
                        }
                    }
                } else {
                    tabcolumn._overflowing = true;
                    if (!tabcolumn._alwaysShowNavButtons) {
                        tabcolumn.showNavButtons();
                        visibleHeight = $fly(doms.tabsWrap).innerHeight();
                        currentTop = parseInt(tabsEl.style.top, 10);
                    }
                    if (!bottomButton) {
                        bottomButton = tabcolumn._bottomButton;
                        topButton = tabcolumn._topButton;
                    }
                    if (tabsHeight + currentTop > visibleHeight) {
                        bottomButton.set("disabled", false);
                    } else {
                        if (tabsHeight + currentTop < visibleHeight) {
                            $fly(tabsEl).top(visibleHeight - tabsHeight);
                            bottomButton.set("disabled", true);
                        } else {
                            if (tabsHeight + currentTop == visibleHeight) {
                                bottomButton.set("disabled", true);
                            }
                        }
                    }
                    if (parseInt(tabsEl.style.top, 10) < 0) {
                        topButton.set("disabled", false);
                    } else {
                        topButton.set("disabled", true);
                    }
                    if (topButton._disabled && bottomButton._disabled) {
                        $fly(tabsEl).top(0);
                    }
                }
            }
        }, showNavButtons: function () {
            var tabcolumn = this, dom = tabcolumn._dom, modifyTop = true, doms = tabcolumn._doms;
            if (dom) {
                if (!doms.topButton) {
                    tabcolumn.createNavButtons(dom);
                } else {
                    if ($fly(doms.topButton).css("display") == "none") {
                        $fly([doms.topButton, doms.bottomButton]).css("display", "block");
                    } else {
                        modifyTop = false;
                    }
                }
                if (modifyTop) {
                    var tabsEl = doms.tabs, top = parseInt(tabsEl.style.top, 10) || 0;
                    $fly(tabsEl).top(top);
                }
                tabcolumn.onToolButtonVisibleChange();
            }
        }, hideNavButtons: function (force) {
            var tabcolumn = this, dom = tabcolumn._dom, doms = tabcolumn._doms;
            if (!dom) {
                return;
            }
            var topButton = doms.topButton, bottomButton = doms.bottomButton;
            if (topButton && bottomButton) {
                var tabsHeight = tabcolumn.getTabsHeight(), visibleHeight = $fly(doms.tabsWrap).innerHeight();
                if ((tabsHeight < visibleHeight) || force) {
                    $fly(topButton).css("display", "none");
                    $fly(bottomButton).css("display", "none");
                    tabcolumn.onToolButtonVisibleChange();
                }
            }
        }, getTabsHeight: function () {
            var tabcolumn = this, tabs = tabcolumn._tabs, lastTab, lastDom;
            if (tabs) {
                lastTab = tabs.get(tabs.size - 1);
                if (lastTab) {
                    lastDom = lastTab._dom;
                    if (lastDom) {
                        return lastDom.offsetTop + $fly(lastDom).outerHeight();
                    }
                }
            }
            return 0;
        }, createNavButtons: function (dom) {
            var tabcolumn = this;
            if (!dom) {
                return;
            }
            var doms = tabcolumn._doms, tabbarDom = doms.tabbar, topBtn, bottomBtn;
            topBtn = tabcolumn._topButton = new dorado.widget.SimpleButton({
                className: TOP_BUTTON_CLASS, listener: {
                    onClick: function () {
                        tabcolumn.doScrollTop(true);
                    }
                }
            });
            bottomBtn = tabcolumn._bottomButton = new dorado.widget.SimpleButton({
                className: BOTTOM_BUTTON_CLASS, listener: {
                    onClick: function () {
                        tabcolumn.doScrollBottom(true);
                    }
                }
            });
            tabcolumn.registerInnerControl(topBtn);
            tabcolumn.registerInnerControl(bottomBtn);
            topBtn.render(tabbarDom);
            tabbarDom.insertBefore(topBtn._dom, tabbarDom.firstChild);
            bottomBtn.render(tabbarDom);
            tabbarDom.appendChild(bottomBtn._dom);
            doms.topButton = topBtn._dom;
            doms.bottomButton = bottomBtn._dom;
            $fly(doms.topButton).repeatOnClick(function () {
                tabcolumn.doScrollTop(false, 12);
            }, 30);
            $fly(doms.bottomButton).repeatOnClick(function () {
                tabcolumn.doScrollBottom(false, 12);
            }, 30);
        }, doScrollTop: function (anim, length) {
            var tabcolumn = this, doms = tabcolumn._doms, tabsEl = doms.tabs, to = parseInt(tabsEl.style.top, 10) + (length > 0 ? length : 100);
            if (anim) {
                $fly(tabsEl).animate({ top: to > 0 ? 0 : to }, 300, null, function () {
                    tabcolumn.refreshNavButtons();
                });
            } else {
                $fly(tabsEl).top(to > 0 ? 0 : to);
                tabcolumn.refreshNavButtons();
            }
        }, doScrollBottom: function (anim, length) {
            var tabcolumn = this, doms = tabcolumn._doms, tabs = tabcolumn._tabs, tabsEl = doms.tabs, currentTop = parseInt(tabsEl.style.top || 0, 10);
            length = length > 0 ? length : 100;
            if (tabs) {
                var tabsHeight = tabcolumn.getTabsHeight(), visibleHeight = $fly(doms.tabsWrap).innerHeight(), to = currentTop - length, bottomHeight = tabsHeight + currentTop - visibleHeight;
                if (bottomHeight <= 0) {
                    return false;
                } else {
                    if (bottomHeight < length) {
                        to = currentTop - bottomHeight;
                    }
                }
            }
            if (anim) {
                $fly(tabsEl).animate({ top: to }, 300, null, function () {
                    tabcolumn.refreshNavButtons();
                });
            } else {
                $fly(tabsEl).top(to);
                tabcolumn.refreshNavButtons();
            }
        }, onToolButtonVisibleChange: function () {
            var tabcolumn = this, dom = tabcolumn._dom, doms = tabcolumn._doms;
            if (!dom) {
                return;
            }
            var topButton = doms.topButton, bottomButton = doms.bottomButton;
            var topHeight = 0, bottomHeight = 0, menuButtonWidth = 0;
            if (topButton && topButton.style.display != "none") {
                topHeight += $fly(topButton).outerHeight(true);
            }
            if (bottomButton && bottomButton.style.display != "none") {
                bottomHeight += $fly(bottomButton).outerHeight(true);
            }
            $fly(doms.tabsWrap).css({ height: tabcolumn.getRealHeight() - topHeight - bottomHeight });
        }
    });
    dorado.widget.TabBar = $extend(dorado.widget.TabGroup, {
        $className: "dorado.widget.TabBar", focusable: true, ATTRIBUTES: {
            className: { defaultValue: "d-tabbar" }, showMenuButton: {
                skipRefresh: true, setter: function (value) {
                    var tabbar = this, dom = tabbar._dom, doms = tabbar._doms;
                    if (dom) {
                        if (value) {
                            if (!doms.menuButton) {
                                tabbar.createMenuButton(dom);
                            } else {
                                $fly(doms.menuButton).css("display", "");
                            }
                        } else {
                            if (doms.menuButton) {
                                $fly(doms.menuButton).css("display", "none");
                            }
                        }
                        tabbar.refreshNavButtons();
                        tabbar.onToolButtonVisibleChange();
                    }
                    tabbar._showMenuButton = value;
                }
            }, tabMinWidth: { writeOnce: true }, tabPlacement: { defaultValue: "top" }, height: { independent: true, readOnly: true }
        }, refreshNavButtons: function () {
            var tabbar = this, dom = tabbar._dom, tabs = tabbar._tabs, doms = tabbar._doms;
            if (!dom || !tabs) {
                return;
            }
            var leftButton = tabbar._leftButton, rightButton = tabbar._rightButton;
            var tabsWidth = tabbar.getTabsWidth(), tabsEl = doms.tabs, currentLeft = parseInt(tabsEl.style.left || 0, 10);
            var visibleWidth = $fly(doms.tabsWrap).width();
            if (tabsWidth > 0) {
                if (tabbar._alwaysShowNavButtons !== true && visibleWidth > tabsWidth) {
                    tabbar._overflowing = false;
                    if (rightButton) {
                        rightButton.set("disabled", true);
                        if (tabsWidth + currentLeft <= visibleWidth) {
                            $fly(tabsEl).left(0);
                            if (!tabbar._alwaysShowNavButtons) {
                                tabbar.hideNavButtons();
                            }
                        }
                    }
                } else {
                    tabbar._overflowing = true;
                    if (!tabbar._alwaysShowNavButtons) {
                        tabbar.showNavButtons();
                        visibleWidth = $fly(doms.tabsWrap).innerWidth();
                        currentLeft = parseInt(tabsEl.style.left, 10);
                    }
                    if (!rightButton) {
                        rightButton = tabbar._rightButton;
                        leftButton = tabbar._leftButton;
                    }
                    if (tabsWidth + currentLeft > visibleWidth) {
                        rightButton.set("disabled", false);
                    } else {
                        if (tabsWidth + currentLeft < visibleWidth) {
                            $fly(tabsEl).left(visibleWidth - tabsWidth);
                            rightButton.set("disabled", true);
                        } else {
                            if (tabsWidth + currentLeft == visibleWidth) {
                                rightButton.set("disabled", true);
                            }
                        }
                    }
                    if (parseInt(tabsEl.style.left, 10) < 0) {
                        leftButton.set("disabled", false);
                    } else {
                        leftButton.set("disabled", true);
                    }
                    if (leftButton._disabled && rightButton._disabled) {
                        $fly(tabsEl).left(0);
                    }
                }
            }
        }, showNavButtons: function () {
            var tabbar = this, dom = tabbar._dom, modifyLeft = true, doms = tabbar._doms;
            if (dom) {
                if (!doms.leftButton) {
                    tabbar.createNavButtons(dom);
                } else {
                    if ($fly(doms.leftButton).css("display") == "none") {
                        $fly([doms.leftButton, doms.rightButton]).css("display", "block");
                    } else {
                        modifyLeft = false;
                    }
                }
                if (modifyLeft) {
                    var tabsEl = doms.tabs, left = parseInt(tabsEl.style.left, 10) || 0, leftButtonWidth = $fly(doms.leftButton).outerWidth(true), rightButtonWidth = $fly(doms.rightButton).outerWidth(true);
                    $fly(tabsEl).left(left - leftButtonWidth - rightButtonWidth);
                }
                tabbar.onToolButtonVisibleChange();
            }
        }, hideNavButtons: function (force) {
            var tabbar = this, dom = tabbar._dom, doms = tabbar._doms;
            if (!dom) {
                return;
            }
            var leftButton = doms.leftButton, rightButton = doms.rightButton;
            if (leftButton && rightButton) {
                var tabsWidth = tabbar.getTabsWidth(), visibleWidth = $fly(doms.tabsWrap).innerWidth();
                if ((tabsWidth < visibleWidth) || force) {
                    $fly(leftButton).css("display", "none");
                    $fly(rightButton).css("display", "none");
                    tabbar.onToolButtonVisibleChange();
                }
            }
        }, createDom: function () {
            var tabbar = this, tabs = tabbar._tabs, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", className: tabbar._className, contextKey: "tabbar", content: [{ tagName: "div", className: "tabs-wrap bar-tabs-wrap", contextKey: "tabsWrap", content: { tagName: "ul", className: "tabs bar-tabs", contextKey: "tabs" } }] }, null, doms), jDom = jQuery(dom);
            tabbar._doms = doms;
            jDom.addClass(tabbar._tabPlacement == "top" ? tabbar._className + "-top" : tabbar._className + "-bottom");
            if (tabbar._alwaysShowNavButtons) {
                tabbar.createNavButtons(dom);
            }
            if (tabbar._showMenuButton) {
                tabbar.createMenuButton(dom);
            }
            var tabsEl = doms.tabs, currentTab = tabbar._currentTab;
            if (tabs) {
                for (var i = 0, j = tabs.size; i < j; i++) {
                    var tab = tabs.get(i);
                    if (tab._current) {
                        currentTab = tab;
                    }
                    tab.render(tabsEl);
                }
                if (!currentTab) {
                    currentTab = tabbar.getAvialableTab();
                }
                if (currentTab) {
                    tabbar.doChangeCurrentTab(currentTab, true);
                }
            }
            $fly(doms.tabsWrap).mousewheel(function (event, delta) {
                if (tabbar._overflowing) {
                    if (delta < 0) {
                        tabbar.doScrollRight(false);
                    } else {
                        if (delta > 0) {
                            tabbar.doScrollLeft(false);
                        }
                    }
                }
            });
            var rightToolButtons = tabbar._rightToolButtons;
            if (rightToolButtons) {
                for (var i = 0, j = rightToolButtons.length; i < j; i++) {
                    var toolButton = rightToolButtons[i];
                    tabbar.registerInnerControl(toolButton);
                    toolButton.render(dom);
                }
            }
            return dom;
        }, refreshTabBar: function () {
            var tabbar = this, tabs = tabbar._tabs;
            if (tabs) {
                for (var i = 0, j = tabs.size; i < j; i++) {
                    var tab = tabs.get(i);
                    tab.refresh();
                }
            }
            tabbar.onToolButtonVisibleChange();
            tabbar.refreshNavButtons();
        }, refreshDom: function (dom) {
            $invokeSuper.call(this, arguments);
            this.refreshTabBar();
        }, doOnTabChange: function (eventArg) {
            var tabbar = this;
            tabbar.fireEvent("onTabChange", tabbar, eventArg);
        }, createNavButtons: function (dom) {
            var tabbar = this;
            if (!dom) {
                return;
            }
            var doms = tabbar._doms, tabbarDom = doms.tabbar, leftBtn, rightBtn;
            leftBtn = tabbar._leftButton = new dorado.widget.SimpleButton({
                className: LEFT_BUTTON_CLASS, listener: {
                    onClick: function () {
                        tabbar.doScrollLeft(true);
                    }
                }
            });
            rightBtn = tabbar._rightButton = new dorado.widget.SimpleButton({
                className: RIGHT_BUTTON_CLASS, listener: {
                    onClick: function () {
                        tabbar.doScrollRight(true);
                    }
                }
            });
            tabbar.registerInnerControl(leftBtn);
            tabbar.registerInnerControl(rightBtn);
            leftBtn.render(tabbarDom);
            tabbarDom.insertBefore(leftBtn._dom, tabbarDom.firstChild);
            rightBtn.render(tabbarDom);
            tabbarDom.insertBefore(rightBtn._dom, doms.tabsWrap);
            doms.leftButton = leftBtn._dom;
            doms.rightButton = rightBtn._dom;
            $fly(doms.leftButton).repeatOnClick(function () {
                tabbar.doScrollLeft(false, 12);
            }, 30);
            $fly(doms.rightButton).repeatOnClick(function () {
                tabbar.doScrollRight(false, 12);
            }, 30);
        }, doScrollLeft: function (anim, length) {
            var tabbar = this, doms = tabbar._doms, tabsEl = doms.tabs, to = parseInt(tabsEl.style.left, 10) + (length > 0 ? length : 100);
            if (anim) {
                $fly(tabsEl).animate({ left: to > 0 ? 0 : to }, 300, null, function () {
                    tabbar.refreshNavButtons();
                });
            } else {
                $fly(tabsEl).left(to > 0 ? 0 : to);
                tabbar.refreshNavButtons();
            }
        }, doScrollRight: function (anim, length) {
            var tabbar = this, doms = tabbar._doms, tabs = tabbar._tabs, tabsEl = doms.tabs, currentLeft = parseInt(tabsEl.style.left || 0, 10);
            length = length > 0 ? length : 100;
            if (tabs) {
                var tabsWidth = tabbar.getTabsWidth(), visibleWidth = $fly(doms.tabsWrap).innerWidth(), to = currentLeft - length, rightWidth = tabsWidth + currentLeft - visibleWidth;
                if (rightWidth <= 0) {
                    return false;
                } else {
                    if (rightWidth < length) {
                        to = currentLeft - rightWidth;
                    }
                }
            }
            if (anim) {
                $fly(tabsEl).animate({ left: to }, 300, null, function () {
                    tabbar.refreshNavButtons();
                });
            } else {
                $fly(tabsEl).left(to);
                tabbar.refreshNavButtons();
            }
        }, createMenuButton: function (dom) {
            var tabbar = this;
            if (!dom) {
                return;
            }
            var wrapEl = dom.lastChild, doms = tabbar._doms, rightButtonEl = doms.rightButton, refEl = wrapEl;
            if (rightButtonEl) {
                refEl = rightButtonEl;
            }
            var navmenu = tabbar._navmenu = new dorado.widget.Menu({
                listener: {
                    beforeShow: function (self, configs) {
                        if (tabbar._tabPlacement == "top") {
                            dorado.Object.apply(configs, { anchorTarget: menuBtn, align: "innerright", vAlign: "bottom" });
                        } else {
                            dorado.Object.apply(configs, { anchorTarget: menuBtn, align: "innerright", vAlign: "top" });
                        }
                    }
                }
            }), tabs = tabbar._tabs, tab;
            for (var i = 0, j = tabs.size; i < j; i++) {
                tab = tabs.get(i);
                tabbar.insertNavMenuItem(tab);
            }
            var menuBtn = tabbar._menuButton = new dorado.widget.SimpleButton({ className: MENU_BUTTON_CLASS, menu: navmenu });
            menuBtn.render(dom);
            dom.insertBefore(menuBtn._dom, refEl);
            doms.menuButton = menuBtn._dom;
        }, insertNavMenuItem: function (tab, index) {
            var tabbar = this, navmenu = tabbar._navmenu;
            if (navmenu && tab) {
                navmenu.addItem({
                    caption: tab._caption, icon: tab._icon, iconClass: tab._iconClass, disabled: tab._disabled, visible: tab._visible, listener: {
                        onClick: function () {
                            tabbar.set("currentTab", tab);
                        }
                    }
                }, index);
            }
        }, getTabsWidth: function () {
            var tabbar = this, tabs = tabbar._tabs, lastTab, lastDom;
            if (tabs) {
                lastTab = tabs.get(tabs.size - 1);
                if (lastTab) {
                    lastDom = lastTab._dom;
                    if (lastDom) {
                        return lastDom.offsetLeft + $fly(lastDom).outerWidth();
                    }
                }
            }
            return 0;
        }, addRightToolButton: function (button) {
            if (!button) {
                return;
            }
            var tabbar = this, rightToolButtons = tabbar._rightToolButtons;
            if (!rightToolButtons) {
                rightToolButtons = tabbar._rightToolButtons = [];
            }
            rightToolButtons.push(button);
            if (tabbar._rendered) {
                tabbar.registerInnerControl(button);
                button.render(tabbar._dom);
                tabbar.onToolButtonVisibleChange();
            }
        }, scrollTabIntoView: function (tab) {
            var tabbar = this, doms = tabbar._doms, tabDom = tab._dom, tabsEl = doms.tabs, offsetLeft = tabDom.offsetLeft, offsetWidth = tabDom.offsetWidth, left = (parseInt(tabsEl.style.left, 10) || 0) * -1, viewWidth = $fly(doms.tabsWrap).width();
            $fly(tabDom).addClass("tab-selected");
            if (left > offsetLeft) {
                $fly(tabsEl).animate({ left: -1 * offsetLeft }, 300, null, function () {
                    tabbar.refreshNavButtons();
                });
            } else {
                if ((left + viewWidth) < (offsetLeft + offsetWidth)) {
                    $fly(tabsEl).animate({ left: -1 * (offsetLeft + offsetWidth - viewWidth) }, 300, null, function () {
                        tabbar.refreshNavButtons();
                    });
                } else {
                    tabbar.refreshNavButtons();
                }
            }
        }, onToolButtonVisibleChange: function () {
            var tabbar = this, dom = tabbar._dom, doms = tabbar._doms;
            if (!dom) {
                return;
            }
            var leftButton = doms.leftButton, rightButton = doms.rightButton, menuButton = doms.menuButton;
            var leftWidth = 0, rightWidth = 0, menuButtonWidth = 0;
            if (leftButton && leftButton.style.display != "none") {
                leftWidth += $fly(leftButton).outerWidth(true);
            }
            if (rightButton && rightButton.style.display != "none") {
                rightWidth += $fly(rightButton).outerWidth(true);
            }
            if (menuButton) {
                var menuButtonVisible = menuButton.style.display != "none";
                menuButtonWidth = menuButtonVisible ? $fly(menuButton).outerWidth(true) : 0;
                rightWidth += menuButtonWidth;
            }
            var rightToolButtons = tabbar._rightToolButtons, buttonsWidth = menuButtonWidth;
            if (rightToolButtons) {
                var tabsWrapHeight = $fly(doms.tabsWrap).height();
                for (var i = rightToolButtons.length - 1; i >= 0; i--) {
                    var toolButton = rightToolButtons[i], toolButtonWidth = $fly(toolButton._dom).outerWidth(true), toolButtonHeight = $fly(toolButton._dom).outerHeight(true);
                    $fly(toolButton._dom).css({ position: "absolute", top: tabbar._tabPlacement == "top" ? Math.floor((tabsWrapHeight - toolButtonHeight) / 2) - 2 : Math.floor((tabsWrapHeight - toolButtonHeight) / 2) + 2, right: buttonsWidth });
                    buttonsWidth += toolButtonWidth;
                    rightWidth += toolButtonWidth;
                }
            }
            if (rightButton) {
                $fly(rightButton).css("right", buttonsWidth);
            }
            $fly(doms.tabsWrap).css({ "margin-left": leftWidth, "margin-right": rightWidth });
        }
    });
    dorado.Toolkits.registerPrototype("tab", { Default: dorado.widget.tab.Tab, Tab: dorado.widget.tab.Tab, IFrame: dorado.widget.tab.IFrameTab, Control: dorado.widget.tab.ControlTab });
})();
dorado.widget.AbstractPanel = $extend(dorado.widget.Container, {
    $className: "dorado.widget.AbstractPanel", ATTRIBUTES: {
        caption: {}, buttons: { writeBeforeReady: true, innerComponent: "Button" }, buttonAlign: {
            defaultValue: "center", skipRefresh: true, setter: function (value) {
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
            }
        }, collapseable: {
            setter: function (value) {
                var panel = this, captionBar = panel._captionBar, button;
                panel._collapseable = value;
                if (captionBar) {
                    button = captionBar.getButton(panel._uniqueId + "_collapse");
                    if (value) {
                        if (button) {
                            $fly(button._dom).css("display", "");
                        } else {
                            panel._createCollapseButton();
                        }
                    } else {
                        if (button) {
                            $fly(button._dom).css("display", "none");
                        }
                    }
                }
            }
        }, collapsed: {
            getter: function (attr, value) {
                var panel = this;
                if (panel._parent instanceof dorado.widget.SplitPanel && panel._parent._sideControl == panel && panel._parent._collapseable) {
                    return panel._parent._collapsed;
                } else {
                    return panel._collapsed;
                }
            }, setter: function (value) {
                var panel = this;
                if (panel._rendered) {
                    panel.doSetCollapsed(value);
                } else {
                    panel._collapsed = value;
                    if (panel._collapseable) {
                        panel._contentContainerVisible = !value;
                    }
                }
            }
        }
    }, EVENTS: { beforeCollapsedChange: {}, onCollapsedChange: {} }, doOnResize: function () {
        this._doOnResize();
        $invokeSuper.call(this);
    }, toggleCollapsed: function (animate) {
        var panel = this, collapsed = panel.get("collapsed");
        panel.doSetCollapsed(!collapsed, animate);
    }, setContentContainerVisible: function (collapsed) {
        var panel = this, buttons = panel._buttons, doms = panel._doms;
        if (buttons) {
            for (var i = 0, j = buttons.length; i < j; i++) {
                var button = buttons[i];
                button.setActualVisible(collapsed);
            }
        }
        if (doms && dorado.Browser.msie && dorado.Browser.version == 6) {
            $fly(doms.body).css("zoom", "1");
        }
        $invokeSuper.call(this, arguments);
    }, doSetCollapsed: function (collapsed, animate) {
        function beforeCollapsedChange(panel, collapsed) {
            if (collapsed) {
                panel._heightBeforeCollapse = panel.getRealHeight();
            }
            panel.setContentContainerVisible(!collapsed);
        }
        function onCollapsedChange(panel, collapsed) {
            panel._doOnResize(collapsed);
            if (dorado.Browser.msie && !collapsed) {
                $fly(panel.getContentContainer()).css("zoom", 1);
            }
            panel.notifySizeChange();
            panel.fireEvent("onCollapsedChange", panel);
        }
        var panel = this, dom = panel._dom, doms = panel._doms, collapseButton = panel._collapseButton, eventArg = {};
        panel.fireEvent("beforeCollapsedChange", panel, eventArg);
        if (eventArg.processDefault === false) {
            return;
        }
        if (panel._parent instanceof dorado.widget.SplitPanel && panel._parent._sideControl == panel && panel._parent._collapseable) {
            var direction = panel._parent._direction;
            if (collapseButton) {
                collapseButton.set("iconClass", collapsed ? ("expand-icon-" + direction) : ("collapse-icon-" + direction));
            }
            if (!panel._splitPanelCascade) {
                panel._parent.doSetCollapsed(collapsed, function () {
                    beforeCollapsedChange(panel, collapsed);
                    onCollapsedChange(panel, collapsed);
                }, true);
            }
        } else {
            panel._collapsed = collapsed;
            var orginalZIndex;
            if (panel._rendered) {
                if (collapsed) {
                    if (animate === false || animate === undefined) {
                        $fly(dom).addClass(panel._className + "-collapsed");
                        if (collapseButton) {
                            collapseButton.set("iconClass", "expand-icon");
                        }
                        beforeCollapsedChange(panel, collapsed);
                        $fly(doms.body).css("display", "none");
                        onCollapsedChange(panel, collapsed);
                    } else {
                        $fly(doms.body).safeSlideOut({
                            direction: "b2t", start: function () {
                                orginalZIndex = dom.style.zIndex;
                                $fly(dom).bringToFront().addClass(panel._className + "-collapsed");
                                if (collapseButton) {
                                    collapseButton.set("iconClass", "expand-icon");
                                }
                                beforeCollapsedChange(panel, collapsed);
                            }, step: function () {
                            }, complete: function () {
                                onCollapsedChange(panel, collapsed);
                                dom.style.zIndex = orginalZIndex || "";
                                orginalZIndex = null;
                            }
                        });
                    }
                } else {
                    if (animate === false || animate === undefined) {
                        $fly(dom).removeClass(panel._className + "-collapsed");
                        if (collapseButton) {
                            collapseButton.set("iconClass", "collapse-icon");
                        }
                        beforeCollapsedChange(panel, collapsed);
                        $fly(doms.body).css("display", "");
                        onCollapsedChange(panel, collapsed);
                    } else {
                        var $body = jQuery(doms.body).css("display", "");
                        beforeCollapsedChange(panel, collapsed);
                        $body.safeSlideIn({
                            direction: "t2b", start: function () {
                                orginalZIndex = dom.style.zIndex;
                                $fly(dom).bringToFront().removeClass(panel._className + "-collapsed");
                            }, step: function () {
                            }, complete: function () {
                                if (collapseButton) {
                                    collapseButton.set("iconClass", "collapse-icon");
                                }
                                onCollapsedChange(panel, collapsed);
                                dom.style.zIndex = orginalZIndex || "";
                                orginalZIndex = null;
                            }
                        });
                    }
                }
            }
        }
    }, _createButtonPanel: function (dom) {
        var panel = this, doms = panel._doms, buttonPanel = document.createElement("div");
        buttonPanel.className = "button-panel";
        doms.buttonPanel = buttonPanel;
        if (doms.body) {
            $fly(doms.body).append(buttonPanel);
        } else {
            $fly(dom).append(buttonPanel);
        }
        return buttonPanel;
    }, initButtons: function (dom) {
        var panel = this, doms = panel._doms;
        if (panel._buttons) {
            var buttons = panel._buttons, button, buttonPanel;
            buttonPanel = panel._createButtonPanel(dom);
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
    }, getFocusableSubControls: function () {
        var controls = this._children.toArray();
        return controls.concat(this._buttons);
    }
});
dorado.widget.Panel = $extend(dorado.widget.AbstractPanel, {
    $className: "dorado.widget.Panel", ATTRIBUTES: {
        className: { defaultValue: "d-panel" }, caption: { skipRefresh: true, path: "_captionBar.caption" }, width: { defaultValue: 300 }, border: { writeOnce: true, defaultValue: "normal" }, background: {}, showCaptionBar: { writeBeforeReady: true }, icon: { skipRefresh: true, path: "_captionBar.icon" }, iconClass: { skipRefresh: true, path: "_captionBar.iconClass" }, tools: { innerComponent: "SimpleIconButton" }, maximizeable: {
            setter: function (value) {
                var panel = this, captionBar = panel._captionBar, button;
                panel._maximizeable = value;
                if (captionBar) {
                    button = captionBar.getButton(panel._uniqueId + "_maximize");
                    if (value) {
                        if (button) {
                            $fly(button._dom).css("display", "");
                        } else {
                            panel._createMaximizeButton();
                        }
                    } else {
                        if (button) {
                            $fly(button._dom).css("display", "none");
                        }
                    }
                }
            }
        }, maximized: {
            setter: function (value) {
                this._maximized = value;
                if (this._maximizeable && this._rendered) {
                    if (this.isActualVisible()) {
                        if (value) {
                            this.maximize();
                        } else {
                            this.maximizeRestore();
                        }
                    } else {
                        this._maximizedDirty = true;
                    }
                }
            }
        }, closeable: {
            setter: function (value) {
                var panel = this, captionBar = panel._captionBar, button;
                panel._closeable = value;
                if (captionBar) {
                    button = captionBar.getButton(panel._uniqueId + "_close");
                    if (value) {
                        if (button) {
                            $fly(button._dom).css("display", "");
                        } else {
                            panel._createCloseButton();
                        }
                    } else {
                        if (button) {
                            $fly(button._dom).css("display", "none");
                        }
                    }
                }
            }
        }, closeAction: { defaultValue: "hide" }
    }, EVENTS: { beforeMaximize: {}, onMaximize: {}, beforeClose: {}, onClose: {} }, doOnAttachToDocument: function () {
        if (this._maximizeable && this._maximized) {
            this.maximize();
        }
        $invokeSuper.call(this, arguments);
    }, onActualVisibleChange: function () {
        $invokeSuper.call(this, arguments);
        if (this.isActualVisible() && this._maximizeable && this._maximizedDirty) {
            if (this._maximized) {
                this.maximize();
            } else {
                this.maximizeRestore();
            }
            this._maximizedDirty = false;
        }
    }, createDom: function () {
        var panel = this, doms = {}, dom;
        dom = $DomUtils.xCreate({ tagName: "div", content: { tagName: "div", className: "panel-body", contextKey: "body", content: { tagName: "div", className: "content-panel", contextKey: "contentPanel" } } }, null, doms);
        panel._doms = doms;
        var caption = panel._caption, showCaptionBar = panel._showCaptionBar;
        if (showCaptionBar !== false && (caption || showCaptionBar)) {
            $fly(dom).addClass(panel._className + "-showcaptionbar");
            var tools = panel._tools, toolButtons = [];
            if (tools instanceof Array) {
                for (var i = 0, j = tools.length; i < j; i++) {
                    var tool = tools[i];
                    if (tool) {
                        toolButtons.push(tool);
                    }
                }
            }
            var captionBar = panel._captionBar = new dorado.widget.CaptionBar({ caption: panel._caption, icon: panel._icon, iconClass: panel._iconClass, buttons: toolButtons });
            if (doms.body) {
                captionBar.render(doms.body.parentNode, doms.body);
            } else {
                captionBar.render(dom, doms.contentPanel);
            }
            doms.captionBar = captionBar._dom;
            panel.registerInnerControl(captionBar);
            if (panel._collapseable) {
                panel._createCollapseButton();
            }
            if (panel._collapsed) {
                $fly(doms.body).css("display", "none");
            }
        }
        panel.initButtons(dom);
        if (panel._collapsed) {
            $fly(dom).addClass(panel._className + "-collapsed");
        }
        if (panel._closeable) {
            panel._createCloseButton();
        }
        if (panel._maximizeable) {
            panel._createMaximizeButton();
        }
        panel._modernScroller = $DomUtils.modernScroll(doms.contentPanel);
        return dom;
    }, _createCollapseButton: function () {
        var panel = this;
        if (!panel._captionBar) {
            return;
        }
        var collapseButton = panel._collapseButton = new dorado.widget.SimpleIconButton({
            exClassName: "d-collapse-button", iconClass: panel._collapsed ? "expand-icon" : "collapse-icon", onCreate: function (self) {
                self._uniqueId = panel._uniqueId + "_collapse";
            }, onClick: function () {
                panel.toggleCollapsed(true);
            }
        });
        if (panel._parent instanceof dorado.widget.SplitPanel && panel._parent._sideControl == panel && panel._parent._collapseable) {
            var direction = panel._parent._direction;
            collapseButton.set("iconClass", panel._collapsed ? "expand-icon-" + direction : "collapse-icon-" + direction);
        }
        panel._captionBar.addButton(collapseButton, 101);
    }, _createCloseButton: function () {
        var panel = this, captionBar = panel._captionBar;
        if (captionBar) {
            captionBar.addButton(new dorado.widget.SimpleButton({
                onCreate: function (self) {
                    self._uniqueId = panel._uniqueId + "_close";
                }, onClick: function () {
                    panel.close();
                }, className: "d-close-button"
            }), 104);
        }
    }, doClose: function () {
        var panel = this;
        panel.set("visible", false);
    }, close: function () {
        var panel = this, eventArg = {};
        panel.fireEvent("beforeClose", panel, eventArg);
        if (eventArg.processDefault === false) {
            return;
        }
        panel.doClose();
        panel.fireEvent("onClose", panel);
        if (panel._closeAction == "close") {
            panel.destroy();
        }
    }, _doOnResize: function (collapsed) {
        var panel = this, dom = panel._dom, doms = panel._doms, height = panel.getRealHeight();
        if (typeof height == "number" && height > 0) {
            if (collapsed == undefined) {
                collapsed = panel._collapsed;
            }
            if (collapsed) {
                $fly(dom).height("auto");
            } else {
                if (collapsed === false && panel._heightBeforeCollapse) {
                    height = panel._heightBeforeCollapse;
                    panel._heightBeforeCollapse = null;
                }
                height -= ((parseInt(jQuery.css(dom, "borderTopWidth")) || 0) + (parseInt(jQuery.css(dom, "borderBottomWidth")) || 0));
                var buttonPanelHeight = 0, captionBarHeight = 0;
                if (doms.buttonPanel) {
                    buttonPanelHeight = $fly(doms.buttonPanel).outerHeight(true);
                }
                if (doms.captionBar) {
                    captionBarHeight = $fly(doms.captionBar).outerHeight(true);
                }
                $fly(doms.contentPanel).outerHeight(height - captionBarHeight - buttonPanelHeight);
                $fly(dom).height("auto");
            }
        }
    }, refreshDom: function (dom) {
        var panel = this, doms = panel._doms;
        $invokeSuper.call(this, arguments);
        if (this._background) {
            doms.contentPanel.style.background = this._background;
        }
    }, getContentContainer: function () {
        return this._doms.contentPanel;
    }, maximizeRestore: function () {
        var panel = this, dom = panel._dom, doms = panel._doms;
        if (dom) {
            $fly(doms.contentPanel).css("display", "");
            if (panel._maximizedDirty || panel._maximized) {
                $fly(dom).unfullWindow({
                    callback: function () {
                        panel._maximized = false;
                        panel._width = panel._originalWidth;
                        panel._height = panel._originalHeight;
                        panel._realWidth = panel._originalRealWidth;
                        panel._realHeight = panel._originalRealHeight;
                        panel._left = panel._originalLeft;
                        panel._top = panel._originalTop;
                        panel.refresh();
                        if (panel._left !== undefined && panel._top !== undefined) {
                            $fly(dom).css({ left: panel._left, top: panel._top });
                        }
                    }
                });
                if (panel._draggable) {
                    jQuery(dom).draggable("enable");
                }
                var captionBar = panel._captionBar;
                if (captionBar) {
                    var button = captionBar.getButton(panel._uniqueId + "_maximize");
                    if (button) {
                        $fly(button._dom).prop("className", "d-maximize-button");
                        button._className = "d-maximize-button";
                    }
                }
            }
        }
    }, maximize: function () {
        var panel = this, dom = panel._dom;
        if (dom) {
            var eventArg = {};
            panel.fireEvent("beforeMaximize", panel, eventArg);
            if (eventArg.processDefault === false) {
                return;
            }
            panel._originalWidth = panel._width;
            panel._originalHeight = panel._height;
            panel._originalRealWidth = panel._realWidth;
            panel._originalRealHeight = panel._realHeight;
            panel._originalLeft = panel._left;
            panel._originalTop = panel._top;
            var captionBar = panel._captionBar;
            if (captionBar) {
                var button = captionBar.getButton(panel._uniqueId + "_maximize");
                if (button) {
                    $fly(button._dom).prop("className", "d-restore-button");
                    button._className = "d-restore-button";
                }
            }
            $fly(dom).fullWindow({
                modifySize: false, callback: function (docSize) {
                    panel._maximized = true;
                    panel._width = docSize.width;
                    panel._height = docSize.height;
                    panel._realWidth = panel._realHeight = undefined;
                    panel.refresh();
                }
            });
            if (panel._draggable) {
                jQuery(dom).draggable("disable");
            }
            panel.fireEvent("onMaximize", panel);
        }
    }, _createMaximizeButton: function () {
        var panel = this, captionBar = panel._captionBar;
        if (captionBar) {
            captionBar.addButton(new dorado.widget.SimpleButton({
                className: "d-maximize-button", onCreate: function (self) {
                    self._uniqueId = panel._uniqueId + "_maximize";
                }, onClick: function () {
                    if (!panel._maximized) {
                        panel.maximize();
                    } else {
                        panel.maximizeRestore();
                    }
                }
            }), 103);
        }
    }
});
dorado.widget.FieldSet = $extend(dorado.widget.AbstractPanel, {
    $className: "dorado.widget.FieldSet", ATTRIBUTES: {
        caption: { skipRefresh: false }, className: { defaultValue: "d-field-set" }, collapseable: {
            defaultValue: true, skipRefresh: true, setter: function (value) {
                this._collapseable = value;
                if (value) {
                    if (this._rendered) {
                        if (!this._doms.icon) {
                            this._createCollapseButton();
                        } else {
                            $fly(this._doms.icon).css("display", "");
                        }
                    }
                } else {
                    if (this._doms && this._doms.icon) {
                        $fly(this._doms.icon).css("display", "none");
                    }
                }
            }
        }
    }, createDom: function () {
        var fieldset = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "fieldset", content: [{ tagName: "legend", className: "field-set-legend", contextKey: "captionContainer", content: [{ tagName: "span", className: "caption", contextKey: "caption", content: fieldset._caption }] }, { tagName: "div", className: "body", contextKey: "body", content: { contextKey: "contentPanel", tagName: "div", className: "content-panel" } }] }, null, doms);
        fieldset._doms = doms;
        fieldset.initButtons(dom);
        if (fieldset._collapsed) {
            $fly(dom).addClass(fieldset._className + "-collapsed");
            $fly(doms.body).css("display", "none");
        }
        if (fieldset._collapseable) {
            fieldset._createCollapseButton();
        }
        return dom;
    }, _createCollapseButton: function () {
        var fieldset = this, doms = fieldset._doms, button = document.createElement("span");
        button.className = "collapse-button";
        doms.icon = button;
        jQuery(doms.icon).click(function () {
            fieldset.toggleCollapsed(true);
        }).addClassOnHover("collapse-button-hover").addClassOnClick("collapse-button-click");
        doms.captionContainer.insertBefore(button, doms.caption);
    }, refreshDom: function (dom) {
        var fieldset = this;
        $fly(dom)[fieldset._collapsed ? "addClass" : "removeClass"]("i-field-set-collapsed " + fieldset._className + "-collapsed");
        $fly(fieldset._doms.caption).html(fieldset._caption || "&nbsp;");
        $invokeSuper.call(this, arguments);
    }, _doOnResize: function (collapsed) {
        var fieldset = this, dom = fieldset._dom, doms = fieldset._doms, height = fieldset.getRealHeight();
        if (typeof height == "number" && height > 0) {
            if (collapsed == undefined) {
                collapsed = fieldset._collapsed;
            }
            if (collapsed) {
                $fly(dom).height("auto");
            } else {
                if (collapsed === false && fieldset._heightBeforeCollapse) {
                    height = fieldset._heightBeforeCollapse;
                    fieldset._heightBeforeCollapse = null;
                }
                var buttonPanelHeight = 0, captionCtHeight = 0;
                if (doms.buttonPanel) {
                    buttonPanelHeight = $fly(doms.buttonPanel).outerHeight(true);
                }
                if (doms.captionContainer) {
                    captionCtHeight = $fly(doms.captionContainer).outerHeight(true);
                }
                var $dom = jQuery(dom), edgeHeight = $dom.edgeHeight();
                $fly(doms.contentPanel).outerHeight(height - captionCtHeight - buttonPanelHeight - edgeHeight);
                $fly(dom).height("auto");
            }
        }
    }, getContentContainer: function () {
        return this._doms.contentPanel;
    }
});
dorado.widget.GroupBox = $extend(dorado.widget.AbstractPanel, {
    $className: "dorado.widget.GroupBox", ATTRIBUTES: {
        className: { defaultValue: "d-group-box" }, caption: { skipRefresh: false }, collapseable: {
            defaultValue: true, skipRefresh: true, setter: function (value) {
                this._collapseable = value;
                if (value) {
                    if (this._rendered) {
                        if (!this._doms.icon) {
                            this._createCollapseButton();
                        } else {
                            $fly(this._doms.icon).css("display", "");
                        }
                    }
                } else {
                    if (this._doms && this._doms.icon) {
                        $fly(this._doms.icon).css("display", "none");
                    }
                }
            }
        }
    }, createDom: function () {
        var groupBox = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", className: groupBox._className, content: [{ tagName: "div", className: "caption-bar", contextKey: "captionContainer", content: [{ tagName: "div", className: "caption", content: groupBox._caption, contextKey: "caption" }, { tagName: "div", className: "bar-right" }] }, { tagName: "div", className: "body", contextKey: "body", content: { contextKey: "contentPanel", tagName: "div", className: "content-panel" } }] }, null, doms);
        groupBox._doms = doms;
        groupBox.initButtons(dom);
        if (groupBox._collapsed) {
            $fly(dom).addClass(groupBox._className + "-collapsed");
            $fly(doms.body).css("display", "none");
        }
        if (groupBox._collapseable) {
            groupBox._createCollapseButton();
        }
        return dom;
    }, _createCollapseButton: function () {
        var groupbox = this, doms = groupbox._doms;
        var button = document.createElement("div");
        button.className = "collapse-button";
        doms.icon = button;
        jQuery(doms.icon).click(function () {
            groupbox.toggleCollapsed(true);
        }).addClassOnHover("collapse-button-hover").addClassOnClick("collapse-button-click");
        doms.captionContainer.insertBefore(button, doms.caption);
    }, refreshDom: function (dom) {
        var groupBox = this;
        $fly(dom)[groupBox._collapsed ? "addClass" : "removeClass"](groupBox._className + "-collapsed");
        $fly(groupBox._doms.caption).text(groupBox._caption);
        $invokeSuper.call(this, arguments);
        groupBox._doOnResize();
    }, _doOnResize: function (collapsed) {
        var groupbox = this, dom = groupbox._dom, doms = groupbox._doms, height = groupbox.getRealHeight();
        if (typeof height == "number" && height > 0) {
            if (collapsed == undefined) {
                collapsed = groupbox._collapsed;
            }
            if (collapsed) {
                $fly(dom).height("auto");
            } else {
                if (collapsed === false && groupbox._heightBeforeCollapse) {
                    height = groupbox._heightBeforeCollapse;
                    groupbox._heightBeforeCollapse = null;
                }
                var buttonPanelHeight = 0, captionCtHeight = 0;
                if (doms.buttonPanel) {
                    buttonPanelHeight = $fly(doms.buttonPanel).outerHeight(true);
                }
                if (doms.captionContainer) {
                    captionCtHeight = $fly(doms.captionContainer).outerHeight(true);
                }
                $fly(doms.contentPanel).outerHeight(height - captionCtHeight - buttonPanelHeight);
                $fly(dom).height("auto");
            }
        }
    }, getContentContainer: function () {
        return this._doms.contentPanel;
    }
});
dorado.widget.TabControl = $extend(dorado.widget.TabBar, {
    $className: "dorado.widget.TabControl", _inherentClassName: "", ATTRIBUTES: { height: { defaultValue: 200, independent: false, readOnly: false } }, constructor: function () {
        this._cardBook = new dorado.widget.CardBook();
        this.registerInnerControl(this._cardBook);
        $invokeSuper.call(this, arguments);
    }, doOnTabChange: function (eventArg) {
        var tabControl = this, tabs = tabControl._tabs, tab = eventArg.newTab, index = typeof tab == "number" ? tab : tabs.indexOf(tab), card = tabControl._cardBook;
        if (card) {
            card.set("currentControl", index);
        }
        $invokeSuper.call(this, arguments);
    }, doChangeTabPlacement: function (value) {
        var result = $invokeSuper.call(this, arguments);
        if (!result) {
            return false;
        }
        var tabcontrol = this, dom = tabcontrol._dom;
        if (dom) {
            var tabbarDom = tabcontrol._tabbarDom, cardDom = tabcontrol._cardBook._dom;
            if (dorado.Browser.msie && dorado.Browser.version == 6) {
                if (value == "top") {
                    dom.appendChild(cardDom);
                } else {
                    dom.insertBefore(cardDom, tabbarDom);
                }
            } else {
                if (value == "top") {
                    dom.insertBefore(tabbarDom, cardDom);
                } else {
                    dom.appendChild(tabbarDom);
                }
            }
        }
        return true;
    }, doRemoveTab: function (tab) {
        var tabcontrol = this, tabs = tabcontrol._tabs, index = typeof tab == "number" ? tab : tabs.indexOf(tab), card = tabcontrol._cardBook;
        if (card) {
            card.removeControl(index);
        }
        $invokeSuper.call(this, arguments);
    }, doAddTab: function (tab, index, current) {
        $invokeSuper.call(this, arguments);
        var tabcontrol = this, card = tabcontrol._cardBook, tabs = tabcontrol._tabs;
        if (index == null) {
            index = tabs.indexOf(tab);
        }
        if (card) {
            card.addControl(tab.getControl(), index, current);
        }
    }, doOnAttachToDocument: function () {
        var className = "";
        if (this._ui) {
            var uis = this._ui.split(",");
            for (var i = 0; i < uis.length; i++) {
                className += (" " + this._className + "-" + uis[i]);
            }
        }
        if (className) {
            $fly(this._tabbarDom).addClass(className);
        }
    }, createDom: function () {
        var tabcontrol = this, card = tabcontrol._cardBook, dom = document.createElement("div"), tabbarDom = $invokeSuper.call(this, arguments), tabPlacement = tabcontrol._tabPlacement;
        if (tabPlacement == "top") {
            dom.appendChild(tabbarDom);
        }
        tabcontrol._tabbarDom = tabbarDom;
        var controls = [], tabs = tabcontrol._tabs;
        for (var i = 0, j = tabs.size; i < j; i++) {
            var tab = tabs.get(i);
            controls.push(tab.getControl());
        }
        var currentTab = tabcontrol._currentTab;
        if (currentTab) {
            card._currentControl = currentTab.getControl();
        }
        card.render(dom);
        if (tabPlacement == "bottom") {
            dom.appendChild(tabbarDom);
        }
        return dom;
    }, refreshDom: function (dom) {
        $invokeSuper.call(this, arguments);
        var tabcontrol = this, card = tabcontrol._cardBook, tabbarDom = tabcontrol._tabbarDom, cardDom = tabcontrol._cardBook._dom;
        tabcontrol.refreshTabBar();
        $fly(tabbarDom).css("height", "auto");
        if (tabcontrol._height != null) {
            card._realHeight = tabcontrol.getRealHeight() - $fly(tabbarDom).height();
            card._realWidth = tabcontrol.getRealWidth();
        }
        var tabs = tabcontrol._tabs, currentTab = tabcontrol._currentTab, currentTabIndex = tabs.indexOf(currentTab);
        if (currentTabIndex != -1) {
            card._currentControl = card._controls.get(currentTabIndex);
        }
        card.refreshDom(cardDom);
    }, getFocusableSubControls: function () {
        return [this._cardBook];
    }
});
dorado.widget.VerticalTabControl = $extend(dorado.widget.TabColumn, {
    $className: "dorado.widget.VerticalTabControl", _inherentClassName: "", ATTRIBUTES: { height: { defaultValue: 200, independent: false, readOnly: false }, tabColumnWidth: { defaultValue: 200 } }, constructor: function () {
        this._cardBook = new dorado.widget.CardBook();
        this.registerInnerControl(this._cardBook);
        $invokeSuper.call(this, arguments);
    }, doOnTabChange: function (eventArg) {
        var tabcolumnControl = this, tabs = tabcolumnControl._tabs, tab = eventArg.newTab, index = typeof tab == "number" ? tab : tabs.indexOf(tab), card = tabcolumnControl._cardBook;
        if (card) {
            card.set("currentControl", index);
        }
        $invokeSuper.call(this, arguments);
    }, doChangeTabPlacement: function (value) {
        var result = $invokeSuper.call(this, arguments);
        if (!result) {
            return false;
        }
        var tabcolumnControl = this, dom = tabcolumnControl._dom;
        if (dom) {
            var tabcolumnDom = tabcolumnControl._tabcolumnDom, cardDom = tabcolumnControl._cardBook._dom;
            if (dorado.Browser.msie && dorado.Browser.version == 6) {
                if (value == "left") {
                    dom.appendChild(cardDom);
                } else {
                    dom.insertBefore(cardDom, tabcolumnDom);
                }
            } else {
                if (value == "left") {
                    dom.insertBefore(tabcolumnDom, cardDom);
                } else {
                    dom.appendChild(tabcolumnDom);
                }
            }
        }
        return true;
    }, doRemoveTab: function (tab) {
        var tabcolumnControl = this, tabs = tabcolumnControl._tabs, index = typeof tab == "number" ? tab : tabs.indexOf(tab), card = tabcolumnControl._cardBook;
        if (card) {
            card.removeControl(index);
        }
        $invokeSuper.call(this, arguments);
    }, doAddTab: function (tab, index, current) {
        $invokeSuper.call(this, arguments);
        var tabcolumnControl = this, card = tabcolumnControl._cardBook, tabs = tabcolumnControl._tabs;
        if (index == null) {
            index = tabs.indexOf(tab);
        }
        if (card) {
            card.addControl(tab.getControl(), index, current);
        }
    }, doOnAttachToDocument: function () {
        var className = "";
        if (this._ui) {
            var uis = this._ui.split(",");
            for (var i = 0; i < uis.length; i++) {
                className += (" " + this._className + "-" + uis[i]);
            }
        }
        if (className) {
            $fly(this._tabcolumnDom).addClass(className);
        }
    }, createDom: function () {
        var tabcolumnControl = this, card = tabcolumnControl._cardBook, dom = document.createElement("div"), tabcolumnDom = $invokeSuper.call(this, arguments), tabPlacement = tabcolumnControl._tabPlacement;
        if (tabPlacement == "left") {
            dom.appendChild(tabcolumnDom);
        }
        tabcolumnControl._tabcolumnDom = tabcolumnDom;
        var currentTab = tabcolumnControl._currentTab;
        if (currentTab) {
            card._currentControl = currentTab.getControl();
        }
        card.render(dom);
        if (tabPlacement == "right") {
            dom.appendChild(tabcolumnDom);
        }
        return dom;
    }, refreshDom: function (dom) {
        $invokeSuper.call(this, arguments);
        var tabcolumnControl = this, card = tabcolumnControl._cardBook, tabcolumnDom = tabcolumnControl._tabcolumnDom, cardDom = tabcolumnControl._cardBook._dom;
        tabcolumnControl.refreshTabColumn();
        var tabColumnWidth = tabcolumnControl._tabColumnWidth || 200;
        $fly(tabcolumnDom).css({ "height": "auto", "float": "left" }).css("width", tabcolumnControl._verticalText ? "" : tabColumnWidth);
        $fly(cardDom).css("float", "left");
        if (tabcolumnControl._height != null) {
            card._realHeight = tabcolumnControl.getRealHeight();
            card._realWidth = tabcolumnControl.getRealWidth() - $fly(tabcolumnDom).outerWidth(true);
        }
        var tabs = tabcolumnControl._tabs, currentTab = tabcolumnControl._currentTab, currentTabIndex = tabs.indexOf(currentTab);
        if (currentTabIndex != -1) {
            card._currentControl = card._controls.get(currentTabIndex);
        }
        card.refreshDom(cardDom);
    }, getFocusableSubControls: function () {
        return [this._cardBook];
    }, setFocus: function () {
        var dom = this._tabcolumnDom;
        if (dom) {
            try {
                dom.focus();
            }
            catch (e) {
            }
        }
    }
});
dorado.widget.CaptionBar = $extend(dorado.widget.Control, {
    $className: "dorado.widget.CaptionBar", ATTRIBUTES: {
        className: { defaultValue: "d-caption-bar" }, caption: {}, icon: {}, iconClass: {}, buttons: {
            innerComponent: "SimpleIconButton", setter: function (value) {
                var bar = this, oldValue = bar._buttons;
                if (oldValue) {
                    bar.clearButtons();
                }
                if (!bar._buttons) {
                    bar._buttons = new dorado.util.KeyedArray(function (value) {
                        return value._uniqueId;
                    });
                }
                if (value instanceof Array) {
                    for (var i = 0, j = value.length; i < j; i++) {
                        bar._buttons.insert(value[i]);
                    }
                } else {
                    if (value instanceof dorado.util.KeyedArray) {
                        for (var i = 0, j = value.size; i < j; i++) {
                            bar._buttons.insert(value.get(i));
                        }
                    }
                }
            }
        }, height: { independent: true, readOnly: true }
    }, addButton: function (button, index) {
        var bar = this, buttons = bar._buttons, doms = bar._doms, refBtn, dom = bar._dom;
        if (!bar._buttons) {
            buttons = bar._buttons = new dorado.util.KeyedArray(function (value) {
                return value._uniqueId;
            });
        }
        if (index == null) {
            buttons.insert(button);
        } else {
            if (typeof index == "number") {
                if (index > 100) {
                    var prevPriority = 0, target = index, insertIndex;
                    button._cbPriority = index;
                    for (var i = 0, j = buttons.size; i < j; i++) {
                        var btn = buttons.get(i), priority = btn._cbPriority || 0;
                        if (prevPriority <= target && priority > target) {
                            refBtn = btn;
                            insertIndex = i;
                            break;
                        }
                        prevPriority = priority;
                    }
                    buttons.insert(button, insertIndex);
                } else {
                    refBtn = buttons.get(index);
                    buttons.insert(button, index);
                }
            } else {
                if (typeof index == "string") {
                    refBtn = buttons.get(index);
                    if (!refBtn) {
                        buttons.insert(button);
                    } else {
                        buttons.insert(button, "before", refBtn);
                    }
                }
            }
        }
        bar.registerInnerControl(button);
        if (dom) {
            if (!doms.buttonGroup) {
                bar._createButtonGroup();
            }
            button.render(doms.buttonGroup, refBtn ? refBtn._dom : null);
        }
    }, getButton: function (button) {
        var bar = this, buttons = bar._buttons;
        if (buttons && (typeof button == "number" || typeof button == "string")) {
            return buttons.get(button);
        } else {
            return button;
        }
    }, removeButton: function (button) {
        var bar = this, buttons = bar._buttons;
        if (typeof button == "string" || typeof button == "number") {
            button = buttons.get(button);
        }
        if (button) {
            bar.unregisterInnerControl(button);
            button.destroy();
            buttons.remove(button);
        }
    }, clearButtons: function () {
        var bar = this, buttons = bar._buttons;
        if (buttons) {
            for (var i = 0, j = buttons.size; i < j; i++) {
                var button = buttons.get(i);
                bar.unregisterInnerControl(button);
                button.destroy();
                buttons.removeAt(0);
            }
        }
    }, _createIcon: function (dom) {
        var bar = this, doms = bar._doms;
        dom = dom ? dom : bar._dom;
        var icon = document.createElement("div");
        icon.className = "caption-bar-icon";
        $fly(icon).insertBefore(doms.caption);
        doms.icon = icon;
    }, _createButtonGroup: function (dom) {
        var bar = this, doms = bar._doms;
        dom = dom ? dom : bar._dom;
        var buttonGroup = document.createElement("div");
        buttonGroup.className = "button-group";
        $fly(dom).prepend(buttonGroup);
        doms.buttonGroup = buttonGroup;
    }, createDom: function () {
        var bar = this, buttons = bar._buttons, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", content: [{ tagName: "div", className: "caption", content: bar._caption, contextKey: "caption" }] }, null, doms);
        bar._doms = doms;
        if (buttons) {
            bar._createButtonGroup(dom);
            for (var i = 0, j = buttons.size; i < j; i++) {
                var button = buttons.get(i);
                bar.registerInnerControl(button);
                button.render(doms.buttonGroup);
            }
        }
        var icon = bar._icon, iconCls = bar._iconClass;
        if (icon || iconCls) {
            bar._createIcon(dom);
            $fly(doms.icon).addClass(iconCls);
            $DomUtils.setBackgroundImage(doms.icon, icon);
        }
        return dom;
    }, refreshDom: function () {
        $invokeSuper.call(this, arguments);
        var bar = this, doms = bar._doms;
        $fly(doms.caption).text(bar._caption);
        var icon = bar._icon, iconCls = bar._iconClass;
        if (!icon && !iconCls && doms.icon) {
            $fly(doms.icon).css("display", "none");
        } else {
            if (doms.icon) {
                $fly(doms.icon).prop("className", "caption-bar-icon").css("display", "");
            }
            if ((icon || iconCls) && !doms.icon) {
                bar._createIcon();
            }
            if (icon) {
                $DomUtils.setBackgroundImage(doms.icon, icon);
            }
            if (iconCls) {
                $fly(doms.icon).addClass(iconCls);
            }
        }
    }
});
(function () {
    var icons = { WARNING: "warning-icon", ERROR: "error-icon", INFO: "info-icon", QUESTION: "question-icon", "warning-icon": "warning-icon", "error-icon": "error-icon", "info-icon": "info-icon", "question-icon": "question-icon" };
    dorado.MessageBox = {
        _runStack: [], defaultTitle: "", minWidth: 300, maxWidth: 800, OK: ["ok"], CANCEL: ["cancel"], OKCANCEL: ["ok", "cancel"], YESNO: ["yes", "no"], YESNOCANCEL: ["yes", "no", "cancel"], WARNING_ICON: "warning-icon", ERROR_ICON: "error-icon", INFO_ICON: "info-icon", QUESTION_ICON: "question-icon", SINGLE_EDITOR: null, buttonText: { ok: "dorado.baseWidget.MessageBoxButtonOK", cancel: "dorado.baseWidget.MessageBoxButtonCancel", yes: "dorado.baseWidget.MessageBoxButtonYes", no: "dorado.baseWidget.MessageBoxButtonNo" }, highlightButtons: ["ok", "yes"], declineButtons: [], onButtonClick: function (buttonIndex) {
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
                                case "singleLine":
                                    text = dorado.MessageBox.SINGLE_EDITOR.get("value");
                                    break;
                                case "multiLines":
                                    text = dorado.MessageBox.TEXTAREA.get("value");
                                    break;
                            }
                        }
                    }
                    dorado.MessageBox._callbackConfig = { callback: config.callback, detailCallback: config.detailCallback, buttonId: buttonId, text: text };
                }
                dorado.MessageBox._runStack.splice(0, 1);
            }
            dorado.MessageBox._dialog && dorado.MessageBox._dialog.hide();
        }, executeCallback: function () {
            if (!dorado.MessageBox._callbackConfig) {
                return;
            }
            var config = dorado.MessageBox._callbackConfig, buttonId = config.buttonId, text = config.text;
            if (typeof config.callback == "function" && (buttonId == "yes" || buttonId == "ok")) {
                config.callback.apply(null, [text]);
            }
            if (typeof config.detailCallback == "function") {
                config.detailCallback.apply(null, [buttonId, text]);
            }
            dorado.MessageBox._callbackConfig = null;
        }, getDialog: function () {
            if (!dorado.MessageBox._dialog) {
                dorado.MessageBox.defaultTitle = $resource("dorado.baseWidget.MessageBoxDefaultTitle");
                dorado.MessageBox._dialog = new dorado.widget.Dialog({
                    focusAfterShow: false, anchorTarget: window, align: "center", vAlign: "center", width: dorado.MessageBox.maxWidth, resizeable: false, exClassName: "d-message-box", modal: true, modalType: $setting["widget.MessageBox.defaultModalType"] || "transparent", closeAction: "hide", buttons: [{
                        width: 60, listener: {
                            onClick: function () {
                                dorado.MessageBox.onButtonClick(0);
                            }
                        }
                    }, {
                        width: 60, listener: {
                            onClick: function () {
                                dorado.MessageBox.onButtonClick(1);
                            }
                        }
                    }, {
                        width: 60, listener: {
                            onClick: function () {
                                dorado.MessageBox.onButtonClick(2);
                            }
                        }
                    }]
                });
                dorado.MessageBox._dialog.doOnAttachToDocument = function () {
                    var dialog = this, dom = dialog.getContentContainer(), doms = dialog._doms;
                    dorado.widget.Dialog.prototype.doOnAttachToDocument.apply(dialog, []);
                    if (dom) {
                        dom.appendChild($DomUtils.xCreate({ tagName: "div", className: "msg-content", contextKey: "msgContent", content: [{ tagName: "span", className: "msg-icon", contextKey: "msgIcon" }, { tagName: "span", className: "msg-text", contextKey: "msgText", content: dorado.MessageBox._lastText }] }, null, doms));
                        var editorWrap = $DomUtils.xCreate({ tagName: "div", className: "editor-wrap" });
                        doms.editorWrap = editorWrap;
                        var editor = new dorado.widget.TextEditor();
                        editor.render(editorWrap);
                        $fly(editor._dom).css("display", "none");
                        dorado.MessageBox.SINGLE_EDITOR = editor;
                        dialog.registerInnerControl(editor);
                        dom.appendChild(editorWrap);
                        var textareaWrap = $DomUtils.xCreate({ tagName: "div", className: "textarea-wrap" });
                        doms.textareaWrap = textareaWrap;
                        var textarea = new dorado.widget.TextArea();
                        textarea.render(textareaWrap);
                        $fly(textarea._dom).css("display", "none");
                        dorado.MessageBox.TEXTAREA = textarea;
                        dialog.registerInnerControl(textarea);
                        dom.appendChild(textareaWrap);
                        dorado.MessageBox.updateText(dorado.MessageBox._lastText, dorado.MessageBox._lastIcon, dorado.MessageBox._lastEditor, dorado.MessageBox._lastValue);
                    }
                    dialog.bind("beforeShow", function (self) {
                        var dom = self._dom;
                        $fly(dom).width(dorado.MessageBox.maxWidth);
                        var doms = self._doms, contentWidth = $fly(doms.msgText).outerWidth(true) + $fly(doms.msgContent).outerWidth() - $fly(doms.msgContent).width();
                        if (contentWidth < dorado.MessageBox.minWidth) {
                            contentWidth = dorado.MessageBox.minWidth;
                        } else {
                            if (contentWidth > dorado.MessageBox.maxWidth) {
                                contentWidth = dorado.MessageBox.maxWidth;
                            }
                        }
                        var dialogWidth = $fly(dom).width(), panelWidth = $fly(doms.contentPanel).width();
                        self._width = contentWidth + dialogWidth - panelWidth;
                        $fly(dom).width(self._width);
                        self._height = null;
                        self.doOnResize();
                        var options = dorado.MessageBox._runStack[0];
                        var buttons = options.buttons || [], buttonCount = buttons.length, editor = options.editor || "none", dlgButtons = self._buttons;
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
                                    caption = button;
                                }
                                dlgButton.set("caption", caption);
                                var ui;
                                if (dorado.MessageBox.highlightButtons.indexOf(button) >= 0) {
                                    ui = "highlight";
                                } else {
                                    if (dorado.MessageBox.declineButtons.indexOf(button) >= 0) {
                                        ui = "decline";
                                    } else {
                                        ui = "default";
                                    }
                                }
                                dlgButton.set("ui", ui);
                                dlgButton.refresh();
                                $fly(dlgButton._dom).css("display", "");
                            }
                        }
                    });
                    dialog.bind("afterShow", function (self) {
                        var buttons = self._buttons, button;
                        if (buttons) {
                            button = buttons[0];
                            if (button && button._dom.style.display != "none") {
                                button.setFocus();
                            }
                        }
                    });
                    dialog.bind("beforeHide", function (self, arg) {
                        if (dorado.MessageBox._runStack.length > 0) {
                            arg.processDefault = false;
                            dorado.MessageBox.executeCallback();
                            dorado.MessageBox.doShow(dorado.MessageBox._runStack[0]);
                        }
                    });
                    dialog.bind("afterHide", function () {
                        dorado.MessageBox.executeCallback();
                    });
                    dialog.bind("beforeClose", function (self, arg) {
                        dorado.MessageBox.onButtonClick("close");
                        arg.processDefault = false;
                    });
                };
            }
            return dorado.MessageBox._dialog;
        }, alert: function (msg, options) {
            if (typeof options == "function") {
                var callback = options;
                options = { callback: callback };
            } else {
                options = options || {};
            }
            options.icon = options.icon == null ? dorado.MessageBox.INFO_ICON : options.icon;
            options.message = msg;
            options.buttons = dorado.MessageBox.OK;
            options.closeAction = "ok";
            dorado.MessageBox.show(options);
        }, confirm: function (msg, options) {
            if (typeof options == "function") {
                var callback = options;
                options = { callback: callback };
            } else {
                options = options || {};
            }
            options.icon = options.icon == null ? dorado.MessageBox.QUESTION_ICON : options.icon;
            options.message = msg;
            options.buttons = dorado.MessageBox.YESNO;
            options.closeAction = "no";
            dorado.MessageBox.show(options);
        }, prompt: function (msg, options) {
            if (typeof options == "function") {
                var callback = options;
                options = { callback: callback };
            } else {
                options = options || {};
            }
            options.message = msg;
            options.buttons = dorado.MessageBox.OKCANCEL;
            options.closeAction = "cancel";
            options.editor = "singleLine";
            dorado.MessageBox.show(options);
        }, promptMultiLines: function (msg, options) {
            if (typeof options == "function") {
                var callback = options;
                options = { callback: callback };
            } else {
                options = options || {};
            }
            options.message = msg;
            options.buttons = dorado.MessageBox.OKCANCEL;
            options.closeAction = "cancel";
            options.editor = "multiLines";
            dorado.MessageBox.show(options);
        }, resetEditorWidth: function (editor) {
            var dialog = dorado.MessageBox.getDialog(), doms = dialog._doms, width;
            if (editor == "multiLines" && dorado.MessageBox.TEXTAREA) {
                width = $fly(doms.textareaWrap).outerWidth();
                dorado.MessageBox.TEXTAREA.set("width", width);
            } else {
                if (editor == "singleLine" && dorado.MessageBox.SINGLE_EDITOR) {
                    width = $fly(doms.editorWrap).outerWidth();
                    dorado.MessageBox.SINGLE_EDITOR.set("width", width);
                }
            }
        }, updateText: function (text, icon, editor, value) {
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
                if (icon) {
                    $fly(doms.msgIcon).addClass(icon);
                } else {
                    $fly(doms.msgIcon).css("background-image", "");
                }
                $fly(doms.msgIcon).css("display", "");
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
                    case "singleLine":
                        $fly(doms.editorWrap).css("display", "");
                        $fly(dorado.MessageBox.SINGLE_EDITOR._dom).css("display", "");
                        $fly(dorado.MessageBox.TEXTAREA._dom).css("display", "none");
                        dorado.MessageBox.SINGLE_EDITOR.set("value", value || "");
                        break;
                    case "multiLines":
                        $fly(doms.editorWrap).css("display", "");
                        $fly(dorado.MessageBox.SINGLE_EDITOR._dom).css("display", "none");
                        $fly(dorado.MessageBox.TEXTAREA._dom).css("display", "");
                        dorado.MessageBox.TEXTAREA.set("value", value || "");
                        break;
                }
            }
        }, show: function (options) {
            dorado.MessageBox._runStack.push(options);
            if (dorado.MessageBox._runStack.length > 1) {
                return;
            }
            dorado.MessageBox.doShow(options);
        }, doShow: function (options) {
            options = options || {};
            var dialog = dorado.MessageBox.getDialog(), msg = options.message, defaultText = options.defaultText, title = options.title || dorado.MessageBox.defaultTitle, icon = options.icon, editor = options.editor || "none";
            dorado.MessageBox.updateText(msg, icon, editor, defaultText);
            dialog.set({ caption: title });
            dialog.show();
        }
    };
})();
(function () {
    var directionReverse = { left: "right", right: "left", top: "bottom", bottom: "top" };
    var mouseEnterfunc = function (event) {
        var panel = event.data.panel;
        if (panel._hidePreviewTimer) {
            clearTimeout(panel._hidePreviewTimer);
        }
    };
    var mouseLeavefunc = function (event) {
        var panel = event.data.panel;
        panel._delayHidePreview();
    };
    var documentMouseDown = function (event) {
        $fly(document).unbind("click", documentMouseDown);
        var panel = event.data.panel;
        panel._closePreview();
    };
    dorado.widget.SplitPanel = $extend(dorado.widget.Control, {
        $className: "dorado.widget.SplitPanel", ATTRIBUTES: {
            className: { defaultValue: "d-split-panel" }, direction: {
                defaultValue: "left", setter: function (value) {
                    if (this._collapseable && this._sideControl instanceof dorado.widget.AbstractPanel) {
                        var collapseButton = this._sideControl._collapseButton;
                        if (collapseButton) {
                            collapseButton.set("iconClass", this._collapsed ? ("expand-icon-" + value) : ("collapse-icon-" + value));
                        }
                    }
                    this._direction = value;
                }
            }, maxPosition: {}, minPosition: { defaultValue: 50 }, position: {
                defaultValue: 100, setter: function (value) {
                    this._position = value;
                }
            }, sideControl: { writeBeforeReady: true, writeOnce: true, innerComponent: "" }, mainControl: { writeBeforeReady: true, writeOnce: true, innerComponent: "" }, resizeable: { defaultValue: true }, collapsed: {
                setter: function (value) {
                    this.doSetCollapsed(value);
                }
            }, collapseable: { defaultValue: true }, previewable: { defaultValue: false }
        }, EVENTS: { beforeCollapsedChange: {}, onCollapsedChange: {} }, _openPreview: function () {
            var panel = this, dom = panel._dom, doms = panel._doms, direction = panel._direction, sidePanelCss = {}, animConfig, width = $fly(dom).innerWidth(), height = $fly(dom).innerHeight(), collapseBarWidth = $fly(doms.collapseBar).outerWidth(), collapseBarHeight = $fly(doms.collapseBar).outerHeight();
            if (panel._previewOpened) {
                return;
            }
            panel._previewOpened = true;
            var position = panel.getPixelPosition();
            switch (direction) {
                case "left":
                    animConfig = { left: collapseBarWidth };
                    sidePanelCss.left = position * -1;
                    break;
                case "top":
                    animConfig = { top: collapseBarHeight };
                    sidePanelCss.top = position * -1;
                    break;
                case "right":
                    animConfig = { left: width - position - collapseBarWidth };
                    sidePanelCss.left = width;
                    break;
                case "bottom":
                    animConfig = { top: height - position - collapseBarHeight };
                    sidePanelCss.top = height;
                    break;
            }
            $fly(doms.sidePanel).css(sidePanelCss).bringToFront().animate(animConfig, {
                complete: function () {
                    if (panel._sideControl) {
                        panel._sideControl.setActualVisible(true);
                    }
                }
            });
            $fly(document).bind("click", { panel: panel }, documentMouseDown);
            $fly([doms.sidePanel, doms.collapseBar]).bind("mouseenter", { panel: panel }, mouseEnterfunc).bind("mouseleave", { panel: panel }, mouseLeavefunc);
        }, _closePreview: function () {
            var panel = this, dom = panel._dom, doms = panel._doms, direction = panel._direction, animConfig, width = $fly(dom).innerWidth(), height = $fly(dom).innerHeight(), collapseBarWidth = $fly(doms.collapseBar).outerWidth(), collapseBarHeight = $fly(doms.collapseBar).outerHeight();
            if (!panel._previewOpened) {
                return;
            }
            panel._previewOpened = false;
            var position = panel.getPixelPosition();
            switch (direction) {
                case "left":
                    animConfig = { left: position * -1 + collapseBarWidth };
                    break;
                case "top":
                    animConfig = { top: position * -1 + collapseBarHeight };
                    break;
                case "right":
                    animConfig = { left: width - collapseBarWidth };
                    break;
                case "bottom":
                    animConfig = { top: height - collapseBarHeight };
                    break;
            }
            $fly(doms.sidePanel).animate(animConfig, {
                complete: function () {
                    $fly(doms.sidePanel).css("z-index", "");
                    panel._sideControl.setActualVisible(false);
                }
            });
            $fly([doms.sidePanel, doms.collapseBar]).unbind("mouseenter", mouseEnterfunc).unbind("mouseleave", mouseLeavefunc);
        }, _togglePreview: function () {
            var panel = this;
            if (panel._previewOpened) {
                panel._closePreview();
            } else {
                panel._openPreview();
            }
        }, _delayHidePreview: function () {
            var panel = this;
            if (panel._hidePreviewTimer) {
                clearTimeout(panel._hidePreviewTimer);
            }
            panel._hidePreviewTimer = setTimeout(function () {
                panel._hidePreviewTimer = null;
                panel._closePreview();
                $fly(document).unbind("click", documentMouseDown);
            }, 500);
        }, _createCollapseBar: function () {
            var panel = this, doms = panel._doms, bar = $DomUtils.xCreate({ tagName: "div", className: "collapse-bar", contextKey: "collapseBar", content: { tagName: "div", className: "button", contextKey: "collapseBarButton" } }, null, doms);
            jQuery(doms.collapseBar).addClass("collapse-bar-" + panel._direction).addClassOnHover("collapse-bar-hover").click(function (event) {
                panel._togglePreview();
                event.stopImmediatePropagation();
            });
            jQuery(doms.collapseBarButton).click(function (event) {
                panel.doSetCollapsed(false);
                event.stopImmediatePropagation();
            }).addClassOnHover("button-hover");
            $fly(panel._dom).append(doms.collapseBar);
            return bar;
        }, createDom: function () {
            var panel = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", content: [{ tagName: "div", className: "side-panel", contextKey: "sidePanel" }, { tagName: "div", className: "splitter", content: { tagName: "div", className: "button", contextKey: "button" }, contextKey: "splitter" }, { tagName: "div", className: "main-panel", contextKey: "mainPanel" }] }, null, doms), direction = panel._direction, axis = (direction == "left" || direction == "right") ? "x" : "y";
            panel._doms = doms;
            $DomUtils.disableUserSelection(doms.splitter);
            var splitterPosition, containment;
            $fly(doms.splitter).addClass("splitter-" + panel._direction).draggable({
                addClasses: false, axis: axis, helper: "clone", iframeFix: true, start: function (event, ui) {
                    var helper = ui.helper;
                    if (helper) {
                        helper.addClass("d-splitter-dragging").bringToFront().find("> .button").css("display", "none");
                    }
                    splitterPosition = $fly(doms.splitter).position();
                    var vertical = direction == "top" || direction == "bottom";
                    if (panel._maxPosition != null || panel._minPosition != null) {
                        var width = $fly(dom).width(), height = $fly(dom).height(), min = panel._minPosition || 50, max, sideMin, sideMax, range;
                        if (vertical) {
                            max = panel._maxPosition || height - 50;
                        } else {
                            max = panel._maxPosition || width - 50;
                        }
                        if (panel._direction == "left") {
                            sideMin = min;
                            sideMax = max;
                        } else {
                            if (panel._direction == "right") {
                                sideMin = width - max;
                                sideMax = width - min;
                            } else {
                                if (panel._direction == "top") {
                                    sideMin = min;
                                    sideMax = max;
                                } else {
                                    if (panel._direction == "bottom") {
                                        sideMin = height - max;
                                        sideMax = height - min;
                                    }
                                }
                            }
                        }
                        if (vertical) {
                            containment = [0, sideMin, 0, sideMax];
                        } else {
                            containment = [sideMin, 0, sideMax, 0];
                        }
                    }
                }, drag: function (event, ui) {
                    var inst = jQuery.data(this, "ui-draggable"), horiChange = event.pageX - inst.originalPageX, vertChange = event.pageY - inst.originalPageY;
                    ui.position = { left: splitterPosition.left, top: splitterPosition.top };
                    var left, top;
                    if (panel._direction == "left" || panel._direction == "right") {
                        left = splitterPosition.left + horiChange;
                        if (left < containment[0]) {
                            left = containment[0];
                        } else {
                            if (left > containment[2]) {
                                left = containment[2];
                            }
                        }
                        ui.position.left = left;
                    } else {
                        top = splitterPosition.top + vertChange;
                        if (top < containment[1]) {
                            top = containment[1];
                        } else {
                            if (top > containment[3]) {
                                top = containment[3];
                            }
                        }
                        ui.position.top = top;
                    }
                    ui.helper.css(ui.position);
                }, stop: function (event, ui) {
                    var position = ui.position;
                    switch (panel._direction) {
                        case "left":
                            panel.set("position", position.left);
                            break;
                        case "right":
                            panel.set("position", $fly(dom).width() - position.left - $fly(doms.splitter).outerWidth(true));
                            break;
                        case "top":
                            panel.set("position", position.top);
                            break;
                        case "bottom":
                            panel.set("position", $fly(dom).height() - position.top - $fly(doms.splitter).outerHeight(true));
                            break;
                    }
                }
            });
            $fly(doms.button).click(function () {
                panel.doSetCollapsed(!panel._collapsed);
            });
            $fly(doms.sidePanel).click(function (event) {
                event.stopImmediatePropagation();
            });
            return dom;
        }, initObjectShimForIE: function () {
            if (!dorado.Browser.msie || !dorado.useObjectShim || this._objectShimInited) {
                return;
            }
            var iframe = $DomUtils.xCreate({ tagName: "iframe", style: { position: "absolute", visibility: "inherit", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, filter: "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)" }, src: "about:blank" });
            this._doms.splitter.appendChild(iframe);
            this._objectShimInited = true;
        }, doSetCollapsed: function (collapsed, callback, slience) {
            var panel = this, dom = panel._dom, doms = panel._doms, eventArg = {};
            panel.fireEvent("beforeCollapsedChange", panel, eventArg);
            if (eventArg.processDefault === false) {
                return;
            }
            if (dom) {
                var width = $fly(dom).width(), height = $fly(dom).height(), direction = panel._direction, left;
                var onCollapsedChange = function () {
                    if (panel._sideControl) {
                        panel._sideControl.setActualVisible(!collapsed);
                    }
                    panel._collapsed = collapsed;
                    panel.refresh();
                    panel.fireEvent("onCollapsedChange", panel);
                    $fly(doms.sidePanel).css("z-index", "");
                    if (typeof callback == "function") {
                        callback.apply(null, []);
                    }
                };
                var animConfig, position = panel.getPixelPosition();
                if (collapsed) {
                    switch (direction) {
                        case "left":
                            animConfig = { left: position * -1 };
                            break;
                        case "top":
                            animConfig = { top: position * -1 };
                            break;
                        case "right":
                            animConfig = { left: width };
                            break;
                        case "bottom":
                            animConfig = { top: height };
                            break;
                    }
                    $fly(doms.sidePanel).animate(animConfig, {
                        complete: function () {
                            onCollapsedChange();
                        }
                    });
                } else {
                    if (panel._previewOpened) {
                        $fly([doms.sidePanel, doms.collapseBar]).unbind("mouseenter", mouseEnterfunc).unbind("mouseleave", mouseLeavefunc);
                        $fly(document).unbind("click", documentMouseDown);
                        panel._previewOpened = false;
                        onCollapsedChange();
                    } else {
                        var sidePanelCss = {};
                        switch (direction) {
                            case "left":
                                animConfig = { left: 0 };
                                sidePanelCss.left = position * -1;
                                break;
                            case "top":
                                animConfig = { top: 0 };
                                sidePanelCss.top = position * -1;
                                break;
                            case "right":
                                animConfig = { left: width - position };
                                sidePanelCss.left = width;
                                break;
                            case "bottom":
                                animConfig = { top: height - position };
                                sidePanelCss.top = height;
                                break;
                        }
                        $fly(doms.sidePanel).css(sidePanelCss).bringToFront().animate(animConfig, {
                            complete: function () {
                                onCollapsedChange();
                            }
                        });
                    }
                }
            } else {
                panel._collapsed = collapsed;
                panel.fireEvent("onCollapsedChange", panel);
            }
            if (slience !== true) {
                if (panel._sideControl instanceof dorado.widget.AbstractPanel) {
                    panel._sideControl._splitPanelCascade = true;
                    panel._sideControl.set("collapsed", collapsed);
                    panel._sideControl._splitPanelCascade = false;
                }
            }
        }, getPixelPosition: function () {
            var panel = this, position = panel._position, dir = panel._direction;
            if (typeof position == "string") {
                if (position.indexOf("%") == -1) {
                    position = parseInt(position, 10);
                } else {
                    position = (dir == "left" || dir == "right" ? panel.getRealWidth() : panel.getRealHeight()) * parseInt(position.replace("%", ""), 10) / 100;
                }
            }
            return position;
        }, doOnAttachToDocument: function () {
            var panel = this, sideControl = panel._sideControl, mainControl = panel._mainControl, doms = panel._doms;
            if (sideControl) {
                sideControl.render(doms.sidePanel);
                sideControl.setActualVisible(!panel._collapsed);
            }
            if (mainControl) {
                mainControl.render(doms.mainPanel);
            }
            panel.initObjectShimForIE();
        }, refreshDom: function (dom) {
            $invokeSuper.call(this, arguments);
            var panel = this, doms = panel._doms, width = $fly(dom).width(), height = $fly(dom).height(), splitterWidth = $fly(doms.splitter).width(), splitterHeight = $fly(doms.splitter).height(), direction = panel._direction, previewable = panel._previewable && panel._collapseable, vertical = direction == "top" || direction == "bottom";
            if (panel._collapseable) {
                if (panel._collapsed) {
                    $fly(dom).addClass(panel._className + "-collapsed");
                    $fly(doms.splitter).draggable("disable");
                } else {
                    $fly(dom).removeClass(panel._className + "-collapsed");
                    $fly(doms.splitter).draggable("enable");
                }
            }
            if (panel._collapseable) {
                $fly(doms.button).css("display", "");
            } else {
                $fly(doms.button).css("display", "none");
            }
            $fly(doms.splitter).removeClass("splitter-h-resizeable splitter-v-resizeable");
            if (panel._resizeable) {
                $fly(doms.splitter).addClass(vertical ? "splitter-v-resizeable" : "splitter-h-resizeable");
            }
            var sidePanelStyle, splitterStyle, mainPanelStyle, mainControlStyle, sideControlStyle, collapseBarStyle, collapseBarWidth = 0, collapseBarHeight = 0;
            var position = panel.getPixelPosition();
            if (panel._collapseable && panel._collapsed) {
                if (previewable) {
                    if (!doms.collapseBar) {
                        panel._createCollapseBar();
                    }
                    $fly(doms.collapseBar).css({ display: "", width: "", height: "" }).removeClass("collapse-bar-left collapse-bar-right collapse-bar-top collapse-bar-bottom").addClass("collapse-bar-" + direction);
                    if (direction == "top" || direction == "bottom") {
                        $fly(doms.collapseBar).outerWidth(width);
                    } else {
                        if (direction == "left" || direction == "right") {
                            $fly(doms.collapseBar).outerHeight(height);
                        }
                    }
                    collapseBarWidth = $fly(doms.collapseBar).outerWidth();
                    collapseBarHeight = $fly(doms.collapseBar).outerHeight();
                    switch (direction) {
                        case "left":
                            collapseBarStyle = { left: 0, top: 0 };
                            break;
                        case "right":
                            collapseBarStyle = { left: width - collapseBarWidth, top: 0 };
                            break;
                        case "top":
                            collapseBarStyle = { left: 0, top: 0 };
                            break;
                        case "bottom":
                            collapseBarStyle = { top: height - collapseBarHeight, left: 0 };
                            break;
                    }
                    $fly(doms.collapseBar).css(collapseBarStyle);
                }
                $fly(doms.splitter).removeClass("splitter-left splitter-right splitter-top splitter-bottom").addClass("splitter-" + directionReverse[direction]);
                splitterWidth = $fly(doms.splitter).width();
                splitterHeight = $fly(doms.splitter).height();
                switch (panel._direction) {
                    case "left":
                        splitterStyle = { left: collapseBarWidth, top: 0 };
                        break;
                    case "right":
                        splitterStyle = { left: width - splitterWidth - collapseBarWidth, top: 0 };
                        break;
                    case "top":
                        splitterStyle = { top: collapseBarHeight, left: 0 };
                        break;
                    case "bottom":
                        splitterStyle = { top: height - splitterHeight - collapseBarHeight, left: 0 };
                        break;
                }
                $fly(doms.splitter).css(splitterStyle);
                switch (direction) {
                    case "left":
                        sidePanelStyle = { left: position * -1, top: 0, height: height };
                        mainPanelStyle = { left: splitterWidth + collapseBarWidth, top: 0, width: width - splitterWidth - collapseBarWidth, height: height };
                        mainControlStyle = { width: width - splitterWidth - collapseBarWidth, height: height };
                        sideControlStyle = { width: position, height: height };
                        break;
                    case "right":
                        sidePanelStyle = { left: width, top: 0, height: height };
                        mainPanelStyle = { left: 0, top: 0, width: width - splitterWidth - collapseBarWidth, height: height };
                        mainControlStyle = { width: width - splitterWidth - collapseBarWidth, height: height };
                        sideControlStyle = { width: position, height: height };
                        break;
                    case "top":
                        sidePanelStyle = { top: position * -1, left: 0, width: width };
                        mainPanelStyle = { top: splitterHeight + collapseBarHeight, left: 0, width: width, height: height - splitterHeight - collapseBarHeight };
                        mainControlStyle = { width: width, height: height - splitterHeight - collapseBarHeight };
                        sideControlStyle = { width: width, height: position };
                        break;
                    case "bottom":
                        sidePanelStyle = { top: height, left: 0, width: width };
                        mainPanelStyle = { top: 0, left: 0, width: width, height: height - splitterHeight - collapseBarHeight };
                        mainControlStyle = { width: width, height: height - splitterHeight - collapseBarHeight };
                        sideControlStyle = { width: width, height: position };
                        break;
                }
                $fly(doms.sidePanel).css(sidePanelStyle);
                $fly(doms.mainPanel).css(mainPanelStyle);
                if (panel._sideControl) {
                    panel._sideControl.set(sideControlStyle);
                }
                if (panel._mainControl) {
                    panel._mainControl.set(mainControlStyle);
                }
            } else {
                if (previewable) {
                    $fly(doms.collapseBar).css("display", "none");
                }
                $fly(doms.splitter).removeClass("splitter-left splitter-right splitter-top splitter-bottom").addClass("splitter-" + direction);
                splitterWidth = $fly(doms.splitter).width();
                splitterHeight = $fly(doms.splitter).height();
                switch (panel._direction) {
                    case "left":
                        splitterStyle = { left: position, top: 0 };
                        break;
                    case "right":
                        splitterStyle = { left: width - position - splitterWidth, top: 0 };
                        break;
                    case "top":
                        splitterStyle = { top: position, left: 0 };
                        break;
                    case "bottom":
                        splitterStyle = { top: height - position - splitterHeight, left: 0 };
                        break;
                }
                $fly(doms.splitter).css(splitterStyle);
                switch (panel._direction) {
                    case "left":
                        sidePanelStyle = { left: 0, top: 0, width: position, height: height };
                        sideControlStyle = { width: position, height: height };
                        mainPanelStyle = { left: position + splitterWidth, top: 0, width: width - position - splitterWidth, height: height };
                        mainControlStyle = { width: width - position - splitterWidth, height: height };
                        break;
                    case "right":
                        sidePanelStyle = { left: width - position, top: 0, width: position, height: height };
                        sideControlStyle = { width: position, height: height };
                        mainPanelStyle = { left: 0, top: 0, width: width - position - splitterWidth, height: height };
                        mainControlStyle = { width: width - position - splitterWidth, height: height };
                        break;
                    case "top":
                        sidePanelStyle = { top: 0, left: 0, width: width, height: position };
                        sideControlStyle = { width: width, height: position };
                        mainPanelStyle = { top: position + splitterHeight, left: 0, width: width, height: height - position - splitterHeight };
                        mainControlStyle = { width: width, height: height - position - splitterHeight };
                        break;
                    case "bottom":
                        sidePanelStyle = { top: height - position, left: 0, width: width, height: position };
                        sideControlStyle = { width: width, height: position };
                        mainPanelStyle = { top: 0, left: 0, width: width, height: height - position - splitterHeight };
                        mainControlStyle = { width: width, height: height - position - splitterHeight };
                        break;
                }
                if (panel._sideControl) {
                    panel._sideControl.set(sideControlStyle);
                    panel._sideControl.refresh();
                }
                if (panel._mainControl) {
                    panel._mainControl.set(mainControlStyle);
                    panel._mainControl.refresh();
                }
                $fly(doms.sidePanel).css(sidePanelStyle);
                $fly(doms.mainPanel).css(mainPanelStyle);
            }
            $fly(doms.splitter).draggable(panel._resizeable ? "enable" : "disable");
        }, getFocusableSubControls: function () {
            var direction = this._direction;
            if (direction == "left" || direction == "top") {
                return [this._sideControl, this._mainControl];
            } else {
                return [this._mainControl, this._sideControl];
            }
        }
    });
})();
(function () {
    var CONST_MOUSE_POS_ADJ_X = 5, CONST_MOUSE_POS_ADJ_Y = 15, TOOLTIP_KEY = "dorado.tooltip", DOMS_KEY = "dorado.tip.doms";
    var elementMouseEnter = function (event) {
        var element = this, tip = dorado.TipManager.getTip(element);
        if ((tip._text || tip._content) && !tip._visible) {
            dorado.TipManager.showTip(element, tip._showDelay || 0, event);
        }
        event.stopImmediatePropagation();
    };
    var elementMouseMove = function (event) {
        var element = this, tip = dorado.TipManager.getTip(element);
        if (tip) {
            if (tip._showTimer) {
                tip._latestEvent = event;
                event.stopImmediatePropagation();
            }
            if (tip._trackMouse && tip._dom && ($fly(tip._dom).css("display") != "none")) {
                tip._updatePosition(event);
            }
        }
    };
    var elementMouseLeave = function () {
        var element = this, tip = dorado.TipManager.getTip(element);
        if (tip) {
            if (tip._showTimer) {
                clearTimeout(tip._showTimer);
                tip._showTimer = null;
            }
            if (tip._autoHide) {
                dorado.TipManager.hideTip(tip, tip._hideDelay || 0);
            }
        }
    };
    var tipCanUsePool = [];
    dorado.widget.ToolTip = $extend(dorado.widget.Tip, {
        $className: "dorado.widget.ToolTip", ATTRIBUTES: {
            mouseOffset: { defaultValue: [CONST_MOUSE_POS_ADJ_X, CONST_MOUSE_POS_ADJ_Y] }, anchorToTarget: {
                defaultValue: false, skipRefresh: true, setter: function (value) {
                    this._anchorToTarget = value;
                    if (this._ready) {
                        if (value === false) {
                            this.unbindTarget();
                        } else {
                            this.bindTarget();
                        }
                    }
                }
            }, anchorTarget: {
                skipRefresh: true, setter: function (value) {
                    var oldValue = this._anchorTarget;
                    if (oldValue && this._anchorTargetBinded) {
                        this.unbindTarget();
                    }
                    this._anchorTarget = value;
                    if (this._ready && value) {
                        this.bindTarget();
                    }
                }
            }, showDelay: { skipRefresh: true, defaultValue: 500 }, hideDelay: { skipRefresh: true, defaultValue: 300 }, autoHide: { defaultValue: true }, trackMouse: {}
        }, getShowPosition: function (options) {
            var tip = this, dom = tip.getDom(), event = tip._latestEvent || options.event;
            if (tip._anchorToTarget === true) {
                return $invokeSuper.call(this, arguments);
            } else {
                if (tip._anchorToTarget !== true && event) {
                    var mouseOffset = tip._mouseOffset || [CONST_MOUSE_POS_ADJ_X, CONST_MOUSE_POS_ADJ_Y];
                    $DomUtils.locateIn(dom, { position: { left: event.pageX + mouseOffset[0], top: event.pageY + mouseOffset[1] } });
                    tip._latestEvent = null;
                }
            }
            return { left: $fly(dom).left(), top: $fly(dom).top() };
        }, doClose: function (closeEl) {
            var target = jQuery.data(closeEl.parentNode, TOOLTIP_KEY);
            target.hide();
        }, getDom: function () {
            var dom = this._dom;
            if (!dom) {
                dom = tipCanUsePool.pop();
                if (dom) {
                    this._doms = jQuery.data(dom, DOMS_KEY);
                    this._dom = dom;
                    if (this._visible) {
                        $fly(dom).css({ display: "", visibility: "hidden", left: -99999, top: -99999 });
                    } else {
                        $fly(dom).css({ display: "none" });
                    }
                    jQuery.data(dom, TOOLTIP_KEY, this);
                    return dom;
                } else {
                    dom = $invokeSuper.call(this, arguments);
                    document.body.appendChild(dom);
                    jQuery.data(dom, TOOLTIP_KEY, this);
                    return dom;
                }
            } else {
                return dom;
            }
        }, _updatePosition: function (event) {
            var tip = this;
            if (event) {
                var mouseOffset = tip._mouseOffset || [CONST_MOUSE_POS_ADJ_X, CONST_MOUSE_POS_ADJ_Y];
                $DomUtils.locateIn(tip._dom, { position: { left: event.pageX + mouseOffset[0], top: event.pageY + mouseOffset[1] } });
            }
        }, bindTarget: function () {
            var element = this._anchorTarget;
            if (element && !this._anchorTargetBinded) {
                $fly(element).hover(elementMouseEnter, elementMouseLeave).mousemove(elementMouseMove);
                this._anchorTargetBinded = true;
            }
        }, unbindTarget: function () {
            var element = this._anchorTarget;
            if (element && this._anchorTargetBinded) {
                $fly(element).unbind("mousemove", elementMouseMove).unbind("mouseenter", elementMouseEnter).unbind("mouseleave", elementMouseLeave);
                this._anchorTargetBinded = false;
            }
        }, hide: function () {
            var tip = this;
            if (tip._showTimer) {
                clearTimeout(tip._showTimer);
                tip._showTimer = null;
                tip._visible = false;
                return;
            }
            $invokeSuper.call(this, arguments);
        }, show: function () {
            var tip = this;
            if (tip._hideTimer) {
                clearTimeout(tip._hideTimer);
                tip._hideTimer = null;
                tip._visible = true;
                return;
            }
            $invokeSuper.call(this, arguments);
        }, doAfterHide: function () {
            var tip = this;
            $invokeSuper.call(tip, arguments);
            tipCanUsePool.push(tip._dom);
            jQuery.data(tip._dom, DOMS_KEY, tip._doms);
            jQuery.data(tip._dom, TOOLTIP_KEY, null);
            tip._rendered = false;
            tip._dom = null;
            tip._doms = null;
        }
    });
    dorado.TipManager = {
        _previousTip: null, hasTip: function (element) {
            return !!dorado.TipManager.getTip(element);
        }, getTip: function (element) {
            var result;
            if (element) {
                result = jQuery.data(element, TOOLTIP_KEY);
            }
            return result;
        }, allocTip: function (element, options) {
            var result;
            options = options || {};
            options.anchorTarget = element;
            result = new dorado.widget.ToolTip(options);
            result.bindTarget();
            jQuery.data(element, TOOLTIP_KEY, result);
        }, initTip: function (element, options) {
            var manager = this;
            if (element) {
                if (dorado.Object.isInstanceOf(element, dorado.RenderableElement)) {
                    element = element._dom;
                    if (!element) {
                        return;
                    }
                }
                if (!options) {
                    manager.deleteTip(element);
                } else {
                    if (manager.hasTip(element)) {
                        manager.updateTip(element, options);
                    } else {
                        manager.allocTip(element, options);
                    }
                }
            }
        }, updateTip: function (element, options) {
            if (dorado.Object.isInstanceOf(element, dorado.RenderableElement)) {
                element = element._dom;
                if (!element) {
                    return;
                }
            }
            var tip = dorado.TipManager.getTip(element);
            tip.set(options, options);
        }, deleteTip: function (element) {
            if (dorado.Object.isInstanceOf(element, dorado.RenderableElement)) {
                element = element._dom;
                if (!element) {
                    return;
                }
            }
            var tip = dorado.TipManager.getTip(element);
            if (tip) {
                dorado.TipManager.hideTip(tip, false);
                tip.unbindTarget();
                jQuery.data(element, TOOLTIP_KEY, null);
            }
        }, showTip: function (element, delay, event) {
            var manager = this, tip = dorado.TipManager.getTip(element);
            if (tip._autoHide === false && !tip._visible) {
                if (delay) {
                    tip._showTimer = setTimeout(function () {
                        tip.show({ element: element, event: event });
                        tip._showTimer = null;
                    }, delay);
                } else {
                    tip.show({ element: element, event: event });
                }
            } else {
                var oldPrevTip = manager._previousTip;
                if (oldPrevTip && oldPrevTip != tip) {
                    oldPrevTip.hide();
                }
                if (delay) {
                    tip._showTimer = setTimeout(function () {
                        tip.show({ element: element, event: event });
                        tip._showTimer = null;
                    }, delay);
                } else {
                    tip.show({ element: element, event: event });
                }
                manager._previousTip = tip;
            }
            return tip;
        }, hideTip: function (tip, delay) {
            var manager = this;
            if (tip) {
                if (manager._previousTip == tip) {
                    manager._previousTip = null;
                }
                if (delay) {
                    tip._hideTimer = setTimeout(function () {
                        tip.hide();
                        tip._hideTimer = null;
                    }, delay);
                } else {
                    tip.hide();
                }
            }
        }
    };
})();
dorado.widget.Section = $extend(dorado.widget.Control, {
    $className: "dorado.widget.Section", ATTRIBUTES: {
        className: { defaultValue: "d-section" }, name: {}, caption: { skipRefresh: true, path: "_captionBar.caption" }, icon: { skipRefresh: true, path: "_captionBar.icon" }, iconClass: { skipRefresh: true, path: "_captionBar.iconClass" }, disabled: {
            setter: function (value) {
                this._disabled = value;
                if (this._parent) {
                    if (this._parent._currentSection == this) {
                        this._parent.changeToAvialableSection();
                        this._parent.refresh();
                    }
                }
            }
        }, visible: {
            setter: function (value) {
                this._visible = value;
                if (this._rendered) {
                    $fly(this._dom).css("display", value ? "" : "none");
                }
                if (this._parent) {
                    if (this._parent._currentSection == this) {
                        this._parent.changeToAvialableSection();
                    }
                    this._parent.refresh();
                }
            }
        }, expandable: {
            defaultValue: true, setter: function (value) {
                this._expandable = value;
                if (this._parent) {
                    if (this._parent._currentSection == this) {
                        this._parent.changeToAvialableSection();
                        this._parent.refresh();
                    }
                }
            }
        }, control: {
            componentReference: true, innerComponent: "", setter: function (value) {
                if (value instanceof dorado.widget.Menu) {
                    value.set("floating", false);
                }
                this._control = value;
            }
        }, hideMode: { skipRefresh: true, writeBeforeReady: true, readOnly: true, defaultValue: "display" }, userData: {}
    }, EVENTS: { onCaptionClick: {} }, createDom: function () {
        var section = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", content: [{ tagName: "div", className: "container", contextKey: "container" }] }, null, doms);
        section._doms = doms;
        jQuery(dom).addClassOnHover("hover-section");
        var captionBar = section._captionBar = new dorado.widget.CaptionBar({ caption: section._caption, className: "d-section-caption-bar", icon: section._icon, iconClass: section._iconClass });
        captionBar.render(dom, doms.container);
        section.registerInnerControl(captionBar);
        doms.captionBar = captionBar._dom;
        return dom;
    }, refreshDom: function (dom) {
        $invokeSuper.call(this, arguments);
        $fly(dom).toggleClass(this._className + "-disabled", !!(this._disabled));
    }, doRenderControl: function () {
        var section = this, doms = section._doms, control = section._control;
        if (control) {
            control.set("visible", true);
            control.render(doms.container);
        }
    }
});
dorado.widget.Accordion = $extend(dorado.widget.Control, {
    $className: "dorado.widget.Accordion", focusable: true, ATTRIBUTES: {
        className: { defaultValue: "d-accordion" }, animate: { defaultValue: dorado.Browser.msie ? false : true }, sections: {
            innerComponent: "Section", setter: function (value) {
                var accordion = this, oldValue = accordion._sections;
                if (oldValue) {
                    accordion.clearSections();
                }
                if (typeof value == "object" && value.constructor == Array.prototype.constructor) {
                    for (var i = 0, j = value.length; i < j; i++) {
                        accordion.addSection(value[i]);
                    }
                }
            }
        }, height: { defaultValue: 400 }, currentSection: {
            setter: function (value) {
                if (typeof value == "number" || typeof value == "string") {
                    value = this._sections ? this._sections.get(value) : null;
                }
                this.doSetCurrentSection(value);
            }
        }, currentIndex: {
            skipRefresh: true, getter: function () {
                if (this._currentSection) {
                    return this._sections.indexOf(this._currentSection);
                }
                return -1;
            }, setter: function (index) {
                this.set("currentSection", this._sections.get(index));
            }
        }
    }, EVENTS: { beforeCurrentSectionChange: {}, onCurrentSectionChange: {} }, doGet: function (attr) {
        var c = attr.charAt(0);
        if (c == "#" || c == "&") {
            var name = attr.substring(1);
            return this.getSection(name);
        } else {
            return $invokeSuper.call(this, [attr]);
        }
    }, getSection: function (name) {
        if (this._sections) {
            return this._sections.get(name);
        }
        return null;
    }, doSetCurrentSection: function (section, animate) {
        var accordion = this, lastCurrent = accordion._currentSection, newCurrent = section;
        if (lastCurrent == newCurrent) {
            return;
        }
        if (!accordion._rendered) {
            accordion._currentSection = newCurrent;
            return;
        }
        var eventArg = { newSection: section, oldSection: lastCurrent };
        accordion.fireEvent("beforeCurrentSectionChange", accordion, eventArg);
        if (eventArg.processDefault === false) {
            return;
        }
        if (animate) {
            var lastCurrentCt = lastCurrent._doms.container, oldHeight = $fly(lastCurrentCt).height();
            $fly(lastCurrentCt).dockable("bottom", true);
            accordion._sliding = true;
            $fly(newCurrent._doms.container).safeSlideIn({
                direction: "t2b", complete: function () {
                    $fly(lastCurrentCt).height(oldHeight).css("display", "").undockable(true);
                    accordion._currentSection = newCurrent;
                    accordion.refresh();
                    accordion.fireEvent("onCurrentSectionChange", accordion, eventArg);
                    accordion._sliding = false;
                }, step: function (now) {
                    $fly(lastCurrentCt).height(oldHeight - now.height);
                }
            });
        } else {
            accordion._currentSection = newCurrent;
            accordion.refresh();
            accordion.fireEvent("onCurrentSectionChange", accordion, eventArg);
        }
    }, changeToAvialableSection: function () {
        var accordion = this, sections = accordion._sections;
        if (sections) {
            var startIndex = -1, currentSection = accordion._currentSection, i, j, section;
            if (currentSection) {
                startIndex = sections.indexOf(currentSection);
            }
            for (i = startIndex + 1, j = sections.size; i < j; i++) {
                section = sections.get(i);
                if (section && section._visible && section._expandable && !section._disabled) {
                    accordion.doSetCurrentSection(section);
                    return section;
                }
            }
            for (i = startIndex - 1; i >= 0; i--) {
                section = sections.get(i);
                if (section && section._visible && section._expandable && !section._disabled) {
                    accordion.doSetCurrentSection(section);
                    return section;
                }
            }
        }
        return null;
    }, getVisibleSectionCount: function () {
        var accordion = this, sections = accordion._sections, result = 0;
        if (sections) {
            var section;
            for (var i = 0, j = sections.size; i < j; i++) {
                section = sections.get(i);
                if (section && section._visible) {
                    result++;
                }
            }
        }
        return result;
    }, addSection: function (section, index) {
        var accordion = this, sections = accordion._sections, refDom;
        if (!sections) {
            accordion._sections = sections = new dorado.util.KeyedArray(function (value) {
                return value._name;
            });
        }
        if (typeof section == "object" && section.constructor == Object.prototype.constructor) {
            section = new dorado.widget.Section(section);
        }
        if (typeof index == "number") {
            refDom = sections.get(index)._dom;
            sections.insert(section, index);
        } else {
            sections.insert(section);
        }
        accordion.registerInnerControl(section);
        if (accordion._rendered) {
            section.render(accordion._dom, refDom);
            accordion.bindAction(section);
            accordion.refresh();
        }
    }, removeSection: function (section) {
        var accordion = this, sections = accordion._sections;
        if (sections) {
            if (typeof section == "number") {
                section = sections.get(section);
            }
            if (section instanceof dorado.widget.Section) {
                accordion.unregisterInnerControl(section);
                if (accordion._rendered) {
                    section.destroy();
                    if (section == accordion._currentSection) {
                        accordion.changeToAvialableSection();
                    }
                    sections.remove(section);
                    accordion.refresh();
                } else {
                    sections.remove(section);
                }
            }
        }
    }, clearSections: function () {
        var accordion = this, sections = accordion._sections, section;
        if (sections) {
            for (var i = 0, j = sections.size; i < j; i++) {
                section = sections.get(i);
                accordion.unregisterInnerControl(section);
                section.destroy();
            }
            accordion._currentSection = null;
            accordion._sections.clear();
        }
    }, bindAction: function (section) {
        var accordion = this;
        section._captionBar.bind("onClick", function () {
            if (accordion._sliding || section._disabled) {
                return;
            }
            section.fireEvent("onCaptionClick", section);
            if (section._expandable) {
                accordion.doSetCurrentSection(section, !!accordion._animate);
            }
        });
    }, refreshDom: function (dom) {
        $invokeSuper.call(this, arguments);
        var accordion = this, sections = accordion._sections, currentSection = accordion._currentSection;
        if (sections && !currentSection) {
            currentSection = accordion.changeToAvialableSection();
        }
        var sectionMinHeight, ctHeight, accordionHeight = $fly(dom).height(), visibleCount = accordion.getVisibleSectionCount();
        if (sections) {
            var section, control, sectionCt;
            for (var i = 0, j = sections.size; i < j; i++) {
                section = sections.get(i);
                if (!section._rendered) {
                    section.render(dom);
                    accordion.bindAction(section);
                }
                sectionCt = section._doms.container;
                if (currentSection != section) {
                    $fly(section._dom).removeClass("current-section");
                    if (section._control && section._control._rendered) {
                        section._control.setActualVisible(false);
                    }
                }
                if (typeof sectionMinHeight != "number") {
                    sectionMinHeight = $fly(section._dom).outerHeight(true) - sectionCt.offsetHeight;
                    ctHeight = accordionHeight - sectionMinHeight * visibleCount;
                }
                $fly(sectionCt).outerHeight(ctHeight, true);
                control = section._control;
                if (control) {
                    control.set({ width: $fly(dom).width(), height: ctHeight });
                }
            }
        }
        if (currentSection) {
            $fly(currentSection._dom).addClass("current-section");
            if (currentSection._control) {
                if (!currentSection._control._rendered) {
                    currentSection.doRenderControl();
                } else {
                    currentSection._control.setActualVisible(true);
                }
            }
        }
    }, getFocusableSubControls: function () {
        return [this._currentSection ? this._currentSection._control : null];
    }
});
dorado.widget.toolbar = {};
dorado.widget.ToolBar = $extend(dorado.widget.Control, {
    $className: "dorado.widget.ToolBar", ATTRIBUTES: {
        className: { defaultValue: "d-toolbar" }, height: { independent: true, readOnly: true }, items: {
            setter: function (value) {
                var toolbar = this, items = toolbar._items, rendered = toolbar._rendered, i, l, item;
                if (items) {
                    toolbar.clearItems();
                }
                if (!items) {
                    toolbar._items = items = new dorado.util.KeyedArray(function (value) {
                        return value._id;
                    });
                }
                if (value) {
                    if (value.constructor == Array.prototype.constructor) {
                        for (i = 0, l = value.length; i < l; i++) {
                            item = toolbar.createItem(value[i]);
                            items.insert(item);
                        }
                        if (rendered) {
                            toolbar.doRenderItems();
                        }
                    } else {
                        if (value instanceof dorado.util.KeyedArray) {
                            for (i = 0, l = value.size; i < l; i++) {
                                item = toolbar.createItem(value.get(i));
                                items.append(item);
                            }
                            if (rendered) {
                                toolbar.doRenderItems();
                            }
                        }
                    }
                }
            }
        }, fixRight: { defaultValue: false }, showMenuOnHover: {}
    }, createDom: function () {
        var toolbar = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", className: toolbar._className, content: [{ tagName: "div", className: "toolbar-left-wrap", contextKey: "toolbarLeftWrap", content: [{ tagName: "div", className: "toolbar-left", contextKey: "toolbarLeft" }] }, { tagName: "div", className: "toolbar-right", contextKey: "toolbarRight", style: { position: "absolute" } }] }, null, doms);
        toolbar._doms = doms;
        toolbar.doRenderItems();
        return dom;
    }, createItem: function (config) {
        if (!config) {
            return null;
        }
        var item;
        if (typeof config == "string" || config.constructor == Object.prototype.constructor) {
            item = dorado.Toolkits.createInstance("toolbar,widget", config);
        } else {
            if (config instanceof dorado.widget.Control) {
                item = config;
            }
        }
        if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
            var oldRefreshItems = item.refreshItems;
            item.refreshItems = function () {
                oldRefreshItems.apply(this, arguments);
                if (item._visibleByOverflow == false) {
                    var menuItems = item._bindMenuItems || [];
                    for (var i = 0, j = menuItems.length; i < j; i++) {
                        var menuItem = menuItems[i], control = item._itemObjects[menuItem.itemCode.key];
                        if (control) {
                            menuItem.set({ visible: control._visible, icon: control._icon, action: control._action, disabled: control._disabled, iconClass: control._iconClass });
                        }
                    }
                }
            };
        }
        if (item) {
            this.registerInnerControl(item);
        }
        return item;
    }, addItem: function (item, index) {
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
            var refDom = null, doms = toolbar._doms;
            if (typeof index == "number") {
                var refItem = items.get(index);
                refDom = refItem ? refItem._dom : null;
            }
            items.insert(item, index);
            item.render(doms.toolbarLeft, refDom);
            $fly(item._dom).addClass("d-toolbar-item");
        } else {
            items.insert(item, index);
        }
        return item;
    }, removeItem: function (item) {
        var toolbar = this, items = toolbar._items;
        if (items && item !== undefined) {
            var realItem = item;
            if (typeof item == "number") {
                realItem = items.get(item);
                items.removeAt(item);
            } else {
                items.remove(item);
            }
            realItem.destroy();
            toolbar.unregisterInnerControl(realItem);
        }
    }, clearItems: function () {
        var toolbar = this, items = toolbar._items, afterFill = false;
        for (var i = 0, j = items.size; i < j; i++) {
            var item = items.get(i);
            if (!(item instanceof dorado.widget.toolbar.Fill)) {
                toolbar.unregisterInnerControl(item);
                item.destroy();
            }
        }
        items.clear();
    }, doRenderItems: function () {
        var toolbar = this, doms = toolbar._doms, items = toolbar._items || {}, afterFill = false;
        for (var i = 0, j = items.size; i < j; i++) {
            var item = items.get(i);
            if (item instanceof dorado.widget.toolbar.Fill) {
                afterFill = true;
            } else {
                toolbar.registerInnerControl(item);
                if (!afterFill) {
                    item.render(doms.toolbarLeft);
                } else {
                    item.render(doms.toolbarRight);
                }
                $fly(item._dom).addClass("d-toolbar-item");
            }
        }
    }, hideOverflowItem: function (item, overflowMenu, dataPilotItemCode, dataPilot) {
        var menuItem;
        if (dataPilotItemCode) {
            var map = { "|<": $resource("dorado.baseWidget.DataPilotFirstPage"), "<": $resource("dorado.baseWidget.DataPilotPreviousPage"), ">": $resource("dorado.baseWidget.DataPilotNextPage"), ">|": $resource("dorado.baseWidget.DataPilotLastPage"), "+": $resource("dorado.baseWidget.DataPilotInsert"), "-": $resource("dorado.baseWidget.DataPilotDelete"), "x": $resource("dorado.baseWidget.DataPilotCancel") };
            function addItem(itemCode, innerControl) {
                var menuItem = overflowMenu.addItem({
                    caption: map[itemCode.code], visible: innerControl._visible, icon: innerControl._icon, action: innerControl._action, disabled: innerControl._disabled, iconClass: innerControl._iconClass, listener: {
                        onClick: function () {
                            innerControl.fireEvent("onClick", item);
                        }
                    }
                });
                menuItem.itemCode = itemCode;
                dataPilot._bindMenuItems.push(menuItem);
            }
            switch (dataPilotItemCode.code) {
                case "|<":
                case "<":
                case ">":
                case ">|":
                case "+":
                case "-":
                case "x":
                    addItem(dataPilotItemCode, item);
                    break;
                case "goto":
                case "info":
                    break;
                case "|":
                    break;
            }
        } else {
            if (item instanceof dorado.widget.Button) {
                menuItem = overflowMenu.addItem({
                    caption: item._caption, visible: item._visible, submenu: item._menu, action: item._action, disabled: item._disabled, icon: item._icon, iconClass: item._iconClass, listener: {
                        onClick: function () {
                            item.fireEvent("onClick", item);
                        }
                    }
                });
            } else {
                if (item instanceof dorado.widget.toolbar.Separator) {
                    overflowMenu.addItem("-");
                } else {
                    if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                        var compiledItemCodes = item._compiledItemCodes || [], bindMenuItems = [];
                        item._bindMenuItems = bindMenuItems;
                        for (var i = 0, j = compiledItemCodes.length; i < j; i++) {
                            var itemCode = compiledItemCodes[i], innerControl = item._itemObjects[itemCode.key];
                            switch (itemCode.code) {
                                case "|<":
                                case "<":
                                case ">":
                                case ">|":
                                case "+":
                                case "-":
                                case "x":
                                    addItem(itemCode, innerControl);
                                    break;
                                case "goto":
                                case "info":
                                    break;
                                case "|":
                                    break;
                            }
                        }
                    }
                }
            }
        }
        item._visibleByOverflow = false;
        item._bindingMenuItem = menuItem;
        if (dataPilotItemCode || item._hideMode == "visibility") {
            $fly(item._dom).css({ visibility: "hidden" });
        } else {
            $fly(item._dom).css({ display: "none" });
        }
    }, showUnoverflowItem: function (item, dataPilotItem) {
        item._visibleByOverflow = true;
        if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
            item._bindMenuItems = [];
        }
        var visible = item._visible;
        item._bindingMenuItem = null;
        if (dataPilotItem) {
            $fly(item._dom).css({ visibility: "" });
        } else {
            if (item._hideMode == "display") {
                $fly(item._dom).css({ display: visible ? "" : "none" });
            } else {
                $fly(item._dom).css({ visibility: visible ? "" : "hidden" });
            }
        }
    }, refreshDom: function (dom) {
        $invokeSuper.call(this, arguments);
        var toolbar = this;
        if (toolbar._fixRight) {
            $fly(dom).addClass(toolbar._className + "-fixright");
        } else {
            $fly(dom).removeClass(toolbar._className + "-fixright");
        }
    }, showDataPilot: function (item) {
        var compiledItemCodes = item._compiledItemCodes || [];
        item._visibleByOverflow = true;
        for (var i = 0, j = compiledItemCodes.length; i < j; i++) {
            var itemCode = compiledItemCodes[i], innerControl = item._itemObjects[itemCode.key];
            this.showUnoverflowItem(innerControl, true);
        }
    }, hideDataPilot: function (item, overflowMenu, currentLeft, leftVisibleWidth) {
        var toolbar = this, compiledItemCodes = item._compiledItemCodes || [], startHide = false, bindMenuItems = [];
        item._bindMenuItems = bindMenuItems;
        item._visibleByOverflow = false;
        for (var i = 0, j = compiledItemCodes.length; i < j; i++) {
            var itemCode = compiledItemCodes[i], innerControl = item._itemObjects[itemCode.key];
            toolbar.showUnoverflowItem(innerControl, true);
            if (startHide) {
                toolbar.hideOverflowItem(innerControl, overflowMenu, itemCode, item);
                continue;
            }
            currentLeft += $fly(innerControl._dom).outerWidth(true);
            if (currentLeft >= leftVisibleWidth) {
                startHide = true;
                toolbar.hideOverflowItem(innerControl, overflowMenu, itemCode, item);
            }
        }
    }, doOnResize: function () {
        $invokeSuper.call(this, arguments);
        var toolbar = this, dom = toolbar._dom, doms = toolbar._doms, overflowMenu = toolbar._overflowMenu, overflowButton = toolbar._overflowButton, items = toolbar._items, lastChild = doms.toolbarLeft.lastChild, overflow = false;
        if (dorado.Browser.msie && items) {
            items.each(function (item) {
                if (item instanceof dorado.widget.TextEditor) {
                    item.resetDimension();
                }
            });
        }
        if (items && lastChild) {
            var leftRealWidth = lastChild.offsetWidth + lastChild.offsetLeft, leftVisibleWidth = dom.offsetWidth - doms.toolbarRight.offsetWidth;
            overflow = leftRealWidth > leftVisibleWidth;
        }
        toolbar._overflowItems = [];
        if (overflow) {
            $fly(dom).addClass(toolbar._className + "-overflow");
            if (!overflowMenu) {
                overflowMenu = toolbar._overflowMenu = new dorado.widget.Menu();
                overflowButton = toolbar._overflowButton = new dorado.widget.SimpleButton({ className: "overflow-button", menu: overflowMenu });
                overflowButton.render(doms.toolbarRight);
                toolbar.registerInnerControl(overflowButton);
            } else {
                overflowMenu.clearItems();
            }
            var leftWidthSum = 0, startHideIndex = -1, item, i, j, afterFill;
            if (toolbar._fixRight) {
                leftVisibleWidth = dom.offsetWidth - doms.toolbarRight.offsetWidth;
                for (i = 0, j = items.size; i < j; i++) {
                    item = items.get(i);
                    if (item instanceof dorado.widget.toolbar.Fill) {
                        break;
                    }
                    toolbar.showUnoverflowItem(item);
                    leftWidthSum += $fly(item._dom).outerWidth(true);
                    if (leftWidthSum >= leftVisibleWidth) {
                        startHideIndex = i;
                        break;
                    }
                    if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                        toolbar.showDataPilot(item);
                    }
                }
                if (startHideIndex > -1) {
                    for (i = startHideIndex, j = items.size; i < j; i++) {
                        item = items.get(i);
                        if (item instanceof dorado.widget.toolbar.Fill) {
                            break;
                        }
                        if (i == startHideIndex && dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                            var currentLeft = leftWidthSum - $fly(item._dom).outerWidth(true);
                            toolbar.hideDataPilot(item, overflowMenu, currentLeft, leftVisibleWidth);
                        } else {
                            toolbar.hideOverflowItem(item, overflowMenu);
                        }
                    }
                }
            } else {
                afterFill = false;
                for (i = 0, j = items.size; i < j; i++) {
                    item = items.get(i);
                    if (afterFill) {
                        if (item._dom && (item._dom.parentNode == doms.toolbarRight)) {
                            doms.toolbarLeft.appendChild(item._dom);
                        }
                    }
                    if (item instanceof dorado.widget.toolbar.Fill) {
                        afterFill = true;
                    }
                }
                leftVisibleWidth = dom.offsetWidth - doms.toolbarRight.offsetWidth;
                for (i = 0, j = items.size; i < j; i++) {
                    item = items.get(i);
                    toolbar.showUnoverflowItem(item);
                    if (item instanceof dorado.widget.toolbar.Fill) {
                        continue;
                    }
                    leftWidthSum += $fly(item._dom).outerWidth(true);
                    if (leftWidthSum >= leftVisibleWidth) {
                        startHideIndex = i;
                        break;
                    }
                    if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                        toolbar.showDataPilot(item);
                    }
                }
                if (startHideIndex > -1) {
                    for (i = startHideIndex, j = items.size; i < j; i++) {
                        item = items.get(i);
                        if (item instanceof dorado.widget.toolbar.Fill) {
                            continue;
                        }
                        if (i == startHideIndex && dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                            var currentLeft = leftWidthSum - $fly(item._dom).outerWidth(true);
                            toolbar.hideDataPilot(item, overflowMenu, currentLeft, leftVisibleWidth);
                        } else {
                            toolbar.hideOverflowItem(item, overflowMenu);
                        }
                    }
                }
            }
        } else {
            $fly(dom).removeClass(toolbar._className + "-overflow");
            if (!items) {
                return;
            }
            if (!toolbar._fixRight) {
                afterFill = false;
                for (i = 0, j = items.size; i < j; i++) {
                    item = items.get(i);
                    if (afterFill) {
                        if (item._dom && (item._dom.parentNode == doms.toolbarLeft)) {
                            doms.toolbarRight.appendChild(item._dom);
                        }
                    }
                    if (item instanceof dorado.widget.toolbar.Fill) {
                        afterFill = true;
                    }
                }
            }
            for (i = 0, j = items.size; i < j; i++) {
                item = items.get(i);
                if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                    toolbar.showDataPilot(item);
                } else {
                    toolbar.showUnoverflowItem(item);
                }
            }
        }
    }, getFocusableSubControls: function () {
        return this._items.toArray();
    }
});
dorado.widget.toolbar.Separator = $extend(dorado.widget.Control, {
    $className: "dorado.widget.toolbar.Separator", ATTRIBUTES: { className: { defaultValue: "d-toolbar-sep" } }, createDom: function () {
        var separator = this, dom;
        dom = document.createElement("span");
        dom.className = separator._className;
        return dom;
    }
});
dorado.widget.toolbar.Button = $extend(dorado.widget.Button, {
    $className: "dorado.widget.toolbar.Button", constructor: function (config) {
        var items = config ? config.items : null;
        if (items) {
            delete config.items;
        }
        $invokeSuper.call(this, arguments);
        if (items) {
            this.set("items", items);
        }
    }, ATTRIBUTES: {
        items: {
            getter: function () {
                if (this._menu) {
                    return this._menu.get("items");
                }
                return null;
            }, setter: function (value) {
                if (value.constructor == Array.prototype.constructor) {
                    this._menu = new dorado.widget.Menu({ items: value });
                    this.registerInnerControl(this._menu);
                }
            }
        }, showMenuOnHover: {}, hideMenuOnMouseLeave: {}, hideMenuOnMouseLeaveDelay: { defaultValue: 300 }
    }, doGet: function (attr) {
        var c = attr.charAt(0);
        if ((c == "#" || c == "&") && this._menu) {
            return this._menu.get(attr);
        } else {
            return $invokeSuper.call(this, [attr]);
        }
    }, doSet: function (attr, value, skipUnknownAttribute, lockWritingTimes) {
        $invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);
        if (this._parent instanceof dorado.widget.ToolBar) {
            var menuItem = this._bindingMenuItem;
            if (menuItem) {
                menuItem.set({ caption: this._caption, visible: this._visible, submenu: this._menu, action: this._action, disabled: this._disabled, icon: this._icon, iconClass: this._iconClass });
            }
        }
    }, doCancelHideMenuOnMouseEnter: function () {
        if (this._hideMenuOnMouseLeaveTimer) {
            clearTimeout(this._hideMenuOnMouseLeaveTimer);
            this._hideMenuOnMouseLeaveTimer = null;
        }
    }, doHideMenuOnMouseLeave: function () {
        var button = this;
        if (this._hideMenuOnMouseLeaveTimer) {
            clearTimeout(this._hideMenuOnMouseLeaveTimer);
            this._hideMenuOnMouseLeaveTimer = null;
        }
        button._hideMenuOnMouseLeaveTimer = setTimeout(function () {
            if (button._hideMenuOnMouseLeave && button._menu) {
                button._menu.hide(true);
            }
            button._hideMenuOnMouseLeaveTimer = null;
        }, button._hideMenuOnMouseLeaveDelay || 300);
    }, createDom: function () {
        var button = this, dom = $invokeSuper.call(button, arguments);
        $fly(dom).mouseenter(function () {
            var menu = button._menu, toolbar = button._parent;
            if (button._hideMenuOnMouseLeave) {
                button.doCancelHideMenuOnMouseEnter();
            }
            if (menu && toolbar && !button._disabled) {
                var activeButton = toolbar._activeMenuButton;
                if (button.willShowMenuOnHover()) {
                    if (activeButton && activeButton != button) {
                        activeButton._menu.hide(true);
                        button.doShowMenu();
                    } else {
                        if (activeButton != button) {
                            button.doShowMenu();
                        }
                    }
                } else {
                    if (activeButton && activeButton != button) {
                        activeButton._menu.hide(true);
                        button.doShowMenu();
                    }
                }
            }
        }).mouseleave(function () {
            if (button._hideMenuOnMouseLeave) {
                button.doHideMenuOnMouseLeave();
            }
        });
        return dom;
    }, willShowMenuOnHover: function () {
        var button = this, toolbar = button._parent, menu = button._menu;
        if (menu && toolbar && !button._disabled) {
            return button._showMenuOnHover !== undefined ? button._showMenuOnHover : (toolbar._showMenuOnHover !== undefined ? toolbar._showMenuOnHover : undefined);
        }
        return false;
    }, doShowMenu: function () {
        $invokeSuper.call(this, arguments);
        var button = this, menu = button._menu;
        if (menu) {
            var toolbar = button._parent;
            toolbar._activeMenuButton = button;
        }
    }, doBeforeMenuHide: function () {
        var button = this, toolbar = button._parent;
        if (toolbar) {
            toolbar._activeMenuButton = null;
        }
    }
});
dorado.widget.toolbar.Fill = $extend(dorado.widget.Control, { $className: "dorado.widget.toolbar.Fill" });
dorado.widget.toolbar.Label = $extend(dorado.widget.Control, {
    $className: "dorado.widget.toolbar.Label", ATTRIBUTES: { className: { defaultValue: "d-toolbar-label" }, text: {} }, createDom: function () {
        var label = this, dom = document.createElement("div");
        dom.className = label._className;
        $fly(dom).text(label._text ? label._text : "");
        return dom;
    }, refreshDom: function (dom) {
        $invokeSuper.call(this, arguments);
        var label = this;
        $fly(dom).text(label._text ? label._text : "");
    }
});
dorado.Toolkits.registerPrototype("toolbar", { Default: dorado.widget.toolbar.Button, Label: dorado.widget.toolbar.Label, ToolBarButton: dorado.widget.toolbar.Button, "->": dorado.widget.toolbar.Fill, Fill: dorado.widget.toolbar.Fill, ToolBarLabel: dorado.widget.toolbar.Label, "-": dorado.widget.toolbar.Separator, "|": dorado.widget.toolbar.Separator, Separator: dorado.widget.toolbar.Separator });
dorado.widget.FloatPanel = $extend([dorado.widget.Panel, dorado.widget.FloatControl], {
    $className: "dorado.widget.FloatPanel", focusable: true, ATTRIBUTES: { visible: { defaultValue: false } }, doClose: function () {
        var panel = this;
        panel.hide && panel.hide();
    }, doShow: function () {
        var panel = this, doms = panel._doms;
        $fly([doms.contentPanel, doms.buttonPanel]).css("display", "");
        $invokeSuper.call(this, arguments);
    }, doAfterShow: function () {
        var panel = this;
        panel._minimized = false;
        $invokeSuper.call(this, arguments);
    }
});
(function () {
    var handleConfigMap = { "dialog-header-left": { cursor: "nw-resize", horiStyle: "left width", vertStyle: "top height", widthRatio: -1, heightRatio: -1 }, "dialog-header-right": { cursor: "ne-resize", horiStyle: "width", vertStyle: "top height", widthRatio: 1, heightRatio: -1 }, "dialog-header-center": { cursor: "n-resize", horiStyle: "", vertStyle: "top height", widthRatio: 1, heightRatio: -1 }, "dialog-body-left": { cursor: "w-resize", horiStyle: "left width", vertStyle: "", widthRatio: -1, heightRatio: 1 }, "dialog-body-right": { cursor: "e-resize", horiStyle: "width", vertStyle: "", widthRatio: 1, heightRatio: 1 }, "dialog-footer-left": { cursor: "sw-resize", horiStyle: "left width", vertStyle: "height", widthRatio: -1, heightRatio: 1 }, "dialog-footer-right": { cursor: "se-resize", horiStyle: "width", vertStyle: "height", widthRatio: 1, heightRatio: 1 }, "dialog-footer-center": { cursor: "s-resize", horiStyle: "", vertStyle: "height", widthRatio: 1, heightRatio: 1 } };
    var useDraggingFakeDialog = (dorado.Browser.msie && dorado.Browser.version < 9);
    var fakeDialog, fullWindowDialogs = [];
    dorado.bindResize(function () {
        var docWidth = jQuery(window).width(), docHeight = jQuery(window).height();
        for (var i = 0, j = fullWindowDialogs.length; i < j; i++) {
            var dialog = fullWindowDialogs[i];
            if (dialog && !dialog._maximizeTarget) {
                dialog.set({ width: docWidth, height: docHeight });
            }
        }
    });
    dorado.widget.Dialog = $extend(dorado.widget.FloatPanel, {
        $className: "dorado.widget.Dialog", _inherentClassName: "i-dialog", ATTRIBUTES: {
            className: { defaultValue: "d-dialog" }, minWidth: { defaultValue: 200 }, minHeight: { defaultValue: 100 }, maxWidth: {}, maxHeight: {}, draggable: { defaultValue: true }, dragOutside: { defaultValue: false }, center: { defaultValue: true }, modal: { defaultValue: true }, resizeable: {
                defaultValue: true, setter: function (value) {
                    this._resizeable = value;
                    if (this._dom) {
                        if (this._resizeable) {
                            $fly(this._dom).addClass("i-dialog-resizeable d-dialog-resizeable").find(".dialog-resize-handle").draggable("enable");
                        } else {
                            $fly(this._dom).removeClass("i-dialog-resizeable d-dialog-resizeable").find(".dialog-resize-handle").draggable("disable");
                        }
                    }
                }
            }, maximizeTarget: {}, minimizeable: {
                defaultValue: false, setter: function (value) {
                    var dialog = this, captionBar = dialog._captionBar, button;
                    dialog._minimizeable = value;
                    if (captionBar) {
                        if (value) {
                            button = captionBar.getButton(dialog._uniqueId + "_minimize");
                            if (button) {
                                $fly(button._dom).css("display", "");
                            } else {
                                dialog._createMinimizeButton();
                            }
                        } else {
                            button = captionBar.getButton(dialog._uniqueId + "_minimize");
                            if (button) {
                                $fly(button._dom).css("display", "none");
                            }
                        }
                    }
                }
            }, minimized: {
                setter: function (value) {
                    this._minimized = value;
                    if (this._minimizeable) {
                        if (value) {
                            this.minimize();
                        } else {
                            this.show();
                        }
                    }
                }
            }, closeable: { defaultValue: true }, shadowMode: { defaultValue: "frame", skipRefresh: true }, animateType: { defaultValue: dorado.Browser.msie ? "none" : "zoom" }
        }, EVENTS: { beforeMaximize: {}, onMaximize: {}, beforeMinimize: {}, onMinimize: {} }, doSetFocus: function () {
            var dialog = this;
            if (dialog._dom) {
                try {
                    dialog._dom.focus();
                }
                catch (e) {
                }
            }
        }, applyDraggable: function () {
        }, doOnAttachToDocument: function () {
            $invokeSuper.call(this, arguments);
        }, doHandleOverflow: function (options) {
            var dialog = this;
            dialog._height = options.maxHeight;
        }, maximizeRestore: function () {
            var dialog = this, dom = dialog._dom, doms = dialog._doms;
            if (dom) {
                $fly(doms.contentPanel).css("display", "");
                if (dialog._maximizedDirty || dialog._maximized) {
                    dialog._maximized = false;
                    dialog._width = dialog._originalWidth;
                    dialog._height = dialog._originalHeight;
                    dialog._left = dialog._originalLeft;
                    dialog._top = dialog._originalTop;
                    dialog.refresh();
                    if (dialog._left !== undefined && dialog._top !== undefined) {
                        $fly(dom).css({ left: dialog._left, top: dialog._top });
                    }
                    var captionBar = dialog._captionBar;
                    if (captionBar) {
                        var button = captionBar.getButton(dialog._uniqueId + "_maximize");
                        if (button) {
                            $fly(button._dom).prop("className", "d-maximize-button");
                            button._className = "d-maximize-button";
                        }
                    }
                    var $dom = jQuery(dom);
                    if (dialog._resizeable) {
                        $dom.addClass("d-dialog-resizeable").find(".dialog-resize-handle").draggable("enable");
                    }
                    if (dialog._draggable) {
                        $dom.addClass("d-dialog-draggable").draggable("enable");
                    }
                    fullWindowDialogs.remove(dialog);
                }
            }
        }, maximize: function () {
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
                var maximizeTarget = dialog._maximizeTarget, originalMaimizeTarget = maximizeTarget;
                if (maximizeTarget == "parent") {
                    maximizeTarget = dialog._dom.parentNode;
                } else {
                    if (typeof maximizeTarget == "String") {
                        maximizeTarget = jQuery(maximizeTarget)[0];
                    } else {
                        if (maximizeTarget && dorado.Object.isInstanceOf(maximizeTarget, dorado.RenderableElement)) {
                            maximizeTarget = maximizeTarget._dom;
                        }
                    }
                }
                if (maximizeTarget) {
                    dialog._width = $fly(maximizeTarget).outerWidth(true);
                    dialog._height = $fly(maximizeTarget).outerHeight(true);
                } else {
                    dialog._width = $fly(window).width();
                    dialog._height = $fly(window).height();
                }
                var captionBar = dialog._captionBar;
                if (captionBar) {
                    var button = captionBar.getButton(dialog._uniqueId + "_maximize");
                    if (button) {
                        $fly(button._dom).prop("className", "d-restore-button");
                        button._className = "d-restore-button";
                    }
                }
                var targetOffset;
                if (originalMaimizeTarget == "parent") {
                    targetOffset = { left: 0, top: 0 };
                } else {
                    targetOffset = $fly(maximizeTarget).offset() || { left: 0, top: 0 };
                }
                dialog._left = targetOffset.left;
                dialog._top = targetOffset.top;
                var domEl = jQuery(dom);
                domEl.css(targetOffset);
                if (dialog._resizeable) {
                    domEl.removeClass("d-dialog-resizeable").find(".dialog-resize-handle").draggable("disable");
                }
                if (dialog._draggable) {
                    domEl.removeClass("d-dialog-draggable").draggable("disable");
                }
                dialog.refresh();
                fullWindowDialogs.push(dialog);
                dialog.fireEvent("onMaximize", dialog);
            }
        }, minimize: function () {
            var dialog = this, dom = dialog._dom;
            if (dom) {
                var eventArg = { processDefault: true };
                dialog.fireEvent("beforeMinimize", dialog, eventArg);
                if (!eventArg.processDefault) {
                    return;
                }
                dialog._minimized = true;
                dialog.hide();
                dialog.fireEvent("onMinimize", dialog);
            }
        }, doSetCollapsed: function (collapsed) {
            $invokeSuper.call(this, arguments);
            var dialog = this;
            if (dialog._resizeable) {
                if (collapsed) {
                    jQuery(dialog._dom).removeClass("d-dialog-resizeable").find(".dialog-resize-handle").draggable("disable");
                } else {
                    jQuery(dialog._dom).addClass("d-dialog-resizeable").find(".dialog-resize-handle").draggable("enable");
                }
            }
        }, _doOnResize: function (collapsed) {
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
                    height = $fly(window).height() * parseInt(height.replace("%", ""), 10) / 100;
                }
            }
            if (typeof height == "number" && height > 0) {
                if (collapsed === undefined) {
                    collapsed = dialog._collapsed;
                }
                if (collapsed) {
                    $fly(dom).height("auto");
                } else {
                    var headerHeight = $fly(doms.header).outerHeight(true), footerHeight = $fly(doms.footer).outerHeight(true), captionBarHeight = 0, buttonPanelHeight = 0;
                    if (doms.captionBar) {
                        captionBarHeight = $fly(doms.captionBar).outerHeight(true);
                    }
                    if (doms.buttonPanel) {
                        buttonPanelHeight = $fly(doms.buttonPanel).outerHeight(true);
                    }
                    $fly(doms.contentPanel).outerHeight(height - headerHeight - footerHeight - captionBarHeight - buttonPanelHeight);
                    if (dorado.Browser.msie && dorado.Browser.version == 6) {
                        $fly([doms.bodyWrap, doms.header, dialog.footer, doms.headerCenter, doms.bodyLeft, doms.bodyRight]).css("zoom", "").css("zoom", 1);
                    }
                }
            } else {
                $fly(doms.contentPanel).css("height", "");
                if (dorado.Browser.msie && dorado.Browser.version == 6) {
                    $fly([doms.bodyWrap, doms.header, dialog.footer, doms.headerCenter, doms.bodyLeft, doms.bodyRight]).css("zoom", "").css("zoom", 1);
                }
            }
            $fly(dom).css("height", "");
            if (typeof width == "number" && width > 0) {
                $fly(dom).outerWidth(width);
            }
        }, _createMinimizeButton: function () {
            var dialog = this, captionBar = dialog._captionBar;
            if (captionBar) {
                captionBar.addButton(new dorado.widget.SimpleButton({
                    className: "d-minimize-button", onCreate: function () {
                        this._uniqueId = dialog._uniqueId + "_minimize";
                    }, onClick: function () {
                        if (!dialog._minimized) {
                            dialog.minimize();
                        }
                    }
                }), 102);
            }
        }, createDom: function () {
            var dialog = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", className: dialog._className, style: { visibility: dialog._visible ? "visible" : "hidden" }, content: [{ tagName: "div", className: "dialog-header", contextKey: "header", content: [{ tagName: "div", className: "dialog-header-left dialog-resize-handle", contextKey: "headerLeft" }, { tagName: "div", className: "dialog-header-right dialog-resize-handle", contextKey: "headerRight" }, { tagName: "div", className: "dialog-header-center dialog-resize-handle", contextKey: "headerCenter" }] }, { tagName: "div", className: "dialog-body-wrap", contextKey: "bodyWrap", content: [{ tagName: "div", className: "dialog-body-left dialog-resize-handle", contextKey: "bodyLeft" }, { tagName: "div", className: "dialog-body-right dialog-resize-handle", contextKey: "bodyRight" }, { tagName: "div", className: "dialog-body", contextKey: "body", content: { tagName: "div", className: "content-panel", contextKey: "contentPanel" } }] }, { tagName: "div", className: "dialog-footer", contextKey: "footer", content: [{ tagName: "div", className: "dialog-footer-left dialog-resize-handle", contextKey: "footerLeft" }, { tagName: "div", className: "dialog-footer-right dialog-resize-handle", contextKey: "footerRight" }, { tagName: "div", className: "dialog-footer-center dialog-resize-handle", contextKey: "footerCenter" }] }] }, null, doms);
            dialog._doms = doms;
            var showCaptionBar = dialog._showCaptionBar;
            if (showCaptionBar !== false) {
                var tools = dialog._tools, toolButtons = [];
                if (tools instanceof Array) {
                    for (var i = 0, j = tools.length; i < j; i++) {
                        var tool = tools[i];
                        if (tool) {
                            toolButtons.push(tool);
                        }
                    }
                }
                var captionBar = dialog._captionBar = new dorado.widget.CaptionBar({ className: "d-dialog-caption-bar", caption: dialog.get("caption") || dialog._caption, icon: dialog._icon, iconClass: dialog._iconClass, buttons: toolButtons });
                dialog.registerInnerControl(captionBar);
                captionBar.render(doms.body.parentNode, doms.body);
                doms.captionBar = captionBar._dom;
                $DomUtils.disableUserSelection(doms.captionBar);
            }
            dialog.initButtons();
            if (dialog._minimizeable) {
                dialog._createMinimizeButton();
            }
            if (dialog._maximizeable) {
                dialog._createMaximizeButton();
            }
            if (dialog._closeable) {
                dialog._createCloseButton();
            }
            if (dialog._collapseable) {
                dialog._createCollapseButton();
            }
            if (dialog._draggable && showCaptionBar !== false) {
                jQuery(dom).addClass("d-dialog-draggable").css("position", "absolute").draggable({
                    iframeFix: true, addClasses: false, handle: ".d-dialog-caption-bar", cursor: "move", distance: 10, containment: dialog._dragOutside ? null : "parent", helper: function () {
                        if (useDraggingFakeDialog) {
                            if (!fakeDialog) {
                                fakeDialog = new dorado.widget.Dialog({ exClassName: "d-dialog-helper", visible: true, animateType: "none", shadowMode: "none" });
                                fakeDialog.render(dialog._dom.parentNode);
                            }
                            fakeDialog.render(dialog._dom.parentNode);
                            $fly(fakeDialog._dom).css("display", "");
                            var height = dialog.getRealHeight();
                            if (height == null) {
                                height = $fly(dom).height();
                            }
                            fakeDialog.set({ width: dom.offsetWidth, height: height, caption: dialog.get("caption"), icon: dialog._icon, iconClass: dialog._iconClass, minimizeable: dialog._minimizeable, maximizeable: dialog._maximizeable, closeable: dialog._closeable, collapseable: dialog._collapseable, left: dialog._left, top: dialog._top, collapsed: dialog._collapsed });
                            fakeDialog.refresh();
                            return fakeDialog._dom;
                        } else {
                            return dom;
                        }
                    }, start: function (event, ui) {
                        if (useDraggingFakeDialog) {
                            var helper = ui.helper;
                            helper.css({ display: "", visibility: "" }).bringToFront();
                            $fly(dom).addClass("d-dialog-dragging").css("visibility", "hidden");
                        }
                    }, stop: function (event, ui) {
                        if (useDraggingFakeDialog) {
                            var helper = ui.helper, left = parseInt(helper.css("left"), 10), top = parseInt(helper.css("top"), 10);
                            $fly(dom).removeClass("d-dialog-dragging").css({ visibility: "", left: left, top: top });
                            dialog._left = left;
                            dialog._top = top;
                            $.ui.ddmanager.current.cancelHelperRemoval = true;
                            ui.helper.css("display", "none");
                        }
                    }
                });
            }
            if (dialog._resizeable) {
                var dialogXY, dialogSize, dialogHelperOffset, bodyRect;
                jQuery(dom).addClass("d-dialog-resizeable").find(".dialog-resize-handle").each(function (index, handle) {
                    var className = handle.className.split(" ")[0], config = handleConfigMap[className];
                    if (!config) {
                        return;
                    }
                    jQuery(handle).draggable({
                        iframeFix: true, cursor: config.cursor, addClasses: false, containment: "parent", helper: function () {
                            var proxy = document.createElement("div");
                            proxy.className = "d-dialog-drag-proxy";
                            proxy.style.position = "absolute";
                            var $dom = $fly(dom);
                            dialogXY = $dom.offset();
                            dialogSize = [$dom.width(), $dom.height()];
                            proxy.style.left = (dialog._left || 0) + "px";
                            proxy.style.top = (dialog._top || 0) + "px";
                            dom.parentNode.appendChild(proxy);
                            var helperOffset = $fly(proxy).offset();
                            dialogHelperOffset = { left: (dialog._left || 0) - helperOffset.left, top: (dialog._top || 0) - helperOffset.top };
                            $fly(proxy).bringToFront().outerWidth(dialogSize[0]).outerHeight(dialogSize[1]).css("cursor", config.cursor);
                            return proxy;
                        }, start: function (event, ui) {
                            var bodyEl = $fly(document.body), width = bodyEl.outerWidth(true), height = bodyEl.outerHeight(true), offset = bodyEl.offset();
                            bodyRect = { left: offset.left, top: offset.top, right: offset.left + width, bottom: offset.top + height };
                        }, drag: function (event, ui) {
                            var horiStyle = config.horiStyle, vertStyle = config.vertStyle, heightRatio = config.heightRatio, widthRatio = config.widthRatio, minWidth = dialog._minWidth || 200, minHeight = dialog._minHeight || 100, maxWidth = dialog._maxWidth, maxHeight = dialog._maxHeight;
                            ui.position = { left: $fly(dom).offset().left, top: $fly(dom).offset().top };
                            var inst = jQuery.data(this, "ui-draggable"), horiChange = event.pageX - inst.originalPageX, vertChange = event.pageY - inst.originalPageY, width, height, horiOverflowOffset, vertOverflowOffset;
                            var helper = ui.helper, position = ui.position, widthFlag = false, heightFlag = false;
                            position.left += dialogHelperOffset.left;
                            position.top += dialogHelperOffset.top;
                            if (horiStyle.indexOf("width") != -1) {
                                width = dialogSize[0] + widthRatio * horiChange;
                                if (width < minWidth) {
                                    horiOverflowOffset = width - minWidth;
                                    width = minWidth;
                                    widthFlag = true;
                                }
                                if (maxWidth && width > maxWidth) {
                                    horiOverflowOffset = width - maxWidth;
                                    width = maxWidth;
                                    widthFlag = true;
                                }
                            }
                            if (vertStyle.indexOf("height") != -1) {
                                height = dialogSize[1] + heightRatio * vertChange;
                                if (height < minHeight) {
                                    vertOverflowOffset = height - minHeight;
                                    height = minHeight;
                                    heightFlag = true;
                                }
                                if (maxHeight && height > maxHeight) {
                                    vertOverflowOffset = height - maxHeight;
                                    height = maxHeight;
                                    heightFlag = true;
                                }
                            }
                            if (horiStyle.indexOf("left") != -1) {
                                if (!widthFlag) {
                                    position.left = dialogXY.left + horiChange;
                                } else {
                                    position.left = dialogXY.left + horiChange + horiOverflowOffset;
                                }
                            }
                            if (vertStyle.indexOf("top") != -1) {
                                if (!heightFlag) {
                                    position.top = dialogXY.top + vertChange;
                                } else {
                                    position.top = dialogXY.top + vertChange + vertOverflowOffset;
                                }
                            }
                            if (!dialog._dragOutside) {
                                var helperRect = { left: position.left, top: position.top, right: position.left + width, bottom: position.top + height };
                                if (helperRect.left < bodyRect.left) {
                                    position.left = bodyRect.left;
                                    width = helperRect.right - bodyRect.left;
                                } else {
                                    if (helperRect.right >= bodyRect.right) {
                                        width = bodyRect.right - helperRect.left;
                                    }
                                }
                                if (helperRect.top < bodyRect.top) {
                                    position.top = bodyRect.top;
                                    height = helperRect.bottom - bodyRect.top;
                                } else {
                                    if (helperRect.bottom >= bodyRect.bottom) {
                                        height = bodyRect.bottom - helperRect.top;
                                    }
                                }
                            }
                            helper.outerWidth(width).outerHeight(height);
                        }, stop: function (event, ui) {
                            var wrapEl = ui.helper, offset = wrapEl.offset();
                            offset.left += dialogHelperOffset.left;
                            offset.top += dialogHelperOffset.top;
                            dialog._left = offset.left;
                            dialog._top = offset.top;
                            dialog._width = wrapEl.outerWidth();
                            dialog._height = wrapEl.outerHeight();
                            dialog.refresh();
                            $fly(dialog._dom).css(offset);
                        }
                    });
                });
            }
            return dom;
        }, getShowPosition: function (options) {
            var dialog = this;
            if (dialog._maximized) {
                var result = { left: 0, top: 0 };
                $fly(dialog._dom).css(result);
                return result;
            } else {
                return $invokeSuper.call(dialog, arguments);
            }
        }
    });
})();
(function () {
    var validItemCodes = ["|<", "<", ">", ">|", "goto", "pageSize", "info", "+", "-", "x", "|"];
    var defaultShowTextItemCodes = ["goto", "+", "-", "x"];
    dorado.widget.DataPilot = $extend([dorado.widget.Control, dorado.widget.DataControl], {
        $className: "dorado.widget.DataPilot", ATTRIBUTES: {
            className: { defaultValue: "d-data-pilot" }, itemCodes: {
                defaultValue: "pages", setter: function (v) {
                    if (this._itemCodes != v) {
                        this._itemCodes = v;
                        this.compileItemCodes(v);
                    }
                }
            }, height: { independent: true, readOnly: true }, disabled: {}
        }, EVENTS: { onSubControlRefresh: {}, onSubControlAction: {} }, filterDataSetMessage: function (messageCode, arg, data) {
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
        }, processDataSetMessage: function (messageCode, arg, data) {
            switch (messageCode) {
                case dorado.widget.DataSet.MESSAGE_REFRESH:
                case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
                case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
                case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
                case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
                    this.refresh(true);
                    break;
            }
        }, getBindingData: function (options) {
            var realOptions = { firstResultOnly: true, acceptAggregation: true };
            if (typeof options == "String") {
                realOptions.loadMode = options;
            } else {
                dorado.Object.apply(realOptions, options);
            }
            return $invokeSuper.call(this, [realOptions]);
        }, refreshDom: function (dom) {
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
                        item.destroy();
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
        }, createItem: function (itemCode) {
            function fireOnActionEvent(code, control) {
                var eventArg = { code: code, control: control, processDefault: true };
                this.fireEvent("onSubControlAction", this, eventArg);
                return eventArg.processDefault;
            }
            function callback() {
                pilot.set("disabled", false);
            }
            var item, pilot = this;
            switch (itemCode.code) {
                case "|<":
                    item = new PageButton({
                        iconClass: itemCode.showIcon ? "icon-first-page" : null, tip: itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotFirstPage") : null, onClick: function (self) {
                            if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                                return;
                            }
                            var list = pilot.getBindingData();
                            if (list instanceof dorado.EntityList && list.pageNo > 1) {
                                pilot.set("disabled", true);
                                list.firstPage(callback);
                            }
                        }
                    });
                    break;
                case "<":
                    item = new PageButton({
                        iconClass: itemCode.showIcon ? "icon-previous-page" : null, tip: itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotPreviousPage") : null, onClick: function () {
                            if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                                return;
                            }
                            var list = pilot.getBindingData();
                            if (list instanceof dorado.EntityList && list.pageNo > 1) {
                                pilot.set("disabled", true);
                                list.previousPage(callback);
                            }
                        }
                    });
                    break;
                case ">":
                    item = new PageButton({
                        iconClass: itemCode.showIcon ? "icon-next-page" : null, tip: itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotNextPage") : null, onClick: function () {
                            if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                                return;
                            }
                            var list = pilot.getBindingData();
                            if (list instanceof dorado.EntityList && list.pageNo < list.pageCount) {
                                pilot.set("disabled", true);
                                list.nextPage(callback);
                            }
                        }
                    });
                    break;
                case ">|":
                    item = new PageButton({
                        iconClass: itemCode.showIcon ? "icon-last-page" : null, tip: itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotLastPage") : null, onClick: function () {
                            if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                                return;
                            }
                            var list = pilot.getBindingData();
                            if (list instanceof dorado.EntityList && list.pageNo < list.pageCount) {
                                pilot.set("disabled", true);
                                list.lastPage(callback);
                            }
                        }
                    });
                    break;
                case "goto":
                    item = new GotoPageControl({
                        onAction: function (self, arg) {
                            if (arg.pageNo < 1) {
                                arg.pageNo = 1;
                            }
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
                        }
                    });
                    break;
                case "info":
                    item = new dorado.widget.Label();
                    break;
                case "pageSize":
                    item = new PageSizeControl({
                        onAction: function (self, arg) {
                            if (!arg.pageSize || arg.pageSize < 1) {
                                self._pageSize = 10;
                                arg.pageSize = 10;
                            }
                            if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                                return;
                            }
                            if (arg.pageSize > 0) {
                                var list = pilot.getBindingData();
                                if (list instanceof dorado.EntityList && list.pageSize != arg.pageSize) {
                                    var parent = list.parent;
                                    if (parent && parent instanceof dorado.Entity && list.parentProperty) {
                                        var pd = parent.dataType.getPropertyDef(list.parentProperty);
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
                            } else {
                                item.set("disabled", false);
                            }
                            pilot.refreshItems();
                        }
                    });
                    break;
                case "+":
                    item = new ToolBarButton({
                        iconClass: itemCode.showIcon ? "icon-add" : null, caption: itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotInsert") : null, onClick: function () {
                            if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                                return;
                            }
                            var list = pilot.getBindingData();
                            if (list instanceof dorado.EntityList) {
                                list.createChild();
                            }
                        }
                    });
                    break;
                case "-":
                    item = new ToolBarButton({
                        iconClass: itemCode.showIcon ? "icon-delete" : null, caption: itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotDelete") : null, onClick: function () {
                            if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                                return;
                            }
                            dorado.MessageBox.confirm($resource("dorado.baseWidget.DataPilotDeleteConfirm"), function () {
                                var list = pilot.getBindingData();
                                if (list instanceof dorado.EntityList && list.current) {
                                    list.current.remove();
                                }
                            });
                        }
                    });
                    break;
                case "x":
                    item = new ToolBarButton({
                        iconClass: itemCode.showIcon ? "icon-cancel" : null, caption: itemCode.showCaption ? $resource("dorado.baseWidget.DataPilotCancel") : null, onClick: function () {
                            if (!fireOnActionEvent.call(pilot, itemCode.code, self)) {
                                return;
                            }
                            dorado.MessageBox.confirm($resource("dorado.baseWidget.DataPilotCancelConfirm"), function () {
                                var list = pilot.getBindingData();
                                if (list instanceof dorado.EntityList && list.current) {
                                    list.current.cancel();
                                }
                            });
                        }
                    });
                    break;
                case "|":
                    item = new dorado.widget.toolbar.Separator();
                    break;
            }
            if (item) {
                item.set("style", "float: left");
            }
            return item;
        }, compileItemCodes: function () {
            var itemCodes = this._itemCodes;
            if (itemCodes && itemCodes.indexOf("pages") >= 0) {
                itemCodes = itemCodes.replace("pages", "|<,<,goto,>,>|");
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
                    itemCode = { code: code, showIcon: showIcon, showCaption: showCaption, options: options, key: code + "/" + (showIcon ? "i" : "") + (showCaption ? "c" : "") + i };
                    compiledItemCodes.push(itemCode);
                    if (itemCodeExpression.length > 0) {
                        itemCodeExpression += ",";
                    }
                    itemCodeExpression += itemCode.key;
                }
            }
            this._itemCodeExpression = itemCodeExpression;
        }, refreshItems: function () {
            if (this._itemObjects) {
                var itemCodes = this._compiledItemCodes;
                if (itemCodes) {
                    for (var i = 0; i < itemCodes.length; i++) {
                        this.refreshItem(itemCodes[i]);
                    }
                }
            }
        }, refreshItem: function (itemCode) {
            var item = this._itemObjects[itemCode.key];
            if (!item) {
                return;
            }
            var eventArg = { code: itemCode.code, control: item, processDefault: true };
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
                    item.set({ disabled: (disabled || pageCount == 1), pageNo: pageNo, pageCount: pageCount, entityCount: entityCount });
                    break;
                case "info":
                    var text = $resource("dorado.baseWidget.DataPilotInfo", pageNo, pageCount, entityCount);
                    item.set("text", text);
                    break;
                case "pageSize":
                    item.set({ disabled: (disabled || pageSize == 0), pageSize: pageSize });
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
        }
    });
    var PageButton = dorado.widget.SimpleIconButton;
    var ToolBarButton = dorado.widget.toolbar.Button;
    var GotoPageControl = $extend(dorado.widget.Control, {
        ATTRIBUTES: { className: { defaultValue: "d-goto-page" }, pageNo: { defaultValue: 1 }, pageCount: { defaultValue: 1 }, entityCount: { defaultValue: 0 }, disabled: {} }, EVENTS: {
            onAction: {
                interceptor: function (superFire, self, arg) {
                    if (arg.pageNo > 0) {
                        this._pageNo = arg.pageNo;
                        return superFire(self, arg);
                    } else {
                        this._spinner.set("value", this._currentPageNo);
                    }
                }
            }
        }, createDom: function (dom) {
            var dom = document.createElement("SPAN");
            var gotoPage = this;
            this._labelPrefix = $DomUtils.xCreate({ tagName: "SPAN", className: "text", style: "float: left" });
            dom.appendChild(this._labelPrefix);
            var spinner = this._spinner = new dorado.widget.NumberSpinner({
                min: 1, max: 1, value: 1, showSpinTrigger: false, onPost: function (self, arg) {
                    gotoPage.fireEvent("onAction", gotoPage, { pageNo: spinner.get("value") });
                }, onKeyDown: function (self, arg) {
                    if (arg.keyCode == 13) {
                        spinner.post();
                        arg.returnValue = true;
                    }
                }, width: 40, style: "float: left"
            });
            spinner.render(dom);
            this.registerInnerControl(spinner);
            this._labelSuffix = $DomUtils.xCreate({ tagName: "SPAN", className: "text", style: "float: left" });
            dom.appendChild(this._labelSuffix);
            return dom;
        }, refreshDom: function (dom) {
            $invokeSuper.call(this, arguments);
            var spinner = this._spinner;
            $fly(this._labelPrefix).text($resource("dorado.baseWidget.DataPilotGotoPagePrefix", this._pageNo, this._pageCount, this._entityCount));
            $fly(this._labelSuffix).text($resource("dorado.baseWidget.DataPilotGotoPageSuffix", this._pageNo, this._pageCount, this._entityCount));
            this._currentPageNo = this._pageNo;
            spinner.set({ max: this._pageCount, value: this._pageNo, readOnly: this._disabled });
        }
    });
    var PageSizeControl = $extend(dorado.widget.Control, {
        ATTRIBUTES: { className: { defaultValue: "d-page-size" }, pageSize: { defaultValue: 10 }, step: { defaultValue: 5 }, disabled: {} }, EVENTS: {
            onAction: {
                interceptor: function (superFire, self, arg) {
                    this._pageSize = arg.pageSize;
                    return superFire(self, arg);
                }
            }
        }, createDom: function (dom) {
            var dom = document.createElement("SPAN");
            var pageSizeControl = this;
            this._labelPrefix = $DomUtils.xCreate({ tagName: "SPAN", className: "text", style: "float: left" });
            dom.appendChild(this._labelPrefix);
            var spinner = this._spinner = new dorado.widget.NumberSpinner({
                min: 1, onPost: function (self, arg) {
                    pageSizeControl.fireEvent("onAction", pageSizeControl, { pageSize: spinner.get("value") });
                }, onKeyDown: function (self, arg) {
                    if (arg.keyCode == 13) {
                        spinner.post();
                        arg.returnValue = true;
                    }
                }, width: 45, style: "float: left"
            });
            spinner.render(dom);
            this.registerInnerControl(spinner);
            return dom;
        }, refreshDom: function (dom) {
            $invokeSuper.call(this, arguments);
            var spinner = this._spinner;
            $fly(this._labelPrefix).text($resource("dorado.baseWidget.DataPilotPageSize"));
            this._currentPageSize;
            spinner.set({ step: this._step, value: this._pageSize, readOnly: this._disabled });
        }
    });
})();


dorado.widget.DropDownBox = $extend(dorado.widget.FloatContainer, {
    $className: "dorado.widget.DropDownBox", _useInnerWidth: true, _useInnerHeight: true, ATTRIBUTES: {
        className: { defaultValue: "d-drop-down-box" }, showAnimateType: { defaultValue: "safeSlide" }, hideAnimateType: { defaultValue: "none" }, focusAfterShow: { defaultValue: false }, continuedFocus: { defaultValue: true }, editor: {}, dropDown: {}, control: {
            writeOnce: true, setter: function (control) {
                if (this._control == control) {
                    return;
                }
                this._control = control;
                this.removeAllChildren();
                this.addChild(control);
            }
        }
    }, EVENTS: { onDropDownBoxShow: {} }, constructor: function (config) {
        $invokeSuper.call(this, arguments);
        if (dorado.Browser.msie && dorado.Browser.version < 9) {
            this._showAnimateType = "none";
        }
    }, doAfterShow: function (editor) {
        $invokeSuper.call(this, arguments);
        this.fireEvent("onDropDownBoxShow", this);
    }
});
(function () {
    DropDownFilterTrigger = $extend(dorado.widget.Trigger, {
        $className: "dorado.widget.DropDownFilterTrigger", ATTRIBUTES: { iconClass: { defaultValue: "d-trigger-icon-filter" } }, execute: function (editor) {
            var dropDown = this._dropDown;
            if (dropDown) {
                dropDown.onFilterItems(editor.doGetText());
            }
        }
    });
    DropDownResetFilterTrigger = $extend(dorado.widget.Trigger, {
        $className: "dorado.widget.DropDownResetFilterTrigger", ATTRIBUTES: { iconClass: { defaultValue: "d-trigger-icon-reset" } }, execute: function (editor) {
            var dropDown = this._dropDown;
            if (dropDown) {
                dropDown.onFilterItems();
            }
        }
    });
    var globalFilterTrigger;
    function getDropDownFilterTrigger() {
        if (!globalFilterTrigger) {
            globalFilterTrigger = new DropDownFilterTrigger();
        }
        return globalFilterTrigger;
    }
    var globalResetFilterTrigger;
    function getDropDownResetFilterTrigger() {
        if (!globalResetFilterTrigger) {
            globalResetFilterTrigger = new DropDownResetFilterTrigger();
        }
        return globalResetFilterTrigger;
    }
    dorado.widget.RowListDropDown = $extend(dorado.widget.DropDown, {
        $className: "dorado.widget.RowListDropDown", ATTRIBUTES: {
            property: {}, displayProperty: {}, columns: { writeBeforeReady: true }, dynaFilter: {}, editable: {
                getter: function () {
                    return this._editable || this._dynaFilter;
                }
            }, filterOnOpen: {}, filterOnTyping: { defaultValue: true }, minFilterInterval: { defaultValue: 240 }, useEmptyItem: { writeBeforeReady: true }
        }, EVENTS: { onFilterItems: {}, onFilterItem: {} }, constructor: function () {
            $import("list", dorado._NULL_FUNCTION);
            $invokeSuper.call(this, arguments);
        }, getSelectedValue: function () {
            var rowList = this.get("box.control");
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
        }, getEntityForAssignment: function () {
            var rowList = this.get("box.control");
            return rowList.getCurrentItem();
        }, createDropDownBox: function () {
            var dropDown = this, box = $invokeSuper.call(this, arguments), rowList;
            var config = {
                style: "border: none", onDataRowClick: function (self) {
                    self.set("highlightCurrentRow", dropDown._rowSelected = true);
                    dropDown.close(dropDown.getSelectedValue());
                }, onFilterItem: function (self, arg) {
                    if (arg && arg.criterions && arg.criterions.length > 0) {
                        arg.filterValue = arg.criterions[0].value;
                    }
                    dropDown.fireEvent("onFilterItem", dropDown, arg);
                }
            };
            if (this._columns) {
                if (!dorado.widget.Grid) {
                    throw new dorado.ResourceException("dorado.core.packageMissingError", "grid");
                }
                config.stretchColumnsMode = "stretchableColumns";
                config.columns = this._columns;
                config.readOnly = true;
                rowList = new dorado.widget.Grid(config);
            } else {
                rowList = new dorado.widget.ListBox(config);
            }
            box.set({ control: rowList });
            return box;
        }, initDropDownData: function (box, editor) {
            var rowList = box.get("control");
            var items = this.getDropDownItems() || [];
            if (rowList instanceof dorado.widget.AbstractListBox) {
                rowList.set("property", this._displayProperty || this._property);
            }
            rowList.set("items", items);
            var text = editor.doGetText();
            if (text && text.length > 0 && this._filterOnOpen) {
                this.onFilterItems(text);
            }
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
        }, initDropDownBox: function (box, editor) {
            $invokeSuper.call(this, arguments);
            var rowList = box.get("control");
            if (!this._boxVisible && this.initDropDownData) {
                rowList._ignoreRefresh++;
                this.initDropDownData(box, editor);
                rowList._ignoreRefresh--;
            }
            rowList.set("highlightCurrentRow", this._rowSelected = !!rowList.getCurrentItem());
            var itemCount = rowList._itemModel.getItemCount();
            var cellCount = itemCount;
            if (dorado.widget.AbstractGrid && rowList instanceof dorado.widget.AbstractGrid) {
                cellCount = rowList.get("dataColumns").length * itemCount;
            }
            if (!this._height) {
                var useMaxHeight = true, refreshed = false;
                if (this._realMaxHeight && (!itemCount || (this._realMaxHeight / (rowList._rowHeight + 1) > (itemCount + 1)))) {
                    rowList.set({ height: "auto", scrollMode: "simple" });
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
                    rowList.set({ height: this._realMaxHeight - (this._edgeHeight || 0), scrollMode: ((cellCount > 300) ? "viewport" : "lazyRender") });
                    rowList._forceRefresh = true;
                    rowList.refresh();
                    rowList._forceRefresh = false;
                    refreshed = true;
                }
                if (!refreshed) {
                    rowList.refresh();
                }
            } else {
                rowList.set({ height: this._height - (this._edgeHeight || 0), scrollMode: ((cellCount > 300) ? "viewport" : "lazyRender") });
                rowList.refresh();
            }
        }, onDropDownBoxShow: function () {
            var rowList = this.get("box.control");
            var editor = this._editor;
            if (this._dynaFilter && editor instanceof dorado.widget.AbstractTextBox) {
                var dropDown = this;
                editor.bind("onTextEdit._filter", function () {
                    if (dropDown._filterOnTyping && dropDown.get("opened")) {
                        dorado.Toolkits.setDelayedAction(dropDown, "$filterTimeId", function () {
                            if (!dropDown._rowSelected) {
                                dropDown.onFilterItems(editor.doGetText());
                            }
                        }, dropDown._minFilterInterval);
                    }
                });
            }
        }, open: function (editor) {
            $invokeSuper.call(this, arguments);
            if (this._dynaFilter && !this._filterOnTyping) {
                var triggers = editor.get("trigger");
                if (!(triggers instanceof Array)) {
                    triggers = [triggers];
                }
                var resetFilterTrigger = getDropDownResetFilterTrigger();
                var filterTrigger = getDropDownFilterTrigger();
                triggers.insert(resetFilterTrigger);
                triggers.insert(filterTrigger);
                resetFilterTrigger._dropDown = this;
                filterTrigger._dropDown = this;
                editor.set("trigger", triggers);
            }
        }, close: function (selectedValue) {
            var editor = this._editor;
            if (this._dynaFilter && !this._filterOnTyping) {
                var triggers = editor.get("trigger");
                if (!(triggers instanceof Array)) {
                    triggers = [triggers];
                }
                var resetFilterTrigger = getDropDownResetFilterTrigger();
                var filterTrigger = getDropDownFilterTrigger();
                triggers.remove(filterTrigger);
                triggers.remove(resetFilterTrigger);
                filterTrigger._dropDown = null;
                resetFilterTrigger._dropDown = null;
                editor.set("trigger", triggers);
            }
            if (editor instanceof dorado.widget.AbstractTextBox) {
                editor.unbind("onTextEdit._filter");
            }
            $invokeSuper.call(this, arguments);
        }, onFilterItems: function (filterValue) {
            var rowList = this.get("box.control");
            if (!rowList) {
                return;
            }
            /*2016-07-13 曹雪原 
                上一版本 filterOperator:"like*" 表示向后模糊查找
                改为 like  变成全部模糊查找
            */
            var arg = { filterOperator: "like", filterValue: filterValue, processDefault: true };
            this.fireEvent("onFilterItems", this, arg);
            if (!arg.processDefault) {
                return;
            }
            var realFilterValue;
            if (filterValue != arg.filterValue) {
                realFilterValue = arg.filterValue;
            } else {
                if (filterValue) {
                    realFilterValue = filterValue.toLowerCase();
                }
            }
            var filterParams;
            if (realFilterValue && filterValue.length > 0) {
                var property = this._displayProperty || this._property;
                filterParams = [{ property: property, operator: arg.filterOperator, value: realFilterValue }];
            }
            rowList.set("highlightCurrentRow", this._rowSelected = false);
            rowList.filter(filterParams);
            var box = this.get("box");
            if (box && box.get("visible")) {
                this.locate();
            }
        }, doOnEditorKeyDown: function (editor, evt) {
            function assignValue(dropdown, rowList) {
                var property = dropdown._displayProperty || dropdown._property;
                var value = rowList.getCurrentItem();
                if (value && property) {
                    if (value instanceof dorado.Entity) {
                        value = value.get(property);
                    } else {
                        value = value[property];
                    }
                }
                var eventArg = { editor: editor, selectedValue: value, processDefault: true };
                dropdown.fireEvent("onValueSelect", dropdown, eventArg);
                var entityForAssignment;
                if (dropdown.getEntityForAssignment) {
                    entityForAssignment = dropdown.getEntityForAssignment();
                }
                if (eventArg.processDefault && eventArg.selectedValue !== undefined) {
                    dropdown.assignValue(editor, entityForAssignment, eventArg);
                }
            }
            var dropdown = this, retValue = true;
            if (this.get("opened")) {
                var rowList = this.get("box.control");
                switch (evt.keyCode) {
                    case 38:
                    case 40:
                        if (!rowList._highlightCurrentRow) {
                            rowList.set("highlightCurrentRow", dropdown._rowSelected = true);
                            assignValue(dropdown, rowList);
                            retValue = false;
                        } else {
                            rowList.addListener("onCurrentChange", function () {
                                assignValue(dropdown, rowList);
                            }, { once: true });
                            retValue = rowList.onKeyDown(evt);
                        }
                        break;
                    case 13:
                        this.close(this.getSelectedValue());
                        retValue = false;
                        break;
                    case 27:
                        this.close();
                        retValue = false;
                        break;
                    default:
                        if (dropdown._rowSelected) {
                            rowList = dropdown.get("box.control");
                            rowList.set("highlightCurrentRow", dropdown._rowSelected = false);
                        }
                        retValue = rowList.onKeyDown(evt);
                }
            }
            if (retValue) {
                retValue = $invokeSuper.call(this, arguments);
            }
            return retValue;
        }
    });
    dorado.widget.ListDropDown = $extend(dorado.widget.RowListDropDown, {
        $className: "dorado.widget.ListDropDown", ATTRIBUTES: {
            items: {
                setter: function (items) {
                    if (this._useEmptyItem) {
                        if (items instanceof Array) {
                            var emptyItem = items[0];
                            if (!emptyItem || !emptyItem.isEmptyItem) {
                                items.insert({ isEmptyItem: true }, 0);
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
                                    items = [{ isEmptyItem: true }];
                                }
                            }
                        }
                    }
                    this._items = items;
                }
            }
        }, constructor: function (configs) {
            var items = configs.items;
            delete configs.items;
            $invokeSuper.call(this, [configs]);
            if (items) {
                this.set("items", items);
            }
        }, getDropDownItems: function () {
            return this._items;
        }
    });
    dorado.widget.AutoMappingDropDown = $extend(dorado.widget.RowListDropDown, {
        $className: "dorado.widget.AutoMappingDropDown", ATTRIBUTES: { dynaFilter: { defaultValue: true } }, getDropDownItems: function () {
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
                items.insert({ key: null, value: null }, "begin");
            }
            return items;
        }
    });
    dorado.widget.View.registerDefaultComponent("autoMappingDropDown1", function () {
        return new dorado.widget.AutoMappingDropDown();
    });
    dorado.widget.View.registerDefaultComponent("autoMappingDropDown2", function () {
        return new dorado.widget.AutoMappingDropDown({ useEmptyItem: true });
    });
    dorado.widget.View.registerDefaultComponent("autoOpenMappingDropDown1", function () {
        return new dorado.widget.AutoMappingDropDown({ autoOpen: true });
    });
    dorado.widget.View.registerDefaultComponent("autoOpenMappingDropDown2", function () {
        return new dorado.widget.AutoMappingDropDown({ autoOpen: true, useEmptyItem: true });
    });
})();
dorado.widget.DataSetDropDown = $extend(dorado.widget.ListDropDown, {
    $className: "dorado.widget.DataSetDropDown", ATTRIBUTES: { dataSet: { componentReference: true }, dataPath: {}, useDataBinding: { defaultValue: true }, filterMode: { defaultValue: "serverSide" }, reloadDataOnOpen: {}, dynaFilter: {}, filterOnTyping: { defaultValue: false } }, EVENTS: { onSetFilterParameter: {} }, open: function (editor) {
        var dropdown = this, dataSet = dropdown._dataSet, superClass = $getSuperClass();
        var doOpen = function (flush) {
            if (dropdown._useDataBinding) {
                if (dropdown._useDataBinding && dropdown._useEmptyItem) {
                    dataSet.bind("onLoadData._insertEmptyItem", function (self, arg) {
                        if (arg.pageNo == 1) {
                            var items = self.getData(self._dataPath);
                            if (items instanceof dorado.EntityList) {
                                var emptyItem = items.insert(null, "begin");
                                emptyItem.isEmptyItem = true;
                            }
                        }
                    });
                }
                dataSet.bind("onLoadData._relocate", function () {
                    if (dropdown._duringShowAnimation) {
                        dropdown._shouldRelocate = true;
                    } else {
                        dropdown.locate();
                    }
                });
                dropdown.bind("onClose", function () {
                    if (dropdown._useDataBinding && dropdown._useEmptyItem) {
                        dataSet.unbind("onLoadData._insertEmptyItem");
                    }
                    dataSet.unbind("onLoadData._relocate");
                }, { once: true });
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
            }, { loadMode: "always", flush: flush });
        };
        if (this._useDataBinding && this._filterOnOpen) {
            var filterValue = (this._lastFilterValue) ? this._lastFilterValue : editor.get("text");
            this.onFilterItems(filterValue, function () {
                doOpen(false);
            });
        } else {
            var lastFilterValue;
            if (this._filterOnOpen) {
                lastFilterValue = this._lastFilterValue;
            } else {
                delete this._lastFilterValue;
                dataSet._sysParameter && dataSet._sysParameter.remove("filterValue");
            }
            doOpen(this._reloadDataOnOpen || lastFilterValue != null);
        }
    }, createDropDownBox: function () {
        if (this._useDataBinding) {
            var dropDown = this, box = dorado.widget.DropDown.prototype.createDropDownBox.call(this), rowList;
            var config = {
                dataSet: this._dataSet, dataPath: this._dataPath, style: "border: none", onDataRowClick: function (rowList) {
                    rowList.set("highlightCurrentRow", dropDown._rowSelected = true);
                    dropDown.close(dropDown.getSelectedValue());
                }, onFilterItem: function (rowList, arg) {
                    if (arg && arg.criterions && arg.criterions.length > 0) {
                        arg.filterValue = arg.criterions[0].value;
                    }
                    dropDown.fireEvent("onFilterItem", dropDown, arg);
                }
            };
            if (this._columns) {
                config.stretchColumnsMode = "stretchableColumns";
                config.columns = this._columns;
                config.readOnly = true;
                rowList = new dorado.widget.DataGrid(config);
            } else {
                config.width = "100%";
                rowList = new dorado.widget.DataListBox(config);
            }
            box.set({ style: { overflow: "hidden" }, control: rowList });
            return box;
        } else {
            return $invokeSuper.call(this, arguments);
        }
    }, initDropDownData: function (box, editor) {
        if (!this._useDataBinding) {
            $invokeSuper.call(this, arguments);
        } else {
            var rowList = box.get("control");
            if (rowList instanceof dorado.widget.AbstractListBox) {
                rowList.set("property", this._displayProperty || this._property);
            }
        }
    }, getDropDownItems: function () {
        return this._items;
    }, onFilterItems: function (filterValue, callback) {
        var dataSet = this._dataSet;
        if (this._useDataBinding) {
            var arg = { filterValue: filterValue, processDefault: true };
            this.fireEvent("onFilterItems", this, arg);
            if (arg.processDefault) {
                if (this._filterMode == "clientSide") {
                    $invokeSuper.call(this, [filterValue, callback]);
                    this._lastFilterValue = filterValue;
                } else {
                    arg = { dataSet: dataSet, filterValue: filterValue };
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
    }, onDropDownBoxShow: function () {
        if (this._useDataBinding) {
            var filterOnOpen = this._filterOnOpen;
            this._filterOnOpen = false;
            $invokeSuper.call(this, arguments);
            this._filterOnOpen = filterOnOpen;
        } else {
            $invokeSuper.call(this, arguments);
        }
    }, doOnEditorKeyDown: function (editor, evt) {
        if (evt.keyCode == 13 && this.get("dynaFilter")) {
            var filterValue = editor.get("text");
            if (!this._rowSelected && (this._lastFilterValue || "") != filterValue) {
                this.onFilterItems(filterValue);
                return false;
            }
        }
        return $invokeSuper.call(this, arguments);
    }
});
dorado.widget.CustomDropDown = $extend(dorado.widget.DropDown, {
    $className: "dorado.widget.CustomDropDown", ATTRIBUTES: {
        control: { writeBeforeReady: true, innerComponent: "" }, view: {
            setter: function (view) {
                if (this._view == view) {
                    return;
                }
                $invokeSuper.call(this, [view]);
                if (view && this._control) {
                    this._control.set("view", view);
                }
            }
        }
    }, createDropDownBox: function () {
        var box = $invokeSuper.call(this, arguments);
        var control = this._control;
        box.set("control", control);
        box.bind("beforeShow", function () {
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
    }
});
(function () {
    dorado.widget.NumberGridPicker = $extend(dorado.widget.Control, {
        $className: "dorado.widget.NumberGridPicker", focusable: true, ATTRIBUTES: { className: {}, formatter: {}, columnCount: { writeBeforeReady: true }, rowCount: { writeBeforeReady: true }, cellClassName: { writeBeforeReady: true }, selectedCellClassName: { writeBeforeReady: true }, rowClassName: { writeBeforeReady: true }, tableClassName: { writeBeforeReady: true }, min: {}, max: {}, step: {}, value: {} }, EVENTS: { onPick: {} }, createDom: function () {
            var picker = this, min = picker._min === undefined ? 1 : picker._min, max = picker._max, step = picker._step || 1, columnCount = picker._columnCount || 1, rowCount = picker._rowCount || 1, doms = {};
            var dom = $DomUtils.xCreate({ tagName: "table", className: (picker._className || "") + " " + (picker._tableClassName || ""), content: { tagName: "tbody", contextKey: "body" } }, null, doms);
            picker._doms = doms;
            var formatter = picker._formatter;
            for (var i = 0; i < rowCount; i++) {
                var tr = document.createElement("tr");
                for (var j = 0; j < columnCount; j++) {
                    var td = document.createElement("td"), value = min + step * (i * columnCount + j);
                    td.className = picker._cellClassName || "";
                    if (typeof formatter == "function") {
                        td.innerText = formatter(value);
                    } else {
                        td.innerText = value;
                    }
                    tr.appendChild(td);
                }
                tr.className = picker._rowClassName || "";
                doms.body.appendChild(tr);
            }
            $fly(dom).click(function (event) {
                var position = $DomUtils.getCellPosition(event), step = picker._step || 1;
                if (position && position.element) {
                    if (position.row >= picker._rowCount) {
                        return;
                    }
                    var min = picker._min === undefined ? 1 : picker._min, step = step = picker._step || 1, value = min + step * (position.row * columnCount + position.column);
                    picker._value = value;
                    picker.fireEvent("onPick", picker, { value: value });
                    picker.refreshValue();
                }
            });
            return dom;
        }, refreshTable: function () {
            var picker = this, dom = picker._doms.body, formatter = picker._formatter;
            var step = picker._step || 1, min = picker._min === undefined ? 1 : picker._min, columnCount = picker._columnCount, rowCount = picker._rowCount, row = Math.floor((value - min) / columnCount), column = (value - min) % columnCount;
            for (var i = 0; i < rowCount; i++) {
                var rows = dom.rows[i];
                for (var j = 0; j < columnCount; j++) {
                    var cell = rows.cells[j], value = min + step * (i * columnCount + j);
                    cell.className = picker._cellClassName || "";
                    if (typeof formatter == "function") {
                        cell.innerText = formatter(value);
                    } else {
                        cell.innerText = value;
                    }
                }
            }
        }, refreshValue: function () {
            var picker = this, dom = picker._doms.body, lastSelectedCell = picker._lastSelectedCell, value = picker._value;
            if (isNaN(picker._value)) {
                return;
            }
            var step = picker._step || 1, min = picker._min === undefined ? 1 : picker._min, columnCount = picker._columnCount, rowCount = picker._rowCount, row = Math.floor((value - min) / columnCount), column = (value - min) % columnCount, cell;
            if (dom.rows[row]) {
                cell = dom.rows[row].cells[column];
            } else {
                return;
            }
            if (lastSelectedCell) {
                $fly(lastSelectedCell).removeClass(picker._selectedCellClassName || "selected");
            }
            if (cell) {
                $fly(cell).addClass(picker._selectedCellClassName || "selected");
            }
            picker._lastSelectedCell = cell;
        }, refreshDom: function (dom) {
            $invokeSuper.call(this, arguments);
            this.refreshTable();
            this.refreshValue();
        }
    });
    dorado.widget.MonthPicker = $extend(dorado.widget.NumberGridPicker, {
        focusable: true, ATTRIBUTES: { height: { independent: true, readOnly: true }, className: { defaultValue: "d-month-picker" }, rowCount: { defaultValue: 6 }, min: { defaultValue: 0 }, max: { defaultValue: 11 }, columnCount: { defaultValue: 2 }, tableClassName: { defaultValue: "month-table" }, rowClassName: { defaultValue: "number-row" }, value: {} }, createDom: function () {
            var monthLabel = $resource("dorado.baseWidget.AllMonths") || $resource("dorado.core.AllMonths") || "", monthLabels = monthLabel.split(",");
            this._formatter = function (value) {
                return monthLabels[value];
            };
            return $invokeSuper.call(this, arguments);
        }, doOnKeyDown: function (event) {
            var picker = this, month = picker.get("value");
            switch (event.keyCode) {
                case 37:
                    picker.set("value", month == 0 ? 11 : month - 1);
                    break;
                case 39:
                    picker.set("value", month == 11 ? 0 : month + 1);
                    break;
                case 13:
                    picker.fireEvent("onPick", picker);
                    return false;
            }
        }
    });
    dorado.widget.YearPicker = $extend(dorado.widget.NumberGridPicker, {
        focusable: true, ATTRIBUTES: {
            height: { independent: true, readOnly: true }, className: { defaultValue: "d-year-picker" }, rowCount: { defaultValue: 5 }, columnCount: { defaultValue: 2 }, tableClassName: { defaultValue: "year-table" }, rowClassName: { defaultValue: "number-row" }, value: {
                setter: function (value) {
                    var picker = this, oldValue = picker._value, startYear, remainder;
                    remainder = value % 10;
                    picker._min = value - (remainder == 0 ? 10 : remainder) + 1;
                    picker._value = value;
                }
            }
        }, createDom: function () {
            var picker = this, dom = $invokeSuper.call(picker, arguments);
            var preYearButton = new dorado.widget.SimpleIconButton({
                iconClass: "prev-year-button", onClick: function () {
                    picker.set("value", picker._value - 10);
                }
            });
            var nextYearButton = new dorado.widget.SimpleIconButton({
                iconClass: "next-year-button", onClick: function () {
                    picker.set("value", picker._value + 10);
                }
            });
            var buttonRow = document.createElement("tr"), prevYearCell = document.createElement("td"), nextYearCell = document.createElement("td");
            buttonRow.className = "btn-row";
            prevYearCell.align = "center";
            nextYearCell.align = "center";
            buttonRow.appendChild(prevYearCell);
            buttonRow.appendChild(nextYearCell);
            picker._doms.body.appendChild(buttonRow);
            preYearButton.render(prevYearCell);
            nextYearButton.render(nextYearCell);
            picker.registerInnerControl(preYearButton);
            picker.registerInnerControl(nextYearButton);
            return dom;
        }, doOnKeyDown: function (event) {
            var picker = this, year = picker.get("value");
            switch (event.keyCode) {
                case 38:
                    picker.set("value", year - 1);
                    break;
                case 40:
                    picker.set("value", year + 1);
                    break;
                case 33:
                    picker.set("value", year - 10);
                    break;
                case 34:
                    picker.set("value", year + 10);
                    break;
                case 13:
                    picker.fireEvent("onPick", picker);
                    return false;
            }
        }
    });
    dorado.widget.YearMonthPicker = $extend(dorado.widget.Control, {
        $className: "dorado.widget.YearMonthPicker", _opened: false, focusable: true, ATTRIBUTES: { height: { independent: true, readOnly: true }, className: { defaultValue: "d-year-month-picker" }, year: { defaultValue: (new Date).getFullYear(), path: "_yearTablePicker.value" }, month: { defaultValue: 0, path: "_monthTablePicker.value" } }, EVENTS: { onPick: {}, onCancel: {} }, updateDate: function (date, month) {
            var picker = this, year = date;
            if (date instanceof Date) {
                picker.set("year", date.getFullYear());
                picker.set("month", date.getMonth());
            } else {
                if (!isNaN(year) && !isNaN(month)) {
                    picker.set("year", year);
                    picker.set("month", month);
                }
            }
        }, createDom: function () {
            var monthLabel = $resource("dorado.baseWidget.AllMonths") || "", monthLabels = monthLabel.split(",");
            var picker = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", className: picker._className, content: [{ tagName: "div", className: "btns-pane", contextKey: "buttonPanel" }] }, null, doms);
            var monthLastOverCell, yearLastOverCell;
            picker._doms = doms;
            var monthTablePicker = new dorado.widget.MonthPicker({ value: picker._month || 0 });
            monthTablePicker.render(dom, doms.buttonPanel);
            doms.monthTable = monthTablePicker._dom;
            picker._monthTablePicker = monthTablePicker;
            picker.registerInnerControl(monthTablePicker);
            var yearTablePicker = new dorado.widget.YearPicker({ value: picker._year });
            yearTablePicker.render(dom, doms.monthTable);
            doms.yearTable = yearTablePicker._dom;
            picker._yearTablePicker = yearTablePicker;
            picker.registerInnerControl(yearTablePicker);
            var okButton = new dorado.widget.Button({
                caption: $resource("dorado.baseWidget.YMPickerConfirm"), ui: "highlight", onClick: function () {
                    picker.fireEvent("onPick", picker);
                }
            });
            okButton.render(doms.buttonPanel);
            var cancelButton = new dorado.widget.Button({
                caption: $resource("dorado.baseWidget.YMPickerCancel"), onClick: function () {
                    picker.fireEvent("onCancel", picker);
                }
            });
            cancelButton.render(doms.buttonPanel);
            picker.registerInnerControl(okButton);
            picker.registerInnerControl(cancelButton);
            return dom;
        }, doOnKeyDown: function (event) {
            var picker = this, year = picker.get("year"), month = picker.get("month");
            switch (event.keyCode) {
                case 37:
                    picker.set("month", month == 0 ? 11 : month - 1);
                    break;
                case 38:
                    picker.set("year", year - 1);
                    break;
                case 39:
                    picker.set("month", month == 11 ? 0 : month + 1);
                    break;
                case 40:
                    picker.set("year", year + 1);
                    break;
                case 33:
                    picker.set("year", year - 10);
                    break;
                case 34:
                    picker.set("year", year + 10);
                    break;
                case 13:
                    picker.fireEvent("onPick", picker);
                    return false;
            }
        }
    });
    dorado.widget.YearDropDown = $extend(dorado.widget.DropDown, {
        $className: "dorado.widget.YearDropDown", focusable: true, ATTRIBUTES: { width: { defaultValue: 150 }, iconClass: { defaultValue: "d-trigger-icon-date" } }, createDropDownBox: function (editor) {
            var dropDown = this, box = $invokeSuper.call(this, arguments), picker = new dorado.widget.YearPicker({
                onPick: function () {
                    dropDown.close(picker.get("value"));
                }
            });
            box.set("control", picker);
            return box;
        }, doOnEditorKeyDown: function (editor, evt) {
            var dropdown = this, retValue = true, yearPicker = dropdown.get("box.control");
            switch (evt.keyCode) {
                case 27:
                    dropdown.close();
                    retValue = false;
                    break;
                case 13:
                    yearPicker.fireEvent("onPick", yearPicker);
                    retValue = false;
                    break;
                default:
                    retValue = yearPicker.onKeyDown(evt);
            }
            return retValue;
        }, initDropDownBox: function (box, editor) {
            var dropDown = this, picker = dropDown.get("box.control");
            if (picker) {
                var value = parseInt(editor.get("value"), 10);
                if (!isNaN(value)) {
                    picker.set("value", value);
                } else {
                    picker.set("value", new Date().getFullYear());
                }
            }
        }
    });
    dorado.widget.View.registerDefaultComponent("defaultYearDropDown", function () {
        return new dorado.widget.YearDropDown();
    });
    dorado.widget.MonthDropDown = $extend(dorado.widget.DropDown, {
        $className: "dorado.widget.MonthDropDown", focusable: true, ATTRIBUTES: { width: { defaultValue: 150 }, iconClass: { defaultValue: "d-trigger-icon-date" } }, createDropDownBox: function (editor) {
            var dropDown = this, box = $invokeSuper.call(this, arguments), picker = new dorado.widget.MonthPicker({
                onPick: function (self) {
                    dropDown.close(self.get("value"));
                }
            });
            box.set("control", picker);
            return box;
        }, doOnEditorKeyDown: function (editor, event) {
            var dropDown = this, retValue = true, yearPicker = dropDown.get("box.control");
            if (this.get("opened")) {
                switch (event.keyCode) {
                    case 27:
                        dropDown.close();
                        retValue = false;
                        break;
                    case 13:
                        yearPicker.fireEvent("onPick", yearPicker);
                        retValue = false;
                        break;
                    default:
                        retValue = yearPicker.onKeyDown(event);
                }
            }
            return retValue;
        }, initDropDownBox: function (box, editor) {
            var dropDown = this, picker = dropDown.get("box.control");
            if (picker) {
                var value = parseInt(editor.get("value"), 10);
                if (!isNaN(value)) {
                    picker.set("value", value);
                } else {
                    picker.set("value", 0);
                }
            }
        }
    });
    dorado.widget.View.registerDefaultComponent("defaultMonthDropDown", function () {
        return new dorado.widget.MonthDropDown();
    });
    dorado.widget.YearMonthDropDown = $extend(dorado.widget.DropDown, {
        $className: "dorado.widget.YearMonthDropDown", ATTRIBUTES: { width: { defaultValue: 260 }, iconClass: { defaultValue: "d-trigger-icon-date" } }, createDropDownBox: function (editor) {
            var dropDown = this, box = $invokeSuper.call(this, arguments), picker = new dorado.widget.YearMonthPicker({
                onPick: function (self) {
                    var retval = new Date(self.get("year"), self.get("month"));
                    retval.year = self.get("year");
                    retval.month = self.get("month");
                    dropDown.close(retval);
                }, onCancel: function () {
                    dropDown.close();
                }
            });
            box.set("control", picker);
            return box;
        }, doOnEditorKeyDown: function (editor, event) {
            var dropDown = this, retValue = true, ymPicker = dropDown.get("box.control");
            if (this.get("opened")) {
                switch (event.keyCode) {
                    case 27:
                        dropDown.close();
                        retValue = false;
                        break;
                    case 13:
                        ymPicker.fireEvent("onPick", ymPicker);
                        retValue = false;
                        break;
                    default:
                        retValue = ymPicker.onKeyDown(event);
                }
            }
            return retValue;
        }
    });
    dorado.widget.View.registerDefaultComponent("defaultYearMonthDropDown", function () {
        return new dorado.widget.YearMonthDropDown();
    });
})();
(function () {
    var DateHelper = {
        getWeekCountOfYear: function (date) {
            var begin = new Date(date.getFullYear(), 0, 1);
            var day = begin.getDay();
            if (day == 0) {
                day = 7;
            }
            var duration = date.getTime() - begin.getTime() + (day - 1) * 3600 * 24 * 1000;
            return Math.ceil(duration / 3600 / 24 / 1000 / 7);
        }, getDayCountOfMonth: function (year, month) {
            if (month == 3 || month == 5 || month == 8 || month == 10) {
                return 30;
            }
            if (month == 1) {
                if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
                    return 29;
                } else {
                    return 28;
                }
            }
            return 31;
        }, getFirstDayOfMonth: function (date) {
            var temp = new Date(date.getTime());
            temp.setDate(1);
            return temp.getDay();
        }
    };
    var CELL_UNSELECTABLE_CLASS = "unselectable", CELL_SELECTED_CLASS = "selected-date", PREV_MONTH_CLASS = "pre-month", NEXT_MONTH_CLASS = "next-month";
    dorado.widget.DatePicker = $extend(dorado.widget.Control, {
        $className: "dorado.widget.DatePicker", focusable: true, ATTRIBUTES: {
            width: { independent: true, readOnly: true }, height: { independent: true, readOnly: true }, className: { defaultValue: "d-date-picker" }, date: {
                defaultValue: function () {
                    return new Date();
                }, setter: function (value) {
                    this._date = value;
                    this.refreshButtonOnFilterDate();
                }
            }, selectionMode: { defaultValue: "singleDate", skipRefresh: true, writeBeforeReady: true }, selection: {
                getter: function () {
                    if (this._selection) {
                        return this._selection;
                    } else {
                        return ("multiDate" == this._selectionMode) ? [] : this._date;
                    }
                }, setter: function (selection) {
                    if (selection == null && this._selectionMode == "multiDate") {
                        selection = [];
                    }
                    this._selection = selection;
                }
            }, showTimeSpinner: { defaultValue: false }, showTodayButton: { defaultValue: true }, showClearButton: { defaultValue: true }, showCancelButton: { defaultValue: false }, showConfirmButton: { defaultValue: true }, yearMonthFormat: {}
        }, EVENTS: { onPick: {}, onClear: {}, onConfirm: {}, onCancel: {}, onRefreshDateCell: {}, onFilterDate: {} }, addSelection: function (date) {
            var selection = this._selection;
            if (!selection) {
                selection = this._selection = [];
            }
            selection.push(date);
        }, removeSelection: function (date) {
            var selection = this._selection;
            if (!selection || !date) {
                return;
            }
            var targetIndex = null;
            selection.forEach(function (item, index) {
                if (item && item.getTime() == date.getTime()) {
                    targetIndex = index;
                }
            });
            if (targetIndex) {
                selection.removeAt(targetIndex);
            }
        }, clearSelections: function () {
            var selection = this._selection;
            this._selection = [];
            this.refreshDate();
        }, setYear: function (year, refresh, animate) {
            var picker = this, date = picker._date, oldDay = date.getDate(), oldMonth = date.getMonth(), oldYear = date.getFullYear();
            var source = new Date(date.getTime());
            if (year == "prev") {
                year = oldYear - 1;
            } else {
                if (year == "next") {
                    year = oldYear + 1;
                }
            }
            if (oldMonth == 1 && oldDay == 29) {
                var newMonthDay = DateHelper.getDayCountOfMonth(year, date.getMonth());
                if (oldDay > newMonthDay) {
                    date.setDate(newMonthDay);
                }
            }
            date.setFullYear(year);
            if (refresh) {
                if (animate === false) {
                    picker.refresh();
                } else {
                    picker.doMonthAnimate(source, date);
                }
            }
            picker.refreshButtonOnFilterDate();
        }, getMonthAnimateType: function (source, target) {
            if (source && target) {
                var syear = source.getFullYear(), tyear = target.getFullYear(), smonth = source.getMonth(), tmonth = target.getMonth();
                if (syear == tyear && smonth == tmonth) {
                    return null;
                }
                if (syear == tyear) {
                    return smonth > tmonth ? "r2l" : "l2r";
                } else {
                    return syear > tyear ? "t2b" : "b2t";
                }
            }
            return null;
        }, doMonthAnimate: function (source, target) {
            var picker = this, animateType = picker.getMonthAnimateType(source, target);
            if (picker._doMonthAnimating) {
                return;
            }
            if (animateType == null) {
                picker.refresh();
                return;
            }
            var dateTable = picker._doms.dateTable, dateBlock = picker._doms.dateBlock, dateTableWidth = dateBlock.offsetWidth, dateTableHeight = dateBlock.offsetHeight;
            var sourceRegion, targetRegion, style, animConfig;
            switch (animateType) {
                case "l2r":
                    sourceRegion = 1;
                    targetRegion = 2;
                    style = { width: dateTableWidth * 2, left: 0, top: 0 };
                    animConfig = { left: -1 * dateTableWidth };
                    break;
                case "r2l":
                    sourceRegion = 2;
                    targetRegion = 1;
                    style = { width: dateTableWidth * 2, left: -1 * dateTableWidth, top: 0 };
                    animConfig = { left: 0 };
                    break;
                case "b2t":
                    sourceRegion = 1;
                    targetRegion = 3;
                    style = { width: dateTableWidth * 2, left: 0, top: 0 };
                    animConfig = { top: -1 * dateTableHeight };
                    break;
                case "t2b":
                    sourceRegion = 3;
                    targetRegion = 1;
                    style = { width: dateTableWidth * 2, left: 0, top: -1 * dateTableHeight };
                    animConfig = { top: 0 };
                    break;
            }
            picker.refreshDate(source, sourceRegion);
            picker.refreshDate(target, targetRegion);
            $fly(dateTable).css(style);
            picker._visibleDateRegion = targetRegion;
            picker._doMonthAnimating = true;
            $fly(dateTable).animate(animConfig, {
                complete: function () {
                    picker._doMonthAnimating = false;
                    picker.refreshYearMonth();
                }
            });
        }, setMonth: function (month, refresh, animate) {
            var picker = this, date = picker._date, oldDay = date.getDate(), oldYear = date.getFullYear(), oldMonth = date.getMonth();
            var source = new Date(date.getTime());
            if (month == "prev") {
                if (oldMonth != 0) {
                    month = oldMonth - 1;
                } else {
                    picker.setYear(oldYear - 1);
                    month = 11;
                }
            } else {
                if (month == "next") {
                    if (oldMonth != 11) {
                        month = oldMonth + 1;
                    } else {
                        picker.setYear(oldYear + 1);
                        month = 0;
                    }
                }
            }
            if (oldDay >= 29) {
                var newMonthDay = DateHelper.getDayCountOfMonth(oldYear, month);
                if (oldDay > newMonthDay) {
                    date.setDate(newMonthDay);
                }
            }
            date.setMonth(month);
            if (refresh) {
                if (animate === false) {
                    picker.refresh();
                } else {
                    picker.doMonthAnimate(source, date);
                }
            }
            picker.refreshButtonOnFilterDate();
        }, setDate: function (day, refresh) {
            var picker = this, date = picker._date;
            switch (day) {
                case "next":
                    date.setDate(date.getDate() + 1);
                    break;
                case "prev":
                    date.setDate(date.getDate() - 1);
                    break;
                case "nextweek":
                    date.setDate(date.getDate() + 7);
                    break;
                case "prevweek":
                    date.setDate(date.getDate() - 7);
                    break;
                default:
                    if (!isNaN(day)) {
                        date.setDate(day);
                    }
                    break;
            }
            if (refresh) {
                picker.refresh();
            }
            picker.refreshButtonOnFilterDate();
        }, refreshButtonOnFilterDate: function () {
            if (this.isActualVisible()) {
                if (this._todayButton) {
                    this._todayButton.set("disabled", !this.isDateSelectable(new Date()));
                }
                if (this._confirmButton) {
                    this._confirmButton.set("disabled", !this.isDateSelectable(this._date));
                }
            }
        }, refreshDateCell: function (date, cell) {
            var picker = this;
            picker.fireEvent("onRefreshDateCell", picker, { date: date, cell: cell });
            var selectable = picker.isDateSelectable(date);
            if (selectable) {
                $fly(cell).removeClass(CELL_UNSELECTABLE_CLASS);
            } else {
                $fly(cell).addClass(CELL_UNSELECTABLE_CLASS);
            }
            if (picker._selectionMode == "multiDate") {
                var selection = this._selection;
                if (!selection || !date) {
                    return;
                }
                var targetIndex = null;
                selection.forEach(function (item, index) {
                    if (item && item.getTime() == date.getTime()) {
                        targetIndex = index;
                    }
                });
                if (targetIndex != null) {
                    $fly(cell).addClass(CELL_SELECTED_CLASS);
                } else {
                    $fly(cell).removeClass(CELL_SELECTED_CLASS);
                }
            }
        }, isDateSelectable: function (date) {
            var picker = this, filterArg = { date: date, selectable: true };
            picker.fireEvent("onFilterDate", picker, filterArg);
            return filterArg.selectable;
        }, refreshDate: function (target, region) {
            var picker = this, doms = picker._doms, date = target || picker._date, count = 1, day = DateHelper.getFirstDayOfMonth(date), maxDay = DateHelper.getDayCountOfMonth(date.getFullYear(), date.getMonth()), dateTable = doms.dateTable, selectDay = date.getDate(), lastMonthDay = DateHelper.getDayCountOfMonth(date.getFullYear(), (date.getMonth() == 0 ? 11 : date.getMonth() - 1));
            day = (day == 0 ? 7 : day);
            var isSingleSelect = picker._selectionMode != "multiDate";
            var startI = 0, startJ = 0;
            region = region || picker._visibleDateRegion;
            switch (region) {
                case 2:
                    startJ = 7;
                    break;
                case 3:
                    startI = 6;
                    break;
                case 4:
                    startI = 6;
                    startJ = 7;
                    break;
            }
            for (var i = startI; i < startI + 6; i++) {
                for (var j = startJ; j < startJ + 7; j++) {
                    var cell = dateTable.rows[i].cells[j];
                    if (i == startI) {
                        if (j - startJ >= day) {
                            cell.innerHTML = count++;
                            this.refreshDateCell(new Date(date.getFullYear(), date.getMonth(), parseInt(cell.innerHTML, 10)), cell);
                            if (isSingleSelect) {
                                if (count - 1 == selectDay) {
                                    if (!$fly(cell).hasClass(CELL_UNSELECTABLE_CLASS)) {
                                        cell.className = CELL_SELECTED_CLASS;
                                    } else {
                                        cell.className = CELL_UNSELECTABLE_CLASS;
                                    }
                                } else {
                                    $fly(cell).removeClass(CELL_SELECTED_CLASS).removeClass(NEXT_MONTH_CLASS).removeClass(PREV_MONTH_CLASS);
                                }
                            }
                        } else {
                            cell.innerHTML = lastMonthDay - (day - j % 7) + 1;
                            cell.className = PREV_MONTH_CLASS;
                            this.refreshDateCell(new Date(date.getFullYear(), date.getMonth() - 1, parseInt(cell.innerHTML, 10)), cell);
                        }
                    } else {
                        if (count <= maxDay) {
                            cell.innerHTML = count++;
                            this.refreshDateCell(new Date(date.getFullYear(), date.getMonth(), parseInt(cell.innerHTML, 10)), cell);
                            if (isSingleSelect) {
                                if (count - 1 == selectDay) {
                                    if (!$fly(cell).hasClass(CELL_UNSELECTABLE_CLASS)) {
                                        cell.className = CELL_SELECTED_CLASS;
                                    } else {
                                        cell.className = CELL_UNSELECTABLE_CLASS;
                                    }
                                } else {
                                    $fly(cell).removeClass(CELL_SELECTED_CLASS).removeClass(NEXT_MONTH_CLASS).removeClass(PREV_MONTH_CLASS);
                                }
                            }
                        } else {
                            cell.innerHTML = count++ - maxDay;
                            cell.className = NEXT_MONTH_CLASS;
                            this.refreshDateCell(new Date(date.getFullYear(), date.getMonth() + 1, parseInt(cell.innerHTML, 10)), cell);
                        }
                    }
                }
            }
        }, refreshYearMonth: function () {
            var picker = this, doms = picker._doms, date = picker._date;
            var format = this._yearMonthFormat || $setting["widget.datepicker.defaultYearMonthFormat"];
            doms.yearMonthLabel.innerHTML = format.replace("Y", date.getFullYear()).replace("m", date.getMonth() + 1);
        }, refreshSpinner: function () {
            var picker = this, spinner = picker._timeSpinner, date = picker._date;
            if (picker._showTimeSpinner && spinner) {
                spinner.set({ hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() });
            }
        }, refreshDom: function (dom) {
            var picker = this;
            picker.refreshDate();
            picker.refreshYearMonth();
            picker.refreshButtonOnFilterDate();
            if (picker._showTimeSpinner) {
                picker.doShowTimeSpinner();
                picker.refreshSpinner();
            } else {
                picker.doHideTimeSpinner();
            }
            $invokeSuper.call(this, arguments);
        }, createDom: function () {
            var allWeeks = $resource("dorado.baseWidget.AllWeeks") || $resource("dorado.core.AllWeeks") || "", weeks = allWeeks.split(",");
            var dateRows = [];
            for (var i = 0; i < 12; i++) {
                dateRows.push({ tagName: "tr", content: [{ tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }, { tagName: "td" }] });
            }
            var picker = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", content: [{ tagName: "div", className: "year-month-block", content: [{ tagName: "div", className: "pre-button-div", contextKey: "prevButtonDiv" }, { tagName: "div", className: "next-button-div", contextKey: "nextButtonDiv" }, { tagName: "div", className: "year-month-label", contextKey: "yearMonthLabel" }] }, { tagName: "table", cellPadding: 0, cellSpacing: 0, border: 0, className: "date-header", contextKey: "dateHeader", content: [{ tagName: "tr", className: "header", content: [{ tagName: "td", content: weeks[0] }, { tagName: "td", content: weeks[1] }, { tagName: "td", content: weeks[2] }, { tagName: "td", content: weeks[3] }, { tagName: "td", content: weeks[4] }, { tagName: "td", content: weeks[5] }, { tagName: "td", content: weeks[6] }] }] }, { tagName: "div", className: "date-block", contextKey: "dateBlock", content: { tagName: "table", cellPadding: 0, cellSpacing: 0, border: 0, className: "date-table", contextKey: "dateTable", content: dateRows } }, { contextKey: "buttonBlock", className: "button-block" }, { tagName: "div", contextKey: "spinnerBlock", className: "spinner-block" }] }, null, doms);
            picker._doms = doms;
            if (picker._showTodayButton) {
                var todayButton = new dorado.widget.Button({
                    caption: $resource("dorado.baseWidget.DatePickerToday"), listener: {
                        onClick: function () {
                            var now = new Date(), oldDate = picker._date;
                            picker.set("date", now);
                            if (now.getFullYear() === oldDate.getFullYear() && now.getMonth() === oldDate.getMonth()) {
                                picker.fireEvent("onPick", picker, { date: picker._showTimeSpinner ? new Date(now.getTime()) : new Date(now.getFullYear(), now.getMonth(), now.getDate()) });
                            }
                        }
                    }
                });
                todayButton.render(doms.buttonBlock);
                picker._todayButton = todayButton;
                picker.registerInnerControl(todayButton);
            }
            if (picker._showClearButton) {
                var clearButton = new dorado.widget.Button({
                    caption: $resource("dorado.baseWidget.DatePickerClear"), listener: {
                        onClick: function () {
                            picker.fireEvent("onClear", picker, {});
                        }
                    }
                });
                clearButton.render(doms.buttonBlock);
                picker.registerInnerControl(clearButton);
            }
            if (picker._showCancelButton) {
                var cancelButton = new dorado.widget.Button({
                    caption: $resource("dorado.baseWidget.DatePickerCancel"), listener: {
                        onClick: function () {
                            picker.fireEvent("onCancel", picker);
                        }
                    }
                });
                cancelButton.render(doms.buttonBlock);
                picker._cancelButton = cancelButton;
                picker.registerInnerControl(cancelButton);
            }
            if (picker._showConfirmButton) {
                var confirmButton = new dorado.widget.Button({
                    caption: $resource("dorado.baseWidget.DatePickerConfirm"), ui: "highlight", listener: {
                        onClick: function () {
                            var date, pickerDate = picker._date;
                            if (picker._showTimeSpinner && picker._timeSpinner) {
                                var spinner = picker._timeSpinner;
                                date = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), pickerDate.getDate(), spinner.get("hours"), spinner.get("minutes"), spinner.get("seconds"));
                            } else {
                                date = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), pickerDate.getDate());
                            }
                            picker.fireEvent("onConfirm", picker, { date: date });
                        }
                    }
                });
                confirmButton.render(doms.buttonBlock);
                picker._confirmButton = confirmButton;
                picker.registerInnerControl(confirmButton);
            }
            var dateTable = doms.dateTable;
            var isSingleSelect = picker._selectionMode != "multiDate";
            $fly(dateTable).click(function (event) {
                var position = $DomUtils.getCellPosition(event), element = position.element, date = picker._date;
                if (position && element) {
                    var className = element.className;
                    if (className.indexOf(CELL_UNSELECTABLE_CLASS) != -1) {
                        return;
                    }
                    if (className.indexOf("next-month") != -1) {
                        picker.setMonth(date.getMonth() + 1);
                    } else {
                        if (className.indexOf("pre-month") != -1) {
                            picker.setMonth(date.getMonth() - 1);
                        }
                    }
                    if (isSingleSelect) {
                        picker.setDate(parseInt(element.innerHTML, 10), true);
                        picker.fireEvent("onPick", picker, { date: new Date(date.getTime()) });
                    } else {
                        if (className.indexOf("next-month") != -1 || className.indexOf("pre-month") != -1) {
                            picker.setDate(parseInt(element.innerHTML, 10), true);
                            return;
                        }
                        var selectDate = new Date(date.getFullYear(), date.getMonth(), parseInt(element.innerHTML, 10));
                        if (className.indexOf(CELL_SELECTED_CLASS) != -1) {
                            picker.removeSelection(selectDate);
                            $fly(element).removeClass(CELL_SELECTED_CLASS);
                        } else {
                            picker.addSelection(selectDate);
                            $fly(element).addClass(CELL_SELECTED_CLASS);
                        }
                    }
                }
            }).dblclick(function (event) {
                if (picker._showTimeSpinner == false) {
                    return;
                }
                var position = $DomUtils.getCellPosition(event), element = position.element, date = picker._date;
                if (position && element) {
                    var className = element.className;
                    if (className.indexOf(CELL_UNSELECTABLE_CLASS) != -1) {
                        return;
                    }
                    if (className.indexOf("next-month") != -1 || className.indexOf("pre-month") != -1) {
                        return;
                    }
                    picker.setDate(parseInt(element.innerHTML, 10), true);
                    picker.fireEvent("onConfirm", picker, { date: new Date(date.getTime()) });
                }
            });
            var prevYearButton = new dorado.widget.SimpleIconButton({
                iconClass: "pre-year-button", listener: {
                    onClick: function () {
                        picker.setYear("prev", true);
                    }
                }
            });
            var prevMonthButton = new dorado.widget.SimpleIconButton({
                iconClass: "pre-month-button", listener: {
                    onClick: function () {
                        picker.setMonth("prev", true);
                    }
                }
            });
            prevYearButton.render(doms.prevButtonDiv);
            prevMonthButton.render(doms.prevButtonDiv);
            var nextMonthButton = new dorado.widget.SimpleIconButton({
                iconClass: "next-month-button", listener: {
                    onClick: function () {
                        picker.setMonth("next", true);
                    }
                }
            });
            var nextYearButton = new dorado.widget.SimpleIconButton({
                iconClass: "next-year-button", listener: {
                    onClick: function () {
                        picker.setYear("next", true);
                    }
                }
            });
            nextMonthButton.render(doms.nextButtonDiv);
            nextYearButton.render(doms.nextButtonDiv);
            picker.registerInnerControl(prevYearButton);
            picker.registerInnerControl(prevMonthButton);
            picker.registerInnerControl(nextMonthButton);
            picker.registerInnerControl(nextYearButton);
            $fly(doms.yearMonthLabel).click(function () {
                picker.showYMPicker();
            });
            picker._visibleDateRegion = 1;
            return dom;
        }, doShowTimeSpinner: function () {
            var picker = this, spinner = picker._timeSpinner;
            if (!spinner) {
                spinner = picker._timeSpinner = new dorado.widget.DateTimeSpinner({
                    type: "time", width: 100, listener: {
                        onPost: function () {
                            var date = picker._date;
                            date.setHours(spinner.get("hours"));
                            date.setMinutes(spinner.get("minutes"));
                            date.setSeconds(spinner.get("seconds"));
                        }
                    }
                });
                spinner.render(picker._doms.spinnerBlock);
                picker.registerInnerControl(spinner);
            }
            $fly(spinner._dom).css("display", "");
        }, doHideTimeSpinner: function () {
            var picker = this, spinner = picker._timeSpinner;
            if (spinner) {
                $fly(spinner._dom).css("display", "none");
            }
        }, showYMPicker: function () {
            var picker = this, dom = picker._dom, ymPicker = picker._yearMonthPicker;
            if (!ymPicker && dom) {
                ymPicker = picker._yearMonthPicker = new dorado.widget.YearMonthPicker({
                    style: { display: "none" }, listener: {
                        onPick: function () {
                            var ymPicker = picker._yearMonthPicker, year = ymPicker.get("year"), month = ymPicker.get("month");
                            picker.setYear(year, false, false);
                            picker.setMonth(month, true, false);
                            picker.hideYMPicker();
                        }, onCancel: function () {
                            picker.hideYMPicker();
                        }
                    }
                });
                ymPicker.render(dom);
                picker.registerInnerControl(ymPicker);
            }
            ymPicker.updateDate(picker._date);
            if (!ymPicker._rendered) {
                ymPicker.render(document.body);
            }
            ymPicker._opened = true;
            $fly(ymPicker._dom).css("display", "").slideIn("t2b");
        }, hideYMPicker: function (animate) {
            var picker = this, ymPicker = picker._yearMonthPicker;
            if (ymPicker) {
                if (animate === false) {
                    $fly(ymPicker._dom).css("display", "none");
                } else {
                    $fly(ymPicker._dom).slideOut("b2t");
                }
                ymPicker._opened = false;
                dorado.widget.setFocusedControl(picker);
            }
        }, doOnKeyDown: function (event) {
            var picker = this, date, ymPicker = picker._yearMonthPicker;
            if (ymPicker && ymPicker._opened) {
                ymPicker.onKeyDown(event);
            } else {
                date = picker._date;
                switch (event.keyCode) {
                    case 89:
                        if (event.ctrlKey) {
                            picker.showYMPicker();
                        }
                        break;
                    case 37:
                        if (!event.ctrlKey) {
                            picker.setDate("prev", true);
                        } else {
                            picker.setMonth("prev", true);
                        }
                        break;
                    case 38:
                        if (!event.ctrlKey) {
                            picker.setDate("prevweek", true);
                        } else {
                            picker.setYear("prev", true);
                        }
                        break;
                    case 39:
                        if (!event.ctrlKey) {
                            picker.setDate("next", true);
                        } else {
                            picker.setMonth("next", true);
                        }
                        break;
                    case 40:
                        if (!event.ctrlKey) {
                            picker.setDate("nextweek", true);
                        } else {
                            picker.setYear("next", true);
                        }
                        break;
                    case 13:
                        if (picker.isDateSelectable(picker._date)) {
                            picker.fireEvent("onConfirm", picker, { date: new Date(picker._date.getTime()) });
                        }
                        return false;
                    case 27:
                        if (ymPicker && ymPicker._opened) {
                            return false;
                        }
                        break;
                }
            }
        }
    });
    dorado.widget.DateDropDown = $extend(dorado.widget.DropDown, {
        $className: "dorado.widget.DateDropDown", ATTRIBUTES: {
            width: { defaultValue: 260 }, iconClass: { defaultValue: "d-trigger-icon-date" }, showTimeSpinner: {
                setter: function (showTimeSpinner) {
                    this._showTimeSpinner = showTimeSpinner;
                    if (this._picker) {
                        this._picker.set("showTimeSpinner", showTimeSpinner);
                    }
                }
            }, showTodayButton: { defaultValue: true, path: "_picker.showTodayButton" }, showConfirmButton: { defaultValue: true, path: "_picker.showConfirmButton" }, selectionMode: { defaultValue: "singleDate", path: "_picker.selectionMode" }, selection: { path: "_picker.selection" }
        }, EVENTS: { onFilterDate: {} }, createDropDownBox: function () {
            var dropDown = this, box = $invokeSuper.call(this, arguments), picker = new dorado.widget.DatePicker({
                showClearButton: false, showCancelButton: true, showTodayButton: this._showTodayButton, showConfirmButton: this._showConfirmButton, selectionMode: this._selectionMode, showTimeSpinner: this._showTimeSpinner, listener: {
                    onPick: function (self, arg) {
                        if (!dropDown._showTimeSpinner) {
                            dropDown.close(arg.date);
                        }
                    }, onClear: function (self) {
                        dropDown.close(null);
                    }, onConfirm: function (self, arg) {
                        dropDown.close(arg.date);
                    }, onCancel: function () {
                        dropDown.close();
                    }, onFilterDate: function (self, arg) {
                        dropDown.fireEvent("onFilterDate", dropDown, arg);
                    }
                }
            });
            dropDown._picker = picker;
            box.set("control", picker);
            return box;
        }, doOnEditorKeyDown: function (editor, evt) {
            var dropDown = this, retValue = true, datePicker = dropDown.get("box.control");
            if (this.get("opened")) {
                switch (evt.keyCode) {
                    case 27:
                        dropDown.close();
                        retValue = false;
                        break;
                    default:
                        var ymPicker = datePicker._yearMonthPicker;
                        if (!ymPicker || !ymPicker._opened) {
                            retValue = datePicker.onKeyDown(evt);
                        } else {
                            retValue = ymPicker.onKeyDown(evt);
                        }
                        break;
                }
            }
            if (retValue) {
                retValue = $invokeSuper.call(dropDown, arguments);
            }
            return retValue;
        }, initDropDownBox: function (box, editor) {
            var dropDown = this, datePicker = dropDown.get("box.control");
            if (datePicker) {
                var date = editor.get("value");
                if (date && date instanceof Date) {
                    datePicker.set("date", new Date(date.getTime()));
                } else {
                    datePicker.set("date", new Date());
                }
                if (datePicker._yearMonthPicker && datePicker._yearMonthPicker._opened) {
                    datePicker.hideYMPicker(false);
                }
            }
        }
    });
    dorado.widget.View.registerDefaultComponent("defaultDateDropDown", function () {
        return new dorado.widget.DateDropDown({});
    });
    dorado.widget.View.registerDefaultComponent("defaultDateTimeDropDown", function () {
        return new dorado.widget.DateDropDown({ showTimeSpinner: true });
    });
})();
dorado.widget.CustomDropDown = $extend(dorado.widget.DropDown, {
    $className: "dorado.widget.CustomDropDown", ATTRIBUTES: {
        control: { writeBeforeReady: true, innerComponent: "" }, view: {
            setter: function (view) {
                if (this._view == view) {
                    return;
                }
                $invokeSuper.call(this, [view]);
                if (view && this._control) {
                    this._control.set("view", view);
                }
            }
        }
    }, createDropDownBox: function () {
        var box = $invokeSuper.call(this, arguments);
        var control = this._control;
        box.set("control", control);
        box.bind("beforeShow", function () {
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
    }
});
(function () {
    dorado.widget.SpinnerTrigger = $extend(dorado.widget.Trigger, {
        $className: "dorado.widget.SpinnerTrigger", ATTRIBUTES: { className: { defaultValue: "d-trigger d-spinner-trigger" } }, createTriggerButton: function (editor) {
            var trigger = this, control = new dorado.widget.HtmlContainer({ exClassName: (trigger._className || ""), content: { tagName: "div", content: [{ tagName: "div", className: "up-button", contextKey: "upButton", content: { tagName: "div", className: "icon" } }, { tagName: "div", className: "down-button", contextKey: "downButton", content: { tagName: "div", className: "icon" } }] } });
            control.getDom();
            jQuery(control.getSubDom("upButton")).repeatOnClick(function () {
                if (!editor._realReadOnly) {
                    editor.doStepUp();
                }
            }, 150).addClassOnClick("up-button-click", null, function () {
                return !editor._realReadOnly;
            });
            jQuery(control.getSubDom("downButton")).repeatOnClick(function () {
                if (!editor._realReadOnly) {
                    editor.doStepDown();
                }
            }, 150).addClassOnClick("down-button-click", null, function () {
                return !editor._realReadOnly;
            });
            return control;
        }
    });
    dorado.widget.Spinner = $extend(dorado.widget.AbstractTextBox, {
        $className: "dorado.widget.Spinner", focusable: true, ATTRIBUTES: {
            width: { defaultValue: 150 }, height: { independent: true, readOnly: true }, trigger: {
                getter: function () {
                    var triggers = this._trigger;
                    if (triggers && !(triggers instanceof Array)) {
                        triggers = [triggers];
                    }
                    var spinnerTriggers = this.getSpinnerTriggers();
                    return triggers ? spinnerTriggers.concat(triggers) : spinnerTriggers;
                }
            }, showSpinTrigger: { defaultValue: true }, step: { defaultValue: 1 }, postValueOnSpin: { defaultValue: true }
        }, getSpinnerTriggers: function () {
            if (!this._showSpinTrigger) {
                return [];
            }
            if (!this._spinTrigger) {
                var triggers = this._spinTrigger = [], self = this;
                triggers.push(new dorado.widget.SpinnerTrigger({}));
            }
            return this._spinTrigger;
        }, createDom: function () {
            var dom = $invokeSuper.call(this, arguments), self = this;
            jQuery(dom).addClassOnHover(this._className + "-hover", null, function () {
                return !self._realReadOnly;
            });
            return dom;
        }
    });
    dorado.widget.NumberSpinner = $extend(dorado.widget.Spinner, {
        $className: "dorado.widget.NumberSpinner", ATTRIBUTES: {
            min: { defaultValue: -2147483648 }, max: { defaultValue: 2147483648 }, text: { defaultValue: 0 }, value: {
                getter: function () {
                    return parseInt(this.get("text"), 10);
                }, setter: function (value) {
                    value = this.getValidValue(value);
                    this._value = value;
                    this.doSetText((value != null) ? (value + "") : "");
                }
            }, selectTextOnFocus: { defaultValue: true }
        }, createTextDom: function () {
            var textDom = document.createElement("INPUT");
            textDom.className = "editor";
            textDom.imeMode = "disabled";
            if (dorado.Browser.msie && dorado.Browser.version > 7) {
                textDom.style.top = 0;
                textDom.style.position = "absolute";
            } else {
                textDom.style.padding = 0;
            }
            return textDom;
        }, doGetText: function () {
            return (this._textDom) ? this._textDom.value : this._text;
        }, doSetText: function (text) {
            if (this._textDom) {
                this._textDom.value = text;
            } else {
                this._text = text;
            }
        }, doStepUp: function () {
            var spinner = this;
            var value = parseInt(spinner.get("value"), 10);
            if (!isNaN(value)) {
                value += spinner._step;
                if (this._max !== undefined && value > this._max) {
                    return;
                }
                spinner.set("value", value);
                if (spinner._postValueOnSpin) {
                    spinner.post();
                }
            }
        }, doStepDown: function () {
            var spinner = this;
            var value = parseInt(spinner.get("value"), 10);
            if (!isNaN(value)) {
                value -= spinner._step;
                if (this._min !== undefined && value < this._min) {
                    return;
                }
                spinner.set("value", value);
                if (spinner._postValueOnSpin) {
                    spinner.post();
                }
            }
        }, getValidValue: function (value) {
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
        }, post: function (force) {
            var text = this.get("text"), value = text ? parseInt(text, 10) : null;
            if (text != value) {
                this._textDom.value = value;
            }
            var value2 = this.getValidValue(value);
            if (value2 != value) {
                this.set("value", value2);
            }
            $invokeSuper.call(this, arguments);
        }, doOnFocus: function () {
            $invokeSuper.call(this, arguments);
            if (this._selectTextOnFocus) {
                $setTimeout(this, function () {
                    this._textDom.select();
                }, 0);
            }
        }, doOnKeyDown: function (event) {
            var spinner = this, retval = true;
            switch (event.keyCode) {
                case 38:
                    if (!spinner._realReadOnly) {
                        spinner.doStepUp();
                        retval = false;
                    }
                    break;
                case 40:
                    if (!spinner._realReadOnly) {
                        spinner.doStepDown();
                        retval = false;
                    }
                    break;
                case 37:
                case 39:
                case 8:
                case 9:
                case 13:
                case 35:
                case 36:
                case 46:
                    break;
                case 187:
                    var text = this.get("text"), value = text ? parseInt(text) : null;
                    if (value) {
                        value = Math.abs(value);
                        spinner._textDom.value = value;
                    }
                    retval = false;
                    break;
                case 189:
                    var text = this.get("text"), value = text ? parseInt(text) : null;
                    if (value) {
                        value = 0 - Math.abs(value);
                        spinner._textDom.value = value;
                    }
                    retval = false;
                    break;
                default:
                    if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
                    } else {
                        retval = false;
                    }
                    break;
            }
            return retval;
        }
    });
    dorado.widget.MultiSlotSpinner = $extend(dorado.widget.Spinner, {
        $className: "dorado.widget.MultiSlotSpinner", slotConfigs: [{}], defaultSlot: 0, constructor: function () {
            if (this.slotConfigs) {
                this.initSlotConfigs();
            }
            this._currentSlotIndex = 0;
            $invokeSuper.call(this, arguments);
        }, initSlotConfigs: function () {
            var slotConfigs = this.slotConfigs, slotMap = this._slotMap = {}, values = this._values = [];
            for (var i = 0, j = slotConfigs.length; i < j; i++) {
                var config = slotConfigs[i], name = config.name;
                config.className = config.className || "slot";
                config.range = config.range || [null, null];
                slotMap[name] = config;
                values[i] = config.defaultValue;
            }
        }, createTextDom: function () {
            var spinner = this, doms = {}, dom = $DomUtils.xCreate({ tagName: "div", className: "editor slots-container", contextKey: "editor" }, null, doms);
            spinner._doms = doms;
            var slotConfigs = spinner.slotConfigs;
            for (var i = 0, j = slotConfigs.length; i < j; i++) {
                var config = slotConfigs[i], name = config.name;
                var label = document.createElement("span");
                label.className = config.className;
                label.slotIndex = i;
                doms["slot_" + i] = label;
                $fly(label).mousedown(function () {
                    spinner.doChangeCurrentSlot(parseInt(this.slotIndex));
                });
                if (config.prefix) {
                    var spEl = document.createElement("span");
                    $fly(spEl).text(config.prefix).prop("class", "text");
                    $fly(doms.editor).append(spEl);
                }
                $fly(doms.editor).append(label);
                if (config.suffix) {
                    var spEl = document.createElement("span");
                    $fly(spEl).text(config.suffix).prop("class", "text");
                    $fly(doms.editor).append(spEl);
                }
            }
            return dom;
        }, doSetFocus: function () {
            dorado.widget.onControlGainedFocus(this);
        }, doGetSlotRange: function (slotIndex) {
            if (typeof slotIndex == "string") {
                slotIndex = this.getSlotIndexByName(slotIndex);
            }
            return this.slotConfigs[slotIndex].range;
        }, getSlotIndexByName: function (name) {
            var config = this._slotMap[name];
            return config ? this.slotConfigs.indexOf(config) : -1;
        }, doGetSlotValue: function (slotIndex) {
            this._slotValueChanged = true;
            if (typeof slotIndex == "string") {
                slotIndex = this.getSlotIndexByName(slotIndex);
            }
            return this._values[slotIndex];
        }, doSetSlotValue: function (slotIndex, value) {
            var spinner = this;
            if (typeof slotIndex == "string") {
                slotIndex = spinner.getSlotIndexByName(slotIndex);
            }
            if (slotIndex < 0) {
                return;
            }
            if (value != null) {
                var config = spinner.slotConfigs[slotIndex], range = config.range || [], minValue = range[0], maxValue = range[1];
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
            dorado.Toolkits.setDelayedAction(spinner, "$refreshDelayTimerId", spinner.refresh, 50);
        }, doGetSlotText: function (slotIndex) {
            var spinner = this;
            if (typeof slotIndex == "string") {
                slotIndex = spinner.getSlotIndexByName(slotIndex);
            }
            if (slotIndex < 0) {
                return "";
            }
            var config = spinner.slotConfigs[slotIndex];
            var text = this.doGetSlotValue(slotIndex);
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
        }, doStepUp: function () {
            var spinner = this, currentSlotIndex = spinner._currentSlotIndex;
            if (!currentSlotIndex) {
                currentSlotIndex = spinner.doChangeCurrentSlot();
            }
            var value = spinner.doGetSlotValue(currentSlotIndex) + spinner._step;
            var config = spinner.slotConfigs[currentSlotIndex], range = spinner.doGetSlotRange(currentSlotIndex), minValue = range[0], maxValue = range[1];
            if (value == null) {
                value = minValue;
            } else {
                if (maxValue != null && value > maxValue) {
                    return;
                }
            }
            spinner.doSetSlotValue(currentSlotIndex, value || 0);
            if (spinner._postValueOnSpin) {
                spinner.post();
            }
        }, doStepDown: function () {
            var spinner = this, currentSlotIndex = spinner._currentSlotIndex;
            if (!currentSlotIndex) {
                currentSlotIndex = spinner.doChangeCurrentSlot();
            }
            var value = spinner.doGetSlotValue(currentSlotIndex) - spinner._step;
            var config = spinner.slotConfigs[currentSlotIndex], range = spinner.doGetSlotRange(currentSlotIndex), minValue = range[0], maxValue = range[1];
            if (value == null) {
                value = maxValue;
            }
            if (minValue != null && value < minValue) {
                return;
            }
            spinner.doSetSlotValue(currentSlotIndex, value || 0);
            if (spinner._postValueOnSpin) {
                spinner.post();
            }
        }, doOnKeyDown: function (event) {
            var spinner = this, retval = true;
            switch (event.keyCode) {
                case 38:
                    if (!spinner._realReadOnly) {
                        spinner.doStepUp();
                        retval = false;
                    }
                    break;
                case 40:
                    if (!spinner._realReadOnly) {
                        spinner.doStepDown();
                        retval = false;
                    }
                    break;
                case 8:
                    if (spinner._currentSlotIndex >= 0 && !spinner._realReadOnly) {
                        var currentSlotIndex = spinner._currentSlotIndex, value, range = spinner.doGetSlotRange(currentSlotIndex);
                        if (spinner._neverEdit) {
                            value = 0;
                        } else {
                            var text = spinner.doGetSlotText(currentSlotIndex);
                            value = parseInt(text.substring(0, text.length - 1), 10);
                        }
                        spinner.doSetSlotValue(currentSlotIndex, value);
                    }
                    retval = false;
                    break;
                case 9:
                    if (event.ctrlKey || !event.shiftKey && spinner._currentSlotIndex == spinner.slotConfigs.length - 1 || event.shiftKey && spinner._currentSlotIndex == 0) {
                        retval = true;
                    } else {
                        spinner.doChangeCurrentSlot(event.shiftKey ? "prev" : "next");
                        retval = false;
                    }
                    break;
                case 187:
                    if (spinner._currentSlotIndex >= 0 && !spinner._realReadOnly) {
                        var currentSlotIndex = spinner._currentSlotIndex, value = spinner.doGetSlotValue(currentSlotIndex) || 0;
                        if (value) {
                            value = Math.abs(value);
                            spinner.doSetSlotValue(currentSlotIndex, value);
                        }
                        retval = false;
                    }
                    break;
                case 189:
                    if (spinner._currentSlotIndex >= 0 && !spinner._realReadOnly) {
                        var currentSlotIndex = spinner._currentSlotIndex, value = spinner.doGetSlotValue(currentSlotIndex) || 0;
                        if (value) {
                            value = 0 - Math.abs(value);
                            spinner.doSetSlotValue(currentSlotIndex, value);
                        }
                        retval = false;
                    }
                    break;
                default:
                    if (spinner._currentSlotIndex >= 0 && !spinner._realReadOnly) {
                        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
                            var number = event.keyCode >= 96 ? event.keyCode - 96 : event.keyCode - 48, currentSlotIndex = spinner._currentSlotIndex, range = spinner.doGetSlotRange(currentSlotIndex), maxValue = range[1];
                            var value = spinner._neverEdit ? 0 : (spinner.doGetSlotValue(currentSlotIndex) || 0), ignore = false;
                            var config = spinner.slotConfigs[currentSlotIndex], digit = config.digit;
                            if (!digit && maxValue != null) {
                                digit = (maxValue + "").length;
                            }
                            value = value * 10 + number;
                            if (maxValue != null && value > maxValue) {
                                value = number;
                            }
                            if (!ignore) {
                                spinner.doSetSlotValue(currentSlotIndex, value);
                            }
                            retval = false;
                        }
                    }
                    break;
            }
            if (retval === false) {
                spinner._neverEdit = false;
            }
            return retval;
        }, doChangeCurrentSlot: function (slotIndex) {
            var spinner = this;
            if (typeof slotIndex == "string") {
                if (slotIndex == "next") {
                    slotIndex = (spinner._currentSlotIndex >= 0) ? spinner._currentSlotIndex + 1 : spinner.defaultSlot;
                } else {
                    if (slotIndex == "prev") {
                        slotIndex = (spinner._currentSlotIndex >= 0) ? spinner._currentSlotIndex - 1 : spinner.defaultSlot;
                    } else {
                        slotIndex = spinner.getSlotIndexByName(slotIndex);
                    }
                }
            }
            slotIndex = slotIndex || 0;
            var oldSlotIndex = spinner._currentSlotIndex, doms = spinner._doms;
            var config = spinner.slotConfigs[slotIndex];
            if (config) {
                if (oldSlotIndex >= 0) {
                    var oldSlotConfig = spinner.slotConfigs[oldSlotIndex];
                    $fly(doms["slot_" + oldSlotIndex]).removeClass(oldSlotConfig.className + "-selected");
                    spinner.doAfterSlotBlur(oldSlotIndex);
                }
                $fly(doms["slot_" + slotIndex]).addClass(config.className + "-selected");
                spinner._currentSlotIndex = slotIndex;
                return slotIndex;
            } else {
                return oldSlotIndex;
            }
        }, doAfterSlotBlur: function (slotIndex) {
            var spinner = this, value = spinner.doGetSlotValue(slotIndex);
            if (value == null) {
                spinner.doSetSlotValue(slotIndex, spinner.slotConfigs[slotIndex].defaultValue);
            }
        }, doOnBlur: function () {
            var spinner = this, currentSlotIndex = spinner._currentSlotIndex, doms = spinner._doms;
            if (currentSlotIndex >= 0) {
                $fly(doms["slot_" + currentSlotIndex]).removeClass(spinner.slotConfigs[currentSlotIndex].className + "-selected");
                spinner.doAfterSlotBlur(currentSlotIndex);
            }
            this.post(true);
        }, doOnFocus: function () {
            var spinner = this, currentSlotIndex = spinner._currentSlotIndex, doms = spinner._doms;
            spinner._neverEdit = true;
            if (currentSlotIndex >= 0 && !spinner._realReadOnly) {
                $fly(doms["slot_" + currentSlotIndex]).addClass(spinner.slotConfigs[currentSlotIndex].className + "-selected");
            }
        }, refreshDom: function () {
            $invokeSuper.call(this, arguments);
            var spinner = this, doms = spinner._doms;
            for (var i = 0; i < spinner.slotConfigs.length; i++) {
                $fly(doms["slot_" + i]).html(spinner.doGetSlotText(i));
            }
        }, doGetText: function () {
            var spinner = this, slotConfigs = spinner.slotConfigs, text = "";
            for (var i = 0; i < slotConfigs.length; i++) {
                var config = slotConfigs[i];
                text += config.prefix || "";
                text += spinner.doGetSlotText(i);
                text += config.suffix || "";
            }
            return text;
        }
    });
    function slotAttributeGetter(attr) {
        return this.doGetSlotValue(attr);
    }
    function slotAttributeSetter(value, attr) {
        this.doSetSlotValue(attr, value);
    }
    var now = new Date();
    dorado.widget.DateTimeSpinner = $extend(dorado.widget.MultiSlotSpinner, {
        $className: "dorado.widget.DateTimeSpinner", slotConfigTemplate: { year: { name: "year", range: [0, 9999], defaultValue: now.getFullYear() }, month: { name: "month", range: [1, 12], defaultValue: now.getMonth() + 1, digit: 2, prefix: "-" }, date: { name: "date", range: [1, 31], defaultValue: now.getDate(), digit: 2, prefix: "-" }, hours: { name: "hours", range: [0, 23], digit: 2, defaultValue: 0, prefix: "|" }, leading_hours: { name: "hours", range: [0, 23], digit: 2, defaultValue: 0 }, minutes: { name: "minutes", range: [0, 59], digit: 2, defaultValue: 0, prefix: ":" }, seconds: { name: "seconds", range: [0, 59], digit: 2, defaultValue: 0, prefix: ":" } }, ATTRIBUTES: {
            type: {
                writeOnce: true, writeBeforeReady: true, setter: function (type) {
                    this._type = type = type || "time";
                    this._typeChanged = true;
                    var configs, template = this.slotConfigTemplate;
                    switch (type) {
                        case "date":
                            configs = [template.year, template.month, template.date];
                            break;
                        case "time":
                            configs = [template.leading_hours, template.minutes, template.seconds];
                            break;
                        case "dateTime":
                            configs = [template.year, template.month, template.date, template.hours, template.minutes, template.seconds];
                            break;
                        case "hours":
                            configs = [template.leading_hours];
                            break;
                        case "minutes":
                            configs = [template.leading_hours, template.minutes];
                            break;
                        case "dateHours":
                            configs = [template.year, template.month, template.date, template.hours];
                            break;
                        case "dateMinutes":
                            configs = [template.year, template.month, template.date, template.hours, template.minutes];
                            break;
                    }
                    this.slotConfigs = configs;
                    this.initSlotConfigs();
                }
            }, year: { getter: slotAttributeGetter, setter: slotAttributeSetter }, month: { getter: slotAttributeGetter, setter: slotAttributeSetter }, date: { getter: slotAttributeGetter, setter: slotAttributeSetter }, hours: { getter: slotAttributeGetter, setter: slotAttributeSetter }, minutes: { getter: slotAttributeGetter, setter: slotAttributeSetter }, seconds: { getter: slotAttributeGetter, setter: slotAttributeSetter }, value: {
                getter: function () {
                    var year = this.doGetSlotValue("year") || 1980;
                    var month = (this.doGetSlotValue("month") - 1) || 0;
                    var date = this.doGetSlotValue("date") || 1;
                    var hours = this.doGetSlotValue("hours") || 0;
                    var minutes = this.doGetSlotValue("minutes") || 0;
                    var seconds = this.doGetSlotValue("seconds") || 0;
                    return new Date(year, month, date, hours, minutes, seconds);
                }, setter: function (d) {
                    var year = 0, month = 1, date = 1, hours = 0, minutes = 0, seconds = 0;
                    if (d) {
                        year = d.getFullYear();
                        month = d.getMonth() + 1;
                        date = d.getDate();
                        hours = d.getHours();
                        minutes = d.getMinutes();
                        seconds = d.getSeconds();
                    }
                    this.doSetSlotValue("year", year);
                    this.doSetSlotValue("month", month);
                    this.doSetSlotValue("date", date);
                    this.doSetSlotValue("hours", hours);
                    this.doSetSlotValue("minutes", minutes);
                    this.doSetSlotValue("seconds", seconds);
                    this.setValidationState("none");
                }
            }
        }, constructor: function () {
            this.slotConfigs = [];
            $invokeSuper.call(this, arguments);
        }, createTextDom: function () {
            if (!this._typeChanged) {
                this.set("type", "time");
            }
            return $invokeSuper.call(this, arguments);
        }, doSetSlotValue: function (slotIndex, value) {
            if (value == null) {
                $invokeSuper.call(this, arguments);
                return;
            }
            var spinner = this, slotName;
            if (typeof slotIndex == "number") {
                var config = spinner.slotConfigs[slotIndex];
                if (config) {
                    slotName = config.name;
                }
            } else {
                slotName = slotIndex;
                slotIndex = spinner.getSlotIndexByName(slotIndex);
            }
            if (!slotName || !spinner._slotMap[slotName]) {
                return;
            }
            if (!spinner._slotMap["date"]) {
                $invokeSuper.call(this, arguments);
                return;
            }
            var dateSlotIndex = spinner.getSlotIndexByName("date"), date = spinner._values[dateSlotIndex], newDate = 0;
            if (date >= 28) {
                var year = (slotIndex == 0) ? value : spinner._values[0];
                var month = (slotIndex == 1) ? value : spinner._values[1];
                var dayCount = new Date(year, month - 1).getDaysInMonth();
                if (date > dayCount) {
                    newDate = dayCount;
                }
            }
            if (newDate) {
                if (slotName == "year" || slotName == "month") {
                    spinner.doSetSlotValue("date", newDate);
                    $invokeSuper.call(this, arguments);
                } else {
                    $invokeSuper.call(this, [slotIndex, newDate]);
                }
            } else {
                $invokeSuper.call(this, arguments);
            }
        }, doGetSlotRange: function (slotIndex) {
            var spinner = this, slotName;
            if (typeof slotIndex == "number") {
                slotName = spinner.slotConfigs[slotIndex].name;
            } else {
                slotName = slotIndex;
            }
            if (slotName == "date" && spinner._slotMap["date"]) {
                var year = spinner._values[0], month = spinner._values[1], dayCount = new Date(year, month - 1).getDaysInMonth();
                return [1, dayCount];
            } else {
                return $invokeSuper.call(this, arguments);
            }
        }, doSetText: function (text) {
            var format;
            switch (this._type) {
                case "date":
                    format = "Y-m-d";
                    break;
                case "time":
                    format = "h:i:s";
                    break;
                case "dateTime":
                    format = "Y-m-d h:i:s";
                    break;
                case "hours":
                    format = "h";
                    break;
                case "minutes":
                    format = "h:i";
                    break;
                case "dateHours":
                    format = "Y-m-d h";
                    break;
                case "dateMinutes":
                    format = "Y-m-d h:i";
                    break;
            }
            this.set("value", format);
        }
    });
    dorado.widget.CustomSpinner = $extend(dorado.widget.MultiSlotSpinner, {
        $className: "dorado.widget.CustomSpinner", ATTRIBUTES: {
            pattern: {
                writeOnce: true, writeBeforeReady: true, setter: function (pattern) {
                    this.parsePattern(pattern);
                }
            }, value: {
                getter: function () {
                    return this._values;
                }, setter: function (v) {
                    var v = v || [];
                    if (typeof v == "string") {
                        v = v.split(",");
                    }
                    for (var i = 0; i < this.slotConfigs.length; i++) {
                        var n = parseInt(v[i]);
                        if (isNaN(n)) {
                            n = null;
                        }
                        this.doSetSlotValue(i, n);
                    }
                    this.setValidationState("none");
                }
            }
        }, constructor: function (configs) {
            if (configs && configs.pattern) {
                this.parsePattern(configs.pattern);
                delete configs.pattern;
            }
            $invokeSuper.call(this, [configs]);
        }, parsePattern: function (pattern) {
            function parseSlotConfig(slotConfig) {
                var slot = {}, sections = slotConfig.split("|");
                if (sections[0] != "*") {
                    var range = sections[0].replace(/\*/g, "null");
                    slot.range = eval("[" + range + "]");
                }
                if (sections[1]) {
                    slot.digit = parseInt(sections[1]);
                }
                slot.defaultValue = slot.defaultValue || 0;
                return slot;
            }
            if (!pattern) {
                throw new dorado.ResourceException("dorado.core.AttributeValueRequired", "pattern");
            }
            this.slotConfigs = [];
            var i = 0, c, text = "", slotConfig = "", inSlot = false;
            while (i < pattern.length) {
                c = pattern.charAt(i);
                if (inSlot) {
                    if (c == "]") {
                        var slot = parseSlotConfig(slotConfig);
                        if (text) {
                            slot.prefix = text;
                        }
                        this.slotConfigs.push(slot);
                        inSlot = false;
                        text = slotConfig = "";
                    } else {
                        slotConfig += c;
                    }
                } else {
                    if (c == "\\") {
                        c = pattern.charAt(++i);
                        text += c;
                    } else {
                        if (c == "[") {
                            inSlot = true;
                        } else {
                            text += c;
                        }
                    }
                }
                i++;
            }
            if (!this.slotConfigs.length) {
                throw new dorado.ResourceException("dorado.baseWidget.InvalidSpinnerPattern", pattern);
            }
            if (text) {
                this.slotConfigs.peek().suffix = text;
            }
            this.initSlotConfigs();
        }, doSetText: function (text) {
            this.set("value", value);
        }
    });
})();


(function () {
    var TABLE_HEIGHT_ADJUST = (dorado.Browser.msie) ? -1 : 0;
    dorado.widget.RowList = $extend(dorado.widget.ViewPortList, {
        $className: "dorado.widget.RowList", ATTRIBUTES: {
            rowHeight: { defaultValue: dorado.Browser.isTouch ? ($setting["touch.ListBox.defaultRowHeight"] || 30) : ($setting["widget.ListBox.defaultRowHeight"] || 22) }, highlightCurrentRow: {
                defaultValue: true, skipRefresh: true, setter: function (v) {
                    this._highlightCurrentRow = v;
                    if (this._currentRow) {
                        $fly(this._currentRow).toggleClass("current-row", !!v);
                    }
                }
            }, highlightHoverRow: { defaultValue: true }, highlightSelectedRow: { defaultValue: true }
        }, EVENTS: { onDataRowClick: {}, onDataRowDoubleClick: {} }, constructor: function () {
            $invokeSuper.call(this, arguments);
            if (this._itemModel) {
                this._itemModel.setItemDomSize(this._rowHeight);
            }
        }, getIndexByItemId: function (itemId) {
            if (typeof itemId == "number") {
                return itemId;
            } else {
                var itemModel = this._itemModel;
                return itemModel.getItemIndex(itemModel.getItemById(itemId));
            }
        }, getCurrentItemDom: function () {
            return this._currentRow;
        }, getDraggableOptions: function (dom) {
            var options = $invokeSuper.call(this, arguments);
            if (dom == this._dom) {
                options.handle = ":first-child";
            }
            return options;
        }, createDataTable: function () {
            var table = this._dataTable = $DomUtils.xCreate({ tagName: "TABLE", cellSpacing: 0, cellPadding: 0, className: "data-table", content: { tagName: "TBODY" } });
            var tbody = this._dataTBody = table.tBodies[0];
            var self = this;
            $fly(table).mouseover(function (evt) {
                if ($DomUtils.isDragging() || !self._highlightHoverRow) {
                    return;
                }
                dorado.Toolkits.cancelDelayedAction(self, "$hoverOutTimerId");
                self.setHoverRow(self.findItemDomByEvent(evt));
            }).mouseout(function (evt) {
                dorado.Toolkits.setDelayedAction(self, "$hoverOutTimerId", function () {
                    self.setHoverRow(null);
                }, 50);
            });
            return table;
        }, findItemDomByEvent: function (evt) {
            var target = evt.srcElement || evt.target;
            var target = target || evt, tbody = this._dataTBody;
            return $DomUtils.findParent(target, function (parentNode) {
                return parentNode.parentNode == tbody;
            });
        }, onMouseDown: function (evt) {
            var row = this.findItemDomByEvent(evt);
            if (row || this._allowNoCurrent) {
                if (row && evt.shiftKey) {
                    $DomUtils.disableUserSelection(row);
                }
                var oldCurrentItem = this.getCurrentItem();
                if (this.setCurrentItemDom(row)) {
                    var clickedItem = (row ? $fly(row).data("item") : null), selection = this.getSelection();
                    if (this._selectionMode == "singleRow") {
                        if (evt.ctrlKey || evt.shiftKey) {
                            this.replaceSelection(null, clickedItem);
                        }
                    } else {
                        if (this._selectionMode == "multiRows") {
                            var removed = [], added = [];
                            if (evt.altKey || evt.ctrlKey && evt.shiftKey) {
                                removed = selection;
                            } else {
                                if (evt.ctrlKey) {
                                    this.addOrRemoveSelection(selection, clickedItem, removed, added);
                                } else {
                                    if (evt.shiftKey) {
                                        var si = -1, ei, itemModel = this._itemModel;
                                        if (oldCurrentItem) {
                                            si = itemModel.getItemIndex(oldCurrentItem);
                                        }
                                        if (oldCurrentItem) {
                                            if (si < 0) {
                                                si = itemModel.getItemIndex(oldCurrentItem);
                                            }
                                            ei = itemModel.getItemIndex(clickedItem);
                                            if (si > ei) {
                                                var i = si;
                                                si = ei, ei = i;
                                            }
                                            removed = selection.slice(0);
                                            removed.remove(oldCurrentItem);
                                            removed.remove(clickedItem);
                                            selection = [];
                                            var c = ei - si + 1, i = 0;
                                            var it = itemModel.iterator(si);
                                            while (it.hasNext() && i < c) {
                                                added.push(it.next());
                                                i++;
                                            }
                                        } else {
                                            this.addOrRemoveSelection(selection, clickedItem, removed, added);
                                        }
                                    }
                                }
                            }
                            this.replaceSelection(removed, added);
                        }
                    }
                }
                if (dorado.Browser.msie) {
                    var tbody = this._dataTBody;
                    try {
                        var cell = $DomUtils.findParent(evt.target, function (parentNode) {
                            return parentNode.parentNode.parentNode == tbody;
                        }, true);
                        if (cell) {
                            ((cell.firstChild && cell.firstChild.nodeType == 1) ? cell.firstChild : cell).focus();
                        }
                    }
                    catch (e) {
                        evt.target.focus();
                    }
                }
            }
        }, getSelection: function () {
            var selection = this._selection;
            if (this._selectionMode == "multiRows") {
                if (!selection) {
                    selection = [];
                }
            }
            return selection;
        }, setSelection: function (selection) {
            this._selection = selection;
        }, replaceSelection: function (removed, added, silence) {
            if (removed == added) {
                return;
            }
            switch (this._selectionMode) {
                case "singleRow":
                    removed = this.get("selection");
                    break;
                case "multiRows":
                    if (removed instanceof Array && removed.length == 0) {
                        removed = null;
                    }
                    if (added instanceof Array && added.length == 0) {
                        added = null;
                    }
                    if (removed == added) {
                        return;
                    }
                    if (removed && !(removed instanceof Array)) {
                        removed = [removed];
                    }
                    if (added && !(added instanceof Array)) {
                        added = [added];
                    }
                    break;
            }
            var eventArg = { removed: removed, added: added };
            if (!silence) {
                this.fireEvent("beforeSelectionChange", this, eventArg);
                removed = eventArg.removed;
                added = eventArg.added;
            }
            switch (this._selectionMode) {
                case "singleRow":
                    if (removed) {
                        this.toggleItemSelection(removed, false);
                    }
                    if (added) {
                        this.toggleItemSelection(added, true);
                    }
                    this.setSelection(added);
                    break;
                case "multiRows":
                    var selection = this.get("selection");
                    if (removed && selection) {
                        if (removed == selection) {
                            removed = selection.slice(0);
                            for (var i = 0; i < selection.length; i++) {
                                this.toggleItemSelection(selection[i], false);
                            }
                            selection = null;
                        } else {
                            for (var i = 0; i < removed.length; i++) {
                                selection.remove(removed[i]);
                                this.toggleItemSelection(removed[i], false);
                            }
                        }
                    }
                    if (selection == null) {
                        this.setSelection(selection = []);
                    }
                    if (added) {
                        for (var i = 0; i < added.length; i++) {
                            if (selection.indexOf(added[i]) >= 0) {
                                continue;
                            }
                            selection.push(added[i]);
                            this.toggleItemSelection(added[i], true);
                        }
                    }
                    this.setSelection(selection);
                    break;
            }
            if (!silence) {
                eventArg.removed = removed;
                eventArg.added = added;
                this.fireEvent("onSelectionChange", this, eventArg);
            }
        }, addOrRemoveSelection: function (selection, clickedObj, removed, added) {
            if (!selection || selection.indexOf(clickedObj) < 0) {
                added.push(clickedObj);
            } else {
                removed.push(clickedObj);
            }
        }, toggleItemSelection: function (item, selected) {
            if (!this._highlightSelectedRow || !this._itemDomMap) {
                return;
            }
            var row = this._itemDomMap[this._itemModel.getItemId(item)];
            if (row) {
                $fly(row).toggleClass("selected-row", selected);
            }
        }, onClick: function (evt) {
            if (this.findItemDomByEvent(evt)) {
                this.fireEvent("onDataRowClick", this, { event: evt });
            }
        }, onDoubleClick: function (evt) {
            if (this.findItemDomByEvent(evt)) {
                this.fireEvent("onDataRowDoubleClick", this, { event: evt });
            }
        }, setHoverRow: function (row) {
            if (row) {
                if (this._draggable && this._dragMode != "control") {
                    this.applyDraggable(row);
                }
                $fly(row).addClass("hover-row");
            }
            if (this._hoverRow == row) {
                return;
            }
            if (this._hoverRow) {
                $fly(this._hoverRow).removeClass("hover-row");
            }
            this._hoverRow = row;
        }, setCurrentRow: function (row) {
            if (this._currentRow == row) {
                return;
            }
            this.setHoverRow(null);
            if (this._currentRow) {
                $fly(this._currentRow).removeClass("current-row");
            }
            this._currentRow = row;
            if (row && this._highlightCurrentRow) {
                $fly(row).addClass("current-row");
            }
        }, getItemTimestamp: function (item) {
            return (item instanceof dorado.Entity) ? item.timestamp : -1;
        }, refreshItemDoms: function (tbody, reverse, fn) {
            if (this._scrollMode == "viewport") {
                this.setCurrentRow(null);
            }
            this._duringRefreshAll = true;
            this._selectionCache = this.get("selection");
            try {
                return $invokeSuper.call(this, arguments);
            }
            finally {
                delete this._selectionCache;
                this._duringRefreshAll = false;
            }
        }, getRealCurrentItemId: function () {
            return this.getCurrentItemId();
        }, refreshItemDom: function (tbody, item, index, prepend) {
            var row;
            if (index >= 0 && index < tbody.childNodes.length) {
                var i = index;
                if (prepend) {
                    i = tbody.childNodes.length - i - 1;
                }
                row = tbody.childNodes[i];
                if (this._itemDomMap[row._itemId] == row) {
                    delete this._itemDomMap[row._itemId];
                }
            } else {
                row = this.createItemDom(item);
                prepend ? tbody.insertBefore(row, tbody.firstChild) : tbody.appendChild(row);
            }
            var flag = prepend ? -1 : 1;
            if (index < 0) {
                flag = -flag;
            }
            index = this._itemModel.getStartIndex() + index * flag;
            var itemId = this._itemModel.getItemId(item, index);
            this._itemDomMap[itemId] = row;
            row.itemIndex = index;
            row._itemId = itemId;
            var $row = $fly(row);
            $row.data("item", item);
            if (!this._shouldSkipRender && row._lazyRender) {
                this.createItemDomDetail(row, item);
                row._lazyRender = undefined;
            }
            if (!row._lazyRender) {
                $row.toggleClass("odd-row", (!this._itemModel.groups && (index % 2) == 1));
                if (itemId == this.getRealCurrentItemId()) {
                    this.setCurrentRow(row);
                }
                if (this._selectionMode != "none") {
                    var selection = this._selectionCache || this.get("selection");
                    switch (this._selectionMode) {
                        case "singleRow":
                            $row.toggleClass("selected-row", (selection == item) && this._highlightSelectedRow);
                            break;
                        case "multiRows":
                            $row.toggleClass("selected-row", !!(selection && selection.indexOf(item) >= 0) && this._highlightSelectedRow);
                            break;
                    }
                }
                this.refreshItemDomData(row, item);
            }
            return row;
        }, refreshItemDomData: function (row, item) {
            if (row._lazyRender) {
                return;
            }
            var timestamp = this.getItemTimestamp(item);
            if (this._ignoreItemTimestamp || timestamp <= 0 || row.timestamp != timestamp) {
                this.doRefreshItemDomData(row, item);
                row.timestamp = timestamp;
            }
        }, refreshContent: function (container) {
            if (!this._dataTable) {
                var table = this.createDataTable();
                container.appendChild(table);
            }
            if (this._currentScrollMode == "viewport") {
                var beginBlankRow = this._beginBlankRow;
                var endBlankRow = this._endBlankRow;
                if (beginBlankRow) {
                    beginBlankRow.parentNode.style.display = "none";
                }
                if (endBlankRow) {
                    endBlankRow.parentNode.style.display = "none";
                }
                this._itemModel.setScrollPos(0);
            }
            var fn;
            if (this._scrollMode == "lazyRender" && container.clientHeight > 0) {
                var count = parseInt(container.clientHeight / this._rowHeight), i = 0;
                fn = function (row) {
                    i++;
                    return i <= count;
                };
            }
            this.refreshItemDoms(this._dataTBody, false, fn);
        }, refreshViewPortContent: function (container) {
            var beginBlankRow = this._beginBlankRow;
            var endBlankRow = this._endBlankRow;
            if (!this._dataTable) {
                container.appendChild(this.createDataTable());
            }
            if (!beginBlankRow) {
                this._beginBlankRow = beginBlankRow = $DomUtils.xCreate({ tagName: "TR", className: "preparing-area", content: "^TD" });
                var thead = document.createElement("THEAD");
                thead.appendChild(beginBlankRow);
                container.firstChild.appendChild(thead);
            }
            if (!endBlankRow) {
                this._endBlankRow = endBlankRow = $DomUtils.xCreate({ tagName: "TR", className: "preparing-area", content: "^TD" });
                var tfoot = document.createElement("TFOOT");
                tfoot.appendChild(endBlankRow);
                container.firstChild.appendChild(tfoot);
            }
            var tbody = this._dataTBody;
            var itemModel = this._itemModel, itemCount = itemModel.getItemCount();
            var clientHeight = (container.scrollWidth > container.clientWidth) ? container.offsetHeight : container.clientHeight;
            var viewPortHeight, itemDomCount, self = this;
            if (clientHeight) {
                viewPortHeight = TABLE_HEIGHT_ADJUST;
                itemDomCount = this.refreshItemDoms(tbody, itemModel.isReverse(), function (row) {
                    viewPortHeight += row.offsetHeight;
                    if (dorado.Browser.safari) {
                        viewPortHeight -= 2;
                    }
                    return viewPortHeight <= (clientHeight + 0);
                });
            } else {
                itemDomCount = viewPortHeight = 0;
            }
            this._itemDomCount = itemDomCount;
            if (!this._skipProcessBlankRows) {
                var startIndex = this.startIndex;
                var cols = this._cols || 1;
                var rowHeightAverage = (itemDomCount > 0) ? viewPortHeight / itemDomCount : this._rowHeight;
                with (beginBlankRow) {
                    if (startIndex > 0) {
                        firstChild.colSpan = cols;
                        firstChild.style.height = Math.round(startIndex * rowHeightAverage) + "px";
                        parentNode.style.display = "";
                    } else {
                        parentNode.style.display = "none";
                        firstChild.style.height = "0px";
                    }
                }
                with (endBlankRow) {
                    if ((itemDomCount + startIndex) < itemCount) {
                        firstChild.colSpan = cols;
                        firstChild.style.height = Math.round((itemCount - itemDomCount - startIndex) * rowHeightAverage) + "px";
                        parentNode.style.display = "";
                    } else {
                        parentNode.style.display = "none";
                        firstChild.style.height = "0px";
                    }
                }
                var st;
                if (this.startIndex >= itemModel.getStartIndex()) {
                    st = this._dataTBody.offsetTop;
                } else {
                    st = this._dataTBody.offsetTop + this._dataTBody.offsetHeight - container.clientHeight;
                }
                container.scrollTop = this._scrollTop = st;
                var scrollHeight = container.scrollHeight;
                itemModel.setScrollSize(container.clientHeight, scrollHeight);
                this._rowHeightAverage = rowHeightAverage;
            }
        }, _watchScroll: function (arg) {
            delete this._watchScrollTimerId;
            if (this._scrollMode == "simple") {
                return;
            }
            var container = this._container;
            if (container.scrollLeft == 0 && container.scrollTop == 0 && container.offsetWidth > 0) {
                container.scrollLeft = this._scrollLeft || 0;
                container.scrollTop = this._scrollTop || 0;
            }
            if (this._scrollTop) {
                this._watchScrollTimerId = $setTimeout(this, this._watchScroll, 300);
            }
        }, onScroll: function (event, arg) {
            var rowList = this;
            if (rowList._scrollMode == "simple") {
                return;
            }
            var container = rowList._container;
            if ((rowList._scrollLeft || 0) != arg.scrollLeft) {
                if (rowList.onXScroll) {
                    rowList.onXScroll(arg);
                }
            }
            if ((rowList._scrollTop || 0) != arg.scrollTop) {
                rowList.onYScroll(arg);
            }
            if (rowList._watchScrollTimerId) {
                clearTimeout(rowList._watchScrollTimerId);
                delete rowList._watchScrollTimerId;
            }
            if (arg.scrollTop) {
                rowList._watchScrollTimerId = setTimeout(function () {
                    rowList._watchScroll(arg);
                }, 300);
            }
            rowList._scrollLeft = arg.scrollLeft;
            rowList._scrollTop = arg.scrollTop;
        }, onYScroll: function (arg) {
            var container = this._container;
            if (arg.scrollTop == (container._scrollTop || 0)) {
                return;
            }
            if (this._scrollMode == "viewport") {
                if (dorado.Toolkits.cancelDelayedAction(container, "$scrollTimerId")) {
                    if (Math.abs(arg.scrollTop - container._scrollTop) > (arg.clientHeight / 4)) {
                        var itemCount = this._itemModel.getItemCount();
                        var rowHeight = arg.scrollHeight / itemCount;
                        this.setScrollingIndicator((Math.round(arg.scrollTop / rowHeight) + 1) + "/" + itemCount);
                    }
                } else {
                    container._scrollTop = arg.scrollTop;
                }
                var self = this;
                dorado.Toolkits.setDelayedAction(container, "$scrollTimerId", function () {
                    self.doOnYScroll(arg);
                }, 300);
            } else {
                container._scrollTop = arg.scrollTop;
                this.doOnYScroll(arg);
            }
        }, doOnYScroll: function (arg) {
            if (this._scrollMode == "viewport") {
                dorado.Toolkits.cancelDelayedAction(this._container, "$scrollTimerId");
                this._itemModel.setScrollPos(arg.scrollTop);
                this.setHoverRow(null);
                this.refresh();
                this.hideScrollingIndicator();
            } else {
                if (this._scrollMode == "lazyRender") {
                    var rows = this._dataTBody.rows;
                    var i = parseInt(arg.scrollTop / this._rowHeight) || 0;
                    if (i >= rows.length) {
                        i = rows.length - 1;
                    }
                    var row = rows[i];
                    if (!row) {
                        return;
                    }
                    while (row && row.offsetTop > arg.scrollTop) {
                        i--;
                        row = rows[i];
                    }
                    var bottom = arg.scrollTop + arg.clientHeight;
                    while (row && row.offsetTop < bottom) {
                        if (row._lazyRender) {
                            var item = $fly(row).data("item");
                            this.createItemDomDetail(row, item);
                            row._lazyRender = undefined;
                            this.refreshItemDomData(row, item);
                        }
                        i++;
                        row = rows[i];
                    }
                }
            }
        }, createDom: function () {
            var dom = $invokeSuper.call(this, arguments);
            if (dorado.Browser.msie && dorado.Browser.version >= 8) {
                dom.hideFocus = true;
            }
            $fly(this._container).bind("modernScrolled", $scopify(this, this.onScroll));
            return dom;
        }, refreshDom: function (dom) {
            var hasRealWidth = !!this._width, hasRealHeight = !!this._height, oldWidth, oldHeight;
            if (!hasRealWidth || !hasRealHeight) {
                oldWidth = dom.offsetWidth;
                oldHeight = dom.offsetHeight;
            }
            $invokeSuper.call(this, arguments);
            var container = this._container;
            if (this._scrollMode == "viewport") {
                this.refreshViewPortContent(container);
            } else {
                this.refreshContent(container);
            }
            if (this._currentScrollMode && this._currentScrollMode != this._scrollMode && !this.getCurrentItemId()) {
                this.doOnYScroll(container);
            }
            this._currentScrollMode = this._scrollMode;
            if (!this._skipScrollCurrentIntoView) {
                if (this._currentRow) {
                    this.scrollItemDomIntoView(this._currentRow);
                } else {
                    this.scrollCurrentIntoView();
                }
            }
            delete this._skipScrollCurrentIntoView;
            if ((!hasRealWidth || !hasRealHeight) && (oldWidth != dom.offsetWidth || oldHeight != dom.offsetHeight)) {
                this.notifySizeChange();
            }
            delete this._ignoreItemTimestamp;
        }, scrollItemDomIntoView: function (row) {
            with (this._container) {
                var st = -1;
                if ((row.offsetTop + row.offsetHeight) > (scrollTop + clientHeight)) {
                    st = row.offsetTop + row.offsetHeight - clientHeight;
                } else {
                    if (row.offsetTop < scrollTop) {
                        st = row.offsetTop;
                    }
                }
                if (st >= 0) {
                    if (this._scrollMode != "lazyRender") {
                        this._scrollTop = st;
                    }
                    scrollTop = st;
                }
            }
        }, scrollCurrentIntoView: function () {
            var currentItemId = this.getRealCurrentItemId();
            if (currentItemId != null) {
                var row = this._currentRow;
                if (row) {
                    this.scrollItemDomIntoView(row);
                } else {
                    if (this._scrollMode == "viewport") {
                        var itemModel = this._itemModel;
                        var index = this.getIndexByItemId(currentItemId);
                        if (index < 0) {
                            index = 0;
                        }
                        itemModel.setStartIndex(index);
                        var oldReverse = itemModel.isReverse();
                        itemModel.setReverse(index >= this.startIndex);
                        this.refresh();
                        itemModel.setReverse(oldReverse);
                    } else {
                        row = this._itemDomMap[currentItemId];
                        if (row) {
                            this.setCurrentItemDom(row);
                        }
                    }
                }
            }
        }, findItemDomByPosition: function (pos) {
            var dom = this._dom, y = pos.y + dom.scrollTop, row = null;
            var rows = this._dataTBody.rows, rowHeight = this._rowHeightAverage || this._rowHeight, i;
            if (this._scrollMode == "viewport") {
                var relativeY = y;
                if (this._beginBlankRow) {
                    relativeY -= this._beginBlankRow.offsetHeight;
                }
                i = parseInt(relativeY / rowHeight);
            } else {
                i = parseInt(y / rowHeight);
            }
            if (i < 0) {
                i = 0;
            } else {
                if (i >= rows.length) {
                    i = rows.length - 1;
                }
            }
            row = rows[i];
            while (row) {
                if (row.offsetTop > y) {
                    row = row.previousSibling;
                } else {
                    if (row.offsetTop + row.offsetHeight < y) {
                        if (row.nextSibling) {
                            row = row.nextSibling;
                        } else {
                            row._dropY = y - row.offsetTop;
                            break;
                        }
                    } else {
                        row._dropY = y - row.offsetTop;
                        break;
                    }
                }
            }
            return row;
        }
    });
})();
dorado.widget.list.ListBoxRowRenderer = $extend(dorado.Renderer, {
    $className: "dorado.widget.list.ListBoxRowRenderer", render: function (dom, arg) {
        var item = arg.data, text;
        if (item != null) {
            if (arg.property) {
                if (item instanceof dorado.Entity) {
                    text = item.getText(arg.property);
                } else {
                    text = item[arg.property];
                }
            } else {
                if (!item.isEmptyItem) {
                    text = item;
                }
            }
        }
        dom.innerText = (text === undefined || text === null) ? "" : text;
    }
});
dorado.widget.AbstractListBox = $extend(dorado.widget.RowList, {
    $className: "dorado.widget.AbstractListBox", ATTRIBUTES: {
        className: { defaultValue: "d-list-box" }, width: { defaultValue: 200 }, property: {
            setter: function (property) {
                this._property = property;
                this._ignoreItemTimestamp = true;
            }
        }, renderer: {}
    }, EVENTS: { onRenderRow: {} }, doRefreshItemDomData: function (row, item) {
        var processDefault = true, arg = { dom: row.firstChild, data: item, property: this._property, processDefault: false };
        if (this.getListenerCount("onRenderRow")) {
            this.fireEvent("onRenderRow", this, arg);
            processDefault = arg.processDefault;
        }
        if (processDefault) {
            (this._renderer || $singleton(dorado.widget.list.ListBoxRowRenderer)).render(row.firstChild, arg);
        }
    }, createItemDom: function (item) {
        var row = document.createElement("TR");
        row.className = "row";
        row.style.height = this._rowHeight + "px";
        if (this._scrollMode == "lazyRender" && this._shouldSkipRender) {
            row._lazyRender = true;
            row.style.height = this._rowHeight + "px";
        } else {
            this.createItemDomDetail(row, item);
        }
        return row;
    }, createItemDomDetail: function (dom, item) {
        var cell = document.createElement("TD");
        dom.appendChild(cell);
    }, getItemByEvent: function (event) {
        var row = this.findItemDomByEvent(event);
        return (row) ? $fly(row).data("item") : null;
    }
});
dorado.widget.ListBox = $extend(dorado.widget.AbstractListBox, {
    $className: "dorado.widget.ListBox", ATTRIBUTES: {
        currentIndex: {
            skipRefresh: true, defaultValue: -1, setter: function (index) {
                if (index >= this._itemModel.getItemCount()) {
                    index = -1;
                }
                if (this._currentIndex == index) {
                    return;
                }
                this._currentIndex = index;
                var row = this.getItemDomByItemIndex(index);
                this.setCurrentRow(row);
                this.scrollCurrentIntoView();
                if (!row) {
                    row = this.getItemDomByItemIndex(index);
                    this.setCurrentRow(row);
                }
                this.fireEvent("onCurrentChange", this);
            }
        }, currentItem: {
            readOnly: true, getter: function () {
                return this.getCurrentItem();
            }
        }, items: {
            setter: function (v) {
                this.set("selection", null);
                this._currentIndex = -1;
                this._itemModel.setItems(v);
            }, getter: function () {
                return this._itemModel.getItems();
            }
        }
    }, refreshDom: function (dom) {
        $invokeSuper.call(this, arguments);
        var currentIndex = this._currentIndex;
        if (currentIndex < 0 && !this._allowNoCurrent && this._itemModel.getItemCount()) {
            currentIndex = 0;
        }
        this.set("currentIndex", currentIndex);
    }, getItemDomByItemIndex: function (index) {
        var itemModel = this._itemModel, row;
        if (index >= itemModel.getItemCount()) {
            index = -1;
        }
        var item = index >= 0 ? itemModel.getItemAt(index) : null;
        if (this._rendered && this._itemDomMap && index >= 0) {
            if (this._rowCache && $fly(this._rowCache).data("item") == item) {
                row = this._rowCache;
                delete this._rowCache;
            } else {
                row = this._itemDomMap[itemModel.getItemId(item)];
            }
        }
        return row;
    }, getCurrentItem: function () {
        if (this._currentIndex >= 0) {
            return this._itemModel.getItemAt(this._currentIndex);
        }
    }, getCurrentItemId: function () {
        return this._currentIndex;
    }, doOnKeyDown: function (evt) {
        var retValue = true;
        switch (evt.keyCode || evt.which) {
            case 36:
                this.set("currentIndex", 0);
                break;
            case 35:
                this.set("currentIndex", this._itemModel.getItemCount() - 1);
                break;
            case 38:
                if (this._currentIndex > 0) {
                    this.set("currentIndex", this._currentIndex - 1);
                }
                retValue = false;
                break;
            case 40:
                if (this._currentIndex < this._itemModel.getItemCount() - 1) {
                    this.set("currentIndex", this._currentIndex + 1);
                }
                retValue = false;
                break;
        }
        return retValue;
    }, setCurrentItemDom: function (row) {
        this._rowCache = row;
        this.set("currentIndex", row ? this._itemModel.getItemIndex($fly(row).data("item")) : -1);
        return true;
    }, highlightItem: function (index, options, speed) {
        if (index == undefined) {
            index = this._currentIndex;
        }
        var row = this.getItemDomByItemIndex(index);
        if (row) {
            $fly(row).addClass("highlighting-row").effect("highlight", options || { color: "#FF8000" }, speed || 1500, function () {
                $fly(row).removeClass("highlighting-row");
            });
        }
    }
});
dorado.widget.DataListBox = $extend([dorado.widget.AbstractListBox, dorado.widget.DataControl], {
    $className: "dorado.widget.DataListBox", ATTRIBUTES: {
        selection: {
            setter: function (selection) {
                this.refresh();
                $invokeSuper.call(this, arguments);
            }
        }
    }, getCurrentItem: function () {
        return (this._currentRow) ? $fly(this._currentRow).data("item") : null;
    }, getCurrentItemId: function (item, index) {
        var current = this.getCurrentItem();
        return current ? this._itemModel.getItemId(current) : null;
    }, getRealCurrentItemId: function () {
        var current = this._itemModel.getItems() ? this._itemModel.getItems().current : null;
        return current ? this._itemModel.getItemId(current) : null;
    }, setCurrentItemDom: function (row) {
        var item = (row ? $fly(row).data("item") : null);
        if (item) {
            var entityList = this._itemModel.getItems();
            entityList.setCurrent(item);
            if (entityList.current == item) {
                this.setCurrentEntity(item);
                return true;
            }
        }
        return false;
    }, refreshEntity: function (entity) {
        var row = this._itemDomMap[this._itemModel.getItemId(entity)];
        if (row) {
            this.refreshItemDomData(row, entity);
        }
    }, refreshDom: function (dom) {
        var entityList = this.getBindingData({ firstResultOnly: true, acceptAggregation: true });
        if (entityList && !(entityList instanceof dorado.EntityList)) {
            throw new dorado.ResourceException(dorado.list.BindingTypeMismatch);
        }
        var oldItems = this._itemModel.getItems();
        if (oldItems != entityList) {
            this._itemModel.setItems(entityList);
            this.set("selection", null);
        }
        $invokeSuper.call(this, arguments);
    }, setCurrentEntity: function (entity) {
        var currentItem = this._currentRow ? $fly(this._currentRow).data("item") : null;
        if (currentItem == entity) {
            return;
        }
        var itemId = entity ? this._itemModel.getItemId(entity) : null;
        var row = this._itemDomMap[itemId];
        this.setCurrentRow(row);
        this.scrollCurrentIntoView();
        this.fireEvent("onCurrentChange", this);
        return !!row;
    }, doOnKeyDown: function (evt) {
        var retValue = true;
        var items = this._itemModel.getItems();
        switch (evt.keyCode) {
            case 36:
                items.first();
                break;
            case 35:
                items.last();
                break;
            case 38:
                items.previous();
                retValue = false;
                break;
            case 40:
                items.next();
                retValue = false;
                break;
        }
        return retValue;
    }, _adjustBeginBlankRow: function () {
        this._ignoreOnScroll++;
        var itemModel = this._itemModel;
        var container = this.getDom();
        var beginBlankRow = this._beginBlankRow;
        var adj = container.scrollTop - beginBlankRow.offsetHeight;
        beginBlankRow.firstChild.style.height = this.startIndex * this._rowHeightAverage + "px";
        container.scrollTop = beginBlankRow.offsetHeight + adj;
        itemModel.setScrollSize(container.clientHeight, container.scrollHeight);
        $setTimeout(this, function () {
            this._ignoreOnScroll--;
        }, 0);
    }, _adjustEndBlankRow: function () {
        var itemModel = this._itemModel;
        var container = this.getDom();
        var endBlankRow = this._endBlankRow;
        endBlankRow.firstChild.style.height = (itemModel.getItemCount() - this.startIndex - this.itemDomCount) * this._rowHeightAverage + "px";
        itemModel.setScrollSize(container.clientHeight, container.scrollHeight);
    }, onEntityDeleted: function (arg) {
        var entity = arg.entity;
        this.replaceSelection(entity, null);
        var row = this._itemDomMap[this._itemModel.getItemId(entity)], tbody = this._dataTBody;
        if (this._scrollMode != "viewport") {
            if (row) {
                var nextRow = row.nextSibling;
                this.removeItemDom(row);
                if (this._forceRefreshRearRows !== false) {
                    while (nextRow) {
                        this.refreshItemDom(tbody, $fly(nextRow).data("item"), nextRow.sectionRowIndex);
                        nextRow = nextRow.nextSibling;
                    }
                }
                this.notifySizeChange();
            }
        } else {
            var itemModel = this._itemModel;
            if (row) {
                if (row == tbody.firstChild) {
                    itemModel.setStartIndex(itemModel.getStartIndex() - 1);
                    if (itemModel.getStartIndex() < 0) {
                        itemModel.setStartIndex(0);
                    }
                } else {
                    this.removeItemDom(row);
                }
                this.refresh(true);
            } else {
                var i = itemModel.getItemIndex(entity);
                if (i >= 0) {
                    if (i < itemModel.getStartIndex()) {
                        this.startIndex--;
                        itemModel.setStartIndex(itemModel.getStartIndex() - 1);
                        this._adjustBeginBlankRow();
                    } else {
                        this._adjustEndBlankRow();
                    }
                }
            }
        }
    }, onEntityInserted: function (arg) {
        function findFontNearestRow(entity) {
            var entity = entity.getPrevious(), row, itemDomMap = this._itemDomMap, itemModel = this._itemModel;
            while (entity) {
                row = itemDomMap[itemModel.getItemId(entity)];
                if (row) {
                    return row;
                }
                entity = entity.getPrevious();
            }
        }
        function findBackNearestRow(entity) {
            var entity = entity.getNext(), row, itemDomMap = this._itemDomMap, itemModel = this._itemModel;
            while (entity) {
                row = itemDomMap[itemModel.getItemId(entity)];
                if (row) {
                    return row;
                }
                entity = entity.getNext();
            }
        }
        var entity = arg.entity;
        var mode = arg.insertMode;
        var refEntity = arg.refEntity;
        var tbody = this._dataTBody, itemDomMap = this._itemDomMap, itemModel = this._itemModel;
        if (this._scrollMode != "viewport") {
            var row;
            switch (mode) {
                case "begin":
                    row = this.createItemDom(entity);
                    tbody.insertBefore(row, tbody.firstChild);
                    break;
                case "before":
                    row = this.createItemDom(entity);
                    var refRow = itemDomMap[itemModel.getItemId(refEntity)], inserted;
                    if (!refRow) {
                        refRow = findBackNearestRow.call(this, refEntity);
                        if (!refRow) {
                            tbody.appendChild(row);
                            inserted = true;
                        }
                    }
                    if (!inserted) {
                        tbody.insertBefore(row, refRow);
                    }
                    break;
                case "after":
                    row = this.createItemDom(entity);
                    var refRow = itemDomMap[itemModel.getItemId(refEntity)], inserted;
                    if (!refRow) {
                        refRow = findFontNearestRow.call(this, refEntity);
                        if (!refRow) {
                            tbody.insertBefore(row, tbody.firstChild);
                            inserted = true;
                        }
                    }
                    if (!inserted) {
                        if (refRow.nextSibling) {
                            tbody.insertBefore(row, refRow.nextSibling);
                        } else {
                            tbody.appendChild(row);
                        }
                    }
                    break;
                default:
                    row = this.createItemDom(entity);
                    tbody.appendChild(row);
            }
            this.refreshItemDom(tbody, entity, row.sectionRowIndex);
            if (this._forceRefreshRearRows != false) {
                row = row.nextSibling;
                while (row) {
                    this.refreshItemDom(tbody, $fly(row).data("item"), row.sectionRowIndex);
                    row = row.nextSibling;
                }
            }
            this.notifySizeChange();
        } else {
            var i = itemModel.getItemIndex(entity);
            if (i >= 0) {
                if (i < this.startIndex) {
                    this.startIndex++;
                    itemModel.setStartIndex(itemModel.getStartIndex() + 1);
                    this._adjustBeginBlankRow();
                } else {
                    if (i >= this.startIndex) {
                        if (i < this.startIndex + this.itemDomCount) {
                            var row = tbody.lastChild;
                            var nextRow = tbody.childNodes[i - this.startIndex];
                            tbody.insertBefore(row, nextRow);
                            this.refresh(true);
                        } else {
                            this._adjustEndBlankRow();
                        }
                    }
                }
            }
        }
    }, filterDataSetMessage: function (messageCode, arg) {
        var itemModel = this._itemModel;
        var items = itemModel.getItems();
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
                        this.getBindingData({ firstResultOnly: true, acceptAggregation: true });
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
    }, processDataSetMessage: function (messageCode, arg, data) {
        switch (messageCode) {
            case dorado.widget.DataSet.MESSAGE_REFRESH:
                this.refresh(true);
                break;
            case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
                if (!this.setCurrentEntity(arg.entityList.current)) {
                    this.refresh(true);
                }
                break;
            case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
            case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
                var items = this._itemModel.getItems();
                if (!items || items._observer != this._dataSet || arg.entity.parent == items || dorado.DataUtil.isOwnerOf(items, arg.newValue)) {
                    this.refresh(true);
                } else {
                    this.refreshEntity(arg.entity);
                }
                break;
            case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
                this.refreshEntity(arg.entity);
                break;
            case dorado.widget.DataSet.MESSAGE_DELETED:
                this.onEntityDeleted(arg);
                break;
            case dorado.widget.DataSet.MESSAGE_INSERTED:
                this.onEntityInserted(arg);
                break;
            case dorado.widget.DataSet.MESSAGE_LOADING_START:
                this.showLoadingTip();
                break;
            case dorado.widget.DataSet.MESSAGE_LOADING_END:
                this.hideLoadingTip();
                break;
        }
    }, highlightItem: function (entity, options, speed) {
        entity = entity || this.getCurrentItem();
        var row = this._itemDomMap[this._itemModel.getItemId(entity)];
        if (row) {
            $fly(row).addClass("highlighting-row").effect("highlight", options || { color: "#FF8000" }, speed || 1500, function () {
                $fly(row).removeClass("highlighting-row");
            });
        }
    }
});

