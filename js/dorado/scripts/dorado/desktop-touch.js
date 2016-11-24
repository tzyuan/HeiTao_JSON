


dorado.touch.Shortcut = $extend(dorado.widget.Control, {$className:"dorado.touch.Shortcut", focusable:true, destroy:function () {
    var isClosed = (window.closed || dorado.windowClosed);
    var dom = this._dom;
    if (dom) {
        var $dom = $fly(dom);
        if (!isClosed) {
            $dom.remove();
        }
    }
}, getListenerScope:function () {
    if (this._parent && this._parent._view) {
        return this._parent._view;
    }
    return this;
}, ATTRIBUTES:{className:{defaultValue:"t-shortcut"}, name:{}, icon:{}, iconClass:{setter:function (value) {
    var oldValue = this._iconClass;
    if (this._rendered) {
        var toRemoveIconClasses = this._toRemoveIconClasses;
        if (!toRemoveIconClasses) {
            toRemoveIconClasses = this._toRemoveIconClasses = [];
        }
        this._toRemoveIconClasses.push(oldValue);
    }
    this._iconClass = value;
}}, iconSize:{defaultValue:"medium"}, caption:{}, badgeText:{}, badgeClass:{}, column:{}, row:{}}, EVENTS:{onTap:{}, onTapHold:{}}, createDom:function () {
    var cut = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:cut._className, content:[{tagName:"div", className:"icon", contextKey:"icon"}, {tagName:"span", className:"caption", content:cut._caption, contextKey:"caption"}]}, null, doms);
    $fly(dom).addClass(cut._className + "-" + cut._iconSize + "-icon").click(function () {
        if ($fly(this).hasClass("ui-draggable-dragged")) {
            $fly(this).removeClass("ui-draggable-dragged");
            return;
        }
    });
    cut._doms = doms;
    $DomUtils.setBackgroundImage(doms.icon, cut._icon);
    $fly(doms.icon).addClass(cut._iconClass || "");
    return dom;
}, doCreateBadge:function (dom) {
    var cut = this, doms = cut._doms, badgeText = cut._badgeText;
    if (badgeText == null) {
        return;
    }
    dom = dom ? dom : cut._dom;
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
    var cut = this;
    if (!cut._parent) {
        return;
    }
    var doms = cut._doms, icon = cut._icon, caption = cut._caption;
    $DomUtils.setBackgroundImage(doms.icon, icon);
    var toRemoveIconClasses = this._toRemoveIconClasses;
    if (toRemoveIconClasses) {
        $fly(doms.icon).removeClass(toRemoveIconClasses.join(" "));
        this._toRemoveIconClasses = null;
    }
    if (cut._iconClass) {
        $fly(doms.icon).addClass(cut._iconClass);
    }
    $fly(doms.caption).text(caption || "");
    cut.doRefreshBadge();
}});
dorado.touch.Desktop = $extend(dorado.widget.ItemGroup, {$className:"dorado.widget.touch.Desktop", focusable:true, ATTRIBUTES:{className:{defaultValue:"t-desktop"}, iconSize:{defaultValue:"medium"}, items:{innerComponent:"touch.Shortcut"}, columnCount:{readOnly:true}, rowCount:{readOnly:true}, itemDraggable:{defaultValue:false, writeBeforeReady:true}, gridPadding:{defaultValue:5}}, resetLayoutInfo:function () {
    var desktop = this, dom = desktop._dom, items = desktop._items, item = items.get(0), width = $fly(dom).width(), height = $fly(dom).height(), gridPadding = desktop._gridPadding || 5;
    if (item) {
        var $item = $fly(item._dom), itemWidth = $item.outerWidth(true) + gridPadding, itemHeight = $item.outerHeight(true) + gridPadding;
        desktop._rowCount = Math.floor(height / itemHeight);
        desktop._columnCount = Math.floor(width / itemWidth);
        var sideWidth = width - itemWidth * desktop._columnCount - gridPadding, sideHeight = height - itemHeight * desktop._rowCount - gridPadding, deltaLeft = Math.floor((sideWidth - gridPadding * 2) / (desktop._columnCount - 1)), deltaTop = Math.floor((sideHeight - gridPadding * 2) / (desktop._rowCount - 1));
        if (deltaLeft < 0) {
            deltaLeft = 0;
        }
        if (deltaTop < 0) {
            deltaTop = 0;
        }
        desktop._gridPaddingLeft = gridPadding + deltaLeft;
        desktop._gridPaddingTop = gridPadding + deltaTop;
        desktop._leftStart = gridPadding + Math.round((sideWidth - deltaLeft * (desktop._columnCount - 1)) / 2);
        desktop._topStart = gridPadding + Math.round((sideHeight - deltaTop * (desktop._rowCount - 1)) / 2);
    }
}, initItem:function (item) {
    var desktop = this, dom = desktop._dom, desktopXY, desktopSize, itemWidth, itemHeight, columnIndex, rowIndex;
    var validLeftMin, validLeftMax, invalid = false, invalidDate;
    $fly(item._dom).css("position", "absolute").mousedown(function (event) {
    });
    jQuery.data(item._dom, "shortcut", item);
    desktop.placeNewShortcut(item);
    if (desktop._itemDraggable) {
        $fly(item._dom).draggable({distance:10, scope:"desktop", helper:function (event, ui) {
            var helper = jQuery(this).clone().removeAttr("id");
            if (desktop._parent instanceof dorado.touch.Carousel) {
                helper.appendTo(desktop._parent._dom);
            } else {
                helper.appendTo(desktop._dom);
            }
            return helper;
        }, start:function (event, ui) {
            var desktopDom = desktop._dom, position = $fly(desktopDom).offset(), width = $fly(desktopDom).outerWidth();
            validLeftMin = position.left;
            validLeftMax = width + position.left - item._dom.offsetWidth;
            invalid = false;
            desktopXY = $fly(dom).offset();
            desktopSize = {width:$fly(dom).width(), height:$fly(dom).height()};
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
            if (position.left < validLeftMax || position.left > validLeftMax) {
                if (!invalid) {
                    invalid = true;
                    invalidDate = new Date();
                }
                if (desktop._parent instanceof dorado.touch.Carousel) {
                    if ((new Date() - invalidDate) > 1000) {
                        if (position.left < validLeftMin) {
                            desktop._parent.previous();
                            invalid = false;
                            invalidDate = null;
                        } else {
                            if (position.left > validLeftMax) {
                                desktop._parent.next();
                                invalid = false;
                                invalidDate = null;
                            }
                        }
                    }
                }
            } else {
                invalid = false;
                invalidDate = null;
            }
            var itemCenterLeft = position.left + itemWidth / 2, itemCenterTop = position.top + itemHeight / 2, tempColumnIndex = Math.floor((itemCenterLeft - desktop._leftStart - desktopXY.left) / itemWidth), tempRowIndex = Math.floor((itemCenterTop - desktop._topStart - desktopXY.top) / itemHeight);
            if (tempRowIndex >= 0 && tempRowIndex <= desktop._rowCount - 1 && tempColumnIndex >= 0 && tempColumnIndex <= desktop._columnCount - 1) {
                columnIndex = tempColumnIndex;
                rowIndex = tempRowIndex;
                $fly(desktop._shortcutHolder).css({left:desktop._leftStart + tempColumnIndex * itemWidth, top:desktop._topStart + tempRowIndex * itemHeight, display:"block"});
            }
        }, stop:function () {
            function getNextShortcut(column, row) {
                var resultColumn = column + 1, resultRow = row;
                if (column == desktop._columnCount - 1) {
                    resultColumn = 0;
                    resultRow += 1;
                }
                return desktop.getShortcut(resultColumn, resultRow);
            }
            function placeLastShortcut(shortcut) {
                var column = shortcut._column, row = shortcut._row, resultColumn = column + 1, resultRow = row;
                if (column == desktop._columnCount - 1) {
                    resultColumn = 0;
                    resultRow += 1;
                }
                desktop.placeShortcut(shortcut, resultColumn, resultRow, true);
            }
            var target = desktop.getShortcut(columnIndex, rowIndex);
            if (target) {
                desktop.unplaceShortcut(item);
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
            desktop.placeShortcut(item, columnIndex, rowIndex);
            $fly(desktop._shortcutHolder).css("display", "");
            $(item._dom).addClass("ui-draggable-dragged");
        }});
    }
}, getShortcut:function (column, row) {
    var desktop = this, scCache = desktop._scCache;
    if (typeof column == "string") {
        return this._items.get(column);
    }
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
}, createItem:function () {
    var item = $invokeSuper.call(this, arguments);
    item._iconSize = this._iconSize;
    return item;
}, doRemoveItem:function (item) {
    $invokeSuper.call(this, arguments);
    this.unplaceShortcut(item);
}, placeNewShortcut:function (shortcut) {
    var desktop = this, scCache = desktop._scCache;
    if (!scCache) {
        desktop.resetLayoutInfo();
    }
    var rowCount = desktop._rowCount, columnCount = desktop._columnCount;
    for (var j = 0; j < rowCount; j++) {
        for (var i = 0; i < columnCount; i++) {
            if (desktop.getShortcut(i, j) == null) {
                desktop.placeShortcut(shortcut, i, j);
                return;
            }
        }
    }
    desktop.placeShortcut(shortcut, -999, -999);
}, placeShortcut:function (shortcut, column, row, animate) {
    if (!shortcut || typeof column != "number" || typeof row != "number") {
        return;
    }
    var desktop = this, scCache = desktop._scCache, leftStart = desktop._leftStart, topStart = desktop._topStart;
    desktop.unplaceShortcut(shortcut);
    if (!scCache) {
        scCache = desktop._scCache = [];
    }
    var columnCache = scCache[column];
    if (!columnCache) {
        columnCache = scCache[column] = [];
    }
    columnCache[row] = shortcut;
    shortcut._column = column;
    shortcut._row = row;
    var gridPaddingLeft = desktop._gridPaddingLeft, gridPaddingTop = desktop._gridPaddingTop;
    var $cut = $fly(shortcut._dom);
    $cut[animate ? "animate" : "css"]({left:leftStart + column * ($cut.outerWidth(true) + gridPaddingLeft), top:topStart + row * ($cut.outerHeight(true) + gridPaddingTop)});
}, createDom:function () {
    var desktop = this, dom = $invokeSuper.call(desktop, arguments);
    var getShortcut = function (target) {
        var result = target;
        while (result && result != document.body) {
            if (result.className.indexOf("t-shortcut") != -1) {
                break;
            }
            result = result.parentNode;
        }
        return result;
    };
    $fly(dom).hammer({drag:false, transform:false}).bind("tap", function (event) {
        dorado.preventGhostClick(event);
        var cut = getShortcut(event.target);
        if (cut) {
            var shortcut = jQuery.data(cut, "shortcut");
            if (shortcut) {
            }
        }
    }).bind("hold", function (event) {
        var cut = getShortcut(event.target);
        if (cut) {
            var shortcut = jQuery.data(cut, "shortcut");
            if (shortcut) {
            }
        }
    });
    return dom;
}, moveInvalidShortcut:function (columnCount, rowCount, oldColumnCount, oldRowCount) {
    var desktop = this, items = desktop._items, scCache = desktop._scCache, allShortcuts = [], tempArray = [], i, j, item;
    var maxShortcut = columnCount * rowCount;
    for (i = 0; i < items.size; i++) {
        item = items.get(i);
        if (item) {
            var column = item._column, row = item._row;
            if (row * oldColumnCount + column > maxShortcut - 1 || row < 0 || column < 0) {
                tempArray.push(item);
            } else {
                allShortcuts[row * oldColumnCount + column] = item;
            }
        }
    }
    for (i = 0; i < tempArray.length; i++) {
        allShortcuts.push(tempArray[i]);
    }
    scCache = desktop._scCache = [];
    for (i = 0, j = allShortcuts.length; i < j; i++) {
        item = allShortcuts[i];
        if (item) {
            if (i > maxShortcut - 1) {
                desktop.placeShortcut(item, -999, -999, false);
            } else {
                item._column = i % columnCount;
                item._row = Math.floor(i / columnCount);
                desktop.placeShortcut(item, item._column, item._row, false);
            }
        }
    }
}, refreshDom:function (dom) {
    var desktop = this, items = desktop._items;
    $invokeSuper.call(desktop, arguments);
    if (items) {
        var scCache = desktop._scCache, rowCount, columnCount, item, i, j;
        if (!scCache) {
            desktop.resetLayoutInfo();
            columnCount = desktop._columnCount;
            for (i = 0, j = items.size; i < j; i++) {
                item = items.get(i);
                desktop.placeShortcut(item, i % columnCount, Math.floor(i / columnCount));
            }
        } else {
            item = items.get(0);
            if (item) {
                var oldColumnCount = desktop._columnCount, oldRowCount = desktop._rowCount;
                desktop.resetLayoutInfo();
                columnCount = desktop._columnCount;
                rowCount = desktop._rowCount;
                if (oldColumnCount != columnCount || oldRowCount != rowCount) {
                    desktop.moveInvalidShortcut(columnCount, rowCount, oldColumnCount, oldRowCount);
                }
                desktop._columnCount = columnCount;
                desktop._rowCount = rowCount;
                var gridPaddingLeft = desktop._gridPaddingLeft, gridPaddingTop = desktop._gridPaddingTop;
                scCache = desktop._scCache;
                for (i = 0; i < columnCount; i++) {
                    var columnCache = scCache[i];
                    if (columnCache) {
                        for (j = 0; j < rowCount; j++) {
                            var shortcut = columnCache[j];
                            if (shortcut) {
                                var $cut = $fly(shortcut._dom);
                                $cut.css({left:desktop._leftStart + i * ($cut.outerWidth(true) + gridPaddingLeft), top:desktop._topStart + j * ($cut.outerHeight(true) + gridPaddingTop)});
                            }
                        }
                    }
                }
            }
        }
    }
}});

