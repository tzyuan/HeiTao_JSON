(function() {
    dorado.widget.Action = $extend(dorado.widget.Component, {
        $className: "dorado.widget.Action",
        ATTRIBUTES: {
            caption: {},
            icon: {},
            iconClass: {},
            tip: {},
            disabled: {
                getter: function() {
                    return this._disabled || this._sysDisabled;
                }
            },
            parameter: {
                setter: function(parameter) {
                    if (this._parameter instanceof dorado.util.Map && parameter instanceof dorado.util.Map) {
                        this._parameter.put(parameter);
                    } else {
                        this._parameter = parameter;
                    }
                }
            },
            returnValue: { readOnly: true },
            hotkey: {
                writeBeforeReady: true,
                setter: function(hotkey) {
                    this._hotkey = hotkey;
                    var self = this;
                    if (hotkey) {
                        jQuery(document).bind("keydown", hotkey, function() {
                            self.execute();
                            return false;
                        });
                    }
                }
            },
            confirmMessage: {},
            successMessage: {}
        },
        EVENTS: { beforeExecute: {}, onExecute: {}, onSuccess: {}, onFailure: {} },
        constructor: function() {
            this._bindingObjects = new dorado.ObjectGroup();
            $invokeSuper.call(this, arguments);
            this.bind("onAttributeChange", function(self, arg) {
                self.notifyBindingObjects(arg.attribute, arg.value);
            });
        },
        notifyBindingObjects: function(attr, value) {
            var self = this;
            dorado.Toolkits.setDelayedAction(self, "$actionStateChangeTimerId", function() {
                if ((attr == "icon") || (attr == "iconClass")) {
                    self._bindingObjects.set(attr, value, { skipUnknownAttribute: true });
                } else {
                    self._bindingObjects.invoke("onActionStateChange");
                }
            }, 20);
        },
        doAddBindingObject: function(object) {
            this._bindingObjects.objects.push(object);
        },
        doRemoveBindingObject: function(object) {
            this._bindingObjects.objects.remove(object);
        },
        doExecute: dorado._NULL_FUNCTION,
        execute: function(callback) {
            var self = this,
                retval;

            function realCall() {
                var eventArg = {};
                var success = false,
                    result;
                try {
                    self._returnValue = result = self.doExecute();
                    success = true;
                } catch (e) {
                    self._returnValue = result = e;
                }
                eventArg.success = success;
                eventArg[success ? "result" : "error"] = result;
                self.fireEvent("onExecute", self, eventArg);
                eventArg.processDefault = true;
                self.fireEvent((success) ? "onSuccess" : "onFailure", self, eventArg);
                if (!success) {
                    if (eventArg.processDefault) {
                        if (result) {
                            throw result;
                        }
                    } else {
                        if (result) {
                            dorado.Exception.removeException(result);
                        }
                    }
                }
                if (success && eventArg.processDefault && self._successMessage) {
                    dorado.widget.NotifyTipManager.notify(self._successMessage);
                }
                return result;
            }
            var eventArg = { processDefault: true };
            self.fireEvent("beforeExecute", self, eventArg);
            if (eventArg.processDefault) {
                if (self._confirmMessage) {
                    dorado.MessageBox.confirm(self._confirmMessage, function() {
                        var retval = realCall.call(self);
                        $callback(callback, retval);
                    });
                } else {
                    retval = realCall.call(self);
                    $callback(callback, retval);
                }
            }
            return retval;
        }
    });
    dorado.widget.AsyncAction = $extend(dorado.widget.Action, {
        $className: "dorado.widget.AsyncAction",
        ATTRIBUTES: { async: {}, modal: { defaultValue: true }, executingMessage: {} },
        doExecuteSync: dorado._NULL_FUNCTION,
        doExecuteAsync: function(callback) {
            $callback(callback);
        },
        execute: function(callback) {
            if (this._disabled) {
                throw new dorado.ResourceException("dorado.baseWidget.ErrorCallDisabledAction", this._id);
            }
            if (this._sysDisabled) {
                throw new dorado.ResourceException("dorado.baseWidget.ErrorCallSysDisabledAction", this._id);
            }
            var self = this,
                retval;

            function realCall(callback) {
                var eventArg = { processDefault: true };
                if (self._async) {
                    var taskId;
                    if (self._executingMessage || this._modal) {
                        var message = self._executingMessage || $resource("dorado.core.DefaultTaskMessage");
                        if (message && message != "none") {
                            taskId = dorado.util.TaskIndicator.showTaskIndicator(message, this._modal ? "main" : "daemon");
                        } else {
                            taskId = 0;
                        }
                    }
                    var hasIcon, oldIcon, oldIconClass;
                    if (self._modal) {
                        self._sysDisabled = true;
                        self.notifyBindingObjects();
                    }
                    try {
                        self.doExecuteAsync({
                            callback: function(success, result) {
                                if (taskId) {
                                    dorado.util.TaskIndicator.hideTaskIndicator(taskId);
                                }
                                if (self._modal) {
                                    self._sysDisabled = false;
                                    self.notifyBindingObjects();
                                }
                                self._returnValue = result;
                                $callback(callback, success, result, { scope: self._view });
                                eventArg.success = success;
                                eventArg[success ? "result" : "error"] = result;
                                self.fireEvent("onExecute", self, eventArg);
                                self.fireEvent((success) ? "onSuccess" : "onFailure", self, eventArg);
                                if (!success && !eventArg.processDefault) {
                                    dorado.Exception.removeException(eventArg.error);
                                }
                                if (success && eventArg.processDefault && self._successMessage) {
                                    dorado.widget.NotifyTipManager.notify(self._successMessage);
                                }
                            }
                        });
                    } catch (e) {
                        if (taskId) {
                            dorado.util.TaskIndicator.hideTaskIndicator(taskId);
                        }
                        if (self._modal) {
                            self._sysDisabled = false;
                            self.notifyBindingObjects();
                        }
                        if (!(e instanceof dorado.AbstractException)) {
                            throw e;
                        }
                    }
                } else {
                    var success = false,
                        result;
                    try {
                        self._returnValue = result = self.doExecuteSync();
                        success = true;
                        $callback(callback, true, result, { scope: self._view });
                    } catch (e) {
                        self._returnValue = result = e;
                    }
                    eventArg.success = success;
                    eventArg[success ? "result" : "error"] = result;
                    self.fireEvent("onExecute", self, eventArg);
                    self.fireEvent((success) ? "onSuccess" : "onFailure", self, eventArg);
                    if (!success) {
                        if (eventArg.processDefault) {
                            if (result) {
                                throw result;
                            }
                        } else {
                            dorado.Exception.removeException(eventArg.error);
                        }
                    }
                    if (success && eventArg.processDefault && self._successMessage) {
                        dorado.widget.NotifyTipManager.notify(self._successMessage);
                    }
                    return result;
                }
            }
            var eventArg = { processDefault: true };
            self.fireEvent("beforeExecute", self, eventArg);
            if (eventArg.processDefault) {
                if (this._confirmMessage && this._confirmMessage != "none") {
                    var self = this;
                    dorado.MessageBox.confirm(this._confirmMessage, function() {
                        realCall.call(self, callback);
                    });
                } else {
                    retval = realCall.call(this, callback);
                }
            }
            return retval;
        }
    });
    var listenedAttrs = ["caption", "icon", "iconClass", "tip", "disabled"];
    dorado.widget.ActionSupport = $class({
        $className: "dorado.widget.ActionSupport",
        ATTRIBUTES: {
            action: {
                componentReference: true,
                setter: function(action) {
                    if (this._action instanceof dorado.widget.Action) {
                        this._action.doRemoveBindingObject(this);
                    }
                    if (action && !(action instanceof dorado.widget.Action)) {
                        var ref = action;
                        action = ref.view.id(ref.component);
                    }
                    this._action = action;
                    if (action) {
                        action.doAddBindingObject(this);
                    }
                }
            }
        },
        onActionStateChange: function() {
            if (this.refresh) {
                this.refresh(true);
            }
        },
        destroy: function() {
            if (this._destroyed) {
                return;
            }
            this.set("action", null);
            $invokeSuper.call(this, arguments);
        }
    });
})();
(function() {
    var VALIDATION_RESULT_CODE = { ok: 0, invalid: 1, executing: 2 };
    dorado.widget.AjaxAction = $extend(dorado.widget.AsyncAction, {
        $className: "dorado.widget.AjaxAction",
        ATTRIBUTES: { async: { defaultValue: true }, service: {}, timeout: {}, batchable: { defaultValue: true }, supportsEntity: { defaultValue: true } },
        getAjaxOptions: function() {
            var jsonData = { action: "remote-service", service: this._service, supportsEntity: this._supportsEntity, parameter: dorado.JSON.evaluate(this._parameter), sysParameter: this._sysParameter ? this._sysParameter.toJSON() : undefined, context: (this._view ? this._view.get("context") : null) };
            if (this._supportsEntity) {
                jsonData.loadedDataTypes = this.get("dataTypeRepository").getLoadedDataTypes();
            }
            return dorado.Object.apply({ jsonData: jsonData, timeout: this._timeout, batchable: this._batchable }, $setting["ajax.remoteServiceOptions"]);
        },
        doExecuteSync: function() {
            var ajaxOptions = this.getAjaxOptions(),
                ajax = dorado.util.AjaxEngine.getInstance(ajaxOptions);
            var result = ajax.requestSync(ajaxOptions);
            if (result.success) {
                var result = result.getJsonData(),
                    dataTypeRepository = this.get("dataTypeRepository"),
                    data;
                if (result && typeof result == "object" && (result.$dataTypeDefinitions || result.$context)) {
                    data = result.data;
                    if (result.$dataTypeDefinitions) {
                        dataTypeRepository.parseJsonData(result.$dataTypeDefinitions);
                    }
                    if (result.$context && this._view) {
                        var context = this._view.get("context");
                        context.clear();
                        context.put(result.$context);
                    }
                }
                if (data && this._supportsEntity) {
                    data = dorado.DataUtil.convertIfNecessary(data, dataTypeRepository);
                }
                return data;
            } else {
                throw result.exception;
            }
        },
        doExecuteAsync: function(callback) {
            var ajaxOptions = this.getAjaxOptions(),
                ajax = dorado.util.AjaxEngine.getInstance(ajaxOptions);
            ajax.request(ajaxOptions, {
                scope: this,
                callback: function(success, result) {
                    if (success) {
                        var data;
                        result = result.getJsonData(), dataTypeRepository = this.get("dataTypeRepository");
                        if (result && (result.$dataTypeDefinitions || result.$context)) {
                            data = result.data;
                            if (result.$dataTypeDefinitions) {
                                dataTypeRepository.parseJsonData(result.$dataTypeDefinitions);
                            }
                            if (result.$context && this._view) {
                                var context = this._view.get("context");
                                context.clear();
                                context.put(result.$context);
                            }
                        }
                        if (data && this._supportsEntity) {
                            data = dorado.DataUtil.convertIfNecessary(data, dataTypeRepository);
                        }
                        $callback(callback, true, data);
                    } else {
                        $callback(callback, false, result.exception);
                    }
                }
            });
        }
    });
    dorado.DataPath.registerInterceptor("CASCADE_DIRTY", function(data) {
        if (data instanceof dorado.Entity) {
            if (!data.isCascadeDirty()) {
                data = null;
            }
        } else {
            if (data instanceof dorado.EntityList) {
                var it = data.iterator(true);
                var data = [];
                while (it.hasNext()) {
                    var e = it.next();
                    if (e.isCascadeDirty()) {
                        data.push(e);
                    }
                }
            } else {
                data = null;
            }
        }
        return data;
    }, function(dataType) {
        return dataType;
    });
    var CASCADE_NOT_DRITY_ENTITYS;
    dorado.DataPath.registerInterceptor("DIRTY_TREE", function(data) {
        function gothrough(entity, ignoreSelf) {
            var isDirty = entity.isDirty();
            var data = entity._data;
            for (var property in data) {
                if (!data.hasOwnProperty(property)) {
                    continue;
                }
                if (property.charAt(0) == "$") {
                    continue;
                }
                var propertyDef = (entity._propertyDefs) ? entity._propertyDefs.get(property) : null;
                if (!propertyDef || !propertyDef._submittable) {
                    continue;
                }
                var value = entity.get(property, "never");
                if (value instanceof dorado.EntityList) {
                    var it = value.iterator(true);
                    while (it.hasNext()) {
                        if (gothrough(it.next())) {
                            isDirty = true;
                        }
                    }
                } else {
                    if (value instanceof dorado.Entity) {
                        if (gothrough(value, true)) {
                            isDirty = true;
                        }
                    }
                }
            }
            if (!isDirty && !ignoreSelf) {
                CASCADE_NOT_DRITY_ENTITYS[entity.entityId] = true;
            }
            return isDirty;
        }
        CASCADE_NOT_DRITY_ENTITYS = {};
        if (data instanceof dorado.Entity) {
            if (!gothrough(data)) {
                data = null;
            }
        } else {
            if (data instanceof dorado.EntityList) {
                var it = data.iterator(true);
                data = [];
                while (it.hasNext()) {
                    var entity = it.next();
                    if (gothrough(entity)) {
                        data.push(entity);
                    }
                }
            }
        }
        return data;
    }, function(dataType) {
        return dataType;
    });

    function filterCascadeDrityEntity(entity) {
        return !CASCADE_NOT_DRITY_ENTITYS[entity.entityId];
    }
    dorado.widget.UpdateAction = $extend(dorado.widget.AsyncAction, {
        $className: "dorado.widget.UpdateAction",
        ATTRIBUTES: {
            async: { defaultValue: true },
            dataResolver: {
                setter: function(v) {
                    this._dataResolver = (v && v.constructor === String) ? dorado.DataResolver.create(v) : v;
                }
            },
            updateItems: {
                getter: function() {
                    var updateItems = this._updateItems;
                    if (updateItems) {
                        var self = this;
                        jQuery.each(updateItems, function(i, updateItem) {
                            if (updateItem.refreshMode == null) {
                                updateItem.refreshMode = "value";
                            }
                            if (updateItem.autoResetEntityState == null) {
                                updateItem.autoResetEntityState = true;
                            }
                            if (updateItem.dataSet == null) {
                                return;
                            }
                            if (typeof updateItem.dataSet == "string") {
                                updateItem.dataSet = self.get("view").id(updateItem.dataSet);
                            } else {
                                if (!(updateItem.dataSet instanceof dorado.widget.DataSet)) {
                                    var ref = updateItem.dataSet;
                                    updateItem.dataSet = ref.view.id(ref.component);
                                }
                            }
                        });
                    }
                    return updateItems;
                }
            },
            alwaysExecute: {},
            hasUpdateData: {
                readOnly: true,
                getter: function() {
                    if (!this._updateItems.length) {
                        return false;
                    } else {
                        try {
                            var context = this.getResolveContext();
                            return context.hasUpdateData;
                        } catch (e) {
                            if (e instanceof dorado.widget.UpdateAction.ValidateException) {
                                dorado.Exception.removeException(e);
                                return true;
                            }
                        }
                    }
                }
            },
            executingMessage: { defaultValue: $resource("dorado.baseWidget.SubmitingData") }
        },
        EVENTS: {
            beforeExecute: {
                interceptor: function(superFire, self, arg) {
                    var retval = superFire(self, arg);
                    this._realExecutingMessage = this._executingMessage;
                    this._executingMessage = "none";
                    this._realConfirmMessage = this._confirmMessage;
                    this._confirmMessage = "none";
                    return retval;
                }
            },
            beforeUpdate: {},
            onUpdate: {},
            onGetUpdateData: {}
        },
        constructor: function(id) {
            this._updateItems = [];
            $invokeSuper.call(this, arguments);
        },
        getResolveContext: function() {
            function mergeValidateContext(context, contextForMerge) {
                if (!context) {
                    return contextForMerge;
                }
                if (VALIDATION_RESULT_CODE[contextForMerge.result] > VALIDATION_RESULT_CODE[context.result]) {
                    context.result = contextForMerge.result;
                }
                context.info = context.info.concat(contextForMerge.info);
                context.ok = context.ok.concat(contextForMerge.ok);
                context.warn = context.warn.concat(contextForMerge.warn);
                context.error = context.error.concat(contextForMerge.error);
                context.executing = context.executing.concat(contextForMerge.executing);
                context.executingValidationNum += contextForMerge.executingValidationNum;
                return context;
            }

            function validateEntity(validateContext, entity, validateOptions, validateSubEntities) {
                if (entity.isDirty() && entity.state != dorado.Entity.STATE_DELETED) {
                    validateOptions.context = {};
                    entity.validate(validateOptions);
                    validateContext = mergeValidateContext(validateContext, validateOptions.context);
                }
                if (validateSubEntities) {
                    for (var p in entity._data) {
                        if (p.charAt(0) == "$") {
                            continue;
                        }
                        var v = entity._data[p];
                        if (!v) {
                            continue;
                        }
                        if (v instanceof dorado.Entity) {
                            validateContext = validateEntity(validateContext, v, validateOptions, validateSubEntities);
                        } else {
                            if (v instanceof dorado.EntityList) {
                                var it = v.iterator();
                                while (it.hasNext()) {
                                    var e = it.next();
                                    validateContext = validateEntity(validateContext, e, validateOptions, validateSubEntities);
                                }
                            }
                        }
                    }
                }
                return validateContext;
            }
            var dataItems = [],
                updateInfos = [],
                aliasMap = {},
                hasUpdateData = false,
                updateItems = this.get("updateItems");
            for (var i = 0; i < updateItems.length; i++) {
                var updateItem = updateItems[i];
                var dataSet = updateItem.dataSet;
                var options = updateItem.options;
                if (!options && options instanceof Object) {
                    if (options.loadMode !== false) {
                        options.loadMode = true;
                    }
                    if (options.includeUnsubmittableProperties !== true) {
                        options.includeUnsubmittableProperties = false;
                    }
                    if (options.generateDataType !== false) {
                        options.generateDataType = true;
                    }
                    if (options.generateState !== false) {
                        options.generateState = true;
                    }
                    if (options.generateEntityId !== false) {
                        options.generateEntityId = true;
                    }
                } else {
                    options = { loadMode: "never", includeUnsubmittableProperties: false, generateDataType: true, generateState: true, generateEntityId: true };
                }
                updateItem.options = options;
                options.firstResultOnly = updateItem.firstResultOnly;
                options.generateOldData = updateItem.submitOldData;
                options.simplePropertyOnly = updateItem.submitSimplePropertyOnly;
                var alias = updateItem.alias;
                if (dataSet) {
                    alias = alias || dataSet._id;
                    aliasMap[alias] = dataSet;
                } else {
                    if (!alias) {
                        alias = "$alias" + i;
                    }
                }
                var dataPath = updateItem.dataPath || "!DIRTY_TREE";
                if (dataPath.indexOf("!DIRTY_TREE") >= 0) {
                    options.entityFilter = filterCascadeDrityEntity;
                    options.includeDeletedEntity = true;
                    CASCADE_NOT_DRITY_ENTITYS = {};
                } else {
                    if (updateItem.submitSimplePropertyOnly) {
                        options.entityFilter = filterCascadeDrityEntity;
                        CASCADE_NOT_DRITY_ENTITYS = {};
                    }
                }
                var entityFilter = options.entityFilter;
                var data;
                if (dataSet) {
                    dataSet.post();
                    data = dataSet.queryData(dataPath, options);
                }
                var eventArg = { updateItem: updateItem, data: data };
                this.fireEvent("onGetUpdateData", this, eventArg);
                data = eventArg.data;
                if (data) {
                    var validateContext, validateOptions = { force: false, validateSimplePropertyOnly: updateItem.submitSimplePropertyOnly };
                    var validateSubEntities = !updateItem.submitSimplePropertyOnly;
                    if (data instanceof Array) {
                        for (var j = 0; j < data.length; j++) {
                            var entity = data[j];
                            if (entity instanceof dorado.Entity) {
                                validateContext = validateEntity(validateContext, entity, validateOptions, validateSubEntities);
                            }
                        }
                    } else {
                        if (data instanceof dorado.EntityList) {
                            for (var it = data.iterator(); it.hasNext();) {
                                var entity = it.next();
                                validateContext = validateEntity(validateContext, entity, validateOptions, validateSubEntities);
                            }
                        } else {
                            if (data instanceof dorado.Entity) {
                                validateContext = validateEntity(validateContext, data, validateOptions, validateSubEntities);
                            }
                        }
                    }
                }
                dataItems.push({ updateItem: updateItem, alias: alias, data: data, refreshMode: updateItem.refreshMode, autoResetEntityState: updateItem.autoResetEntityState });
            }
            if (validateContext) {
                if (validateContext.result == "invalid") {
                    var errorMessage = $resource("dorado.baseWidget.SubmitInvalidData") + "\n";
                    if (validateContext.error.length + validateContext.warn.length == 1) {
                        if (validateContext.error.length) {
                            errorMessage += validateContext.error[0].text;
                        } else {
                            errorMessage += validateContext.warn[0].text;
                        }
                    } else {
                        errorMessage += $resource("dorado.baseWidget.SubmitValidationSummary", validateContext.error.length, validateContext.warn.length);
                    }
                    throw new dorado.widget.UpdateAction.ValidateException(errorMessage, validateContext);
                } else {
                    if (validateContext.executing.length > 0) {
                        throw new dorado.ResourceException("dorado.baseWidget.SubmitValidatingData", validateContext.executing.length);
                    }
                }
            }
            for (var i = 0; i < dataItems.length; i++) {
                var dataItem = dataItems[i],
                    updateItem = dataItem.updateItem,
                    data = dataItem.data,
                    options = updateItem.options;
                delete dataItem.updateItem;
                var entities = [],
                    context = { entities: [] };
                if (data) {
                    if (data instanceof Array) {
                        var v = data,
                            data = [];
                        hasUpdateData = hasUpdateData || (v.length > 0);
                        for (var j = 0; j < v.length; j++) {
                            var entity = v[j];
                            if (entity instanceof dorado.Entity) {
                                entities.push(entity);
                                data.push(entity.toJSON(options, context));
                            }
                        }
                    } else {
                        if (data instanceof dorado.EntityList || data instanceof dorado.Entity) {
                            hasUpdateData = true;
                            if (updateItem.refreshMode == "cascade") {
                                if (data instanceof dorado.Entity) {
                                    if (updateItem.refreshMode == "cascade") {
                                        entities.push(data);
                                    }
                                } else {
                                    for (var it = data.iterator(); it.hasNext();) {
                                        var entity = it.next();
                                        if (updateItem.refreshMode == "cascade") {
                                            entities.push(entity);
                                        }
                                    }
                                }
                            }
                            data = data.toJSON(options, context);
                        }
                    }
                }
                if ((!data || !data.$isWrapper) && updateItem.dataSet) {
                    options.acceptAggregationDataType = true;
                    var dataType = updateItem.dataSet.getDataType(updateItem.dataPath, options);
                    if (dataType) {
                        if (dataType instanceof dorado.AggregationDataType && !data && !(data instanceof Array)) {
                            dataType = dataType.get("elementDataType");
                        }
                        data = { $isWrapper: true, $dataType: dataType._id, data: data };
                    }
                }
                dataItem.data = data;
                updateInfos.push({ alias: dataItem.alias, refreshMode: updateItem.refreshMode, entities: ((updateItem.refreshMode == "cascade") ? entities : context.entities) });
            }
            return { aliasMap: aliasMap, updateInfos: updateInfos, dataResolverArg: { dataItems: dataItems, parameter: this._parameter, sysParameter: this._sysParameter ? this._sysParameter.toJSON() : undefined, view: this._view }, hasUpdateData: hasUpdateData };
        },
        doExecuteSync: function() {
            return this.doExecuteAsync();
        },
        doExecuteAsync: function(callback) {
            var confirmMessage = this._realConfirmMessage,
                executingMessage = this._realExecutingMessage;
            this._executingMessage = executingMessage;
            delete this._realExecutingMessage;
            this._confirmMessage = confirmMessage;
            delete this._realConfirmMessage;

            function processEntityStates(entityStates, context) {
                function processEntity(entity, entityStates, refreshMode) {
                    if (!entity.entityId) {
                        return;
                    }
                    var b;
                    if (refreshMode != "cascade") {
                        var data = entity.getData();
                        for (var p in data) {
                            if (!data.hasOwnProperty(p)) {
                                continue;
                            }
                            var v = data[p];
                            if (v instanceof Object && v.entityId) {
                                b = processEntity(v, entityStates) || b;
                            }
                        }
                    }
                    entity.disableEvents = true;
                    try {
                        var state = (entityStates == undefined ? undefined : entityStates[entity.entityId]) || dorado.Entity.STATE_NONE;
                        if (state.constructor == Number) {
                            delete entity._oldData;
                            if (state == dorado.Entity.STATE_DELETED) {
                                entity.remove(true);
                            } else {
                                if (entity.state == state) {
                                    return b;
                                } else {
                                    if (state == dorado.Entity.STATE_NONE) {
                                        entity.resetState();
                                    } else {
                                        entity.setState(state);
                                    }
                                }
                            }
                        } else {
                            var s = state.$state || dorado.Entity.STATE_NONE;
                            delete state.$state;
                            if (refreshMode == "cascade") {
                                for (var p in state) {
                                    if (state.hasOwnProperty(p)) {
                                        var pd = entity.getPropertyDef(p);
                                        if (pd && !pd._submittable) {
                                            delete state[p];
                                        }
                                    }
                                }
                                entity.fromJSON(state);
                            } else {
                                var dataType = entity.dataType;
                                if (dataType) {
                                    dataType.set("validatorsDisabled", true);
                                }
                                for (var p in state) {
                                    if (state.hasOwnProperty(p)) {
                                        var pd = entity.getPropertyDef(p);
                                        if (pd && pd._submittable) {
                                            var dt = pd.get("dataType");
                                            if (dt instanceof dorado.AggregationDataType || dt instanceof dorado.EntityDataType) {
                                                continue;
                                            }
                                            entity.set(p, state[p]);
                                        }
                                    }
                                }
                                if (dataType) {
                                    dataType.set("validatorsDisabled", false);
                                }
                            }
                            delete entity._oldData;
                            if (s == dorado.Entity.STATE_NONE) {
                                entity.resetState();
                            } else {
                                entity.setState(s);
                            }
                        }
                    } finally {
                        entity.disableEvents = false;
                    }
                    return true;
                }

                function processUpdateInfo(updateInfo, entityStates) {
                    if (updateInfo.refreshMode == "none") {
                        return false;
                    }
                    var b = false,
                        entities = updateInfo.entities;
                    if (updateInfo.refreshMode == "cascade") {
                        var map = {};
                        for (var i = 0; i < entities.length; i++) {
                            var entity = entities[i];
                            map[entity.entityId] = entity;
                        }
                        for (var entityId in entityStates) {
                            if (entityStates.hasOwnProperty(entityId)) {
                                var entity = map[entityId];
                                if (entity) {
                                    b = processEntity(entity, entityStates, updateInfo.refreshMode) || b;
                                }
                            }
                        }
                    } else {
                        for (var i = 0; i < entities.length; i++) {
                            var entity = entities[i];
                            b = processEntity(entity, entityStates, updateInfo.refreshMode) || b;
                        }
                    }
                    return b;
                }
                var updateInfos = context.updateInfos,
                    changedDataSets = [];
                for (var i = 0; i < updateInfos.length; i++) {
                    var updateInfo = updateInfos[i],
                        alias = updateInfo.alias,
                        dataSet = context.aliasMap[alias];
                    if (!dataSet && updateInfo.entities.length) {
                        dataSet = dorado.widget.DataSet.getOwnerDataSet(updateInfo.entities[0]);
                    }
                    if (dataSet) {
                        dataSet.disableObservers();
                    }
                    try {
                        if (processUpdateInfo(updateInfos[i], entityStates) && dataSet) {
                            changedDataSets.push(dataSet);
                        }
                    } finally {
                        if (dataSet) {
                            dataSet.enableObservers();
                        }
                    }
                }
                jQuery.each(changedDataSets, function(i, dataSet) {
                    dataSet.notifyObservers();
                });
            }

            function doUpdate(context, dataResolverArg) {
                var eventArg = { dataItems: dataResolverArg.dataItems, parameter: dataResolverArg.parameter, processDefault: true };
                this.fireEvent("beforeUpdate", this, eventArg);
                if (eventArg.processDefault && this._dataResolver) {
                    var dataResolver = this._dataResolver;
                    dataResolver.supportsEntity = this._supportsEntity;
                    dataResolver.dataTypeRepository = this.get("dataTypeRepository");
                    dataResolver.message = executingMessage ? executingMessage : "";
                    dataResolver.modal = this._modal;
                    if (callback) {
                        return dataResolver.resolveAsync(dataResolverArg, {
                            scope: this,
                            callback: function(success, result) {
                                if (success) {
                                    processEntityStates.call(this, result.entityStates, context);
                                }
                                $callback(callback, success, (success) ? result.returnValue : result);
                                this.fireEvent("onUpdate", this, eventArg);
                            }
                        });
                    } else {
                        var result = dataResolver.resolve(dataResolverArg);
                        processEntityStates.call(this, result.entityStates, context);
                        this.fireEvent("onUpdate", this, eventArg);
                        return result.returnValue;
                    }
                } else {
                    $callback(callback, true);
                }
            }
            var context;
            try {
                context = this.getResolveContext();
            } catch (e) {
                if (e instanceof dorado.widget.UpdateAction.ValidateException) {
                    dorado.Exception.removeException(e);
                    var eventArg = { success: false, error: e, processDefault: true };
                    this.fireEvent("onFailure", this, eventArg);
                    if (eventArg.processDefault) {
                        if (dorado.widget.UpdateAction.alertException) {
                            dorado.widget.UpdateAction.alertException(e);
                        } else {
                            throw e;
                        }
                    }
                    throw new dorado.AbortException();
                } else {
                    throw e;
                }
            }
            var dataResolverArg = context.dataResolverArg;
            if (this._alwaysExecute || !this._updateItems.length || context.hasUpdateData) {
                if (confirmMessage && confirmMessage != "none") {
                    var self = this;
                    dorado.MessageBox.confirm(confirmMessage, {
                        detailCallback: function(buttonId) {
                            if (buttonId == "yes") {
                                return doUpdate.call(self, context, dataResolverArg);
                            } else {
                                $callback(callback, false);
                            }
                        }
                    });
                } else {
                    return doUpdate.call(this, context, dataResolverArg);
                }
            } else {
                if (!this._alwaysExecute && this._updateItems.length && !context.hasUpdateData) {
                    dorado.widget.NotifyTipManager.notify($resource("dorado.baseWidget.NoDataToSubmit"));
                }
                if (callback) {
                    $callback(callback, false);
                } else {
                    return false;
                }
            }
        }
    });
    dorado.widget.UpdateAction.ValidateException = $extend(dorado.Exception, {
        constructor: function(message, validateContext) {
            $invokeSuper.call(this, arguments);
            this.validateContext = validateContext;
        }
    });
})();
(function() {
    var form_prefix = "form_submit_action_",
        form_seed = 1;
    var dateToJSON = function(date) {
        function f(n) {
            return n < 10 ? "0" + n : n;
        }
        return date.getUTCFullYear() + "-" + f(date.getUTCMonth() + 1) + "-" + f(date.getUTCDate()) + "T" + f(date.getUTCHours()) + ":" + f(date.getUTCMinutes()) + ":" + f(date.getUTCSeconds()) + "Z";
    };
    dorado.widget.FormSubmitAction = $extend(dorado.widget.Action, {
        $className: "dorado.widget.FormSubmitAction",
        ATTRIBUTES: { action: {}, target: { defaultValue: "_self" }, method: { defaultValue: "post" } },
        doSubmitData: function(data) {
            var action = this,
                form = document.createElement("form");
            form.name = form_prefix + form_seed++;
            form.style.display = "none";
            form.action = dorado.util.Common.translateURL(action._action);
            form.target = action._target || "_self";
            form.method = action._method || "post";
            for (var param in data) {
                var input = document.createElement("input"),
                    value = data[param],
                    string = "";
                if (value !== undefined) {
                    if (value instanceof Date) {
                        string = dateToJSON(value);
                    } else {
                        if (value.toString) {
                            string = value.toString();
                        }
                    }
                }
                input.type = "hidden";
                input.value = string;
                input.name = param;
                form.appendChild(input);
            }
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        },
        doExecute: function() {
            var action = this,
                parameter = dorado.JSON.evaluate(action._parameter),
                data = {};
            if (parameter && parameter instanceof dorado.Entity) {
                data = parameter.toJSON();
            } else {
                if (parameter) {
                    data = parameter;
                }
            }
            action.doSubmitData(data);
        }
    });
})();
(function() {
    var ACTIVE_STATES = ["running", "resuming"];
    var ALIVE_STATES = ["running", "suspending", "suspended", "resuming"];
    dorado.widget.LongTask = $extend(dorado.widget.Action, {
        $className: "dorado.widget.LongTask",
        ATTRIBUTES: {
            taskName: {},
            socket: {},
            appearence: { defaultValue: "daemonTask", writeBeforeReady: true },
            disableOnActive: { defaultValue: true },
            stateInfo: {},
            lastLog: {},
            active: {
                readOnly: true,
                getter: function() {
                    return ACTIVE_STATES.indexOf(this._stateInfo.state) >= 0;
                }
            },
            alive: {
                readOnly: true,
                getter: function() {
                    return ALIVE_STATES.indexOf(this._stateInfo.state) >= 0;
                }
            }
        },
        EVENTS: { onTaskScheduled: {}, onTaskEnd: {}, onStateChange: {}, onReceive: {}, onLog: {} },
        onReady: function() {
            $invokeSuper.call(this);
            this.connect();
        },
        onReceiveAll: function(type, data) {
            var task = this;
            if (task._starting) {
                if (!task._pendingMessages) {
                    task._pendingMessages = [];
                }
                task._pendingMessages.push({ type: type, data: data });
            } else {
                switch (type) {
                    case "state":
                        task.onStateChange(data);
                        break;
                    case "log":
                        task.onLog(data);
                        break;
                    default:
                        task.fireEvent("onReceive", task, { type: type, data: data });
                }
            }
        },
        getStateDisplayInfo: function(stateInfo) {
            var task = this,
                text = stateInfo.text;
            if (!text) {
                text = (task._caption || $resource("dorado.baseWidget.LongTask")) + " [" + $resource("dorado.baseWidget.LongTask." + stateInfo.state) + "]";
            }
            return { text: text, startTime: (stateInfo.localStartTime) ? new Date(stateInfo.localStartTime) : new Date() };
        },
        onTaskScheduled: function(stateInfo) {
            var task = this;
            task._isAlive = true;
            var displayInfo = task.getStateDisplayInfo(stateInfo);
            switch (task._appearence) {
                case "daemonTask":
                    task._taskIndicatorId = dorado.util.TaskIndicator.showTaskIndicator(displayInfo.text, "daemon", displayInfo.startTime);
                    break;
                case "mainTask":
                    task._taskIndicatorId = dorado.util.TaskIndicator.showTaskIndicator(displayInfo.text, "main", displayInfo.startTime);
                    break;
            }
            if (task._disableOnActive) {
                task._sysDisabled = true;
            }
            task.notifyBindingObjects();
            task.fireEvent("onTaskScheduled", task, stateInfo);
        },
        onTaskEnd: function(stateInfo) {
            var task = this,
                state = stateInfo.state;
            task._isAlive = false;
            task.fireEvent("onTaskEnd", task, stateInfo);
            var success = (state == "terminated"),
                eventArg = { success: success };
            var result = stateInfo.data;
            if (result && !eventArg.success) {
                result = new dorado.RemoteException(result.message, result.exceptionType, result.stackTrace);
            } else {
                task._returnValue = result;
            }
            eventArg[eventArg.success ? "result" : "error"] = result;
            task.fireEvent("onExecute", task, eventArg);
            eventArg.processDefault = true;
            task.fireEvent((success) ? "onSuccess" : "onFailure", task, eventArg);
            if (task._disableOnActive) {
                task._sysDisabled = false;
            }
            task.notifyBindingObjects();
            if (!success && !eventArg.processDefault) {
                dorado.Exception.removeException(result);
            }
            switch (task._appearence) {
                case "daemonTask":
                case "mainTask":
                    dorado.util.TaskIndicator.hideTaskIndicator(task._taskIndicatorId);
                    break;
            }
        },
        onStateChange: function(stateInfo) {
            var task = this;
            if (stateInfo) {
                var remoteStartTime = (stateInfo.state == "waiting") ? stateInfo.waitingStartTime : stateInfo.runningStartTime;
                var timeGap = stateInfo.transferTimestamp - (new Date()).getTime();
                stateInfo.localStartTime = remoteStartTime - timeGap;
            }
            task._stateInfo = stateInfo;
            task.fireEvent("onStateChange", task, stateInfo);
            if (stateInfo) {
                var state = stateInfo.state;
                if (["terminated", "error", "aborted"].indexOf(state) >= 0) {
                    if (task._isAlive) {
                        task.onTaskEnd(stateInfo);
                    }
                } else {
                    if (!task._isAlive) {
                        task.onTaskScheduled(stateInfo);
                    }
                }
                switch (task._appearence) {
                    case "daemonTask":
                    case "mainTask":
                        var displayInfo = task.getStateDisplayInfo(stateInfo);
                        dorado.util.TaskIndicator.updateTaskIndicator(task._taskIndicatorId, displayInfo.text, displayInfo.startTime);
                        break;
                }
            }
        },
        onLog: function(log) {
            var task = this;
            task._lastLog = log;
            task.fireEvent("onLog", task, log);
            var stateInfo = task._stateInfo;
            if (stateInfo) {
                switch (task._appearence) {
                    case "daemonTask":
                    case "mainTask":
                        var displayInfo = task.getStateDisplayInfo(stateInfo);
                        dorado.util.TaskIndicator.updateTaskIndicator(task._taskIndicatorId, displayInfo.text + "\n" + log.text);
                        break;
                }
            }
        },
        connect: function() {
            var task = this;
            var socket = task._socket = dorado.Socket.connect({
                service: "dorado.connectLongTask",
                parameter: task._taskName,
                onReceive: function(self, arg) {
                    task.onReceiveAll(arg.type, arg.data);
                }
            }, function(stateInfo) {
                if (stateInfo != null) {
                    task.onStateChange(stateInfo);
                }
            });
        },
        getAjaxOptions: function(service) {
            var task = this,
                jsonData = { action: "remote-service", service: service, parameter: { taskName: task._taskName, socketId: task._socket._socketId, parameter: dorado.JSON.evaluate(task._parameter) }, sysParameter: task._sysParameter ? task._sysParameter.toJSON() : undefined, context: (task._view ? task._view.get("context") : null) };
            if (this._supportsEntity) {
                jsonData.loadedDataTypes = task.get("dataTypeRepository").getLoadedDataTypes();
            }
            return dorado.Object.apply({ jsonData: jsonData, batchable: true }, $setting["ajax.remoteServiceOptions"]);
        },
        doStart: function(callback) {
            var task = this;
            var ajaxOptions = task.getAjaxOptions("dorado.startLongTask"),
                ajax = dorado.util.AjaxEngine.getInstance(ajaxOptions);
            task._starting = true;
            ajax.request(ajaxOptions, {
                callback: function(success, result) {
                    try {
                        result = result.getJsonData();
                        if (success) {
                            task.bind("onExecute", function(self, arg) {
                                task.unbind("onExecute", arguments.callee);
                                $callback(callback, arg.success, arg.result);
                            });
                            task.onStateChange({ state: "waiting" });
                        } else {
                            $callback(callback, false, result && result.exception);
                        }
                    } finally {
                        task._starting = false;
                        if (task._pendingMessages) {
                            var messages = task._pendingMessages;
                            delete task._pendingMessages;
                            setTimeout(function() {
                                messages.each(function(message) {
                                    task.onReceiveAll(message.type, message.data);
                                });
                            }, 0);
                        }
                    }
                }
            });
        },
        checkSocket: function(callback) {
            var task = this;
            if (!task._socket) {
                setTimeout(function() {
                    task.checkSocket(callback);
                }, 30);
            } else {
                callback();
            }
        },
        execute: function(callback) {
            var task = this,
                eventArg = { processDefault: true };
            task.fireEvent("beforeExecute", task, eventArg);
            if (eventArg.processDefault) {
                if (task._confirmMessage) {
                    dorado.MessageBox.confirm(task._confirmMessage, function() {
                        task.checkSocket(function() {
                            task.doStart(callback);
                        });
                    });
                } else {
                    task.checkSocket(function() {
                        task.doStart(callback);
                    });
                }
            }
        },
        start: function(callback) {
            this.execute(callback);
        },
        abort: function(callback) {
            var task = this;
            task.checkSocket(function() {
                task.bind("onTaskEnd", function(self, arg) {
                    task.unbind("onTaskEnd", arguments.callee);
                    $callback(callback, (arg.state == "aborted"), arg.data);
                });
                task._socket.send("abort");
            });
        },
        suspend: function(callback) {
            var task = this;
            task.checkSocket(function() {
                task._socket.send("suspend");
            });
        },
        resume: function(callback) {
            var task = this;
            task.checkSocket(function() {
                task._socket.send("resume");
            });
        },
        send: function(type, data, callback) {
            var task = this;
            task.checkSocket(function() {
                task._socket.send(type, data, callback);
            });
        }
    });
})();
dorado.widget.AbstractButton = $extend([dorado.widget.Control, dorado.widget.ActionSupport], {
    selectable: false,
    ATTRIBUTES: {
        disabled: {
            setter: function(value) {
                this._disabled = value;
                this.onDisabledChange && this.onDisabledChange();
            }
        },
        toggleable: {},
        menu: { componentReference: true },
        toggleOnShowMenu: { defaultValue: true },
        toggled: {
            skipRefresh: true,
            setter: function(value) {
                var button = this;
                if (button._toggled != value) {
                    button._toggled = value;
                    button.fireEvent("onToggle", button);
                    button.doSetToggle(value);
                }
            }
        },
        tip: {
            getter: function() {
                return this._tip || (this._action && this._action._tip);
            }
        }
    },
    EVENTS: { onToggle: {} },
    onClick: function() {
        var button = this,
            action = button._action;
        if (button.getListenerCount("onClick") == 0 && action) {
            action.execute && action.execute();
        }
        if (button._toggleable) {
            button.set("toggled", !button._toggled);
        }
        return false;
    },
    click: function() {
        this.onClick();
    }
});
(function() {
    var BUTTON_CLICK_CLASS = "-click",
        BUTTON_HOVER_CLASS = "-hover",
        BUTTON_TOGGLED_CLASS = "-toggled",
        BUTTON_DISABLED_CLASS = "-disabled";
    dorado.widget.SimpleButton = $extend(dorado.widget.AbstractButton, {
        $className: "dorado.widget.SimpleButton",
        ATTRIBUTES: { className: { defaultValue: "d-simple-button" }, mouseDownClassName: {}, hoverClassName: {}, toggledClassName: {}, disabledClassName: {} },
        doSetToggle: function() {
            var button = this,
                dom = button._dom,
                cls = button._className,
                toggledClass = button._toggledClassName;
            if (dom) {
                $fly(dom).toggleClass("d-toggled " + (toggledClass ? toggledClass : (cls + BUTTON_TOGGLED_CLASS)), !!button._toggled);
            }
        },
        doShowMenu: function() {
            var button = this,
                menu = button._menu,
                dom = button._dom,
                cls = button._className,
                toggledClass = button._toggledClassName;
            if (menu) {
                menu.bind("onShow", function() {
                    if (button._toggleOnShowMenu) {
                        $fly(dom).addClass("d-toggled " + (toggledClass ? toggledClass : (cls + BUTTON_TOGGLED_CLASS)));
                    }
                    menu.bind("onHide", function() {
                        if (button._toggleOnShowMenu) {
                            $fly(dom).removeClass("d-toggled " + (toggledClass ? toggledClass : (cls + BUTTON_TOGGLED_CLASS)));
                        }
                    }, { once: true });
                }, { once: true });
                menu._focusParent = button;
                menu.show({ anchorTarget: button, align: "innerleft", vAlign: "bottom" });
            }
        },
        onDisabledChange: function() {
            var button = this,
                dom = button._dom,
                cls = button._className,
                hoverClass = button._hoverClassName;
            if (dom) {
                $fly(dom).removeClass("d-hover " + (hoverClass ? hoverClass : (button._className + BUTTON_HOVER_CLASS))).removeClass(cls + "-focused");
            }
        },
        createDom: function() {
            var button = this,
                dom = document.createElement("div"),
                hoverClass = button._hoverClassName,
                mouseDownClass = button._mouseDownClassName;
            dom.className = button._className;
            $fly(dom).hover(function() {
                if (!button._disabled) {
                    $fly(dom).addClass("d-hover " + (hoverClass ? hoverClass : (button._className + BUTTON_HOVER_CLASS)));
                }
            }, function() {
                $fly(dom).removeClass("d-hover " + (hoverClass ? hoverClass : (button._className + BUTTON_HOVER_CLASS)));
            }).mousedown(function() {
                if (!button._disabled) {
                    $fly(dom).addClass("d-click " + (mouseDownClass ? mouseDownClass : (button._className + BUTTON_CLICK_CLASS)));
                }
                $(document).one("mouseup", function() {
                    $fly(dom).removeClass("d-click " + (mouseDownClass ? mouseDownClass : (button._className + BUTTON_CLICK_CLASS)));
                });
            });
            return dom;
        },
        refreshDom: function(dom) {
            $invokeSuper.call(this, arguments);
            var button = this,
                cls = button._className,
                disabledClass = button._disabledClassName,
                toggledClass = button._toggledClassName;
            $fly(dom).toggleClass("d-disabled " + (disabledClass ? disabledClass : (cls + BUTTON_DISABLED_CLASS)), !!button._disabled).toggleClass("d-toggled " + (toggledClass ? toggledClass : (cls + BUTTON_TOGGLED_CLASS)), !!button._toggled);
        },
        onClick: function() {
            $invokeSuper.call(this, arguments);
            if (this._menu) {
                this.doShowMenu();
            }
        }
    });
    dorado.widget.SimpleIconButton = $extend(dorado.widget.SimpleButton, {
        $className: "dorado.widget.SimpleIconButton",
        ATTRIBUTES: { className: { defaultValue: "d-icon-button" }, width: { independent: true }, height: { independent: true }, icon: {}, iconClass: {}, showTrigger: { writeBeforeReady: true } },
        createDom: function() {
            this._className = this._showTrigger === true || (this._menu && (this._showTrigger !== false)) ? this._className + "-trigger d-trigger" : this._className;
            var dom = $invokeSuper.call(this, arguments);
            $fly(dom).addClass(this._className).xCreate({ tagName: "div", className: "d-icon" });
            return dom;
        },
        refreshDom: function(dom) {
            $invokeSuper.call(this, arguments);
            var button = this,
                cls = button._className,
                action = button._action || {},
                icon = button._icon || action._icon,
                iconClass = button._iconClass || action._iconClass;
            var iconEl = dom.firstChild;
            $DomUtils.setBackgroundImage(iconEl, icon);
            if (iconClass) {
                iconEl.className = "d-icon " + iconClass;
            }
            $fly(dom).toggleClass("d-disabled " + cls + BUTTON_DISABLED_CLASS, !!(button._disabled || action._disabled));
        }
    });
})();
(function() {
    var BLANK_PATH = "about:blank";
    dorado.widget.IFrame = $extend(dorado.widget.Control, {
        $className: "dorado.widget.IFrame",
        ATTRIBUTES: {
            className: { defaultValue: "d-iframe" },
            name: { writeBeforeReady: true },
            path: {
                skipRefresh: true,
                setter: function(value) {
                    var frame = this,
                        oldPath = frame._path,
                        dom = frame._dom,
                        doms = frame._doms;
                    frame._path = value;
                    if (oldPath == value) {
                        return;
                    }
                    if (dom) {
                        $fly(doms.loadingCover).css("display", "block");
                        frame.releaseCurrentPage();
                        $fly(doms.iframe).addClass("hidden");
                        if (oldPath != value) {
                            frame._loaded = false;
                        }
                        if (frame.isActualVisible()) {
                            frame.replaceUrl(value);
                        } else {
                            frame._toReplaceUrl = value;
                        }
                    }
                }
            },
            iFrameWindow: {
                readOnly: true,
                getter: function() {
                    return this.getIFrameWindow();
                }
            }
        },
        EVENTS: { onLoad: {} },
        getDomainInfo: function(domain) {
            var regex = /^(http[s]?):\/\/([\w.]+)(:([\d]+))?/ig,
                result = regex.exec(domain);
            if (result) {
                return { protocol: result[1], domain: result[2], port: result[4] };
            } else {
                return {};
            }
        },
        isSameDomain: function() {
            var iframeSrc = $url(this._path);
            if (/^(http[s]?):/ig.test(iframeSrc)) {
                var localDomain = this.getDomainInfo(location.href),
                    frameDomain = this.getDomainInfo(iframeSrc);
                return localDomain.protocol == frameDomain.protocol && localDomain.domain == frameDomain.domain && localDomain.port == frameDomain.port;
            }
            return true;
        },
        releaseCurrentPage: function() {
            var frame = this,
                doms = frame._doms;
            if (doms) {
                try {
                    if (frame.isSameDomain()) {
                        if (doms.iframe.contentWindow.dorado) {
                            doms.iframe.contentWindow.dorado.Exception.IGNORE_ALL_EXCEPTIONS = true;
                        }
                        doms.iframe.contentWindow.document.write("");
                        if (dorado.Browser.msie) {
                            doms.iframe.contentWindow.close();
                            CollectGarbage();
                        } else {
                            doms.iframe.contentWindow.close();
                        }
                    } else {
                        frame.replaceUrl(null);
                    }
                } catch (e) {}
            }
        },
        destroy: function() {
            var frame = this,
                doms = frame._doms;
            frame.releaseCurrentPage();
            if (doms) {
                $fly(doms.iframe).remove();
            }
            $invokeSuper.call(frame);
        },
        createDom: function() {
            var frame = this,
                doms = {},
                dom = $DomUtils.xCreate({ tagName: "div", content: [{ tagName: "iframe", className: "iframe hidden", contextKey: "iframe", scrolling: dorado.Browser.iOS ? "no" : "auto", frameBorder: 0 }, { tagName: "div", contextKey: "loadingCover", className: "frame-loading-cover", style: { display: "none" }, content: { tagName: "div", className: "frame-loading-image", contextKey: "loadingCoverImg", content: { tagName: "div", className: "spinner" } } }] }, null, doms);
            if (frame._name != undefined) {
                doms.iframe.name = frame._name || "";
            }
            frame._doms = doms;
            return dom;
        },
        doOnAttachToDocument: function() {
            var frame = this,
                doms = frame._doms,
                iframe = doms.iframe;
            $fly(iframe).load(function() {
                $fly(doms.loadingCover).css("display", "none");
                if (!(dorado.Browser.msie && dorado.Browser.version == 6)) {
                    $fly(iframe).removeClass("hidden");
                }
                if (!frame.isActualVisible()) {
                    frame._notifyResizeOnVisible = true;
                    frame.onActualVisibleChange();
                }
                frame.fireEvent("onLoad", frame);
                if (frame.isSameDomain()) {
                    if (frame._replacedUrl && frame._replacedUrl != BLANK_PATH) {
                        frame._loaded = true;
                    }
                } else {
                    if (iframe.src && iframe.src != BLANK_PATH) {
                        frame._loaded = true;
                    }
                }
            });
            frame.doLoad();
        },
        replaceUrl: function(url) {
            var frame = this,
                doms = frame._doms,
                replacedUrl = $url(url || BLANK_PATH);
            delete frame._notifyResizeOnVisible;
            if (frame.isSameDomain()) {
                frame._replacedUrl = replacedUrl;
                if (frame.getIFrameWindow()) {
                    frame.getIFrameWindow().location.replace(replacedUrl);
                }
            } else {
                $fly(doms.iframe).prop("src", replacedUrl);
            }
        },
        doLoad: function() {
            var frame = this,
                doms = frame._doms;
            $fly(doms.loadingCover).css("display", "");
            this.replaceUrl(frame._path);
        },
        reloadIfNotLoaded: function() {
            var frame = this;
            if (!frame._loaded && frame._path) {
                frame.doLoad();
            }
        },
        cancelLoad: function() {
            this.replaceUrl(BLANK_PATH);
        },
        doOnResize: function() {
            if (dorado.Browser.isTouch) {
                $fly(this._doms.iframe).css({ width: this._dom.clientWidth, height: this._dom.clientHeight });
            }
        },
        reload: function() {
            var frame = this;
            frame.releaseCurrentPage();
            frame.replaceUrl(null);
            frame.replaceUrl(frame._path);
        },
        onActualVisibleChange: function() {
            function resizeSubView(subView) {
                subView._children.each(function(child) {
                    if (child.resetDimension && child._rendered && child._visible) {
                        child.resetDimension();
                    }
                });
            }
            $invokeSuper.call(this, arguments);
            var frame = this,
                actualVisible = frame.isActualVisible();
            if (frame._toReplaceUrl) {
                if (actualVisible) {
                    setTimeout(function() {
                        frame.replaceUrl(frame._toReplaceUrl);
                        frame._toReplaceUrl = null;
                    }, 10);
                    return;
                } else {
                    return;
                }
            }
            if (dorado.Browser.android) {
                return;
            }
            var iframeWindow = frame.getIFrameWindow();
            if (frame._ready && frame._loaded && frame.isSameDomain()) {
                if (iframeWindow && iframeWindow.$topView && iframeWindow.dorado && iframeWindow.dorado.widget) {
                    if (dorado.Browser.chrome || dorado.Browser.android) {
                        setTimeout(function() {
                            if (!iframeWindow.document || !iframeWindow.document.body) {
                                return;
                            }
                            iframeWindow.$topView.setActualVisible(actualVisible);
                            if (frame._notifyResizeOnVisible && actualVisible) {
                                resizeSubView(iframeWindow.$topView);
                            }
                        }, 50);
                    } else {
                        if (!iframeWindow.document || !iframeWindow.document.body) {
                            return;
                        }
                        iframeWindow.$topView.setActualVisible(actualVisible);
                        if (frame._notifyResizeOnVisible && actualVisible) {
                            resizeSubView(iframeWindow.$topView);
                        }
                    }
                }
            }
        },
        getIFrameWindow: function() {
            var frame = this,
                doms = frame._doms || {};
            if (doms.iframe) {
                return doms.iframe.contentWindow;
            }
            return null;
        }
    });
})();
dorado.widget.CardBook = $extend(dorado.widget.Control, {
    $className: "dorado.widget.CardBook",
    ATTRIBUTES: {
        className: { defaultValue: "d-cardbook" },
        currentControl: {
            skipRefresh: true,
            setter: function(control) {
                var cardbook = this,
                    controls = cardbook._controls;
                if (control != null) {
                    if (typeof control == "string" || typeof control == "number") {
                        control = controls.get(control);
                    }
                }
                if (cardbook._currentControl == control) {
                    return;
                }
                if (!cardbook._ready) {
                    cardbook._currentControl = control;
                    return;
                }
                cardbook.doSetCurrentControl(control);
            }
        },
        currentIndex: {
            skipRefresh: true,
            getter: function() {
                var cardbook = this,
                    controls = cardbook._controls;
                if (cardbook._currentControl) {
                    return controls.indexOf(cardbook._currentControl);
                }
                return -1;
            },
            setter: function(index) {
                var cardbook = this;
                cardbook.set("currentControl", cardbook._controls.get(index));
            }
        },
        controls: {
            writeOnce: true,
            innerComponent: "",
            setter: function(value) {
                if (value) {
                    var controls = this._controls;
                    if (value instanceof Array) {
                        for (var i = 0; i < value.length; i++) {
                            controls.insert(value[i]);
                            this.registerInnerControl(value[i]);
                        }
                    } else {
                        this.registerInnerControl(value);
                        controls.insert(value);
                    }
                }
            }
        }
    },
    EVENTS: { beforeCurrentChange: {}, onCurrentChange: {} },
    constructor: function() {
        this._controls = new dorado.util.KeyedArray(function(value) {
            return value._id;
        });
        $invokeSuper.call(this, arguments);
    },
    destroy: function() {
        var cardbook = this,
            controls = cardbook._controls;
        for (var i = controls.size - 1; i >= 0; i--) {
            controls.get(i).destroy();
        }
        cardbook._controls.clear();
        delete cardbook._currentControl;
        $invokeSuper.call(cardbook);
    },
    onReady: function() {
        var currentControl = this._currentControl;
        this._currentControl = null;
        $invokeSuper.call(this);
        if (!currentControl) {
            currentControl = this._controls.get(0);
        }
        if (currentControl) {
            this.set("currentControl", currentControl);
        }
    },
    doSetCurrentControl: function(control) {
        var cardbook = this,
            oldControl = cardbook._currentControl;
        var eventArg = { oldControl: oldControl, newControl: control };
        cardbook.fireEvent("beforeCurrentChange", this, eventArg);
        if (eventArg.processDefault === false) {
            return;
        }
        if (oldControl && !oldControl._destroyed) {
            if (oldControl instanceof dorado.widget.IFrame) {
                if (!oldControl._loaded) {
                    oldControl.cancelLoad();
                }
            }
            var oldDom = oldControl._dom;
            if (oldDom) {
                oldDom.style.display = "none";
            }
            oldControl.setActualVisible(false);
        }
        cardbook._currentControl = control;
        var dom = cardbook._dom;
        if (dom && control) {
            if (!control._rendered) {
                this._resetInnerControlDemension(control);
                var controlDom = control.getDom();
                if (controlDom) {
                    $fly(controlDom).addClass("d-rendering");
                }
                control.render(dom);
                if (controlDom) {
                    setTimeout(function() {
                        $fly(controlDom).removeClass("d-rendering");
                    }, 500);
                }
            } else {
                $fly(control._dom).css("display", "block");
                control.setActualVisible(true);
                this._resetInnerControlDemension(control);
                control.resetDimension();
                if (control instanceof dorado.widget.IFrame && !control._loaded) {
                    control.reloadIfNotLoaded();
                }
            }
        }
        cardbook.fireEvent("onCurrentChange", this, eventArg);
    },
    addControl: function(control, index, current) {
        if (!control) {
            throw new dorado.ResourceException("dorado.base.CardControlUndefined");
        }
        var card = this,
            controls = card._controls;
        card.registerInnerControl(control);
        controls.insert(control, index);
        if (current) {
            card.set("currentControl", control);
        }
        return control;
    },
    removeControl: function(control) {
        var card = this,
            controls = card._controls;
        control = card.getControl(control);
        if (control) {
            controls.remove(control);
            control.destroy && control.destroy();
            return control;
        }
        return null;
    },
    removeAllControls: function() {
        var card = this,
            controls = card._controls;
        for (var i = 0, j = controls.size; i < j; i++) {
            var item = controls.get(0);
            card.removeControl(item);
        }
    },
    replaceControl: function(oldControl, newControl) {
        if (!oldControl || !newControl) {
            return;
        }
        var result = this._controls.replace(oldControl, newControl);
        if (result == -1) {
            return;
        }
        if (this._rendered) {
            if (oldControl == this._currentControl) {
                this.set("currentControl", newControl);
            }
            if (oldControl._rendered) {
                oldControl.destroy();
            }
        }
    },
    getControl: function(id) {
        var card = this,
            controls = card._controls;
        if (controls) {
            if (typeof id == "number" || typeof id == "string") {
                return controls.get(id);
            } else {
                return id;
            }
        }
        return null;
    },
    getCurrentControlIndex: function() {
        var card = this,
            controls = card._controls,
            currentControl = card._currentControl;
        if (controls && currentControl) {
            return controls.indexOf(currentControl);
        }
        return -1;
    },
    _resetInnerControlDemension: function(control) {
        var dom = this.getDom(),
            width, height;
        if (this.getRealWidth()) {
            width = $fly(dom).innerWidth();
            if (width) {
                control.set("width", width, { tryNextOnError: true });
            }
        }
        if (this.getRealHeight()) {
            height = $fly(dom).innerHeight();
            if (height) {
                control.set("height", height, { tryNextOnError: true });
            }
        }
        control.refresh();
    },
    refreshDom: function(dom) {
        $invokeSuper.call(this, arguments);
        var card = this,
            currentControl = card["_currentControl"];
        if (currentControl) {
            this._resetInnerControlDemension(currentControl);
            if (!currentControl._rendered) {
                currentControl.render(dom);
            } else {
                $fly(currentControl._dom).css("display", "block");
                currentControl.setActualVisible(true);
            }
        }
    },
    getFocusableSubControls: function() {
        return [this._currentControl];
    }
});
dorado.widget.ProgressBar = $extend(dorado.widget.Control, {
    $className: "dorado.widget.ProgressBar",
    selectable: false,
    ATTRIBUTES: { className: { defaultValue: "d-progress-bar" }, height: { independent: true }, minValue: { defaultValue: 0 }, maxValue: { defaultValue: 100 }, showText: { defaultValue: true }, value: {}, textPattern: { defaultValue: "{percent}%" } },
    createDom: function() {
        var bar = this,
            doms = {},
            dom = $DomUtils.xCreate({ tagName: "div", className: bar._className, content: [{ tagName: "span", className: "msg", contextKey: "msg" }, { tagName: "span", className: "bar", contextKey: "bar", content: { tagName: "span", className: "bar-msg", contextKey: "barMsg" } }] }, null, doms);
        bar._doms = doms;
        return dom;
    },
    refreshDom: function(dom) {
        $invokeSuper.call(this, arguments);
        var bar = this,
            min = bar._minValue,
            max = bar._maxValue,
            value = bar._value || 0,
            doms = bar._doms,
            percent = value / (max - min),
            showText = bar._showText,
            pattern = bar._textPattern || "";
        if (percent == 0) {
            $fly(dom).addClass("d-rendering");
        }
        if (percent >= 0 && percent <= 1) {
            $fly(doms.bar).css("width", percent * 100 + "%");
        }
        var $msg = $fly([doms.msg, doms.barMsg]).css("width", dom.offsetWidth);
        if (showText) {
            $msg.text(pattern.replace("{percent}", parseInt(percent * 100, 10)));
        } else {
            $msg.empty();
        }
        if (percent == 0) {
            $fly(dom).removeClass("d-rendering");
        }
    }
});
(function() {
    var ANCHOR_OFFSET_ADJ_HORIZENTAL = 5,
        ANCHOR_OFFSET_ADJ_VERTICAL = 5;
    var icons = { WARNING: "warning-icon", ERROR: "error-icon", INFO: "info-icon", QUESTION: "question-icon" };
    dorado.widget.Tip = $extend([dorado.widget.Control, dorado.widget.FloatControl], {
        $className: "dorado.widget.Tip",
        ATTRIBUTES: { className: { defaultValue: "d-tip" }, height: { independent: true }, visible: { defaultValue: false }, shadowMode: { defaultValue: "none", skipRefresh: true }, animateType: { defaultValue: dorado.Browser.msie ? "none" : "fade", skipRefresh: true }, focusAfterShow: { defaultValue: false }, caption: {}, text: {}, content: {}, icon: {}, iconClass: {}, closeable: {}, arrowDirection: {}, arrowAlign: { defaultValue: "center" }, arrowOffset: {}, showDuration: {} },
        createDom: function() {
            var tip = this,
                dom, doms = {};
            dom = $DomUtils.xCreate({ tagName: "div", content: { tagName: "div", className: "tip-cm", contextKey: "tipCenter", content: { tagName: "div", contextKey: "tipContent", className: "tip-content", content: [{ tagName: "span", className: "tip-icon", contextKey: "tipIcon" }, { tagName: "span", className: "tip-text", contextKey: "tipText" }] } } }, null, doms);
            tip._doms = doms;
            $fly(dom).hover(function() {
                if (tip._showDurationTimer) {
                    clearTimeout(tip._showDurationTimer);
                    tip._showDurationTimer = null;
                }
            }, function() {
                if (tip._showDuration) {
                    tip._showDurationTimer = setTimeout(function() {
                        tip.hide();
                        tip._showDurationTimer = null;
                    }, tip._showDuration * 1000);
                }
            });
            return dom;
        },
        doAfterShow: function() {
            var tip = this;
            $invokeSuper.call(tip, arguments);
            if (tip._showDuration) {
                tip._showDurationTimer = setTimeout(function() {
                    tip.hide();
                    tip._showDurationTimer = null;
                }, tip._showDuration * 1000);
            }
        },
        doClose: function() {
            this.hide();
        },
        getShowPosition: function(options) {
            var tip = this,
                arrowDirection = tip._arrowDirection,
                doms = tip._doms;
            if (arrowDirection && (options.offsetLeft == null && options.offsetTop == null)) {
                var arrowAlign = tip._arrowAlign;
                if (arrowAlign) {
                    if (arrowDirection == "left") {
                        options.offsetLeft = doms.arrow.offsetWidth;
                    } else {
                        if (arrowDirection == "right") {
                            options.offsetLeft = -1 * doms.arrow.offsetWidth;
                        } else {
                            if (arrowDirection == "top") {
                                options.offsetTop = doms.arrow.offsetHeight;
                            } else {
                                options.offsetHeight = -1 * doms.arrow.offsetHeight;
                            }
                        }
                    }
                }
            }
            return $invokeSuper.call(this, arguments);
        },
        refreshDom: function(dom) {
            $invokeSuper.call(this, arguments);
            var tip = this,
                text = (tip._text == undefined) ? "" : tip._text,
                doms = tip._doms,
                arrowDirection = tip._arrowDirection,
                cls = tip._className,
                content = this._content;
            var $tipText = $fly(doms.tipText);
            if (content) {
                if (typeof content == "string") {
                    $tipText.html(content);
                } else {
                    if (content instanceof dorado.widget.Control) {
                        if (!content._rendered) {
                            $tipText.empty();
                            content.render(doms.tipText);
                        }
                    } else {
                        if (content.nodeType && content.nodeName) {
                            $tipText.empty().append(content);
                        } else {
                            $tipText.empty().xCreate(content);
                        }
                    }
                }
            } else {
                if (/<[^<]+?>/g.test(text)) {
                    $tipText.html(text);
                } else {
                    $tipText.text(text);
                }
            }
            $fly(dom).shadow({ mode: tip._shadowMode });
            if (arrowDirection && arrowDirection != "none") {
                if (doms.arrow == null) {
                    var arrowEl = document.createElement("div");
                    arrowEl.className = "arrow";
                    $fly(dom).append(arrowEl);
                    doms.arrow = arrowEl;
                }
                $fly(dom).addClass("d-tip-arrow-" + arrowDirection);
            } else {
                $fly(dom).removeClass("d-tip-arrow-top").removeClass("d-tip-arrow-bottom").removeClass("d-tip-arrow-left").removeClass("d-tip-arrow-right");
            }
            var captionDom = doms.caption;
            if (tip._caption || tip._closeable) {
                var caption = tip._caption || $resource("dorado.baseWidget.DefaultTipCaption");
                if (captionDom == null) {
                    doms.caption = captionDom = document.createElement("div");
                    captionDom.className = "caption";
                    $fly(doms.tipCenter).prepend(captionDom);
                    $fly(captionDom).html(caption);
                } else {
                    $fly(captionDom).css("display", "").html(caption);
                }
            } else {
                if (captionDom != null) {
                    $fly(captionDom).css("display", "none");
                }
            }
            if (tip._closeable) {
                if (doms.close == null) {
                    var closeEl = document.createElement("div");
                    closeEl.className = "close";
                    $fly(dom).append(closeEl);
                    doms.close = closeEl;
                    jQuery(closeEl).click(function() {
                        tip.doClose(this);
                    }).addClassOnHover("close-hover").addClassOnClick("close-click");
                } else {
                    $fly(doms.close).css("display", "");
                }
            } else {
                if (doms.close) {
                    $fly(doms.close).css("display", "none");
                }
            }
            var icon = tip._icon,
                iconClass = tip._iconClass || "",
                exClassName;
            if (icon in icons) {
                exClassName = icons[icon];
                icon = null;
            }
            $fly(doms.tipIcon).prop("className", "tip-icon");
            if (icon || iconClass || exClassName) {
                if (exClassName) {
                    $fly(doms.tipIcon).addClass(exClassName);
                }
                if (iconClass) {
                    $fly(doms.tipIcon).addClass(iconClass);
                }
                if (icon) {
                    $DomUtils.setBackgroundImage(doms.tipIcon, icon);
                } else {
                    $fly(doms.tipIcon).css("background-image", "");
                }
                $fly(doms.tipContent).addClass("tip-content-hasicon");
            } else {
                $fly(doms.tipContent).removeClass("tip-content-hasicon");
            }
            $fly(doms.arrow).css({ left: "", top: "" });
            if (arrowDirection && !tip._trackMouse) {
                var arrowAlign = tip._arrowAlign,
                    arrowOffset = tip._arrowOffset || 0;
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
    });
    dorado.widget.NotifyTip = $extend(dorado.widget.Tip, {
        $className: "dorado.widget.NotifyTip",
        ATTRIBUTES: { width: { defaultValue: (dorado.Browser.isTouch ? 200 : 300) }, closeable: { defaultValue: true }, icon: {}, iconClass: {}, showDuration: { defaultValue: 3 } },
        getShowPosition: function() {
            return dorado.widget.NotifyTipManager.getAvialablePosition(this);
        },
        doAfterHide: function() {
            $invokeSuper.call(this, arguments);
            dorado.NotifyTipPool.returnObject(this);
        }
    });
    dorado.NotifyTipPool = new dorado.util.ObjectPool({
        makeObject: function() {
            return new dorado.widget.NotifyTip();
        },
        passivateObject: function(object) {
            var attrs = ["caption", "text", "content", "icon", "iconClass", "arrowDirection", "arrowAlign", "arrowOffset"];
            for (var i = 0, j = attrs.length; i < j; i++) {
                var attr = attrs[i];
                delete object["_" + attr];
            }
            object._showDuration = 3;
            object._closeable = true;
        }
    });
    var getRegionOffsets = function(region1, region2) {
        return { top: Math.max(region1["top"], region2["top"]), right: Math.min(region1["right"], region2["right"]), bottom: Math.min(region1["bottom"], region2["bottom"]), left: Math.max(region1["left"], region2["left"]) };
    };
    var intersect = function(element1, element2) {
        var region1 = $fly(element1).region(),
            region2;
        if (element2.nodeType) {
            region2 = $fly(element2).region();
        } else {
            region2 = element2;
        }
        var offset = getRegionOffsets(region1, region2);
        return offset["bottom"] >= offset["top"] && offset["right"] >= offset["left"];
    };
    dorado.widget.NotifyTipManager = {
        offsetLeft: -10,
        offsetTop: 10,
        padding: 10,
        notifyWidth: dorado.Browser.isTouch ? 200 : 300,
        position: "br",
        alignPriority: "vertical",
        notify: function(msg, options) {
            if (typeof msg == "string") {
                options = dorado.Object.apply({}, options);
                options.text = msg;
            } else {
                if (typeof msg == "object") {
                    options = dorado.Object.apply({}, msg);
                }
            }
            options.caption = options.caption || $resource("dorado.baseWidget.NotifyTipDefaultCaption") || "Dorado7";
            if (options.autoHide === false) {
                options.showDuration = 0;
            }
            delete options.autoHide;
            var tip = dorado.NotifyTipPool.borrowObject();
            tip.set(options);
            tip.show();
            return tip;
        },
        nextRegion: function(refTip, tip) {
            var left, top, dom = tip._dom,
                width = dom.offsetWidth,
                height = dom.offsetHeight,
                position = this.position;
            var docWidth = $fly(window).width(),
                docHeight = $fly(window).height();
            if (this.alignPriority == "vertical") {
                if (position == "tr") {
                    left = parseInt($fly(refTip._dom).css("left"), 10);
                    top = $fly(refTip._dom).outerHeight() + parseInt($fly(refTip._dom).css("top"), 10) + this.padding;
                    if (top + height > docHeight) {
                        left = left - this.notifyWidth - this.padding;
                        top = this.padding;
                    }
                } else {
                    if (position == "br") {
                        left = parseInt($fly(refTip._dom).css("left"), 10);
                        top = parseInt($fly(refTip._dom).css("top"), 10) - $fly(refTip._dom).outerHeight() - this.padding;
                        if (top < 0) {
                            left = left - this.notifyWidth - this.padding;
                            top = docHeight - height - this.padding;
                        }
                    } else {
                        if (position == "tl") {
                            left = parseInt($fly(refTip._dom).css("left"), 10);
                            top = parseInt($fly(refTip._dom).css("top"), 10) + $fly(refTip._dom).outerHeight() + this.padding;
                            if (top + height > docHeight) {
                                left = left + this.notifyWidth + this.padding;
                                top = this.padding;
                            }
                        } else {
                            if (position == "bl") {
                                left = parseInt($fly(refTip._dom).css("left"), 10);
                                top = parseInt($fly(refTip._dom).css("top"), 10) - $fly(refTip._dom).outerHeight() - this.padding;
                                if (top < 0) {
                                    left = left + this.notifyWidth + this.padding;
                                    top = docHeight - height - this.padding;
                                }
                            }
                        }
                    }
                }
            } else {
                if (position == "tr") {
                    left = parseInt($fly(refTip._dom).css("left"), 10) - this.notifyWidth - this.padding;
                    top = parseInt($fly(refTip._dom).css("top"), 10);
                    if (left < 0) {
                        left = docWidth - this.padding - this.notifyWidth;
                        top = top + $fly(refTip._dom).outerHeight() + this.padding;
                    }
                } else {
                    if (position == "br") {
                        left = parseInt($fly(refTip._dom).css("left"), 10) - this.notifyWidth - this.padding;
                        top = parseInt($fly(refTip._dom).css("top"), 10);
                        if (left < 0) {
                            left = docWidth - this.padding - this.notifyWidth;
                            top = top - $fly(refTip._dom).outerHeight() - this.padding;
                        }
                    } else {
                        if (position == "tl") {
                            left = parseInt($fly(refTip._dom).css("left"), 10) + $fly(refTip._dom).outerWidth() + this.padding;
                            top = parseInt($fly(refTip._dom).css("top"), 10);
                            if (left + width > docWidth) {
                                left = this.padding;
                                top = top + $fly(refTip._dom).outerHeight() + this.padding;
                            }
                        } else {
                            if (position == "bl") {
                                left = parseInt($fly(refTip._dom).css("left"), 10) + $fly(refTip._dom).outerWidth() + this.padding;
                                top = parseInt($fly(refTip._dom).css("top"), 10);
                                if (left + width > docWidth) {
                                    left = this.padding;
                                    top = top - $fly(refTip._dom).outerHeight() - this.padding;
                                }
                            }
                        }
                    }
                }
            }
            return { left: left, top: top, bottom: top + height, right: left + width };
        },
        avialable: function(tip, region) {
            var passed = true,
                activePool = dorado.NotifyTipPool._activePool;
            for (var k = 0, l = activePool.length; k < l; k++) {
                if (activePool[k] != tip) {
                    var intersected = intersect(activePool[k]._dom, region);
                    if (intersected) {
                        passed = false;
                    }
                }
            }
            return passed;
        },
        getAvialablePosition: function(tip) {
            var docWidth = $fly(window).width(),
                dom = tip._dom,
                width = dom.offsetWidth,
                height = dom.offsetHeight,
                left, top, region, position = this.position;
            if (position == "tr") {
                left = docWidth - this.padding - width;
                top = this.padding;
            } else {
                if (position == "br") {
                    left = docWidth - this.padding - width;
                    top = $fly(window).height() - height - this.padding;
                } else {
                    if (position == "tl") {
                        left = this.padding;
                        top = this.padding;
                    } else {
                        if (position == "bl") {
                            left = this.padding;
                            top = $fly(window).height() - height - this.padding;
                        }
                    }
                }
            }
            region = { left: left, top: top, bottom: top + height, right: left + width };
            if (this.avialable(tip, region)) {
                dorado.NotifyTipPool._activePool.remove(tip);
                dorado.NotifyTipPool._activePool.unshift(tip);
                $fly(dom).css({ left: left, top: top });
                return { left: left, top: top };
            }
            if (dorado.NotifyTipPool.getNumActive() > 1) {
                var activePool = dorado.NotifyTipPool._activePool;
                for (var i = 0, j = activePool.length; i < j; i++) {
                    var curTip = activePool[i];
                    if (curTip != tip) {
                        region = this.nextRegion(curTip, tip);
                        if (this.avialable(tip, region)) {
                            dorado.NotifyTipPool._activePool.remove(tip);
                            dorado.NotifyTipPool._activePool.insert(tip, dorado.NotifyTipPool._activePool.indexOf(curTip) + 1);
                            $fly(tip._dom).css({ left: region.left, top: region.top });
                            return { left: region.left, top: region.top };
                        }
                    }
                }
            }
        }
    };
})();
dorado.widget.FloatContainer = $extend([dorado.widget.Container, dorado.widget.FloatControl], { $className: "dorado.widget.FloatContainer", focusable: true, ATTRIBUTES: { visible: { defaultValue: false } } });


(function() {
    dorado.widget.list = {};
    dorado.widget.AbstractList = $extend(dorado.widget.Control, {
        $className: "dorado.widget.AbstractList",
        focusable: true,
        ATTRIBUTES: {
            itemModel: {},
            allowNoCurrent: { skipRefresh: true },
            selectionMode: {
                defaultValue: "none",
                skipRefresh: true,
                setter: function(v) {
                    this.replaceSelection(this.get("selection"), null);
                    this._selectionMode = v;
                }
            },
            selection: {
                skipRefresh: true,
                getter: function() {
                    var selection = this._selection;
                    if (selection instanceof dorado.Entity) {
                        if (selection.state == dorado.Entity.STATE_DELETED) {
                            this._selection = selection = null;
                        }
                    } else {
                        if (selection instanceof Array) {
                            for (var i = selection.length; i >= 0; i--) {
                                var s = selection[i];
                                if (s instanceof dorado.Entity && s.state == dorado.Entity.STATE_DELETED) {
                                    selection.removeAt(i);
                                }
                            }
                        }
                    }
                    if (this._selectionMode == "multiRows") {
                        if (!selection) {
                            selection = [];
                        } else {
                            selection = selection.slice(0);
                        }
                    }
                    return selection;
                },
                setter: function(v) {
                    if (v == null && "multiRows" == this._selectionMode) {
                        v = [];
                    }
                    this.replaceSelection(this.get("selection"), v);
                }
            },
            dragMode: { writeBeforeReady: true, defaultValue: "item" },
            dropMode: { writeBeforeReady: true, defaultValue: "insertItems" }
        },
        EVENTS: { onCurrentChange: {}, beforeSelectionChange: {}, onSelectionChange: {}, onCompareItems: {}, onFilterItem: {} },
        constructor: function() {
            this._itemModel = this.createItemModel();
            $invokeSuper.call(this, arguments);
        },
        hasRealWidth: function() {
            var width = this.getRealWidth();
            return width != null && width != "none" && width != "auto";
        },
        hasRealHeight: function() {
            var height = this.getRealHeight();
            return height != null && height != "none" && height != "auto";
        },
        createItemModel: function() {
            return new dorado.widget.list.ItemModel();
        },
        applyDraggable: function(dom, options) {
            if (this._droppable && dom == this._dom && this._dragMode == "item") {
                return;
            }
            $invokeSuper.call(this, arguments);
        },
        initDraggingInfo: function(draggingInfo, evt) {
            $invokeSuper.call(this, arguments);
            if (this._dragMode != "control") {
                var itemDom = this.findItemDomByEvent(evt);
                draggingInfo.set({ object: itemDom ? $fly(itemDom).data("item") : null, insertMode: null, refObject: null });
            }
        },
        initDraggingIndicator: function(indicator, draggingInfo, evt) {
            if (this._dragMode != "control") {
                var itemDom = draggingInfo.get("element");
                if (itemDom) {
                    var contentDom = $DomUtils.xCreate({ tagName: "div", className: "d-list-dragging-item" });
                    $fly(itemDom).find(">*").clone().appendTo(contentDom);
                    indicator.set("content", contentDom);
                }
            }
        },
        sort: function(sortParams) {
            var customComparator, list = this;
            if (list.getListenerCount("onCompareItems") > 0) {
                customComparator = function(item1, item2, sortParams) {
                    var arg = { item1: item1, item2: item2, sortParams: sortParams, result: 0 };
                    list.fireEvent("onCompareItems", list, arg);
                    return arg.result;
                };
            }
            this._itemModel.sort(sortParams, customComparator);
            this.refresh(true);
        },
        filter: function(criterions) {
            var customFilter, list = this;
            if (list.getListenerCount("onFilterItem") > 0) {
                customFilter = function(value, criterions) {
                    var arg = { value: value, criterions: criterions };
                    list.fireEvent("onFilterItem", list, arg);
                    return arg.accept;
                };
            }
            this._itemModel.filter(criterions, customFilter);
            this.refresh(true);
        },
        showLoadingTip: function() {
            function getLoadingTipDom() {
                var tipDom = this._loadingTipDom;
                if (!tipDom) {
                    this._loadingTipDom = tipDom = $DomUtils.xCreate({ tagName: "TABLE", className: "d-list-loading", cellPadding: 0, cellSpacing: 0, style: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", zIndex: 9999 }, content: { tagName: "TR", content: { tagName: "TD", align: "center", content: [{ tagName: "DIV", className: "mask", style: { zIndex: 1, position: "absolute", left: 0, top: 0, width: "100%", height: "100%" } }, { tagName: "DIV", className: "tip", content: [{ tagName: "DIV", className: "icon", content: { tagName: "div", className: "spinner" } }, { tagName: "DIV", className: "label", content: $resource("dorado.list.LoadingData") }], style: { zIndex: 2, position: "relative" } }] } } });
                    this._dom.appendChild(tipDom);
                }
                return tipDom;
            }
            dorado.Toolkits.cancelDelayedAction(this, "$hideLoadingTip");
            dorado.Toolkits.setDelayedAction(this, "$showLoadingTip", function() {
                var tipDom = getLoadingTipDom.call(this);
                $fly(tipDom).show();
            }, 100);
        },
        hideLoadingTip: function() {
            dorado.Toolkits.cancelDelayedAction(this, "$showLoadingTip");
            if (this._loadingTipDom) {
                dorado.Toolkits.setDelayedAction(this, "$hideLoadingTip", function() {
                    $fly(this._loadingTipDom).hide();
                }, 200);
            }
        },
        setDraggingOverItemDom: function(itemDom) {
            if (this._draggingOverItemDom == itemDom) {
                return;
            }
            if (this._draggingOverItemDom) {
                $fly(this._draggingOverItemDom).removeClass("drag-over-row");
            }
            this._draggingOverItemDom = itemDom;
            if (itemDom) {
                $fly(itemDom).addClass("drag-over-row");
            }
        },
        showDraggingInsertIndicator: function(draggingInfo, insertMode, itemDom) {
            var insertIndicator = dorado.widget.AbstractList.getDraggingInsertIndicator();
            var $insertIndicator = $fly(insertIndicator);
            if (insertMode) {
                var dom = this._dom;
                var width = dom.offsetWidth;
                var top = (insertMode == "before") ? itemDom.offsetTop : (itemDom.offsetTop + itemDom.offsetHeight);
                if (dom.clientWidth < width) {
                    width = dom.clientWidth;
                }
                $insertIndicator.width(width).height(2).left(0).top(top - 1).show().appendTo(dom);
            } else {
                $insertIndicator.hide();
            }
        },
        doOnDraggingSourceMove: function(draggingInfo, evt, targetObject, insertMode, refObject, itemDom) {
            var accept = (draggingInfo.isDropAcceptable(this._droppableTags) && !(this._dropMode == "onItem" && targetObject == null));
            draggingInfo.set({ targetObject: targetObject, insertMode: insertMode, refObject: refObject, accept: accept });
            var eventArg = { draggingInfo: draggingInfo, event: evt, processDefault: true };
            this.fireEvent("onDraggingSourceMove", this, eventArg);
            if (accept && eventArg.processDefault) {
                this.showDraggingInsertIndicator(draggingInfo, insertMode, itemDom);
                this.setDraggingOverItemDom((accept && !insertMode) ? itemDom : null);
            }
            return eventArg.processDefault;
        },
        onDraggingSourceMove: function(draggingInfo, evt) {
            var dropMode = this._dropMode;
            var targetObject = draggingInfo.get("targetObject");
            var insertMode, refObject, itemDom;
            if (dropMode != "onControl") {
                var pos = this.getMousePosition(evt);
                itemDom = this.findItemDomByPosition(pos);
                if (itemDom && $fly(itemDom).data("item") == draggingInfo.get("object")) {
                    itemDom = null;
                }
                if (itemDom) {
                    if (dropMode == "insertItems") {
                        var dropY = itemDom._dropY;
                        var halfHeight = itemDom.offsetHeight / 2;
                        insertMode = (dropY < halfHeight) ? "before" : "after";
                    } else {
                        if (dropMode == "onOrInsertItems") {
                            var dropY = itemDom._dropY;
                            if (dropY <= 4) {
                                insertMode = "before";
                            } else {
                                if ((itemDom.offsetHeight - dropY) <= 4) {
                                    insertMode = "after";
                                }
                            }
                        }
                    }
                }
                refObject = itemDom ? $fly(itemDom).data("item") : null;
                if (!refObject) {
                    targetObject = (dropMode == "onAnyWhere") ? this : null;
                } else {
                    targetObject = refObject;
                }
            }
            if (itemDom) {
                return this.doOnDraggingSourceMove(draggingInfo, evt, targetObject, insertMode, refObject, itemDom);
            } else {
                return false;
            }
        },
        onDraggingSourceOut: function(draggingInfo, evt) {
            $invokeSuper.call(this, arguments);
            this.setDraggingOverItemDom();
            this.showDraggingInsertIndicator();
        },
        processItemDrop: function(draggingInfo, evt) {
            function getItemList(control, entity) {
                var list;
                if (entity instanceof dorado.Entity) {
                    list = entity.parent;
                } else {
                    if (control.ATTRIBUTES.itemModel) {
                        var itemModel = control.get("itemModel");
                        if (itemModel) {
                            list = itemModel.getItems();
                        }
                    }
                }
                return list;
            }
            var object = draggingInfo.get("object");
            var insertMode = draggingInfo.get("insertMode");
            var refObject = draggingInfo.get("refObject");
            var sourceControl = draggingInfo.get("sourceControl");
            if (insertMode && refObject || this._dropMode == "insertItems" || this._dropMode == "onOrInsertItems" || this._dropMode == "onAnyWhere") {
                var sourceList = getItemList(sourceControl, object),
                    oldState = object.state;
                if (sourceList) {
                    sourceList.remove(object, true);
                    if (!dorado.Object.isInstanceOf(sourceControl, dorado.widget.DataControl)) {
                        sourceControl.refresh();
                    }
                }
                if (object instanceof dorado.Entity) {
                    object.setState((oldState == dorado.Entity.STATE_NEW) ? dorado.Entity.STATE_NEW : dorado.Entity.STATE_MOVED);
                }
                var targetList = this.get("itemModel").getItems(),
                    highlight;
                if (!targetList) {
                    if (!dorado.Object.isInstanceOf(this, dorado.widget.DataControl)) {
                        if (this.ATTRIBUTES.items) {
                            targetList = [];
                            this.set("items", targetList);
                        }
                    } else {
                        targetList = this.getBindingData();
                    }
                }
                if (targetList) {
                    if (targetList instanceof dorado.EntityList) {
                        targetList.insert(object, insertMode, refObject);
                        highlight = object;
                    } else {
                        var i = refObject ? targetList.indexOf(refObject) : -1;
                        if (i < 0) {
                            targetList.push(object);
                            highlight = targetList.length - 1;
                        } else {
                            if (insertMode == "after") {
                                i++;
                            }
                            targetList.insert(object, i);
                            highlight = i;
                        }
                    }
                    if (!dorado.Object.isInstanceOf(this, dorado.widget.DataControl)) {
                        this.refresh();
                    }
                    if (highlight != null) {
                        this.highlightItem(highlight);
                    }
                }
            }
            return true;
        },
        onDraggingSourceDrop: function(draggingInfo, evt) {
            if (this.processItemDrop(draggingInfo, evt)) {
                $invokeSuper.call(this, arguments);
            }
        }
    });
    dorado.widget.AbstractList.getDraggingInsertIndicator = function() {
        var indicator = this._draggingInsertIndicator;
        if (indicator == null) {
            indicator = $DomUtils.xCreate({ tagName: "div", className: "d-list-dragging-insert-indicator" });
            this._draggingInsertIndicator = indicator;
        }
        return indicator;
    };
    dorado.widget.ViewPortList = $extend(dorado.widget.AbstractList, {
        $className: "dorado.widget.ViewPortList",
        ATTRIBUTES: { scrollMode: { defaultValue: "lazyRender" } },
        createDom: function() {
            var dom = $DomUtils.xCreate({ tagName: "DIV", content: { tagName: "DIV", style: { width: "100%", height: "100%" } } });
            var container = this._container = dom.firstChild;
            this._modernScroller = $DomUtils.modernScroll(container);
            return dom;
        },
        refreshItemDoms: function(itemDomContainer, reverse, fn, keepItemsOutOfViewPort) {
            $fly(itemDomContainer).addClass("d-rendering");
            if (!this._itemDomMap) {
                this._itemDomMap = {};
            }
            var startIndex = this._itemModel.getStartIndex();
            if (!keepItemsOutOfViewPort && this._scrollMode == "viewport" && this.startIndex >= 0) {
                var _startIndex = reverse ? this.startIndex + this.itemDomCount : this.startIndex;
                if (Math.abs(startIndex - _startIndex) < (this.itemDomCount) / 2) {
                    for (var i = Math.abs(startIndex - _startIndex); i > 0; i--) {
                        if (startIndex > _startIndex) {
                            itemDomContainer.appendChild(itemDomContainer.firstChild);
                        } else {
                            itemDomContainer.insertBefore(itemDomContainer.lastChild, itemDomContainer.firstChild);
                        }
                    }
                }
            }
            var itemDomCount = 0;
            var it = this._itemModel.iterator();
            var bookmark = it.createBookmark(),
                viewPortFilled = false,
                reverseFlag = true;
            if (reverse) {
                it.next();
                reverseFlag = it.hasNext();
                reverseFlag ? it.next() : it.last();
            }
            this._shouldSkipRender = false;
            while (reverse ? it.hasPrevious() : it.hasNext()) {
                var item = reverse ? it.previous() : it.next();
                var dom = this.refreshItemDom(itemDomContainer, item, itemDomCount, reverse);
                itemDomCount++;
                if (fn && !fn(dom)) {
                    if (this._scrollMode == "viewport") {
                        viewPortFilled = true;
                        break;
                    } else {
                        this._shouldSkipRender = true;
                        fn = null;
                    }
                }
            }
            this._shouldSkipRender = false;
            var fillCount = 0;
            if (!viewPortFilled && reverseFlag && this._scrollMode == "viewport") {
                it.restoreBookmark(bookmark);
                reverse ? it.next() : it.previous();
                while (reverse ? it.hasNext() : it.hasPrevious()) {
                    var item = reverse ? it.next() : it.previous();
                    var dom = this.refreshItemDom(itemDomContainer, item, --fillCount, !reverse);
                    itemDomCount++;
                    if (fn && !fn(dom)) {
                        break;
                    }
                }
            }
            if (!keepItemsOutOfViewPort) {
                for (var i = itemDomContainer.childNodes.length - 1; i >= itemDomCount; i--) {
                    this.removeItemDom(reverse ? itemDomContainer.firstChild : itemDomContainer.lastChild);
                }
            }
            this.startIndex = reverse ? startIndex - fillCount - itemDomCount + 1 : startIndex + fillCount;
            $fly(itemDomContainer).removeClass("d-rendering");
            this.itemCount = this._itemModel.getItemCount();
            this.itemDomCount = itemDomCount;
            return itemDomCount;
        },
        removeItemDom: function(dom) {
            if (this._itemDomMap[dom._itemId] == dom) {
                delete this._itemDomMap[dom._itemId];
            }
            $fly(dom).remove();
        },
        getScrollingIndicator: function() {
            var indicator = dorado.widget.ViewPortList._indicator;
            if (!indicator) {
                indicator = $DomUtils.xCreate({ tagName: "DIV", style: "position:absolute" });
                dorado.widget.ViewPortList._indicator = indicator;
                $fly(indicator).addClass("d-list-scrolling-indicator").hide();
                document.body.appendChild(indicator);
            }
            $fly(indicator).bringToFront();
            return indicator;
        },
        setScrollingIndicator: function(text) {
            var indicator = this.getScrollingIndicator();
            $fly(indicator).text(text).show();
            $DomUtils.placeCenterElement(indicator, this.getDom());
        },
        hideScrollingIndicator: function() {
            $fly(this.getScrollingIndicator()).hide();
        },
        doOnResize: function() {
            if (!this._ready) {
                return;
            }
            this.refresh(true);
        }
    });
})();
(function() {
    valueComparators = {};
    dorado.widget.list.ItemModel = $class({
        $className: "dorado.widget.list.ItemModel",
        EMPTY_ITERATOR: new dorado.util.ArrayIterator([]),
        _itemDomSize: 0,
        _viewPortSize: 0,
        _scrollSize: 0,
        _scrollPos: 0,
        _startIndex: 0,
        _reverse: false,
        setItemDomSize: function(itemDomSize) {
            this._itemDomSize = itemDomSize;
        },
        getStartIndex: function() {
            return (this._startIndex > this.getItemCount()) ? 0 : this._startIndex;
        },
        setStartIndex: function(startIndex) {
            this._startIndex = startIndex;
        },
        isReverse: function() {
            return this._reverse;
        },
        setReverse: function(reverse) {
            this._reverse = reverse;
        },
        setScrollSize: function(viewPortSize, scrollSize) {
            this._viewPortSize = viewPortSize;
            this._scrollSize = scrollSize;
        },
        setScrollPos: function(scrollPos) {
            var itemCount = this.getItemCount();
            if (itemCount > 0) {
                var itemDomSize = this._scrollSize / itemCount;
                if (scrollPos / (this._scrollSize - this._viewPortSize) > 0.5) {
                    this._startIndex = itemCount - 1 - (Math.round((this._scrollSize - this._viewPortSize - scrollPos) / itemDomSize) || 0);
                    if (this._startIndex > itemCount - 1) {
                        this._startIndex = itemCount - 1;
                    }
                    this._reverse = true;
                } else {
                    this._startIndex = Math.round(scrollPos / itemDomSize) || 0;
                    this._reverse = false;
                }
            } else {
                this._startIndex = 0;
                this._reverse = false;
            }
        },
        getItems: function() {
            return this._originItems || this._items;
        },
        setItems: function(items) {
            if (this._filterParams) {
                this.filter();
            }
            this._items = items;
        },
        iterator: function(startIndex) {
            var items = this._items;
            if (!items) {
                return this.EMPTY_ITERATOR;
            }
            var index = startIndex || this._startIndex || 0;
            if (items instanceof Array) {
                return new dorado.util.ArrayIterator(this._items, index);
            } else {
                return items.iterator({ currentPage: true, nextIndex: index });
            }
        },
        getItemCount: function() {
            var items = this._items;
            if (!items) {
                return 0;
            }
            return (items instanceof Array) ? items.length : ((items.pageSize > 0) ? items.getPageEntityCount() : items.entityCount);
        },
        getItemAt: function(index) {
            if (!this._items || !(index >= 0)) {
                return null;
            }
            if (this._items instanceof Array) {
                return this._items[index];
            } else {
                var entityList = this._items;
                return entityList.iterator({ nextIndex: index }).next();
            }
        },
        getItemById: function(itemId) {
            var items = this._items;
            if (items instanceof Array) {
                return items[itemId];
            } else {
                return items.getById(itemId);
            }
        },
        getItemIndex: function(item) {
            if (!this._items || !item) {
                return -1;
            }
            if (this._items instanceof Array) {
                return this._items.indexOf(item);
            } else {
                var entityList = this._items,
                    itemId = item.entityId,
                    page = item.page;
                if (page.entityList != entityList) {
                    return -1;
                }
                var index = 0,
                    entry = page.first;
                while (entry != null) {
                    if (entry.data.entityId == itemId) {
                        return index;
                    }
                    if (entry.data.state != dorado.Entity.STATE_DELETED) {
                        index++;
                    }
                    entry = entry.next;
                }
                return -1;
            }
        },
        getItemId: function(item, index) {
            if (this._items instanceof Array || !(item instanceof dorado.Entity)) {
                return (index >= 0) ? index : this.getItemIndex(item);
            } else {
                return item.entityId;
            }
        },
        sort: function(sortParams, comparator) {
            if (!this.getItemCount()) {
                return;
            }
            var items = this.toArray();
            dorado.DataUtil.sort(items, sortParams, comparator);
            if (!(this._items instanceof Array)) {
                this._items = items;
            }
        },
        filter: function(filterParams, customFilter) {
            function getValueComparator(op) {
                var comparator = valueComparators[escape(op)];
                if (!comparator) {
                    if (!op || op == "=") {
                        op = "==";
                    } else {
                        if (op == "<>") {
                            op = "!=";
                        }
                    }
                    valueComparators[escape(op)] = comparator = new Function("v1,v2", "return v1" + op + "v2");
                }
                return comparator;
            }

            function filterItem(item, filterParam) {
                var value;
                if (filterParam.property) {
                    value = (item instanceof dorado.Entity) ? item.get(filterParam.property) : item[filterParam.property];
                } else {
                    value = item;
                }
                var op = filterParam.operator;
                if (op == "like") {
                    var s = (filterParam.value + "").toLowerCase();
                    return (value + "").toLowerCase().indexOf(s) >= 0;
                } else {
                    if (op == "like*") {
                        var s = (filterParam.value + "").toLowerCase();
                        return (value + "").toLowerCase().startsWith(s);
                    } else {
                        if (op == "*like") {
                            var s = (filterParam.value + "").toLowerCase();
                            return (value + "").toLowerCase().endsWith(s);
                        } else {
                            return getValueComparator(op)(value, filterParam.value);
                        }
                    }
                }
            }

            function processFilterParams(filterParams, junction) {
                var passed = (junction == "or") ? false : true;
                for (var i = 0; i < filterParams.length; i++) {
                    var filterParam = filterParams[i],
                        b;
                    if (filterParam.junction) {
                        b = processFilterParams(filterParam.criterions, filterParam.junction);
                    } else {
                        b = filterItem(item, filterParams[i]);
                    }
                    if (junction == "or" && b) {
                        passed = true;
                        break;
                    } else {
                        if (junction == "and" && !b) {
                            passed = false;
                            break;
                        }
                    }
                }
                return passed;
            }
            if (filterParams && filterParams.length > 0) {
                if (this._originItems) {
                    this._items = this._originItems;
                } else {
                    this._originItems = this._items;
                }
                var filtered = [];
                for (var it = this.iterator(0); it.hasNext();) {
                    var item = it.next(),
                        passed = undefined;
                    if (customFilter) {
                        passed = customFilter(item, filterParams);
                    }
                    if (passed === undefined || passed === null) {
                        passed = processFilterParams(filterParams, "and");
                    }
                    if (passed) {
                        filtered.push(item);
                    }
                }
                this.filtered = true;
                this._items = filtered;
                this._filterParams = filterParams;
            } else {
                if (this._originItems) {
                    this.filtered = false;
                    this._items = this._originItems;
                    delete this._originItems;
                    delete this._filterParams;
                }
            }
        },
        toArray: function() {
            if (this._items instanceof Array) {
                return this._items;
            } else {
                if (this._items instanceof dorado.EntityList) {
                    return this._items.toArray();
                } else {
                    var v = [];
                    for (var it = this.iterator(0); it.hasNext();) {
                        v.push(it.next());
                    }
                    return v;
                }
            }
        }
    });
})();


dorado.widget.LabelRenderer = $extend(dorado.Renderer, {
    render: function(dom, arg) {
        dom.innerText = arg.text || "";
    }
});
dorado.widget.Label = $extend([dorado.widget.Control, dorado.widget.PropertyDataControl], {
    $className: "dorado.widget.Label",
    ATTRIBUTES: {
        className: { defaultValue: "d-label" },
        width: {},
        text: {},
        renderer: {
            setter: function(value) {
                if (typeof value == "string") {
                    value = eval("new " + value + "()");
                }
                this._renderer = value;
            }
        }
    },
    processDataSetMessage: function(messageCode, arg, data) {
        switch (messageCode) {
            case dorado.widget.DataSet.MESSAGE_REFRESH:
            case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
            case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
            case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
                this.refresh(true);
                break;
        }
    },
    refreshDom: function(dom) {
        $invokeSuper.call(this, arguments);
        var renderer = this._renderer || $singleton(dorado.widget.LabelRenderer);
        var entity = this.getBindingData(true);
        if (entity) {
            var timestamp = entity.timestamp;
            if (timestamp != this._timestamp) {
                renderer.render(dom, { text: ((this._property && entity != null) ? entity.getText(this._property) : ""), entity: entity, property: this._property });
                this._timestamp = timestamp;
            }
        } else {
            renderer.render(dom, { text: this._text });
        }
    }
});
dorado.widget.Link = $extend(dorado.widget.Label, {
    $className: "dorado.widget.Link",
    ATTRIBUTES: {
        className: { defaultValue: "d-link" },
        href: {
            setter: function(v) {
                this._href = v;
                if (!this._text) {
                    this._text = v;
                }
            }
        },
        target: {}
    },
    EVENTS: {
        onClick: {
            interceptor: function(superFire, self, arg) {
                if (this.getListenerCount("onClick") > 0) {
                    arg.returnValue == false;
                    superFire(self, arg);
                    return !!arg.returnValue;
                }
            }
        }
    },
    createDom: function() {
        return document.createElement("A");
    },
    refreshDom: function(dom) {
        $invokeSuper.call(this, arguments);
        dom.href = this._href;
        dom.target = this._target || "_self";
    }
});
dorado.widget.Image = $extend([dorado.widget.Control, dorado.widget.PropertyDataControl], {
    $className: "dorado.widget.Image",
    ATTRIBUTES: { className: { defaultValue: "d-image" }, image: {}, stretchMode: { writeBeforeReady: true, defaultValue: "keepRatio" }, packMode: { writeBeforeReady: true, defaultValue: "center" }, blankImage: { defaultValue: ">dorado/client/resources/blank.gif" } },
    doStretchAndPack: function() {
        if (!this._srcLoaded) {
            return;
        }
        var image = this,
            dom = image._dom,
            imageDom = dom.firstChild,
            stretchMode = image._stretchMode,
            packMode = image._packMode || "center",
            controlWidth = dom.clientWidth,
            controlHeight = dom.clientHeight,
            left = 0,
            top = 0,
            imageWidth = image._originalWidth,
            imageHeight = image._originalHeight;
        if (stretchMode == "keepRatio" || stretchMode == "fitWidth") {
            if (imageWidth > controlWidth) {
                imageHeight = Math.round(controlWidth * imageHeight / imageWidth);
                imageWidth = controlWidth;
            }
        }
        if (stretchMode == "keepRatio" || stretchMode == "fitHeight") {
            if (imageHeight > controlHeight) {
                imageWidth = parseInt(controlHeight * imageWidth / imageHeight);
                imageHeight = controlHeight;
            }
        }
        if (packMode == "center") {
            left = Math.round((controlWidth - imageWidth) / 2);
            top = Math.round((controlHeight - imageHeight) / 2);
        } else {
            if (packMode == "end") {
                left = Math.round(controlWidth - imageWidth);
                top = Math.round(controlHeight - imageHeight);
            }
        }
        $fly(imageDom).css({ left: left, top: top, width: imageWidth, height: imageHeight, visibility: "" });
    },
    createDom: function() {
        var image = this,
            dom = $DomUtils.xCreate({ tagName: "DIV", content: { tagName: "IMG" }, style: { position: "relative" } });
        var imageDom = image._imageDom = dom.firstChild,
            $imageDom = $fly(imageDom),
            stretchMode = image._stretchMode;
        if (stretchMode == "keepRatio" || stretchMode == "fitWidth" || stretchMode == "fitHeight") {
            $imageDom.css({ position: "absolute", width: "", height: "", visibility: "hidden" }).bind("load", function() {
                image._srcLoaded = true;
                image._originalWidth = imageDom.offsetWidth;
                image._originalHeight = imageDom.offsetHeight;
                image.doStretchAndPack();
            });
        } else {
            if (stretchMode == "stretch" || stretchMode == "fit") {
                $imageDom.css({ position: "", width: "100%", height: "100%" });
            }
        }
        return dom;
    },
    processDataSetMessage: function(messageCode, arg, data) {
        switch (messageCode) {
            case dorado.widget.DataSet.MESSAGE_REFRESH:
            case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
            case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
            case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
                this.refresh(true);
                break;
        }
    },
    doOnResize: function() {
        $invokeSuper.call(this, arguments);
        this.doStretchAndPack();
    },
    refreshDom: function(dom) {
        var imgUrl;
        var entity = this.getBindingData(true);
        if (entity) {
            var timestamp = entity.timestamp;
            if (timestamp == this._timestamp) {
                return;
            }
            imgUrl = ((this._property && entity != null) ? entity.get(this._property) : "") || this._blankImage;
            this._timestamp = timestamp;
        } else {
            imgUrl = this._image || this._blankImage;
        }
        var $imageDom = $fly(this._imageDom);
        if (this._stretchMode == "keepRatio") {
            $imageDom.css({ position: "absolute", width: "", height: "" });
        }
        if (this._lastImgUrl != imgUrl) {
            this._lastImgUrl = imgUrl;
            this._srcLoaded = false;
            this._originalWidth = null;
            this._originalHeight = null;
        }
        $imageDom.attr("src", $url(imgUrl));
        $invokeSuper.call(this, arguments);
    }
});
dorado.widget.TemplateField = $extend([dorado.widget.Control, dorado.widget.DataControl], {
    $className: "dorado.widget.TemplateField",
    ATTRIBUTES: { className: { defaultValue: "d-template-field" }, dataPath: { defaultValue: "#" }, template: {}, entity: {} },
    getBindingData: function(options) {
        var realOptions = { firstResultOnly: true, acceptAggregation: false };
        if (typeof options == "String") {
            realOptions.loadMode = options;
        } else {
            dorado.Object.apply(realOptions, options);
        }
        return $invokeSuper.call(this, [realOptions]);
    },
    processDataSetMessage: function(messageCode, arg, data) {
        switch (messageCode) {
            case dorado.widget.DataSet.MESSAGE_REFRESH:
            case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
            case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
            case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
                this.refresh(true);
                break;
        }
    },
    refreshDom: function(dom) {
        $invokeSuper.call(this, arguments);
        var entity = this.getBindingData(true) || this._entity;
        if (entity) {
            var timestamp = entity.timestamp;
            if (timestamp == this._timestamp) {
                return;
            }
            this._timestamp = timestamp;
        }
        if (this._template) {
            var html, context = { view: this.get("view"), control: this, entity: entity };
            context.data = entity ? entity.getWrapper({ textMode: true, readOnly: true }) : {};
            html = _.template(this._template, context);
            dom.innerHTML = html;
        } else {
            dom.innerHTML = "";
        }
    }
});
(function() {
    dorado.widget.editor = {};
    var deamonForm;
    dorado.widget.editor.GET_DEAMON_FORM = function() {
        if (!deamonForm) {
            deamonForm = $DomUtils.xCreate({
                tagName: "FORM",
                id: dorado.Core.newId(),
                style: "display: none",
                onsubmit: function() {
                    var focusedControl = dorado.widget.focusedControl.peek();
                    if (focusedControl) {
                        var textEditor;
                        if (dorado.Object.isInstanceOf(focusedControl, dorado.widget.AbstractEditor)) {
                            textEditor = focusedControl;
                        } else {
                            textEditor = focusedControl.findParent(dorado.widget.AbstractEditor);
                        }
                        if (textEditor && textEditor.post) {
                            try {
                                textEditor.post();
                            } finally {}
                        }
                    }
                    return false;
                }
            });
            document.body.appendChild(deamonForm);
        }
        return deamonForm;
    };
    dorado.widget.AbstractEditor = $extend(dorado.widget.Control, {
        $className: "dorado.widget.AbstractEditor",
        focusable: true,
        ATTRIBUTES: {
            value: {},
            entity: {
                setter: function(v) {
                    if (this._dataSet) {
                        return;
                    }
                    this._entity = v;
                    this.refreshData();
                }
            },
            property: {
                setter: function(v) {
                    this._property = v;
                    this.refreshData();
                }
            },
            readOnly: {},
            supportsDirtyFlag: { defaultValue: true },
            modified: { readOnly: true }
        },
        EVENTS: { beforePost: {}, onPost: {}, onPostFailed: {} },
        refreshDom: function(dom) {
            this._bindingInfo = null;
            if (this._dataSet) {
                this._entity = null;
                if (this._property) {
                    var bindingInfo = this._bindingInfo = this.getBindingInfo();
                    if (bindingInfo.entity instanceof dorado.Entity) {
                        this._entity = bindingInfo.entity;
                    }
                }
            }
            $invokeSuper.call(this, [dom]);
        },
        cancel: function() {
            this.refreshDom();
        },
        post: function() {
            try {
                var eventArg = { processDefault: true };
                this.fireEvent("beforePost", this, eventArg);
                if (eventArg.processDefault === false) {
                    return false;
                }
                if (this.doPost) {
                    this.doPost();
                }
                this.fireEvent("onPost", this);
                return true;
            } catch (e) {
                dorado.Exception.processException(e);
            }
        },
        refreshData: function() {
            if (this._property && this._entity) {
                if (this.doRefreshData) {
                    if (!this._refreshDataPerformed && this._entity && this._entity instanceof dorado.widget.FormProfile.DefaultEntity && this._entity[this._property] === undefined) {
                        return;
                    }
                    this._refreshDataPerformed = true;
                    this.doRefreshData();
                }
            }
        },
        doRefreshData: function() {
            var p = this._property,
                e = this._entity;
            this.set("value", (e instanceof dorado.Entity) ? e.get(p) : e[p]);
            this.setDirty(false);
        },
        doPost: function() {
            var p = this._property,
                e = this._entity;
            if (p && e) {
                var v = this.get("value");
                if (e instanceof dorado.Entity) {
                    e.set(p, v);
                    this.setDirty(e.isDirty(p));
                } else {
                    e[p] = v;
                    this.setDirty(true);
                }
            }
            return true;
        },
        setDirty: function(dirty) {
            if (!this._supportsDirtyFlag) {
                return;
            }
            $fly(this.getDom()).toggleClass(this._className + "-dirty", !!dirty);
        }
    });
    dorado.widget.AbstractDataEditor = $extend([dorado.widget.AbstractEditor, dorado.widget.PropertyDataControl], {
        $className: "dorado.widget.AbstractDataEditor",
        filterDataSetMessage: function(messageCode, arg, data) {
            var b = true;
            switch (messageCode) {
                case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
                    b = false;
                    break;
                default:
                    b = $invokeSuper.call(this, arguments);
            }
            return b;
        },
        processDataSetMessage: function(messageCode, arg, data) {
            switch (messageCode) {
                case dorado.widget.DataSet.MESSAGE_REFRESH:
                case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
                case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
                case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
                case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
                    this.refresh(true);
                    break;
            }
        },
        getBindingInfo: function() {
            if (this._bindingInfoCache && (new Date().getTime() - this._bindingInfoCache.cacheTimestamp) < 50) {
                return this._bindingInfoCache;
            }
            var info = {};
            var entityDataType;
            var entity = info.entity = this.getBindingData();
            if (entity != null) {
                entityDataType = entity.dataType;
                info.timestamp = entity.timestamp;
            }
            if (!entityDataType) {
                entityDataType = this.getBindingDataType();
            }
            info.entityDataType = entityDataType;
            if (entityDataType) {
                info.propertyDef = entityDataType.getPropertyDef(this._property);
                info.dataType = info.propertyDef ? info.propertyDef.get("dataType") : null;
            }
            if (info.timestamp == null) {
                info.timestamp = 0;
            }
            info.cacheTimestamp = new Date().getTime();
            this._bindingInfoCache = info;
            return info;
        },
        doPost: function() {
            var p = this._property,
                e = this._entity;
            if (!p || !e) {
                return false;
            }
            var b = false;
            if (this._dataSet) {
                e.set(p, this.get("value"));
                b = true;
            } else {
                if (e instanceof dorado.Entity) {
                    e.set(p, this.get("value"));
                } else {
                    e[p] = this.get("value");
                }
                b = true;
            }
            return b;
        },
        refreshExternalReadOnly: function() {
            if (this._dataSet) {
                var readOnly = this._dataSet._readOnly;
                var bindingInfo = this._bindingInfo;
                if (this._property) {
                    readOnly = readOnly || (bindingInfo.entity == null);
                    if (bindingInfo.propertyDef) {
                        readOnly = readOnly || bindingInfo.propertyDef.get("readOnly");
                    }
                } else {
                    readOnly = true;
                }
                this._readOnly2 = readOnly;
            } else {
                this._readOnly2 = false;
            }
        },
        isFocusable: function() {
            return $invokeSuper.call(this) && !(this._readOnly || this._readOnly2);
        }
    });
})();
dorado.widget.CheckBox = $extend(dorado.widget.AbstractDataEditor, {
    $className: "dorado.widget.CheckBox",
    ATTRIBUTES: {
        className: { defaultValue: "d-checkbox" },
        height: { independent: true },
        iconOnly: { writeBeforeReady: true },
        onValue: { defaultValue: true },
        offValue: { defaultValue: false },
        mixedValue: {},
        caption: {},
        value: {
            defaultValue: false,
            getter: function() {
                return this._checked ? this._onValue : ((this._checked === null || this._checked === undefined) ? this._mixedValue : this._offValue);
            },
            setter: function(v) {
                if (this._onValue === v) {
                    this._checked = true;
                } else {
                    if (this._offValue === v) {
                        this._checked = false;
                    } else {
                        this._checked = null;
                    }
                }
                if (!this._dataSet && this._rendered) {
                    this._lastPost = this._checked;
                }
            }
        },
        checked: {
            defaultValue: false,
            setter: function(value) {
                if (this._triState) {
                    this._checked = value;
                } else {
                    this._checked = !!value;
                }
            }
        },
        triState: { defaultValue: false }
    },
    EVENTS: { onValueChange: {} },
    onClick: function(event) {
        var checkBox = this;
        if (checkBox._readOnly || this._readOnly2) {
            return;
        }
        if (event !== true && event.target == checkBox._dom) {
            return;
        }
        var checked = checkBox._checked;
        if (checkBox._triState) {
            if (checkBox._checked === null || checkBox._checked === undefined) {
                checkBox._checked = true;
            } else {
                if (checkBox._checked === true) {
                    checkBox._checked = false;
                } else {
                    checkBox._checked = null;
                }
            }
        } else {
            checkBox._checked = !checkBox._checked;
        }
        var postResult = checkBox.post();
        if (postResult == false) {
            checkBox._checked = checked;
        }
        checkBox.refresh();
        checkBox.fireEvent("onValueChange", checkBox);
    },
    post: function() {
        var modified = (this._lastPost !== this._checked);
        if (!modified) {
            return true;
        }
        var lastPost = this._lastPost;
        try {
            this._lastPost = this._checked;
            var eventArg = { processDefault: true };
            this.fireEvent("beforePost", this, eventArg);
            if (eventArg.processDefault === false) {
                return false;
            }
            if (this.doPost) {
                this.doPost();
            }
            this.fireEvent("onPost", this);
            return true;
        } catch (e) {
            this._lastPost = lastPost;
            dorado.Exception.processException(e);
            return false;
        }
    },
    refreshDom: function(dom) {
        $invokeSuper.call(this, arguments);
        var checkBox = this,
            checked = checkBox._checked,
            caption = checkBox._caption || "";
        this.refreshExternalReadOnly();
        $fly(dom).toggleClass(checkBox._className + "-icononly", !!checkBox._iconOnly).toggleClass(checkBox._className + "-readonly", (checkBox._readOnly || checkBox._readOnly2));
        if (checkBox._dataSet) {
            checked = undefined;
            var value, dirty;
            if (checkBox._property) {
                var bindingInfo = checkBox._bindingInfo;
                var dt = bindingInfo.dataType;
                if (dt) {
                    var config;
                    switch (dt._code) {
                        case dorado.DataType.BOOLEAN:
                            config = { triState: true };
                            break;
                        case dorado.DataType.PRIMITIVE_INT:
                        case dorado.DataType.PRIMITIVE_FLOAT:
                            config = { offValue: 0, onValue: 1 };
                            break;
                        case dorado.DataType.INTEGER:
                        case dorado.DataType.FLOAT:
                            config = { offValue: 0, onValue: 1, triState: true };
                            break;
                    }
                    if (config) {
                        this.set(config, { preventOverwriting: true });
                    }
                }
                if (bindingInfo.entity instanceof dorado.Entity) {
                    value = bindingInfo.entity.get(checkBox._property);
                    dirty = bindingInfo.entity.isDirty(checkBox._property);
                }
            }
            value += "";
            if (value == (checkBox._onValue + "")) {
                checked = true;
            } else {
                if (value == (checkBox._offValue + "")) {
                    checked = false;
                }
            }
            checkBox._checked = checked;
            checkBox._lastPost = checked;
            checkBox.setDirty(dirty);
        }
        var iconEl = dom.firstChild;
        if (checked) {
            $fly(iconEl).removeClass("unchecked halfchecked").addClass("checked");
        } else {
            if (checked == null && checkBox._triState) {
                $fly(iconEl).removeClass("checked unchecked").addClass("halfchecked");
            } else {
                $fly(iconEl).removeClass("checked halfchecked").addClass("unchecked");
            }
        }
        if (!checkBox._iconOnly) {
            iconEl.nextSibling.innerText = caption;
        }
    },
    createDom: function() {
        var checkBox = this,
            dom, doms = {};
        if (checkBox._iconOnly) {
            dom = $DomUtils.xCreate({ tagName: "SPAN", className: checkBox._className, content: { tagName: "SPAN", className: "icon" } });
        } else {
            dom = $DomUtils.xCreate({ tagName: "SPAN", className: checkBox._className, content: [{ tagName: "SPAN", className: "icon", contextKey: "icon" }, { tagName: "SPAN", className: "caption", contextKey: "caption", content: checkBox._caption || "" }] });
        }
        $fly(dom).hover(function() {
            if (!(checkBox._readOnly || checkBox._readOnly2)) {
                if (checkBox._checked) {
                    $fly(dom).removeClass("d-checkbox-checked").addClass("d-checkbox-hover");
                } else {
                    if (checkBox._checked == null) {
                        $fly(dom).removeClass("d-checkbox-halfchecked").addClass("d-checkbox-hover");
                    } else {
                        $fly(dom).removeClass("d-checkbox-unchecked").addClass("d-checkbox-hover");
                    }
                }
            }
        }, function() {
            $fly(dom).removeClass("d-checkbox-hover");
            if (checkBox._checked) {
                $fly(dom).addClass("d-checkbox-checked");
            } else {
                if (checkBox._checked === null || checkBox._checked === undefined) {
                    $fly(dom).addClass("d-checkbox-halfchecked");
                } else {
                    $fly(dom).addClass("d-checkbox-unchecked");
                }
            }
        });
        return dom;
    },
    doOnKeyDown: function(evt) {
        var retValue = true;
        switch (evt.keyCode) {
            case 32:
                this.onClick(true);
                retValue = false;
                break;
        }
        return retValue;
    }
});
dorado.widget.RadioButton = $extend(dorado.widget.Control, {
    $className: "dorado.widget.RadioButton",
    focusable: true,
    ATTRIBUTES: { className: { defaultValue: "d-radio" }, height: { independent: true }, text: {}, value: {}, checked: {}, readOnly: {} },
    _isReadOnly: function() {
        var radioButton = this,
            radioGroup = radioButton._radioGroup;
        return radioButton._readOnly || radioGroup._readOnly || radioGroup._readOnly2;
    },
    onClick: function(event) {
        var radioButton = this;
        if (event.target == radioButton._dom) {
            return;
        }
        if (!radioButton._isReadOnly()) {
            if (!radioButton._checked) {
                radioButton._checked = true;
                if (radioButton._radioGroup) {
                    radioButton._radioGroup._valueChange(radioButton);
                }
            }
        }
    },
    refreshDom: function(dom) {
        $invokeSuper.call(this, arguments);
        var radioButton = this,
            doms = radioButton._doms,
            checked = radioButton._checked,
            text = radioButton._text,
            jDom;
        if (dom) {
            if (checked) {
                $fly(doms.icon).removeClass("unchecked").addClass("checked");
            } else {
                $fly(doms.icon).removeClass("checked").addClass("unchecked");
            }
            $fly(doms.text).html(text);
        }
    },
    createDom: function() {
        var radioButton = this,
            dom, doms = {};
        dom = $DomUtils.xCreate({ tagName: "div", className: radioButton._className, content: [{ tagName: "span", className: "icon", contextKey: "icon" }, { tagName: "span", className: "text", contextKey: "text", content: radioButton._text }] }, null, doms);
        radioButton._doms = doms;
        $fly([doms.icon, doms.text]).hover(function() {
            if (!radioButton._isReadOnly()) {
                $fly(dom).addClass(radioButton._className + "-hover");
            }
        }, function() {
            if (!radioButton._isReadOnly()) {
                $fly(dom).removeClass(radioButton._className + "-hover");
            }
        }).mousedown(function(event) {
            if (!radioButton._isReadOnly()) {
                $fly(dom).addClass(radioButton._className + "-click");
            }
            $(document).one("mouseup", function() {
                if (!radioButton._isReadOnly()) {
                    $fly(dom).removeClass(radioButton._className + "-click");
                }
            });
        });
        return dom;
    },
    isFocusable: function() {
        return !this._isReadOnly() && $invokeSuper.call(this);
    }
});
dorado.widget.RadioGroup = $extend(dorado.widget.AbstractDataEditor, {
    $className: "dorado.widget.RadioGroup",
    ATTRIBUTES: {
        className: { defaultValue: "d-radiogroup" },
        layout: { defaultValue: "flow" },
        columnCount: { defaultValue: 3 },
        radioButtons: {
            setter: function(radioButtons) {
                var radioGroup = this,
                    oldValue = this._radioButtons,
                    dom = radioGroup._dom;
                if (oldValue) {
                    radioGroup.clearRadioButtons();
                }
                radioGroup._radioButtons = radioButtons;
                if (radioButtons) {
                    for (var i = 0; i < radioButtons.length; i++) {
                        var radioButton = radioButtons[i];
                        if (!(radioButton instanceof dorado.widget.RadioButton)) {
                            radioButtons[i] = radioButton = new dorado.widget.RadioButton(radioButton);
                        }
                        if (dom) {
                            radioButton._radioGroup = radioGroup;
                            if (radioButton._value == radioGroup._value) {
                                radioGroup.currentRadioButton = radioButton;
                                radioButton._checked = true;
                            }
                            radioButton.render(dom);
                        }
                        radioGroup.registerInnerControl(radioButton);
                    }
                }
                if (radioGroup._rendered && radioGroup.isActualVisible()) {
                    radioGroup.doOnResize();
                }
            }
        },
        value: {
            setter: function(value) {
                this.setValue(value);
            }
        },
        readOnly: {}
    },
    EVENTS: { onValueChange: {} },
    setValue: function(value) {
        var radioGroup = this,
            radioButtons = radioGroup._radioButtons;
        if (radioButtons) {
            var found = false;
            for (var i = 0, j = radioButtons.length; i < j; i++) {
                var radioButton = radioButtons[i];
                if ((value + "") == (radioButton._value + "")) {
                    found = true;
                    radioGroup._setValue(radioButton);
                    break;
                }
            }
            if (!found) {
                radioGroup._setValue(null);
            }
        }
        radioGroup._value = value;
        if (!radioGroup._dataSet && radioGroup._rendered) {
            radioGroup._lastPost = value;
        }
    },
    addRadioButton: function(radioButton, index) {
        var radioGroup = this,
            radioButtons = radioGroup._radioButtons,
            dom = radioGroup._dom,
            refDom;
        if (!radioButtons) {
            radioButtons = radioGroup._radioButtons = [];
        }
        if (!(radioButton instanceof dorado.widget.RadioButton)) {
            radioButton = new dorado.widget.RadioButton(radioButton);
        }
        if (typeof index == "number") {
            var refButton = radioButtons[index];
            if (refButton) {
                refDom = refButton._dom;
            }
            radioButtons.insert(radioButton, index);
        } else {
            radioButtons.push(radioButton);
        }
        if (dom) {
            radioButton._radioGroup = radioGroup;
            if (radioButton._value == radioGroup._value) {
                radioGroup.currentRadioButton = radioButton;
                radioButton._checked = true;
            }
            radioButton.render(dom, refDom);
        }
        radioGroup.registerInnerControl(radioButton);
    },
    removeRadioButton: function(radioButton) {
        var radioGroup = this,
            radioButtons = radioGroup._radioButtons,
            index;
        if (!radioButtons) {
            return;
        }
        if (typeof radioButton == "number") {
            index = radioButton;
            radioButton = radioButtons[radioButton];
            radioGroup.unregisterInnerControl(radioButton);
            radioButton.destroy();
            radioButtons.removeAt(index);
            if (radioGroup.currentRadioButton == radioButton) {
                radioGroup.currentRadioButton = null;
            }
        } else {
            if (radioButton && radioButton.destroy) {
                radioGroup.unregisterInnerControl(radioButton);
                radioButton.destroy();
                if (radioGroup.currentRadioButton == radioButton) {
                    radioGroup.currentRadioButton = null;
                }
            }
        }
    },
    clearRadioButtons: function() {
        var radioGroup = this,
            radioButtons = radioGroup._radioButtons || [],
            radioButton;
        for (var i = 0; i < radioButtons.length; i++) {
            radioButton = radioButtons[i];
            radioGroup.unregisterInnerControl(radioButton);
            radioButton.destroy();
        }
        radioGroup._radioButtons = null;
        radioGroup.currentRadioButton = null;
    },
    _setValue: function(radioButton) {
        var radioGroup = this,
            value = radioButton ? radioButton._value : null;
        if (radioGroup.currentRadioButton == radioButton) {
            return;
        }
        if (radioGroup.currentRadioButton) {
            radioGroup.currentRadioButton._checked = false;
            radioGroup.currentRadioButton.refresh();
        }
        if (radioButton) {
            radioButton._checked = true;
            radioButton.refresh();
        }
        radioGroup.currentRadioButton = radioButton;
    },
    _valueChange: function(radioButton) {
        var radioGroup = this,
            value = radioButton ? radioButton._value : null;
        if (radioGroup.currentRadioButton == radioButton || radioGroup._value == value) {
            return;
        }
        var currentValue = radioGroup._value;
        radioGroup._value = value;
        var postResult = radioGroup.post();
        if (postResult == false) {
            radioGroup._value = currentValue;
            if (radioButton) {
                radioButton._checked = false;
                radioButton.refresh();
            }
        }
        this._setValue(radioButton);
        radioGroup.fireEvent("onValueChange", radioGroup, {});
    },
    post: function(force, silent) {
        var modified = (this._lastPost != this._value);
        if (!force && !modified) {
            return true;
        }
        var lastPost = this._lastPost;
        try {
            this._lastPost = this._value;
            var eventArg = { processDefault: true };
            this.fireEvent("beforePost", this, eventArg);
            if (eventArg.processDefault === false) {
                return false;
            }
            if (this.doPost) {
                this.doPost();
            }
            this.fireEvent("onPost", this);
            return true;
        } catch (e) {
            this._lastPost = lastPost;
            var eventArg = { exception: e, processDefault: true };
            this.fireEvent("onPostFailed", this, eventArg);
            if (eventArg.processDefault && !silent) {
                dorado.Exception.processException(e);
            } else {
                dorado.Exception.removeException(e);
            }
            return false;
        }
    },
    createDom: function() {
        var radioGroup = this,
            layout = radioGroup._layout,
            radioButtons = radioGroup._radioButtons;
        var dom = $DomUtils.xCreate({ tagName: "div", className: radioGroup._className });
        if (radioButtons) {
            for (var i = 0, j = radioButtons.length; i < j; i++) {
                var radioButton = radioButtons[i];
                radioButton._radioGroup = radioGroup;
                if (radioButton._value == radioGroup._value) {
                    radioGroup.currentRadioButton = radioButton;
                    radioButton._checked = true;
                }
                radioButton.render(dom);
            }
        }
        return dom;
    },
    refreshDom: function(dom) {
        $invokeSuper.call(this, arguments);
        this.refreshExternalReadOnly();
        var group = this,
            layout = group._layout;
        if (group._dataSet) {
            var value, dirty;
            if (group._property) {
                var bindingInfo = group._bindingInfo;
                if (bindingInfo.entity instanceof dorado.Entity) {
                    value = bindingInfo.entity.get(group._property);
                    dirty = bindingInfo.entity.isDirty(group._property);
                }
                if (bindingInfo.propertyDef) {
                    var oldMapping = group._propertyDefMapping,
                        mapping = bindingInfo.propertyDef._mapping;
                    if ((oldMapping || mapping) && (oldMapping != mapping)) {
                        var radioButtons = [];
                        if (mapping) {
                            group._propertyDefMapping = mapping;
                            for (var i = 0; i < mapping.length; i++) {
                                var item = mapping[i];
                                radioButtons.push({ value: item.key, text: item.value });
                            }
                        }
                        if (radioButtons) {
                            group.set("radioButtons", radioButtons);
                        }
                    }
                }
            }
            group.setValue(value);
            group._lastPost = value;
            group.setDirty(dirty);
        }
        if (layout == "flow" || layout == "grid") {
            $fly(dom).addClass(group._className + "-flow");
        } else {
            $fly(dom).removeClass(group._className + "-flow");
        }
    },
    doOnResize: function() {
        var group = this,
            radioButtons = group._radioButtons,
            layout = group._layout,
            columnCount = group._columnCount || 3;
        if (radioButtons) {
            if (layout == "grid") {
                var width = $fly(group._dom).width(),
                    averageWidth = Math.floor(width / columnCount);
                for (var i = 0, j = radioButtons.length; i < j; i++) {
                    var radioButton = radioButtons[i];
                    radioButton._width = averageWidth;
                    radioButton.resetDimension();
                }
            } else {
                for (var i = 0, j = radioButtons.length; i < j; i++) {
                    var radioButton = radioButtons[i];
                    radioButton._width = "auto";
                    radioButton.resetDimension();
                }
            }
        }
        $invokeSuper.call(this, arguments);
    },
    doOnKeyDown: function(event) {
        if (event.ctrlKey) {
            return true;
        }
        var group = this,
            radioButtons = group._radioButtons,
            currentRadioButton = group.currentRadioButton,
            currentButtonIndex = currentRadioButton ? radioButtons.indexOf(currentRadioButton) : -1,
            buttonCount = radioButtons.length,
            newIndex, newRadioButton, retValue = true;
        switch (event.keyCode) {
            case 38:
            case 37:
                if (currentButtonIndex == 0) {
                    newIndex = buttonCount - 1;
                } else {
                    if (currentButtonIndex > 0 && currentButtonIndex < buttonCount) {
                        newIndex = currentButtonIndex - 1;
                    } else {
                        newIndex = 0;
                    }
                }
                retValue = false;
                break;
            case 39:
            case 40:
                if (currentButtonIndex >= 0 && currentButtonIndex < buttonCount - 1) {
                    newIndex = currentButtonIndex + 1;
                } else {
                    newIndex = 0;
                }
                retValue = false;
                break;
        }
        newRadioButton = radioButtons[newIndex];
        if (newRadioButton) {
            group._valueChange(newRadioButton);
        }
        return retValue;
    }
});
(function() {
    function isInputOrTextArea(dom) {
        return ["input", "textarea"].indexOf(dom.tagName.toLowerCase()) >= 0;
    }
    var attributesRelativeWithTrigger = ["dataSet", "dataType", "trigger", "dataPath", "property"];
    dorado.widget.editor.PostException = $extend(dorado.Exception, {
        $className: "dorado.widget.editor.PostException",
        constructor: function(messages) {
            $invokeSuper.call(this, [dorado.Toolkits.getTopMessage(messages).text]);
            this.messages = messages;
        }
    });
    dorado.widget.AbstractTextBox = $extend(dorado.widget.AbstractDataEditor, {
        $className: "dorado.widget.AbstractTextBox",
        _triggerChanged: true,
        _realEditable: true,
        ATTRIBUTES: {
            className: { defaultValue: "d-text-box" },
            text: {
                skipRefresh: true,
                getter: function() {
                    return this.doGetText();
                },
                setter: function(text) {
                    this.doSetText(text);
                }
            },
            value: {
                skipRefresh: true,
                getter: function() {
                    var text = this.doGetText();
                    if (this._value !== undefined && text === this._valueText) {
                        return this._value;
                    } else {
                        if (text === undefined) {
                            text = null;
                        }
                        return text;
                    }
                },
                setter: function(value) {
                    this._value = value;
                    var text = this._valueText = this._lastObserve = dorado.$String.toText(value);
                    this.doSetText(text);
                }
            },
            editable: { defaultValue: true },
            readOnly: {},
            modified: {
                getter: function() {
                    return (this._focused) ? (this._lastPost != this.get("text")) : false;
                }
            },
            validationState: { readOnly: true, defaultValue: "none" },
            validationMessages: { readOnly: true },
            trigger: {
                componentReference: true,
                setter: function(v) {
                    if (v instanceof Array && v.length == 0) {
                        v = null;
                    }
                    this._trigger = v;
                }
            }
        },
        EVENTS: { onTextEdit: {}, onTriggerClick: {}, onValidationStateChange: {} },
        doSet: function(attr, value, skipUnknownAttribute, lockWritingTimes) {
            if (attributesRelativeWithTrigger.indexOf(attr) >= 0) {
                this._triggerChanged = true;
            }
            return $invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);
        },
        createDom: function() {
            var textDom = this._textDom = this.createTextDom();
            textDom.style.width = "100%";
            textDom.style.height = "100%";
            var dom = $DomUtils.xCreate({ tagName: "div", content: { tagName: "div", className: "editor-wrapper", content: textDom } });
            this._editorWrapper = dom.firstChild;
            var self = this;
            jQuery(dom).addClassOnHover(this._className + "-hover", null, function() {
                return !self._realReadOnly;
            }).mousedown(function(evt) {
                evt.stopPropagation();
            });
            if (this._text) {
                this.doSetText(this._text);
            }
            return dom;
        },
        refreshTriggerDoms: function() {
            var triggerButtons = this._triggerButtons,
                triggerButton;
            if (triggerButtons) {
                for (var i = 0; i < triggerButtons.length; i++) {
                    triggerButton = triggerButtons[i];
                    triggerButton.destroy();
                }
            }
            var triggerWidth = $setting["widget.TextEditor.triggerWidth"] || 18;
            var triggersWidth = 0;
            var triggers = this.get("trigger");
            if (triggers) {
                if (!(triggers instanceof Array)) {
                    triggers = [triggers];
                }
                this._triggerButtons = triggerButtons = [];
                for (var i = triggers.length - 1, trigger; i >= 0; i--) {
                    trigger = triggers[i];
                    triggerButton = trigger.createTriggerButton(this);
                    if (triggerButton) {
                        triggerButtons.push(triggerButton);
                        this.registerInnerControl(triggerButton);
                        triggerButton.set("style", "right:" + triggersWidth + "px");
                        triggerButton.render(this._dom);
                        triggersWidth += triggerWidth;
                    }
                }
            }
        },
        getTriggerButton: function(trigger) {
            var triggerButtons = this._triggerButtons,
                triggerButton;
            if (triggerButtons) {
                for (var i = 0; i < triggerButtons.length; i++) {
                    triggerButton = triggerButtons[i];
                    if (triggerButton._trigger == trigger) {
                        return triggerButton;
                    }
                }
            }
        },
        refreshDom: function(dom) {
            $invokeSuper.call(this, [dom]);
            this.refreshExternalReadOnly();
            this.resetReadOnly();
            if (this._dataSet) {
                var value, dirty, timestamp = 0;
                this._entity = null;
                if (this._property) {
                    var bindingInfo = this._bindingInfo,
                        propertyDef = bindingInfo.propertyDef,
                        state, messages;
                    if (propertyDef) {
                        var watcher = this.getAttributeWatcher();
                        if (!watcher.getWritingTimes("displayFormat")) {
                            this._displayFormat = propertyDef._displayFormat;
                        }
                        if (!watcher.getWritingTimes("inputFormat")) {
                            this._inputFormat = propertyDef._inputFormat;
                        }
                        if (!propertyDef._mapping && !watcher.getWritingTimes("dataType")) {
                            this._dataType = propertyDef._dataType;
                        }
                    }
                    timestamp = bindingInfo.timestamp;
                    if (bindingInfo.entity instanceof dorado.Entity) {
                        var e = this._entity = bindingInfo.entity;
                        if (this._dataType) {
                            value = e.get(this._property);
                        } else {
                            value = e.getText(this._property);
                        }
                        dirty = e.isDirty(this._property);
                        state = e.getMessageState(this._property);
                        messages = e.getMessages(this._property);
                    }
                    if (timestamp != this.timestamp) {
                        this.set("value", value);
                        this._lastPost = this.get("text");
                        this.timestamp = timestamp;
                    }
                    this.setValidationState(state, messages);
                    this.setDirty(dirty);
                }
            }
            if (this._triggerChanged) {
                this._triggerChanged = false;
                this.refreshTriggerDoms();
            }
        },
        validate: function(text) {
            if (this._skipValidate) {
                return null;
            }
            if (this.doValidate) {
                return this.doValidate(text);
            }
        },
        setValidationState: function(state, messages) {
            state = state || "none";
            if (this._validationState == state) {
                return;
            }
            this._validationState = state;
            this._validationMessages = dorado.Toolkits.trimMessages(messages, "error");
            if (this._rendered) {
                var dom = this._dom,
                    warnCls = this._className + "-warn",
                    errorCls = this._className + "-error";
                $fly(dom).toggleClass(warnCls, state == "warn").toggleClass(errorCls, state == "error");
                if (dorado.TipManager) {
                    if ((state == "warn" || state == "error") && messages) {
                        var message = dorado.Toolkits.getTopMessage(messages);
                        dorado.TipManager.initTip(dom, { text: message.text });
                    } else {
                        dorado.TipManager.deleteTip(dom);
                    }
                }
            }
            this.fireEvent("onValidationStateChange", this);
        },
        onMouseDown: function() {
            if (this._realReadOnly) {
                return;
            }
            var triggers = this.get("trigger");
            if (triggers) {
                if (!(triggers instanceof Array)) {
                    triggers = [triggers];
                }
                var self = this;
                jQuery.each(triggers, function(i, trigger) {
                    if (trigger.onEditorMouseDown) {
                        trigger.onEditorMouseDown(self);
                    }
                });
            }
        },
        doSetFocus: function() {
            if (!dorado.Browser.isTouch && this._textDom) {
                this._textDom.focus();
            }
        },
        doOnFocus: function() {
            if (this._realReadOnly) {
                return;
            }
            this._focusTime = new Date();
            this._editorFocused = true;
            this._lastPost = this._lastObserve = this.get("text");
            if (this._useBlankText) {
                this.doSetText("");
            }
            dorado.Toolkits.setDelayedAction(this, "$editObserverTimerId", function() {
                var text = this.get("text");
                if (this._lastObserve != text) {
                    this._lastObserve = text;
                    this.textEdited();
                }
                dorado.Toolkits.setDelayedAction(this, "$editObserverTimerId", arguments.callee, 50);
            }, 50);
            var triggers = this.get("trigger");
            if (triggers) {
                if (!(triggers instanceof Array)) {
                    triggers = [triggers];
                }
                for (var i = 0; i < triggers.length; i++) {
                    var trigger = triggers[i];
                    if (trigger.onEditorFocus) {
                        trigger.onEditorFocus(this);
                    }
                }
            }
        },
        doOnBlur: function() {
            if (this._realReadOnly) {
                return;
            }
            dorado.Toolkits.cancelDelayedAction(this, "$editObserverTimerId");
            this.post();
            this._editorFocused = false;
            if (this._blankText) {
                this.doSetText(this.doGetText());
            }
        },
        resetReadOnly: function() {
            if (!this._rendered) {
                return;
            }
            var readOnly = !!(this._readOnly || this._readOnly2);
            this._realReadOnly = readOnly;
            $fly(this.getDom()).toggleClass("d-readonly " + this._className + "-readonly", readOnly);
            if (readOnly && !this._realEditable == readOnly) {
                return;
            }
            var textDomReadOnly = true;
            if (!readOnly && this._editable) {
                var realEditable = true;
                if (isInputOrTextArea(this._textDom)) {
                    var triggers = this.get("trigger"),
                        realEditable = true;
                    if (triggers && !(triggers instanceof Array)) {
                        triggers = [triggers];
                    }
                    if (triggers) {
                        for (var i = 0; i < triggers.length; i++) {
                            var trigger = triggers[i];
                            if (!trigger.get("editable")) {
                                realEditable = false;
                                break;
                            }
                        }
                    }
                }
                textDomReadOnly = !realEditable;
            }
            this._realEditable = !textDomReadOnly;
            this._textDom.readOnly = textDomReadOnly;
        },
        onTriggerClick: function(trigger) {
            if (this._realReadOnly) {
                return;
            }
            var eventArg = { processDefault: true };
            this.fireEvent("onTriggerClick", this, eventArg);
            if (eventArg.processDefault) {
                trigger.execute(this);
            }
            if (!dorado.Browser.isTouch) {
                $setTimeout(this, function() {
                    this._textDom.focus();
                }, 0);
            }
        },
        doOnKeyDown: function(evt) {
            function forwardKeyDownEvent(trigger, editor) {
                if (trigger) {
                    if (trigger instanceof Array) {
                        for (var i = 0; i < trigger.length; i++) {
                            var t = trigger[i];
                            if (t.onEditorKeyDown) {
                                var result = t.onEditorKeyDown(editor, evt);
                                if (result === false) {
                                    return false;
                                } else {
                                    if (!result) {
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        if (trigger.onEditorKeyDown) {
                            if (trigger.onEditorKeyDown(editor, evt) === false) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
            var retValue = true,
                trigger = this.get("trigger"),
                firstTrigger;
            if (trigger) {
                firstTrigger = (trigger instanceof Array) ? trigger[0] : trigger;
            }
            switch (evt.keyCode) {
                case 36:
                case 35:
                case 38:
                case 27:
                    retValue = forwardKeyDownEvent(trigger, this);
                    break;
                case 40:
                    retValue = forwardKeyDownEvent(trigger, this);
                    if (retValue && evt.altKey && firstTrigger) {
                        this.onTriggerClick(firstTrigger);
                        retValue = false;
                    }
                    break;
                case 118:
                    retValue = forwardKeyDownEvent(trigger, this);
                    if (retValue && firstTrigger) {
                        this.onTriggerClick(firstTrigger);
                        retValue = false;
                    }
                    break;
                case 13:
                    retValue = forwardKeyDownEvent(trigger, this);
                    if (retValue) {
                        var b = this.post();
                        retValue = (b === true || b == null);
                    }
                    break;
                default:
                    retValue = forwardKeyDownEvent(trigger, this);
            }
            return retValue;
        },
        textEdited: function() {
            this.fireEvent("onTextEdit", this);
            if (this._dataSet && this._entity && this._property && !this._entity.isDirty()) {
                this._entity.setState(dorado.Entity.STATE_MODIFIED);
            }
        },
        setDirty: function(dirty) {
            if (!this._supportsDirtyFlag) {
                return;
            }
            if (!dorado.Browser.isTouch) {
                var dirtyFlag = this._dirtyFlag;
                if (dirty) {
                    if (!dirtyFlag) {
                        this._dirtyFlag = dirtyFlag = $DomUtils.xCreate({ tagName: "LABEL", className: "d-dirty-flag" });
                        this._dom.appendChild(dirtyFlag);
                    }
                    dirtyFlag.style.display = "";
                } else {
                    if (dirtyFlag) {
                        dirtyFlag.style.display = "none";
                    }
                }
            } else {
                $invokeSuper.call(this, arguments);
            }
        },
        post: function(force, silent) {
            try {
                var text = this.get("text"),
                    state, result, modified = (this._lastPost != text),
                    validationResults;
                if (force || modified || (this._validationState == "none" && text == "")) {
                    this._lastPost = text;
                    var eventArg = { processDefault: true };
                    if (force || modified) {
                        this.fireEvent("beforePost", this, eventArg);
                    }
                    if (eventArg.processDefault === false) {
                        return false;
                    }
                    validationResults = this.validate(text);
                    if (validationResults) {
                        var topValidationResult = dorado.Toolkits.getTopMessage(validationResults);
                        if (topValidationResult) {
                            state = topValidationResult.state;
                            if (state == "error") {
                                throw new dorado.widget.editor.PostException(validationResults);
                            }
                        }
                    }
                    if (force || modified) {
                        this.doPost();
                        this.fireEvent("onPost", this);
                        result = true;
                    }
                }
                if (result) {
                    this.setValidationState(state, validationResults);
                }
                return result;
            } catch (e) {
                if (e instanceof dorado.widget.editor.PostException) {
                    this.setValidationState("error", e.messages);
                }
                var eventArg = { exception: e, processDefault: true };
                this.fireEvent("onPostFailed", this, eventArg);
                if (eventArg.processDefault && !silent) {
                    dorado.Exception.processException(e);
                } else {
                    dorado.Exception.removeException(e);
                }
                return false;
            }
        }
    });
    dorado.widget.AbstractTextEditor = $extend(dorado.widget.AbstractTextBox, {
        $className: "dorado.widget.AbstractTextEditor",
        ATTRIBUTES: {
            value: {
                skipRefresh: true,
                getter: function() {
                    var text = this.get("text");
                    if (this._value !== undefined && text === this._valueText) {
                        return this._value;
                    } else {
                        if (text === undefined) {
                            text = null;
                        }
                        return text;
                    }
                },
                setter: function(value) {
                    this._value = value;
                    var text = dorado.$String.toText(value);
                    this._skipValidateEmpty = true;
                    this.validate(text);
                    this._text = this._valueText = this._lastObserve = text;
                    this.doSetText(text);
                    this.setValidationState(null);
                }
            },
            text: {
                skipRefresh: true,
                setter: function(text) {
                    this.validate(text);
                    this._text = text;
                    this.doSetText(text);
                    this.setValidationState(null);
                }
            },
            blankText: {},
            required: {},
            minLength: { skipRefresh: true },
            maxLength: { skipRefresh: true },
            selectTextOnFocus: { defaultValue: !dorado.Browser.isTouch },
            validators: {
                setter: function(value) {
                    var validators = [];
                    for (var i = 0; i < value.length; i++) {
                        var v = value[i];
                        if (!(v instanceof dorado.validator.Validator)) {
                            v = dorado.Toolkits.createInstance("validator", v, function(type) {
                                return dorado.util.Common.getClassType("dorado.validator." + type + "Validator", true);
                            });
                        }
                        validators.push(v);
                    }
                    this._validators = validators;
                }
            }
        },
        createDom: function() {
            var text = this._text,
                dom = $invokeSuper.call(this);
            if (!text) {
                this.doSetText("");
            }
            return dom;
        },
        doGetText: function() {
            if (this._useBlankText) {
                return "";
            }
            return (this._textDom) ? this._textDom.value : this._text;
        },
        doSetText: function(text) {
            this._useBlankText = (!this._focused && text == "" && this._blankText);
            if (this._textDom) {
                if (this._useBlankText) {
                    if (dorado.Browser.msie && dorado.Browser.version < 9 && this._textDom.getAttribute("type") == "password") {
                        this._useBlankText = false;
                    } else {
                        text = this._blankText;
                    }
                }
                $fly(this._textDom).toggleClass("blank-text", !!this._useBlankText);
                if (this._useBlankText && this._textDom.getAttribute("type") == "password") {
                    this._textDom.setAttribute("type", "");
                    this._isPassword = true;
                } else {
                    if (!this._useBlankText && this._isPassword) {
                        this._textDom.setAttribute("type", "password");
                        delete this._isPassword;
                    }
                }
                this._textDom.value = text || "";
            } else {
                this._text = text;
            }
        },
        doValidate: function(text) {
            var validationResults = [];
            var skipValidateEmpty = this._skipValidateEmpty;
            this._skipValidateEmpty = false;
            if (!skipValidateEmpty && this._required && text.length == 0) {
                validationResults.push({ state: "error", text: $resource("dorado.data.ErrorContentRequired") });
            }
            if (text.length) {
                var validator = $singleton(dorado.validator.LengthValidator);
                validator.set({ minLength: this._minLength, maxLength: this._maxLength });
                var results = validator.validate(text);
                if (results) {
                    validationResults = validationResults.concat(results);
                }
                if (this._validators) {
                    jQuery.each(this._validators, function(i, validator) {
                        results = validator.validate(text);
                        if (results) {
                            validationResults = validationResults.concat(results);
                        }
                    });
                }
            }
            return validationResults;
        },
        doRefreshData: function() {
            var p = this._property,
                e = this._entity;
            if (e instanceof dorado.Entity) {
                if (this._dataType) {
                    this.set("value", e.get(p));
                } else {
                    this.set("text", e.getText(p));
                }
            } else {
                this.set("value", e[p]);
            }
            this.setDirty(false);
        },
        doPost: function() {
            var p = this._property,
                e = this._entity;
            if (!p || !e) {
                return false;
            }
            if (this._dataSet) {
                var bindingInfo = this.getBindingInfo();
                if (this._mapping) {
                    e.set(p, this.get("value"));
                } else {
                    if (bindingInfo.propertyDef && bindingInfo.propertyDef._mapping) {
                        e.setText(p, this.get("value"));
                    } else {
                        if (bindingInfo.dataType) {
                            if (this._dataType == bindingInfo.dataType) {
                                e.set(p, this.get("value"));
                            } else {
                                e.setText(p, this.get("text"));
                            }
                        } else {
                            e.set(p, this.get("value"));
                        }
                    }
                }
            } else {
                if (e instanceof dorado.Entity) {
                    var v = this.get("value");
                    if (v instanceof dorado.Entity) {
                        e.set(p, v);
                    } else {
                        e.setText(p, this.get("text"));
                    }
                    this.setDirty(e.isDirty(p));
                } else {
                    e[p] = this.get("value");
                    this.setDirty(true);
                }
            }
            return true;
        },
        doOnFocus: function() {
            $invokeSuper.call(this);
            if (this._selectTextOnFocus && this._realEditable) {
                if (this.get("focused") && this._editorFocused) {
                    try {
                        this._textDom.select();
                    } catch (e) {}
                }
            }
        }
    });
    dorado.widget.TextEditor = $extend(dorado.widget.AbstractTextEditor, {
        $className: "dorado.widget.TextEditor",
        ATTRIBUTES: {
            width: { defaultValue: 150 },
            height: { independent: true, readOnly: true },
            mapping: {
                setter: function(mapping) {
                    this._mapping = mapping;
                    if (mapping && mapping.length > 0) {
                        var index = this._mappingIndex = {};
                        for (var i = 0; i < mapping.length; i++) {
                            var key = mapping[i].key;
                            if (key == null) {
                                key = "${null}";
                            } else {
                                if (key === "") {
                                    key = "${empty}";
                                }
                            }
                            index[key + ""] = mapping[i].value || null;
                        }
                    } else {
                        delete this._mappingIndex;
                    }
                    delete this._mappingRevIndex;
                }
            },
            value: {
                skipRefresh: true,
                getter: function() {
                    var text = (this._editorFocused) ? this.doGetText() : this._text;
                    if (this._value !== undefined && text === this._valueText) {
                        return this._value;
                    } else {
                        if (text && this._mapping) {
                            text = this.getMappedKey(text);
                        }
                        if (text === undefined) {
                            text = null;
                        }
                        var dataType = this.get("dataType");
                        if (dataType) {
                            try {
                                var value = this._value = dataType.parse(text, this._editorFocused ? this._typeFormat : this._displayFormat);
                                this._valueText = text;
                                return value;
                            } catch (e) {
                                dorado.Exception.removeException(e);
                                return null;
                            }
                        } else {
                            return text;
                        }
                    }
                },
                setter: function(value) {
                    this._value = value;
                    var valueText, text;
                    var dataType = this.get("dataType");
                    if (dataType) {
                        text = dataType.toText(value, this._editorFocused ? this._typeFormat : this._displayFormat);
                        valueText = (this._editorFocused) ? text : dataType.toText(value, this._typeFormat);
                    } else {
                        valueText = text = dorado.$String.toText(value);
                    }
                    if (text && this._mapping) {
                        text = this.getMappedValue(text);
                    }
                    this._skipValidateEmpty = true;
                    this.validate(valueText);
                    this._valueText = valueText;
                    this._text = this._lastObserve = text;
                    this.doSetText(text);
                    this.setValidationState(null);
                }
            },
            text: {
                skipRefresh: true,
                getter: function() {
                    return ((!this.get("dataType") || this._editorFocused) ? this.doGetText() : this._text) || "";
                },
                setter: function(text) {
                    var t = text;
                    var dataType = this.get("dataType");
                    if (dataType) {
                        try {
                            if (!this._editorFocused) {
                                var value = dataType.parse(t, this._typeFormat);
                                t = dataType.toText(value, this._displayFormat);
                            }
                        } catch (e) {}
                    }
                    this.validate(t);
                    this._text = text;
                    if (!this._editorFocused) {
                        this._lastObserve = text;
                    }
                    this.doSetText(t);
                    this.setValidationState(null);
                }
            },
            dataType: {
                getter: function() {
                    var dataType;
                    if (this._dataType) {
                        dataType = dorado.LazyLoadDataType.dataTypeGetter.call(this);
                    } else {
                        if (this._property && this._dataSet) {
                            var bindingInfo = this._bindingInfo || this.getBindingInfo();
                            if (bindingInfo && !(bindingInfo.propertyDef && bindingInfo.propertyDef._mapping)) {
                                dataType = bindingInfo.dataType;
                            }
                        }
                    }
                    return dataType;
                }
            },
            password: {},
            displayFormat: {},
            typeFormat: { skipRefresh: true },
            modified: {
                getter: function() {
                    return (this._editorFocused) ? (this._lastPost == this.doGetText()) : false;
                }
            },
            trigger: {
                getter: function(p, v) {
                    var trigger = this._trigger;
                    if (trigger === undefined && this._view) {
                        var dataType = this.get("dataType"),
                            dtCode = dataType ? dataType._code : 0;
                        if (dtCode == dorado.DataType.DATE) {
                            trigger = this._view.id("defaultDateDropDown");
                        } else {
                            if (dtCode == dorado.DataType.DATETIME) {
                                trigger = this._view.id("defaultDateTimeDropDown");
                            }
                        }
                    }
                    return trigger;
                }
            }
        },
        createTextDom: function() {
            var textDom = document.createElement("INPUT");
            textDom.className = "editor";
            if (this._password) {
                textDom.type = "password";
            } else {
                var dataType = this.get("dataType");
                if (dataType && dataType.code >= dorado.DataType.PRIMITIVE_INT && dataType.code <= dorado.DataType.FLOAT) {
                    textDom.type = "number";
                }
            }
            if (dorado.Browser.msie && dorado.Browser.version > 7) {
                textDom.style.top = 0;
                textDom.style.position = "absolute";
            } else {
                textDom.style.padding = 0;
            }
            if (dorado.Browser.isTouch) {
                textDom.setAttribute("form", dorado.widget.editor.GET_DEAMON_FORM().id);
            }
            return textDom;
        },
        doValidate: function(text) {
            var validationResults = [];
            try {
                if (text.length) {
                    if (this._mapping && this.getMappedKey(text) === undefined) {
                        validationResults.push({ state: "error", text: $resource("dorado.form.InputTextOutOfMapping") });
                    }
                }
                var dataType = this.get("dataType");
                if (dataType) {
                    dataType.parse(text, this._typeFormat);
                }
                validationResults = $invokeSuper.call(this, arguments);
            } catch (e) {
                dorado.Exception.removeException(e);
                validationResults = [{ state: "error", text: dorado.Exception.getExceptionMessage(e) }];
            }
            return validationResults;
        },
        getMappedValue: function(key) {
            if (key == null) {
                key = "${null}";
            } else {
                if (key === "") {
                    key = "${empty}";
                }
            }
            return this._mappingIndex ? this._mappingIndex[key + ""] : undefined;
        },
        getMappedKey: function(value) {
            if (!this._mappingRevIndex) {
                var index = this._mappingRevIndex = {},
                    mapping = this._mapping;
                for (var i = 0; i < mapping.length; i++) {
                    var v = mapping[i].value;
                    if (v == null) {
                        v = "${null}";
                    } else {
                        if (v === "") {
                            v = "${empty}";
                        }
                    }
                    index[v + ""] = mapping[i].key;
                }
            }
            if (value == null) {
                value = "${null}";
            } else {
                if (value === "") {
                    value = "${empty}";
                }
            }
            return this._mappingRevIndex[value + ""];
        },
        doOnFocus: function() {
            var maxLength = this._maxLength || 0;
            if (!this._realReadOnly && !this._mapping) {
                var dataType = this.get("dataType");
                if (dataType) {
                    if (this._validationState != "error") {
                        var text = dataType.toText(this.get("value"), this._typeFormat);
                        this.doSetText(text);
                    }
                    var dCode = dataType._code;
                    if (dCode == dorado.DataType.PRIMITIVE_CHAR || dCode == dorado.DataType.CHARACTER) {
                        maxLength = 1;
                    }
                }
            }
            if (maxLength) {
                this._textDom.setAttribute("maxLength", maxLength);
            } else {
                this._textDom.removeAttribute("maxLength");
            }
            $invokeSuper.call(this);
        },
        doOnBlur: function() {
            if (this._realReadOnly) {
                $invokeSuper.call(this);
            } else {
                this._text = this.doGetText();
                try {
                    $invokeSuper.call(this);
                } finally {
                    var text, dataType = this.get("dataType");
                    if (dataType && !this._mapping && this._validationState != "error") {
                        text = dataType.toText(this.get("value"), this._displayFormat);
                    } else {
                        text = this._text;
                    }
                    this.doSetText(text);
                }
            }
        },
        doOnKeyPress: function(evt) {
            var dataType = this.get("dataType");
            if (!dataType) {
                return true;
            }
            var k = (evt.keyCode || evt.which);
            if (dorado.Browser.mozilla) {
                if ([8, 37, 38, 39, 40].indexOf(k) >= 0) {
                    return true;
                }
            }
            var b = true,
                $d = dorado.DataType;
            switch (dataType._code) {
                case $d.INTEGER:
                case $d.PRIMITIVE_INT:
                    b = (k == 44 || k == 45 || (k >= 48 && k <= 57));
                    break;
                case $d.FLOAT:
                case $d.PRIMITIVE_FLOAT:
                    b = (k == 44 || k == 45 || k == 46 || (k >= 48 && k <= 57));
                    break;
            }
            return b;
        }
    });
    dorado.widget.PasswordEditor = $extend(dorado.widget.AbstractTextEditor, {
        $className: "dorado.widget.PasswordEditor",
        ATTRIBUTES: { width: { defaultValue: 150 }, height: { independent: true, readOnly: true } },
        createTextDom: function() {
            var textDom = document.createElement("INPUT");
            textDom.className = "editor";
            textDom.type = "password";
            if (dorado.Browser.msie && dorado.Browser.version > 7) {
                textDom.style.top = 0;
                textDom.style.position = "absolute";
            } else {
                textDom.style.padding = 0;
            }
            return textDom;
        },
        doOnFocus: function() {
            var maxLength = this._maxLength || 0;
            if (maxLength) {
                this._textDom.setAttribute("maxLength", maxLength);
            } else {
                this._textDom.removeAttribute("maxLength");
            }
            $invokeSuper.call(this);
        }
    });
})();
(function() {
    dorado.widget.TextArea = $extend(dorado.widget.AbstractTextEditor, {
        $className: "dorado.widget.TextArea",
        ATTRIBUTES: { width: { independent: false, defaultValue: 150 }, height: { independent: false, defaultValue: 60 }, className: { defaultValue: "d-text-area" }, selectTextOnFocus: { defaultValue: false } },
        createDom: function() {
            var doms = this._doms = {};
            var dom = $DomUtils.xCreate({ tagName: "DIV", style: { position: "relative", whiteSpace: "nowrap", overflow: "hidden" }, content: { tagName: "DIV", contextKey: "textDomWrapper", style: { width: "100%", height: "100%" }, content: { tagName: "TEXTAREA", contextKey: "textDom", className: "textarea", style: { width: "100%", height: "100%" } } } }, null, doms);
            this._textDomWrapper = doms.textDomWrapper;
            this._textDom = doms.textDom;
            var self = this;
            jQuery(dom).addClassOnHover(this._className + "-hover", null, function() {
                return !self._realReadOnly;
            }).mousedown(function(evt) {
                evt.stopPropagation();
            });
            if (this._text) {
                this.doSetText(this._text);
            }
            if (!dorado.Browser.isTouch) {
                this._modernScroller = $DomUtils.modernScroll(this._textDom, { listenContentSize: true });
            }
            if (dorado.Browser.msie && dorado.Browser.version < 8) {
                this.doOnAttachToDocument = this.doOnResize;
            }
            return dom;
        },
        doOnAttachToDocument: function() {
            $invokeSuper.call(this, arguments);
            var textarea = this;
            if (dorado.Browser.isTouch) {
                if (dorado.Browser.android && dorado.Browser.chrome) {
                    $fly(textarea._textDom).css("overflow", "hidden");
                }
                textarea._modernScroller = $DomUtils.modernScroll(textarea._textDom.parentNode, {
                    updateBeforeScroll: true,
                    scrollSize: function(dir, container, content) {
                        return dir == "h" ? content.scrollWidth : content.scrollHeight;
                    },
                    render: function(left, top) {
                        if (this.content && !this._renderScrollAttr) {
                            this.content.scrollTop = top;
                            this.content.scrollLeft = left;
                        }
                    },
                    autoHide: false,
                    bouncing: false
                });
                $fly(textarea._textDom).bind("scroll", function() {
                    textarea._modernScroller._renderScrollAttr = true;
                    textarea._modernScroller.update();
                    textarea._modernScroller.scrollTo(this.scrollLeft, this.scrollTop, false);
                    textarea._modernScroller._renderScrollAttr = false;
                }).bind("focus", function() {
                    textarea._modernScroller.showScrollbar();
                }).bind("blur", function() {
                    textarea._modernScroller.hideScrollbar();
                });
            }
        },
        refreshTriggerDoms: function() {
            var triggerButtons = this._triggerButtons,
                triggerButton, triggerPanel = this._triggerPanel;
            if (triggerButtons && triggerPanel) {
                for (var i = 0; i < triggerButtons.length; i++) {
                    triggerButton = triggerButtons[i];
                    triggerButton.destroy();
                }
            }
            var triggers = this.get("trigger");
            if (triggers) {
                if (!triggerPanel) {
                    triggerPanel = this._triggerPanel = $create("DIV");
                    triggerPanel.className = "d-trigger-panel";
                    this._dom.appendChild(triggerPanel);
                }
                triggerPanel.style.display = "";
                if (!(triggers instanceof Array)) {
                    triggers = [triggers];
                }
                var trigger;
                this._triggerButtons = triggerButtons = [];
                for (var i = 0; i < triggers.length; i++) {
                    trigger = triggers[i];
                    triggerButton = trigger.createTriggerButton(this);
                    triggerButtons.push(triggerButton);
                    this.registerInnerControl(triggerButton);
                    triggerButton.render(triggerPanel);
                }
                this._triggersArranged = false;
                this.doOnResize = this.resizeTextDom;
                this.resizeTextDom();
            } else {
                if (triggerPanel) {
                    triggerPanel.style.display = "none";
                }
                if (dorado.Browser.msie && dorado.Browser.version < 9) {
                    this.doOnResize = this.resizeTextDom;
                    this.resizeTextDom();
                } else {
                    this._textDomWrapper.style.width = "100%";
                    delete this.doOnResize;
                }
            }
        },
        resizeTextDom: function() {
            if (!this._attached || !this.isActualVisible()) {
                return;
            }
            var w = this._dom.clientWidth,
                h = this._dom.clientHeight;
            if (this._triggerPanel) {
                w -= this._triggerPanel.offsetWidth;
            }
            this._textDomWrapper.style.width = (w < 0 ? 0 : w) + "px";
            this._textDomWrapper.style.height = h + "px";
            if (dorado.Browser.msie && dorado.Browser.version < 8) {
                this._textDom.style.height = h + "px";
            }
        },
        doOnKeyDown: function(evt) {
            if (evt.ctrlKey) {
                return true;
            }
            if (evt.keyCode == 13) {
                return;
            }
            return $invokeSuper.call(this, arguments);
        },
        doOnFocus: function() {
            if (this._useBlankText) {
                this.doSetText("");
            }
            var maxLength = this._maxLength || 0;
            if (maxLength) {
                this._textDom.setAttribute("maxLength", maxLength);
            } else {
                this._textDom.removeAttribute("maxLength");
            }
            $invokeSuper.call(this, arguments);
        },
        doOnBlur: function() {
            if (this._realReadOnly) {
                return;
            }
            try {
                $invokeSuper.call(this, arguments);
            } finally {
                this.doSetText(this.doGetText());
            }
        }
    });
})();
dorado.widget.Trigger = $extend(dorado.widget.Component, {
    $className: "dorado.widget.Trigger",
    ATTRIBUTES: {
        className: { defaultValue: "d-trigger", writeBeforeReady: true },
        exClassName: {
            skipRefresh: true,
            setter: function(v) {
                if (this._rendered && this._exClassName) {
                    $fly(this.getDom()).removeClass(this._exClassName);
                }
                this._exClassName = v;
                if (this._rendered && v) {
                    $fly(this.getDom()).addClass(v);
                }
            }
        },
        icon: { writeBeforeReady: true },
        iconClass: { writeBeforeReady: true, defaultValue: "d-trigger-icon-custom" },
        editable: { defaultValue: true },
        buttonVisible: { defaultValue: true }
    },
    EVENTS: { beforeExecute: {}, onExecute: {} },
    createTriggerButton: function(editor) {
        var trigger = this;
        if (!trigger._buttonVisible) {
            return;
        }
        var control = new dorado.widget.SimpleIconButton({
            exClassName: (trigger._className || "") + " " + (trigger._exClassName || ""),
            icon: trigger._icon,
            iconClass: (trigger._icon ? null : trigger._iconClass),
            onMouseDown: function(self, arg) {
                dorado.widget.setFocusedControl(self);
                arg.returnValue = false;
            },
            onClick: function(self, arg) {
                editor.onTriggerClick(trigger);
                arg.returnValue = false;
            }
        });
        jQuery(control.getDom()).addClassOnClick("d-trigger-down", null, function() {
            return !editor.get("readOnly");
        });
        return control;
    },
    execute: function(editor) {
        this.fireEvent("onExecute", this, { editor: editor });
    }
});
dorado.widget.View.registerDefaultComponent("triggerClear", function() {
    return new dorado.widget.Trigger({
        exClassName: "d-trigger-clear",
        iconClass: "d-trigger-icon-clear",
        onExecute: function(self, arg) {
            arg.editor.set("text", "");
            arg.editor.post();
        }
    });
});
dorado.widget.DropDown = $extend(dorado.widget.Trigger, {
    $className: "dorado.widget.DropDown",
    focusable: true,
    ATTRIBUTES: {
        iconClass: { defaultValue: "d-trigger-icon-drop" },
        width: {},
        minWidth: { defaultValue: 20 },
        maxWidth: {},
        height: {},
        minHeight: { defaultValue: 10 },
        maxHeight: { defaultValue: 400 },
        autoOpen: {},
        postValueOnSelect: { defaultValue: true },
        assignmentMap: {},
        opened: {
            readOnly: true,
            getter: function() {
                return !!this._box;
            }
        },
        editor: { readOnly: true },
        box: { readOnly: true }
    },
    EVENTS: { onOpen: {}, onClose: {}, onValueSelect: {} },
    createDropDownBox: function() {
        return new dorado.widget.DropDownBox();
    },
    initDropDownBox: dorado._NULL_FUNCTION,
    onEditorMouseDown: function(editor) {
        if (this._autoOpen && !editor._realReadOnly && !this.get("opened")) {
            $setTimeout(this, function() {
                this._skipEditorOnFocusProcedure = true;
                this.execute(editor);
            }, 100);
        }
    },
    onEditorFocus: function(editor) {
        if (this._autoOpen && !editor._realReadOnly && !this._skipEditorOnFocusProcedure) {
            $setTimeout(this, function() {
                this.execute(editor);
            }, 50);
        }
        delete this._skipEditorOnFocusProcedure;
    },
    onEditorKeyDown: function(editor, evt) {
        dorado.widget.disableKeyBubble = this._editor;
        try {
            return this.doOnEditorKeyDown ? this.doOnEditorKeyDown(editor, evt) : true;
        } finally {
            dorado.widget.disableKeyBubble = null;
        }
    },
    doOnEditorKeyDown: function(editor, evt) {
        var retValue = true;
        if (this.get("opened")) {
            switch (evt.keyCode) {
                case 27:
                    this.close();
                    retValue = false;
                    break;
            }
        }
        return retValue;
    },
    execute: function(editor) {
        if (this._skipExecute) {
            return;
        }
        this._skipExecute = true;
        $setTimeout(this, function() {
            delete this._skipExecute;
        }, 300);
        if (this.get("opened")) {
            this.close();
            var triggerButton = editor.getTriggerButton(this);
            if (triggerButton) {
                $fly(triggerButton.getDom()).removeClass("d-opened");
            }
        } else {
            var arg = { editor: editor, processDefault: true };
            this.fireEvent("beforeExecute", this, arg);
            if (!arg.processDefault) {
                return;
            }
            this.open(editor);
        }
        $invokeSuper.call(this, arguments);
    },
    open: function(editor) {
        function getBoxCache(win) {
            var boxCache;
            try {
                if (win.dorado) {
                    boxCache = win.dorado._DROPDOWN_BOX_CACHE;
                    if (!boxCache) {
                        win.dorado._DROPDOWN_BOX_CACHE = boxCache = {};
                    }
                }
            } catch (e) {}
            return boxCache;
        }
        if (this._box) {
            this._box.hide();
        }
        this._editor = editor;
        this.fireEvent("onOpen", this, { editor: editor });
        var dropdown = this,
            editorDom = editor.getDom();
        var win = $DomUtils.getOwnerWindow(editorDom) || window;
        var boxCache = getBoxCache(win);
        var box = boxCache ? boxCache[dorado.id + "$" + dropdown._uniqueId] : null;
        if (!box) {
            box = dropdown.createDropDownBox();
            box.set({
                onDropDownBoxShow: function() {
                    if (dropdown.onDropDownBoxShow) {
                        dropdown.onDropDownBoxShow();
                    }
                }
            });
            (dropdown._view || $topView).registerInnerControl(box);
            box.render(box._renderTo || win.document.body);
            var boxDom = box.getDom(),
                containerDom = box.get("containerDom");
            box._edgeWidth = boxDom.offsetWidth - containerDom.offsetWidth;
            box._edgeHeight = boxDom.offsetHeight - containerDom.offsetHeight;
            if (boxCache) {
                boxCache[dorado.id + "$" + dropdown._uniqueId] = box;
            }
        }
        box._dropDown = dropdown;
        box._editor = editor;
        dropdown._box = box;
        editor.bind("onBlur._closeDropDown", function() {
            dropdown.close();
        }, { once: true });
        dropdown._duringShowAnimation = true;
        box.bind("afterShow", function() {
            dropdown._duringShowAnimation = false;
            if (dropdown.shouldAutoRelocate()) {
                dropdown._relocateTimeId = setInterval(function() {
                    var editorDom = dropdown._editor && dropdown._editor.getDom();
                    if (editorDom) {
                        var offset = $fly(editorDom).offset();
                        if (offset.left != dropdown._currentEditorOffsetLeft || offset.top != dropdown._currentEditorOffsetTop || editorDom.offsetWidth != dropdown._currentEditorOffsetWidth || editorDom.offsetHeight != dropdown._currentEditorOffsetHeight) {
                            dropdown.locate();
                        }
                    }
                }, 300);
                dropdown._relocateListener = function() {
                    dropdown.locate();
                };
                $fly(window).bind("resize", dropdown._relocateListener);
            }
            if (dropdown._shouldRelocate) {
                dropdown.locate();
            }
        });
        dropdown.locate();
        var triggerButton = editor.getTriggerButton(dropdown);
        if (triggerButton) {
            $fly(triggerButton.getDom()).addClass("d-opened");
        }
    },
    shouldAutoRelocate: function() {
        return true;
    },
    locate: function() {
        if (!this._box || !this._editor) {
            return;
        }
        this.doLocate();
    },
    getDefaultWidth: function(editor) {
        return $fly(editor.getDom()).outerWidth();
    },
    doLocate: function() {
        var dropdown = this,
            box = dropdown._box,
            editor = dropdown._editor;
        var editorDom = editor.getDom(),
            boxDom = box.getDom(),
            boxContainer = boxDom.parentNode;
        var $boxDom = $fly(boxDom);
        var boxContainerHeight = boxContainer.clientHeight,
            realMaxHeight = boxContainerHeight;
        var currentEditorOffset = $fly(editorDom).offset();
        dropdown._currentEditorOffsetLeft = currentEditorOffset.left;
        dropdown._currentEditorOffsetTop = currentEditorOffset.top;
        dropdown._currentEditorOffsetWidth = editorDom.offsetWidth;
        dropdown._currentEditorOffsetHeight = editorDom.offsetHeight;
        dropdown._boxVisible = box.get("visible");
        var offsetTargetTop = dropdown._currentEditorOffsetTop;
        var offsetTargetBottom = boxContainerHeight - offsetTargetTop - dropdown._currentEditorOffsetHeight;
        var align = "innerLeft",
            vAlign = "bottom";
        if (offsetTargetTop > offsetTargetBottom) {
            vAlign = "top";
            realMaxHeight = offsetTargetTop;
        } else {
            realMaxHeight = offsetTargetBottom;
        }
        dropdown._realMaxWidth = dropdown._maxWidth - (box.widthAdjust || 0);
        dropdown._realMaxHeight = ((realMaxHeight < dropdown._maxHeight) ? realMaxHeight : dropdown._maxHeight) - (box.heightAdjust || 0);
        var boxWidth = dropdown._width || dropdown.getDefaultWidth(editor);
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
        if (!dropdown._boxVisible) {
            boxDom.style.visibility = "hidden";
            boxDom.style.display = "";
        }
        box.set({ width: boxWidth, height: boxHeight });
        if (!dropdown._boxVisible) {
            box._visible = true;
            box.setActualVisible(true);
        } else {
            box.refresh();
        }
        var containerDom = box.get("containerDom");
        dropdown._edgeWidth = boxDom.offsetWidth - containerDom.offsetWidth;
        dropdown._edgeHeight = boxDom.offsetHeight - containerDom.offsetHeight;
        var currentBoxWidth = boxWidth,
            currentBoxHeight = boxHeight;
        dropdown.initDropDownBox(box, editor);
        if (!dropdown._boxVisible) {
            box._visible = false;
            box.setActualVisible(false);
        }
        var control = box.get("control"),
            controlDom = control ? control.getDom() : containerDom.firstChild;
        if (!dropdown._width) {
            if (controlDom) {
                boxWidth = controlDom.offsetWidth + dropdown._edgeWidth;
            }
            if (boxWidth > dropdown._realMaxWidth) {
                boxWidth = dropdown._realMaxWidth;
            }
            if (boxWidth < dropdown._minWidth) {
                boxWidth = dropdown._minWidth;
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
        if (dropdown._currentEditorOffsetWidth > boxWidth) {
            align = "innerRight";
        }
        if (vAlign == "top" && boxHeight < offsetTargetBottom) {
            vAlign = "bottom";
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
            } else {
                box.set(config).refresh();
            }
        }
        var widthOverflow = boxDom.parentNode.clientWidth - ($fly(editorDom).offset().left + boxWidth);
        if (widthOverflow > 0) {
            widthOverflow = 0;
        }
        if (dropdown._boxVisible) {
            $DomUtils.dockAround(boxDom, editorDom, { align: align, offsetLeft: widthOverflow, vAlign: vAlign, autoAdjustPosition: false });
        } else {
            boxDom.style.visibility = "hidden";
            boxDom.style.display = "none";
            box.show({ animateType: (boxHeight > 10) ? undefined : "none", anchorTarget: editor, editor: editor, align: align, offsetLeft: widthOverflow, vAlign: vAlign, autoAdjustPosition: false });
        }
    },
    close: function(selectedValue) {
        var dropdown = this;
        clearInterval(dropdown._relocateTimeId);
        $fly(window).unbind("resize", dropdown._relocateListener);
        var editor = dropdown._editor;
        var eventArg = { editor: editor, selectedValue: selectedValue, processDefault: true };
        dropdown.fireEvent("onClose", dropdown, eventArg);
        var triggerButton = editor.getTriggerButton(dropdown);
        if (triggerButton) {
            $fly(triggerButton.getDom()).removeClass("d-opened");
        }
        var box = dropdown._box;
        if (!box) {
            return;
        }
        var entityForAssignment;
        if (dropdown.getEntityForAssignment) {
            entityForAssignment = dropdown.getEntityForAssignment();
        }
        dropdown._box = null;
        dropdown._editor = null;
        editor.unbind("onBlur._closeDropDown");
        box.hide();
        if (eventArg.selectedValue !== undefined) {
            dropdown.fireEvent("onValueSelect", dropdown, eventArg);
            if (eventArg.processDefault && eventArg.selectedValue !== undefined) {
                dropdown.assignValue(editor, entityForAssignment, eventArg);
            }
        }
        var editorDom = editor.getDom();
        var win = $DomUtils.getOwnerWindow(editorDom) || window;
        win._doradoCurrentDropDown = null;
    },
    assignValue: function(editor, entityForAssignment, eventArg) {
        selectedValue = eventArg.selectedValue;
        entityForAssignment = entityForAssignment || selectedValue;
        var shouldPostEditor = true;
        var targetEntity = (editor._entity || editor._cellEditor && editor._cellEditor.data);
        if (this._assignmentMap && entityForAssignment && entityForAssignment instanceof Object && targetEntity && targetEntity instanceof Object) {
            var assignmentMap = this._assignmentMap,
                maps = [];
            assignmentMap = assignmentMap.replace(/,/g, ";").split(";");
            for (var i = 0; i < assignmentMap.length; i++) {
                var map = assignmentMap[i],
                    index = map.indexOf("=");
                if (index >= 0) {
                    maps.push({ writeProperty: map.substring(0, index), readProperty: map.substring(index + 1) });
                } else {
                    maps.push({ writeProperty: map, readProperty: map });
                }
            }
            for (var i = 0; i < maps.length; i++) {
                var map = maps[i],
                    value;
                if (map.readProperty == "$this") {
                    value = entityForAssignment;
                } else {
                    value = (entityForAssignment instanceof dorado.Entity) ? entityForAssignment.get(map.readProperty) : entityForAssignment[map.readProperty];
                }
                if (value instanceof dorado.Entity) {
                    if (value.isEmptyItem) {
                        value = null;
                    } else {
                        value = dorado.Core.clone(value);
                    }
                }
                if (targetEntity instanceof dorado.Entity) {
                    targetEntity.set(map.writeProperty, value);
                } else {
                    targetEntity[map.writeProperty] = value;
                }
            }
            var shouldSetEditor = true;
            if (editor._property && editor._dataSet) {
                for (var i = 0; i < maps.length; i++) {
                    if (maps[i].writeProperty == editor._property) {
                        shouldSetEditor = false;
                        shouldPostEditor = false;
                        break;
                    }
                }
            }
            if (shouldSetEditor) {
                editor.set("value", selectedValue);
            }
        } else {
            if (selectedValue instanceof dorado.Entity || selectedValue instanceof dorado.EntityList) {
                selectedValue = dorado.Core.clone(selectedValue);
            }
            editor.set("value", selectedValue);
        }
        if (shouldPostEditor && this._postValueOnSelect) {
            editor.post();
        }
    }
});
dorado.widget.DropDown.findDropDown = function(control) {
    var box = control.findParent(dorado.widget.DropDownBox);
    return box ? box.get("dropDown") : null;
};
(function() {
    var DEFAULT_OK_MESSAGES = [{ state: "ok" }];
    var DEFAULT_VALIDATING_MESSAGES = [{ state: "validating" }];
    dorado.widget.DataMessage = $extend([dorado.widget.Control, dorado.widget.PropertyDataControl], {
        $className: "dorado.widget.DataMessage",
        ATTRIBUTES: {
            className: { defaultValue: "d-data-message" },
            showIconOnly: { writeBeforeReady: true },
            showMultiMessage: { writeBeforeReady: true },
            messages: {
                setter: function(messages) {
                    this._messages = dorado.Toolkits.trimMessages(messages, "info");
                }
            }
        },
        processDataSetMessage: function(messageCode, arg, data) {
            switch (messageCode) {
                case dorado.widget.DataSet.MESSAGE_REFRESH:
                case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
                case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
                case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
                    this._messages = null;
                    this.refresh(true);
                    break;
            }
        },
        createMessageDom: function() {
            return $DomUtils.xCreate({ tagName: "DIV", content: [{ tagName: "DIV", content: { tagName: "DIV", className: "spinner" } }, { tagName: "DIV", className: "text" }] });
        },
        refreshSingleMessageDom: function(dom, message) {
            var state, text;
            if (message) {
                state = message.state;
                text = message.text;
            }
            dom.className = "d-message d-message-" + (state || "none");
            var iconDom = dom.firstChild,
                textDom = dom.lastChild;
            iconDom.className = "icon icon-" + (state || "none");
            if (!this._showIconOnly) {
                textDom.innerText = text || "";
                textDom.style.display = "";
            } else {
                textDom.style.display = "none";
                if (dorado.TipManager) {
                    if (text) {
                        dorado.TipManager.initTip(dom, { text: text });
                    } else {
                        dorado.TipManager.deleteTip(dom);
                    }
                }
            }
        },
        refreshDom: function(dom) {
            $invokeSuper.call(this, arguments);
            var entity, messages = this._messages;
            if (!messages && this._dataSet) {
                var entity = this.getBindingData();
                if (entity instanceof dorado.Entity) {
                    messages = entity.getMessages(this._property);
                } else {
                    entity = null;
                }
                if (entity && this._property) {
                    var state = entity.getValidateState(this._property);
                    if (state == "validating") {
                        messages = DEFAULT_VALIDATING_MESSAGES;
                    } else {
                        if (!messages || messages.length == 0) {
                            if (state == "ok") {
                                messages = DEFAULT_OK_MESSAGES;
                            } else {
                                var propertyDef = this.getBindingPropertyDef();
                                if (propertyDef && propertyDef._description) {
                                    messages = [{ state: "info", text: propertyDef._description }];
                                }
                            }
                        }
                    }
                }
            }
            if (!this._showMultiMessage) {
                var message = dorado.Toolkits.getTopMessage(messages);
                var messageDom = dom.firstChild;
                if (!messageDom) {
                    messageDom = this.createMessageDom();
                    dom.appendChild(messageDom);
                }
                this.refreshSingleMessageDom(messageDom, message);
            } else {}
        }
    });
})();
(function() {
    var specialFormConfigProps = ["view", "tags", "formProfile", "width", "height", "className", "exClassName", "visible", "hideMode", "layoutConstraint", "readOnly", "style"];
    var DEFAULT_OK_MESSAGES = [{ state: "ok" }];
    dorado.widget.FormConfig = $class({ $className: "dorado.widget.FormConfig", ATTRIBUTES: { width: {}, height: {}, className: {}, exClassName: {}, ui: {}, editorType: { writeBeforeReady: true }, entity: {}, dataSet: { componentReference: true }, dataPath: { writeBeforeReady: true }, labelSeparator: {}, showLabel: { defaultValue: true, writeBeforeReady: true }, labelWidth: { defaultValue: 80, writeBeforeReady: true }, labelSpacing: { defaultValue: 3, writeBeforeReady: true }, labelPosition: { writeBeforeReady: true }, labelAlign: { writeBeforeReady: true }, editorWidth: { writeBeforeReady: true }, showHint: { writeBeforeReady: true, defaultValue: true }, hintWidth: { defaultValue: 22, writeBeforeReady: true }, hintSpacing: { defaultValue: 3, writeBeforeReady: true }, showHintMessage: { writeBeforeReady: true }, hintPosition: { writeBeforeReady: true }, hintControl: { readOnly: true }, readOnly: {} } });
    dorado.widget.FormProfileSupport = $class({
        onProfileChange: function() {
            var formProfile = this._formProfile;
            if (dorado.Object.isInstanceOf(formProfile, dorado.widget.FormProfile)) {
                var readOnly = formProfile.get("readOnly");
                if (this._realReadOnly != readOnly) {
                    this._realReadOnly = readOnly;
                }
                this.set(formProfile.getConfig(), { skipUnknownAttribute: true, tryNextOnError: true, preventOverwriting: true, lockWritingTimes: (this instanceof dorado.widget.FormElement) });
            }
        }
    });
    dorado.widget.FormProfile = $extend([dorado.widget.Component, dorado.widget.FormConfig], {
        $className: "dorado.widget.FormProfile",
        ATTRIBUTES: {
            entity: {
                defaultValue: function() {
                    return new dorado.widget.FormProfile.DefaultEntity();
                }
            }
        },
        constructor: function() {
            this._bindingElements = new dorado.ObjectGroup();
            $invokeSuper.call(this, arguments);
            this.bind("onAttributeChange", function(self, arg) {
                var attr = arg.attribute;
                if (!dorado.widget.Control.prototype.ATTRIBUTES[attr] && dorado.widget.FormConfig.prototype.ATTRIBUTES[attr]) {
                    if (self._config) {
                        delete self._config;
                    }
                    dorado.Toolkits.setDelayedAction(self, "$profileChangeTimerId", function() {
                        self._bindingElements.invoke("onProfileChange");
                    }, 20);
                }
            });
        },
        addBindingElement: function(element) {
            this._bindingElements.objects.push(element);
        },
        removeBindingElement: function(element) {
            this._bindingElements.objects.push(element);
        },
        getConfig: function() {
            if (this._config) {
                return this._config;
            }
            var formProfile = this;
            var attrs = formProfile.ATTRIBUTES,
                attrWatcher = formProfile.getAttributeWatcher(),
                config = formProfile._config = {};
            for (var attr in attrs) {
                if (!attrs.hasOwnProperty(attr)) {
                    continue;
                }
                var def = attrs[attr];
                if (def.readOnly || def.writeOnly || (!attrWatcher.getWritingTimes(attr) && typeof def.defaultValue != "function")) {
                    continue;
                }
                if (specialFormConfigProps.indexOf(attr) >= 0 && formProfile instanceof dorado.widget.Control) {
                    continue;
                }
                var value = formProfile.get(attr);
                if (def.componentReference && !(value instanceof dorado.widget.Component)) {
                    continue;
                }
                if (value !== undefined) {
                    config[attr] = value;
                }
            }
            if (config.dataSet) {
                delete config.entity;
            }
            return config;
        }
    });
    dorado.widget.FormProfile.DefaultEntity = $class({});
    dorado.widget.AbstractFormElement = $extend([dorado.widget.Control, dorado.widget.PropertyDataControl, dorado.widget.FormProfileSupport], {
        ATTRIBUTES: {
            formProfile: {
                componentReference: true,
                setter: function(formProfile) {
                    if (this._formProfile === formProfile) {
                        return;
                    }
                    if (dorado.Object.isInstanceOf(this._formProfile, dorado.widget.FormProfile)) {
                        this._formProfile.removeBindingElement(this);
                    }
                    if (formProfile && !dorado.Object.isInstanceOf(formProfile, dorado.widget.FormProfile)) {
                        var ref = formProfile;
                        formProfile = ref.view.id(ref.component);
                    }
                    this._formProfile = formProfile;
                    if (dorado.Object.isInstanceOf(formProfile, dorado.widget.FormProfile)) {
                        formProfile.addBindingElement(this);
                        this.onProfileChange();
                    }
                }
            },
            dataSet: {
                setter: function(dataSet, attr) {
                    dorado.widget.DataControl.prototype.ATTRIBUTES.dataSet.setter.call(this, dataSet, attr);
                    delete this._propertyDef;
                    this.resetBinding();
                }
            },
            dataPath: {
                setter: function(v) {
                    this._dataPath = v;
                    delete this._propertyDef;
                    this.resetBinding();
                }
            },
            property: {
                writeBeforeReady: true,
                setter: function(v) {
                    this._property = v;
                    delete this._propertyDef;
                    this.resetBinding();
                }
            },
            entity: {}
        },
        constructor: function(config) {
            var formProfile = config && config.formProfile;
            if (formProfile) {
                delete config.formProfile;
            }
            $invokeSuper.call(this, arguments);
            if (formProfile) {
                this.set("formProfile", formProfile);
            }
        },
        destroy: function() {
            if (this._destroyed) {
                return;
            }
            this.set("formProfile", null);
            $invokeSuper.call(this, arguments);
        }
    });
    dorado.widget.FormElement = $extend([dorado.widget.AbstractFormElement, dorado.widget.FormConfig], {
        $className: "dorado.widget.FormElement",
        ATTRIBUTES: {
            width: { defaultValue: 260, writeBeforeReady: true },
            height: { writeBeforeReady: true },
            className: { defaultValue: "d-form-element" },
            label: {},
            hint: {
                setter: function(hint) {
                    function trimSingleHint(hint) {
                        if (!hint) {
                            return null;
                        }
                        if (typeof hint == "string") {
                            hint = [{ state: "info", text: hint }];
                        } else {
                            hint.state = hint.state || "info";
                            hint = [hint];
                        }
                        return hint;
                    }

                    function trimHints(hint) {
                        if (!hint) {
                            return null;
                        }
                        if (hint instanceof Array) {
                            var array = [];
                            for (var i = 0; i < hint.length; i++) {
                                var h = trimSingleHint(hint[i]);
                                if (!h) {
                                    continue;
                                }
                                array.push(h);
                            }
                            hint = (array.length) ? array : null;
                        } else {
                            hint = trimSingleHint(hint);
                        }
                        return hint;
                    }
                    this._hint = trimHints(hint);
                    var hintControl = this.getHintControl(true);
                    if (hintControl) {
                        hintControl.set("messages", this._hint);
                    }
                }
            },
            editor: { writeBeforeReady: true, innerComponent: "TextEditor" },
            trigger: {},
            editable: { defaultValue: true },
            value: { path: "editor.value" },
            entity: {
                setter: function(entity) {
                    this._entity = entity;
                    if (this._rendered) {
                        var hintControl = this.getHintControl(false);
                        if (hintControl) {
                            hintControl.set("messages", null);
                        }
                    }
                }
            },
            readOnly: {
                skipRefresh: true,
                setter: function(v) {
                    this._readOnly = v;
                    this.resetEditorReadOnly();
                }
            }
        },
        createDom: function() {
            var attrWatcher = this.getAttributeWatcher();
            if (!this._formProfile && attrWatcher.getWritingTimes("formProfile") == 0) {
                var view = this.get("view") || dorado.widget.View.TOP;
                this.set("formProfile", view.id("defaultFormProfile"));
            }
            var config = [],
                content = [];
            if (this._showLabel) {
                var labelClass = " form-label-align-" + (this._labelAlign || "left");
                if (this._labelPosition == "top") {
                    config.push({ contextKey: "labelEl", tagName: "DIV", className: "form-label form-label-top" + labelClass });
                } else {
                    config.push({ contextKey: "labelEl", tagName: "DIV", className: "form-label form-label-left" + labelClass });
                }
            }
            if (this._labelPosition == "top") {
                var contentConfig = { contextKey: "contentEl", tagName: "DIV", className: "form-content form-content-bottom", content: content };
                config.push(contentConfig);
            } else {
                var contentConfig = { contextKey: "contentEl", tagName: "DIV", className: "form-content form-content-right", content: content };
                config.push(contentConfig);
            }
            if (this._hintPosition == "bottom") {
                content.push({ contextKey: "editorEl", tagName: "DIV", className: "form-editor form-editor-top" });
            } else {
                content.push({ contextKey: "editorEl", tagName: "DIV", className: "form-editor form-editor-left" });
            }
            if (this._showHint) {
                if (this._hintPosition == "bottom") {
                    content.push({ contextKey: "hintEl", tagName: "DIV", className: "form-hint form-hint-bottom" });
                } else {
                    content.push({ contextKey: "hintEl", tagName: "DIV", className: "form-hint form-hint-right" });
                }
            }
            var doms = {},
                dom = $DomUtils.xCreate({ tagName: "DIV", content: config }, null, doms);
            this._labelEl = doms.labelEl;
            this._contentEl = doms.contentEl;
            this._editorEl = doms.editorEl;
            this._hintEl = doms.hintEl;
            return dom;
        },
        setFocus: function() {
            var editor = this.getEditor(false);
            if (editor) {
                editor.setFocus();
            } else {
                $invokeSuper.call(this);
            }
        },
        createEditor: function(editorType) {
            var editor = dorado.Toolkits.createInstance("widget", editorType, function() {
                return dorado.Toolkits.getPrototype("widget", editorType) || dorado.widget.TextEditor;
            });
            return editor;
        },
        getEditor: function(create) {
            var control = this._editor;
            if (this._controlRegistered) {
                var config1 = {},
                    config2 = {},
                    attrs = control.ATTRIBUTES;
                this.initEditorConfig(config1);
                for (var attr in config1) {
                    if (!attrs[attr] || attrs[attr].writeOnly) {
                        continue;
                    }
                    if (config1[attr] != null) {
                        config2[attr] = config1[attr];
                    }
                }
                control.set(config2, { skipUnknownAttribute: true, tryNextOnError: true, preventOverwriting: true, lockWritingTimes: true });
                return control;
            }
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
                            this._trigger = new dorado.widget.AutoMappingDropDown({ items: propertyDef._mapping });
                        }
                    }
                }
                var originEditor = this._editor;
                this._editor = control = this.createEditor(this._editorType);
                if (originEditor != control) {
                    if (originEditor) {
                        this.unregisterInnerControl(originEditor);
                    }
                    if (control) {
                        this.registerInnerControl(control);
                    }
                }
            }
            if (control) {
                var config = {};
                this.initEditorConfig(config);
                control.set(config, { skipUnknownAttribute: true, tryNextOnError: true, preventOverwriting: true, lockWritingTimes: true });
                this._controlRegistered = true;
                if (this._showHint && control instanceof dorado.widget.AbstractEditor) {
                    if (control instanceof dorado.widget.AbstractTextBox) {
                        control.bind("onValidationStateChange", $scopify(this, this.onEditorStateChange));
                        control.bind("onPost", $scopify(this, this.onEditorPost));
                    }
                    control.bind("onPostFailed", $scopify(this, this.onEditorPostFailed));
                }
            }
            return control;
        },
        getHintControl: function(create) {
            var control = this._hintControl;
            if (!control && create) {
                var config = { width: this._hintWidth, showIconOnly: !this._showHintMessage, messages: this._hint };
                if (this._dataPath) {
                    config.dataPath = this._dataPath;
                }
                if (this._dataSet && this._property) {
                    config.dataSet = this._dataSet;
                    config.property = this._property;
                }
                this._hintControl = control = new dorado.widget.DataMessage(config);
            }
            if (control && !this._hintControlRegistered) {
                this._hintControlRegistered = true;
                this.registerInnerControl(control);
            }
            return control;
        },
        initEditorConfig: function(config) {
            if (this._trigger !== undefined) {
                config.trigger = this._trigger;
            }
            if (this._editable !== undefined) {
                config.editable = this._editable;
            }
            config.readOnly = this._readOnly || this._realReadOnly;
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
        },
        resetEditorReadOnly: function() {
            if (this._editor && this._editor instanceof dorado.widget.AbstractEditor) {
                this._editor.set("readOnly", this._readOnly || this._realReadOnly);
            }
        },
        onEditorStateChange: function(editor, arg) {
            var hintControl = this.getHintControl(false);
            if (hintControl) {
                hintControl.set("messages", editor.get("validationMessages"));
            }
        },
        onEditorPost: function(editor, arg) {
            var hintControl = this.getHintControl(false);
            if (hintControl) {
                messages = editor.get("validationMessages");
                hintControl.set("messages", messages || DEFAULT_OK_MESSAGES);
            }
        },
        onEditorPostFailed: function(editor, arg) {
            if (!this._dataSet && !this._property) {
                var exception = arg.exception;
                if (exception instanceof dorado.widget.editor.PostException) {
                    var hintControl = this.getHintControl(false);
                    if (hintControl) {
                        hintControl.set("messages", exception.messages);
                    }
                }
            }
            arg.processDefault = false;
        },
        getBindingPropertyDef: function() {
            var p = this._propertyDef;
            if (p === undefined) {
                this._propertyDef = p = ($invokeSuper.call(this) || null);
            }
            return p;
        },
        getLabel: function() {
            var label = this._label;
            if (!label && this._dataSet && this._property) {
                var p = this.getBindingPropertyDef();
                if (p) {
                    label = p._label || p._name;
                }
            }
            return label || this._property || "";
        },
        isRequired: function() {
            var p;
            if (this._dataSet && this._property) {
                p = this.getBindingPropertyDef();
            }
            var required = p ? p._required : false;
            if (!required) {
                var editor = this._editor;
                required = (editor && editor instanceof dorado.widget.TextEditor && editor.get("required"));
            }
            return required;
        },
        resetBinding: function() {
            if (!this._ready) {
                return;
            }
            var config = { dataSet: this._dataSet, dataPath: this._dataPath, property: this._property };
            var editor = this.getEditor(false),
                hintControl = this.getHintControl(false);
            if (editor) {
                editor.set(config);
            }
            if (hintControl) {
                hintControl.set(config);
            }
        },
        refreshDom: function(dom) {
            var height = this._height || this._realHeight;
            $invokeSuper.call(this, arguments);
            var dom = this._dom,
                labelEl = this._labelEl,
                contentEl = this._contentEl,
                editorEl = this._editorEl,
                hintEl = this._hintEl;
            var heightDefined = this.getAttributeWatcher().getWritingTimes("height");
            if (labelEl) {
                var label = this.getLabel();
                labelEl.innerText = label + ((this._labelSeparator && label) ? this._labelSeparator : "");
                if (this._labelPosition == "top") {
                    if (heightDefined) {
                        contentEl.style.height = (dom.offsetHeight - labelEl.offsetHeight) + "px";
                    }
                } else {
                    $fly(labelEl).outerWidth(this._labelWidth);
                    if (dorado.Browser.msie && dorado.Browser.version < 7) {
                        contentEl.style.marginLeft = this._labelWidth + "px";
                    } else {
                        contentEl.style.marginLeft = (this._labelWidth + this._labelSpacing) + "px";
                    }
                }
            }
            if (hintEl) {
                var hintControl = this.getHintControl(true);
                if (this._hintPosition == "bottom") {
                    if (heightDefined) {
                        editorEl.style.height = (contentEl.offsetHeight - hintEl.offsetHeight) + "px";
                    }
                } else {
                    hintEl.style.width = this._hintWidth + "px";
                    editorEl.style.marginRight = (this._hintWidth + this._hintSpacing) + "px";
                }
                if (!hintControl.get("rendered")) {
                    hintControl.render(hintEl);
                }
            }
            var editor = this.getEditor(true);
            if (editor) {
                var attrWatcher = editor.getAttributeWatcher();
                var autoWidth = !editor.ATTRIBUTES.width.independent && !attrWatcher.getWritingTimes("width");
                var autoHeight = !editor.ATTRIBUTES.height.independent && !attrWatcher.getWritingTimes("height") && heightDefined;
                if (this._labelPosition == "top") {
                    autoHeight = (height && autoHeight);
                }
                if (autoWidth) {
                    var editorWidth = 0;
                    if (this._realWidth > 0) {
                        editorWidth = this._realWidth;
                        if (this._showLabel && this._labelPosition != "top") {
                            editorWidth -= (this._labelWidth + this._labelSpacing);
                            if (this._showHint && this._hintPosition != "bottom") {
                                editorWidth -= (this._hintWidth + this._hintSpacing);
                            } else {
                                editorWidth = 0;
                            }
                        } else {
                            editorWidth = 0;
                        }
                    }
                    editor._realWidth = (editorWidth > 0) ? editorWidth : editorEl.offsetWidth;
                }
                if (this._editorWidth > 0 && editor._realWidth > 0 && this._editorWidth < editor._realWidth) {
                    editor._realWidth = this._editorWidth;
                }
                if (autoHeight) {
                    editor._realHeight = editorEl.offsetHeigh;
                }
                if (!editor.get("rendered")) {
                    editor.render(editorEl);
                } else {
                    editor.refresh();
                }
            }
            if (labelEl) {
                var required = !!this.isRequired();
                if (required && editor) {
                    required = !editor._readOnly && !editor._readOnly2;
                }
                $fly(labelEl).toggleClass("form-label-required", required);
            }
        },
        refreshData: function() {
            var editor = this.getEditor(false);
            if (editor != null && dorado.Object.isInstanceOf(editor, dorado.widget.AbstractEditor)) {
                editor.refreshData();
            }
        },
        isFocusable: function() {
            var editor = this._editor;
            return $invokeSuper.call(this) && editor && editor.isFocusable();
        },
        getFocusableSubControls: function() {
            return [this._editor];
        }
    });
    dorado.widget.View.registerDefaultComponent("defaultFormProfile", function() {
        return new dorado.widget.FormProfile();
    });
})();
dorado.widget.autoform = {};
dorado.widget.autoform.AutoFormElement = $extend(dorado.widget.FormElement, {
    $className: "dorado.widget.autoform.AutoFormElement",
    ATTRIBUTES: {
        width: { independent: false },
        name: {
            writeOnce: true,
            setter: function(name) {
                this._name = name;
                if (name && !this.getAttributeWatcher().getWritingTimes("property") && !name.startsWith("_unnamed")) {
                    this._property = name;
                }
            }
        }
    }
});
dorado.widget.AutoForm = $extend([dorado.widget.Control, dorado.widget.FormProfile, dorado.widget.FormProfileSupport], {
    $className: "dorado.widget.AutoForm",
    ATTRIBUTES: {
        className: { defaultValue: "d-auto-form" },
        formProfile: {
            componentReference: true,
            setter: function(formProfile) {
                if (this._formProfile === formProfile) {
                    return;
                }
                if (dorado.Object.isInstanceOf(this._formProfile, dorado.widget.FormProfile)) {
                    this._formProfile.removeBindingElement(this);
                }
                this._formProfile = formProfile;
                if (dorado.Object.isInstanceOf(formProfile, dorado.widget.FormProfile)) {
                    formProfile.addBindingElement(this);
                    this.onProfileChange();
                }
            }
        },
        cols: {
            skipRefresh: true,
            setter: function(cols) {
                this._cols = cols;
                if (this._rendered) {
                    this.refreshFormLayout();
                }
            }
        },
        rowHeight: { defaultValue: 22 },
        colPadding: { defaultValue: 6 },
        rowPadding: { defaultValue: 6 },
        stretchWidth: {},
        padding: { defaultValue: 8 },
        dataType: { getter: dorado.LazyLoadDataType.dataTypeGetter },
        autoCreateElements: {},
        elements: {
            skipRefresh: true,
            setter: function(elements) {
                if (this._rendered) {
                    var container = this._container,
                        layout;
                    if (container) {
                        layout = container.get("layout");
                        layout.disableRendering();
                    }
                    try {
                        if (container) {
                            this._elements.each(function(element) {
                                container.removeChild(element);
                            });
                        }
                        this._elements.clear();
                        if (!elements) {
                            return;
                        }
                        for (var i = 0; i < elements.length; i++) {
                            this.addElement(elements[i]);
                        }
                    } finally {
                        if (container) {
                            layout.enableRendering();
                            container.refresh(true);
                        }
                    }
                } else {
                    this._elementConfigs = elements;
                }
            }
        },
        createOwnEntity: { defaultValue: true },
        createPrivateDataSet: { writeBeforeReady: true },
        entity: {
            getter: function() {
                if (this._dataSet && this._dataSet._ready) {
                    var entity = this._dataSet.getData(this._dataPath, { loadMode: "auto", firstResultOnly: true });
                    if (entity && entity instanceof dorado.EntityList) {
                        entity = entity.current;
                    }
                    return entity;
                } else {
                    return this._entity;
                }
            },
            setter: function(entity) {
                if (this._dataSet && this._dataSet._ready && this._dataSet.get("userData") == "autoFormPrivateDataSet") {
                    this._dataSet.set("data", entity);
                } else {
                    this._entity = entity;
                }
            }
        }
    },
    constructor: function() {
        var autoform = this;
        autoform._elements = new dorado.util.KeyedArray(function(element) {
            return (element instanceof dorado.widget.autoform.AutoFormElement) ? element._name : element._id;
        });
        var container = autoform._container = new dorado.widget.Container({ layout: "Form", contentOverflow: "visible", style: { width: "100%", height: "100%" } });
        var ie7 = (dorado.Browser.msie && dorado.Browser.version <= 7);
        if (ie7) {
            container.get("style").height = "auto";
        }
        var notifySizeChange = container.notifySizeChange;
        container.notifySizeChange = function() {
            notifySizeChange.apply(container, arguments);
            autoform.notifySizeChange.apply(autoform, arguments);
        };
        autoform.registerInnerControl(autoform._container);
        autoform._bindingElements = new dorado.ObjectGroup();
        autoform._skipOnCreateListeners = (autoform._skipOnCreateListeners || 0) + 1;
        $invokeSuper.call(autoform, arguments);
        autoform._skipOnCreateListeners--;
        if (autoform._createOwnEntity && autoform.getAttributeWatcher().getWritingTimes("entity") == 0) {
            var defaultEntity = new dorado.widget.FormProfile.DefaultEntity();
            autoform.set("entity", defaultEntity);
        }
        if (autoform._elementConfigs) {
            var configs = autoform._elementConfigs;
            for (var i = 0; i < configs.length; i++) {
                autoform.addElement(configs[i]);
            }
            delete autoform._elementConfigs;
        }
        autoform.bind("onAttributeChange", function(self, arg) {
            var attr = arg.attribute;
            if (attr == "readOnly") {
                var readOnly = self._readOnly,
                    objects = self._bindingElements.objects;
                for (var i = 0; i < objects.length; i++) {
                    var object = objects[i];
                    if (object instanceof dorado.widget.FormElement) {
                        object._realReadOnly = readOnly;
                        object.resetEditorReadOnly();
                    }
                }
            } else {
                if (!dorado.widget.Control.prototype.ATTRIBUTES[attr] && dorado.widget.FormConfig.prototype.ATTRIBUTES[attr]) {
                    if (self._config) {
                        delete self._config;
                    }
                    dorado.Toolkits.setDelayedAction(self, "$profileChangeTimerId", function() {
                        self._bindingElements.invoke("onProfileChange");
                    }, 20);
                }
            }
        });
        if (!(autoform._skipOnCreateListeners > 0) && autoform.getListenerCount("onCreate")) {
            autoform.fireEvent("onCreate", autoform);
        }
    },
    doGet: function(attr) {
        var c = attr.charAt(0);
        if (c == "#" || c == "&") {
            var elementName = attr.substring(1);
            return this.getElement(elementName);
        } else {
            return $invokeSuper.call(this, [attr]);
        }
    },
    addBindingElement: function(element) {
        if (!this._privateDataSetInited) {
            this._privateDataSetInited = true;
            if (!this._dataSet && this._createPrivateDataSet) {
                var dataType = this.get("dataType");
                var dataSet = new dorado.widget.DataSet({
                    dataType: dataType,
                    userData: "autoFormPrivateDataSet",
                    onReady: {
                        listener: function(self) {
                            self.insert();
                        },
                        options: { once: true }
                    }
                });
                var parentControl = this.get("parent") || $topView;
                if (parentControl && parentControl instanceof dorado.widget.Container) {
                    parentControl.addChild(dataSet);
                }
                dataSet.onReady();
                this.set({ dataSet: dataSet, dataPath: null });
            }
        }
        $invokeSuper.call(this, [element]);
    },
    addElement: function(element) {
        var elements = this._elements,
            config = {},
            constraint;
        if (!config.name) {
            var name = config.property || "_unnamed";
            if (elements.get(name)) {
                var j = 2;
                while (elements.get(name + "_" + j)) {
                    j++;
                }
                name = name + "_" + j;
            }
            config.name = name;
        }
        if (!(element instanceof dorado.widget.Control)) {
            dorado.Object.apply(config, element);
            if (element) {
                constraint = element._layoutConstraint;
                element = this.createInnerComponent(config, function(type) {
                    if (!type) {
                        return dorado.widget.autoform.AutoFormElement;
                    }
                });
            } else {
                element = new dorado.widget.Control(config);
            }
        }
        element.set("formProfile", this, { skipUnknownAttribute: true, tryNextOnError: true, preventOverwriting: true, lockWritingTimes: true });
        elements.append(element);
        if (this._container) {
            this._container.addChild(element);
        }
        return element;
    },
    removeElement: function(element) {
        this._elements.remove(element);
        if (this._container) {
            this._container.removeChild(element);
        }
    },
    getElement: function(name) {
        return this._elements.get(name);
    },
    createDom: function() {
        var attrWatcher = this.getAttributeWatcher();
        if (!this._formProfile && attrWatcher.getWritingTimes("formProfile") == 0) {
            var view = this.get("view") || dorado.widget.View.TOP;
            this.set("formProfile", view.id("defaultFormProfile"));
        }
        return $invokeSuper.call(this, arguments);
    },
    refreshDom: function(dom) {
        $invokeSuper.call(this, arguments);
        var container = this._container;
        if (!container._rendered) {
            if (this._autoCreateElements && !this._defaultElementsGenerated) {
                this.generateDefaultElements();
            }
            this.initLayout(container.get("layout"));
            container.render(dom);
        }
    },
    doOnResize: function() {
        var dom = this.getDom(),
            container = this._container;
        container.onResize();
    },
    refreshFormLayout: function() {
        var container = this._container,
            layout = container.get("layout");
        container.refresh();
        this.initLayout(layout);
        layout.refresh();
    },
    initLayout: function(layout) {
        configs = {};
        if (this._cols) {
            configs.cols = this._cols;
        }
        if (this._rowHeight >= 0) {
            configs.rowHeight = this._rowHeight;
        }
        if (this._colPadding >= 0) {
            configs.colPadding = this._colPadding;
        }
        if (this._rowPadding >= 0) {
            configs.rowPadding = this._rowPadding;
        }
        if (this._stretchWidth) {
            configs.stretchWidth = this._stretchWidth;
        }
        if (this._padding >= 0) {
            configs.padding = this._padding;
        }
        layout.set(configs);
    },
    generateDefaultElements: function() {
        var dataType = this.get("dataType");
        if (!dataType && this._dataSet) {
            var dataPath = dorado.DataPath.create(this._dataPath);
            dataType = dataPath.getDataType(this._dataSet.get("dataType"));
        }
        if (!dataType && this._entity) {
            dataType = this._entity.dataType;
        }
        if (dataType && dataType instanceof dorado.EntityDataType) {
            this._defaultElementsGenerated = true;
            var container = this._container,
                layout;
            if (container) {
                layout = container.get("layout");
                layout.disableRendering();
            }
            var self = this,
                elements = self._elements,
                config;
            dataType.get("propertyDefs").each(function(propertyDef) {
                if (!propertyDef._visible) {
                    return;
                }
                var name = propertyDef._name,
                    element = elements.get(name);
                if (!element) {
                    config = { name: name, dataSet: self._dataSet, dataPath: self._dataPath, property: name };
                } else {
                    config = { property: name };
                    self.removeElement(element);
                    self.addElement(element);
                }
                var propertyDataType = propertyDef.get("dataType");
                if (propertyDataType instanceof dorado.EntityDataType || propertyDataType instanceof dorado.AggregationDataType) {
                    return;
                }
                if (!element) {
                    element = self.addElement(config);
                } else {
                    element.set(config, { skipUnknownAttribute: true, tryNextOnError: true, preventOverwriting: true, lockWritingTimes: true });
                }
            });
            if (container) {
                layout.enableRendering();
                container.refresh(true);
            }
        }
    },
    validate: function(silent) {
        var result = true,
            elements = this._elements,
            errorMessages;

        this._elements.each(function(element) {
            if (element instanceof dorado.widget.FormElement) {
                var editor = element.get("editor");
                var data = element._dataSet._data._data;
                if (editor && editor instanceof dorado.widget.AbstractTextBox) {
                    if (data[element._property] != undefined && editor._text == undefined) {
                        editor.set('text', data[element._property]);
                        editor.set('value', data[element._property]);
                    }
                    if (editor.get("validationState") == "none") {
                        editor.post(false, true);
                    }

                    if (result && editor.get("validationState") == "error") {
                        result = false;
                        errorMessages = editor.get("validationMessages");
                    }
                }
            }
        });
        if (!result && !silent) {
            throw new dorado.widget.editor.PostException(errorMessages);
        }
        return result;
    },
    refreshData: function() {
        this._elements.each(function(element) {
            if (element instanceof dorado.widget.AbstractFormElement) {
                element.refreshData();
            }
        });
    },
    getFocusableSubControls: function() {
        return [this._container];
    }
});
