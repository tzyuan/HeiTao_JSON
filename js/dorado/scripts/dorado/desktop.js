


dorado.widget.desktop = {};
dorado.widget.desktop.App = $extend([dorado.AttributeSupport, dorado.EventSupport], {$className:"dorado.widget.desktop.App", constructor:function (options) {
    $invokeSuper.call(this, arguments);
    if (options) {
        this.set(options);
    }
}, ATTRIBUTES:{shell:{}, caption:{setter:function (value) {
    this._caption = value;
    var taskButton = this._taskButton, control = this.getControl && this.getControl();
    if (control instanceof dorado.widget.Panel) {
        control.set("caption", value);
    }
    if (taskButton) {
        taskButton.set("caption", value);
    }
}}, icon16:{writeBeforeReady:true}, icon32:{writeBeforeReady:true}, icon48:{writeBeforeReady:true}, icon64:{writeBeforeReady:true}}, EVENTS:{onLaunch:{}, onClose:{}}, launch:function () {
    if (this.doOnLaunch) {
        this.doOnLaunch();
    }
    this.fireEvent("onLaunch", this);
}, close:function () {
    var shell = this._shell;
    if (this.doOnClose) {
        this.doOnClose();
    }
    if (shell) {
        shell.closeApp(this.id, this);
    }
    this.fireEvent("onClose", this);
}, hide:function () {
    var app = this, control = app._control;
    if (control && control.hide) {
        control.hide();
    }
}});
dorado.widget.desktop.AbstractControlApp = $extend(dorado.widget.desktop.App, {$className:"dorado.widget.desktop.AbstractControlApp", ATTRIBUTES:{}, doOnLaunch:function () {
    var app = this, control = app.getControl();
    if (!(control instanceof dorado.widget.Control)) {
        control = app._control = app.createControl();
        if (!control) {
            throw new Error("createControl must return a float control");
        }
    }
    control.show();
}, createControl:function () {
    var app = this, control = this.doCreateControl();
    if (!control) {
        throw new Error("doCreateControl must return a control");
    }
    app._control = control;
    app.doBindEvent();
    return control;
}, doBindEvent:function () {
    var app = this, control = this.getControl();
    control.addListener("beforeShow", function () {
        app.onControlShow();
    });
    control.addListener("onClose", function () {
        app.onControlClose();
    }, {once:true});
    control.addListener("onFocus", function () {
        app.onControlFocus();
    });
    control.addListener("onBlur", function () {
        app.onControlBlur();
    });
}, getControl:function () {
}, onControlFocus:function () {
    var control = this.getControl();
    if (control) {
        $fly(control._dom).bringToFront();
    }
}, onControlBlur:function () {
}, onControlShow:function () {
}, onControlClose:function () {
    this.close();
}, doCreateControl:function () {
    var app = this, control = app._control;
    if (!(control instanceof dorado.widget.Control)) {
        app._control = control = dorado.Toolkits.createInstance("widget", control);
    }
    return control;
}});
dorado.widget.desktop.WidgetApp = $extend(dorado.widget.desktop.AbstractControlApp, {$className:"dorado.widget.desktop.WidgetApp", ATTRIBUTES:{control:{}, renderTarget:{defaultValue:"desktop"}, offsetLeft:{skipRefresh:true}, offsetTop:{skipRefresh:true}, align:{skipRefresh:true, defaultValue:"center"}, vAlign:{skipRefresh:true, defaultValue:"center"}}, getControl:function () {
    var app = this, result = app._widget;
    if (result) {
        result.set({align:app._align, vAlign:app._vAlign, offsetLeft:app._offsetLeft, offsetTop:app._offsetTop});
    }
    return result;
}, createControl:function () {
    var app = this, shell = app._shell, control = app.doCreateControl();
    var widget = new dorado.widget.desktop.Widget({control:control, anchorTarget:shell._desktop, align:app._align, vAlign:app._vAlign, offsetLeft:app._offsetLeft, offsetTop:app._offsetTop});
    app._widget = widget;
    widget._maximizeTarget = shell._desktop;
    if (this._renderTarget == "desktop") {
        widget._renderTo = shell.getCurrentDesktop();
    } else {
        widget._renderTo = shell;
    }
    app.doBindEvent();
    return widget;
}, doOnClose:function () {
    var app = this, widget = app._widget;
    if (widget) {
        widget.destroy();
        app._widget = null;
        app._control = null;
    }
}});
dorado.widget.desktop.ControlApp = $extend(dorado.widget.desktop.AbstractControlApp, {$className:"dorado.widget.desktop.ControlApp", ATTRIBUTES:{control:{}, showTaskButton:{defaultValue:true}, taskButtonTip:{}}, getControl:function () {
    return this._control;
}, createControl:function () {
    var app = this, shell = app._shell, control = $invokeSuper.call(this, arguments);
    this._control = control;
    control._maximizeTarget = shell._desktop;
    control._renderTo = shell;
    return control;
}, onControlShow:function () {
    var app = this, shell = app._shell, taskbar = shell._taskbar, showTaskButton = app._showTaskButton, control = app._control, taskButton = app._taskButton;
    if (showTaskButton && !taskButton) {
        taskButton = new dorado.widget.desktop.TaskButton({caption:app.getTaskbarCaption(), icon:app._icon16 || null, control:control, tip:app._taskButtonTip});
        taskButton._app = app;
        taskbar.addTaskButton(taskButton);
        control._animateTarget = taskButton;
        app._taskButton = taskButton;
    }
}, onControlFocus:function () {
    $invokeSuper.call(this, arguments);
    var app = this, shell = app._shell, taskbar = shell._taskbar, taskButton = app._taskButton;
    if (taskButton) {
        taskbar.setCurrentButton(taskButton);
    }
}, onControlBlur:function () {
    $invokeSuper.call(this, arguments);
    var app = this, shell = app._shell, taskbar = shell._taskbar, taskButton = app._taskButton;
    if (taskButton) {
        app._control._blurTime = (new Date()).getTime();
        taskbar.setCurrentButton(null);
    }
}, getTaskbarCaption:function (control) {
    if (!control) {
        control = this._control;
    }
    if (control) {
        return control._caption;
    }
    return "";
}, doOnClose:function () {
    var app = this, control = app._control, shell = app._shell, taskbar = shell._taskbar;
    if (app._taskButton) {
        taskbar.removeTaskButton(app._taskButton);
        app._taskButton = null;
    }
    if (control) {
        control.destroy();
        app._control = null;
    }
}});
dorado.widget.desktop.IFrameApp = $extend(dorado.widget.desktop.ControlApp, {$className:"dorado.widget.desktop.IFrameApp", ATTRIBUTES:{path:{}, width:{}, height:{}, left:{}, top:{}, minWidth:{}, minHeight:{}, maxWidth:{}, maxHeight:{}, center:{defaultValue:true}, modal:{}, minimizeable:{defaultValue:true}, maximizeable:{defaultValue:true}, maximized:{}}, doCreateControl:function () {
    var app = this;
    return new dorado.widget.Dialog({icon:app._icon16 || null, caption:app._caption, center:app._center, width:app._width || 640, height:app._height || 480, left:app._left, top:app._top, minWidth:app._minWidth, minHeight:app._minHeight, maxWidth:app._maxWidth, maxHeight:app._maxHeight, modal:!!app._modal, layout:{$type:"Dock"}, children:[{$type:"IFrame", path:this._path, onLoad:function (self) {
        if (self.isSameDomain()) {
            $fly(self.getIFrameWindow().document.body).click(function (evt) {
                dorado.widget.setFocusedControl(self);
            });
        }
    }}], minimizeable:app._minimizeable, maximizeable:app._maximizeable, maximized:app._maximized});
}});
var appTypeMap = {Default:dorado.widget.desktop.ControlApp, Control:dorado.widget.desktop.ControlApp, Widget:dorado.widget.desktop.WidgetApp, IFrame:dorado.widget.desktop.IFrameApp};
dorado.Toolkits.registerPrototype("app", appTypeMap);
dorado.widget.desktop.Shortcut = $extend([dorado.RenderableElement, dorado.EventSupport], {$className:"dorado.widget.desktop.Shortcut", focusable:true, constructor:function (config) {
    $invokeSuper.call(this, arguments);
    if (config) {
        this.set(config);
    }
}, destroy:function () {
    var isClosed = (window.closed || dorado.windowClosed);
    var dom = this._dom;
    if (dom) {
        if (!isClosed) {
            $fly(dom).remove();
        }
    }
}, getListenerScope:function () {
    if (this._parent && this._parent._view) {
        return this._parent._view;
    }
    return this;
}, ATTRIBUTES:{className:{defaultValue:"shortcut"}, icon:{}, iconClass:{}, iconSize:{defaultValue:"small"}, caption:{}, column:{}, row:{}, appId:{}}, EVENTS:{onClick:{}}, getShell:function () {
    return this._parent.findParent(dorado.widget.desktop.Shell);
}, getDom:function () {
    var dom = $invokeSuper.call(this, arguments);
    if (this._exClassName) {
        $fly(dom).addClass(this._exClassName);
    }
    return dom;
}, onClick:function () {
    $invokeSuper.call(this, arguments);
    var cut = this, appId = cut._appId, shell = this.getShell();
    if (shell && appId) {
        shell.launchApp(appId);
    }
    cut.fireEvent("onClick", cut);
}, createDom:function () {
    var cut = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:cut._className, content:[{tagName:"div", className:"icon", contextKey:"icon"}, {tagName:"span", className:"caption", content:cut._caption, contextKey:"caption"}]}, null, doms);
    $fly(dom).addClass(cut._className + "-" + cut._iconSize + "-icon").click(function () {
        if ($fly(this).hasClass("ui-draggable-dragged")) {
            $fly(this).removeClass("ui-draggable-dragged");
            return;
        }
        cut.onClick();
    });
    cut._doms = doms;
    $DomUtils.setBackgroundImage(doms.icon, cut._icon);
    return dom;
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var cut = this;
    if (!cut._parent) {
        return;
    }
    var shell = cut.getShell(), appId = cut._appId, caption = cut._caption, icon = cut._icon, className = cut._className, doms = cut._doms;
    if (appId && shell) {
        var appAttrs = shell._appAttrs[appId] || {}, iconProperty;
        switch (cut._iconSize) {
          case "small":
            iconProperty = "icon32";
            break;
          case "medium":
            iconProperty = "icon48";
            break;
          case "big":
            iconProperty = "icon64";
            break;
        }
        icon = icon || appAttrs[iconProperty], caption = caption || appAttrs.caption;
    }
    $DomUtils.setBackgroundImage(doms.icon, icon);
    $fly(doms.caption).text(caption || "");
    $fly(dom).removeClass(className + "-small-icon " + className + "-medium-icon " + className + "-big-icon").addClass(className + "-" + cut._iconSize + "-icon");
}});
dorado.widget.desktop.AbstractDesktop = $extend(dorado.widget.Control, {ATTRIBUTES:{contextMenuShortcut:{readOnly:true}, orientation:{writeBeforeReady:true, defaultValue:"vertical"}, autoArrange:{}}, EVENTS:{onShortcutContextMenu:{}}});
dorado.widget.desktop.Desktop = $extend(dorado.widget.desktop.AbstractDesktop, {$className:"dorado.widget.desktop.Desktop", focusable:true, ATTRIBUTES:{className:{defaultValue:"d-desktop"}, iconSize:{defaultValue:"small", setter:function (value) {
    this._iconSize = value;
    var items = this._items, visible = this.isActualVisible();
    if (this._rendered && items) {
        for (var i = 0, j = items.length; i < j; i++) {
            var item = items[i];
            if (item.getAttributeWatcher().getWritingTimes("iconSize") == 0) {
                item._iconSize = value;
                if (visible) {
                    item.refresh();
                }
            }
        }
    }
}}, items:{innerComponent:"desktop.Shortcut"}, columnCount:{readOnly:true}, rowCount:{readOnly:true}, navtip:{}, gridPadding:{defaultValue:5}}, EVENTS:{onShortcutDrop:{}}, initShortcut:function (shortcut, dom) {
    var desktop = this, desktopXY, desktopSize, itemWidth, itemHeight, columnIndex, rowIndex, orientation = desktop._orientation, startPositionCache;
    var getPositionCache = function () {
        var items = desktop._items, result = [];
        for (var i = 0, j = items.length; i < j; i++) {
            var item = items[i];
            if (item) {
                result.push({index:i, column:item._column, row:item._row});
            }
        }
        return result;
    };
    var getDiff = function (start, end) {
        var items = desktop._items, result = [];
        for (var i = 0, j = start.length; i < j; i++) {
            var startPosition = start[i], endPosition = end[i];
            if (startPosition.column != endPosition.column || startPosition.row != endPosition.row) {
                result.push(items[startPosition.index]);
            }
        }
        return result;
    };
    shortcut._iconSize = desktop._iconSize;
    shortcut._parent = desktop;
    shortcut.render(dom);
    $fly(shortcut._dom).bind("contextmenu", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var desktop = shortcut._parent, arg = {shortcut:shortcut, event:event};
        desktop._contextMenuShortcut = shortcut;
        desktop.fireEvent("onShortcutContextMenu", desktop, arg);
        if (desktop._parent instanceof dorado.widget.desktop.DesktopCarousel) {
            desktop._parent._contextMenuShortcut = shortcut;
            desktop._parent.fireEvent("onShortcutContextMenu", desktop._parent, arg);
        }
        return false;
    }).css("position", "absolute").draggable({distance:10, scope:"desktop", start:function (event, ui) {
        desktopXY = $fly(dom).offset();
        desktopSize = {width:$fly(dom).width(), height:$fly(dom).height()};
        startPositionCache = getPositionCache();
        var helper = ui.helper;
        itemWidth = helper.outerWidth(true) + desktop._gridPaddingLeft;
        itemHeight = helper.outerHeight(true) + desktop._gridPaddingTop;
        helper.bringToFront();
        if (!desktop._shortcutHolder) {
            desktop._shortcutHolder = $DomUtils.xCreate({tagName:"div", className:"shortcut-place-holder shortcut-place-holder-" + (desktop._iconSize || "medium")});
            dom.appendChild(desktop._shortcutHolder);
        }
    }, drag:function (event, ui) {
        var helper = ui.helper, position = helper.offset();
        var itemCenterLeft = position.left + itemWidth / 2, itemCenterTop = position.top + itemHeight / 2, tempColumnIndex = Math.floor((itemCenterLeft - desktop._leftStart - desktopXY.left) / itemWidth), tempRowIndex = Math.floor((itemCenterTop - desktop._topStart - desktopXY.top) / itemHeight);
        if (tempRowIndex >= 0 && tempRowIndex <= desktop._rowCount - 1 && tempColumnIndex >= 0 && tempColumnIndex <= desktop._columnCount - 1) {
            columnIndex = tempColumnIndex;
            rowIndex = tempRowIndex;
            $fly(desktop._shortcutHolder).css({left:desktop._leftStart + tempColumnIndex * itemWidth, top:desktop._topStart + tempRowIndex * itemHeight, display:"block"});
        }
    }, stop:function () {
        function getNextShortcut(column, row) {
            var resultColumn, resultRow;
            if (orientation == "vertical") {
                resultColumn = column;
                resultRow = row + 1;
                if (row == desktop._rowCount - 1) {
                    resultColumn += 1;
                    resultRow = 0;
                }
                return desktop.getShortcut(resultColumn, resultRow);
            } else {
                resultColumn = column + 1;
                resultRow = row;
                if (column == desktop._columnCount - 1) {
                    resultColumn = 0;
                    resultRow += 1;
                }
                return desktop.getShortcut(resultColumn, resultRow);
            }
        }
        function placeLastShortcut(shortcut) {
            var column, row, resultColumn, resultRow;
            if (orientation == "vertical") {
                column = shortcut._column;
                row = shortcut._row;
                resultColumn = column;
                resultRow = row + 1;
                if (row == desktop._rowCount - 1) {
                    resultColumn += 1;
                    resultRow = 0;
                }
                desktop.placeShortcut(shortcut, resultColumn, resultRow, true);
            } else {
                column = shortcut._column;
                row = shortcut._row;
                resultColumn = column + 1;
                resultRow = row;
                if (column == desktop._columnCount - 1) {
                    resultColumn = 0;
                    resultRow += 1;
                }
                desktop.placeShortcut(shortcut, resultColumn, resultRow, true);
            }
        }
        var target = desktop.getShortcut(columnIndex, rowIndex);
        if (target) {
            desktop.unplaceShortcut(shortcut);
            var nextShortcut;
            while (target) {
                nextShortcut = getNextShortcut(target._column, target._row);
                if (nextShortcut) {
                    desktop.placeShortcut(target, nextShortcut._column, nextShortcut._row, true);
                } else {
                    placeLastShortcut(target);
                }
                target = nextShortcut;
            }
        }
        desktop.placeShortcut(shortcut, columnIndex, rowIndex);
        if (desktop._autoArrange) {
            desktop.doAutoArrange();
        }
        var endPositionCache = getPositionCache();
        var diffShortcuts = getDiff(startPositionCache, endPositionCache);
        desktop.fireEvent("onShortcutDrop", desktop, {items:diffShortcuts});
        $fly(desktop._shortcutHolder).css("display", "");
        $(shortcut._dom).addClass("ui-draggable-dragged");
    }});
}, getShortcut:function (column, row) {
    var desktop = this, scCache = desktop._scCache;
    if (scCache) {
        var columnCache = scCache[column];
        if (columnCache) {
            return columnCache[row];
        }
    }
    return null;
}, unplaceShortcut:function (shortcut) {
    if (shortcut) {
        var column = shortcut._column, row = shortcut._row;
        var desktop = this, scCache = desktop._scCache;
        if (scCache) {
            var columnCache = scCache[column];
            if (columnCache && columnCache[row] == shortcut) {
                columnCache[row] = null;
                shortcut._column = undefined;
                shortcut._row = undefined;
            }
        }
    }
}, addItem:function (item) {
    var desktop = this, items = desktop._items, rendered = desktop._rendered;
    if (!items) {
        desktop._items = items = [];
    }
    if (!(item instanceof dorado.widget.desktop.Shortcut)) {
        item = new dorado.widget.desktop.Shortcut(item);
    }
    items.push(item);
    if (rendered) {
        desktop.initShortcut(item, desktop._dom);
        var row = item._row, column = item._column;
        if (row !== undefined && column !== undefined && desktop.getShortcut(column, row) == null) {
            if (desktop._columnCount && desktop._rowCount && row < desktop._rowCount && column < desktop._columnCount) {
                desktop.placeShortcut(item, column, row, false);
            } else {
                if (desktop._columnCount == undefined && desktop._rowCount == undefined) {
                    desktop.placeShortcut(item, column, row, false);
                } else {
                    desktop.placeNewShortcut(item);
                }
            }
        } else {
            desktop.placeNewShortcut(item);
        }
    }
}, removeItem:function (item) {
    var desktop = this, items = desktop._items;
    if (!items) {
        return;
    }
    desktop.unplaceShortcut(item);
    items.remove(item);
    item.destroy();
}, clearItems:function () {
    var desktop = this, items = desktop._items;
    if (!items) {
        return;
    }
    for (var i = 0, j = items.length; i < j; i++) {
        var item = items[i];
        desktop.unplaceShortcut(item);
        item.destroy();
    }
    desktop._items = [];
}, resetLayoutInfo:function () {
    var desktop = this, dom = desktop._dom, items = desktop._items, item = items[0], width = $fly(dom).width(), height = $fly(dom).height(), gridPadding = desktop._gridPadding || 5;
    if (item) {
        var itemWidth = $fly(item._dom).outerWidth() + gridPadding;
        var itemHeight = $fly(item._dom).outerHeight() + gridPadding;
        desktop._rowCount = Math.floor(height / (itemHeight));
        desktop._columnCount = Math.floor(width / (itemWidth));
        var sideWidth = width - itemWidth * desktop._columnCount - gridPadding, sideHeight = height - itemHeight * desktop._rowCount - gridPadding, deltaLeft = Math.floor((sideWidth - gridPadding * 2) / (desktop._columnCount - 1)), deltaTop = Math.floor((sideHeight - gridPadding * 2) / (desktop._rowCount - 1));
        desktop._gridPaddingLeft = gridPadding + deltaLeft;
        desktop._gridPaddingTop = gridPadding + deltaTop;
        desktop._leftStart = gridPadding + Math.round((sideWidth - deltaLeft * (desktop._columnCount - 1)) / 2);
        desktop._topStart = gridPadding + Math.round((sideHeight - deltaTop * (desktop._rowCount - 1)) / 2);
    }
}, placeNewShortcut:function (shortcut) {
    var desktop = this, scCache = desktop._scCache;
    if (!scCache) {
        desktop.resetLayoutInfo();
    }
    var rowCount = desktop._rowCount, columnCount = desktop._columnCount, orientation = desktop._orientation, i, j;
    if (orientation == "vertical") {
        for (i = 0; i < columnCount; i++) {
            for (j = 0; j < rowCount; j++) {
                if (desktop.getShortcut(i, j) == null) {
                    desktop.placeShortcut(shortcut, i, j);
                    return;
                }
            }
        }
    } else {
        for (j = 0; j < rowCount; j++) {
            for (i = 0; i < columnCount; i++) {
                if (desktop.getShortcut(i, j) == null) {
                    desktop.placeShortcut(shortcut, i, j);
                    return;
                }
            }
        }
    }
    desktop.placeShortcut(shortcut, -999, -999);
}, placeShortcut:function (shortcut, column, row, animate) {
    if (!shortcut || typeof column != "number" || typeof row != "number") {
        return;
    }
    var desktop = this, scCache = desktop._scCache;
    desktop.unplaceShortcut(shortcut);
    if (!scCache) {
        scCache = desktop._scCache = [];
        desktop.resetLayoutInfo();
    }
    var leftStart = desktop._leftStart, topStart = desktop._topStart, columnCache = scCache[column], gridPaddingLeft = desktop._gridPaddingLeft, gridPaddingTop = desktop._gridPaddingTop;
    if (!columnCache) {
        columnCache = scCache[column] = [];
    }
    columnCache[row] = shortcut;
    shortcut._column = column;
    shortcut._row = row;
    if (desktop._autoArrange) {
        $fly(shortcut._dom).css({left:leftStart + column * (shortcut._dom.offsetWidth + gridPaddingLeft), top:topStart + row * (shortcut._dom.offsetHeight + gridPaddingTop)});
    } else {
        $fly(shortcut._dom)[animate ? "animate" : "css"]({left:leftStart + column * (shortcut._dom.offsetWidth + gridPaddingLeft), top:topStart + row * (shortcut._dom.offsetHeight + gridPaddingTop)}, 200);
    }
}, createDom:function () {
    var desktop = this, dom = $invokeSuper.call(desktop, arguments), items = desktop._items || [];
    for (var i = 0, j = items.length; i < j; i++) {
        var item = items[i];
        desktop.initShortcut(item, dom);
    }
    return dom;
}, moveInvalidShortcut:function (columnCount, rowCount, oldColumnCount, oldRowCount) {
    var desktop = this, items = desktop._items, allShortcuts = [], tempArray = [], i, j, item;
    var maxShortcut = columnCount * rowCount, orientation = desktop._orientation;
    for (i = 0; i < items.length; i++) {
        item = items[i];
        if (item) {
            if (orientation == "vertical") {
                var column = item._column, row = item._row;
                if (column * oldRowCount + row > maxShortcut - 1 || row < 0 || column < 0) {
                    tempArray.push(item);
                } else {
                    allShortcuts[column * oldRowCount + row] = item;
                }
            } else {
                var column = item._column, row = item._row;
                if (row * oldColumnCount + column > maxShortcut - 1 || row < 0 || column < 0) {
                    tempArray.push(item);
                } else {
                    allShortcuts[row * oldColumnCount + column] = item;
                }
            }
        }
    }
    for (i = 0; i < tempArray.length; i++) {
        allShortcuts.push(tempArray[i]);
    }
    desktop._scCache = [];
    for (i = 0, j = allShortcuts.length; i < j; i++) {
        item = allShortcuts[i];
        if (item) {
            if (i > maxShortcut - 1) {
                desktop.placeShortcut(item, -999, -999);
            } else {
                if (orientation == "vertical") {
                    item._column = Math.floor(i / rowCount);
                    item._row = i % rowCount;
                    desktop.placeShortcut(item, item._column, item._row);
                } else {
                    item._column = i % columnCount;
                    item._row = Math.floor(i / columnCount);
                    desktop.placeShortcut(item, item._column, item._row);
                }
            }
        }
    }
}, doAutoArrange:function () {
    var desktop = this, rowCount = desktop._rowCount, columnCount = desktop._columnCount, orientation = desktop._orientation, i, j;
    var startRow, startColumn, isBreak = false, newShortcuts = [];
    if (orientation == "vertical") {
        for (i = 0; i < columnCount; i++) {
            if (isBreak) {
                break;
            }
            for (j = 0; j < rowCount; j++) {
                if (desktop.getShortcut(i, j) == null) {
                    startRow = j;
                    startColumn = i;
                    isBreak = true;
                    break;
                }
            }
        }
        for (i = startColumn; i < columnCount; i++) {
            for (i == startColumn ? j = startRow : j = 0; j < rowCount; j++) {
                var shortcut = desktop.getShortcut(i, j);
                if (shortcut != null) {
                    desktop.unplaceShortcut(shortcut);
                    newShortcuts.push(shortcut);
                }
            }
        }
        newShortcuts.each(function (shortcut) {
            desktop.placeNewShortcut(shortcut);
        });
    } else {
        for (j = 0; j < rowCount; j++) {
            if (isBreak) {
                break;
            }
            for (i = 0; i < columnCount; i++) {
                if (desktop.getShortcut(i, j) == null) {
                    startRow = j;
                    startColumn = i;
                    isBreak = true;
                    break;
                }
            }
        }
        for (j = startRow; j < rowCount; j++) {
            for (j == startRow ? i = startColumn : i = 0; i < columnCount; i++) {
                var shortcut = desktop.getShortcut(i, j);
                if (shortcut != null) {
                    desktop.unplaceShortcut(shortcut);
                    newShortcuts.push(shortcut);
                }
            }
        }
        newShortcuts.each(function (shortcut) {
            desktop.placeNewShortcut(shortcut);
        });
    }
}, refreshDom:function (dom) {
    var desktop = this, items = desktop._items, orientation = desktop._orientation;
    $invokeSuper.call(desktop, arguments);
    if (items) {
        var scCache = desktop._scCache, rowCount, columnCount, item, i, j;
        if (!scCache) {
            item = items[0];
            if (item) {
                desktop.resetLayoutInfo();
            }
            if (desktop._rowCount == 0 || desktop._columnCount == 0) {
                return;
            }
            for (i = 0, j = items.length; i < j; i++) {
                item = items[i];
                var row = item._row, column = item._column;
                if (row !== undefined && column !== undefined && desktop.getShortcut(column, row) == null && row < desktop._rowCount && column < desktop._columnCount) {
                    desktop.placeShortcut(item, column, row, false);
                } else {
                    desktop.placeNewShortcut(item);
                }
            }
            if (desktop._autoArrange) {
                desktop.doAutoArrange();
            }
        } else {
            item = items[0];
            if (item) {
                var oldColumnCount = desktop._columnCount, oldRowCount = desktop._rowCount;
                desktop.resetLayoutInfo();
                columnCount = desktop._columnCount;
                rowCount = desktop._rowCount;
                if (columnCount == 0 || rowCount == 0) {
                    return;
                }
                if (orientation == "vertical") {
                    if (oldRowCount != rowCount || oldColumnCount > columnCount) {
                        desktop.moveInvalidShortcut(columnCount, rowCount, oldColumnCount, oldRowCount);
                    }
                } else {
                    if (oldColumnCount != columnCount || oldRowCount > rowCount) {
                        desktop.moveInvalidShortcut(columnCount, rowCount, oldColumnCount, oldRowCount);
                    }
                }
                scCache = desktop._scCache;
                var gridPaddingLeft = desktop._gridPaddingLeft, gridPaddingTop = desktop._gridPaddingTop;
                if (desktop._autoArrange) {
                    desktop.doAutoArrange();
                }
                for (i = 0; i < columnCount; i++) {
                    var columnCache = scCache[i];
                    if (columnCache) {
                        for (j = 0; j < rowCount; j++) {
                            var shortcut = columnCache[j];
                            if (shortcut) {
                                $fly(shortcut._dom).css({left:desktop._leftStart + i * (shortcut._dom.offsetWidth + gridPaddingLeft), top:desktop._topStart + j * (shortcut._dom.offsetHeight + gridPaddingTop)});
                            }
                        }
                    }
                }
            }
        }
    }
}});
dorado.widget.Flash = $extend(dorado.widget.Control, {$className:"dorado.widget.Flash", ATTRIBUTES:{path:{}}, onAttachToDocument:function () {
    $invokeSuper.call(this, arguments);
    jQuery(this._dom).flash({swf:dorado.Toolkits.translateURL(this._path), wmode:"transparent", width:"100%", height:"100%"});
}});
dorado.widget.desktop.Widget = $extend([dorado.widget.Control, dorado.widget.FloatControl], {$className:"dorado.widget.desktop.Widget", focusable:true, ATTRIBUTES:{className:{defaultValue:"d-widget"}, control:{}, visible:{defaultValue:false}, shadowMode:{defaultValue:"none"}, animateType:{defaultValue:"none"}}, createDom:function () {
    var widget = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:widget._className, content:[{tagName:"div", className:"caption", contextKey:"caption", content:{tagName:"div", className:"close", contextKey:"close"}}]}, null, doms);
    widget._doms = doms;
    var control = widget._control;
    if (control) {
        control.render(dom);
        widget.registerInnerControl(control);
    }
    jQuery(dom).css("position", "absolute").draggable({addClasses:false, containment:"parent"}).addClassOnHover(this._className + "-hover");
    $fly(doms.close).click(function () {
        widget.fireEvent("onClose", widget);
    });
    return dom;
}});
dorado.widget.desktop.DesktopCarousel = $extend(dorado.widget.desktop.AbstractDesktop, {$className:"dorado.widget.desktop.DesktopCarousel", ATTRIBUTES:{className:{defaultValue:"d-desktop-carousel"}, currentControl:{setter:function (value) {
    var carousel = this, controls = carousel._controls;
    if (value != null) {
        if (typeof value == "string" || typeof value == "number") {
            value = controls.get(value);
        }
    }
    var oldValue = carousel._currentControl;
    var eventArg = {oldValue:oldValue};
    carousel.fireEvent("beforeCurrentChange", this, eventArg);
    if (eventArg.processDefault === false) {
        return;
    }
    if (oldValue) {
        var oldDom = oldValue._dom;
        if (oldDom) {
        }
    }
    carousel._currentControl = value;
    var dom = carousel._dom;
    if (dom && value) {
        value.set("width", $fly(dom).innerWidth());
        value.set("height", $fly(dom).innerHeight() - (carousel.switcherHeight || 0));
        if (!value._rendered) {
            carousel.registerInnerControl(value);
            value.render(dom);
        } else {
            $fly(value._dom).css("display", "block");
        }
        var currentIndex = controls.indexOf(value);
        if (currentIndex != -1) {
            var width = $fly(carousel._dom).outerWidth();
            $fly(carousel._doms.itemsWrap).animate({"left":-1 * currentIndex * width});
        }
    }
    carousel.fireEvent("onCurrentChange", this, value);
}}, controls:{writeOnce:true, innerComponent:"", setter:function (value) {
    if (value) {
        var controls = this._controls, currentFirstControl = (controls.size == 0), attributeWatcher;
        if (value instanceof Array) {
            for (var i = 0; i < value.length; i++) {
                var control = value[i];
                controls.insert(control);
                control._parent = control._focusParent = this;
                attributeWatcher = control.getAttributeWatcher();
                if (attributeWatcher.getWritingTimes("orientation") == 0) {
                    control._orientation = this._orientation;
                }
                if (attributeWatcher.getWritingTimes("autoArrange") == 0) {
                    control._autoArrange = this._autoArrange;
                }
                if (i == 0 && currentFirstControl) {
                    this.set("currentControl", control);
                }
            }
        } else {
            if (value.constructor == Object.prototype.constructor) {
                controls.insert(value);
                value._parent = value._focusParent = this;
                attributeWatcher = value.getAttributeWatcher();
                if (attributeWatcher.getWritingTimes("orientation") == 0) {
                    value._orientation = this._orientation;
                }
                if (attributeWatcher.getWritingTimes("autoArrange") == 0) {
                    value._autoArrange = this._autoArrange;
                }
                this.set("currentControl", value);
            }
        }
    }
}}, orientation:{setter:function (value) {
    this._orientation = value;
    var carousel = this, controls = carousel._controls;
    if (controls) {
        controls.each(function (control) {
            var attributeWatcher = control.getAttributeWatcher();
            if (attributeWatcher.getWritingTimes("orientation") == 0) {
                control._orientation = carousel._orientation;
            }
        });
    }
}}, autoArrange:{setter:function (value) {
    this._autoArrange = value;
    var carousel = this, controls = carousel._controls;
    if (controls) {
        controls.each(function (control) {
            var attributeWatcher = control.getAttributeWatcher();
            if (attributeWatcher.getWritingTimes("autoArrange") == 0) {
                control._autoArrange = carousel._autoArrange;
            }
        });
    }
}}, switcherPosition:{defaultValue:"top"}}, EVENTS:{beforeCurrentChange:{}, onCurrentChange:{}}, constructor:function () {
    this._controls = new dorado.util.KeyedArray(function (value) {
        return value._id;
    });
    $invokeSuper.call(this, arguments);
}, addControl:function (control, index, current) {
    if (!control) {
        throw new dorado.ResourceException("dorado.base.CardControlUndefined");
    }
    var carousel = this, doms = carousel._doms, controls = carousel._controls;
    controls.insert(control, index);
    if (carousel._rendered) {
        var dom = carousel._dom;
        control.set("width", $fly(dom).width());
        control.set("height", $fly(dom).height() - (carousel.switcherHeight || 0));
        control.render(doms.itemsWrap, index);
        $fly(control._dom).addClass("carousel-item");
        carousel.doCreateSwitchButton(index);
    }
    carousel.registerInnerControl(control);
    if (current === true) {
        carousel.set("currentControl", control);
    } else {
        carousel.refresh();
    }
    return control;
}, removeControl:function (control) {
    var carousel = this, controls = carousel._controls;
    control = carousel.getControl(control);
    if (control) {
        var index = controls.indexOf(control);
        control.destroy && control.destroy();
        controls.remove(control);
        if (carousel._rendered && index != -1) {
            carousel.doRemoveSwitchButton(index);
        }
        return control;
    }
    return null;
}, removeAllControls:function () {
    var carousel = this, controls = carousel._controls;
    for (var i = 0, j = controls.size; i < j; i++) {
        var item = controls.get(0);
        carousel.removeControl(item);
    }
}, getControl:function (id) {
    var carousel = this, controls = carousel._controls;
    if (controls) {
        if (typeof id == "number" || typeof id == "string") {
            return controls.get(id);
        } else {
            return id;
        }
    }
    return null;
}, createDom:function () {
    var carousel = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:this._className, content:[{tagName:"div", className:"items-wrap", contextKey:"itemsWrap"}, {tagName:"div", className:"switcher", contextKey:"switcher", content:{tagName:"span", className:"switcher-right", content:{tagName:"span", className:"switcher-center", contextKey:"switcherCenter"}}}]}, null, doms);
    carousel._doms = doms;
    dom.className = this._className;
    return dom;
}, doCreateSwitchButton:function (index) {
    var carousel = this, doms = carousel._doms, button = document.createElement("span");
    button.className = "switch-button";
    jQuery(button).addClassOnHover("switch-button-hover").click(function () {
        carousel.setCurrentButton(this);
    });
    if (index == undefined) {
        $fly(doms.switcherCenter).append(button);
    } else {
        var refNode = $fly(doms.switcherCenter).find(".switch-button")[index];
        if (refNode) {
            $fly(button).insertBefore(refNode);
        } else {
            $fly(button).appendTo(doms.switcherCenter);
        }
    }
    carousel.doRefreshSwitchbar();
}, doRemoveSwitchButton:function (index) {
    var carousel = this, doms = carousel._doms;
    if (index == undefined) {
        if (doms.switcherCenter.lastChild) {
            $fly(doms.switcherCenter.lastChild).remove();
        }
    } else {
        var button = $fly(doms.switcherCenter).find(".switch-button")[index];
        if (button) {
            $fly(button).remove();
        }
    }
    carousel.doRefreshSwitchbar();
}, doRefreshSwitchbar:function () {
    var carousel = this, currentControl = carousel._currentControl, doms = carousel._doms, dom = carousel._dom;
    if (!dom) {
        return;
    }
    if (carousel._switcherPosition == "top") {
        $DomUtils.dockAround(doms.switcher, dom, {align:"center", vAlign:"innertop", offsetTop:5});
        $fly(doms.itemsWrap).css("top", carousel.switcherHeight);
    } else {
        $DomUtils.dockAround(doms.switcher, dom, {align:"center", vAlign:"innerbottom", offsetTop:-5});
        $fly(doms.itemsWrap).css("top", 0);
    }
    var index = carousel._controls.indexOf(currentControl);
    if (index != -1) {
        $fly(dom).find(".switch-button").removeClass("switch-button-current");
        var button = $fly(dom).find(".switch-button")[index];
        if (button) {
            $fly(button).addClass("switch-button-current");
        }
    }
}, onResize:function () {
    $invokeSuper.call(this, arguments);
    this.refresh();
}, doOnResize:function () {
    this.doRefreshSwitchbar();
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var carousel = this, currentControl = carousel._currentControl, doms = carousel._doms;
    var width = $fly(dom).outerWidth(), controls = carousel._controls;
    carousel.switcherHeight = $fly(doms.switcher).outerHeight() + 5;
    if (!carousel._controlsRendered) {
        for (var i = 0, j = controls.size; i < j; i++) {
            var control = controls.get(i);
            control.render(doms.itemsWrap);
            $fly(control._dom).addClass("carousel-item");
            carousel.registerInnerControl(control);
            carousel.doCreateSwitchButton();
        }
        carousel._controlsRendered = true;
    }
    for (var i = 0, j = controls.size; i < j; i++) {
        var control = controls.get(i);
        control.set("width", $fly(dom).width());
        control.set("height", $fly(dom).height() - carousel.switcherHeight);
        $fly(control._dom).css("left", i * width);
        if (control._navtip) {
            control._currentTip = control._navtip;
            dorado.TipManager.initTip($fly(dom).find(".switch-button")[i], {text:control._navtip});
        } else {
            if (control._currentTip) {
                dorado.TipManager.deleteTip($fly(dom).find(".switch-button")[i]);
            }
        }
    }
    if (currentControl) {
        var currentIndex = controls.indexOf(currentControl);
        $fly(doms.itemsWrap).css({"left":-1 * currentIndex * width});
    }
    setTimeout(function () {
        carousel.doRefreshSwitchbar();
    }, 0);
}, setCurrentButton:function (button) {
    var carousel = this, dom = carousel._dom;
    if (dom) {
        $fly(dom).find(".switch-button").removeClass("switch-button-current");
        var index = $fly(button).addClass("switch-button-current").index();
        if (carousel) {
            carousel.set("currentControl", index);
        }
    }
}});
dorado.widget.desktop.SimpleDesktop = $extend(dorado.widget.Control, {$className:"dorado.widget.desktop.SimpleDesktop", ATTRIBUTES:{className:{defaultValue:"d-simple-desktop"}, items:{innerComponent:"desktop.Shortcut"}, iconSize:{defaultValue:"small"}}, initShortcut:function (shortcut, dom) {
    var desktop = this, desktopXY, desktopSize, itemWidth, itemHeight, columnIndex, rowIndex, orientation = desktop._orientation;
    shortcut._iconSize = desktop._iconSize;
    shortcut._parent = desktop;
    shortcut.render(dom);
}, createDom:function () {
    var desktop = this, dom = $invokeSuper.call(desktop, arguments), items = desktop._items || [];
    for (var i = 0, j = items.length; i < j; i++) {
        var item = items[i];
        desktop.initShortcut(item, dom);
    }
    return dom;
}, addItem:function (item) {
    var desktop = this, items = desktop._items, rendered = desktop._rendered;
    if (!items) {
        desktop._items = items = [];
    }
    if (!(item instanceof dorado.widget.desktop.Shortcut)) {
        item = new dorado.widget.desktop.Shortcut(item);
    }
    items.push(item);
    if (rendered) {
        desktop.initShortcut(item, desktop._dom);
    }
}, removeItem:function (item) {
    var desktop = this, items = desktop._items;
    if (!items) {
        return;
    }
    desktop.unplaceShortcut(item);
    items.remove(item);
    item.destroy();
}, clearItems:function () {
    var desktop = this, items = desktop._items;
    if (!items) {
        return;
    }
    for (var i = 0, j = items.length; i < j; i++) {
        var item = items[i];
        desktop.unplaceShortcut(item);
        item.destroy();
    }
    desktop._items = [];
}});
dorado.widget.desktop.TaskButton = $extend(dorado.widget.AbstractButton, {$className:"dorado.widget.desktop.TaskButton", ATTRIBUTES:{className:{defaultValue:"d-task-button"}, width:{defaultValue:150}, icon:{}, caption:{}, iconClass:{defaultValue:"default-icon"}, current:{defaultValue:false}, control:{}, app:{}}, getShell:function () {
    return this._parent.findParent(dorado.widget.desktop.Shell);
}, onClick:function () {
    $invokeSuper.call(this, arguments);
    var button = this, taskbar = button._parent, control = this._control;
    if (control) {
        if (!control._visible) {
            control.show();
        } else {
            if (control._blurTime) {
                var delta = (new Date()).getTime() - control._blurTime;
                control._blurTime = null;
                if (delta < 200) {
                    control.hide();
                    taskbar.setCurrentButton(null);
                    return;
                }
            }
            if (button._current) {
                control.hide();
                taskbar.setCurrentButton(null);
            } else {
                dorado.widget.setFocusedControl(control);
            }
        }
    }
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var button = this, cls = button._className, doms = button._doms, action = button._action || {};
    $fly(button._doms.caption).html(button._caption || action._caption);
    var icon = button._icon || action._icon, iconCls = button._iconClass || action._iconClass;
    if (!icon && !iconCls && doms.icon) {
        $fly(doms.icon).css("display", "none");
    } else {
        if (doms.icon) {
            $fly(doms.icon).prop("className", "icon").css("display", "");
        }
        if ((icon || iconCls) && !doms.icon) {
            button._createIconSpan();
        }
        if (icon) {
            $DomUtils.setBackgroundImage(doms.icon, icon);
        } else {
            if (doms.icon) {
                $fly(doms.icon).css("background-image", "");
            }
        }
        if (iconCls) {
            $fly(doms.icon).addClass(iconCls);
        }
    }
    $fly(dom)[button._current ? "addClass" : "removeClass"](cls + "-current");
}, onResize:function () {
    var button = this, dom = button._dom, width = button.getRealWidth();
    if (dom && width != null) {
        $fly(dom).width(width);
        var leftWidth = dom.offsetWidth - button._doms.buttonRight.offsetWidth - parseInt($fly(button._doms.buttonLeft).css("margin-left"), 10);
        if (leftWidth > 0) {
            $fly(button._doms.buttonLeft).outerWidth(leftWidth);
        }
    }
}, _createIconSpan:function (dom) {
    var button = this, doms = button._doms, action = button._action || {};
    dom = dom || button._dom;
    if (dom) {
        var icon = document.createElement("span");
        icon.className = "icon";
        icon.innerHTML = "&nbsp;";
        $fly(icon).prependTo(doms.buttonLeft).addClass(button._iconClass || action._iconClass);
        $DomUtils.setBackgroundImage(icon, button._icon || action._icon);
        doms.icon = icon;
    }
}, createDom:function () {
    var button = this, cls = button._className, doms = {}, action = button._action || {};
    var dom = $DomUtils.xCreate({tagName:"span", className:cls, content:[{tagName:"span", className:"button-left", contextKey:"buttonLeft", content:{tagName:"span", className:"caption", content:button._caption || action._caption, contextKey:"caption"}}, {tagName:"span", className:"button-right", contextKey:"buttonRight"}]}, null, doms);
    button._doms = doms;
    $fly(dom).bind("contextmenu", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var taskbar = button._parent, arg = {taskButton:button, event:event};
        taskbar._contextMenuTaskButton = button;
        taskbar.fireEvent("onTaskButtonContextMenu", taskbar, arg);
        return false;
    });
    var icon = button._icon || action._icon, iconCls = button._iconClass || action._iconClass;
    if (icon || iconCls) {
        button._createIconSpan(dom);
    }
    return dom;
}});
dorado.widget.desktop.TimeLabel = $extend(dorado.widget.Control, {$className:"dorado.widget.desktop.TimeLabel", ATTRIBUTES:{className:{defaultValue:"d-time-label"}, format:{defaultValue:"H:i"}}, createDom:function () {
    var label = this, dom = document.createElement("span"), now = new Date();
    dom.className = label._className;
    $fly(dom).text(now.formatDate(label._format));
    label._refreshTimer = setInterval(function () {
        now = new Date();
        $fly(dom).text(now.formatDate(label._format));
    }, 40000);
    return dom;
}, destroy:function () {
    var label = this;
    $invokeSuper.call(label, arguments);
    clearInterval(label._refreshTimer);
}});
dorado.widget.desktop.QuickButton = $extend(dorado.widget.SimpleIconButton, {$className:"dorado.widget.SimpleIconButton", ATTRIBUTES:{appId:{}}, onClick:function () {
    $invokeSuper.call(this, arguments);
    var button = this, appId = button._appId, shell = this.getShell();
    if (shell && appId) {
        shell.launchApp(appId);
    }
}, getShell:function () {
    return this._parent.findParent(dorado.widget.desktop.Shell);
}, refreshDom:function (dom) {
    dorado.widget.SimpleButton.prototype.refreshDom.apply(this, arguments);
    var button = this, cls = button._className, action = button._action || {}, icon = button._icon || action._icon, iconClass = button._iconClass || action._iconClass;
    var iconEl = dom.firstChild;
    if (icon) {
        $DomUtils.setBackgroundImage(iconEl, icon);
    } else {
        if (iconClass) {
            iconEl.className = "icon " + iconClass;
        }
    }
    $fly(dom).toggleClass(cls + "-disabled", !!(button._disabled || action._disabled));
    if (!button._parent) {
        return;
    }
    var shell = button.getShell(), appId = button._appId;
    if (appId && shell) {
        var appAttrs = shell._appAttrs[appId] || {}, iconProperty = "icon16";
        $DomUtils.setBackgroundImage(iconEl, button._icon || appAttrs[iconProperty]);
    }
}});
dorado.widget.desktop.Taskbar = $extend(dorado.widget.Control, {$className:"dorado.widget.desktop.Taskbar", ATTRIBUTES:{className:{defaultValue:"d-task-bar"}, taskButtons:{innerComponent:"desktop.TaskButton", setter:function (value) {
    var taskbar = this, taskButtons = taskbar._taskButtons, rendered = taskbar._rendered;
    if (taskButtons) {
        taskbar.clearTaskButtons();
    }
    this._taskButtons = value;
    if (value && rendered) {
        toolbar.doRenderTaskButtons();
    }
}}, quickButtons:{innerComponent:"desktop.QuickButton", setter:function (value) {
    var taskbar = this, quickButtons = taskbar._quickButtons, rendered = taskbar._rendered;
    if (quickButtons) {
        taskbar.clearQuickButtons();
    }
    this._quickButtons = value;
    if (value && rendered) {
        toolbar.doRenderQuickButtons();
    }
}}, trayButtons:{innerComponent:"SimpleButton", setter:function (value) {
    var taskbar = this, trayButtons = taskbar._trayButtons, rendered = taskbar._rendered;
    if (trayButtons) {
        taskbar.clearTrayButtons();
    }
    this._trayButtons = value;
    if (value && rendered) {
        toolbar.doRenderTrayButtons();
    }
}}, showTimeLabel:{writeBeforeReady:true, defaultValue:true}, timeLabelFormat:{writeBeforeReady:true, defaultValue:"H:i"}, contextMenuTaskButton:{readOnly:true}, startButton:{writeBeforeReady:true, innerComponent:""}}, EVENTS:{onTaskButtonContextMenu:{}}, createDom:function () {
    var taskbar = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:taskbar._className, content:[{tagName:"div", className:"right-wrap", contextKey:"rightWrap", content:[{tagName:"div", className:"tray-buttons", contextKey:"trayButtons"}]}, {tagName:"div", className:"left-wrap", contextKey:"leftWrap", content:[{tagName:"div", className:"quick-buttons", contextKey:"quickButtons"}, {tagName:"div", className:"task-buttons-wrap", contextKey:"taskButtonsWrap", content:[{tagName:"div", className:"task-buttons", contextKey:"taskButtons"}, {tagName:"div", className:"spinner", contextKey:"spinner", style:{display:"none"}, content:[{tagName:"div", className:"up-button", contextKey:"upButton"}, {tagName:"div", className:"down-button", contextKey:"downButton"}]}]}]}]}, null, doms);
    taskbar._doms = doms;
    jQuery(doms.upButton).click(function () {
        var $taskButtons = $fly(doms.taskButtons), scrollTop = $taskButtons.prop("scrollTop");
        $taskButtons.prop("scrollTop", scrollTop - $taskButtons.outerHeight(true));
    }).addClassOnHover("up-button-hover").addClassOnClick("up-button-click");
    jQuery(doms.downButton).click(function () {
        var $taskButtons = $fly(doms.taskButtons), scrollTop = $taskButtons.prop("scrollTop");
        $taskButtons.prop("scrollTop", scrollTop + $taskButtons.outerHeight(true));
    }).addClassOnHover("down-button-hover").addClassOnClick("down-button-click");
    $DomUtils.disableUserSelection(doms.spinner);
    var startButton = taskbar._startButton;
    if (startButton) {
        startButton.render(dom, doms.leftWrap);
        doms.startButton = startButton._dom;
        taskbar.registerInnerControl(startButton);
    }
    if (taskbar._showTimeLabel) {
        var timeLabel = new dorado.widget.desktop.TimeLabel({format:taskbar._timeLabelFormat});
        timeLabel.render(doms.rightWrap);
        taskbar.registerInnerControl(timeLabel);
        doms.timeLabel = timeLabel._dom;
    }
    this.doRenderTaskButtons();
    this.doRenderQuickButtons();
    this.doRenderTrayButtons();
    $fly(doms.quickButtons).droppable({scope:"desktop", over:function (ev, ui) {
    }, drop:function () {
    }});
    return dom;
}, doRenderTaskButtons:function () {
    var taskbar = this, taskButtons = taskbar._taskButtons || [], doms = taskbar._doms;
    for (var i = 0, j = taskButtons.length; i < j; i++) {
        var taskButton = taskButtons[i];
        taskButton.render(doms.taskButtons);
        this.registerInnerControl(taskButton);
    }
}, doRenderQuickButtons:function () {
    var taskbar = this, quickButtons = taskbar._quickButtons || [], doms = taskbar._doms;
    for (var i = 0, j = quickButtons.length; i < j; i++) {
        var quickButton = quickButtons[i];
        taskbar.registerInnerControl(quickButton);
        quickButton.render(doms.quickButtons);
    }
}, doRenderTrayButtons:function () {
    var taskbar = this, trayButtons = taskbar._trayButtons || [], doms = taskbar._doms;
    for (var i = 0, j = trayButtons.length; i < j; i++) {
        var trayButton = trayButtons[i];
        trayButton.render(doms.trayButtons);
        this.registerInnerControl(trayButton);
    }
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var taskbar = this, doms = taskbar._doms, startButtonWidth = doms.startButton ? $fly(doms.startButton).outerWidth(true) : 0;
    $fly(doms.leftWrap).css("margin-left", startButtonWidth);
}, onResize:function () {
    $invokeSuper.call(this, arguments);
    var taskbar = this, dom = taskbar._dom, doms = taskbar._doms, domWidth = $fly(dom).width(), rightWidth = $fly(doms.rightWrap).outerWidth(true) + 2, startButtonWidth = doms.startButton ? $fly(doms.startButton).outerWidth(true) : 0;
    var quickButtonsWidth = $fly(doms.quickButtons).outerWidth(true);
    if (dorado.Browser.msie && dorado.Browser.version == 6) {
        $fly(doms.taskButtonsWrap).outerWidth(domWidth - rightWidth - startButtonWidth - quickButtonsWidth - 4, true);
    } else {
        $fly(doms.taskButtonsWrap).outerWidth(domWidth - rightWidth - startButtonWidth - quickButtonsWidth, true);
    }
    taskbar.refreshTrigger();
}, setCurrentButton:function (button) {
    var taskbar = this, taskButtons = taskbar._taskButtons;
    if (taskButtons) {
        for (var i = 0, j = taskButtons.length; i < j; i++) {
            var taskButton = taskButtons[i];
            taskButton.set("current", false);
        }
        if (button) {
            button.set("current", true);
            taskbar.scrollIntoView(button);
        }
    }
}, refreshTrigger:function () {
    var taskbar = this, dom = taskbar._dom, doms = taskbar._doms, taskButtons = taskbar._taskButtons || [], button = taskButtons[taskButtons.length - 1];
    if (dom && button) {
        var buttonDom = button._dom, scrollTop = buttonDom.offsetTop, parentTop = doms.taskButtons.offsetTop;
        $fly(doms.spinner).css("display", scrollTop > parentTop ? "" : "none");
    }
}, scrollIntoView:function (button) {
    var taskbar = this, dom = taskbar._dom;
    if (button && dom) {
        var buttonDom = button._dom, scrollTop = buttonDom.offsetTop, taskButtonsDom = taskbar._doms.taskButtons, parentTop = taskButtonsDom.offsetTop;
        if (taskButtonsDom.scrollTop != scrollTop - parentTop) {
            $fly(taskButtonsDom).animate({scrollTop:scrollTop - parentTop});
        }
    }
}, createTaskButton:function (button) {
    if (!button) {
        return null;
    }
    if (button.constructor == Object.prototype.constructor) {
        return dorado.Toolkits.createInstance("widget", button);
    } else {
        return button;
    }
}, addTaskButton:function (button, index) {
    var taskbar = this, taskButtons = taskbar._taskButtons;
    if (!taskButtons) {
        taskButtons = taskbar._taskButtons = [];
    }
    button = taskbar.createTaskButton(button);
    var refButton, rendered = taskbar._rendered, refDom;
    if (typeof index == "number") {
        refButton = taskButtons[index];
        if (rendered && refButton) {
            refDom = refButton._dom;
        }
    } else {
        if (index instanceof dorado.widget.desktop.TaskButton) {
            refButton = index;
            index = taskButtons.indexOf(refButton);
            if (rendered && refButton) {
                refDom = refButton._dom;
            }
        }
    }
    if (typeof index == "number") {
        taskButtons.insert(button, index);
    } else {
        taskButtons.push(button);
    }
    if (rendered) {
        button.render(taskbar._doms.taskButtons, refDom);
    }
    taskbar.registerInnerControl(button);
    taskbar.refreshTrigger();
}, removeTaskButton:function (button) {
    var taskbar = this, taskButtons = taskbar._taskButtons, realButton = button;
    if (taskButtons) {
        if (typeof button == "number") {
            realButton = taskButtons[button];
        }
        if (realButton) {
            taskbar.unregisterInnerControl(realButton);
            taskButtons.remove(realButton);
            realButton.destroy();
        }
        taskbar.refreshTrigger();
    }
}, clearTaskButtons:function () {
    var taskbar = this, taskButtons = taskbar._taskButtons || [];
    for (var i = 0, j = taskButtons.length; i < j; i++) {
        var item = taskButtons[i];
        taskbar.unregisterInnerControl(item);
        item.destroy();
    }
    taskbar._taskButtons = null;
}, createQuickButton:function (button) {
    if (!button) {
        return null;
    }
    if (button.constructor == Object.prototype.constructor) {
        return new dorado.widget.desktop.QuickButton(button);
    } else {
        return button;
    }
}, addQuickButton:function (button, index) {
    var taskbar = this, quickButtons = taskbar._quickButtons;
    if (!quickButtons) {
        quickButtons = taskbar._quickButtons = [];
    }
    button = taskbar.createQuickButton(button);
    var refButton, rendered = taskbar._rendered, refDom;
    if (typeof index == "number") {
        refButton = quickButtons[index];
        if (rendered && refButton) {
            refDom = refButton._dom;
        }
    } else {
        if (index instanceof dorado.widget.AbstractButton) {
            refButton = index;
            index = quickButtons.indexOf(refButton);
            if (rendered && refButton) {
                refDom = refButton._dom;
            }
        }
    }
    if (typeof index == "number") {
        quickButtons.insert(button, index);
    } else {
        quickButtons.push(button);
    }
    taskbar.registerInnerControl(button);
    if (rendered) {
        button.render(taskbar._doms.quickButtons, refDom);
    }
    taskbar.resetDimension();
    taskbar.refreshTrigger();
}, removeQuickButton:function (button) {
    var taskbar = this, quickButtons = taskbar._quickButtons, realButton = button;
    if (quickButtons) {
        if (typeof button == "number") {
            realButton = quickButtons[button];
        }
        if (realButton) {
            taskbar.unregisterInnerControl(realButton);
            quickButtons.remove(realButton);
            realButton.destroy();
        }
        taskbar.resetDimension();
        taskbar.refreshTrigger();
    }
}, clearQuickButtons:function () {
    var taskbar = this, quickButtons = taskbar._quickButtons || [];
    for (var i = 0, j = quickButtons.length; i < j; i++) {
        var item = quickButtons[i];
        taskbar.unregisterInnerControl(item);
        item.destroy();
    }
    taskbar._quickButtons = null;
}, createTrayButton:function (button) {
    if (!button) {
        return null;
    }
    if (button.constructor == Object.prototype.constructor) {
        return new dorado.widget.SimpleIconButton(button);
    } else {
        return button;
    }
}, addTrayButton:function (button, index) {
    var taskbar = this, trayButtons = taskbar._trayButtons;
    if (!trayButtons) {
        trayButtons = taskbar._trayButtons = [];
    }
    button = taskbar.createTrayButton(button);
    var refButton, rendered = taskbar._rendered, refDom;
    if (typeof index == "number") {
        refButton = trayButtons[index];
        if (rendered && refButton) {
            refDom = refButton._dom;
        }
    } else {
        if (index instanceof dorado.widget.AbstractButton) {
            refButton = index;
            index = trayButtons.indexOf(refButton);
            if (rendered && refButton) {
                refDom = refButton._dom;
            }
        }
    }
    if (typeof index == "number") {
        trayButtons.insert(button, index);
    } else {
        trayButtons.push(button);
    }
    taskbar.registerInnerControl(button);
    if (rendered) {
        button.render(taskbar._doms.trayButtons, refDom);
        taskbar.resetDimension();
        taskbar.refreshTrigger();
    }
}, removeTrayButton:function (button) {
    var taskbar = this, trayButtons = taskbar._trayButtons, realButton = button, rendered = taskbar._rendered;
    if (trayButtons) {
        if (typeof button == "number") {
            realButton = trayButtons[button];
        }
        if (realButton) {
            taskbar.unregisterInnerControl(realButton);
            trayButtons.remove(realButton);
            realButton.destroy();
        }
        if (rendered) {
            taskbar.resetDimension();
            taskbar.refreshTrigger();
        }
    }
}, clearTrayButtons:function () {
    var taskbar = this, trayButtons = taskbar._trayButtons || [];
    for (var i = 0, j = trayButtons.length; i < j; i++) {
        var item = trayButtons[i];
        taskbar.unregisterInnerControl(item);
        item.destroy();
    }
    taskbar._trayButtons = null;
}});
dorado.widget.desktop.Shell = $extend(dorado.widget.Control, {$className:"dorado.widget.desktop.Shell", constructor:function () {
    this._instances = {};
    $invokeSuper.call(this, arguments);
}, ATTRIBUTES:{className:{defaultValue:"d-shell"}, desktop:{innerComponent:""}, taskbar:{innerComponent:""}, apps:{writeBeforeReady:true, setter:function (value) {
    if (value instanceof Array) {
        for (var i = 0, j = value.length; i < j; i++) {
            var app = value[i];
            this.registerApp(app);
        }
    }
}}, wallpaper:{skipRefresh:true, setter:function (value) {
    if (this._rendered) {
        $DomUtils.setBackgroundImage(this._dom, value || "");
    }
    this._wallpaper = value;
}}}, getCurrentDesktop:function () {
    var shell = this, desktop = shell._desktop;
    if (desktop instanceof dorado.widget.desktop.DesktopCarousel) {
        return desktop._currentControl;
    } else {
        if (desktop instanceof dorado.widget.desktop.Desktop) {
            return desktop;
        }
    }
}, registerInstance:function (appId, instance) {
    var instanceArray = this._instances[appId];
    if (!instanceArray) {
        this._instances[appId] = instanceArray = [];
    }
    instanceArray.push(instance);
}, unregisterInstance:function (appId, instance) {
    if (!appId || !instance) {
        return;
    }
    var instanceArray = this._instances[appId];
    if (instanceArray) {
        for (var i = 0, j = instanceArray.length; i < j; i++) {
            instanceArray.remove(instance);
        }
    }
}, getInstance:function (appId) {
    var instanceArray = this._instances[appId];
    if (!instanceArray) {
        return null;
    }
    return instanceArray[0];
}, hasInstance:function (appId) {
    var instanceArray = this._instances[appId];
    if (!instanceArray) {
        return false;
    }
    return instanceArray.length > 0;
}, registerApp:function (options, singleton) {
    options = options || {};
    var appId = options.id, appClazz, attrs;
    if (!appId) {
        throw new Error("id is required for createApp");
    }
    var type = options.$type || "Default", clazz = appTypeMap[type];
    if (options.attrs) {
        attrs = options.attrs;
        delete options.attrs;
    }
    if (attrs == null) {
        attrs = {};
    }
    var allAttrs = clazz.prototype.ATTRIBUTES;
    for (var prop in options) {
        if (prop in allAttrs) {
            attrs[prop] = options[prop];
            delete options[prop];
        }
    }
    appClazz = $extend(clazz, options);
    if (!this._apps) {
        this._apps = {};
        this._appAttrs = {};
        this._singletons = {};
    }
    this._apps[appId] = appClazz;
    this._appAttrs[appId] = attrs;
    this._singletons[appId] = singleton;
    return appClazz;
}, launchApp:function (appId) {
    var app = this._apps[appId], options = this._appAttrs[appId];
    if (app) {
        var instance;
        if (this._singletons[appId] !== false) {
            if (!this.hasInstance(appId)) {
                instance = new app(options);
                this.registerInstance(appId, instance);
                instance._shell = this;
                instance.launch();
            } else {
                instance = this.getInstance(appId);
                instance.launch();
            }
        } else {
            instance = new app(options);
            this.registerInstance(appId, instance);
            instance._shell = this;
            instance.launch();
        }
    }
}, closeApp:function (appId, appInstance) {
    var app = this._apps[appId];
    if (app && appInstance) {
        this.unregisterInstance(appId, appInstance);
    }
}, createDom:function () {
    var dom = $invokeSuper.call(this, arguments);
    $DomUtils.setBackgroundImage(dom, this._wallpaper || "");
    return dom;
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var width = $fly(dom).width(), height = $fly(dom).height(), desktop = this._desktop, taskbar = this._taskbar, tabbarHeight = 0;
    if (desktop && !desktop._rendered) {
        this.registerInnerControl(desktop);
        desktop.render(dom);
    }
    if (taskbar) {
        if (!taskbar._rendered) {
            this.registerInnerControl(taskbar);
            taskbar.render(dom);
        }
        taskbar.set("width", width);
        taskbar.refresh();
        tabbarHeight = $fly(taskbar._dom).outerHeight();
    }
    if (desktop) {
        desktop.set({width:width, height:height - tabbarHeight});
        desktop.refresh();
    }
}});

