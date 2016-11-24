


(function () {
    dorado.widget.treegrid = {};
    dorado.widget.treegrid.ItemModel = $extend([dorado.widget.tree.ItemModel, dorado.widget.grid.ItemModel], {constructor:function () {
        dorado.widget.grid.ItemModel.prototype.constructor.apply(this, arguments);
        $invokeSuper.call(this, arguments);
    }, refreshSummary:function () {
        if (!this._summaryColumns || !this.footerEntity.get("$expired")) {
            return;
        }
        var totalSummary = this.footerEntity._data, self = this;
        this.initSummary(totalSummary);
        for (var it = new dorado.widget.tree.TreeNodeIterator(this._root, {includeInvisibleNodes:true}); it.hasNext(); ) {
            self.accumulate(it.next(), totalSummary);
        }
        this.finishSummary(totalSummary);
        this.footerEntity.timestamp = dorado.Core.getTimestamp();
        this.footerEntity.sendMessage(0);
    }});
    dorado.widget.treegrid.RowRenderer = $extend(dorado.widget.grid.DefaultRowRenderer, {renderCell:function (cellRenderer, dom, arg) {
        var node = arg.node = arg.data._node;
        arg.dataForSelection = node;
        dorado.widget.grid.DefaultRowRenderer.prototype.renderCell.call(this, cellRenderer, dom, arg);
    }});
    dorado.widget.treegrid.TreeColumnCellRenderer = $extend([dorado.widget.grid.DefaultCellRenderer, dorado.widget.tree.TreeNodeRenderer], {getLabel:function (node, arg) {
        return node.get("label") || this.getText(node.get("data"), arg.column);
    }, doRender:function (dom, arg) {
        if (!dom.firstChild || dom.firstChild.className != "d-tree-node") {
            var tree = arg.grid, rowHeight = tree._rowHeight + "px";
            var cellConfig = {tagName:"DIV", className:"d-tree-node", style:{position:"relative", overflowX:"hidden", overflowY:"hidden"}, content:[{tagName:"LABEL", contextKey:"buttonDom", doradoType:"tree-button", className:"node-button", style:{display:"inline-block", position:"relative"}}, {tagName:"LABEL", className:"node-label", style:{display:"inline-block"}}]};
            if (tree._showLines) {
                cellConfig.content.insert({tagName:"DIV", className:"lines", style:{position:"absolute", left:0, top:0, height:"100%"}}, 0);
            }
            var context = {};
            $fly(dom).empty().xCreate(cellConfig, null, {context:context});
            var buttonDom = context.buttonDom, $buttonDom = jQuery(buttonDom), self = this;
            $buttonDom.mousedown(function () {
                return false;
            }).click(function () {
                var row = $DomUtils.findParent(buttonDom, function (parentNode) {
                    return parentNode.tagName.toLowerCase() == "tr";
                });
                var node = $fly(row).data("item");
                if (node.get("hasChild")) {
                    tree.hideCellEditor(false);
                    if (node._expanded) {
                        node.collapse();
                    } else {
                        if (node._tree._expandingMode == "sync") {
                            node.expand();
                        } else {
                            node.expandAsync();
                        }
                    }
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
        }
        dorado.widget.tree.TreeNodeRenderer.prototype.doRender.call(this, dom.firstChild, arg.node, arg);
        this.renderFlag(dom, arg);
    }});
    dorado.widget.treegrid.TreeColumnCellEditor = $extend(dorado.widget.grid.DefaultCellEditor, {hideCellContent:false, shouldShow:function () {
        return $invokeSuper.call(this, arguments) && !this.node._label;
    }, resize:function () {
        var dom = this.getDom(), control = this.getEditorControl();
        var ie6 = (dorado.Browser.msie && dorado.Browser.version < 7);
        if (control) {
            if (ie6) {
                control.getDom().style.display = "none";
            }
        }
        var cell = this.cell, $gridDom = jQuery(this.grid.getDom());
        if (!dom || !cell) {
            return;
        }
        var $cellDom = $fly(cell);
        var offsetGrid = $gridDom.offset(), offsetCell = $fly(cell).offset();
        var lp = $cellDom.find(".node-label").offset().left;
        var l = lp - offsetGrid.left - $gridDom.edgeLeft(), t = offsetCell.top - offsetGrid.top - $gridDom.edgeTop() + $cellDom.edgeTop(), w = cell.offsetWidth, h = cell.offsetHeight;
        if (this.minWidth && this.minWidth > w) {
            w = this.minWidth;
        }
        if (this.minHeight && this.minHeight > h) {
            h = this.minHeight;
        }
        $fly(dom).css({left:l, top:t}).outerWidth(w - (lp - offsetCell.left)).outerHeight(h).bringToFront();
        if (control) {
            var w = dom.clientWidth, h = dom.clientHeight;
            if (ie6) {
                control.getDom().style.display = "";
            }
            control.set("width", w);
            if (!control.ATTRIBUTES.height.independent) {
                control.set("height", h);
            }
            control.refresh();
        }
    }});
    dorado.widget.TreeGrid = $extend([dorado.widget.AbstractGrid, dorado.widget.AbstractTree], {$className:"dorado.widget.TreeGrid", ATTRIBUTES:{rowHeight:{defaultValue:dorado.Browser.isTouch ? ($setting["touch.Grid.defaultRowHeight"] || 30) : ($setting["widget.Grid.defaultRowHeight"] || 22)}, headerRowHeight:{defaultValue:dorado.Browser.isTouch ? ($setting["touch.Grid.defaultRowHeight"] || 30) : ($setting["widget.Grid.defaultRowHeight"] || 22)}, footerRowHeight:{defaultValue:dorado.Browser.isTouch ? ($setting["touch.Grid.defaultRowHeight"] || 30) : ($setting["widget.Grid.defaultRowHeight"] || 22)}, treeColumn:{writeBeforeReady:true}, currentNode:{skipRefresh:true, getter:function (p) {
        if (this._innerGrid || this._fixedInnerGrid) {
            return (this._domMode == 2 ? this._fixedInnerGrid : this._innerGrid).get(p);
        } else {
            return this._currentNode;
        }
    }, setter:function (v, p) {
        if (this._innerGrid || this._fixedInnerGrid) {
            (this._domMode == 2 ? this._fixedInnerGrid : this._innerGrid).set(p, v);
        } else {
            this._currentNode = v;
        }
    }}, currentEntity:{setter:function (currentEntity) {
        var node = currentEntity ? this._entityMap[currentEntity.entityId] : null;
        this.set("currentNode", node);
    }, getter:function () {
        var data = this.get("currentNode.data");
        return (data instanceof dorado.Entity) ? data : null;
    }}, rowRenderer:{defaultValue:$singleton(dorado.widget.treegrid.RowRenderer)}, groupProperty:{readOnly:true}, showFilterBar:{readOnly:true}}, constructor:function () {
        this._identifiedNodes = {};
        this._entityMap = {};
        this._root = this.createRootNode();
        this._root._setTree(this);
        this._root._expanded = true;
        this._autoRefreshLock = 0;
        this._expandingCounter = 0;
        $invokeSuper.call(this, arguments);
    }, createInnerGrid:function (fixed) {
        var innerGrid = new dorado.widget.treegrid.InnerTreeGrid(this, fixed);
        innerGrid._root = this._root;
        return innerGrid;
    }, createItemModel:function () {
        var im = new dorado.widget.treegrid.ItemModel(this);
        im.setItems(this._root);
        return im;
    }, onCellValueEdit:function (entity, column) {
        var node = this._entityMap[entity.entityId];
        if (node) {
            this.refreshEntity(node);
            this.onEntityChanged(node, column._property);
            this.refreshSummary();
        }
        $invokeSuper.call(this, arguments);
    }, createRootNode:function () {
        return new dorado.widget.tree.DataNode({data:{}});
    }, refreshDom:function (dom) {
        if (this._treeColumn) {
            var cols = this.findColumns(this._treeColumn), col = cols[0];
            if (!col) {
                throw new dorado.Exception("TreeColumn [" + this._treeColumn + "] not found.");
            }
            if (!(col instanceof dorado.widget.grid.DataColumn)) {
                throw new dorado.Exception("The [treeColumn] is not a DataColumn.");
            }
            if (!col._renderer) {
                col._renderer = new dorado.widget.treegrid.TreeColumnCellRenderer();
            }
            if (!col._editor) {
                col._cellEditor = new dorado.widget.treegrid.TreeColumnCellEditor();
            }
        }
        $invokeSuper.call(this, arguments);
        if (this._currentNode) {
            (this._domMode == 2 ? this._fixedInnerGrid : this._innerGrid).set("currentNode", this._currentNode);
            delete this._currentNode;
        }
    }, refreshEntity:function (entity) {
        var itemId = entity._uniqueId, row, innerGrid;
        if (this._domMode == 2) {
            innerGrid = this._fixedInnerGrid;
            row = innerGrid._itemDomMap[itemId];
            if (row) {
                innerGrid.refreshItemDomData(row, entity);
            }
        }
        innerGrid = this._innerGrid;
        if (innerGrid) {
            row = innerGrid._itemDomMap[itemId];
            if (row) {
                innerGrid.refreshItemDomData(row, entity);
            }
        }
    }, getCellEditor:function (column, node) {
        var cellEditor = $invokeSuper.call(this, [column, node._data]);
        if (cellEditor) {
            cellEditor.node = node;
            cellEditor.data = node._data;
        }
        return cellEditor;
    }, sort:dorado._UNSUPPORTED_FUNCTION(), filter:dorado._UNSUPPORTED_FUNCTION(), refreshNode:function (node) {
        if (this._autoRefreshLock > 0) {
            return;
        }
        this.refreshEntity(node);
    }, onNodeAttached:function (node) {
        $invokeSuper.call(this, arguments);
        if (node._data) {
            this._entityMap[node._data.entityId] = node;
        }
        if (this._rendered) {
            this.refreshSummary();
        }
    }, onNodeDetached:function (node) {
        $invokeSuper.call(this, arguments);
        if (node._data) {
            delete this._entityMap[node._data.entityId];
        }
        if (this._rendered) {
            this.refreshSummary();
        }
    }, findItemDomByEvent:function (evt) {
        var row = this._innerGrid.findItemDomByEvent(evt);
        if (!row && this._fixedInnerGrid) {
            row = this._fixedInnerGrid.findItemDomByEvent(evt);
        }
        return row;
    }, _nodeInserted:function (node) {
        var self = this, called = false;
        var callDefault = function (success, result) {
            if (called) {
                return;
            }
            called = true;
            node._expanding = false;
            if (success !== false) {
                if (!self._rendered || !self._attached || self._autoRefreshLock > 0) {
                    return;
                }
                if (self._currentScrollMode != "viewport") {
                    if (self._domMode == 2) {
                        self._fixedInnerGrid._nodeInserted(node);
                    }
                    self._innerGrid._nodeInserted(node);
                    self.updateScroller(self._innerGrid._container);
                    self.notifySizeChange();
                } else {
                    self._refreshAndScroll(node, "insert", node._parent);
                }
            }
            self.fireEvent("onExpand", self, {async:async, node:node});
        };
        var async = false;
        if (node._expanded) {
            if (this.getListenerCount("beforeExpand")) {
                async = (this._expandingMode == "async");
                node._expanding = true;
                var eventArg = {async:async, node:node, callDefault:async ? callDefault : undefined, processDefault:true};
                this.fireEvent("beforeExpand", this, eventArg);
                if (!eventArg.processDefault) {
                    callDefault();
                    node._expanding = false;
                }
            } else {
                callDefault();
            }
        }
    }, _nodeRemoved:function (node, parentNode, index) {
        if (!this._rendered || !this._attached || this._autoRefreshLock > 0) {
            return;
        }
        if (this._currentScrollMode != "viewport") {
            if (this._domMode == 2) {
                this._fixedInnerGrid._nodeRemoved(node, parentNode, index);
            }
            this._innerGrid._nodeRemoved(node, parentNode, index);
            this.updateScroller(this._innerGrid._container);
            this.notifySizeChange();
        } else {
            this._refreshAndScroll(node, "remove", parentNode, index);
        }
    }, _nodeExpanded:function (node, callback) {
        if (!this._rendered || !this._attached || this._autoRefreshLock > 0) {
            $callback(callback);
            return;
        }
        if (this._currentScrollMode != "viewport") {
            if (this._domMode == 2) {
                this._fixedInnerGrid._nodeExpanded(node);
            }
            var self = this;
            this._innerGrid._nodeExpanded(node, function () {
                self.updateScroller(self._innerGrid._container);
                self.notifySizeChange();
                $callback(callback, true, node);
            });
            this.updateScroller(this._innerGrid._container);
        } else {
            this._refreshAndScroll(node, "expand", node._parent);
        }
    }, _nodeCollapsed:function (node, callback) {
        if (!this._rendered || !this._attached || this._autoRefreshLock > 0) {
            $callback(callback);
            return;
        }
        if (this._currentScrollMode != "viewport") {
            if (this._domMode == 2) {
                this._fixedInnerGrid._nodeCollapsed(node);
            }
            var self = this;
            this._innerGrid._nodeCollapsed(node, function () {
                self.updateScroller(self._innerGrid._container);
                self.notifySizeChange();
                $callback(callback, true, node);
            });
            this.updateScroller(this._innerGrid._container);
        } else {
            this._refreshAndScroll(node, "collapse", node._parent);
        }
    }, _refreshAndScroll:function (node, mode, parentNode, nodeIndex) {
        var itemModel = this._itemModel;
        if (parentNode._expanded) {
            var row = this._innerGrid._itemDomMap[node._uniqueId];
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
                        }
                        break;
                      case "remove":
                        if ((index + node._visibleChildNodeCount + 1) < startIndex) {
                            itemModel.setStartIndex(startIndex - node._visibleChildNodeCount - 1);
                        } else {
                            if (index < startIndex) {
                                itemModel.setStartIndex(index);
                            }
                        }
                        break;
                      case "expand":
                        if (index < startIndex) {
                            itemModel.setStartIndex(startIndex + node._visibleChildNodeCount);
                        }
                        break;
                      case "collapse":
                        if ((index + node._visibleChildNodeCount) < startIndex) {
                            itemModel.setStartIndex(startIndex - node._visibleChildNodeCount);
                        } else {
                            if (index < startIndex) {
                                itemModel.setStartIndex(index + 1);
                            }
                        }
                        break;
                    }
                }
            }
            this.refreshDom(this._dom);
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
                this._ignoreItemTimestamp = true;
                this.refreshEntity(node._parent);
            }
        }
    }, _doOnKeyDown:function (evt) {
        var retValue = true, currentChanged;
        var items = this._itemModel.getItems(), currentNode = this.get("currentNode");
        switch (evt.keyCode) {
          case 36:
            if (evt.ctrlKey) {
                this.set("currentNode", this._itemModel.iterator(0).next());
                currentChanged = true;
            } else {
                this.setCurrentColumn(this._columnsInfo.dataColumns[0]);
            }
            break;
          case 35:
            if (evt.ctrlKey) {
                var it = this._itemModel.iterator(0);
                it.last();
                this.set("currentNode", it.previous());
                currentChanged = true;
            } else {
                var columns = this._columnsInfo.dataColumns;
                this.setCurrentColumn(columns[columns.length - 1]);
            }
            break;
          case 38:
            if (currentNode) {
                var index = this._itemModel.getItemIndex(currentNode);
                if (index > 0) {
                    var node = this._itemModel.iterator(index - 1).next();
                    if (node) {
                        this.set("currentNode", node);
                        currentChanged = true;
                    }
                }
                retValue = false;
            }
            break;
          case 40:
            if (currentNode) {
                var index = this._itemModel.getItemIndex(currentNode);
                if (index < this._itemModel.getItemCount() - 1) {
                    var node = this._itemModel.iterator(index + 1).next();
                    if (node) {
                        this.set("currentNode", node);
                        currentChanged = true;
                    }
                }
                retValue = false;
            }
            break;
          case 13:
            if (currentNode) {
                retValue = false;
                var columns = this._columnsInfo.dataColumns, i;
                if (this._currentColumn) {
                    i = columns.indexOf(this._currentColumn) || 0;
                    if (evt.shiftKey) {
                        if (i > 0) {
                            i--;
                        } else {
                            var index = this._itemModel.getItemIndex(currentNode);
                            if (index > 0) {
                                var node = this._itemModel.iterator(index - 1).next();
                                if (node) {
                                    this.set("currentNode", node);
                                    currentChanged = true;
                                    i = columns.length - 1;
                                }
                            } else {
                                retValue = true;
                            }
                        }
                    } else {
                        if (i < columns.length - 1) {
                            i++;
                        } else {
                            var index = this._itemModel.getItemIndex(currentNode);
                            if (index < this._itemModel.getItemCount() - 1) {
                                var node = this._itemModel.iterator(index + 1).next();
                                if (node) {
                                    this.set("currentNode", node);
                                    currentChanged = true;
                                    i = 0;
                                }
                            } else {
                                retValue = true;
                            }
                        }
                    }
                } else {
                    i = evt.shiftKey ? (columns.length - 1) : 0;
                }
                this.setCurrentColumn(columns[i]);
            }
            break;
        }
        if (currentChanged && this._selectionMode == "multiRows") {
            this.set("selection", null);
        }
        return retValue;
    }, getHeaderOptionMenu:function (create) {
        function hiddenItems(items) {
            jQuery.each(items, function (i, item) {
                menu.findItem(item).set("visible", false);
            });
        }
        var hasMenu = !!this._headerOptionMenu;
        var menu = $invokeSuper.call(this, arguments);
        if (!hasMenu && menu) {
            hiddenItems(["sortAsc", "sortDesc", "sortSeprator", "group", "ungroup", "groupSeprator", "toggleFilterBar", "filterSeprator"]);
        }
        return menu;
    }, doOnDraggingSourceMove:dorado.widget.AbstractTree.prototype.doOnDraggingSourceMove, processItemDrop:dorado.widget.AbstractTree.prototype.processItemDrop});
    var TreePrototype = dorado.widget.Tree.prototype;
    dorado.widget.treegrid.InnerTreeGrid = $extend(dorado.widget.grid.AbstractInnerGrid, {ATTRIBUTES:{currentNode:{skipRefresh:true, setter:function (currentNode) {
        if (this._currentNode == currentNode) {
            return;
        }
        var eventArg = {oldCurrent:this._currentNode, newCurrent:currentNode, processDefault:true};
        var grid = this.grid;
        grid.fireEvent("beforeCurrentChange", this, eventArg);
        if (!eventArg.processDefault) {
            return;
        }
        this._currentNode = currentNode;
        if (this._rendered && this._itemDomMap) {
            var row = currentNode ? this._itemDomMap[currentNode._uniqueId] : null;
            this.setCurrentRow(row);
            if (row) {
                this.scrollCurrentIntoView();
            }
        }
        grid.fireEvent("onCurrentChange", grid, eventArg);
        grid.doInnerGridSetCurrentRow(this, currentNode ? currentNode._uniqueId : null);
    }}}, refreshItemDomData:function (row, item) {
        $invokeSuper.call(this, [row, item.get("data")]);
    }, getCurrentItem:function () {
        return this._currentNode;
    }, getCurrentItemId:function () {
        return this._currentNode ? this._currentNode._uniqueId : null;
    }, setCurrentItemDom:function (row) {
        this.set("currentNode", row ? $fly(row).data("item") : null);
        return true;
    }, setCurrentRowByItemId:function (itemId) {
        var node = this._itemModel.getItemById(itemId);
        if (this._currentNode != node) {
            this.set("currentNode", node);
        }
    }, createExpandingIndicator:function () {
        var row = this._expandingIndicator;
        if (row == null) {
            this._expandingIndicator = row = $DomUtils.xCreate({tagName:"TR", className:"d-tree-expanding-placeholder", content:"^TD"});
        }
        row.firstChild.colSpan = this._cols;
        return row;
    }, _getExpandingAnimated:function (node) {
        return this.grid._expandingAnimated && node._expandingAnimationEnabled;
    }, refreshItemDoms:TreePrototype.refreshItemDoms, _nodeInserted:TreePrototype._nodeInserted, _nodeRemoved:TreePrototype._nodeRemoved, _insertChildNodes:TreePrototype._insertChildNodes, _removeChildNodes:TreePrototype._removeChildNodes, _refreshRearRows:TreePrototype._refreshRearRows, _nodeExpanded:TreePrototype._nodeExpanded, _nodeCollapsed:TreePrototype._nodeCollapsed});
})();
dorado.widget.DataTreeGrid = $extend([dorado.widget.TreeGrid, dorado.widget.DataTree], {$className:"dorado.widget.DataTreeGrid", ATTRIBUTES:{autoCreateColumns:{defaultValue:true}, selection:{setter:function (selection) {
    this.refresh();
    $invokeSuper.call(this, arguments);
}}}, onReady:dorado.widget.DataTree.prototype.onReady, createRootNode:function () {
    return new dorado.widget.tree.DataBindingNode({bindingConfig:{}});
}, onCellValueEdited:null, addColumn:function () {
    var column = $invokeSuper.call(this, arguments);
    if (this._autoCreateColumns && column instanceof dorado.widget.grid.DataColumn && column._property && column._property != "none") {
        var watcher = this.getAttributeWatcher();
        if (watcher.getWritingTimes("autoCreateColumns") == 0) {
            this._autoCreateColumns = false;
        }
    }
    return column;
}, initColumns:dorado.widget.DataGrid.prototype.initColumns, refreshDom:function (dom) {
    var bindingConfigs = this.get("bindingConfigs");
    if (!bindingConfigs || !bindingConfigs.length) {
        throw new dorado.Exception("DataTreeGrid " + this._id + ".bindingConfigs is undefined.");
    }
    var columnsInited = false;
    if (this._dataSet) {
        var dataType, data = this.getBindingData({firstResultOnly:true, acceptAggregation:true});
        if (data && data.dataType && data.dataType instanceof dorado.AggregationDataType) {
            dataType = data.dataType.getElementDataType("auto");
        }
        if (!dataType) {
            dataType = this.getBindingDataType("auto");
        }
        if (dataType) {
            this.initColumns(dataType);
            columnsInited = true;
        } else {
            if (this._autoCreateColumns && !this._listeningDataTypeRepository) {
                this._columnInited = false;
                this._listeningDataTypeRepository = true;
                var grid = this;
                this.get("dataTypeRepository").bind("onDataTypeRegister", function (self, arg) {
                    var dataType = grid.getBindingDataType("never");
                    if (dataType) {
                        self.unbind("onDataTypeRegister", arguments.callee);
                        grid._autoCreateColumns = true;
                        grid._listeningDataTypeRepository = false;
                        grid.initColumns(dataType);
                        grid.refresh(true);
                    }
                });
            }
        }
        if (!this._root._childrenPrepared || this._data != data || (this._data && this._data.pageNo != (this._pageNo || 0))) {
            this._data = data;
            this._pageNo = (data ? data.pageNo : 0);
            this._root._prepareChildren(dorado._NULL_FUNCTION);
        }
    }
    if (!columnsInited) {
        this.initColumns();
    }
    $invokeSuper.call(this, [dom]);
}, processItemDrop:dorado.widget.DataTree.prototype.processItemDrop, filterDataSetMessage:dorado.widget.DataTree.prototype.filterDataSetMessage});

