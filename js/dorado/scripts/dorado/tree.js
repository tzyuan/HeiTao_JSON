


dorado.widget.tree = {};
dorado.widget.tree.BaseNodeList = $extend(dorado.util.KeyedArray, {$className:"dorado.widget.tree.BaseNodeList", constructor:function (parent, getKeyFunction) {
    $invokeSuper.call(this, [getKeyFunction]);
    this.parent = parent;
}, beforeInsert:function (node) {
    var parentNode = node._parent = this.parent;
    var originHasChild = parentNode.get("hasChild");
    node._setTree(parentNode._tree);
    return {parentNode:parentNode, originHasChild:originHasChild};
}, afterInsert:function (node, ctx) {
    var parentNode = ctx.parentNode, originHasChild = ctx.originHasChild, tree = parentNode._tree;
    parentNode._changeVisibleChildNodeCount(1 + ((node._expanded) ? node._visibleChildNodeCount : 0));
    if (tree && (parentNode._expanded || !originHasChild) && tree._rendered && tree._attached && tree._autoRefreshLock < 1) {
        tree._nodeInserted(node);
    }
}, beforeRemove:function (node) {
    var tree = node._tree, parentNode = this.parent, index = this.indexOf(node);
    if (tree && node == tree.get("currentNode") && parentNode) {
        var newCurrent;
        var size = parentNode._nodes.size;
        if (size == 1) {
            newCurrent = (parentNode == tree._root) ? null : parentNode;
        } else {
            var i = 0;
            if (index < size - 1) {
                i = index + 1;
            } else {
                if (index > 0) {
                    i = index - 1;
                }
            }
            newCurrent = parentNode._nodes.get(i);
        }
        tree.set("currentNode", newCurrent);
    }
    node._setTree(null);
    delete node._parent;
    return {parentNode:parentNode, index:index};
}, afterRemove:function (node, ctx) {
    var parentNode = ctx.parentNode, index = ctx.index, tree = parentNode._tree;
    parentNode._changeVisibleChildNodeCount(-1 - ((node._expanded) ? node._visibleChildNodeCount : 0));
    if (tree && parentNode._expanded && tree._rendered && tree._attached && tree._autoRefreshLock < 1) {
        tree._nodeRemoved(node, parentNode, index);
    }
}, clone:function () {
    var cloned = $invokeSuper.call(this);
    delete cloned.parent;
    return cloned;
}});
dorado.widget.tree.BaseNode = $extend(dorado.widget.ViewElement, {$className:"dorado.widget.tree.BaseNode", _visibleChildNodeCount:0, ATTRIBUTES:{tree:{readOnly:true}, parent:{}, nodes:{setter:function (nodes) {
    this.clearChildren();
    this.addNodes.call(this, nodes);
}}, firstNode:{readOnly:true, getter:function () {
    return this._expanded ? this._nodes.get(0) : null;
}}, label:{}, icon:{}, iconClass:{}, expandedIcon:{}, expandedIconClass:{}, checkable:{}, checked:{defaultValue:false, setter:function (checked) {
    if (this._checked === checked) {
        return;
    }
    var tree = this._tree, arg = {node:this, processDefault:true};
    if (tree) {
        tree.fireEvent("beforeNodeCheckedChange", tree, arg);
        if (!arg.processDefault) {
            return;
        }
    }
    this._checked = checked;
    if (tree) {
        tree.fireEvent("onNodeCheckedChange", tree, arg);
    }
    if (this.get("checkable")) {
        this._nodeCheckedChanged(this._checked, true, true);
    }
}}, autoCheckChildren:{defaultValue:true}, tip:{}, data:{}, hasChild:{getter:function () {
    return (this._nodes.size > 0) || this._hasChild;
}}, expanded:{skipRefresh:true, setter:function (expanded) {
    if (this._tree) {
        (expanded) ? this.expandAsync() : this.collapse();
    } else {
        this._expanded = expanded;
    }
}}, expanding:{readOnly:true}, visible:{readOnly:true, getter:function () {
    if (!this._tree) {
        return false;
    }
    var parent = this._parent;
    while (parent) {
        if (!parent._expanded) {
            return false;
        }
        parent = parent._parent;
    }
    return true;
}}, userData:{}, level:{readOnly:true, getter:function () {
    var n = this, level = -1;
    while (n) {
        level++;
        n = n._parent;
    }
    return level;
}}}, constructor:function (config) {
    this._uniqueId = dorado.Core.newId();
    this._nodes = new dorado.widget.tree.BaseNodeList(this, function (element) {
        return element._uniqueId;
    });
    if (config && config.constructor == String) {
        this._label = config;
    }
    $invokeSuper.call(this, arguments);
}, _setTree:function (tree) {
    if (this._tree != tree) {
        var oldTree = this._tree;
        if (oldTree != null && oldTree.onNodeDetached) {
            oldTree.onNodeDetached(this);
        }
        if (oldTree) {
            oldTree.unregisterInnerViewElement(this);
        }
        this._tree = tree;
        if (tree != null && tree.onNodeAttached) {
            tree.onNodeAttached(this);
        }
        if (tree) {
            tree.registerInnerViewElement(this);
        }
        this._nodes.each(function (child) {
            child._setTree(tree);
        });
    }
}, _changeVisibleChildNodeCount:function (diff) {
    if (isNaN(diff)) {
        return;
    }
    this._visibleChildNodeCount += diff;
    if (this._expanded) {
        this._timestamp = dorado.Core.getTimestamp();
    }
    var n = this, p = n._parent;
    while (p && n._expanded) {
        p._visibleChildNodeCount += diff;
        n = p, p = p._parent;
    }
}, doSet:function (attr, value) {
    $invokeSuper.call(this, arguments);
    var def = this.ATTRIBUTES[attr];
    if (def && !def.skipRefresh) {
        this._timestamp = dorado.Core.getTimestamp();
        this.refresh();
    }
}, getTimestamp:function () {
    return this._timestamp;
}, _nodeCheckedChanged:function (checked, processChildren, processParent) {
    var tree = this._tree;
    if (!tree) {
        return;
    }
    if (processChildren && this.get("autoCheckChildren")) {
        if (!tree._autoChecking) {
            tree._autoCheckingChildren = true;
        }
        if (tree._autoCheckingChildren) {
            tree._autoCheckingParent = false;
            tree._autoChecking = true;
            this._nodes.each(function (child) {
                if (child.get("checkable")) {
                    child.set("checked", checked);
                }
            });
            tree._autoChecking = false;
        }
    }
    if (processParent) {
        var parent = this._parent;
        if (parent.get("autoCheckChildren")) {
            if (!tree._autoChecking) {
                tree._autoCheckingParent = true;
            }
            if (tree._autoCheckingParent && parent && parent.get("checkable")) {
                tree._autoCheckingChildren = false;
                var checkedCount = 0, checkableCount = 0, halfCheck = false, self = this;
                parent._nodes.each(function (child) {
                    if (child.get("checkable")) {
                        checkableCount++;
                        var c = (child == self) ? checked : child.get("checked");
                        if (c === true) {
                            checkedCount++;
                        } else {
                            if (c == null) {
                                halfCheck = true;
                            }
                        }
                    }
                });
                if (checkableCount) {
                    tree._autoChecking = true;
                    var c = null;
                    if (!halfCheck) {
                        c = (checkedCount == 0) ? false : ((checkedCount == checkableCount) ? true : null);
                    }
                    parent.set("checked", c);
                    tree._autoChecking = false;
                }
            }
        }
    }
}, refresh:function () {
    var tree = this._tree;
    if (tree && tree._rendered && tree._attached && tree._ignoreRefresh < 1 && tree._autoRefreshLock < 1) {
        dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", function () {
            tree.refreshNode(this);
        }, 50);
    }
}, createChildNode:function (config) {
    return new dorado.widget.tree.Node(config);
}, addNode:function (node, insertMode, refData) {
    if (node instanceof dorado.widget.tree.BaseNode) {
        this._nodes.insert(node, insertMode, refData);
    } else {
        node = this.createChildNode(node);
        this._nodes.insert(node, insertMode, refData);
    }
    if (node.get("checkable")) {
        node._nodeCheckedChanged(node.get("checked"), false, true);
    }
    return node;
}, addNodes:function (nodeConfigs) {
    for (var i = 0; i < nodeConfigs.length; i++) {
        this.addNode(nodeConfigs[i]);
    }
}, remove:function () {
    if (this._parent) {
        if (this.get("checkable")) {
            this._nodeCheckedChanged(false, false, true);
        }
        this._parent._nodes.remove(this);
    }
}, clearChildren:function () {
    this._nodes.clear();
}, _expand:function (callback) {
    this._expanded = true;
    this._expanding = false;
    this._timestamp = dorado.Core.getTimestamp();
    if (this._parent) {
        this._parent._changeVisibleChildNodeCount(this._visibleChildNodeCount);
    }
    this._tree._nodeExpanded(this, callback);
    this._hasExpanded = true;
}, doExpand:function (callback) {
    this._expand(callback);
}, doExpandAsync:function (callback) {
    this._expand(callback);
}, expand:function (callback) {
    if (this._expanded || !this._tree) {
        $callback(callback);
        return;
    }
    var tree = this._tree;
    var eventArg = {async:false, node:this, processDefault:true};
    tree.fireEvent("beforeExpand", tree, eventArg);
    if (!eventArg.processDefault) {
        return;
    }
    this._expandingCounter++;
    try {
        if (this.doExpand) {
            this.doExpand(callback);
        }
    }
    finally {
        this._expandingCounter--;
    }
    tree.fireEvent("onExpand", tree, eventArg);
}, expandAsync:function (callback) {
    if (this._expanded || !this._tree) {
        $callback(callback);
        return;
    }
    var tree = this._tree, self = this, called = false;
    var callDefault = function (success, result) {
        if (called) {
            return;
        }
        called = true;
        self._expanding = false;
        tree._expandingCounter--;
        if (success === false) {
            $callback(callback, false, result);
        } else {
            self.doExpandAsync({callback:function (success, result) {
                $callback(callback, success, result);
                delete eventArg.callback;
                tree.fireEvent("onExpand", tree, eventArg);
            }});
        }
    };
    this._expanding = true;
    this._timestamp = dorado.Core.getTimestamp();
    tree.refreshNode(this);
    var eventArg = {async:true, node:this, callDefault:callDefault, processDefault:true};
    if (tree.getListenerCount("beforeExpand")) {
        tree.fireEvent("beforeExpand", tree, eventArg);
        if (!eventArg.processDefault) {
            this._expanding = false;
            this._timestamp = dorado.Core.getTimestamp();
            tree.refreshNode(this);
        }
    } else {
        this._expandingCounter++;
        callDefault();
    }
}, doCollapse:function () {
    this._expanded = false;
    this._timestamp = dorado.Core.getTimestamp();
    if (this._parent) {
        this._parent._changeVisibleChildNodeCount(-this._visibleChildNodeCount);
    }
    this._tree._nodeCollapsed(this);
}, collapse:function () {
    if (!this._expanded) {
        return;
    }
    var tree = this._tree;
    var eventArg = {node:this, processDefault:true};
    if (tree) {
        tree.fireEvent("beforeCollapse", tree, eventArg);
    }
    if (!eventArg.processDefault) {
        return;
    }
    this.doCollapse();
    if (tree) {
        tree.fireEvent("onCollapse", tree, eventArg);
    }
}, highlight:function (options, speed) {
    if (this._tree) {
        this._tree.highlightItem(this, options, speed);
    }
}, expandParents:function () {
    var parent = this._parent;
    while (parent) {
        if (!parent.get("expanded")) {
            parent.expand();
        }
        parent = parent._parent;
    }
}, clone:function () {
    var cloned = $invokeSuper.call(this);
    delete cloned._tree;
    delete cloned._parent;
    this._nodes.each(function (node) {
        cloned.addNode(node.clone());
    });
    return cloned;
}});
dorado.widget.tree.Node = $extend([dorado.widget.tree.BaseNode, dorado.EventSupport], {$className:"dorado.widget.tree.Node", _setTree:function (tree) {
    if (this._tree !== tree && this._id) {
        var oldTree = this._tree, oldView, newView;
        if (oldTree) {
            delete oldTree._identifiedNodes[this._id];
            oldView = oldTree.get("view");
        }
        if (tree) {
            tree._identifiedNodes[this._id] = this;
            newView = tree.get("view");
        }
        if (oldView !== newView) {
            $invokeSuper.call(this, [tree]);
            return;
        }
    }
    $invokeSuper.call(this, [tree]);
}, getListenerScope:function () {
    var tree = this.get("view");
    return (tree && tree.get("view")) || $topView;
}});
dorado.widget.tree.DataNode = $extend(dorado.widget.tree.BaseNode, {$className:"dorado.widget.tree.DataNode", ATTRIBUTES:{data:{setter:function (data) {
    if (this._data) {
        delete this._data._node;
    }
    if (!(data instanceof dorado.Entity)) {
        data = new dorado.Entity(data);
    }
    data._node = this;
    this._data = data;
}}}, createChildNode:function (config) {
    return new dorado.widget.tree.DataNode(config);
}, getTimestamp:function () {
    return ((this._data) ? this._data.timestamp : 0) + this._timestamp;
}, _getEntityProperty:function (entity, property) {
    if (!entity || !property) {
        return null;
    }
    return (entity instanceof dorado.Entity) ? entity.get(property) : entity[property];
}, _getEntityPropertyText:function (entity, property) {
    if (!entity || !property) {
        return null;
    }
    return (entity instanceof dorado.Entity) ? entity.getText(property) : entity[property];
}});
dorado.widget.tree.TreeNodeIterator = $extend(dorado.util.Iterator, {$className:"dorado.widget.tree.TreeNodeIterator", constructor:function (root, options) {
    var nextIndex = (options && options.nextIndex > 0) ? options.nextIndex : 0;
    var includeInvisibleNodes = this.includeInvisibleNodes = options ? !!options.includeInvisibleNodes : false;
    this._iterators = [root._nodes.iterator()];
    if (nextIndex > 0) {
        var skiped = 0, it = this._iterators.peek();
        while (skiped < nextIndex) {
            var node = it.next(), processChildren = false;
            if (node) {
                var tmpSkiped = skiped + ((node._expanded || includeInvisibleNodes) ? (1 + node._visibleChildNodeCount) : 1);
                if (tmpSkiped < nextIndex) {
                    skiped = tmpSkiped;
                } else {
                    if (tmpSkiped == nextIndex) {
                        while ((node._expanded || includeInvisibleNodes) && node._nodes.size > 0) {
                            it = node._nodes.iterator();
                            it.last();
                            this._iterators.push(it);
                            node = node._nodes.get(node._nodes.size - 1);
                        }
                        break;
                    } else {
                        processChildren = true;
                        skiped++;
                    }
                }
            } else {
                processChildren = true;
            }
            if (processChildren) {
                var node = it.current();
                if (!node || (!node._expanded && !includeInvisibleNodes) || node._nodes.size == 0) {
                    break;
                }
                it = node._nodes.iterator();
                this._iterators.push(it);
            }
        }
    }
}, _findLastSubNode:function (node) {
    var its = this._iterators;
    while ((node._expanded || this.includeInvisibleNodes) && node._nodes.size > 0) {
        var it = node._nodes.iterator();
        it.last();
        its.push(it);
        node = it.previous();
    }
    return node;
}, first:function () {
    var its = this._iterators;
    its.splice(1, its.length - 1);
    its[0].first();
}, last:function () {
    var its = this._iterators;
    its.splice(1, its.length - 1);
    its[0].last();
    var node = its[0].previous();
    if (node) {
        this._findLastSubNode(node);
        its.peek().last();
    }
}, hasPrevious:function () {
    return (this._iterators.length > 1 || this._iterators[0].hasPrevious());
}, hasNext:function () {
    var its = this._iterators;
    var current = its.peek().current();
    if (current && current._nodes.size > 0 && (current._expanded || this.includeInvisibleNodes)) {
        return true;
    }
    for (var i = its.length - 1; i >= 0; i--) {
        if (its[i].hasNext()) {
            return true;
        }
    }
    return false;
}, previous:function () {
    var its = this._iterators;
    var node = its.peek().previous();
    if (node) {
        node = this._findLastSubNode(node);
    } else {
        if (its.length > 1) {
            its.pop();
            node = its.peek().current();
        } else {
            node = null;
        }
    }
    return node;
}, next:function () {
    var node, current, its = this._iterators;
    current = its.peek().current();
    if (current && current._nodes.size > 0 && (current._expanded || this.includeInvisibleNodes)) {
        its.push(current._nodes.iterator());
    }
    for (var i = its.length - 1; i >= 0; i--) {
        node = its[i].next();
        if (node) {
            break;
        }
        if (its.length > 1) {
            its.pop();
        }
    }
    return node;
}, createBookmark:function () {
    var subBookmarks = [];
    for (var i = 0; i < this._iterators.length; i++) {
        subBookmarks.push(this._iterators[i].createBookmark());
    }
    return {subIterators:this._iterators.slice(0), subBookmarks:subBookmarks};
}, restoreBookmark:function (bookmark) {
    this._iterators = bookmark.subIterators;
    for (var i = 0; i < this._iterators.length; i++) {
        this._iterators[i].restoreBookmark(bookmark.subBookmarks[i]);
    }
}});
dorado.widget.tree.TreeNodeIterator.getNodeIndex = function (node) {
    var index = -1, p = node._parent;
    while (p) {
        if (!p._expanded && !this.includeInvisibleNodes) {
            return -1;
        }
        var it = p._nodes.iterator();
        index++;
        while (it.hasNext()) {
            var n = it.next();
            if (n == node) {
                break;
            }
            index++;
            if (n._expanded || this.includeInvisibleNodes) {
                index += n._visibleChildNodeCount;
            }
        }
        node = p;
        p = node._parent;
    }
    return index;
};
dorado.widget.tree.ItemModel = $extend(dorado.widget.list.ItemModel, {$className:"dorado.widget.tree.ItemModel", constructor:function () {
    this._itemMap = {};
    $invokeSuper.call(this, arguments);
}, onNodeAttached:function (node) {
    this._itemMap[node._uniqueId] = node;
}, onNodeDetached:function (node) {
    delete this._itemMap[node._uniqueId];
}, iterator:function (startIndex) {
    var index = startIndex;
    if (index === undefined) {
        index = this._startIndex || 0;
    }
    var it = new dorado.widget.tree.TreeNodeIterator(this._root, {nextIndex:index});
    return it;
}, getItems:function () {
    return this._root;
}, setItems:function (root) {
    this._root = root;
}, getItemCount:function () {
    var root = this._root;
    return (root._expanded) ? root._visibleChildNodeCount : 0;
}, getItemAt:function (index) {
    return new dorado.widget.tree.TreeNodeIterator(this._root, {nextIndex:index}).next();
}, getItemIndex:dorado.widget.tree.TreeNodeIterator.getNodeIndex, getItemId:function (node) {
    return node._uniqueId;
}, getItemById:function (itemId) {
    return this._itemMap[itemId];
}});
dorado.widget.tree.TreeNodeRenderer = $extend(dorado.Renderer, {createIconDom:function (tree) {
    var icon = document.createElement("LABEL");
    icon.className = "node-icon";
    icon.style.display = "inline-block";
    icon.innerHTML = "&nbsp;";
    return icon;
}, getLabel:function (node, arg) {
    return node.get("label");
}, renderLabel:function (labelDom, label, node) {
    var tree = node._tree, arg = {dom:labelDom, label:label, node:node, processDefault:(tree.getListenerCount("onRenderNode") == 0)};
    if (tree) {
        tree.fireEvent("onRenderNode", tree, arg);
    }
    if (arg.processDefault) {
        labelDom.innerText = label;
        labelDom.title = node.get("tip") || "";
    }
}, createCheckboxDom:function (tree) {
    return new dorado.widget.CheckBox({iconOnly:true, triState:true, onValueChange:function (self, arg) {
        var row = tree.findItemDomByEvent(self.getDom());
        var node = $fly(row).data("item");
        var checked = self.get("checked");
        node.set("checked", (checked == null || checked));
        self.set("checked", node.get("checked"));
    }});
}, doRender:function (cell, node, arg) {
    if (node._expanded && node._nodesData && !node._nodesData._observer) {
        node.resetChildren();
        node._expanded = false;
        setTimeout(function () {
            node.expandAsync();
        }, 0);
    }
    var tree = node._tree, level = node.get("level"), hasChild = node.get("hasChild");
    var container = (cell.tagName.toLowerCase() == "div") ? cell : cell.firstChild;
    container.style.paddingLeft = ((level - 1) * tree._indent) + "px";
    if (tree._showLines) {
        var linesContainer = container.firstChild, lines = [];
        linesContainer.style.width = (level * tree._indent) + "px";
        linesContainer.style.height = tree._rowHeight + "px";
        var n = node, i = 0;
        while (n && n._parent) {
            var p = n._parent, pNodes = p._nodes;
            if (i == 0) {
                if (pNodes.get(pNodes.size - 1) == n) {
                    lines.push(hasChild ? 31 : 3);
                } else {
                    if (pNodes.get(0) == n && level == 1) {
                        lines.push(hasChild ? 11 : 1);
                    } else {
                        lines.push(hasChild ? 21 : 2);
                    }
                }
            } else {
                if (pNodes.get(pNodes.size - 1) != n) {
                    lines.push(4);
                } else {
                    lines.push(0);
                }
            }
            i++;
            n = p;
        }
        for (var i = 0; i < level; i++) {
            var line = $DomUtils.getOrCreateChild(linesContainer, i, function () {
                var line = $DomUtils.xCreate({tagName:"LABEL", style:{background:"no-repeat center center", display:"inline-block", width:tree._indent, height:"100%"}});
                return line;
            });
            var lineType = lines[level - i - 1];
            if (lineType) {
                line.style.backgroundImage = "url(" + $url("skin>tree/tree-line" + lineType + ".gif") + ")";
            } else {
                line.style.backgroundImage = "";
            }
            $DomUtils.removeChildrenFrom(linesContainer, level);
        }
    }
    var cls = ["collapse-button", "expand-button"], buttonDomIndex = (tree._showLines) ? 1 : 0;
    var buttonDom = container.childNodes[buttonDomIndex], $buttonDom = jQuery(buttonDom);
    if (hasChild) {
        if (node._expanded) {
            cls.reverse();
        }
        $buttonDom.removeClass(cls[0]).addClass(cls[1]);
    } else {
        $buttonDom.removeClass(cls[0]).removeClass(cls[1]);
    }
    $buttonDom.toggleClass("button-expanding", !!node._expanding);
    var icon, iconClass;
    if (node._expanded) {
        icon = node.get("expandedIcon") || tree._defaultExpandedIcon;
        iconClass = node.get("expandedIconClass") || tree._defaultExpandedIconClass;
    }
    icon = icon || node.get("icon") || tree._defaultIcon;
    iconClass = iconClass || node.get("iconClass") || tree._defaultIconClass;
    var iconDomIndex = buttonDomIndex + 1;
    if (container.doradoHasIcon) {
        if (!icon && !iconClass) {
            $fly(container.childNodes[iconDomIndex]).remove();
            container.doradoHasIcon = false;
        }
    } else {
        if (icon || iconClass) {
            container.insertBefore(this.createIconDom(tree), container.childNodes[iconDomIndex]);
            container.doradoHasIcon = true;
        }
    }
    var iconDom = container.childNodes[iconDomIndex];
    if (icon) {
        $DomUtils.setBackgroundImage(iconDom, icon);
    } else {
        if (iconClass) {
            iconDom.className = "node-icon " + iconClass;
        }
    }
    var checkable = node.get("checkable"), checkbox;
    if (container.subCheckboxId) {
        checkbox = dorado.widget.ViewElement.ALL[container.subCheckboxId];
        if (!checkable) {
            checkbox.destroy();
            container.subCheckboxId = null;
        }
    } else {
        if (checkable) {
            checkbox = this.createCheckboxDom(tree), checkboxIndex = container.doradoHasIcon ? iconDomIndex + 1 : iconDomIndex;
            checkbox.render(container, container.childNodes[checkboxIndex]);
            tree.registerInnerControl(checkbox);
            container.subCheckboxId = checkbox._uniqueId;
        }
    }
    if (checkable && checkbox) {
        checkbox.set("checked", node.get("checked"));
        checkbox.refresh();
    }
    this.renderLabel(container.lastChild, this.getLabel(node, arg), node);
}, render:function (row, node, arg) {
    this.doRender(row.firstChild, node, arg);
}});
dorado.widget.AbstractTree = $extend(dorado.widget.RowList, {$className:"dorado.widget.AbstractTree", selectable:false, ATTRIBUTES:{rowHeight:{defaultValue:dorado.Browser.isTouch ? ($setting["touch.Tree.defaultRowHeight"] || 30) : ($setting["widget.Tree.defaultRowHeight"] || 22)}, root:{readOnly:true}, nodes:{setter:function (nodes) {
    this._root.clearChildren();
    this._root.addNodes(nodes);
}, getter:function () {
    return this._root._nodes;
}}, currentNode:{skipRefresh:true, setter:function (node) {
    if (this._currentNode == node) {
        return;
    }
    if (node == this._root) {
        node = null;
    }
    var eventArg = {oldCurrent:this._currentNode, newCurrent:node, processDefault:true};
    this.fireEvent("beforeCurrentChange", this, eventArg);
    if (!eventArg.processDefault) {
        return;
    }
    this._currentNode = node;
    this.fireEvent("onCurrentChange", this, eventArg);
    if (this._rendered) {
        $setTimeout(this, function () {
            var row = node ? this._itemDomMap[node._uniqueId] : null;
            this.setCurrentRow(row);
            if (row) {
                this.scrollCurrentIntoView();
            }
        }, 50);
    }
}}, indent:{defaultValue:18}, expandingMode:{defaultValue:"async", skipRefresh:true}, dropMode:{defaultValue:"onItem", setter:function (v) {
    if (v == "insertItems") {
        v = "onOrInsertItems";
    }
    this._dropMode = v;
}}, expandingAnimated:{defaultValue:true, skipRefresh:true}, defaultIcon:{}, defaultIconClass:{}, defaultExpandedIcon:{}, defaultExpandedIconClass:{}, showLines:{writeBeforeReady:true}, firstNode:{readOnly:true, getter:function () {
    return this._root.get("firstNode");
}}, view:{setter:function (view) {
    if (this._view == view) {
        return;
    }
    $invokeSuper.call(this, [view]);
    var nodes = this._identifiedNodes, oldView = this._view;
    for (var p in nodes) {
        if (nodes.hasOwnProperty(p)) {
            var node = nodes[p];
            if (oldView) {
                oldView.unregisterViewElement(node._id);
            }
            if (view) {
                view.registerViewElement(node._id, node);
            }
        }
    }
}}}, EVENTS:{beforeExpand:{disallowMultiListeners:true}, onExpand:{}, beforeCollapse:{}, onCollapse:{}, onNodeAttached:{}, onNodeDetached:{}, beforeCurrentChange:{}, onCurrentChange:{}, onRenderNode:{}, beforeNodeCheckedChange:{}, onNodeCheckedChange:{}}, constructor:function () {
    this._identifiedNodes = {};
    var root = this._root = this.createRootNode();
    root._setTree(this);
    root._expanded = true;
    this._autoRefreshLock = 0;
    this._expandingCounter = 0;
    $invokeSuper.call(this, arguments);
}, destroy:function () {
    if (this._scrollMode != "viewport") {
        this._root._setTree(null);
    }
    $invokeSuper.call(this, arguments);
}, createRootNode:function () {
    return new dorado.widget.tree.BaseNode({label:"<ROOT>"});
}, clearNodes:function () {
    this._root.clearChildren();
}, createItemModel:function () {
    var im = new dorado.widget.tree.ItemModel();
    im.setItems(this._root);
    return im;
}, createItemDom:function (node) {
    var row = node._dom;
    if (!row || row.parentNode != null) {
        row = document.createElement("TR");
        row.className = "row";
        row.style.height = this._rowHeight + "px";
        if (this._scrollMode == "lazyRender" && this._shouldSkipRender) {
            row._lazyRender = true;
        } else {
            this.createItemDomDetail(row, node);
        }
    }
    return row;
}, createItemDomDetail:function (row, node) {
    var tree = node._tree, rowHeight = tree._rowHeight + "px";
    var cellConfig = {tagName:"TD", className:"d-tree-node", vAlign:"center", content:{tagName:"DIV", style:{position:"relative", height:rowHeight, lineHeight:rowHeight}, content:[{tagName:"LABEL", contextKey:"buttonDom", doradoType:"tree-button", className:"node-button", style:{display:"inline-block", position:"relative"}, content:{tagName:"div", className:"spinner"}}, {tagName:"LABEL", className:"node-label", style:{display:"inline-block"}}]}};
    if (tree._showLines) {
        cellConfig.content.content.insert({tagName:"DIV", className:"lines", style:{position:"absolute", left:0, top:0, height:"100%"}}, 0);
    }
    var context = {}, cell = $DomUtils.xCreate(cellConfig, null, context);
    var buttonDom = context.buttonDom, $buttonDom = jQuery(buttonDom), self = this;
    $buttonDom.mousedown(function () {
        return false;
    }).click(function () {
        var row = $DomUtils.findParent(buttonDom, function (parentNode) {
            return parentNode.tagName.toLowerCase() == "tr";
        });
        var node = $fly(row).data("item");
        if (node.get("hasChild")) {
            node._expandingAnimationEnabled = true;
            if (node._expanded) {
                node.collapse();
            } else {
                if (self._expandingMode == "sync") {
                    node.expand();
                } else {
                    node.expandAsync();
                }
            }
            node._expandingAnimationEnabled = false;
            $buttonDom.removeClass("expand-button-hover collapse-button-hover");
        }
        return false;
    }).hover(function () {
        if ($buttonDom.hasClass("expand-button")) {
            $buttonDom.addClass("expand-button-hover");
        }
        if ($buttonDom.hasClass("collapse-button")) {
            $buttonDom.addClass("collapse-button-hover");
        }
    }, function () {
        $buttonDom.removeClass("expand-button-hover collapse-button-hover");
    });
    row.appendChild(cell);
}, doRefreshItemDomData:function (row, node) {
    (this._renderer || $singleton(dorado.widget.tree.TreeNodeRenderer)).render(row, node);
}, getItemTimestamp:function (node) {
    return node.getTimestamp();
}, onNodeAttached:function (node) {
    if (!this._skipProcessCurrentNode && this._itemModel) {
        this._itemModel.onNodeAttached(node);
        if (this._root != node) {
            this.fireEvent("onNodeAttached", this, {node:node});
            if (!this.get("currentNode") && !this._allowNoCurrent) {
                this.set("currentNode", node);
            }
        }
    }
}, onNodeDetached:function (node) {
    if (!this._skipProcessCurrentNode && this._itemModel) {
        if (this.get("currentNode") == node) {
            this.set("currentNode", null);
        }
        this._itemModel.onNodeDetached(node);
        if (this._root != node) {
            this.fireEvent("onNodeDetached", this, {node:node});
        }
    }
}, refreshItemDoms:function (tbody, reverse, fn) {
    if (this._duringAnimation) {
        return;
    }
    return $invokeSuper.call(this, arguments);
}, refreshNode:function (node) {
    if (node) {
        dorado.Toolkits.cancelDelayedAction(node, "$refreshDelayTimerId");
    }
    if (this._autoRefreshLock > 0 || !this._itemDomMap) {
        return;
    }
    var row = this._itemDomMap[node._uniqueId];
    if (row) {
        this.refreshItemDomData(row, node);
    }
}, disableAutoRefresh:function () {
    this._autoRefreshLock++;
}, enableAutoRefresh:function () {
    this._autoRefreshLock--;
    if (this._autoRefreshLock < 0) {
        this._autoRefreshLock = 0;
    }
}, getNodeByEvent:function (event) {
    var row = this.findItemDomByEvent(event);
    return (row) ? $fly(row).data("item") : null;
}, getCheckedNodes:function (includeHalfChecked) {
    var it = new dorado.widget.tree.TreeNodeIterator(this._root, {includeInvisibleNodes:true}), nodes = [];
    while (it.hasNext()) {
        var node = it.next();
        var checked = node.get("checked");
        if (includeHalfChecked) {
            if (checked !== false) {
                nodes.push(node);
            }
        } else {
            if (checked) {
                nodes.push(node);
            }
        }
    }
    return nodes;
}, highlightItem:function (node, options, speed) {
    node = node || this.get("currentNode");
    if (!node || node._tree != this) {
        return;
    }
    var row = this._itemDomMap[node._uniqueId];
    if (row) {
        $fly(row.firstChild).effect("highlight", options || {color:"#FFFF80"}, speed || 1500);
    } else {
        if (!node._disableDelayHighlight) {
            var self = this;
            setTimeout(function () {
                node._disableDelayHighlight = true;
                self.highlightItem(node, options, speed);
                node._disableDelayHighlight = false;
            }, 100);
        }
    }
}, findItemDomByPosition:function (pos) {
    pos.y += this._container.scrollTop;
    return $invokeSuper.call(this, [pos]);
}, initDraggingIndicator:function (indicator, draggingInfo, evt) {
    if (this._dragMode != "control") {
        var itemDom = draggingInfo.get("element");
        if (itemDom) {
            var cell = itemDom.firstChild;
            var nodeDom = cell.firstChild;
            var contentDom = $DomUtils.xCreate({tagName:"div", className:"d-list-dragging-item " + cell.className});
            var children = [];
            for (var i = 1; i < nodeDom.childNodes.length; i++) {
                var child = nodeDom.childNodes[i];
                children.push(child);
            }
            $fly(children).clone().appendTo(contentDom);
            indicator.set("content", contentDom);
        }
    }
}, doOnDraggingSourceMove:function (draggingInfo, evt, targetObject, insertMode, refObject, itemDom) {
    var oldInsertMode = insertMode;
    if (itemDom) {
        if (insertMode) {
            var dom = this._dom, node = $fly(itemDom).data("item");
            if (insertMode == "after" && node._expanded && node._nodes.size) {
                targetObject = node;
                insertMode = "before";
                refObject = node.get("firstNode");
            } else {
                targetObject = node._parent;
            }
        }
        if (draggingInfo.get("sourceControl") == this) {
            var node = targetObject;
            while (node) {
                if (node == draggingInfo.get("object")) {
                    targetObject = null;
                    itemDom = null;
                    break;
                }
                node = node._parent;
            }
        }
    }
    if (itemDom) {
        return $invokeSuper.call(this, [draggingInfo, evt, targetObject, oldInsertMode, refObject, itemDom]);
    } else {
        return false;
    }
}, showDraggingInsertIndicator:function (draggingInfo, insertMode, itemDom) {
    function getNodeContentOffsetLeft(nodeDom) {
        return nodeDom.firstChild.firstChild.offsetLeft;
    }
    if (insertMode) {
        var insertIndicator = dorado.widget.AbstractList.getDraggingInsertIndicator();
        var dom = this._dom, node = $fly(itemDom).data("item");
        var left = getNodeContentOffsetLeft(itemDom);
        if (draggingInfo.get("targetObject") == $fly(itemDom).data("item")) {
            left += this._indent;
        }
        var width = dom.offsetWidth;
        if (dom.clientWidth < width) {
            width = dom.clientWidth;
        }
        width -= left;
        var top = (insertMode == "before") ? itemDom.offsetTop : (itemDom.offsetTop + itemDom.offsetHeight);
        $fly(insertIndicator).width(width).height(2).left(left).top(top - 1).show();
        dom.appendChild(insertIndicator);
    } else {
        $invokeSuper.call(this, arguments);
    }
}, processItemDrop:function (draggingInfo, evt) {
    var object = draggingInfo.get("object");
    var targetObject = draggingInfo.get("targetObject");
    var insertMode = draggingInfo.get("insertMode");
    var refObject = draggingInfo.get("refObject");
    if (object instanceof dorado.widget.tree.BaseNode && targetObject instanceof dorado.widget.tree.BaseNode) {
        this._skipProcessCurrentNode = (object._tree == this);
        object.remove();
        delete this._skipProcessCurrentNode;
        targetObject.addNode(object, insertMode, refObject);
        if (targetObject.get("expanded")) {
            this.set("currentNode", object);
            this.highlightItem(object);
        } else {
            this.set("currentNode", targetObject);
        }
        return true;
    }
    return false;
}});
(function () {
    var originJQueryFxUpdate = jQuery.fx.prototype.update;
    jQuery.fx.prototype.update = function () {
        originJQueryFxUpdate.apply(this, arguments);
        if (this.elem && this.elem.nodeName && this.elem.nodeName.toUpperCase() == "TR") {
            this.elem.style.display = "";
        }
    };
    dorado.widget.Tree = $extend(dorado.widget.AbstractTree, {$className:"dorado.widget.Tree", ATTRIBUTES:{className:{defaultValue:"d-tree"}, width:{defaultValue:200}}, getCurrentItem:function () {
        if (this._currentIndex >= 0) {
            return this._itemModel.getItemAt(this._currentIndex);
        }
    }, getCurrentItemId:function () {
        return (this._currentNode) ? this._currentNode._uniqueId : null;
    }, setCurrentItemDom:function (row) {
        this.set("currentNode", row ? $fly(row).data("item") : null);
        return true;
    }, doRefreshItemDomData:function (row, node) {
        $invokeSuper.call(this, arguments);
        if (this._scrollMode != "viewport") {
            node._dom = row;
        }
    }, removeItemDom:function (row) {
        var node = $fly(row).data("item");
        if (this._scrollMode != "viewport") {
            if (node && node._tree) {
                if (row.parentNode) {
                    row.parentNode.removeChild(row);
                }
            } else {
                $fly(row).remove();
            }
        } else {
            if (node) {
                delete node._dom;
            }
            $invokeSuper.call(this, arguments);
        }
    }, createExpandingIndicator:function () {
        var row = this._expandingIndicator;
        if (row == null) {
            this._expandingIndicator = row = $DomUtils.xCreate({tagName:"TR", className:"d-tree-expanding-placeholder", content:"^TD"});
        }
        return row;
    }, _refreshRearRows:function (fromRow) {
        if (fromRow && this._forceRefreshRearRows !== false) {
            var nextRow = fromRow, tbody = this._dataTBody;
            while (nextRow) {
                var item = $fly(nextRow).data("item");
                if (item) {
                    this.refreshItemDom(tbody, item, nextRow.sectionRowIndex);
                }
                nextRow = nextRow.nextSibling;
            }
        }
    }, _insertChildNodes:function (node, row, animated, callback) {
        function invokeCallback(refRow, callback, node) {
            this._refreshRearRows(refRow);
            this.updateModernScroller();
            this.notifySizeChange();
            if (callback) {
                $callback(callback, true, node);
            }
        }
        var tbody = this._dataTBody, refRow = row ? row.nextSibling : null;
        var it = new dorado.widget.tree.TreeNodeIterator(node), count = 0, bottom = -1;
        while (it.hasNext()) {
            var child = it.next();
            var newRow = this.createItemDom(child);
            if (animated && !this._duringAnimation) {
                newRow.style.display = "none";
            }
            (refRow) ? tbody.insertBefore(newRow, refRow) : tbody.appendChild(newRow);
            if (count > 10 && !this._shouldSkipRender) {
                if (bottom < 0) {
                    bottom = this._container.scrollTop + this._container.clientHeight;
                }
                if (newRow.offsetTop + newRow.offsetHeight > bottom) {
                    this._shouldSkipRender = true;
                }
            }
            this.refreshItemDom(tbody, child, newRow.sectionRowIndex);
            count++;
        }
        this._shouldSkipRender = false;
        if (animated && !this._duringAnimation) {
            var indicator = this.createExpandingIndicator(), self = this;
            indicator.style.height = 0;
            (refRow) ? tbody.insertBefore(indicator, refRow) : tbody.appendChild(indicator);
            this._duringAnimation = true;
            var highlightHoverRow = this._highlightHoverRow;
            this._highlightHoverRow = false;
            $fly(indicator).animate({"height":"+=" + (self._rowHeight * count)}, 200, "swing", function () {
                $fly(indicator).remove();
                it = new dorado.widget.tree.TreeNodeIterator(node);
                while (it.hasNext()) {
                    var child = it.next(), childRow = self._itemDomMap[child._uniqueId];
                    if (childRow) {
                        childRow.style.display = "";
                    }
                }
                invokeCallback.call(self, refRow, callback, node);
                self._duringAnimation = false;
                self._highlightHoverRow = highlightHoverRow;
            });
        } else {
            invokeCallback.call(this, refRow, callback, node);
        }
    }, _removeChildNodes:function (node, animated, callback) {
        function invokeCallback(node, callback) {
            if (this._forceRefreshRearRows !== false) {
                var row = this._itemDomMap[node._uniqueId];
                if (row) {
                    this._refreshRearRows(row);
                }
            }
            this.updateModernScroller();
            this.notifySizeChange();
            if (callback) {
                $callback(callback, true, node);
            }
        }
        var it = new dorado.widget.tree.TreeNodeIterator(node);
        var rowsToRemove = [];
        while (it.hasNext()) {
            var child = it.next();
            if (child == this._currentNode) {
                this.set("currentNode", node);
            }
            var childRow = this._itemDomMap[child._uniqueId];
            if (childRow) {
                rowsToRemove.push(childRow);
            }
        }
        if (rowsToRemove.length) {
            if (animated && !this._duringAnimation) {
                var indicator = this.createExpandingIndicator();
                indicator.style.height = (this._rowHeight * rowsToRemove.length) + "px";
                this._dataTBody.insertBefore(indicator, rowsToRemove[0]);
            }
            for (var i = 0; i < rowsToRemove.length; i++) {
                var childRow = rowsToRemove[i];
                this.removeItemDom(childRow);
            }
            if (animated && !this._duringAnimation) {
                var self = this;
                this._duringAnimation = true;
                var highlightHoverRow = this._highlightHoverRow;
                this._highlightHoverRow = false;
                $fly(indicator).animate({"height":0}, 200, "swing", function () {
                    $fly(indicator).remove();
                    invokeCallback.call(self, node, callback);
                    self._duringAnimation = false;
                    self._highlightHoverRow = highlightHoverRow;
                });
            }
        } else {
            invokeCallback.call(this, node, callback);
        }
    }, _refreshAndScroll:function (node, mode, parentNode, nodeIndex) {
        var shouldScroll = false, itemModel = this._itemModel;
        if (parentNode._expanded) {
            var row = this._itemDomMap[node._uniqueId];
            if (!row) {
                var index;
                if (mode == "remove") {
                    index = itemModel.getItemIndex(parentNode) + 1;
                    var it = parentNode._nodes.iterator();
                    var i = 0;
                    while (it.hasNext() && i < nodeIndex) {
                        var n = it.next();
                        index++, i++;
                        if (n._expanded) {
                            index += n._visibleChildNodeCount;
                        }
                    }
                } else {
                    index = itemModel.getItemIndex(node);
                }
                if (index >= 0) {
                    var startIndex = itemModel.getStartIndex();
                    switch (mode) {
                      case "insert":
                        if (index < startIndex) {
                            itemModel.setStartIndex(startIndex + node._visibleChildNodeCount + 1);
                            shouldScroll = true;
                        }
                        break;
                      case "remove":
                        if ((index + node._visibleChildNodeCount + 1) < startIndex) {
                            itemModel.setStartIndex(startIndex - node._visibleChildNodeCount - 1);
                            shouldScroll = true;
                        } else {
                            if (index < startIndex) {
                                itemModel.setStartIndex(index);
                                shouldScroll = true;
                            }
                        }
                        break;
                      case "expand":
                        if (index < startIndex) {
                            itemModel.setStartIndex(startIndex + node._visibleChildNodeCount);
                            shouldScroll = true;
                        }
                        break;
                      case "collapse":
                        if ((index + node._visibleChildNodeCount) < startIndex) {
                            itemModel.setStartIndex(startIndex - node._visibleChildNodeCount);
                            shouldScroll = true;
                        } else {
                            if (index < startIndex) {
                                itemModel.setStartIndex(index + 1);
                                shouldScroll = true;
                            }
                        }
                        break;
                    }
                }
            }
            this.refreshDom(this._dom);
            if (shouldScroll) {
                this._container.scrollTop = this._scrollTop = this._dataTBody.offsetTop;
            }
        } else {
            var refreshParent = false;
            switch (mode) {
              case "insert":
                refreshParent = parentNode._nodes.size == 1;
                break;
              case "remove":
                refreshParent = !parentNode.get("hasChild");
                break;
            }
            if (refreshParent) {
                var parentRow = this._itemDomMap[parentNode._uniqueId];
                if (parentRow) {
                    this._ignoreItemTimestamp = true;
                    this.refreshItemDomData(parentRow, parentNode);
                }
            }
        }
    }, _getExpandingAnimated:function (node) {
        return this._expandingAnimated && node._expandingAnimationEnabled;
    }, _nodeExpanded:function (node, callback) {
        if (!this._rendered || !this._attached || this._autoRefreshLock > 0) {
            $callback(callback);
            return;
        }
        if (this._scrollMode != "viewport") {
            if (node == this._root) {
                this._insertChildNodes(node, null, this._getExpandingAnimated(node), callback);
                this.notifySizeChange();
            } else {
                var row = this._itemDomMap[node._uniqueId];
                if (row) {
                    this._insertChildNodes(node, row, this._getExpandingAnimated(node), callback);
                    this.refreshItemDomData(row, node);
                } else {
                    if (callback) {
                        $callback(callback, true, node);
                    }
                }
            }
        } else {
            this._refreshAndScroll(node, "expand", node._parent);
            if (callback) {
                $callback(callback, true, node);
            }
        }
    }, _nodeCollapsed:function (node, callback) {
        if (!this._rendered || !this._attached || this._autoRefreshLock > 0) {
            $callback(callback);
            return;
        }
        if (this._scrollMode != "viewport") {
            this._removeChildNodes(node, this._getExpandingAnimated(node), callback);
            var row = this._itemDomMap[node._uniqueId];
            if (row) {
                this.refreshItemDomData(row, node);
            }
        } else {
            this._refreshAndScroll(node, "collapse", node._parent);
            if (callback) {
                $callback(callback, true, node);
            }
        }
    }, _nodeInserted:function (node) {
        if (!this._rendered || !this._attached || this._autoRefreshLock > 0) {
            return;
        }
        if (this._scrollMode != "viewport") {
            var parentNode = node._parent;
            if (parentNode._expanded) {
                var nodeIndex = this._itemModel.getItemIndex(node);
                if (nodeIndex >= 0) {
                    var originExpanded = node._expanded;
                    node._expanded = false;
                    try {
                        var it = new dorado.widget.tree.TreeNodeIterator(this._itemModel.getItems(), {nextIndex:nodeIndex});
                        it.next();
                        var nextsibling = it.next(), tbody = this._dataTBody, refRow;
                    }
                    finally {
                        node._expanded = originExpanded;
                    }
                    if (nextsibling) {
                        refRow = this._itemDomMap[nextsibling._uniqueId];
                    }
                    var newRow = this.createItemDom(node);
                    (refRow) ? tbody.insertBefore(newRow, refRow) : tbody.appendChild(newRow);
                    this.refreshItemDom(tbody, node, newRow.sectionRowIndex);
                    if (originExpanded) {
                        this._insertChildNodes(node, newRow);
                    }
                    this.notifySizeChange();
                }
            }
            if (parentNode && parentNode._nodes.size == 1) {
                var parentRow = this._itemDomMap[parentNode._uniqueId];
                if (parentRow) {
                    this._ignoreItemTimestamp = true;
                    this.refreshItemDomData(parentRow, parentNode);
                }
            }
        } else {
            this._refreshAndScroll(node, "insert", node._parent);
        }
    }, _nodeRemoved:function (node, parentNode, index) {
        if (!this._rendered || !this._attached || this._autoRefreshLock > 0) {
            return;
        }
        if (this._scrollMode != "viewport") {
            if (parentNode) {
                if (parentNode._expanded) {
                    this._forceRefreshRearRows = false;
                    if (node._expanded) {
                        this._removeChildNodes(node);
                    }
                    this._forceRefreshRearRows = true;
                    var row = this._itemDomMap[node._uniqueId];
                    if (row) {
                        var nextRow = row.nextSibling;
                        this.removeItemDom(row);
                        if (nextRow) {
                            this._refreshRearRows(nextRow);
                        }
                    }
                }
                if (!parentNode.get("hasChild")) {
                    var parentRow = this._itemDomMap[parentNode._uniqueId];
                    if (parentRow) {
                        this._ignoreItemTimestamp = true;
                        this.refreshItemDomData(parentRow, parentNode);
                    }
                }
                this.notifySizeChange();
            }
        } else {
            this._refreshAndScroll(node, "remove", parentNode, index);
        }
    }});
})();
dorado.widget.tree.DataBindingNode = $extend(dorado.widget.tree.DataNode, {$className:"dorado.widget.tree.DataBindingNode", ATTRIBUTES:{bindingConfig:{writeOnce:true}, childBindingConfigs:{writeOnce:true, setter:function (v) {
    this._bindingConfig.childBindingConfigs = v;
}, getter:function () {
    return this._bindingConfig.childBindingConfigs;
}}, childrenPrepared:{}, hasChild:{getter:function () {
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
    if (this._nodes.size > 0) {
        return true;
    }
    if (this._hasChild != undefined) {
        return this._hasChild;
    }
    if (this._bindingConfig.hasChildProperty != undefined) {
        return this._getEntityProperty(this._data, this._bindingConfig.hasChildProperty);
    }
    var hasChild = false, entity = this._data;
    if (entity && entity instanceof dorado.Entity) {
        if (this._bindingConfig.recursive) {
            hasChild = ifHasChild(entity, this._bindingConfig.childrenProperty);
        }
        if (!hasChild && this._bindingConfig.childBindingConfigs) {
            var childBindingConfigs = this._bindingConfig.childBindingConfigs;
            if (childBindingConfigs) {
                for (var i = 0; i < childBindingConfigs.length; i++) {
                    hasChild = ifHasChild(entity, childBindingConfigs[i].childrenProperty);
                    if (hasChild) {
                        break;
                    }
                }
            }
        }
    }
    return hasChild;
}}, label:{getter:function () {
    if (this._label) {
        return this._label;
    }
    return this._getEntityPropertyText(this._data, this._bindingConfig.labelProperty);
}}, icon:{getter:function () {
    if (this._icon) {
        return this._icon;
    }
    var bg = this._bindingConfig;
    if (bg.icon) {
        return bg.icon;
    }
    return this._getEntityProperty(this._data, bg.iconProperty);
}}, iconClass:{getter:function () {
    if (this._iconClass) {
        return this._iconClass;
    }
    var bg = this._bindingConfig;
    if (bg.iconClass) {
        return bg.iconClass;
    }
    return this._getEntityProperty(this._data, bg.iconClassProperty);
}}, expanededIcon:{getter:function () {
    if (this._expanededIcon) {
        return this._expanededIcon;
    }
    var bg = this._bindingConfig;
    if (bg.expanededIcon) {
        return bg.expanededIcon;
    }
    return this._getEntityProperty(this._data, bg.expanededIconProperty);
}}, expanededIconClass:{getter:function () {
    if (this._expanededIconClass) {
        return this._expanededIconClass;
    }
    var bg = this._bindingConfig;
    if (bg.expanededIconClass) {
        return bg.expanededIconClass;
    }
    return this._getEntityProperty(this._data, bg.expanededIconClassProperty);
}}, checkable:{getter:function () {
    return (this._checkable === undefined) ? this._bindingConfig.checkable : this._checkable;
}}, autoCheckChildren:{getter:function () {
    if (this._bindingConfig.autoCheckChildren != null) {
        return this._bindingConfig.autoCheckChildren;
    } else {
        return this._autoCheckChildren;
    }
}}, checked:{getter:function () {
    var bg = this._bindingConfig;
    if (bg.checkedProperty && this._data) {
        this._checked = this._getEntityProperty(this._data, bg.checkedProperty);
    }
    if (this._checked != undefined) {
        return this._checked;
    }
    return bg.checked;
}, setter:function (checked) {
    var currentChecked = this._checked, bg = this._bindingConfig;
    if (currentChecked == undefined) {
        currentChecked = bg.checked;
    }
    if (currentChecked === checked) {
        return;
    }
    $invokeSuper.call(this, arguments);
    var entity = this._data, property = bg.checkedProperty;
    if (entity && property) {
        (entity instanceof dorado.Entity) ? entity.set(property, checked) : entity[property] = checked;
    }
}}, tip:{getter:function () {
    if (this._tip) {
        return this._tip;
    }
    return this._getEntityPropertyText(this._data, this._bindingConfig.tipProperty);
}}}, _prepareChildren:function (callback) {
    function processBindingConfig(bindingConfig, entity, startIndex, processDefaultExpand) {
        function addNode(entity) {
            var eventArg = {data:entity, processDefault:true};
            tree.fireEvent("beforeDataNodeCreate", tree, eventArg);
            if (!eventArg.processDefault) {
                return;
            }
            var node = null, oldNode = null;
            if (startIndex < nodes.size) {
                node = nodes.get(startIndex);
                if (node._data != entity) {
                    oldNode = node;
                    node = null;
                }
            }
            if (!node) {
                node = new dorado.widget.tree.DataBindingNode({bindingConfig:bindingConfig, data:entity, tags:bindingConfig.tags});
                if (oldNode) {
                    nodes.replace(oldNode, node);
                } else {
                    nodes.insert(node);
                }
            } else {
                node._parent._changeVisibleChildNodeCount(1);
            }
            eventArg.node = node;
            tree.fireEvent("onDataNodeCreate", tree, eventArg);
            var expanded = expandedNodes[entity.entityId];
            if (expanded === true || node._expanded) {
                node._expanded = false;
                node.expandAsync();
            } else {
                if (processDefaultExpand) {
                    if (!bindingConfig.recursive) {
                        if (!bindingConfig.recursive && bindingConfig.expandLevel) {
                            node.expandAsync();
                        }
                    } else {
                        if (bindingConfig.expandLevel) {
                            var parentNode = node._parent, i = 0;
                            while (parentNode && parentNode._bindingConfig == bindingConfig) {
                                parentNode = parentNode._parent;
                                i++;
                            }
                            if (i < bindingConfig.expandLevel) {
                                node.expandAsync();
                            }
                        }
                    }
                }
            }
        }
        var tree = this._tree, nodes = this._nodes, expandedNodes = {}, currentNode = tree.get("currentNode");
        if (currentNode && currentNode._parent == this) {
            tree.set("currentNode", (this == tree._root) ? null : this);
        }
        for (var it = nodes.iterator(); it.hasNext(); ) {
            var node = it.next();
            if (node._data) {
                expandedNodes[node._data.entityId] = !!node._expanded;
            }
        }
        this._nodesData = entity;
        if (entity instanceof dorado.EntityList) {
            for (var it = entity.iterator({currentPage:true}); it.hasNext(); ) {
                var d = it.next();
                addNode(d);
                startIndex++;
            }
            return startIndex;
        } else {
            if (entity instanceof dorado.Entity) {
                addNode(entity);
                startIndex++;
            }
        }
        return startIndex;
    }
    function setPreloadConfigs(entity, property, preloadConfig) {
        if (entity.dataType) {
            var propertyDef = entity.dataType.getPropertyDef(property);
            if (propertyDef) {
                var sysParameter = propertyDef._sysParameter;
                if (!sysParameter) {
                    propertyDef._sysParameter = sysParameter = new dorado.util.Map();
                }
                sysParameter.put("preloadConfig", preloadConfig);
            }
        }
    }
    function clearPreloadConfigs(entity, property) {
        if (entity.dataType) {
            var propertyDef = entity.dataType.getPropertyDef(property);
            if (propertyDef) {
                var sysParameter = propertyDef._sysParameter;
                if (sysParameter) {
                    sysParameter.remove("preloadConfig");
                }
            }
        }
    }
    this._childrenPrepared = true;
    var bindingConfig = this._bindingConfig, tree = this._tree;
    var isRoot = (this == tree._root), data = this._data;
    if (isRoot && tree) {
        this._data = data = tree.getBindingData({firstResultOnly:true, acceptAggregation:true});
    }
    if (!data) {
        this.clearChildren();
        return;
    }
    var asyncTasks = [], self = this;
    if (callback && data instanceof dorado.Entity) {
        var processPreload = (this._parent == tree._root);
        if (bindingConfig.recursive && !isRoot) {
            asyncTasks.push(function (callback) {
                if (processPreload) {
                    var preloadConfigs = dorado.widget.DataTree.bindingConfigToPreloadConfig(bindingConfig, 0);
                    if (preloadConfigs) {
                        setPreloadConfigs(data, bindingConfig.childrenProperty, preloadConfigs);
                    }
                }
                data.getAsync(bindingConfig.childrenProperty, callback);
                clearPreloadConfigs(data, bindingConfig.childrenProperty);
            });
        }
        if (bindingConfig.childBindingConfigs) {
            for (var i = 0; i < bindingConfig.childBindingConfigs.length; i++) {
                var childBindingConfig = bindingConfig.childBindingConfigs[i];
                var childrenProperty = childBindingConfig.childrenProperty;
                asyncTasks.push(function (callback) {
                    if (processPreload) {
                        var preloadConfigs = dorado.widget.DataTree.bindingConfigToPreloadConfig(childBindingConfig, 0);
                        if (preloadConfigs) {
                            setPreloadConfigs(data, childrenProperty, preloadConfigs);
                        }
                    }
                    data.getAsync(childrenProperty, callback);
                    clearPreloadConfigs(data, childrenProperty);
                });
            }
        }
    }
    $waitFor(asyncTasks, {callback:function (success, result) {
        var nodesTimestamp = 0, infos = [];
        if (data instanceof dorado.Entity) {
            if (bindingConfig.recursive) {
                var e = (isRoot) ? data : data.get(bindingConfig.childrenProperty, callback ? "auto" : "always");
                if (e) {
                    nodesTimestamp += e.timestamp;
                    infos.push({bindingConfig:bindingConfig, data:e});
                }
            }
            if (bindingConfig.childBindingConfigs) {
                for (var i = 0; i < bindingConfig.childBindingConfigs.length; i++) {
                    var childBindingConfig = bindingConfig.childBindingConfigs[i];
                    var e = data.get(childBindingConfig.childrenProperty, callback ? "auto" : "always");
                    if (!e) {
                        continue;
                    }
                    nodesTimestamp += e.timestamp;
                    infos.push({bindingConfig:childBindingConfig, data:e});
                }
            }
        } else {
            if (isRoot) {
                var childBindingConfigs = bindingConfig.childBindingConfigs;
                if (childBindingConfigs && childBindingConfigs.length == 1) {
                    nodesTimestamp += data.timestamp;
                    infos.push({bindingConfig:childBindingConfigs[0], data:data});
                }
            }
        }
        if (self._nodesTimestamp != nodesTimestamp) {
            self._nodesTimestamp = nodesTimestamp;
            self._visibleChildNodeCount = 0;
            var startIndex = 0;
            if (tree) {
                tree.disableAutoRefresh();
            }
            try {
                for (var i = 0; i < infos.length; i++) {
                    var info = infos[i];
                    startIndex = processBindingConfig.call(self, info.bindingConfig, info.data, startIndex, !self._hasExpanded);
                }
                var nodes = self._nodes;
                for (var i = nodes.size - 1; i >= startIndex; i--) {
                    nodes.removeAt(i);
                }
            }
            finally {
                if (tree) {
                    tree.enableAutoRefresh();
                    tree._skipScrollCurrentIntoView = true;
                    tree.refresh(true);
                }
            }
        }
        if (callback) {
            $callback(callback, success, result);
        }
    }});
}, resetChildren:function () {
    this._nodes.clear();
    delete this._nodesTimestamp;
    this._childrenPrepared = false;
}, doExpand:function () {
    if (!this._childrenPrepared) {
        this._prepareChildren();
    }
    $invokeSuper.call(this, arguments);
}, doExpandAsync:function (callback) {
    if (!this._childrenPrepared) {
        var self = this, superClass = $getSuperClass();
        this._prepareChildren({callback:function (success, result) {
            superClass.prototype.doExpandAsync.call(self, callback);
        }});
    } else {
        $invokeSuper.call(this, arguments);
    }
}, doCollapse:function () {
    $invokeSuper.call(this, arguments);
    this.resetChildren();
}});
dorado.widget.DataTree = $extend([dorado.widget.Tree, dorado.widget.DataControl], {$className:"dorado.widget.DataTree", ATTRIBUTES:{bindingConfigs:{writeBeforeReady:true, setter:function (bindingConfigs) {
    this._root.set("childBindingConfigs", bindingConfigs);
}, getter:function () {
    return this._root.get("childBindingConfigs");
}}, currentNodeDataPath:{writeBeforeReady:true}, currentEntity:{setter:function (currentEntity) {
    var node = this.findNode(currentEntity);
    this.set("currentNode", node);
}, getter:function () {
    if (this._currentNode) {
        var data = this._currentNode._data;
        return (data instanceof dorado.Entity) ? data : null;
    }
    return null;
}}}, EVENTS:{beforeDataNodeCreate:{}, onDataNodeCreate:{}}, constructor:function () {
    this._entityMap = {};
    $invokeSuper.call(this, arguments);
}, getCurrentItem:function () {
    return this._currentNode;
}, onReady:function () {
    if (this._currentNodeDataPath) {
        var self = this;
        dorado.DataPath.registerInterceptor(this._currentNodeDataPath, function (data) {
            return self.get("currentNode.data");
        }, function (dataType) {
            var entity = self.get("currentNode.data");
            return entity ? entity.dataType : dataType;
        });
        this.bind("onCurrentChange", function () {
            self.disableBinding();
            self.get("dataSet").notifyObservers();
            self.enableBinding();
        });
    }
    $invokeSuper.call(this, arguments);
}, createRootNode:function () {
    return new dorado.widget.tree.DataBindingNode({label:"<ROOT>", bindingConfig:{}});
}, syncCurrentEntity:function () {
    var path = [];
    var entity = this.get("currentEntity");
    while (entity && entity.parent) {
        path.push({entityList:entity.parent, entity:entity});
        entity = entity.parent.parent;
    }
    jQuery.each(path.reverse(), function (i, section) {
        if (section.entityList.current != section.entity) {
            section.entityList.setCurrent(section.entity);
        }
    });
}, onNodeAttached:function (node) {
    $invokeSuper.call(this, arguments);
    if (node._data) {
        this._entityMap[node._data.entityId] = node;
    }
}, onNodeDetached:function (node) {
    $invokeSuper.call(this, arguments);
    if (node._data) {
        delete this._entityMap[node._data.entityId];
    }
}, refreshDom:function (dom) {
    var bindingConfigs = this.get("bindingConfigs");
    if (!bindingConfigs || !bindingConfigs.length) {
        throw new dorado.Exception("DataTree " + this._id + ".bindingConfigs is undefined.");
    }
    if (this._dataSet) {
        var data = this.getBindingData({firstResultOnly:true, acceptAggregation:true});
        if (!this._root._childrenPrepared || this._data != data || (this._data && this._data.pageNo != (this._pageNo || 0))) {
            this._data = data;
            this._pageNo = (data ? data.pageNo : 0);
            this._root._prepareChildren(dorado._NULL_FUNCTION);
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
}, processDataSetMessage:function (messageCode, arg, data) {
    switch (messageCode) {
      case dorado.widget.DataSet.MESSAGE_REFRESH:
        this.refresh(true);
        break;
      case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
        this.refresh(true);
        break;
      case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
      case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
        if (this.getBindingData() != this._data) {
            this.refresh(true);
        } else {
            this.refreshNodeByEntity(arg.entity);
        }
        break;
      case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
        this.refreshNodeByEntity(arg.entity);
        break;
      case dorado.widget.DataSet.MESSAGE_DELETED:
        var node = this.findNode(arg.entity);
        if (node) {
            node.remove();
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
        var parentNode;
        if (parentEntity instanceof dorado.Entity) {
            parentNode = this.findNode(parentEntity);
        }
        if (!parentNode && parentEntityList == this._root._data) {
            parentNode = this._root;
        }
        if (parentNode && parentNode._expanded) {
            this.disableAutoRefresh();
            parentNode._prepareChildren();
            this.enableAutoRefresh();
            this.refresh(true);
        }
        break;
      case dorado.widget.DataSet.MESSAGE_LOADING_START:
        if (!this._expandingCounter) {
            this.showLoadingTip();
        }
        break;
      case dorado.widget.DataSet.MESSAGE_LOADING_END:
        this.hideLoadingTip();
        break;
    }
}, refreshNodeByEntity:function (entity) {
    var node = this.findNode(entity);
    if (!node) {
        return;
    }
    this.refreshNode(node);
}, processItemDrop:function (draggingInfo, evt) {
    var object = draggingInfo.get("object");
    var targetObject = draggingInfo.get("targetObject");
    var insertMode = draggingInfo.get("insertMode");
    var refObject = draggingInfo.get("refObject");
    if (object instanceof dorado.widget.tree.DataBindingNode && targetObject instanceof dorado.widget.tree.DataBindingNode) {
        var sourceNode = object, targetNode = targetObject;
        var sourceEntity = sourceNode.get("data"), targetEntity = targetNode.get("data");
        var refNode, refEntity;
        if (refObject instanceof dorado.widget.tree.DataBindingNode) {
            refNode = refObject;
            refEntity = refNode.get("data");
        }
        var sourceBindingConfig = sourceNode.get("bindingConfig");
        var bindingConfig = targetNode.get("bindingConfig");
        var childBindingConfigs = targetNode.get("childBindingConfigs") || [];
        var childBindingConfig;
        if (sourceBindingConfig == bindingConfig || bindingConfig.recursive && childBindingConfigs.indexOf(sourceBindingConfig) >= 0) {
            childBindingConfig = sourceBindingConfig;
        } else {
            if (childBindingConfigs.length == 1 && !bindingConfig.recursive) {
                childBindingConfig = childBindingConfigs[0];
            } else {
                if (childBindingConfigs.length == 0 && bindingConfig.recursive) {
                    childBindingConfig = bindingConfig;
                }
            }
        }
        if (childBindingConfig) {
            var entityList;
            if (targetEntity instanceof dorado.EntityList) {
                entityList = targetEntity;
            } else {
                entityList = targetEntity.get(childBindingConfig.childrenProperty, "always");
            }
            if (entityList instanceof dorado.EntityList) {
                this._skipProcessCurrentNode = (object._tree == this);
                var originState = sourceEntity.state;
                sourceEntity.remove(true);
                delete this._skipProcessCurrentNode;
                if (originState != dorado.Entity.STATE_NEW) {
                    sourceEntity.setState(dorado.Entity.STATE_MOVED);
                }
                entityList.insert(sourceEntity, insertMode, refEntity);
                if (targetObject.get("expanded")) {
                    var newNode = this.findNode(sourceEntity);
                    if (newNode) {
                        this.set("currentNode", newNode);
                        this.highlightItem(newNode);
                    }
                } else {
                    this.set("currentNode", targetObject);
                }
            }
        }
    }
    return true;
}, findNode:function (entity) {
    if (entity) {
        return this._entityMap[entity.entityId];
    }
    return null;
}});
dorado.widget.DataTree.bindingConfigToPreloadConfig = function (bindingConfig, level) {
    function toPreloadConfig(bindingConfig, level) {
        var preloadConfig = {property:bindingConfig.childrenProperty, recursiveLevel:bindingConfig.recursive ? (bindingConfig.expandLevel - level - 1) : 0};
        var childConfigs = getChildPreloadConfigs.call(this, bindingConfig, level);
        if (childConfigs) {
            preloadConfig.childPreloadConfigs = childConfigs;
        }
        return preloadConfig;
    }
    function getChildPreloadConfigs(bindingConfig, level) {
        if (!(level > 0)) {
            return null;
        }
        var preloadConfigs = [];
        if (bindingConfig.childBindingConfigs) {
            for (var i = 0; i < bindingConfig.childBindingConfigs.length; i++) {
                var config = toPreloadConfig.call(this, bindingConfig.childBindingConfigs[i], level - 1);
                preloadConfigs.push(config);
            }
        }
        return (preloadConfigs.length) ? preloadConfigs : null;
    }
    level = level || 0;
    var preloadConfigs = [];
    if (bindingConfig.recursive || bindingConfig.expandLevel > 0) {
        if (bindingConfig.recursive) {
            if (bindingConfig.expandLevel > level) {
                var config = toPreloadConfig.call(this, bindingConfig, level);
                preloadConfigs.push(config);
            }
        }
        var childConfigs = getChildPreloadConfigs.call(this, bindingConfig, level);
        if (childConfigs) {
            preloadConfigs = preloadConfigs.concat(childConfigs);
        }
    }
    return preloadConfigs;
};

