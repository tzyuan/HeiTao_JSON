


(function () {
    var operatorItemsInited = false;
    var operators = ["like", "like*", "*like", "=", "<>", ">", ">=", "<", "<="], operatorsForParse = ["like", "like*", "*like", "=", ">", ">=", "<", "<=", "<>"];
    var operatorItems = [];
    var criterionClipboard;
    function getOperatorItems() {
        if (!operatorItemsInited) {
            operatorItemsInited = true;
            var texts = $resource("dorado.grid.FilterExpressionOperators").split(",");
            for (var i = 0; i < operators.length; i++) {
                var operator = operators[i];
                operatorItems.push({key:operator, value:texts[i]});
            }
        }
        return operatorItems;
    }
    function getDefaultOperator(propertyDef) {
        var dataType = propertyDef.get("dataType");
        if (propertyDef._mapping || dataType && (dataType._code && numberTypeCodes.indexOf(dataType._code) >= 0 || [dorado.DataType.PRIMITIVE_BOOLEAN, dorado.DataType.BOOLEAN].indexOf(dataType._code) >= 0)) {
            return "=";
        } else {
            return "like";
        }
    }
    function extractPureCriterion(criterion) {
        var pureCriterion = null;
        if (criterion.junction) {
            pureCriterion = {junction:criterion.junction, criterions:[]};
            if (criterion.criterions && criterion.criterions.length) {
                for (var i = 0; i < criterion.criterions.length; i++) {
                    var c = extractPureCriterion(criterion.criterions[i]);
                    if (c) {
                        pureCriterion.criterions.push(c);
                    }
                }
            }
        } else {
            pureCriterion = {property:criterion.property, operator:criterion.operator, type:criterion.type, value:criterion.value};
        }
        return pureCriterion;
    }
    var CriterionTypeButton = $extend(dorado.widget.SimpleButton, {ATTRIBUTES:{className:{writeBeforeReady:true, defaultValue:"d-type-button"}, exClassName:{writeBeforeReady:false}}});
    var OrderTypeButton = $extend(dorado.widget.SimpleButton, {ATTRIBUTES:{className:{writeBeforeReady:true, defaultValue:"type-button"}, exClassName:{writeBeforeReady:false}}});
    dorado.widget.CriteriaBuilder = $extend(dorado.widget.Control, {$className:"dorado.widget.CriteriaBuilder", _inherentClassName:"i-criteria-builder", ATTRIBUTES:{className:{defaultValue:"d-criteria-builder"}, dataType:{writerBeforeReady:true, getter:dorado.LazyLoadDataType.dataTypeGetter}, propertyDiscoveryMode:{writerBeforeReady:true, defaultValue:"blacklist"}, supportsOrders:{writerBeforeReady:true, defaultValue:true}, rowHeight:{defaultValue:40}, maxRowHeight:{defaultValue:80}, dynaRowHeight:{defaultValue:true}, indentSize:{defaultValue:68}, marginX:{defaultValue:16}, marginY:{defaultValue:10}, criteria:{getter:function () {
        function extractCriterion(criterion, propertyMap) {
            var realCriterion = null;
            if (criterion.junction) {
                if (criterion.criterions && criterion.criterions.length) {
                    realCriterion = {junction:criterion.junction, criterions:[]};
                    for (var i = 0; i < criterion.criterions.length; i++) {
                        var c = extractCriterion(criterion.criterions[i], propertyMap);
                        if (c) {
                            realCriterion.criterions.push(c);
                        }
                    }
                }
            } else {
                var propertyDef = propertyMap[criterion.property];
                var dataType = propertyDef ? propertyDef.get("dataType") : null;
                realCriterion = {property:criterion.property, operator:criterion.operator, type:criterion.type, dataType:(dataType ? dataType._id : undefined), value:criterion.value};
            }
            return realCriterion;
        }
        if (!this.validate()) {
            throw new dorado.ResourceException("dorado.criteriaBuilder.CriteriaValidateError");
        }
        var criteria = {$dataType:"Criteria"};
        var criterions, criterion = extractCriterion(this._criterion, this._propertiesInfo.propertyMap);
        if (criterion) {
            if (criterion.junction == "or") {
                criterions = [criterion];
            } else {
                criterions = criterion.criterions;
            }
        }
        criteria.criterions = criterions || [];
        if (this._orders && this._orders.length) {
            var orders = [];
            for (var i = 0; i < this._orders.length; i++) {
                var order = this._orders[i];
                orders.push({property:order.property, desc:order.desc});
            }
            criteria.orders = orders;
        }
        return criteria;
    }, setter:function (criteria) {
        if (criteria) {
            var criterion, criterions = criteria.criterions;
            if (criterions) {
                if (criterions.length == 1 && criterions[0].junction) {
                    criterion = criterions[0];
                }
            }
            if (!criterion) {
                criterion = {junction:"and", criterions:criterions};
            }
            criterion = dorado.Core.clone(criterion, true);
            this._criterion = criterion;
            if (criteria.orders) {
                this._orders = dorado.Core.clone(criteria.orders, true);
            } else {
                this._orders = [];
            }
        } else {
            this._criterion = {junction:"and", criterions:[]};
            this._orders = [];
        }
    }}}, constructor:function () {
        this.set("criteria", null);
        $invokeSuper.call(this, arguments);
        this._criterionControls = [];
        this._cachedCriterionControls = [];
        this._junctionControls = [];
        this._cachedJunctionControls = [];
    }, destroy:function () {
        delete this._currentCriterion;
        delete this._currentCriterionForRefresh;
        for (var i = 0; i < this._cachedCriterionControls.length; i++) {
            var criterionControl = this._cachedCriterionControls[i];
            if (!criterionControl._destroyed) {
                criterionControl.destroy();
            }
        }
        for (var i = 0; i < this._cachedJunctionControls.length; i++) {
            var junctionControl = this._cachedJunctionControls[i];
            if (!junctionControl._destroyed) {
                junctionControl.destroy();
            }
        }
        var emptyTipDom = this.getEmptyTipDom(false);
        if (emptyTipDom) {
            $fly(emptyTipDom).remove();
        }
        $invokeSuper.call(this);
    }, collectCriterionInfo:function (criterion) {
        function goThrough(parent, criterion, info, deepth) {
            criterion.parent = parent;
            criterion.col = deepth;
            if (criterion.junction) {
                info.allJunctions.push(criterion);
                var criterions = criterion.criterions;
                if (criterions && criterions.length) {
                    for (var i = 0; i < criterions.length; i++) {
                        goThrough(criterion, criterions[i], info, deepth + 1);
                    }
                    var startRow = criterions[0].row, endRow = criterions[criterions.length - 1].row;
                    criterion.row = (startRow + endRow) / 2;
                } else {
                    criterion.row = info.rowCount;
                    info.rowCount++;
                }
            } else {
                info.allCriterions.push(criterion);
                criterion.row = info.rowCount;
                info.rowCount++;
            }
        }
        var info = {rowCount:0, criterion:criterion, allJunctions:[], allCriterions:[]};
        if (criterion) {
            goThrough(null, criterion, info, 0);
        }
        return info;
    }, getCriterionInfo:function () {
        return this.collectCriterionInfo(this._criterion || {junction:"and"});
    }, getRaphael:function () {
        if (!this._raphael) {
            var raphael = this._raphael = new dorado.widget.Raphael({style:{position:"absolute", zIndex:1}});
            this.registerInnerControl(raphael);
            raphael.render(this.getDom());
        }
        return this._raphael;
    }, createDom:function () {
        var context = {}, dom = $DomUtils.xCreate({tagName:"DIV", style:{position:"relative"}, content:{tagName:"DIV", contextKey:"critrionContainer", style:{position:"absolute", zIndex:2}}}, null, context);
        this._critrionContainer = context.critrionContainer;
        return dom;
    }, getCriterionControl:function (criterion, propertiesInfo) {
        var criterionControl;
        if (this._cachedCriterionControls.length) {
            criterionControl = this._cachedCriterionControls.pop();
        } else {
            criterionControl = new CriterionControl({criteriaBuilder:this, propertiesInfo:propertiesInfo});
            this.registerInnerControl(criterionControl);
        }
        criterionControl.set("criterion", criterion);
        criterion.control = criterionControl;
        this._criterionControls.push(criterionControl);
        return criterionControl;
    }, getJunctionControl:function (criterion) {
        var junctionControl = criterion.control;
        if (this._cachedJunctionControls.length) {
            junctionControl = this._cachedJunctionControls.pop();
        } else {
            junctionControl = new JunctionControl({criteriaBuilder:this});
            this.registerInnerControl(junctionControl);
        }
        junctionControl.set({criterion:criterion, draggable:(criterion.parent != null)});
        criterion.control = junctionControl;
        this._junctionControls.push(junctionControl);
        return junctionControl;
    }, refreshCriterionDoms:function (criterionInfo, propertiesInfo, container) {
        for (var i = 0; i < this._criterionControls.length; i++) {
            var criterionControl = this._criterionControls[i];
            criterionControl.unrender();
            this._cachedCriterionControls.push(criterionControl);
        }
        this._criterionControls = [];
        var dom = this.getDom();
        var containerWidth = dom.offsetWidth, containerHeight = dom.offsetHeight;
        containerWidth -= this._marginX * 2;
        containerHeight -= this._marginY * 2;
        var realRowHeight = this._rowHeight, counterRowCount = criterionInfo.rowCount;
        if (this._supportsOrders) {
            counterRowCount++;
        }
        if (this._dynaRowHeight && counterRowCount * this._rowHeight < containerHeight) {
            realRowHeight = parseInt(containerHeight / (counterRowCount || 1));
            if (realRowHeight > this._maxRowHeight) {
                realRowHeight = this._maxRowHeight;
            }
        }
        this._realRowHeight = realRowHeight;
        var yAdjust = this._yAdjust = (this._realRowHeight - this._rowHeight) / 2;
        var indentSize = this._indentSize;
        var allCriterions = criterionInfo.allCriterions;
        for (var i = 0; i < allCriterions.length; i++) {
            var criterion = allCriterions[i];
            var criterionControl = this.getCriterionControl(criterion, propertiesInfo);
            var left = this._marginX + (criterion.col + 0.5) * indentSize;
            var top = this._marginY + yAdjust + criterion.row * realRowHeight;
            criterionControl.set({style:{left:left, top:top}});
            criterionControl.render(this._critrionContainer);
            if (criterion == this._currentCriterionForRefresh) {
                criterionControl.setFocus();
            }
            var criterionDom = criterionControl.getDom();
            if (left + criterionDom.offsetWidth > container._maxWidth) {
                container._maxWidth = left + criterionDom.offsetWidth;
            }
            if (i == allCriterions.length - 1) {
                container._maxHeight = top + criterionDom.offsetHeight;
            }
        }
    }, getEmptyTipDom:function (create) {
        if (!this._emptyTipDom && create) {
            this._emptyTipDom = $DomUtils.xCreate({tagName:"DIV", className:"empty-tip", style:{position:"absolute"}});
        }
        return this._emptyTipDom;
    }, refreshJunctions:function (criterionInfo, container, refreshLinesOnly) {
        if (!refreshLinesOnly) {
            for (var i = 0; i < this._junctionControls.length; i++) {
                var junctionControl = this._junctionControls[i];
                junctionControl.unrender();
                this._cachedJunctionControls.push(junctionControl);
            }
            this._junctionControls = [];
        }
        var critrionContainer = this._critrionContainer, raphael = this.getRaphael();
        var yAdjust = 0, realRowHeight = this._realRowHeight, indentSize = this._indentSize;
        if (this._criterionControls.length) {
            yAdjust = this._criterionControls[0]._dom.offsetHeight / 2;
        } else {
            yAdjust = this._rowHeight / 2;
        }
        yAdjust += this._yAdjust;
        var paper = raphael.getPaper();
        paper.clear();
        var allJunctions = criterionInfo.allJunctions;
        for (var i = 0; i < allJunctions.length; i++) {
            var junction = allJunctions[i], criterions = junction.criterions || [];
            var startX = this._marginX + (junction.col + 0.5) * indentSize;
            var startY = this._marginY + junction.row * realRowHeight + yAdjust;
            for (var j = 0; j < criterions.length; j++) {
                var criterion = criterions[j];
                var endX = this._marginX + (criterion.col + 0.5) * indentSize;
                var endY = this._marginY + criterion.row * realRowHeight + yAdjust;
                var color = Raphael.rgb(120, 120, 120);
                paper.path("M" + startX + "," + startY + " C" + startX + "," + endY + "," + startX + "," + endY + "," + endX + "," + endY).attr("stroke", color);
            }
            if (!refreshLinesOnly) {
                var junctionControl = this.getJunctionControl(junction);
                junctionControl.set({style:{left:startX, top:startY}});
                junctionControl.render(this._critrionContainer);
                if (junction == this._currentCriterionForRefresh) {
                    junctionControl.setFocus();
                }
                var criterionDom = junctionControl.getDom();
                if (startX + criterionDom.offsetWidth > container._maxWidth) {
                    container._maxWidth = startX + criterionDom.offsetWidth;
                }
                if (i == allJunctions.length - 1 && startY + criterionDom.offsetHeight > container._maxHeight) {
                    container._maxHeight = startY + criterionDom.offsetHeight;
                }
            }
        }
        var emptyTipDom;
        if (allJunctions.length == 1 && criterionInfo.allCriterions.length == 0) {
            emptyTipDom = this.getEmptyTipDom(true);
            $fly(emptyTipDom).text($resource("dorado.criteriaBuilder.EmptyTip")).css("left", this._marginX + 0.5 * indentSize).css("top", this._marginY + yAdjust);
            this._critrionContainer.appendChild(emptyTipDom);
        } else {
            emptyTipDom = this.getEmptyTipDom(false);
            if (emptyTipDom && emptyTipDom.parentNode == this._critrionContainer) {
                this._critrionContainer.removeChild(emptyTipDom);
            }
        }
        if (!refreshLinesOnly) {
            raphael.set({width:critrionContainer._maxWidth + this._marginX, height:critrionContainer._maxHeight + this._marginY}).refresh();
        }
    }, getAvialableProperiesInfo:function (dataType) {
        function doGetProperies(dataType, info, namePrefix, labelPrefix) {
            if (dataType instanceof dorado.AggregationDataType) {
                dataType = dataType.get("elementDataType");
            }
            if (!(dataType instanceof dorado.EntityDataType)) {
                return;
            }
            dataType.get("propertyDefs").each(function (propertyDef) {
                var accept = false;
                if (propertyDiscoveryMode == "blacklist") {
                    if (!propertyDef.hasTag("unfilterable")) {
                        accept = true;
                    }
                } else {
                    if (propertyDef.hasTag("filterable")) {
                        accept = true;
                    }
                }
                var name, label;
                if (accept) {
                    name = namePrefix + propertyDef.get("name");
                    label = labelPrefix + propertyDef.get("label");
                    info.properties.push(propertyDef);
                    info.propertyMap[name] = propertyDef;
                    info.dropDownItems.push({key:name, value:label});
                }
                if (propertyDef.hasTag("subProp-filterable")) {
                    var subDataType = propertyDef.get("dataType");
                    if (subDataType) {
                        doGetProperies(subDataType, info, name + ".", label + ".");
                    }
                }
            });
        }
        var info = {properties:[], propertyMap:{}, dropDownItems:[]};
        if (dataType) {
            var propertyDiscoveryMode = this._propertyDiscoveryMode;
            doGetProperies(dataType, info, "", "");
        }
        return info;
    }, refreshOrdersControl:function (orders, propertiesInfo, critrionContainer) {
        if (!this._ordersControl) {
            var ordersControl = this._ordersControl = new OrdersControl({criteriaBuilder:this, propertiesInfo:propertiesInfo, orders:orders, style:{left:this._marginX}});
            ordersControl.render(critrionContainer);
        } else {
            this._ordersControl.set({orders:orders, style:{top:-500}}).refresh();
        }
        return this._ordersControl;
    }, refreshDom:function (dom) {
        $invokeSuper.call(this, [dom]);
        var dataType = this.get("dataType");
        if (!this._propertiesInfo) {
            this._propertiesInfo = this.getAvialableProperiesInfo(dataType);
        }
        var criterionInfo = this._criterionInfo = this.getCriterionInfo();
        var critrionContainer = this._critrionContainer;
        critrionContainer._maxWidth = critrionContainer._maxHeight = 0;
        if (this._supportsOrders) {
            this.refreshOrdersControl(this._orders, this._propertiesInfo, critrionContainer);
        }
        this._currentCriterionForRefresh = this._currentCriterion;
        this.refreshCriterionDoms(criterionInfo, this._propertiesInfo, critrionContainer);
        this.refreshJunctions(criterionInfo, critrionContainer);
        if (this._supportsOrders) {
            var ordersControl = this._ordersControl, top = critrionContainer._maxHeight + (this._realRowHeight - ordersControl.getDom().offsetHeight);
            ordersControl.set({style:{left:this._marginX, top:top}});
            critrionContainer._maxHeight = (top + ordersControl.getDom().offsetHeight);
        }
    }, validate:function () {
        var valid = true;
        for (var i = 0; i < this._criterionControls.length; i++) {
            var criterionControl = this._criterionControls[i];
            if (!criterionControl.validate()) {
                valid = false;
            }
        }
        return valid;
    }});
    var numberTypeCodes = [dorado.DataType.INTEGER, dorado.DataType.PRIMITIVE_INT, dorado.DataType.FLOAT, dorado.DataType.PRIMITIVE_FLOAT, dorado.DataType.DATE, dorado.DataType.TIME, dorado.DataType.DATETIME];
    var mappingOperatorDropDown, numberOperatorDropDown, stringOperatorDropDown, booleanOperatorDropDow;
    function getOperatorDropDown(propertyDef) {
        var dropDown, operatorItems = getOperatorItems();
        if (propertyDef && propertyDef._mapping) {
            if (!mappingOperatorDropDown) {
                mappingOperatorDropDown = new dorado.widget.ListDropDown({items:operatorItems.slice(3, 5), property:"key", displayProperty:"value", autoOpen:true});
            }
            dropDown = mappingOperatorDropDown;
        } else {
            var dataType = propertyDef ? propertyDef.get("dataType") : null;
            if (dataType && dataType._code) {
                if (numberTypeCodes.indexOf(dataType._code) >= 0) {
                    if (!numberOperatorDropDown) {
                        numberOperatorDropDown = new dorado.widget.ListDropDown({items:operatorItems.slice(3), property:"key", displayProperty:"value", autoOpen:true});
                    }
                    dropDown = numberOperatorDropDown;
                } else {
                    if ([dorado.DataType.PRIMITIVE_BOOLEAN, dorado.DataType.BOOLEAN].indexOf(dataType._code) >= 0) {
                        if (!booleanOperatorDropDow) {
                            booleanOperatorDropDow = new dorado.widget.ListDropDown({items:operatorItems.slice(3, 5), property:"key", displayProperty:"value", autoOpen:true});
                        }
                        dropDown = booleanOperatorDropDow;
                    }
                }
            }
            if (!dropDown) {
                stringOperatorDropDown = new dorado.widget.ListDropDown({items:operatorItems.slice(0, 5), property:"key", displayProperty:"value", autoOpen:true});
                dropDown = stringOperatorDropDown;
            }
        }
        return dropDown;
    }
    var booleanMapping;
    function getBooleanMapping() {
        if (!booleanMapping) {
            booleanMapping = [{key:true, value:$resource("dorado.core.BooleanTrue")}, {key:false, value:$resource("dorado.core.BooleanFalse")}];
        }
        return booleanMapping;
    }
    var AbstractCriterionControl = $extend(dorado.widget.Control, {focusable:true, ATTRIBUTES:{dragTags:{defaultValue:["criterion"]}, criteriaBuilder:{}, criterion:{}}, doOnKeyDown:function (evt) {
        if (!evt.ctrlKey) {
            return;
        }
        var criterion = this._criterion, criteriaBuilder = this._criteriaBuilder;
        switch (evt.keyCode) {
          case 67:
            criterionClipboard = criterion;
            break;
          case 88:
            criterionClipboard = criterion;
            criterion.parent.criterions.remove(criterion);
            criteriaBuilder.refresh();
            break;
        }
    }, doOnFocus:function () {
        this._criteriaBuilder._currentCriterion = this._criterion;
    }, doOnBlur:function () {
        this._criteriaBuilder._currentCriterion = null;
    }});
    var JunctionControl = $extend(AbstractCriterionControl, {_inherentClassName:"i-junction", ATTRIBUTES:{className:{defaultValue:"d-junction"}, droppable:{defaultValue:true}, droppableTags:{defaultValue:["criterion"]}}, constructor:function (config) {
        $invokeSuper.call(this, [config]);
        this.set({onGetDraggingIndicator:function (self, arg) {
            var $dom = $fly(self.getDom());
            arg.indicator.set({style:{marginLeft:$dom.css("marginLeft"), marginTop:$dom.css("marginTop")}});
        }, onDraggingSourceOver:function (self, arg) {
            var sourceCriterion = arg.draggingInfo.get("sourceControl")._criterion;
            var criterion = self._criterion, parent = criterion.parent;
            var accept = true;
            while (parent) {
                if (parent == sourceCriterion) {
                    accept = false;
                    break;
                }
                parent = parent.parent;
            }
            if (accept) {
                $fly(self.getDom()).addClass("dragging-over");
            }
            arg.accept = accept;
        }, onDraggingSourceOut:function (self, arg) {
            $fly(self.getDom()).removeClass("dragging-over");
        }, onDraggingSourceDrop:function (self, arg) {
            var sourceCriterion = arg.draggingInfo.get("sourceControl")._criterion;
            if (arg.event.ctrlKey) {
                self._criterion.criterions.push(extractPureCriterion(sourceCriterion));
            } else {
                sourceCriterion.parent.criterions.remove(sourceCriterion);
                self._criterion.criterions.push(sourceCriterion);
            }
            self._criteriaBuilder.refresh();
        }});
    }, createDom:function () {
        var junctionControl = this, dom = $DomUtils.xCreate({tagName:"DIV", content:{tagName:"DIV", className:"label", style:{whiteSpace:"nowrap"}}});
        var menuButton = new dorado.widget.SimpleButton({className:"menu-button", onClick:function () {
            var menu = junctionControl.getQuickMenu(), criterion = junctionControl._criterion;
            menu.set({"#and.checked":(criterion.junction != "or"), "#or.checked":(criterion.junction == "or"), "#delete.visible":!!criterion.parent}).show({anchorTarget:junctionControl, align:"outerright", vAlign:"innertop"});
        }});
        junctionControl.registerInnerControl(menuButton);
        menuButton.render(dom);
        return dom;
    }, refreshDom:function (dom) {
        $invokeSuper.call(this, [dom]);
        dom.firstChild.innerText = $resource((this._criterion.junction == "or") ? "dorado.core.Or" : "dorado.core.And");
    }, getQuickMenu:function () {
        var junctionControl = this;
        if (!junctionControl._quickMenu) {
            var menu = junctionControl._quickMenu = new dorado.widget.Menu({focusParent:junctionControl, items:[{$type:"Checkable", name:"and", caption:$resource("dorado.core.And"), onClick:function (self) {
                menu.set("#or.checked", false);
                junctionControl.get("criterion").junction = "and";
                junctionControl.refresh();
            }}, {$type:"Checkable", name:"or", caption:$resource("dorado.core.Or"), onClick:function (self) {
                menu.set("#and.checked", false);
                junctionControl.get("criterion").junction = "or";
                junctionControl.refresh();
            }}, "-", {name:"addCriterion", caption:$resource("dorado.criteriaBuilder.AddCriterion"), icon:"url(skin>common/icons.gif) -120px 0px", onClick:function (self) {
                var criterion = junctionControl._criterion;
                if (!criterion.criterions) {
                    criterion.criterions = [];
                }
                criterion.criterions.push({});
                junctionControl._criteriaBuilder.refresh();
            }}, {name:"addJunction", caption:$resource("dorado.criteriaBuilder.AddJunction"), icon:"url(skin>common/icons.gif) -120px 0px", onClick:function (self) {
                var criterion = junctionControl._criterion;
                if (!criterion.criterions) {
                    criterion.criterions = [];
                }
                criterion.criterions.push({junction:"or", criterions:[]});
                junctionControl._criteriaBuilder.refresh();
            }}, {name:"delete", caption:$resource("dorado.criteriaBuilder.Delete"), icon:"url(skin>common/icons.gif) -140px 0px", onClick:function (self) {
                var criterion = junctionControl._criterion;
                if (criterion.criterions && criterion.criterions.length) {
                    dorado.MessageBox.confirm($resource("dorado.criteriaBuilder.ConfirmDeleteJunction"), function () {
                        criterion.parent.criterions.remove(criterion);
                        junctionControl._criteriaBuilder.refresh();
                    });
                } else {
                    criterion.parent.criterions.remove(criterion);
                    junctionControl._criteriaBuilder.refresh();
                }
            }}]});
        }
        return junctionControl._quickMenu;
    }, doOnKeyDown:function (evt) {
        if (!evt.ctrlKey) {
            return;
        }
        var criterion = this._criterion, criteriaBuilder = this._criteriaBuilder;
        switch (evt.keyCode) {
          case 86:
            if (criterionClipboard) {
                if (!criterion.criterions) {
                    criterion.criterions = [];
                }
                criterion.criterions.push(extractPureCriterion(criterionClipboard));
                criteriaBuilder.refresh();
            }
            break;
          case 67:
            return $invokeSuper.call(this, [evt]);
        }
    }});
    dorado.widget.CriteriaBuilder.getExpressionDropDown = function () {
        return new dorado.widget.ListDropDown({items:["${null}", "${util.getDate()}", "${util.getToday()}", "${util.calculateDate(\"y-1\")}", "${util.calculateDate(\"M-3\")}", "${session.getAttribute(\"xxx\")}", "${ctx[\"xxx\"]}"]});
    };
    var CriterionControl = $extend(AbstractCriterionControl, {_inherentClassName:"i-criterion", ATTRIBUTES:{className:{defaultValue:"d-criterion"}, draggable:{defaultValue:true}, propertiesInfo:{}}, getTypeMenu:function () {
        function onMenuItemClick(item) {
            item.get("parent.items").each(function (it) {
                if (it != item) {
                    it.set("checked", false);
                }
            });
            var criterion = item.get("parent")._criterionControl._criterion;
            criterion.type = item.get("name");
            criterion.value = null;
            criterionControl.refresh();
        }
        if (!this._typeMenu) {
            this._typeMenu = new dorado.widget.Menu({items:[{$type:"Checkable", name:"value", caption:$resource("dorado.criteriaBuilder.TypeValue"), onClick:onMenuItemClick}, {$type:"Checkable", name:"property", caption:$resource("dorado.criteriaBuilder.TypeProperty"), onClick:onMenuItemClick}, {$type:"Checkable", name:"expression", caption:$resource("dorado.criteriaBuilder.TypeExpression"), onClick:onMenuItemClick}]});
            this._typeMenu._criterionControl = this;
        }
        var criterionControl = this, criterion = criterionControl._criterion;
        var type = criterionControl._criterion.type || "value";
        criterionControl._typeMenu.set({focusParent:criterionControl, "#value.checked":(type == "value"), "#property.checked":(type == "property"), "#expression.checked":(type == "expression")});
        return this._typeMenu;
    }, createDom:function () {
        function isValidOperator(operatorDropDown, operator) {
            var items = operatorDropDown.get("items");
            for (var i = 0; i < items.length; i++) {
                if (items[i].key == operator) {
                    return true;
                }
            }
            return false;
        }
        var criterionControl = this, doms = {}, dom = $DomUtils.xCreate({tagName:"TABLE", className:"i-criterion d-criterion", content:{tagName:"TR", content:[{tagName:"TD", className:"property-container", contextKey:"propertyContainer"}, {tagName:"TD", className:"operator-container", contextKey:"operatorContainer"}, {tagName:"TD", className:"type-container", contextKey:"typeContainer"}, {tagName:"TD", className:"value-container", contextKey:"valueContainer"}, {tagName:"TD", className:"button-container", contextKey:"buttonContainer"}]}}, null, doms);
        var propertyEditor = criterionControl._propertyEditor = new dorado.widget.TextEditor({width:160, editable:false, required:true, mapping:this._propertiesInfo.dropDownItems, trigger:"autoOpenMappingDropDown1", onPost:function (self) {
            var criterion = criterionControl._criterion;
            criterion.property = self.get("value");
            var propertyDef = criterionControl._propertyDef = criterionControl._propertiesInfo.propertyMap[criterion.property];
            var operatorEditor = criterionControl._operatorEditor, operator = operatorEditor.get("value");
            if (!isValidOperator(getOperatorDropDown(propertyDef), operator)) {
                criterion.operator = getDefaultOperator(propertyDef);
                operatorEditor.set("value", criterion.operator);
            }
            if ((!criterion.type || criterion.type == "value") && criterion.value !== null && criterion.value !== undefined) {
                var value = criterion.value;
                if (propertyDef._mappping) {
                    if (propertyDef.getMappedValue(value) === undefined) {
                        value = null;
                    }
                } else {
                    var dataType = propertyDef.get("dataType");
                    if (dataType) {
                        if (dataType instanceof dorado.EntityDataType || dataType instanceof dorado.AggregationDataType) {
                            value = null;
                        } else {
                            try {
                                value = dataType.parse(value);
                            }
                            catch (e) {
                                dorado.Exception.removeException(e);
                            }
                        }
                    }
                }
                criterion.value = value;
                valueEditor.set("value", criterion.value);
            }
            criterionControl.refresh();
        }, onPostFailed:function (self, arg) {
            arg.processDefault = false;
        }});
        criterionControl.registerInnerControl(propertyEditor);
        propertyEditor.render(doms.propertyContainer);
        var operatorEditor = criterionControl._operatorEditor = new dorado.widget.TextEditor({width:80, required:true, mapping:getOperatorItems(), onPost:function (self) {
            criterionControl._criterion.operator = self.get("value");
        }, onPostFailed:function (self, arg) {
            arg.processDefault = false;
        }});
        criterionControl.registerInnerControl(operatorEditor);
        operatorEditor.render(doms.operatorContainer);
        var typeButton = criterionControl._typeButton = new CriterionTypeButton({exClassName:"d-value", menu:this.getTypeMenu()});
        criterionControl.registerInnerControl(typeButton);
        typeButton.render(doms.typeContainer);
        var valueEditor = criterionControl._valueEditor = new dorado.widget.TextEditor({width:180, onPost:function (self) {
            criterionControl._criterion.value = self.get("value");
        }, onPostFailed:function (self, arg) {
            arg.processDefault = false;
        }});
        criterionControl.registerInnerControl(valueEditor);
        valueEditor.render(doms.valueContainer);
        var delButton = criterionControl._delButton = new dorado.widget.SimpleButton({className:"delete-button", onClick:function () {
            var criterion = criterionControl._criterion;
            criterion.parent.criterions.remove(criterion);
            criterionControl._criteriaBuilder.refresh();
        }});
        criterionControl.registerInnerControl(delButton);
        delButton.render(doms.buttonContainer);
        this._doms = doms;
        return dom;
    }, refreshDom:function (dom) {
        $invokeSuper.call(this, [dom]);
        var criterion = this._criterion;
        var propertyDef = this._propertyDef = this._propertiesInfo.propertyMap[criterion.property];
        var dataType, dtCode, displayFormat, typeFormat, required;
        if (propertyDef) {
            dataType = propertyDef.get("dataType");
            dtCode = dataType ? dataType._code : -1;
            displayFormat = propertyDef.get("displayFormat");
            typeFormat = propertyDef.get("typeFormat");
        }
        var trigger, mapping = null;
        if (!dtCode || (propertyDef && propertyDef._mapping)) {
            dataType = undefined;
        }
        var propertyEditor = this._propertyEditor;
        propertyEditor.set("value", criterion.property);
        var operatorEditor = this._operatorEditor, operatorDropDown = getOperatorDropDown(propertyDef);
        operatorEditor.set({editable:false, trigger:operatorDropDown, value:criterion.operator});
        if (criterion.type == "property") {
            trigger = "autoOpenMappingDropDown1";
            mapping = this._propertyEditor._mapping;
            dataType = displayFormat = typeFormat = null;
            required = true;
        } else {
            if (criterion.type == "expression") {
                trigger = dorado.widget.CriteriaBuilder.getExpressionDropDown();
                dataType = displayFormat = typeFormat = null;
                required = true;
            } else {
                if (propertyDef && propertyDef._mapping) {
                    trigger = "autoMappingDropDown2";
                    mapping = propertyDef._mapping;
                } else {
                    if (dtCode == dorado.DataType.PRIMITIVE_BOOLEAN) {
                        trigger = "autoOpenMappingDropDown1";
                        mapping = getBooleanMapping();
                    } else {
                        if (dtCode == dorado.DataType.BOOLEAN) {
                            trigger = "autoOpenMappingDropDown2";
                            mapping = getBooleanMapping();
                        } else {
                            if (dtCode == dorado.DataType.DATE) {
                                trigger = "defaultDateDropDown";
                            } else {
                                if (dtCode == dorado.DataType.DATETIME) {
                                    trigger = "defaultDateTimeDropDown";
                                } else {
                                    trigger = null;
                                }
                            }
                        }
                    }
                }
                required = false;
            }
        }
        this._typeButton.set("exClassName", "d-" + (criterion.type || "value"));
        var valueEditor = this._valueEditor;
        valueEditor.set({required:required, dataType:dataType || null, displayFormat:displayFormat, typeFormat:typeFormat, trigger:trigger, mapping:mapping}, {skipUnknownAttribute:true, tryNextOnError:true});
        var value = criterion.value;
        if (dataType) {
            value = dataType.parse(value, typeFormat);
        }
        valueEditor.set("value", value);
    }, validate:function () {
        var propertyEditor = this._propertyEditor, operatorEditor = this._operatorEditor, valueEditor = this._valueEditor;
        propertyEditor.post();
        operatorEditor.post();
        valueEditor.post();
        return (propertyEditor.get("validationState") != "error" && operatorEditor.get("validationState") != "error" && valueEditor.get("validationState") != "error");
    }, doOnBlur:function () {
        this.validate();
    }});
    var OrdersControl = $extend(dorado.widget.Control, {_inherentClassName:"i-orders", focusable:true, ATTRIBUTES:{className:{defaultValue:"d-orders"}, criteriaBuilder:{}, propertiesInfo:{}, orders:{}}, constructor:function () {
        $invokeSuper.call(this, arguments);
        this._orderControls = [];
        this._cachedOrderControls = [];
    }, destroy:function () {
        for (var i = 0; i < this._cachedOrderControls.length; i++) {
            var orderControl = this._cachedOrderControls[i];
            if (!orderControl._destroyed) {
                orderControl.destroy();
            }
        }
        $invokeSuper.call(this);
    }, createDom:function () {
        var ordersControl = this;
        var context = {}, dom = $DomUtils.xCreate({tagName:"TABLE", cellSpacing:0, cellPadding:0, content:{tagName:"TR", content:[{tagName:"TD", className:"label", content:$resource("dorado.criteriaBuilder.Orders")}, {tagName:"TD", content:{tagName:"DIV", className:"orders-container", contextKey:"ordersContainer"}}, {tagName:"TD", className:"editor-container", contextKey:"editorContainer"}]}}, null, context);
        ordersControl._ordersContainer = context.ordersContainer;
        var propertyEditor = ordersControl._propertyEditor = new dorado.widget.TextEditor({width:160, editable:false, trigger:"autoOpenMappingDropDown1", visible:false, onFocus:function (self) {
            self.set("mapping", ordersControl.getDropDownItems());
        }, onPost:function (self) {
            if (!self.get("value")) {
                return;
            }
            ordersControl._orders.push({property:self.get("value")});
            self.set({mapping:ordersControl.getDropDownItems(), value:null});
            ordersControl.refresh();
        }});
        ordersControl.registerInnerControl(propertyEditor);
        propertyEditor.render(context.editorContainer);
        return dom;
    }, refreshDom:function (dom) {
        $invokeSuper.call(this, [dom]);
        for (var i = 0; i < this._orderControls.length; i++) {
            var orderControl = this._orderControls[i];
            orderControl.unrender();
            this._cachedOrderControls.push(orderControl);
        }
        this._orderControls = [];
        var ordersContainer = this._ordersContainer;
        if (!this._orders || !this._orders.length) {
            ordersContainer.innerText = $resource("dorado.criteriaBuilder.OrdersUndefined");
        } else {
            ordersContainer.innerText = "";
            for (var i = 0; i < this._orders.length; i++) {
                var order = this._orders[i], orderControl;
                if (this._cachedOrderControls.length) {
                    orderControl = this._cachedOrderControls.pop();
                } else {
                    orderControl = new OrderControl({propertiesInfo:this._propertiesInfo});
                    this.registerInnerControl(orderControl);
                }
                orderControl.set("order", order);
                this._orderControls.push(orderControl);
                orderControl.render(ordersContainer);
            }
        }
    }, getDropDownItems:function () {
        var dropDownItems = this._propertiesInfo.dropDownItems;
        if (this._orders.length) {
            dropDownItems = dorado.Core.clone(dropDownItems);
            for (var i = dropDownItems.length - 1; i >= 0; i--) {
                var item = dropDownItems[i];
                for (var j = 0; j < this._orders.length; j++) {
                    if (item.key == this._orders[j].property) {
                        dropDownItems.removeAt(i);
                        break;
                    }
                }
            }
        }
        return dropDownItems;
    }, doOnFocus:function () {
        this._propertyEditor.set({mapping:this.getDropDownItems(), visible:true, style:{opacity:1}});
    }, doOnBlur:function () {
        var propertyEditor = this._propertyEditor, editorDom = propertyEditor.getDom();
        jQuery(editorDom).animate({opacity:0}, "slow", function () {
            propertyEditor.set("visible", false);
        });
    }});
    var OrderControl = $extend(dorado.widget.Control, {_inherentClassName:"i-order", focusable:true, ATTRIBUTES:{className:{defaultValue:"d-order"}, propertiesInfo:{}, order:{}}, createDom:function () {
        var orderControl = this, doms = {}, dom = $DomUtils.xCreate({tagName:"DIV", content:{tagName:"TABLE", cellSpacing:0, cellPadding:0, content:{tagName:"TR", content:[{tagName:"TD", className:"type", contextKey:"type"}, {tagName:"TD", content:{tagName:"DIV", className:"property", contextKey:"property"}}, {tagName:"TD", className:"button-container", contextKey:"buttonContainer"}]}}}, null, doms);
        this._doms = doms;
        var typeButton = orderControl._typeButton = new OrderTypeButton({exClassName:"icon-asc", onClick:function () {
            orderControl._order.desc = !orderControl._order.desc;
            orderControl.refresh();
        }});
        orderControl.registerInnerControl(typeButton);
        typeButton.render(doms.type);
        var delButton = orderControl._delButton = new dorado.widget.SimpleButton({className:"delete-button", onClick:function () {
            var ordersControl = orderControl.get("parent");
            ordersControl.get("orders").remove(orderControl._order);
            ordersControl.refresh();
        }});
        orderControl.registerInnerControl(delButton);
        delButton.render(doms.buttonContainer);
        return dom;
    }, refreshDom:function (dom) {
        $invokeSuper.call(this, [dom]);
        this._typeButton.set("exClassName", (this._order.desc ? "icon-desc" : "icon-asc"));
        var propertyDef = this._propertiesInfo.propertyMap[this._order.property];
        this._doms.property.innerText = propertyDef.get("label");
    }});
})();

