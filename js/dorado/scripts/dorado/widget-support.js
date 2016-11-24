(function () {
	dorado.widget = {};
	dorado.widget.ViewElement = $extend([dorado.AttributeSupport, dorado.EventSupport], {
		$className: "dorado.widget.ViewElement",
		ATTRIBUTES: {
			id: {
				readOnly: true
			},
			destroyed: {
				readOnly: true
			},
			parentViewElement: {
				readOnly: true
			},
			view: {
				skipRefresh: true,
				setter: function (view) {
					if(this._view == view) {
						return;
					}
					if(this._view && this._id) {
						this._view.unregisterViewElement(this._id);
					}
					this._view = view;
					if(view && this._id) {
						view.registerViewElement(this._id, this);
					}
					if(this._innerViewElements) {
						this._innerViewElements.each(function (viewElement) {
							viewElement.set("view", view);
						});
					}
				}
			},
			userData: {
				skipRefresh: true
			}
		},
		EVENTS: {
			onCreate: {},
			onDestroy: {}
		},
		constructor: function (config) {
			var id;
			if(config && config.constructor == String) {
				id = config;
				config = null;
			} else {
				if(config) {
					id = config.id;
					delete config.id;
				}
			}
			this._uniqueId = dorado.Core.newId();
			dorado.widget.ViewElement.ALL[this._uniqueId] = this;
			if(id) {
				id = id + "";
				if(!(/^[a-zA-Z_$][a-z0-9A-Z_$]*$/.exec(id))) {
					throw new dorado.ResourceException("dorado.widget.InvalidComponentId", id);
				}
				this._id = id;
			}
			this._prependingView = config && config.$prependingView;
			$invokeSuper.call(this);
			if(config) {
				this.set(config, {
					skipUnknownAttribute: true
				});
			}
			if(!(this._skipOnCreateListeners > 0) && this.getListenerCount("onCreate")) {
				this.fireEvent("onCreate", this);
			}
		},
		destroy: function () {
			if(this._destroyed) {
				return;
			}
			this._destroyed = true;
			this.fireEvent("onDestroy", this);
			if(this._innerViewElements) {
				var viewElements = this._innerViewElements.slice(0);
				for(var i = 0, len = viewElements.length; i < len; i++) {
					viewElements[i].destroy();
				}
				delete this._innerViewElements;
			}
			if(!dorado.windowClosed) {
				if(this._view && this._id) {
					this._view.unregisterViewElement(this._id);
				}
				delete dorado.widget.ViewElement.ALL[this._uniqueId];
			}
		},
		doSet: function (attr, value, skipUnknownAttribute, lockWritingTimes) {
			var def = this.ATTRIBUTES[attr];
			if(def) {
				if(this._ready && def.writeBeforeReady) {
					throw new dorado.AttributeException("dorado.widget.AttributeWriteBeforeReady", attr);
				}
				if(def.componentReference) {
					var component = null,
						allPrepared = false;
					if(value) {
						if(value instanceof Array) {
							if(value.length > 0) {
								component = [], allPrepared = true;
								for(var i = 0; i < value.length; i++) {
									component[i] = dorado.widget.ViewElement.getComponentReference(this, attr, value[i]);
									if(!(component[i] instanceof dorado.widget.Component)) {
										allPrepared = false;
									}
								}
							}
						} else {
							component = dorado.widget.ViewElement.getComponentReference(this, attr, value);
							allPrepared = (component instanceof dorado.widget.Component);
						}
					}
					return $invokeSuper.call(this, [attr, (allPrepared ? component : null), skipUnknownAttribute, lockWritingTimes]);
				} else {
					if(def.innerComponent != null) {
						if(value) {
							var defaultType = "dorado.widget." + def.innerComponent;
							if(value instanceof Array) {
								var components = [];
								for(var i = 0; i < value.length; i++) {
									components.push(this.createInnerComponent(value[i], defaultType));
								}
								value = components;
							} else {
								value = this.createInnerComponent(value, defaultType);
							}
						}
					}
				}
			}
			return $invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);
		},
		getListenerScope: function () {
			return this.get("view") || $topView;
		},
		fireEvent: function () {
			if(this._destroyed) {
				return false;
			}
			return $invokeSuper.call(this, arguments);
		},
		createInnerComponent: function (config, typeTranslator) {
			if(!config) {
				return null;
			}
			if(config instanceof dorado.widget.Component) {
				return config;
			}
			var component = null;
			if(typeof config == "object") {
				config.$prependingView = (this instanceof dorado.widget.View) ? this : this._prependingView;
				component = dorado.Toolkits.createInstance("widget", config, typeTranslator);
			}
			return component;
		},
		registerInnerViewElement: function (viewElement) {
			if(!this._innerViewElements) {
				this._innerViewElements = [];
			}
			this._innerViewElements.push(viewElement);
			viewElement._parentViewElement = this;
			if(viewElement.doSetParentViewElement) {
				viewElement.doSetParentViewElement(this);
			}
			viewElement.set("view", (this instanceof dorado.widget.View) ? this : this.get("view"));
			if(viewElement.parentChanged) {
				viewElement.parentChanged();
			}
		},
		unregisterInnerViewElement: function (viewElement) {
			if(!this._innerViewElements) {
				return;
			}
			this._innerViewElements.remove(viewElement);
			viewElement._parentViewElement = null;
			if(viewElement.doSetParentViewElement) {
				viewElement.doSetParentViewElement(null);
			}
			viewElement.set("view", null);
			if(viewElement.parentChanged) {
				viewElement.parentChanged();
			}
		}
	});
	dorado.widget.RenderableViewElement = $extend([dorado.widget.ViewElement, dorado.RenderableElement], {
		doSet: function (attr, value) {
			dorado.widget.ViewElement.prototype.doSet.call(this, attr, value);
			var def = this.ATTRIBUTES[attr];
			if(this._rendered && this.refresh && this._ignoreRefresh < 1 && def && !def.skipRefresh) {
				this.refresh(true);
			}
		}
	});
	dorado.widget.ViewElement.getComponentReference = function (object, attr, value) {
		if(!value) {
			return value;
		}
		if(value instanceof dorado.widget.Component) {
			return value;
		} else {
			var component, view;
			if(typeof value == "string") {
				if(object.getListenerScope) {
					view = object._prependingView || object.getListenerScope();
				} else {
					view = $topView;
				}
				component = view.id(value);
				if(component) {
					return component;
				}
				value = {
					view: view,
					component: value
				};
			} else {
				if(typeof value == "object" && value.$type) {
					if(object.getListenerScope) {
						view = object._prependingView || object.getListenerScope();
					} else {
						view = $topView;
					}
					value.$prependingView = view;
					return dorado.Toolkits.createInstance("widget", value);
				}
			}
			view = value.view, componentId = value.component;
			component = (view._prependingChild && view._prependingChild[componentId]) || view.id(componentId);
			if(component) {
				return component;
			}
			var wantedComponents = view._wantedComponents;
			if(!wantedComponents) {
				view._wantedComponents = wantedComponents = {
					count: 0
				};
				view.bind("onComponentRegistered._getComponentReference", viewOnComponentRegisteredListener);
			}
			var wanters = wantedComponents[componentId];
			if(!wanters) {
				wantedComponents[componentId] = wanters = [];
				wantedComponents.count++;
			}
			wanters.push({
				object: object,
				attribute: attr
			});
			var idProperty = "_" + attr + "_id";
			if(!object[idProperty]) {
				object[idProperty] = componentId;
			} else {
				var ids = object[idProperty];
				if(typeof ids == "string") {
					object[idProperty] = ids = [object[idProperty]];
				}
				ids.push(componentId);
			}
			return componentId;
		}
	};

	function viewOnComponentRegisteredListener(view, arg) {
		var wantedComponents = view._wantedComponents;
		var wanters = wantedComponents[arg.component._id];
		if(wanters) {
			var component = arg.component;
			delete wantedComponents[component._id];
			wantedComponents.count--;
			if(wantedComponents.count == 0) {
				view.unbind("onComponentRegistered._getComponentReference");
				delete view._wantedComponents;
			}
			for(var i = 0; i < wanters.length; i++) {
				var wanter = wanters[i],
					object = wanter.object,
					attribute = wanter.attribute;
				var ids = object["_" + attribute + "_id"];
				if(ids) {
					if(typeof ids == "string") {
						if(ids == component._id) {
							object.set(attribute, component, {
								lockWritingTimes: true
							});
						}
					} else {
						var index = ids.indexOf(component._id);
						if(index >= 0) {
							ids[index] = component;
							var allComponentPrepared = true;
							for(var j = 0; j < ids.length; j++) {
								if(typeof ids[j] == "string") {
									allComponentPrepared = false;
									break;
								}
							}
							if(allComponentPrepared) {
								object.set(attribute, ids, {
									lockWritingTimes: true
								});
							}
						}
					}
				}
			}
		}
	}
	dorado.widget.ViewElement.findParentViewElement = function (element, type) {
		function find(win, dom, className) {
			var control = null;
			do {
				var viewElement;
				if(dom.doradoUniqueId) {
					viewElement = win.dorado.widget.ViewElement.ALL[dom.doradoUniqueId];
				}
				if(viewElement) {
					var match = false;
					if(className) {
						if(viewElement.constructor.className === className) {
							match = true;
						} else {
							while(!viewElement._isDoradoControl) {
								viewElement = viewElement._parentViewElement;
								if(viewElement && viewElement.constructor.className === className) {
									match = true;
									break;
								}
							}
						}
					} else {
						match = true;
					}
					if(match) {
						break;
					}
				}
				dom = dom.parentNode;
			} while (dom != null);
			if(!viewElement && win.parent) {
				var parentFrames;
				try {
					parentFrames = win.parent.frames;
				} catch(e) {}
				if(parentFrames && parentFrames.length) {
					var frame;
					for(var i = 0; i < parentFrames.length; i++) {
						if(parentFrames[i].contentWindow == win) {
							frame = parentFrames[i];
							break;
						}
					}
					if(frame) {
						viewElement = find(win.parent, frame, className);
					}
				}
			}
			return viewElement;
		}
		var className;
		if(typeof type == "function") {
			className = type.className;
		} else {
			if(type) {
				className = type + "";
			}
		}
		return find(window, element, className);
	};
	dorado.widget.ViewElement.ALL = {};
	dorado.Toolkits.registerTypeTranslator("widget", function (type) {
		return dorado.util.Common.getClassType("dorado.widget." + type, true);
	});
})();
dorado.widget.Component = $extend(dorado.widget.ViewElement, {
	$className: "dorado.widget.Component",
	ATTRIBUTES: {
		ready: {
			readOnly: true
		},
		parent: {
			readOnly: true
		},
		dataTypeRepository: {
			readOnly: true,
			getter: function () {
				var view = this.get("view") || $topView;
				return view.get("dataTypeRepository");
			}
		}
	},
	EVENTS: {
		onReady: {}
	},
	constructor: function (config) {
		$invokeSuper.call(this, [config]);
		if(AUTO_APPEND_TO_TOPVIEW && window.$topView) {
			$topView.addChild(this);
		}
	},
	onReady: function () {
		if(this._ready) {
			return;
		}
		this._ready = true;
		if(this._prependingView) {
			delete this._prependingView;
		}
		this.fireEvent("onReady", this);
	},
	getDataTypeRepository: function () {
		var view = this.get("view") || this._prependingView;
		return view ? view._dataTypeRepository : null;
	},
	fireEvent: function () {
		var optimized = (AUTO_APPEND_TO_TOPVIEW === false);
		if(optimized) {
			AUTO_APPEND_TO_TOPVIEW = true;
		}
		var retVal = $invokeSuper.call(this, arguments);
		if(optimized) {
			AUTO_APPEND_TO_TOPVIEW = false;
		}
		return retVal;
	},
	doSetParentViewElement: function (parentViewElement) {
		this._parent = parentViewElement;
	}
});
(function () {
	dorado.widget.DataSet = $extend(dorado.widget.Component, {
		$className: "dorado.widget.DataSet",
		ATTRIBUTES: {
			loadMode: {
				writeBeforeReady: true,
				defaultValue: "lazy"
			},
			dataType: {
				getter: function () {
					return this.getDataType();
				}
			},
			data: {
				getter: function () {
					return this.getData();
				},
				setter: function (data) {
					if(data && data instanceof Object && !(data instanceof Array)) {
						data.$state = dorado.Entity.STATE_NONE;
					}
					if(this._ready) {
						this.setData(data);
					} else {
						this._data = data;
					}
				}
			},
			dataProvider: {
				setter: function (dp) {
					this._dataProvider = (dp && dp.constructor === String) ? dorado.DataProvider.create(dp) : dp;
				}
			},
			parameter: {
				setter: function (parameter) {
					if(this._parameter instanceof dorado.util.Map && parameter instanceof dorado.util.Map) {
						this._parameter.put(parameter);
					} else {
						this._parameter = parameter;
					}
				}
			},
			pageSize: {
				defaultValue: 0
			},
			pageNo: {
				defaultValue: 1
			},
			dataLoaded: {
				readOnly: true
			},
			readOnly: {
				notifyObservers: true
			},
			cacheable: {}
		},
		EVENTS: {
			beforeLoadData: {},
			onLoadData: {},
			onDataLoad: {}
		},
		_disableObserversCounter: 0,
		constructor: function (configs) {
			this._dataPathCache = {};
			this._observers = [];
			$invokeSuper.call(this, arguments);
		},
		get: function (attr) {
			if(attr.substring(0, 5) === "data:") {
				var dataPath = attr.substring(5);
				return this.queryData(dataPath);
			} else {
				return $invokeSuper.call(this, [attr]);
			}
		},
		doSet: function (attr, value, skipUnknownAttribute, lockWritingTimes) {
			$invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);
			if(!this._ready) {
				return;
			}
			var def = this.ATTRIBUTES[attr];
			if(def && def.notifyObservers) {
				dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", this.notifyObservers, 50);
			}
		},
		onReady: function () {
			$invokeSuper.call(this);
			if(this._observers.length > 0) {
				for(var i = 0; i < this._observers; i++) {
					this.retrievePreloadConfig(this._observers[i]);
				}
				if(this._data) {
					this.setData(this._data);
				} else {
					this.sendMessage(0);
				}
			}
			if(this._loadMode == "onReady") {
				if(this._view) {
					this._view._loadingDataSet.push(this);
				}
				this.getDataAsync();
			}
		},
		setData: function (data) {
			var dataType = this.getDataType(null, true),
				oldData = this._data;
			if(dataType || this._getDataCalled) {
				if(data != null) {
					if(!(data instanceof dorado.EntityList || data instanceof dorado.Entity)) {
						var state = data.$state;
						data = dorado.DataUtil.convert(data, this.getDataTypeRepository(), dataType);
						data.dataProvider = this._dataProvider;
						if(data instanceof dorado.Entity && state == null) {
							data.setState(dorado.Entity.STATE_NEW);
						}
					}
				} else {
					if(dataType instanceof dorado.AggregationDataType) {
						data = dorado.DataUtil.convert([], this.getDataTypeRepository(), dataType);
					}
				}
				if(oldData && (oldData instanceof dorado.EntityList || oldData instanceof dorado.Entity)) {
					oldData._setObserver(null);
				}
				if(data) {
					if(data.dataType == null) {
						data.dataType = dataType;
					} else {
						if(dataType && dataType != data.dataType) {
							var mismatch = true;
							if(dataType instanceof dorado.EntityDataType && data.dataType) {
								mismatch = (data.dataType.getElementDataType() != dataType);
							}
							if(mismatch) {
								throw new dorado.ResourceException("dorado.widget.DataTypeNotAccording", this._id);
							}
						}
					}
				}
				this._data = data;
				this._dataLoaded = true;
			} else {
				if(data && !(data instanceof dorado.Entity || data instanceof dorado.EntityList)) {
					if(data instanceof Array) {
						data = new dorado.EntityList(data);
					} else {
						if(data instanceof Object && !(data instanceof Date)) {
							data = new dorado.Entity(data);
						}
					}
				}
				this._data = data;
			}
			if(data && (data instanceof dorado.EntityList || data instanceof dorado.Entity)) {
				data._setObserver(this);
				this._dataPathCache = {};
			}
			if(oldData != data) {
				this.sendMessage(0);
			}
		},
		insert: function (data) {
			var dataType = this.getDataType(null, true),
				entity;
			if(dataType instanceof dorado.AggregationDataType) {
				if(this._data == null) {
					this.setData([]);
				}
				var entityList = this.getData();
				entity = entityList.insert(data);
			} else {
				if(dataType instanceof dorado.EntityDataType) {
					if(this._data == null) {
						if(data instanceof dorado.Entity) {
							entity = data;
						} else {
							entity = new dorado.Entity(data, this.getDataTypeRepository(), dataType);
							entity.setState(dorado.Entity.STATE_NEW);
						}
						this.setData(entity);
					} else {
						throw new dorado.ResourceException("dorado.widget.DataSetNotEmptyException", this._id);
					}
				} else {
					if(dataType) {
						throw new dorado.ResourceException("dorado.widget.DataSetNotSupportInsert", this._id);
					} else {
						var data = this.getData();
						if(data instanceof dorado.EntityList) {
							entity = data.insert();
						} else {
							entity = new dorado.Entity();
							this.setData(entity);
						}
					}
				}
			}
			return entity;
		},
		doLoad: function (callback, flush) {
			var data = this._data,
				shouldFireOnLoadData = false;
			var dataCache, hashCode;
			if(this._cacheable) {
				dataCache = this._dataCache;
				if(!dataCache) {
					this._dataCache = dataCache = {};
				}
				hashCode = dorado.Object.hashCode(this._parameter) + "-" + dorado.Object.hashCode(this._sysParameter);
				data = dataCache[hashCode];
				this.setData(data);
			}
			if(data === undefined || flush) {
				if(this._dataProvider) {
					data = this._dataPipe;
					if(!data) {
						data = this._dataPipe = new dorado.DataSetDataPipe(this);
						shouldFireOnLoadData = true;
					}
				} else {
					this.setData(null);
				}
			}
			if(data instanceof dorado.DataPipe) {
				var arg = {
					dataSet: this,
					pageNo: 1
				};
				this.fireEvent("beforeLoadData", this, arg);
				if(arg.processDefault === false) {
					delete this._dataPipe;
					if(callback) {
						$callback(callback, false);
					}
					return;
				}
				if(flush) {
					this.discard();
				}
				var pipe = data;
				if(callback) {
					var isNewPipe = (pipe.runningProcNum == 0);
					pipe.getAsync({
						scope: this,
						callback: function (success, result) {
							delete this._dataPipe;
							if(isNewPipe) {
								this._data = null;
								this.sendMessage(DataSet.MESSAGE_LOADING_END, arg);
								this._loadingData = false;
								delete this._data;
							}
							if(success) {
								if(shouldFireOnLoadData) {
									this.setData(result);
									if(this._cacheable) {
										dataCache[hashCode] = this.getData();
									}
									this.fireEvent("onDataLoad", this, arg);
									this.fireEvent("onLoadData", this, arg);
								}
							} else {
								if(shouldFireOnLoadData) {
									this.setData(null);
								}
							}
							$callback(callback, success);
						}
					});
					if(isNewPipe) {
						this._loadingData = true;
						this.sendMessage(DataSet.MESSAGE_LOADING_START, arg);
					}
					return;
				} else {
					var shouldAbortAsyncProcedures = dorado.Setting["common.abortAsyncLoadingOnSyncLoading"];
					if(pipe.runningProcNum > 0 && !shouldAbortAsyncProcedures) {
						throw new dorado.ResourceException("dorado.widget.GetDataDuringLoading", this._id);
					}
					try {
						var data = pipe.get();
						this.setData(data);
						pipe.abort(true, data);
					} catch(e) {
						pipe.abort(false, e);
						this.setData(null);
						throw e;
					}
					delete this._dataPipe;
					if(this._cacheable) {
						dataCache[hashCode] = this.getData();
					}
					this.fireEvent("onDataLoad", this);
					this.fireEvent("onLoadData", this);
				}
			} else {
				if(flush) {
					this.discard();
				}
				if(callback) {
					$callback(callback, true);
				}
			}
		},
		load: function () {
			return this.doLoad();
		},
		loadAsync: function (callback) {
			this.doLoad(callback || dorado._NULL_FUNCTION);
		},
		doGetData: function (path, options, callback) {
			function pollEvaluate(data, dataPath, option, callback) {
				var totalAsyncExecutionTimes = dorado.DataPipe.MONITOR.asyncExecutionTimes;
				var data = dataPath.evaluate(data, options);
				if(dorado.DataPipe.MONITOR.asyncExecutionTimes - totalAsyncExecutionTimes > 0) {
					setTimeout(function () {
						pollEvaluate(data, dataPath, option, callback);
					}, 60);
				} else {
					$callback(callback, true, data);
				}
			}

			function evaluatePath(path, options, callback) {
				var data = this._data;
				if(data instanceof dorado.DataPipe) {
					return null;
				}
				if(data) {
					if(!(data instanceof dorado.EntityList || data instanceof dorado.Entity)) {
						this.setData(data);
						data = this._data;
					}
					if(!(path && (path.charAt(0) == "!" || path.indexOf(".!")))) {
						var key = (path || "$EMPTY") + "~" + optionsCode;
						var cachedData = this._dataPathCache[key];
						if(cachedData !== undefined) {
							dorado.DataPipe.MONITOR.asyncExecutionTimes += (cachedData.asyncExecutionTimes || 0);
							dorado.DataPipe.MONITOR.executionTimes += (cachedData.asyncExecutionTimes || 0);
							if(callback) {
								$callback(callback, true, cachedData.data);
								return;
							} else {
								return cachedData.data;
							}
						}
					}
					var totalAsyncExecutionTimes = dorado.DataPipe.MONITOR.asyncExecutionTimes;
					var dataPath = dorado.DataPath.create(path);
					if(data) {
						data = dataPath.evaluate(data, options);
					}
					var asyncExecutionTimes = dorado.DataPipe.MONITOR.asyncExecutionTimes - totalAsyncExecutionTimes;
					this._dataPathCache[key] = {
						data: data,
						asyncExecutionTimes: asyncExecutionTimes
					};
					if(callback) {
						if(asyncExecutionTimes < 1) {
							$callback(callback, true, data);
						} else {
							var pollOption = dorado.Core.clone(option);
							pollOption.loadMode = "always";
							setTimeout(function () {
								pollEvaluate(data, dataPath, pollOption, callback);
							}, 100);
						}
					} else {
						return data;
					}
				} else {
					if(!path) {
						var dataType = this.getDataType(null, true);
						if(dataType instanceof dorado.AggregationDataType) {
							this.setData([]);
							data = this._data;
						}
						if(callback) {
							$callback(callback, true, data);
						} else {
							return data;
						}
					}
				}
			}
			if(typeof options == "string") {
				options = {
					loadMode: options
				};
			} else {
				options = options || {};
			}
			var optionsCode, loadMode = options.loadMode;
			if(!loadMode) {
				if(this._loadMode == "manual") {
					loadMode = "never";
				} else {
					loadMode = "always";
				}
			}
			optionsCode = loadMode;
			if(options.firstResultOnly) {
				optionsCode += "F";
			}
			if(options.acceptAggregation) {
				optionsCode += "A";
			}
			this._getDataCalled = true;
			if((options.flush || this._data === undefined) && loadMode != "never") {
				var sysParameter;
				if(this._preloadConfigsMap) {
					var preloadConfigs = this._preloadConfigsMap[path || "#EMPTY"];
					if(preloadConfigs) {
						sysParameter = this._sysParameter;
						if(!sysParameter) {
							this._sysParameter = sysParameter = new dorado.util.Map();
						}
						sysParameter.put("preloadConfigs", preloadConfigs);
					}
				}
				if(callback) {
					this.doLoad({
						scope: this,
						callback: function (success, result) {
							if(success) {
								result = evaluatePath.call(this, path, options, callback);
							}
						}
					}, options.flush);
					if(sysParameter) {
						sysParameter.remove("preloadConfigs");
					}
					return;
				} else {
					if(loadMode == "auto") {
						this.doLoad(dorado._NULL_FUNCTION, options.flush);
						if(sysParameter) {
							sysParameter.remove("preloadConfigs");
						}
						return;
					} else {
						this.doLoad(null, options.flush);
						if(sysParameter) {
							sysParameter.remove("preloadConfigs");
						}
					}
				}
			}
			if(callback) {
				evaluatePath.call(this, path, options, callback);
			} else {
				return evaluatePath.call(this, path, options, null);
			}
		},
		getData: function (path, options) {
			options = options || {};
			if(options.firstResultOnly == null) {
				options.firstResultOnly = true;
			}
			if(options.acceptAggregation == null) {
				options.acceptAggregation = true;
			}
			return this.doGetData(path, options);
		},
		getDataAsync: function (path, callback, options) {
			options = options || {};
			if(options.firstResultOnly == null) {
				options.firstResultOnly = true;
			}
			if(options.acceptAggregation == null) {
				options.acceptAggregation = true;
			}
			this.doGetData(path, options, callback || dorado._NULL_FUNCTION);
		},
		queryData: function (path, options) {
			return this.doGetData(path, options);
		},
		queryDataAsync: function (path, callback, options) {
			this.doGetData(path, options, callback || dorado._NULL_FUNCTION);
		},
		flush: function () {
			this.getData(null, {
				flush: true,
				loadMode: "always"
			});
		},
		flushAsync: function (options) {
			if(options && typeof options == "function") {
				options = {
					callback: options
				};
			} else {
				options = options || {};
			}
			var callback = options.callback,
				modal = options.modal,
				executingMessage = options.executingMessage;
			var self = this,
				taskId;
			if(modal) {
				taskId = dorado.util.TaskIndicator.showTaskIndicator(executingMessage || $resource("dorado.data.DataProviderTaskIndicator"), "main");
			}
			try {
				this.getDataAsync(null, {
					callback: function (success, result) {
						if(taskId) {
							dorado.util.TaskIndicator.hideTaskIndicator(taskId);
						}
						$callback(callback, success, result, {
							scope: self._view
						});
					}
				}, {
					flush: true,
					loadMode: "always"
				});
			} finally {
				if(taskId) {
					dorado.util.TaskIndicator.hideTaskIndicator(taskId);
				}
			}
		},
		getDataType: function (path, options) {
			var loadMode;
			if(typeof options == "string") {
				loadMode = options;
			} else {
				loadMode = options ? options.loadMode : undefined;
			}
			var dataType = dorado.LazyLoadDataType.dataTypeGetter.call(this);
			if(!dataType && this._data) {
				dataType = this._data.dataType;
			}
			if(dataType) {
				return dorado.DataPath.create(path).getDataType(dataType, options);
			} else {
				return null;
			}
		},
		discard: function () {
			delete this._data;
		},
		clear: function () {
			this.setData(null);
		},
		retrievePreloadConfig: function (observer) {
			if(dorado.widget.DataTree && dorado.Object.isInstanceOf(observer, dorado.widget.DataTree)) {
				var bindingConfigs = observer.get("bindingConfigs");
				if(bindingConfigs) {
					var preloadConfigsMap = this._preloadConfigsMap,
						dataPath = observer._dataPath || "#EMPTY";
					if(!preloadConfigsMap) {
						this._preloadConfigsMap = preloadConfigsMap = {};
					}
					var preloadConfigs = preloadConfigsMap[dataPath] || [];
					for(var i = 0; i < bindingConfigs.length; i++) {
						var configs = dorado.widget.DataTree.bindingConfigToPreloadConfig(bindingConfigs[i]);
						if(configs) {
							preloadConfigs = preloadConfigs.concat(configs);
						}
					}
					if(preloadConfigs.length) {
						preloadConfigsMap[dataPath] = preloadConfigs;
					}
				}
			}
		},
		addObserver: function (observer) {
			this._observers.push(observer);
			if(this._ready && observer._ready) {
				this.retrievePreloadConfig(observer);
				observer.dataSetMessageReceived(this, DataSet.MESSAGE_REFRESH);
			}
		},
		removeObserver: function (observer) {
			this._observers.remove(observer);
		},
		entityMessageReceived: function (messageCode, args) {
			this._dataPathCache = {};
			if(this._ready) {
				this.sendMessage(messageCode, args);
			}
		},
		disableObservers: dorado.Entity.prototype.disableObservers,
		enableObservers: dorado.Entity.prototype.enableObservers,
		notifyObservers: function () {
			dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
			this._dataPathCache = {};
			this.sendMessage(0);
		},
		sendMessage: function (messageCode, args) {
			if(this._disableObserversCounter > 0) {
				return;
			}
			var observers = this._observers;
			for(var i = 0; i < observers.length; i++) {
				var observer = observers[i];
				observer.dataSetMessageReceived.call(observer, messageCode, args);
			}
		},
		post: function () {
			var observers = this._observers;
			for(var i = 0; i < observers.length; i++) {
				var observer = observers[i];
				if(dorado.Object.isInstanceOf(observer, dorado.widget.AbstractEditor)) {
					if(observer.get("rendered")) {
						observer.post();
					}
				}
			}
		}
	});
	dorado.DataSetDataPipe = $extend(dorado.DataProviderPipe, {
		$className: "dorado.DataSetDataPipe",
		constructor: function (dataSet) {
			this.dataSet = dataSet;
			this.dataType = dataSet._dataType;
			this.dataTypeRepository = dataSet.get("dataTypeRepository");
			this.view = dataSet.get("view");
		},
		getDataProviderArg: function () {
			var dataSet = this.dataSet,
				parameter = dorado.$this = this.dataSet._parameter;
			return {
				pageSize: dataSet._pageSize,
				pageNo: dataSet._pageNo,
				parameter: dorado.JSON.evaluate(parameter),
				sysParameter: dataSet._sysParameter ? dataSet._sysParameter.toJSON() : undefined,
				dataType: this.dataType,
				view: this.view
			};
		},
		getDataProvider: function () {
			return this.dataSet._dataProvider;
		}
	});
	var DataSet = dorado.widget.DataSet;
	DataSet.MESSAGE_REFRESH = 0;
	DataSet.MESSAGE_DATA_CHANGED = dorado.Entity._MESSAGE_DATA_CHANGED;
	DataSet.MESSAGE_ENTITY_STATE_CHANGED = dorado.Entity._MESSAGE_ENTITY_STATE_CHANGED;
	DataSet.MESSAGE_DELETED = dorado.EntityList._MESSAGE_DELETED;
	DataSet.MESSAGE_INSERTED = dorado.EntityList._MESSAGE_INSERTED;
	DataSet.MESSAGE_CURRENT_CHANGED = dorado.EntityList._MESSAGE_CURRENT_CHANGED;
	DataSet.MESSAGE_REFRESH_ENTITY = dorado.Entity._MESSAGE_REFRESH_ENTITY;
	DataSet.MESSAGE_LOADING_START = dorado.Entity._MESSAGE_LOADING_START;
	DataSet.MESSAGE_LOADING_END = dorado.Entity._MESSAGE_LOADING_END;
	DataSet.getOwnerDataSet = function (data) {
		return(data._observer instanceof dorado.widget.DataSet) ? data._observer : null;
	};
	dorado.widget.DataSetObserver = $class({
		$className: "dorado.widget.DataSetObserver",
		dataSetMessageReceived: function (messageCode, arg) {}
	});
})();
dorado.widget.DataControl = $extend(dorado.widget.DataSetObserver, {
	$className: "dorado.widget.DataControl",
	ATTRIBUTES: {
		dataSet: {
			componentReference: true,
			setter: function (dataSet) {
				if(this._dataSet) {
					this._dataSet.removeObserver(this);
				}
				this._dataSet = dataSet;
				if(dataSet) {
					dataSet.addObserver(this);
				}
			}
		},
		dataPath: {}
	},
	EVENTS: {
		onGetBindingData: {},
		onGetBindingDataType: {}
	},
	_disableBindingCounter: 0,
	disableBinding: function () {
		this._disableBindingCounter++;
	},
	enableBinding: function () {
		if(this._disableBindingCounter > 0) {
			this._disableBindingCounter--;
		}
	},
	getBindingData: function (options) {
		if(!options) {
			options = {};
		}
		if(options.loadMode == null) {
			options.loadMode = "auto";
		}
		var eventArg = {
			options: options,
			processDefault: true
		};
		if(this.getListenerCount("onGetBindingData") > 0) {
			this.fireEvent("onGetBindingData", this, eventArg);
		}
		var data = null;
		if(this._dataSet && eventArg.processDefault) {
			data = this._dataSet.getData(this._dataPath, options);
		} else {
			data = eventArg.data;
		}
		return data;
	},
	getBindingDataType: function (options) {
		if(!options) {
			options = {};
		}
		if(options.loadMode == null) {
			options.loadMode = "auto";
		}
		var eventArg = {
			options: options,
			processDefault: true
		};
		if(this.getListenerCount("onGetBindingDataType") > 0) {
			this.fireEvent("onGetBindingDataType", this, eventArg);
		}
		var dataType = null;
		if(this._dataSet && eventArg.processDefault) {
			dataType = this._dataSet.getDataType(this._dataPath, options);
		} else {
			dataType = eventArg.dataType;
		}
		return dataType;
	},
	dataSetMessageReceived: function (messageCode, arg) {
		if(this._disableBindingCounter == 0 && (!(this instanceof dorado.widget.Control) || this._ready)) {
			if(this.filterDataSetMessage(messageCode, arg)) {
				this.processDataSetMessage(messageCode, arg);
			}
		}
	},
	filterDataSetMessage: function (messageCode, arg) {
		return true;
	},
	processDataSetMessage: dorado._NULL_FUNCTION
});
dorado.widget.PropertyDataControl = $extend(dorado.widget.DataControl, {
	$className: "dorado.widget.PropertyDataControl",
	ATTRIBUTES: {
		dataPath: {
			defaultValue: "#",
			setter: function (dataPath) {
				this._dataPath = this._realDataPath = dataPath;
				this.processComplexProperty();
			}
		},
		property: {
			setter: function (property) {
				this._property = this._realProperty = property;
				this.processComplexProperty();
			}
		}
	},
	processComplexProperty: function () {
		var dataPath = this._realDataPath;
		var property = this._realProperty;
		if(property) {
			var i = property.lastIndexOf(".");
			if(i > 0 && i < property.length - 1) {
				var property1 = property.substring(0, i);
				var property2 = property.substring(i + 1);
				if(dataPath) {
					dataPath += ("." + property1);
				} else {
					dataPath = "#." + property1;
				}
				this._dataPath = dataPath;
				this._property = property2;
			}
		}
	},
	filterDataSetMessage: function (messageCode, arg, data) {
		var b = true;
		switch(messageCode) {
		case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
			b = (arg.property == this._property);
			if(!b) {
				var bindingData = this.getBindingData();
				b = (bindingData == arg.newValue) || dorado.DataUtil.isOwnerOf(bindingData, arg.newValue);
			}
			break;
		case dorado.widget.DataSet.MESSAGE_DELETED:
		case dorado.widget.DataSet.MESSAGE_INSERTED:
			b = false;
			break;
		}
		return b;
	},
	getBindingData: function (options) {
		var realOptions = {
			firstResultOnly: true,
			acceptAggregation: false
		};
		if(typeof options == "String") {
			realOptions.loadMode = options;
		} else {
			dorado.Object.apply(realOptions, options);
		}
		return $invokeSuper.call(this, [realOptions]);
	},
	getBindingPropertyDef: function () {
		if(!this._property) {
			return null;
		}
		var entityDataType = this.getBindingDataType(),
			pd;
		if(entityDataType) {
			var properties = this._property.split("."),
				i = 0;
			while(entityDataType) {
				pd = entityDataType.getPropertyDef(properties[i]);
				if(pd) {
					if(i == properties.length - 1) {
						break;
					} else {
						entityDataType = pd.getDataType();
						if(!entityDataType || !(entityDataType instanceof dorado.EntityDataType)) {
							pd = null;
							break;
						}
					}
				} else {
					break;
				}
				i++;
			}
		}
		return pd;
	},
	getBindingPropertyValue: function () {
		var entity = this.getBindingData();
		return(entity) ? entity.get(this._property) : null;
	},
	getBindingPropertyText: function () {
		var entity = this.getBindingData();
		return(entity) ? entity.getText(this._property) : "";
	}
});
(function () {
	var lastMouseDownTarget, lastMouseDownTimestamp = 0;
	dorado.widget.Control = $extend([dorado.widget.Component, dorado.RenderableElement, dorado.Draggable, dorado.Droppable], {
		$className: "dorado.widget.Control",
		_isDoradoControl: true,
		_ignoreRefresh: 1,
		_parentActualVisible: true,
		focusable: false,
		selectable: true,
		ATTRIBUTES: {
			className: {
				writeBeforeReady: true,
				defaultValue: "d-control"
			},
			exClassName: {},
			ui: {
				defaultValue: "default",
				skipRefresh: true,
				setter: function (ui) {
					if(ui == this._ui) {
						return;
					}
					if(this._dom) {
						if(this._ui) {
							var classNames = [];
							var uis = this._ui.split(",");
							for(var i = 0; i < uis.length; i++) {
								classNames.push(this._className + "-" + uis[i]);
							}
							$fly(this._dom).removeClass(classNames.join(" "));
						}
					}
					this._ui = ui;
					if(this._dom) {
						if(ui) {
							var classNames = [];
							var uis = ui.split(",");
							for(var i = 0; i < uis.length; i++) {
								classNames.push(this._className + "-" + uis[i]);
							}
							$fly(this._dom).addClass(classNames.join(" "));
						}
					}
				}
			},
			width: {
				setter: function (v) {
					this._width = isFinite(v) ? parseInt(v) : v;
					delete this._realWidth;
					this._fixedWidth = !(typeof v == "string" && v.match("%")) || v == "auto";
				}
			},
			height: {
				setter: function (v) {
					this._height = isFinite(v) ? parseInt(v) : v;
					delete this._realHeight;
					this._fixedHeight = !(typeof v == "string" && v.match("%")) || v == "auto";
				}
			},
			renderTo: {
				writeOnce: true,
				writeBeforeReady: true
			},
			renderOn: {
				writeOnce: true,
				writeBeforeReady: true
			},
			visible: {
				defaultValue: true,
				skipRefresh: true,
				setter: function (visible) {
					if(visible == null) {
						visible = true;
					}
					if(this._visible != visible) {
						this._visible = visible;
						this.onActualVisibleChange();
					}
				}
			},
			actualVisible: {
				readOnly: true,
				getter: function () {
					return this.isActualVisible() && this._attached && this._rendered;
				}
			},
			hideMode: {
				skipRefresh: true,
				writeBeforeReady: true,
				defaultValue: "visibility"
			},
			attached: {
				readOnly: true
			},
			focused: {
				readOnly: true
			},
			focusParent: {
				skipRefresh: true,
				getter: function () {
					return this._focusParent || this._parent;
				}
			},
			tip: {
				skipRefresh: true
			},
			layoutConstraint: {
				setter: function (layoutConstraint) {
					if(this._layoutConstraint != layoutConstraint || this._visible || this._hideMode != "display") {
						this._layoutConstraint = layoutConstraint;
						if(this._rendered && this._parent && this._parent._layout) {
							this._parent._layout.refreshControl(this);
						}
						if(this._layoutConstraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT || layoutConstraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
							this.onActualVisibleChange();
						}
					}
				}
			},
			view: {
				skipRefresh: true,
				setter: function (view) {
					if(this._view == view) {
						return;
					}
					$invokeSuper.call(this, [view]);
					if(this._innerControls) {
						this._innerControls.each(function (control) {
							control.set("view", view);
						});
					}
				}
			}
		},
		EVENTS: {
			onCreateDom: {},
			beforeRefreshDom: {},
			onRefreshDom: {},
			onClick: {},
			onDoubleClick: {},
			onMouseDown: {},
			onMouseUp: {},
			onContextMenu: {},
			onFocus: {},
			onBlur: {},
			onKeyDown: {},
			onKeyPress: {},
			onTap: {},
			onDoubleTap: {},
			onTapHold: {},
			onSwipe: {}
		},
		constructor: function (config) {
			this._actualVisible = !dorado.Object.isInstanceOf(this, dorado.widget.FloatControl);
			dorado.widget.Component.prototype.constructor.call(this, config);
			if(dorado.Object.isInstanceOf(this, dorado.widget.FloatControl) && this._floating) {
				this._actualVisible = false;
			}
			if(this._renderTo || this._renderOn) {
				$setTimeout(this, function () {
					if(this._rendered) {
						return;
					}
					this.render();
				}, 0);
			}
		},
		onReady: function () {
			$invokeSuper.call(this);
			if(this._innerControls) {
				jQuery.each(this._innerControls, function (i, control) {
					if(!(control instanceof dorado.widget.Control) && !control._ready) {
						control.onReady();
					}
				});
			}
		},
		destroy: function () {
			if(this._destroyed) {
				return;
			}
			dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
			if(this._innerControls) {
				var controls = this._innerControls.slice(0);
				for(var i = 0, len = controls.length; i < len; i++) {
					controls[i].destroy();
				}
				delete this._innerControls;
			}
			var isClosed = (window.closed || dorado.windowClosed);
			if(!isClosed) {
				if(this._focused) {
					dorado.widget.onControlGainedFocus(this.get("focusParent"));
				}
				if(this._parent) {
					if(this._isInnerControl) {
						this._parent.unregisterInnerControl(this);
					} else {
						this._parent.removeChild(this);
					}
				}
			}
			if(this._modernScroller) {
				this._modernScroller.destroy();
			}
			var dom = this._dom;
			if(dom) {
				delete this._dom;
				try {
					dom.doradoUniqueId = null;
				} catch(e) {}
				if(dorado.windowClosed) {
					$fly(dom).unbind();
				} else {
					$fly(dom).remove();
				}
			}
			dorado.RenderableElement.prototype.destroy.call(this);
			$invokeSuper.call(this);
		},
		doSet: function (attr, value, skipUnknownAttribute, lockWritingTimes) {
			var def = this.ATTRIBUTES[attr];
			if(def && def.innerComponent != null && def.autoRegisterInnerControl !== false) {
				var originComponent = this.doGet(attr);
				if(originComponent) {
					if(originComponent instanceof Array) {
						for(var i = 0; i < originComponent.length; i++) {
							var c = originComponent[i];
							if(c instanceof dorado.widget.Control) {
								this.unregisterInnerControl(c);
							}
						}
					} else {
						if(originComponent instanceof dorado.widget.Control) {
							this.unregisterInnerControl(originComponent);
						}
					}
				}
			}
			$invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);
			if(def) {
				if(def.innerComponent != null && def.autoRegisterInnerControl !== false) {
					var component = this.doGet(attr);
					if(component) {
						if(component instanceof Array) {
							for(var i = 0; i < component.length; i++) {
								var c = component[i];
								if(c instanceof dorado.widget.Control) {
									this.registerInnerControl(c);
								}
							}
						} else {
							if(component.each || typeof component.each == "function") {
								var self = this;
								component.each(function (c) {
									if(c instanceof dorado.widget.Control) {
										self.registerInnerControl(c);
									}
								});
							} else {
								if(component instanceof dorado.widget.Control) {
									this.registerInnerControl(component);
								}
							}
						}
					}
				}
				if(!this._rendered) {
					return;
				}
				if(!this._duringRefreshDom && this._ignoreRefresh < 1 && def && !def.skipRefresh) {
					this.refresh(true);
				}
			}
		},
		setActualVisible: function (actualVisible) {
			if(this._actualVisible != actualVisible) {
				this._actualVisible = actualVisible;
				this.onActualVisibleChange();
			}
		},
		isActualVisible: function () {
			var actualVisible = this._visible && this._actualVisible;
			if(!actualVisible) {
				return false;
			}
			if(this._floating && dorado.Object.isInstanceOf(this, dorado.widget.FloatControl)) {
				return true;
			} else {
				return this._parentActualVisible && this._layoutConstraint != dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT;
			}
		},
		onActualVisibleChange: function () {
			function notifyChildren(control, parentActualVisible) {
				if(control._innerControls) {
					jQuery.each(control._innerControls, function (i, child) {
						if(child._parentActualVisible == parentActualVisible || !(child instanceof dorado.widget.Control)) {
							return;
						}
						child._parentActualVisible = parentActualVisible;
						child.onActualVisibleChange();
					});
				}
			}
			var actualVisible = this.isActualVisible();
			if(this._parentLayout) {
				if(this._hideMode == "display") {
					this._parentLayout.refreshControl(this);
					if(actualVisible && this._rendered && this._shouldRefreshOnVisible && !dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE) {
						this.refresh();
					}
				} else {
					if(!actualVisible || this._rendered && this._shouldRefreshOnVisible && !dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE) {
						this.refresh();
					}
				}
			} else {
				this.refresh();
			}
			notifyChildren(this, actualVisible);
		},
		refresh: function (delay) {
			if(this._duringRefreshDom || !this._rendered || !this._attached) {
				return;
			}
			if(!this.isActualVisible() && !this._forceRefresh && !(this._currentVisible !== undefined && this._currentVisible != this._visible)) {
				this._shouldRefreshOnVisible = !!this._rendered;
				return;
			}
			this._shouldRefreshOnVisible = false;
			if(delay) {
				dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", function () {
					this._duringRefreshDom = true;
					try {
						dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
						if(!this.isActualVisible() && !this._forceRefresh && !(this._currentVisible !== undefined && this._currentVisible != this._visible)) {
							this._shouldRefreshOnVisible = true;
							return;
						}
						this._shouldRefreshOnVisible = false;
						var dom = this.getDom(),
							arg = {
								dom: dom,
								processDefault: true
							};
						if(this.getListenerCount("beforeRefreshDom")) {
							arg.processDefault = false;
							this.fireEvent("beforeRefreshDom", this, arg);
						}
						if(arg.processDefault) {
							this.refreshDom(dom);
							this.onResize();
							this.fireEvent("onRefreshDom", this, arg);
						}
						this.updateModernScroller();
					} finally {
						this._duringRefreshDom = false;
					}
				}, 50);
			} else {
				this._duringRefreshDom = true;
				try {
					dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
					var dom = this.getDom(),
						arg = {
							dom: dom,
							processDefault: true
						};
					if(this.getListenerCount("beforeRefreshDom")) {
						arg.processDefault = false;
						this.fireEvent("beforeRefreshDom", this, arg);
					}
					if(arg.processDefault) {
						this.refreshDom(dom);
						this.onResize();
						this.fireEvent("onRefreshDom", this, arg);
					}
					this.updateModernScroller();
				} finally {
					this._duringRefreshDom = false;
				}
			}
		},
		_refreshDom: function (dom) {
			dom.doradoUniqueId = this._uniqueId;
			if(this._currentVisible !== undefined) {
				if(this._currentVisible != this._visible) {
					if(this._hideMode == "display") {
						if(this._visible) {
							dom.style.display = this._oldDisplay;
						} else {
							this._oldDisplay = dom.style.display;
							dom.style.display = "none";
						}
					} else {
						dom.style.visibility = (this._visible) ? "" : "hidden";
					}
				}
			} else {
				if(!this._visible) {
					if(this._hideMode == "display") {
						this._oldDisplay = dom.style.display;
						dom.style.display = "none";
					} else {
						dom.style.visibility = "hidden";
					}
				}
			}
			var tip = this.get("tip");
			if(tip) {
				this._currentTip = tip;
				dorado.TipManager.initTip(dom, {
					text: tip
				});
			} else {
				if(this._currentTip) {
					dorado.TipManager.deleteTip(dom);
				}
			}
		},
		refreshDom: function (dom) {
			if(!this.selectable) {
				$DomUtils.disableUserSelection(dom);
			}
			try {
				this._refreshDom(dom);
			} catch(e) {}
			var floatClassName = "d-floating";
			if(this._floatingClassName) {
				floatClassName += (" " + this._floatingClassName);
			}
			$fly(dom).toggleClass(floatClassName, !!this._floating);
			this.applyDraggable(dom);
			this.applyDroppable(dom);
			$invokeSuper.call(this, [dom]);
			this._currentVisible = !!this._visible;
		},
		updateModernScroller: function (delay) {
			if(!this._modernScroller) {
				return;
			}
			if(delay) {
				dorado.Toolkits.setDelayedAction(this, "$updateModernScrollerTimerId", function () {
					if(this._modernScroller) {
						this._modernScroller.update();
					}
				}, 50);
			} else {
				this._modernScroller.update();
			}
		},
		getRealWidth: function () {
			if(this._width == "none") {
				return null;
			}
			return(this._realWidth == null) ? this._width : this._realWidth;
		},
		getRealHeight: function () {
			if(this._height == "none") {
				return null;
			}
			return(this._realHeight == null) ? this._height : this._realHeight;
		},
		doResetDimension: function (force) {
			return dorado.RenderableElement.prototype.resetDimension.call(this, force);
		},
		resetDimension: function (forced) {
			if(this._skipResetDimension || !this.isActualVisible()) {
				return;
			}
			var changed = this.doResetDimension(forced) || !this._fixedWidth || !this._fixedHeight;
			if(!this._duringRefreshDom && (changed || !this._currentVisible)) {
				this._skipResetDimension = true;
				this.onResize();
				this._skipResetDimension = false;
			}
			return changed;
		},
		notifySizeChange: function (delay, force) {
			if(this._parentLayout) {
				this._parentLayout.onControlSizeChange(this, delay, force);
			}
		},
		getDom: function () {
			if(this._destroyed) {
				return null;
			}
			if(!this._dom) {
				var dom = this._dom = this.createDom(),
					$dom = $fly(this._dom);
				if(!dom.id) {
					dom.id = "d_" + (this._id || this._uniqueId);
				}
				var className = ((this._inherentClassName) ? this._inherentClassName : this.ATTRIBUTES.className.defaultValue) || "";
				if(this._className && this._className != className) {
					className += (" " + this._className);
				}
				if(this._exClassName) {
					className += (" " + this._exClassName);
				}
				if(this._ui) {
					var uis = this._ui.split(",");
					for(var i = 0; i < uis.length; i++) {
						className += (" " + this._className + "-" + uis[i]);
					}
				}
				if(className) {
					$dom.addClass(className);
				}
				this.applyStyle(dom);
				if(this.focusable) {
					dom.tabIndex = 1;
				}
				var self = this;
				$dom.mousedown(function (evt) {
					if(!self._eventBinded) {
						self._eventBinded = true;
						jQuery(this).click(function (evt) {
							if(!self.processDefaultMouseListener()) {
								return;
							}
							var defaultReturnValue;
							if(self.onClick) {
								defaultReturnValue = self.onClick(evt);
							}
							var arg = {
								button: evt.button,
								event: evt,
								returnValue: defaultReturnValue
							};
							self.fireEvent("onClick", self, arg);
							return arg.returnValue;
						}).bind("dblclick", function (evt) {
							if(!self.processDefaultMouseListener()) {
								return;
							}
							var defaultReturnValue;
							if(self.onDoubleClick) {
								defaultReturnValue = self.onDoubleClick(evt);
							}
							var arg = {
								button: evt.button,
								event: evt,
								returnValue: defaultReturnValue
							};
							self.fireEvent("onDoubleClick", self, arg);
							return arg.returnValue;
						}).mouseup(function (evt) {
							if(!self.processDefaultMouseListener()) {
								return;
							}
							var defaultReturnValue;
							if(self.onMouseUp) {
								defaultReturnValue = self.onMouseUp(evt);
							}
							var arg = {
								button: evt.button,
								event: evt,
								returnValue: defaultReturnValue
							};
							self.fireEvent("onMouseUp", self, arg);
							return arg.returnValue;
						}).bind("contextmenu", function (evt) {
							evt = jQuery.event.fix(evt || window.event);
							var eventArg = {
								event: evt,
								processDefault: true
							};
							if(self.getListenerCount("onContextMenu")) {
								eventArg.processDefault = false;
								self.fireEvent("onContextMenu", self, eventArg);
							}
							if(!eventArg.processDefault) {
								evt.preventDefault();
								evt.returnValue = false;
								return false;
							}
						});
					}
					if(evt.srcElement != lastMouseDownTarget || (new Date() - lastMouseDownTimestamp) > 500) {
						if(dorado.Browser.msie) {
							var nodeName = evt.srcElement && evt.srcElement.nodeName.toLowerCase();
							if(nodeName != "input" && nodeName != "textarea" && nodeName != "select") {
								dorado.widget.setFocusedControl(self);
							}
						} else {
							dorado.widget.setFocusedControl(self);
						}
						lastMouseDownTarget = evt.srcElement;
						lastMouseDownTimestamp = new Date();
					}
					if(!self.processDefaultMouseListener()) {
						return;
					}
					var defaultReturnValue;
					if(self.onMouseDown) {
						defaultReturnValue = self.onMouseDown(evt);
					}
					var arg = {
						button: evt.button,
						event: evt,
						returnValue: defaultReturnValue
					};
					self.fireEvent("onMouseDown", self, arg);
					return arg.returnValue;
				});
				if(this.getListenerCount("onCreateDom")) {
					this.fireEvent("onCreateDom", this, {
						dom: dom
					});
				}
			}
			return this._dom;
		},
		processDefaultMouseListener: function () {
			return !this._disabled;
		},
		doRenderToOrReplace: function (replace, element, nextChildElement) {
			var dom = this.getDom();
			if(!dom) {
				return;
			}
			if(replace) {
				if(!element.parentNode) {
					return;
				}
				element.parentNode.replaceChild(dom, element);
			} else {
				if(!element) {
					element = document.body;
				}
				if(dom.parentNode != element || (nextChildElement && dom.nextSibling != nextChildElement)) {
					if(nextChildElement) {
						element.insertBefore(dom, nextChildElement);
					} else {
						element.appendChild(dom);
					}
				}
			}
			if(this._attached) {
				this.refreshDom(dom);
			}
			this._rendered = true;
			var attached = false,
				renderTarget = this._renderTo || this._renderOn;
			if(!renderTarget && this._parent && this._parent._rendered && this._parent != dorado.widget.View.TOP) {
				attached = this._parent._attached;
			} else {
				var body = dom.ownerDocument.body;
				var node = dom.parentNode;
				while(node) {
					if(node == body) {
						attached = true;
						break;
					}
					node = node.parentNode;
				}
			}
			if(attached) {
				this.onAttachToDocument();
			} else {
				if(this._attached) {
					this.onDetachFromDocument();
				}
			}
		},
		render: function (containerElement, nextChildElement) {
			if(containerElement) {
				this.doRenderToOrReplace(false, containerElement, nextChildElement);
			} else {
				if(this._renderTo) {
					var container = this._renderTo;
					if(typeof container == "string") {
						container = jQuery(container)[0];
					}
					this.doRenderToOrReplace(false, container);
				} else {
					if(this._renderOn) {
						var placeHolder = this._renderOn;
						if(typeof placeHolder == "string") {
							placeHolder = jQuery(placeHolder)[0];
						}
						if(placeHolder) {
							this.doRenderToOrReplace(true, placeHolder);
						}
					} else {
						this.doRenderToOrReplace(false);
					}
				}
			}
		},
		replace: function (elmenent) {
			this.doRenderToOrReplace(true, elmenent);
		},
		unrender: function () {
			if(this._focused) {
				var focusParent = this.get("focusParent");
				dorado.widget.setFocusedControl(focusParent);
			}
			$invokeSuper.call(this);
		},
		onAttachToDocument: function () {
			if(this._rendered && !this._attached) {
				var view = this._view;
				if(view && view != $topView && !view._ready && !view._rendering) {
					view.onReady();
				}
				var dom = this.getDom();
				this._attached = true;
				this._ignoreRefresh--;
				this._duringRefreshDom = true;
				this._skipResize = true;
				var arg = {
					dom: dom,
					processDefault: true
				};
				if(this.getListenerCount("beforeRefreshDom")) {
					arg.processDefault = false;
					this.fireEvent("beforeRefreshDom", this, arg);
				}
				if(arg.processDefault) {
					this.refreshDom(dom);
					this.fireEvent("onRefreshDom", this, arg);
				}
				this._duringRefreshDom = false;
				this._skipResize = false;
				if(this.doOnAttachToDocument) {
					this.doOnAttachToDocument();
				}
				if(this._innerControls) {
					jQuery.each(this._innerControls, function (i, control) {
						control.onAttachToDocument();
					});
				}
				this.onResize();
				this.updateModernScroller();
				if(!this._ready) {
					this.onReady();
				}
			}
		},
		onDetachFromDocument: function () {
			if(this._rendered && this._attached) {
				this._attached = false;
				this._ignoreRefresh++;
				if(this.doOnDetachFromDocument) {
					this.doOnDetachFromDocument();
				}
				if(this._innerControls) {
					jQuery.each(this._innerControls, function (i, control) {
						control.onDetachFromDocument();
					});
				}
			}
		},
		registerInnerControl: function (control) {
			if(!this._innerControls) {
				this._innerControls = [];
			}
			this._innerControls.push(control);
			if(this._attached) {
				control.onAttachToDocument();
			}
			control._isInnerControl = true;
			if(control._parent == window.$topView) {
				window.$topView.removeChild(control);
			}
			control._parent = control._focusParent = this;
			control.set("view", (this instanceof dorado.widget.View) ? this : this.get("view"));
			if(control.parentChanged) {
				control.parentChanged();
			}
		},
		unregisterInnerControl: function (control) {
			if(!this._innerControls) {
				return;
			}
			control.onDetachFromDocument();
			this._innerControls.remove(control);
			control._parent = control._focusParent = null;
			control.set("view", null);
			delete control._isInnerControl;
			if(control.parentChanged) {
				control.parentChanged();
			}
		},
		parentChanged: function () {
			if(!this._ready || this._floating && dorado.Object.isInstanceOf(this, dorado.widget.FloatControl)) {
				return;
			}
			var parent = this._parent;
			var parentActualVisible = (parent) ? parent.isActualVisible() : true;
			if(parentActualVisible != this._parentActualVisible) {
				this.onActualVisibleChange();
			}
		},
		onResize: function () {
			if(this._skipResize) {
				return;
			}
			if(!this.isActualVisible()) {
				this._shouldRefreshOnVisible = true;
				return;
			}
			if(this.doOnResize) {
				this.doOnResize.apply(this, arguments);
			}
		},
		findParent: function (type) {
			var parent = this._parent;
			while(parent) {
				if(dorado.Object.isInstanceOf(parent, type)) {
					return parent;
				}
				parent = parent._parent;
			}
			return null;
		},
		getFocusableSubControls: dorado._NULL_FUNCTION,
		isFocusable: function (deep) {
			if(!this.focusable || !this._rendered || !this.isActualVisible() || !this.getDom() || this._disabled) {
				return false;
			}
			var dom = this.getDom();
			if(dom.disabled || dom.offsetWidth <= 0) {
				return false;
			}
			if(dorado.ModalManager._controlStack.length > 0) {
				if(isFloating = dorado.Object.isInstanceOf(this, dorado.widget.FloatControl) && this._floating) {
					if(dom.style.zIndex < dorado.ModalManager.getMask().style.zIndex) {
						return false;
					}
				} else {
					if(!this.findParent(dorado.widget.FloatControl)) {
						return false;
					}
				}
			}
			if(deep) {
				var child = this,
					parent = child._parent;
				while(parent && parent != $topView) {
					if(!parent._rendered) {
						break;
					}
					if(!parent.isFocusable()) {
						var focusableSubControls = parent.getFocusableSubControls();
						return(focusableSubControls) ? (focusableSubControls.indexOf(child) >= 0) : false;
					}
					if(dorado.Object.isInstanceOf(parent, dorado.widget.FloatControl) && parent._floating) {
						break;
					}
					child = parent;
					parent = child._parent;
				}
			}
			return true;
		},
		setFocus: function () {
			var control = this;
			dorado._LAST_FOCUS_CONTROL = control;
			dorado.Toolkits.setDelayedAction(window, "$setFocusTimerId", function () {
				if(dorado._LAST_FOCUS_CONTROL === control && dorado.widget.focusedControl.peek() !== self) {
					try {
						control.doSetFocus();
						dorado.widget.onControlGainedFocus(control);
					} catch(e) {}
				}
				dorado._LAST_FOCUS_CONTROL = null;
			}, 10);
		},
		doSetFocus: function () {
			var dom = this._dom;
			if(dom) {
				dom.focus();
			}
		},
		onFocus: function () {
			this._focused = true;
			if(this.doOnFocus) {
				this.doOnFocus();
			}
			if(this._className) {
				$fly(this.getDom()).addClass("d-focused " + this._className + "-focused");
			}
			this.fireEvent("onFocus", this);
		},
		onBlur: function () {
			this._focused = false;
			if(this.doOnBlur) {
				this.doOnBlur();
			}
			$fly(this.getDom()).removeClass("d-focused " + this._className + "-focused");
			this.fireEvent("onBlur", this);
		},
		onKeyDown: function (evt) {
			var b = true;
			if(this.getListenerCount("onKeyDown")) {
				var arg = {
					keyCode: evt.keyCode,
					shiftKey: evt.shiftKey,
					ctrlKey: evt.ctrlKey,
					altlKey: evt.altlKey,
					event: evt
				};
				this.fireEvent("onKeyDown", this, arg);
				b = arg.returnValue;
			}
			if(!b) {
				return b;
			}
			var b = this.doOnKeyDown ? this.doOnKeyDown(evt) : true;
			if(!b) {
				return b;
			}
			var p = this.get("parent");
			if(p && !dorado.widget.disableKeyBubble) {
				b = p.onKeyDown(evt);
			}
			return b;
		},
		onKeyPress: function (evt) {
			var b = true;
			if(this.getListenerCount("onKeyPress")) {
				var arg = {
					keyCode: evt.keyCode,
					shiftKey: evt.shiftKey,
					ctrlKey: evt.ctrlKey,
					altlKey: evt.altlKey,
					event: evt
				};
				this.fireEvent("onKeyPress", this, arg);
				b = arg.returnValue;
			}
			if(!b) {
				return b;
			}
			var b = this.doOnKeyPress ? this.doOnKeyPress(evt) : true;
			if(!b) {
				return b;
			}
			var p = this.get("parent");
			if(p && !dorado.widget.disableKeyBubble) {
				b = p.onKeyPress(evt);
			}
			return b;
		},
		initDraggingInfo: function (draggingInfo, evt) {
			$invokeSuper.call(this, arguments);
			draggingInfo.set({
				object: this,
				sourceControl: this
			});
		},
		onDraggingSourceOver: function (draggingInfo, evt) {
			draggingInfo.set({
				targetObject: this,
				targetControl: this
			});
			return $invokeSuper.call(this, arguments);
		},
		onDraggingSourceOut: function (draggingInfo, evt) {
			var retval = $invokeSuper.call(this, arguments);
			draggingInfo.set({
				targetObject: null,
				targetControl: null
			});
			return retval;
		},
		scrollIntoView: function () {
			function doScrollIntoView(container, dom) {
				if(container instanceof dorado.widget.Container) {
					var contentContainer = container.getContentContainer();
					if(contentContainer && $DomUtils.isOwnerOf(dom, contentContainer)) {
						container._modernScroller && container._modernScroller.scrollToElement(dom);
					}
				}
				var parent = container._parent;
				if(parent) {
					doScrollIntoView(parent, dom);
				}
			}
			if(!this.isActualVisible() || !this._rendered) {
				return;
			}
			var container = this._parent;
			if(container) {
				doScrollIntoView(container, this._dom);
			}
		}
	});
	dorado.widget.disableKeyBubble = false;
	dorado.widget.focusedControl = [];
	dorado.widget.onControlGainedFocus = function (control) {
		if(dorado.widget.focusedControl.peek() === control) {
			return;
		}
		var ov = dorado.widget.focusedControl;
		var nv = [];
		if(control) {
			var c = control;
			while(c) {
				nv.push(c);
				var focusParent = c.get("focusParent");
				if(!focusParent) {
					break;
				}
				c = focusParent;
			}
			nv = nv.reverse();
		}
		var i = ov.length - 1;
		for(; i >= 0; i--) {
			var o = ov[i];
			if(o == nv[i]) {
				break;
			}
			if(o.onBlur) {
				o.onBlur();
			}
		}
		dorado.widget.focusedControl = nv;
		i++;
		for(; i < nv.length; i++) {
			if(nv[i].onFocus) {
				nv[i].onFocus();
			}
		}
	};
	dorado.widget.setFocusedControl = function (control, ignorePhyscialFocus, skipGlobalBoardcast) {
		if(dorado.widget.focusedControl.peek() === control) {
			return;
		}
		if(!skipGlobalBoardcast) {
			var topDomainWindow = window;
			do {
				try {
					var parent = topDomainWindow.parent;
					if(parent == null || parent == topDomainWindow) {
						break;
					}
					if(parent.frames.length >= 0) {
						topDomainWindow = parent;
					}
				} catch(e) {
					break;
				}
			} while (topDomainWindow);

			function setFrameBlur(win) {
				try {
					if(win !== window && win.dorado.widget.Control) {
						win.dorado.widget.setFocusedControl(null, true, true);
					}
				} catch(e) {}
				for(var i = 0; i < win.frames.length; i++) {
					setFrameBlur(win.frames[i]);
				}
			}
			setFrameBlur(topDomainWindow);
		}
		if(dorado.Browser.msie && document.activeElement) {
			var activeControl = dorado.widget.Control.findParentControl(document.activeElement);
			if(activeControl && !(activeControl instanceof dorado.widget.View)) {
				var nodeName = document.activeElement.nodeName.toLowerCase();
				if(nodeName == "input" || nodeName == "textarea" || nodeName == "select") {
					return;
				}
			}
		}
		while(control && !control.isFocusable()) {
			control = control.get("focusParent");
		}
		if(control) {
			if(!ignorePhyscialFocus) {
				control.setFocus();
			}
		} else {
			if(document.body) {
				setTimeout(function () {
					if(dorado._LAST_FOCUS_CONTROL === null) {
						if(!ignorePhyscialFocus) {
							document.body.focus();
						}
						dorado.widget.onControlGainedFocus(null);
					}
				}, 0);
			}
		}
	};
	dorado.widget.getMainFocusedControl = function () {
		var v = dorado.widget.focusedControl;
		for(var i = v.length - 1; i >= 0; i--) {
			if(!v[i]._focusParent) {
				return v[i];
			}
		}
		return v[0];
	};
	dorado.widget.getFocusedControl = function () {
		var v = dorado.widget.focusedControl;
		return v.peek();
	};
	dorado.widget.findFocusableControlInElement = function (element) {
		function findInChildren(element) {
			var el = element.firstChild,
				control = null;
			while(el) {
				control = findInChildren(el);
				if(control) {
					break;
				}
				if(el.doradoUniqueId) {
					var c = dorado.widget.ViewElement.ALL[el.doradoUniqueId];
					if(c && c.isFocusable()) {
						control = c;
						break;
					}
				}
				el = el.nextSibling;
			}
			return control;
		}
		return findInChildren(element);
	};

	function findFocusableControl(control, options) {
		var focusableControls, subControls = control.getFocusableSubControls();
		if(control.isFocusable()) {
			focusableControls = [control];
		}
		if(subControls && subControls.length) {
			if(focusableControls) {
				focusableControls = subControls.concat(focusableControls);
			} else {
				focusableControls = subControls;
			}
		}
		var focusableControl = null;
		if(focusableControls) {
			var reverse = false,
				from = null;
			if(options) {
				reverse = options.reverse;
				from = options.from;
			}
			if(reverse) {
				focusableControls.reverse();
			}
			var start = 0;
			if(from) {
				start = focusableControls.indexOf(from) + 1;
			}
			for(var i = start; i < focusableControls.length; i++) {
				var c = focusableControls[i];
				if(c && c instanceof dorado.widget.Control) {
					if(c != control && dorado.Object.isInstanceOf(c, dorado.widget.FloatControl) && c._floating) {
						continue;
					}
					if(c == control) {
						focusableControl = c;
					} else {
						focusableControl = findFocusableControl(c, {
							reverse: reverse
						});
					}
					if(focusableControl) {
						break;
					}
				}
			}
		}
		return focusableControl;
	}

	function findNext(from) {
		var control = null,
			parent = from._focusParent || from._parent;
		if(parent) {
			control = findFocusableControl(parent, {
				from: from
			});
		}
		return control;
	}

	function findPrevious(from) {
		var control = null,
			parent = from._focusParent || from._parent;
		if(parent) {
			control = findFocusableControl(parent, {
				from: from,
				reverse: true
			});
		}
		return control;
	}
	dorado.widget.findNextFocusableControl = function (from) {
		var from = from || dorado.widget.getFocusedControl();
		while(from) {
			var control = findNext(from);
			if(control) {
				control = findFocusableControl(control);
			}
			if(control) {
				return control;
			}
			from = from._focusParent || from._parent;
		}
		var floatControls = dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS;
		for(var i = 0; i < floatControls.length; i++) {
			from = floatControls[i];
			var control = findFocusableControl(from);
			if(control) {
				return control;
			}
		}
		return findFocusableControl($topView);
	};
	dorado.widget.findPreviousFocusableControl = function (control) {
		var from = from || dorado.widget.getFocusedControl(),
			control;
		control = findFocusableControl(from, {
			from: from,
			reverse: true
		});
		if(control) {
			return control;
		}
		while(from) {
			control = findPrevious(from);
			if(control) {
				return control;
			}
			from = from._focusParent || from._parent;
		}
		var floatControls = dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS;
		for(var i = floatControls.length - 1; i >= 0; i--) {
			from = floatControls[i];
			control = findFocusableControl(from, {
				reverse: true
			});
			if(control) {
				return control;
			}
		}
		return findFocusableControl($topView, {
			reverse: true
		});
	};
	dorado.widget.Control.findParentControl = function (element, type) {
		function find(win, dom, className) {
			var control = null;
			do {
				var control;
				if(dom.doradoUniqueId) {
					control = win.dorado.widget.ViewElement.ALL[dom.doradoUniqueId];
				}
				if(control) {
					if(className) {
						if(control.constructor.className === className) {
							break;
						}
					} else {
						break;
					}
				}
				dom = dom.parentNode;
			} while (dom != null);
			if(!control && win.parent) {
				var parentFrames;
				try {
					parentFrames = win.parent.jQuery("iframe,frame");
				} catch(e) {}
				if(parentFrames) {
					var frame;
					parentFrames.each(function () {
						if(this.contentWindow == win) {
							frame = this;
							return false;
						}
					});
					if(frame) {
						control = find(win.parent, frame, className);
					}
				}
			}
			return control;
		}
		var className;
		if(typeof type == "function") {
			className = type.className;
		} else {
			if(type) {
				className = type + "";
			}
		}
		return find(window, element, className);
	};
	dorado.widget.findParentControl = dorado.widget.Control.findParentControl;
})();
dorado._queueObject = {};
dorado.queue = function (namespace, fn) {
	if(!namespace) {
		return;
	}
	var queue = dorado._queueObject[namespace];
	if(!queue) {
		queue = dorado._queueObject[namespace] = [];
	}
	queue.push(fn);
	if(!queue.processing) {
		dorado.dequeue(namespace);
	}
};
dorado.dequeue = function (namespace) {
	if(!namespace) {
		return true;
	}
	var queue = dorado._queueObject[namespace];
	if(queue) {
		if(queue.length > 0) {
			queue.processing = true;
			var fn = queue.shift();
			fn.call(null, []);
		} else {
			queue.processing = false;
		}
	}
};
(function () {
	var SHOWHIDE_SUFFIX = "_SHOWHIDE";
	var queue = [],
		needUseModal = false,
		modalKey = "DORADO_TOUCH_MODAL";
	jQuery(function () {
		document.onclick = function () {
			if(queue.length > 0) {
				queue.forEach(function (fn) {
					setTimeout(function () {
						fn && fn();
					}, 400);
				});
				queue.splice(0, queue.length);
			}
		};
	});
	dorado.doOnBodyClick = function (fn) {
		queue.push(fn);
	};
	var layerModalPool = new dorado.util.ObjectPool({
		makeObject: function () {
			var dom = document.createElement("div");
			$fly(dom).css({
				position: "absolute",
				left: 0,
				top: 0,
				width: "100%",
				height: "100%",
				opacity: 0.5,
				background: "transparent",
				zIndex: 1000,
				display: "none"
			}).click(function () {
				layerModalPool.returnObject(this);
			});
			document.body.appendChild(dom);
			return dom;
		},
		passivateObject: function (dom) {
			var control = jQuery.data(dom, modalKey);
			if(control) {
				control._modalDom = null;
			}
			$fly(dom).css("display", "none");
		}
	});
	dorado.widget.FloatControl = $class({
		$className: "dorado.widget.FloatControl",
		ATTRIBUTES: {
			floating: {
				defaultValue: true,
				writeBeforeReady: true,
				setter: function (floating) {
					if(this._floating == floating) {
						return;
					}
					var attributeWatcher = this.getAttributeWatcher();
					if(attributeWatcher.getWritingTimes("visible") == 0) {
						this._visible = !floating;
					}
					this._actualVisible = !floating;
					this._floating = floating;
					this.onActualVisibleChange();
				}
			},
			floatingClassName: {
				writeBeforeReady: true
			},
			visible: {
				defaultValue: false,
				setter: function (visible) {
					if(visible == null) {
						visible = !this._floating;
					}
					$invokeSuper.call(this, [visible]);
				}
			},
			animateType: {
				defaultValue: "zoom",
				skipRefresh: true
			},
			showAnimateType: {
				skipRefresh: true
			},
			hideAnimateType: {
				skipRefresh: true
			},
			animateTarget: {
				skipRefresh: true
			},
			left: {},
			top: {},
			center: {
				skipRefresh: true
			},
			anchorTarget: {
				skipRefresh: true
			},
			offsetLeft: {
				skipRefresh: true
			},
			offsetTop: {
				skipRefresh: true
			},
			align: {
				skipRefresh: true
			},
			vAlign: {
				skipRefresh: true
			},
			autoAdjustPosition: {
				skipRefresh: true,
				defaultValue: true
			},
			handleOverflow: {
				skipRefresh: true,
				defaultValue: true
			},
			modal: {
				skipRefresh: true
			},
			modalType: {
				skipRefresh: true,
				defaultValue: "dark"
			},
			shadowMode: {
				defaultValue: "sides"
			},
			focusAfterShow: {
				defaultValue: true
			},
			continuedFocus: {}
		},
		EVENTS: {
			beforeShow: {},
			onShow: {},
			afterShow: {},
			beforeHide: {},
			onHide: {},
			afterHide: {},
			beforeClose: {},
			onClose: {}
		},
		show: function (options) {
			if(typeof options == "function") {
				var callback = options;
				options = {
					callback: callback
				};
			} else {
				options = options || {};
			}
			var control = this;
			var attrs = ["center", "autoAdjustPosition", "handleOverflow", "gapX", "gapY", "offsetLeft", "offsetTop", "align", "vAlign", "handleOverflow", "anchorTarget"];
			for(var i = 0; i < attrs.length; i++) {
				var attr = attrs[i],
					value = options[attr];
				if(value === undefined) {
					options[attr] = control["_" + attr];
				}
			}
			if(!options.overflowHandler && control.doHandleOverflow) {
				options.overflowHandler = $scopify(control, control.doHandleOverflow);
			}
			dorado.queue(control._id + SHOWHIDE_SUFFIX, function () {
				options = options || {};
				if(!control._rendered) {
					var renderTo = control._renderTo;
					if(renderTo) {
						if(renderTo instanceof dorado.widget.Container) {
							renderTo = renderTo.get("containerDom");
						} else {
							if(renderTo instanceof dorado.widget.Control) {
								renderTo = renderTo.getDom();
							} else {
								if(typeof renderTo == "string") {
									renderTo = jQuery(document.body).find(renderTo)[0];
								} else {
									if(!renderTo.nodeName) {
										renderTo = null;
									}
								}
							}
						}
					}
					var oldVisible = control._visible,
						oldActualVisible = control._actualVisible;
					control._visible = true;
					dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE = true;
					control.setActualVisible(true);
					control.render(renderTo);
					control._visible = oldVisible;
					dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE = false;
					control.setActualVisible(oldActualVisible);
				}
				if(dorado.Browser.msie) {
					control.initObjectShimForIE();
				}
				control.doShow.apply(control, [options]);
			});
		},
		initObjectShimForIE: function () {
			if(!dorado.useObjectShim || this._objectShimInited) {
				return;
			}
			var iframe = $DomUtils.xCreate({
				tagName: "iframe",
				style: {
					position: "absolute",
					visibility: "inherit",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					zIndex: -1,
					filter: "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)"
				},
				src: "about:blank"
			});
			this._dom.appendChild(iframe);
			this._objectShimInited = true;
		},
		doShow: function (options) {
			var control = this,
				dom = control.getDom(),
				anim = true,
				handleModal = true;
			$fly(dom).css({
				display: "",
				visibility: "hidden",
				left: -99999,
				top: -99999
			});
			var arg = {};
			control.fireEvent("beforeShow", control, arg);
			if(arg.processDefault === false) {
				dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
				return;
			}
			if(control._visible) {
				handleModal = false;
			}
			control._visible = true;
			control.setActualVisible(true);
			var $dom = $fly(dom);
			$dom.css({
				display: "",
				visibility: "hidden"
			});
			if(control._shadowMode != "none") {
				$dom.shadow({
					mode: control._shadowMode || "sides"
				});
			}
			var position = control.getShowPosition(options);
			options.position = position;
			options.animateTarget = control._animateTarget;
			if(needUseModal) {
				if(!control._modalDom) {
					control._modalDom = layerModalPool.borrowObject();
					jQuery.data(control._modalDom, modalKey, control);
				}
				control._modalDom.style.display = "";
			}
			if(handleModal && control._modal) {
				dorado.ModalManager.show(dom, dorado.widget.FloatControl.modalTypeClassName[control._modalType]);
			}
			var animateType = options.animateType || control._showAnimateType || control._animateType;
			if(anim && animateType != "none") {
				control.fireEvent("onShow", control);
				if(options.callback) {
					options.callback.apply(control.get("view"), [control]);
				}
				var behavior = dorado.widget.FloatControl.behaviors[animateType];
				if(typeof behavior.show == "function") {
					behavior.show.apply(control, [options]);
				}
			} else {
				$fly(dom).css(position);
				control.fireEvent("onShow", control);
				if(options.callback) {
					options.callback.apply(control.get("view"), [control]);
				}
				control.doAfterShow.apply(control, [options]);
			}
		},
		doAfterShow: function () {
			var control = this,
				dom = control.getDom();
			if(dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS.indexOf(control) < 0) {
				dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS.push(control);
			}
			if(dom) {
				jQuery(dom).css({
					visibility: "",
					display: ""
				}).bringToFront();
				var continuedFocus = control._continuedFocus === undefined ? control._modal : !!control._continuedFocus;
				if(continuedFocus) {
					var focusParent = dorado.widget.getFocusedControl();
					var parent = focusParent;
					while(parent) {
						if(parent == control) {
							focusParent = parent.get("focusParent");
							break;
						}
						parent = parent.get("focusParent");
					}
					control._focusParent = focusParent;
				}
				if(control._focusAfterShow || control._modal) {
					control.setFocus();
				}
				control.fireEvent("afterShow", control);
			}
			dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
		},
		getShowPosition: function (options) {
			var control = this,
				anchorTarget = options.anchorTarget,
				position = options.position,
				dom = control.getDom(),
				event = options.event,
				fixedElement, result;
			if(anchorTarget) {
				if(anchorTarget instanceof dorado.widget.Control) {
					fixedElement = anchorTarget._dom;
				} else {
					if(dorado.Object.isInstanceOf(anchorTarget, dorado.RenderableElement)) {
						fixedElement = anchorTarget._dom;
					} else {
						if(typeof anchorTarget == "string") {
							fixedElement = jQuery(anchorTarget)[0];
						} else {
							fixedElement = anchorTarget;
						}
					}
				}
				result = $DomUtils.dockAround(dom, fixedElement, options);
			} else {
				if(position) {
					result = $DomUtils.locateIn(dom, options);
				} else {
					if(event) {
						options.position = {
							left: event.pageX,
							top: event.pageY
						};
						result = $DomUtils.locateIn(dom, options);
					} else {
						if(options.center && control._left == undefined && control._top == undefined) {
							var docSize = {
								width: $fly(window).width(),
								height: $fly(window).height()
							};
							control._left = (docSize.width - $fly(dom).width()) / 2 + jQuery(window).scrollLeft();
							control._top = (docSize.height - $fly(dom).height()) / 2 + jQuery(window).scrollTop();
						}
						options.position = {
							left: control._left || 0,
							top: control._top || 0
						};
						result = $DomUtils.locateIn(dom, options);
					}
				}
			}
			return result;
		},
		hide: function (options) {
			var control = this,
				args = arguments;
			if(!control._visible) {
				dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
				return;
			}
			dorado.queue(control._id + SHOWHIDE_SUFFIX, function () {
				var arg = {};
				control.fireEvent("beforeHide", control, arg);
				if(arg.processDefault === false) {
					dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
					return;
				} else {
					if(control.doBeforeHide) {
						control.doBeforeHide();
					}
				}
				var focused = control._focused;
				if(focused) {
					var focusParent = control._focusParent || control._parent;
					while(focusParent) {
						if(focusParent.isFocusable()) {
							dorado.widget.setFocusedControl(focusParent);
							break;
						}
						focusParent = focusParent._focusParent || focusParent._parent;
					}
				}
				if(focused && dorado.Browser.msie) {
					dorado.widget.Control.IGNORE_FOCUSIN_EVENT = true;
				}
				if(control.doHide) {
					control.doHide.apply(control, args);
				}
				if(focused && dorado.Browser.msie) {
					dorado.widget.Control.IGNORE_FOCUSIN_EVENT = false;
				}
			});
		},
		doHide: function (options) {
			var control = this,
				dom = control._dom;
			if(dom) {
				options = options || {};
				if(control._modal) {
					dorado.ModalManager.hide(dom);
				}
				if(needUseModal) {
					var hideModalLayer = function () {
						if(control._modalDom) {
							control._modalDom.style.display = "none";
							layerModalPool.returnObject(control._modalDom);
							control._modalDom = null;
						}
					};
					dorado.doOnBodyClick(hideModalLayer);
					setTimeout(hideModalLayer, 1000);
				}
				control._visible = false;
				control.setActualVisible(false);
				dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS.remove(control);
				var animateType = options.animateType || control._hideAnimateType || control._animateType;
				options.animateTarget = control._animateTarget;
				if(animateType != "none") {
					var behavior = dorado.widget.FloatControl.behaviors[animateType];
					if(typeof behavior.hide == "function") {
						behavior.hide.apply(control, [options]);
					}
				} else {
					control.doAfterHide();
				}
			}
		},
		doAfterHide: function () {
			var control = this,
				dom = control._dom;
			control.fireEvent("onHide", control);
			jQuery(dom).unshadow().css({
				visibility: "hidden",
				display: "none"
			});
			control._currentVisible = false;
			control.fireEvent("afterHide", control);
			dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
			var continuedFocus = control._continuedFocus === undefined ? control._modal : !!control._continuedFocus;
			if(continuedFocus) {
				control._focusParent = null;
			}
		}
	});
	dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS = [];
	dorado.widget.FloatControl.layerModalPool = layerModalPool;
	var slideShow = function (options, safe) {
		var control = this,
			align = options.align,
			vAlign = options.vAlign,
			direction = options.direction,
			dom = control._dom;
		$fly(dom).css("visibility", "");
		if(!direction && (vAlign && align)) {
			if(vAlign.indexOf("inner") != -1) {
				direction = align.indexOf("right") != -1 ? "l2r" : "r2l";
			} else {
				direction = vAlign.indexOf("bottom") != -1 ? "t2b" : "b2t";
			}
		}
		direction = direction || "t2b";
		control._slideInDir = direction;
		var position = options.position || {};
		jQuery(dom).css(position).bringToFront()[safe ? "safeSlideIn" : "slideIn"]({
			duration: options.animateDuration || 200,
			easing: options.animateEasing,
			direction: direction,
			complete: function () {
				control.doAfterShow.apply(control, [options]);
				dom.style.display = "";
			}
		});
	};
	var slideHide = function (options, safe) {
		var control = this,
			dom = control._dom,
			direction = control._slideInDir;
		switch(direction) {
		case "l2r":
			direction = "r2l";
			break;
		case "r2l":
			direction = "l2r";
			break;
		case "b2t":
			direction = "t2b";
			break;
		case "t2b":
			direction = "b2t";
			break;
		}
		control._slideInDir = null;
		jQuery(dom)[safe ? "safeSlideOut" : "slideOut"]({
			direction: direction,
			duration: options.animateDuration || 200,
			easing: options.animateEasing,
			complete: function () {
				control.doAfterHide.apply(control, arguments);
			}
		});
	};
	dorado.widget.FloatControl.modalTypeClassName = {
		dark: "d-modal-mask",
		transparent: "d-modal-mask-transparent"
	};
	dorado.widget.FloatControl.behaviors = {
		zoom: {
			show: function (options) {
				var control = this,
					dom = control._dom;
				jQuery(dom).zoomIn(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function () {
						control.doAfterShow.apply(control, [options]);
					}
				}));
			},
			hide: function (options) {
				var control = this,
					dom = control._dom;
				jQuery(dom).css("visibility", "hidden").zoomOut(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function () {
						control.doAfterHide.apply(control, arguments);
					}
				}));
			}
		},
		flip: {
			show: function (options) {
				var control = this,
					dom = control._dom;
				jQuery(dom).css("visibility", "").flipIn(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function () {
						control.doAfterShow.apply(control, [options]);
					}
				}));
			},
			hide: function (options) {
				var control = this,
					dom = control._dom;
				jQuery(dom).flipOut(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function () {
						control.doAfterHide.apply(control, arguments);
					}
				}));
			}
		},
		modernZoom: {
			show: function (options) {
				var control = this,
					dom = control._dom;
				jQuery(dom).css("visibility", "").modernZoomIn(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function () {
						control.doAfterShow.apply(control, [options]);
					}
				}));
			},
			hide: function (options) {
				var control = this,
					dom = control._dom;
				jQuery(dom).modernZoomOut(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function () {
						control.doAfterHide.apply(control, arguments);
					}
				}));
			}
		},
		slide: {
			show: function (options) {
				slideShow.apply(this, [options]);
			},
			hide: function (options) {
				slideHide.apply(this, [options]);
			}
		},
		safeSlide: {
			show: function (options) {
				slideShow.apply(this, [options, true]);
			},
			hide: function (options) {
				slideHide.apply(this, [options, true]);
			}
		},
		fade: {
			show: function (options) {
				var control = this,
					dom = control._dom;
				jQuery(dom).bringToFront().css({
					visibility: "",
					opacity: 0
				}).animate({
					opacity: 1
				}, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function () {
						$fly(dom).css({
							opacity: ""
						});
						control.doAfterShow.apply(control, [options]);
					}
				});
			},
			hide: function (options) {
				var control = this,
					dom = control._dom;
				jQuery(dom).animate({
					opacity: 0
				}, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function () {
						$fly(dom).css({
							opacity: ""
						});
						control.doAfterHide.apply(control, arguments);
					}
				});
			}
		}
	};
})();
(function () {
	var fireParentChanged = true;
	dorado.widget.Container = $extend(dorado.widget.Control, {
		$className: "dorado.widget.Container",
		ATTRIBUTES: {
			className: {
				defaultValue: "d-container"
			},
			layout: {
				setter: function (layout) {
					var oldLayout = this._layout,
						controls;
					if(oldLayout) {
						oldLayout.disableRendering();
						oldLayout.set("container", null);
						controls = [];
						oldLayout._regions.each(function (region) {
							controls.push(region.control);
						});
						oldLayout.removeAllControls();
						oldLayout.enableRendering();
						oldLayout.onDetachFromDocument();
					}
					if(layout && !(layout instanceof dorado.widget.layout.Layout)) {
						layout = dorado.Toolkits.createInstance("layout", layout, function (type) {
							type = type || "Dock";
							return dorado.util.Common.getClassType("dorado.widget.layout." + type + "Layout", true);
						});
					}
					this._layout = layout;
					if(layout) {
						layout.set("container", this);
						if(controls && controls.length) {
							layout.disableRendering();
							controls.each(function (control) {
								layout.addControl(control);
							});
							layout.enableRendering();
						}
						if(this._attached && layout._regions.size == 0 && !layout._rendered) {
							layout.onAttachToDocument(this.getContentContainer());
						}
					}
				},
				getter: function () {
					if(this._layout === undefined) {
						this._ignoreRefresh++;
						try {
							this.createDefaultLayout();
						} finally {
							this._ignoreRefresh--;
						}
					}
					return this._layout;
				}
			},
			children: {
				skipRefresh: true,
				setter: function (children) {
					if(!children || children.length < 1) {
						return;
					}
					var container = this;
					var optimized = (AUTO_APPEND_TO_TOPVIEW === false);
					if(!optimized) {
						AUTO_APPEND_TO_TOPVIEW = false;
					}
					var layout = container._layout;
					if(layout) {
						layout.disableRendering();
					}
					if(container._children.length) {
						container._children.each(function (child) {
							container.removeChild(child);
						});
					}
					for(var i = 0; i < children.length; i++) {
						var child = children[i];
						if(child instanceof dorado.widget.Component) {
							container.addChild(child);
						} else {
							if(child.$type) {
								container.addChild(this.createInnerComponent(child));
							}
						}
					}
					if(!optimized) {
						AUTO_APPEND_TO_TOPVIEW = true;
					}
					if(layout) {
						layout.enableRendering();
						layout.refresh();
					}
				}
			},
			contentOverflow: {},
			contentOverflowX: {},
			contentOverflowY: {},
			view: {
				setter: function (view) {
					if(this._view == view) {
						return;
					}
					var container = this;
					$invokeSuper.call(container, [view]);
					container._children.each(function (child) {
						if(container._view) {
							child.set("view", null);
						}
						child.set("view", view);
					});
				}
			},
			containerDom: {
				readOnly: true,
				getter: function () {
					if(!this._dom) {
						this.getDom();
					}
					return this.getContentContainer();
				}
			},
			containerUi: {
				defaultValue: "default"
			}
		},
		constructor: function (config) {
			this._contentContainerVisible = true;
			this._children = new dorado.util.KeyedList(dorado._GET_ID);
			var childrenConfig;
			if(config && config.children) {
				childrenConfig = config.children;
				delete config.children;
			}
			this._skipOnCreateListeners = (this._skipOnCreateListeners || 0) + 1;
			$invokeSuper.call(this, [config]);
			this._skipOnCreateListeners--;
			if(childrenConfig) {
				config.children = childrenConfig;
				this.set("children", childrenConfig);
			}
			if(!(this._skipOnCreateListeners > 0) && this.getListenerCount("onCreate")) {
				this.fireEvent("onCreate", this);
			}
		},
		createDefaultLayout: function () {
			this.set("layout", new dorado.widget.layout.DockLayout());
		},
		onReady: function () {
			this._children.each(function (child) {
				if(!(child instanceof dorado.widget.Control) && !child._ready) {
					child.onReady();
				}
			});
			$invokeSuper.call(this);
			this._children.each(function (child) {
				if(child._floating && dorado.Object.isInstanceOf(child, dorado.widget.FloatControl) && !child._ready && child._visible) {
					child.show();
				}
			});
		},
		destroy: function () {
			var children = this._children.toArray();
			for(var i = 0; i < children.length; i++) {
				children[i].destroy();
			}
			$invokeSuper.call(this);
		},
		onActualVisibleChange: function () {
			function notifyChildren(control, parentActualVisible) {
				control._children.each(function (child) {
					if(child._parentActualVisible == parentActualVisible || !(child instanceof dorado.widget.Control)) {
						return;
					}
					child._parentActualVisible = parentActualVisible;
					child.onActualVisibleChange();
				});
			}
			$invokeSuper.call(this);
			notifyChildren(this, this.isActualVisible());
		},
		doRenderToOrReplace: function (replace, element, nextChildElement) {
			if(replace && this._children.size == 0 && element.childNodes.length > 0) {
				var children = [];
				for(var i = 0; i < element.childNodes.length; i++) {
					children.push(element.childNodes[i]);
				}
				if(dorado.widget.HtmlContainer) {
					var htmlContrainer = new dorado.widget.HtmlContainer({
						content: children
					});
					this.addChild(htmlContrainer);
				} else {
					$fly(this.getContentContainer()).append(children);
				}
			}
			if(!this._ready) {
				this._children.each(function (child) {
					if(!(child instanceof dorado.widget.Control) && !child._ready) {
						child.onReady();
					}
				});
			}
			$invokeSuper.call(this, [replace, element, nextChildElement]);
		},
		addChild: function (component) {
			if(component._parent) {
				fireParentChanged = false;
				if(component._parent.removeChild) {
					component._parent.removeChild(component);
				}
				fireParentChanged = true;
			}
			this._children.insert(component);
			component._parent = this;
			component.set("view", (this instanceof dorado.widget.View) ? this : this.get("view"));
			if(fireParentChanged && component.parentChanged) {
				component.parentChanged();
			}
			if(component instanceof dorado.widget.Control) {
				var parentActualVisible = this.isActualVisible();
				if(component._parentActualVisible != parentActualVisible) {
					component._parentActualVisible = parentActualVisible;
					component.onActualVisibleChange();
				}
				var layout = this.get("layout");
				if(layout) {
					if(!(dorado.Object.isInstanceOf(component, dorado.widget.FloatControl) && component._floating)) {
						var shouldFireOnAttach = (this._attached && layout._regions.size == 0 && !layout._rendered);
						layout.addControl(component);
						if(shouldFireOnAttach) {
							layout.onAttachToDocument(this.getContentContainer());
						}
					}
				}
				if(this._rendered) {
					this.updateModernScroller(true);
				}
			}
			if(!(component instanceof dorado.widget.Control) && !component._ready && this._ready) {
				component.onReady.call(component);
			}
		},
		removeChild: function (component) {
			this._children.remove(component);
			component.set("view", null);
			component._parent = null;
			if(fireParentChanged && component.parentChanged) {
				component.parentChanged();
			}
			if(component instanceof dorado.widget.Control) {
				var layout = this._layout;
				if(layout) {
					layout.removeControl(component);
				}
				if(this._rendered) {
					this.updateModernScroller(true);
				}
			}
		},
		removeAllChildren: function () {
			var layout = this._layout;
			if(layout) {
				layout._disableRendering = true;
			}
			this._children.each(function (child) {
				this.removeChild(child);
			}, this);
			if(layout) {
				layout._disableRendering = false;
				layout.refresh();
			}
		},
		createDom: function () {
			var dom = $DomUtils.xCreate({
				tagName: "DIV",
				content: {
					tagName: "DIV",
					style: {
						width: "100%",
						height: "100%"
					}
				}
			});
			this._container = dom.firstChild;
			return dom;
		},
		getContentContainer: function () {
			return this._container || this.getDom();
		},
		getContentContainerSize: function () {
			if(this._className == "d-container" && !this._exClassName) {
				var width = this.getRealWidth(),
					height = this.getRealHeight();
				if(typeof width === "string" && width.endsWith("px")) {
					width = parseInt(width);
				}
				if(typeof height === "string" && height.endsWith("px")) {
					height = parseInt(height);
				}
				if(width >= 0 && height >= 0) {
					return [width, height];
				}
				var contentContainer = this.getContentContainer();
				if(!(width >= 0)) {
					width = contentContainer.style.width || -1;
					if(typeof width === "string" && width.endsWith("px")) {
						width = parseInt(width);
					}
					if(!(width >= 0)) {
						width = contentContainer.clientWidth || contentContainer.offsetWidth;
					}
				}
				if(!(height >= 0)) {
					height = contentContainer.style.height || -1;
					if(typeof height === "string" && height.endsWith("px")) {
						height = parseInt(height);
					}
					if(!(height >= 0)) {
						height = contentContainer.clientHeight || contentContainer.offsetHeight;
					}
				}
				return [width, height];
			} else {
				var contentContainer = this.getContentContainer();
				var width = contentContainer.style.width || -1;
				if(typeof width === "string" && width.endsWith("px")) {
					width = parseInt(width);
				}
				if(!(width >= 0)) {
					width = contentContainer.clientWidth || contentContainer.offsetWidth;
				}
				var height = contentContainer.style.height || -1;
				if(typeof height === "string" && height.endsWith("px")) {
					height = parseInt(height);
				}
				if(!(height >= 0)) {
					height = contentContainer.clientHeight || contentContainer.offsetHeight;
				}
				return [width, height];
			}
		},
		setContentContainerVisible: function (visible) {
			this._children.each(function (child) {
				if(child instanceof dorado.widget.Control) {
					child.setActualVisible(visible);
				}
			});
			this._contentContainerVisible = visible;
			var layout = this._layout;
			if(layout && visible && !(layout._regions.size == 0 && !layout._rendered)) {
				layout.onAttachToDocument(this.getContentContainer());
			}
		},
		doOnAttachToDocument: function () {
			var overflowX = (!this._contentOverflowX) ? this._contentOverflow : this._contentOverflowX;
			var overflowY = (!this._contentOverflowY) ? this._contentOverflow : this._contentOverflowY;
			overflowX = overflowX || "auto";
			overflowY = overflowY || "auto";
			var contentCt = this.getContentContainer();
			if(contentCt) {
				if(contentCt.nodeType && contentCt.nodeType == 1 && (overflowX == "auto" || overflowY == "auto" || overflowX == "scroll" || overflowY == "scroll")) {
					contentCt.style.overflowX = overflowX;
					contentCt.style.overflowY = overflowY;
					this._modernScroller = $DomUtils.modernScroll(contentCt, {
						autoDisable: true
					});
				}
				if(dorado.Browser.msie && dorado.Browser.version < 8) {
					$fly(contentCt).addClass("d-relative");
				}
				if(this._containerUi) {
					$fly(contentCt).addClass("d-container-ui-" + this._containerUi);
				}
			}
			var layout = this._layout;
			if(this._contentContainerVisible && layout && !(layout._regions.size == 0 && !layout._rendered)) {
				layout.onAttachToDocument(contentCt);
			}
		},
		doOnDetachToDocument: function () {
			var layout = this._layout;
			if(layout) {
				layout.onDetachToDocument();
			}
		},
		doResetDimension: function (force) {
			var changed = $invokeSuper.call(this, [force]);
			this._useOriginalWidth = this._useOriginalHeight = true;
			return changed;
		},
		doOnResize: function () {
			var container = this;
			dorado.Toolkits.cancelDelayedAction(container, "$notifySizeChangeTimerId");
			var layout = container._layout;
			if(container._contentContainerVisible && layout && layout._attached) {
				layout.onResize();
			}
			this.processContentSize();
		},
		onContentSizeChange: function () {
			if(!this._rendered || !this._layout || !this._layout._attached) {
				return;
			}
			this.processContentSize();
			this.updateModernScroller();
		},
		processContentSize: function () {
			if(!this._layout) {
				return;
			}
			var dom = this._dom,
				containerDom = this.getContentContainer(),
				layoutDom = this._layout.getDom();
			var overflowX = (!this._contentOverflowX) ? this._contentOverflow : this._contentOverflowX;
			var overflowY = (!this._contentOverflowY) ? this._contentOverflow : this._contentOverflowY;
			var newWidth, newHeight, containerDomSize;
			if(overflowX == "visible" || !this.getRealWidth()) {
				containerDomSize = this.getContentContainerSize();
				var edgeWidth = dom.offsetWidth - containerDom.offsetWidth;
				var width = layoutDom.offsetWidth + edgeWidth;
				if(layoutDom.offsetWidth > containerDomSize[0]) {
					newWidth = width;
				} else {
					if(!this._useOriginalWidth && width < this._currentOffsetWidth) {
						var parent = this._parent,
							containerToRefresh = this;
						while(parent) {
							if(!parent._useOriginalWidth) {
								containerToRefresh = parent;
								parent = parent._parent;
							} else {
								break;
							}
						}
						if(containerToRefresh) {
							containerToRefresh.refresh();
							return;
						}
					}
				}
			}
			if(overflowY == "visible" || !this.getRealHeight()) {
				if(!containerDomSize) {
					containerDomSize = this.getContentContainerSize();
				}
				var edgeHeight = dom.offsetHeight - containerDom.offsetHeight;
				var height = layoutDom.offsetHeight + edgeHeight;
				if(layoutDom.offsetHeight > containerDomSize[1]) {
					newHeight = height;
				} else {
					if(!this._useOriginalHeight && height < this._currentOffsetHeight) {
						var parent = this._parent,
							containerToRefresh = this;
						while(parent) {
							if(!parent._useOriginalHeight) {
								containerToRefresh = parent;
								parent = parent._parent;
							} else {
								break;
							}
						}
						if(containerToRefresh) {
							containerToRefresh.refresh();
							return;
						}
					}
				}
			}
			var sizeChanged = false,
				$dom = $fly(dom);
			if(newWidth !== undefined) {
				$dom.outerWidth(newWidth);
				sizeChanged = true;
				this._useOriginalWidth = false;
			} else {
				newWidth = $dom.outerWidth();
				sizeChanged = (this._useOriginalWidth != newWidth);
			}
			this._currentOffsetWidth = newWidth;
			if(newHeight !== undefined) {
				$dom.outerHeight(newHeight);
				sizeChanged = true;
				this._useOriginalHeight = false;
			} else {
				newHeight = $dom.outerHeight();
				if(this._currentOffsetHeight != newHeight) {
					sizeChanged = true;
				}
			}
			this._currentOffsetHeight = newHeight;
			if(sizeChanged) {
				this.notifySizeChange();
			}
		},
		getFocusableSubControls: function () {
			return this._children.toArray();
		}
	});
})();
dorado.widget.HtmlContainer = $extend(dorado.widget.Container, {
	$className: "dorado.widget.HtmlContainer",
	focusable: false,
	ATTRIBUTES: {
		className: {
			defaultValue: "d-html-container"
		},
		content: {
			skipRefresh: true,
			setter: function (content) {
				this._content = content;
				if(this._ready && this._rendered) {
					this.applyContent(this._dom, content);
				}
			}
		},
		containerExpression: {
			writeBeforeReady: true
		}
	},
	destroy: function () {
		if(this._divFormInnerHtml) {
			$fly(this._divFormInnerHtml).remove();
			delete this._divFormInnerHtml;
		}
		$invokeSuper.call(this);
	},
	assignDom: function (dom) {
		this._dom = dom;
		if(dom) {
			try {
				dom.style.display = "";
			} catch(e) {}
		}
	},
	createDom: function () {
		var dom = document.createElement("SPAN");
		if(this._content) {
			this.applyContent(dom, this._content);
		}
		return dom;
	},
	applyContent: function (dom, content) {
		var layoutDom;
		if(this._layout && this._layout._dom) {
			layoutDom = this._layout._dom;
			layoutDom.parentNode.removeChild(layoutDom);
		}
		if(content) {
			this._xCreateContext = {};
			var doms = [];
			this.pushHtmlElement(doms, this._content);
			$fly(dom).empty().append(doms);
		} else {
			$fly(dom).empty();
		}
		var container = dom;
		if(this._containerExpression) {
			var jq = $fly(container).find(this._containerExpression);
			if(jq && jq.length > 0) {
				container = jq[0];
			}
		}
		this._container = container;
		if(container && layoutDom) {
			container.appendChild(layoutDom);
		}
		if(this._ready && this._rendered) {
			this.updateModernScroller();
		}
	},
	pushHtmlElement: function (doms, content) {
		function doPush(doms, content, context) {
			if(!content) {
				return;
			}
			if(content.constructor == String) {
				var div = this._divFormInnerHtml;
				if(!div) {
					this._divFormInnerHtml = div = document.createElement("DIV");
				}
				div.innerHTML = content;
				while(div.firstChild) {
					var node = div.firstChild;
					div.removeChild(node);
					if(dorado.Browser.msie && node.nodeType == 3) {
						var span = document.createElement("SPAN");
						span.appendChild(node);
						node = span;
					}
					doms.push(node);
				}
			} else {
				if(content.nodeType) {
					doms.push(content);
				} else {
					doms.push($DomUtils.xCreate(content, null, context));
				}
			}
		}
		if(content instanceof Array) {
			for(var i = 0; i < content.length; i++) {
				doPush(doms, content[i], this._xCreateContext);
			}
		} else {
			doPush(doms, content, this._xCreateContext);
		}
	},
	refreshDom: function (dom) {
		if(this.getRealHeight() || this._children.size) {
			dom.style.display = "inline-block";
		}
		$invokeSuper.call(this, [dom]);
	},
	getSubDom: function (contextKey) {
		this.getDom();
		return this._xCreateContext ? this._xCreateContext[contextKey] : null;
	}
});
var AUTO_APPEND_TO_TOPVIEW = true;
(function () {
	var ALL_VIEWS = [];
	dorado.widget.View = $extend(dorado.widget.Container, {
		$className: "dorado.widget.View",
		ATTRIBUTES: {
			dataTypeRepository: {
				getter: function (p) {
					return this["_" + p] || $dataTypeRepository;
				}
			},
			className: {
				defaultValue: "d-view"
			},
			width: {
				defaultValue: "100%"
			},
			height: {
				defaultValue: "100%"
			},
			name: {
				writeBeforeReady: true
			},
			renderMode: {
				defaultValue: "onCreate"
			},
			view: {
				setter: function (view) {
					dorado.widget.Component.prototype.ATTRIBUTES.view.setter.call(this, view);
				}
			},
			context: {
				writeBeforeReady: true,
				getter: function () {
					if(this._context == null) {
						this._context = $map();
					}
					return this._context;
				},
				setter: function (context) {
					this._context = (context == null) ? null : $map(context);
				}
			},
			children: {
				setter: function (children, attr) {
					this._prependingChild = {};
					$invokeSuper.call(this, [children, attr]);
					delete this._prependingChild;
				}
			}
		},
		EVENTS: {
			onDataLoaded: {},
			onViewElementRegistered: {},
			onViewElementUnregistered: {},
			onComponentRegistered: {},
			onComponentUnregistered: {}
		},
		constructor: function (configs) {
			ALL_VIEWS.push(this);
			this._identifiedViewElements = {};
			this._loadingDataSet = [];
			if(configs == "$TOP_VIEW") {
				this._dataTypeRepository = dorado.DataTypeRepository.ROOT;
			} else {
				this._dataTypeRepository = new dorado.DataTypeRepository(dorado.DataTypeRepository.ROOT);
			}
			this._dataTypeRepository._view = this;
			$invokeSuper.call(this, [configs]);
			if(this._id) {
				this._identifiedViewElements[this._id] = this;
				var oldValue = window[this._id];
				if(oldValue !== undefined) {
					var errorMesssage;
					if(oldValue instanceof dorado.widget.View) {
						errorMesssage = "dorado.widget.UnsafeViewId";
					} else {
						errorMesssage = "dorado.widget.UniqueViewId";
					}
					new dorado.ResourceException(errorMesssage, this._id);
				} else {
					window[this._id] = this;
				}
			}
		},
		loadData: function () {
			if(this._renderMode !== "onDataLoaded") {
				return;
			}
			this._children.each(function (child) {
				if(!(child instanceof dorado.widget.Control) && !child._ready) {
					child.onReady();
				}
			});
			$waitFor(this._loadingDataSet, $scopify(this, this.onDataLoaded));
			this._loadingDataSet = [];
		},
		onReady: function () {
			$invokeSuper.call(this);
			if(this._renderMode !== "onDataLoaded") {
				$waitFor(this._loadingDataSet, $scopify(this, this.onDataLoaded));
				this._loadingDataSet = [];
			}
		},
		destroy: function () {
			ALL_VIEWS.remove(this);
			$invokeSuper.call(this);
		},
		createDefaultLayout: function () {
			if(this._id != "$TOP_VIEW") {
				$invokeSuper.call(this);
			}
		},
		parentChanged: function () {
			if(this._parent) {
				var container = this._parent;
				do {
					if(container instanceof dorado.widget.View) {
						this._dataTypeRepository.parent = container._dataTypeRepository;
						break;
					}
					container = container._parent;
				} while (container != null);
			} else {
				this._dataTypeRepository.parent = dorado.DataTypeRepository.ROOT;
			}
		},
		registerViewElement: function (id, comp) {
			if(!id) {
				return;
			}
			if(this._identifiedViewElements[id]) {
				throw new dorado.ResourceException("dorado.widget.ComponentIdNotUnique", id, this._id);
			}
			this._identifiedViewElements[id] = comp;
			if(this.getListenerCount("onViewElementRegistered")) {
				this.fireEvent("onViewElementRegistered", this, {
					viewElement: comp
				});
			}
			if(this.getListenerCount("onComponentRegistered")) {
				this.fireEvent("onComponentRegistered", this, {
					component: comp
				});
			}
		},
		unregisterViewElement: function (id) {
			if(!id) {
				return;
			}
			if(this.getListenerCount("onViewElementUnregistered")) {
				var comp = this._identifiedViewElements[id];
				this.fireEvent("onViewElementUnregistered", this, {
					component: comp
				});
			}
			if(this.getListenerCount("onComponentUnregistered")) {
				var comp = this._identifiedViewElements[id];
				this.fireEvent("onComponentUnregistered", this, {
					component: comp
				});
			}
			delete this._identifiedViewElements[id];
		},
		registerComponent: function (id, comp) {
			this.registerViewElement(id, comp);
		},
		unregisterComponent: function (id) {
			this.unregisterViewElement(id);
		},
		getListenerScope: function () {
			return this;
		},
		doGet: function (attr) {
			var c = attr.charAt(0);
			if(c == "#") {
				var id = attr.substring(1);
				var result = this.id(id);
				if(!result) {
					result = this.getDataType(id);
				}
				return result;
			} else {
				if(c == "^") {
					var tag = attr.substring(1);
					return this.tag(tag);
				} else {
					if(c == "@") {
						var dataTypeName = attr.substring(1);
						return this.getDataType(dataTypeName);
					} else {
						return $invokeSuper.call(this, [attr]);
					}
				}
			}
		},
		id: function (id) {
			var viewElement = this._identifiedViewElements[id];
			if(!viewElement && dorado.widget.View.DEFAULT_COMPONENTS) {
				viewElement = dorado.widget.View.getDefaultComponent(this, id);
				if(viewElement) {
					this.registerViewElement(id, viewElement);
				}
			}
			return viewElement;
		},
		tag: function (tags) {
			var group = dorado.TagManager.find(tags),
				allObjects = group.objects,
				objects = [];
			for(var i = 0; i < allObjects.length; i++) {
				var object = allObjects[i];
				if(object._view == this || object.view == this || (object.ATTRIBUTES.view && object.get("view") == this) || (object.getListenerScope && object.getListenerScope() == this)) {
					objects.push(object);
				}
			}
			return new dorado.ObjectGroup(objects);
		},
		getComponentReference: function (id) {
			var comp = this.id(id);
			return comp || {
				view: this,
				component: id
			};
		},
		getDataType: function (name) {
			return this._dataTypeRepository.get(name);
		},
		getDataTypeAsync: function (name, callback) {
			return this._dataTypeRepository.getAsync(name, callback);
		},
		onReady: function () {
			$invokeSuper.call(this);
			$waitFor(this._loadingDataSet, $scopify(this, this.onDataLoaded));
			this._loadingDataSet = [];
		},
		onDataLoaded: function () {
			if(this._renderMode == "onDataLoaded") {
				this.render();
			}
			this.fireEvent("onDataLoaded", this);
		},
		render: function (containerElement) {
			var bodyWidth;
			if(containerElement == document.body) {
				bodyWidth = document.body.clientWidth;
			}
			$invokeSuper.call(this, [containerElement]);
			if(bodyWidth && bodyWidth > document.body.clientWidth) {
				this.onResize();
			}
		},
		doRenderToOrReplace: function (replace, element, nextChildElement) {
			this._rendering = true;
			$invokeSuper.call(this, [replace, element, nextChildElement]);
			this._rendering = false;
		},
		bindByExpression: function (expression, listener, options) {
			var i = expression.lastIndexOf("."),
				objectsExpression, eventName;
			if(i > 0) {
				objectsExpression = expression.substring(0, i);
				eventName = expression.substring(i + 1);
			}
			if(i <= 0 || !eventName) {
				throw new dorado.Exception("Invalid binding expression \"" + expression + "\".");
			}
			var objects;
			if(objectsExpression == "view") {
				objects = this;
			} else {
				objects = this.get(objectsExpression);
			}
			if(objects) {
				if(dorado.Object.isInstanceOf(objects, dorado.EventSupport)) {
					if(eventName == "onCreate") {
						objects.notifyListener(dorado.Object.apply({
							listener: listener
						}, options), [objects]);
					}
					objects.bind(eventName, listener, options);
				} else {
					if(objects instanceof dorado.ObjectGroup) {
						if(eventName == "onCreate") {
							objects.each(function (object) {
								object.notifyListener(dorado.Object.apply({
									listener: listener
								}, options), [object]);
							});
						}
						objects.bind(eventName, listener, options);
					}
				}
			}
		}
	});
	dorado.widget.View.registerDefaultComponent = function (id, component) {
		var comps = this.DEFAULT_COMPONENTS = this.DEFAULT_COMPONENTS || {};
		comps[id] = component;
	};
	dorado.widget.View.getDefaultComponent = function (view, id) {
		var comps = this.DEFAULT_COMPONENTS;
		if(!comps || !comps[id]) {
			return;
		}
		var comp = comps[id];
		if(typeof comp == "function") {
			comp = comp(view);
		}
		return comp;
	};
	window.$id = function (id) {
		var viewElements = [];
		for(var i = 0; i < ALL_VIEWS.length; i++) {
			var view = ALL_VIEWS[i];
			var viewElement = view.id(id);
			if(viewElement) {
				viewElements.push(viewElement);
			}
		}
		return new dorado.ObjectGroup(viewElements);
	};
	window.$waitFor = dorado.widget.View.waitFor = function (tasks, callback) {
		if(!(tasks instanceof Array)) {
			tasks = [tasks];
		}
		var simTasks = [];
		jQuery.each(tasks, function (i, task) {
			if(task instanceof dorado.widget.DataSet) {
				simTasks.push({
					callback: dorado._NULL_FUNCTION,
					run: function (callback) {
						task.loadAsync(callback);
					}
				});
			} else {
				if(task instanceof dorado.widget.AsyncAction) {
					simTasks.push({
						callback: dorado._NULL_FUNCTION,
						run: function (callback) {
							task.execute(callback);
						}
					});
				} else {
					if(typeof task == "function") {
						simTasks.push({
							callback: dorado._NULL_FUNCTION,
							run: task
						});
					} else {
						simTasks.push(task);
					}
				}
			}
		});
		dorado.Callback.simultaneousCallbacks(simTasks, callback);
	};
	var resizeCallbacks = [];
	dorado.bindResize = function (callback) {
		if(typeof callback != "function") {
			return;
		}
		resizeCallbacks.push(callback);
	};
	dorado.fireResizeCallback = function (keyboardVisible) {
		for(var i = 0, j = resizeCallbacks.length; i < j; i++) {
			var callback = resizeCallbacks[i];
			callback.call(null, keyboardVisible);
		}
	};
	dorado.unbindResize = function (callback) {
		if(typeof callback != "function") {
			return;
		}
		var index = resizeCallbacks.indexOf(callback);
		if(index != -1) {
			resizeCallbacks.removeAt(index);
		}
	};
	var topView = new dorado.widget.View("$TOP_VIEW");
	dorado.widget.View.TOP = topView;
	window.$topView = topView;
	jQuery().ready(function () {
		function getControlByElement(el) {
			var node = $DomUtils.findParent(el, function (node) {
				return(!!node.doradoUniqueId);
			});
			var control = null;
			if(node) {
				control = dorado.widget.ViewElement.ALL[node.doradoUniqueId];
			}
			return control;
		}
		dorado.fireBeforeInit();
		var lastFocusedControl;
		$fly(document).mousedown(function (evt) {
			var element = evt.target;
			if(!element || !element.style || element.style.tabIndex < 0) {
				return;
			}
			var nodeName = element.nodeName.toLowerCase();
			var ignorePhyscialFocus = (nodeName == "input" || nodeName == "textarea" || nodeName == "select");
			var control = getControlByElement(element);
			if(control == null) {
				dorado.widget.setFocusedControl(null, ignorePhyscialFocus);
			} else {
				dorado.widget.setFocusedControl(control, ignorePhyscialFocus);
			}
		});
		if(!dorado.Browser.isTouch) {
			$fly(document).keydown(function (evt) {
				var b, c = dorado.widget.getFocusedControl();
				if(c) {
					b = c.onKeyDown(evt);
				}
				if((dorado.widget.HtmlContainer && c instanceof dorado.widget.HtmlContainer) || (dorado.widget.TemplateField && c instanceof dorado.widget.TemplateField)) {
					return true;
				}
				if(b === false) {
					evt.preventDefault();
					evt.cancelBubble = true;
					return false;
				} else {
					if($setting["common.preventBackspace"]) {
						switch(evt.keyCode || evt.which) {
						case 8:
							var doPrevent = false;
							var d = evt.srcElement || evt.target;
							if((d.tagName.toLowerCase() === "input" && (d.type.toLowerCase() === "text" || d.type.toLowerCase() === "password" || d.type.toLowerCase() === "file")) || d.tagName.toLowerCase() === "textarea") {
								doPrevent = d.readOnly || d.disabled;
							} else {
								doPrevent = true;
							}
							if(doPrevent) {
								evt.preventDefault();
								evt.cancelBubble = true;
								return false;
							}
							break;
						}
					}
					if(b === true) {
						switch(evt.keyCode || evt.which) {
						case 8:
							if(evt.srcElement) {
								var nodeName = evt.srcElement.nodeName.toLowerCase();
								if(!((nodeName == "input" || nodeName == "textarea") && !evt.srcElement.readOnly && !evt.srcElement.disabled)) {
									return false;
								}
							}
							break;
						case 13:
							if($setting["common.enterAsTab"]) {
								var c = (evt.shiftKey) ? dorado.widget.findPreviousFocusableControl() : dorado.widget.findNextFocusableControl();
								if(c) {
									c.setFocus();
								}
								evt.preventDefault();
								evt.cancelBubble = true;
								return false;
							}
							break;
						case 9:
							var c = (evt.shiftKey) ? dorado.widget.findPreviousFocusableControl() : dorado.widget.findNextFocusableControl();
							if(c) {
								c.setFocus();
							}
							evt.preventDefault();
							evt.cancelBubble = true;
							return false;
						}
					}
					return true;
				}
			}).keypress(function (evt) {
				var b, c = dorado.widget.getFocusedControl();
				if(c) {
					b = c.onKeyPress(evt);
				}
				if(b === false) {
					evt.preventDefault();
					evt.cancelBubble = true;
					return false;
				} else {
					return true;
				}
			});
		}
		var cls = "d-unknown-browser",
			b = dorado.Browser,
			v = b.version;
		if(b.isTouch) {
			if(b.android) {
				cls = "d-android";
			} else {
				if(b.iOS) {
					cls = "d-ios";
				}
			}
			if(b.androidNative) {
				cls += " d-android-native";
			}
		} else {
			if(b.msie) {
				cls = "d-ie";
			} else {
				if(b.mozilla) {
					cls = "d-mozilla";
				} else {
					if(b.chrome) {
						cls = "d-chrome";
					} else {
						if(b.safari) {
							cls = "d-safari";
						} else {
							if(b.opera) {
								cls = "d-opera";
							}
						}
					}
				}
			}
			if($setting["common.simulateTouch"]) {
				cls += " d-touch";
			}
		}
		if(v) {
			cls += " " + cls + v;
		}
		if(b.android_40) {
			cls += " d-android-40";
		}
		$fly(document.body).addClass(cls + " d-rendering");
		if(!dorado.Browser.isTouch) {
			$fly(document.body).focusin(function (evt) {
				if(dorado.widget.Control.IGNORE_FOCUSIN_EVENT) {
					return;
				}
				var control = getControlByElement(evt.target);
				if(control) {
					dorado.widget.onControlGainedFocus(control);
				}
			});
		}
		var resizeTopView = function () {
			if(topView.onResizeTimerId) {
				clearTimeout(topView.onResizeTimerId);
				delete topView.onResizeTimerId;
			}
			topView.onResizeTimerId = setTimeout(function () {
				dorado.fireResizeCallback();
				rootViewport.updateBodySize();
				delete topView.onResizeTimerId;
				topView._children.each(function (child) {
					if(child.resetDimension && child._rendered && child._visible) {
						child.resetDimension();
					}
				});
			}, 100);
		};
		var isInIFrame = false;
		try {
			isInIFrame = !!(top != window || window.frameElement);
		} catch(e) {
			isInIFrame = true;
		}
		var doInitDorado = function () {
			dorado.fireOnInit();
			topView.onReady();
			var oldWidth = $fly(window).width(),
				oldHeight = $fly(window).height();
			$fly(window).unload(function () {
				dorado.windowClosed = true;
				if(!topView._destroyed) {
					topView.destroy();
				}
			});
			var oldResize = window.onresize,
				keyboardVisible;
			window.onresize = function () {
				oldResize && oldResize.apply(window, arguments);
				if(dorado.Browser.isTouch) {
					var width = $fly(window).width(),
						height = $fly(window).height();
					if((oldWidth === undefined && oldHeight === undefined) || (width !== oldWidth && height !== oldHeight)) {
						resizeTopView();
					} else {
						if(dorado.Browser.miui && !keyboardVisible && Math.abs(height - oldHeight) < 100) {
							resizeTopView();
						} else {
							if(dorado.Browser.android && Math.abs(height - oldHeight) > 100) {
								keyboardVisible = height - oldHeight < 0;
								dorado.fireResizeCallback(keyboardVisible);
							}
						}
					}
					oldWidth = width;
					oldHeight = height;
				} else {
					resizeTopView();
				}
			};
			if(dorado.Browser.isTouch) {
				$fly(window).bind("orientationchange", function () {
					resizeTopView();
				});
				$fly(document).bind("touchmove", function (event) {
					event.preventDefault();
				});
				v;
			}
			dorado.fireAfterInit();
			setTimeout(function () {
				$fly(document.body).removeClass("d-rendering");
			}, 500);
		};
		var rootViewport = {
			init: function (fn, scope) {
				var me = this,
					stretchSize = Math.max(window.innerHeight, window.innerWidth) * 2,
					body = document.body;
				this.initialHeight = window.innerHeight;
				jQuery(body).height(stretchSize);
				this.scrollToTop();
				setTimeout(function () {
					me.scrollToTop();
					setTimeout(function () {
						me.scrollToTop();
						me.initialHeight = Math.max(me.initialHeight, window.innerHeight);
						me.updateBodySize();
						if(fn) {
							fn.apply(scope || window);
						}
					}, 50);
				}, 50);
			},
			scrollToTop: function () {
				if(!dorado.Browser.isPhone) {
					return;
				}
				if(dorado.Browser.iOS) {
					if(dorado.Browser.isPhone) {
						document.body.scrollTop = document.body.scrollHeight;
					}
				} else {
					window.scrollTo(0, 1);
				}
			},
			updateBodySize: function () {
				if(isInIFrame) {
					return;
				}
				var $body = $fly(document.body),
					width = jQuery(window).width(),
					height = jQuery(window).height();
				$body.height(height).width(width);
			}
		};
		if(dorado.Browser.isTouch) {
			if(isInIFrame) {
				setTimeout(doInitDorado, 10);
			} else {
				rootViewport.init(function () {
					doInitDorado();
				});
			}
			return;
		}
		if(dorado.Browser.chrome) {
			setTimeout(doInitDorado, 10);
		} else {
			doInitDorado();
		}
	});
})();
(function () {
	var EMPTY_CONTROLLER = {};
	dorado.widget.View.prototype.controller = EMPTY_CONTROLLER;
	dorado.widget.Controller = {
		registerFunctions: function (view, configs) {
			function doRegister(view, configs) {
				for(var i = 0; i < configs.length; i++) {
					var config = configs[i],
						name = config.name,
						func = config.func,
						bindingInfos = config.bindingInfos;
					if(bindingInfos) {
						for(var j = 0; j < bindingInfos.length; j++) {
							view.bindByExpression(bindingInfos[j], func);
						}
					}
					if(config.global) {
						if(window[name] !== undefined) {
							throw new dorado.Exception("A gloal function or variable named \"" + name + "\" is already exists.");
						}
						window[name] = func;
					}
					if(config.view) {
						if(view[name] !== undefined) {
							throw new dorado.Exception("A method or property named \"" + name + "\" is already exists in View \"" + View._id + "\".");
						}
						view[name] = func;
					}
				}
			}
			doRegister(view, configs);
		}
	};
})();
dorado.widget.SubViewHolder = $extend(dorado.widget.Control, {
	$className: "dorado.widget.SubViewHolder",
	ATTRIBUTES: {
		subView: {
			writeBeforeReady: true
		}
	},
	createDom: function (dom) {
		var dom = document.createElement("DIV");
		var subView = this._subView;
		if(subView) {
			this.registerInnerControl(subView);
			subView.render(dom);
		}
		return dom;
	},
	doOnResize: function () {
		if(!this._ready) {
			return;
		}
		var subView = this._subView;
		if(subView) {
			subView._realWidth = this._dom.offsetWidth;
			subView._realHeight = this._dom.offsetHeight;
			subView.resetDimension();
		}
	}
});
dorado.widget.layout = {};
dorado.widget.layout.Layout = $extend(dorado.AttributeSupport, {
	$className: "dorado.widget.layout.Layout",
	ATTRIBUTES: {
		padding: {},
		container: {
			setter: function (container) {
				if(this._container != container) {
					this._domCache = {};
					this._container = container;
				}
			}
		},
		rendered: {
			readOnly: true
		},
		attached: {
			readOnly: true
		}
	},
	constructor: function (config) {
		this._regions = new dorado.util.KeyedList(function (region) {
			return region.control._uniqueId;
		});
		$invokeSuper.call(this, [config]);
		if(config) {
			this.set(config);
		}
	},
	getDom: function () {
		if(!this._dom) {
			this._dom = this.createDom();
		}
		return this._dom;
	},
	getRegionDom: function (region) {
		if(region) {
			return this._domCache[region.id];
		}
	},
	refresh: function () {
		if(this._duringRefreshDom) {
			return;
		}
		this._duringRefreshDom = true;
		if(this._attached) {
			this._shouldRefresh = false;
			this.refreshDom(this.getDom());
		}
		this._duringRefreshDom = false;
	},
	onAttachToDocument: function (containerElement) {
		if(!this._attached) {
			if(this._regions.size == 0) {
				return;
			}
			this._attached = true;
			var dom = this.getDom();
			if(dom.parentNode != containerElement) {
				containerElement.appendChild(dom);
			}
			this._duringRefreshDom = true;
			this.refreshDom(dom);
			this._duringRefreshDom = false;
			this._rendered = true;
		}
	},
	onDetachFromDocument: function () {
		if(this._attached) {
			this._attached = false;
			this._regions.each(function (region) {
				region.control.onDetachFromDocument();
			});
		}
	},
	getPreviousRegion: function (region) {
		var entry = this._regions.findEntry(region);
		while(entry) {
			entry = entry.previous;
			if(entry && entry.data.constraint != dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
				return entry.data;
			}
		}
	},
	getNextRegion: function (region) {
		var entry = this._regions.findEntry(region);
		while(entry) {
			entry = entry.next;
			if(entry && entry.data.constraint != dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
				return entry.data;
			}
		}
	},
	preprocessLayoutConstraint: function (layoutConstraint, control) {
		if(!control._visible && control._hideMode == "display") {
			layoutConstraint = dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT;
		}
		return layoutConstraint || {};
	},
	addControl: function (control) {
		var region = {
			id: dorado.Core.newId(),
			control: control,
			constraint: this.preprocessLayoutConstraint(control._layoutConstraint, control)
		};
		this._regions.insert(region);
		control._parentLayout = this;
		if(this.onAddControl) {
			this.onAddControl(control);
		}
	},
	removeControl: function (control) {
		control._parentLayout = null;
		if(this.onRemoveControl) {
			this.onRemoveControl(control);
		}
		this._regions.removeKey(control._uniqueId);
	},
	removeAllControls: function () {
		var layout = this;
		this._regions.toArray().each(function (region) {
			layout.removeControl(region.control);
		});
	},
	disableRendering: function () {
		this._disableRendering = true;
	},
	enableRendering: function () {
		this._disableRendering = false;
	},
	resetControlDimension: function (region, containerDom, autoWidth, autoHeight) {
		var control = region.control,
			attrWatcher = control.getAttributeWatcher();
		var oldWidth = control._currentWidth,
			oldHeight = control._currentHeight;
		if(autoWidth && region.width !== undefined && (!control.ATTRIBUTES.width.independent || control._fixedWidth)) {
			control._realWidth = region.width + (region.autoWidthAdjust || 0);
		}
		if(autoHeight && region.height !== undefined && (!control.ATTRIBUTES.height.independent || control._fixedHeight)) {
			control._realHeight = region.height + (region.autoHeightAdjust || 0);
		}
		if(control._attached && (oldWidth != control._realWidth || oldHeight != control._realHeight)) {
			control.refresh();
		}
	},
	renderControl: function (region, containerDom, autoWidth, autoHeight) {
		this.resetControlDimension.apply(this, [region, containerDom, autoWidth, autoHeight]);
		var control = region.control;
		if(!control._rendered || control.getDom().parentNode != containerDom) {
			this._ignoreControlSizeChange = true;
			control.render(containerDom);
			this._ignoreControlSizeChange = false;
		}
	},
	getRegion: function (control) {
		return this._regions.get((control instanceof dorado.widget.Control) ? control._uniqueId : control);
	},
	refreshControl: function (control) {
		var container = this._container,
			dom = this._dom;
		if(!container || !dom) {
			return;
		}
		var region = this.getRegion(control);
		if(region) {
			region.constraint = this.preprocessLayoutConstraint(control._layoutConstraint, control);
			if(container.isActualVisible()) {
				if(this.doRefreshRegion) {
					var currentWidth = dom.offsetWidth,
						currentHeight = dom.offsetHeight;
					this.doRefreshRegion(region);
					if(currentWidth != dom.offsetWidth || currentHeight != dom.offsetHeight) {
						container.onContentSizeChange();
					}
				}
			} else {
				container.refresh();
			}
		}
	},
	onResize: function () {
		if(!this._attached || this._ignoreControlSizeChange || !this.doOnResize) {
			return;
		}
		var clientSize = this._container.getContentContainerSize();
		var clientWidth = clientSize[0],
			clientHeight = clientSize[1];
		if(clientWidth > 10000) {
			clientWidth = 0;
		}
		if(clientHeight > 10000) {
			clientHeight = 0;
		}
		if(clientWidth == 0 && clientHeight == 0) {
			return;
		}
		this.doOnResize();
	},
	doOnResize: function () {
		if(!this._duringRefreshDom) {
			this.refresh();
		}
	},
	onControlSizeChange: function (control, delay, force) {
		if(this._ignoreControlSizeChange) {
			return;
		}
		dorado.Toolkits.cancelDelayedAction(this, "$notifySizeChangeTimerId");
		var fn = function () {
			var container = this._container,
				dom = this._dom;
			if(!container || !dom) {
				return;
			}
			var currentWidth, currentHeight;
			if(!force && this.doOnControlSizeChange) {
				currentWidth = dom.offsetWidth;
				currentHeight = dom.offsetHeight;
			}
			if(this.doOnControlSizeChange) {
				this.doOnControlSizeChange(control);
			}
			if(force || currentWidth != dom.offsetWidth || currentHeight != dom.offsetHeight) {
				container.onContentSizeChange();
			}
		};
		var region = this.getRegion(control);
		if(region) {
			region.constraint = this.preprocessLayoutConstraint(control._layoutConstraint, control);
			if(delay) {
				dorado.Toolkits.setDelayedAction(this, "$onControlSizeChangeTimerId", fn, 200);
			} else {
				fn.call(this);
			}
		}
	}
});
dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT = "none";
dorado.widget.layout.NativeLayout = $extend(dorado.widget.layout.Layout, {
	$className: "dorado.widget.layout.NativeLayout",
	_className: "d-native-layout",
	ATTRIBUTES: {
		style: {
			setter: function (v) {
				if(typeof v == "string" || !this._style) {
					this._style = v;
				} else {
					if(v) {
						dorado.Object.apply(this._style, v);
					}
				}
			}
		}
	},
	createDom: function () {
		var dom = document.createElement("DIV");
		dom.className = this._className;
		return dom;
	},
	refreshDom: function (dom) {
		$fly(dom).css("padding", this._padding);
		if(this._style) {
			var style = this._style;
			if(typeof this._style == "string") {
				var map = {};
				jQuery.each(style.split(";"), function (i, section) {
					var v = section.split(":");
					map[jQuery.trim(v[0])] = jQuery.trim(v[1]);
				});
				style = map;
			}
			$fly(dom).css(style);
			delete this._style;
		}
		for(var it = this._regions.iterator(); it.hasNext();) {
			var region = it.next();
			var constraint = region.constraint;
			if(constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
				continue;
			}
			this.renderControl(region, dom, false, false);
		}
	},
	onAddControl: function (control) {
		if(!this._attached || this._disableRendering) {
			return;
		}
		var region = this._regions.get(control._uniqueId);
		if(region) {
			this.renderControl(region, this._dom, false, false);
		}
	},
	onRemoveControl: function (control) {
		if(!this._attached) {
			return;
		}
		control.unrender();
	},
	doRefreshRegion: function (region) {
		var control = region.control,
			controlDom = control.getDom(),
			dom = this.getDom();
		var hidden = (region.constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT),
			visibilityChanged = false;
		if(hidden) {
			if(controlDom.parentNode == dom) {
				dom.removeChild(controlDom);
				this.refresh();
			}
		} else {
			var oldWidth = region.realWidth,
				oldHeight = region.realHeight;
			var $controlDom = $fly(controlDom);
			if(controlDom.parentNode != dom || $controlDom.outerWidth() != oldWidth || $controlDom.outerHeight() != oldHeight) {
				this.refresh();
			}
		}
	}
});
(function () {
	dorado.widget.layout.AnchorLayout = $extend(dorado.widget.layout.Layout, {
		$className: "dorado.widget.layout.AnchorLayout",
		_className: "d-anchor-layout",
		createDom: function () {
			var dom = document.createElement("DIV");
			dom.className = this._className;
			return dom;
		},
		refreshDom: function (dom) {
			dom.style.width = "100%";
			dom.style.height = "100%";
			this.doRefreshDom(dom);
		},
		doRefreshDom: function (dom) {
			this._maxRagionRight = this._maxRagionBottom = 0;
			for(var it = this._regions.iterator(); it.hasNext();) {
				var region = it.next();
				var constraint = region.constraint;
				if(constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
					continue;
				}
				var realignArg = this.adjustRegion(region);
				if(realignArg) {
					this.realignRegion(region, realignArg);
				}
			}
			if(this.processOverflow(dom)) {
				this.calculateRegions();
			}
		},
		recordMaxRange: function (region) {
			var controlDom = region.control.getDom();
			if(controlDom.style.position == "absolute") {
				if(region.right === undefined) {
					var right = (region.left || 0) + region.realWidth + region.regionPadding;
					if(right > this._maxRagionRight) {
						this._maxRagionRight = right;
					}
				}
				if(region.bottom === undefined) {
					var bottom = (region.top || 0) + region.realHeight + region.regionPadding;
					if(bottom > this._maxRagionBottom) {
						this._maxRagionBottom = bottom;
					}
				}
			}
		},
		processOverflow: function (dom) {
			var overflowed = false,
				padding = parseInt(this._padding) || 0;
			var containerSize = this._container.getContentContainerSize();
			var width = this._maxRagionRight;
			if(width < dom.scrollWidth) {
				width = dom.scrollWidth;
			}
			if(width > 0 && (width > containerSize[0] || (width == dom.offsetWidth && dom.style.width == ""))) {
				dom.style.width = (width + padding) + "px";
				overflowed = true;
			}
			var height = this._maxRagionBottom;
			if(height < dom.scrollHeight) {
				height = dom.scrollHeight;
			}
			if(height > 0 && (height > containerSize[1] || (height == dom.offsetHeight && dom.style.height == ""))) {
				dom.style.height = (height + padding) + "px";
				overflowed = true;
			}
			return overflowed;
		},
		onAddControl: function (control) {
			if(!this._attached) {
				return;
			}
			var region = this._regions.get(control._uniqueId);
			if(region) {
				var realignArg = this.adjustRegion(region, true);
				if(this._disableRendering) {
					return;
				}
				if(realignArg) {
					this.realignRegion(region, realignArg);
				}
				if(this.processOverflow(this.getDom())) {
					this.calculateRegions();
				}
			}
		},
		onRemoveControl: function (control) {
			if(!this._attached) {
				return;
			}
			var region = this._regions.get(control._uniqueId);
			if(region) {
				this.getDom().removeChild(control.getDom());
				if(this._disableRendering) {
					return;
				}
				var nextRegion = this.getNextRegion(region);
				if(nextRegion) {
					this.calculateRegions(nextRegion);
				}
			}
		},
		doOnControlSizeChange: function (control) {
			this.refreshControl(control);
		},
		doRefreshRegion: function (region) {
			var control = region.control,
				controlDom = control.getDom(),
				dom = this.getDom();
			var hidden = (region.constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT),
				visibilityChanged = false;
			if(hidden) {
				if(controlDom.parentNode == dom) {
					dom.removeChild(controlDom);
					this.refresh();
				}
			} else {
				var oldWidth = region.realWidth,
					oldHeight = region.realHeight;
				var $controlDom = $fly(controlDom);
				if(controlDom.parentNode != dom || $controlDom.outerWidth() != oldWidth || $controlDom.outerHeight() != oldHeight) {
					this.refresh();
				}
			}
		},
		calculateRegions: function (fromRegion) {
			var regions = this._regions;
			if(regions.size == 0) {
				return;
			}
			var found = !fromRegion;
			regions.each(function (region) {
				if(!found) {
					found = (fromRegion == region);
					if(!found) {
						return;
					}
				}
				if(region.constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
					return;
				}
				var realignArg = this.adjustRegion(region);
				if(realignArg) {
					this.realignRegion(region, realignArg);
				}
			}, this);
		},
		adjustRegion: function (region) {
			function getAnchorRegion(region, p) {
				var anchor = constraint[p];
				if(anchor) {
					if(anchor.constructor == String) {
						if(anchor == "previous") {
							anchor = this.getPreviousRegion(region);
						} else {
							anchor = null;
						}
					} else {
						if(typeof anchor == "function") {
							anchor = anchor.call(this, region);
						}
					}
				}
				return anchor;
			}
			var constraint = region.constraint,
				realignArg;
			var containerDom = this._dom.parentNode,
				controlDom = region.control.getDom();
			var left, right, width, top, bottom, height;
			left = right = width = top = bottom = height = -1;
			var lp, rp, tp, bp, wp, hp;
			lp = rp = tp = bp = wp = hp = 0;
			var padding = (parseInt(this._padding) || 0);
			var regionPadding = (parseInt(this._regionPadding) || 0) + (parseInt(constraint.padding) || 0);
			var clientSize = this._container.getContentContainerSize();
			var clientWidth = clientSize[0],
				clientHeight = clientSize[1];
			if(clientWidth > 10000) {
				clientWidth = 0;
			}
			if(clientHeight > 10000) {
				clientHeight = 0;
			}
			var realContainerWidth = clientWidth - padding * 2,
				realContainerHeight = clientHeight - padding * 2;
			if(constraint.anchorLeft == "previous" && constraint.left == null) {
				constraint.left = 0;
			}
			if(constraint.left != null && constraint.anchorLeft != "none") {
				var l = constraint.left;
				if(l.constructor == String && l.match("%")) {
					var rate = lp = parseInt(l);
					if(!isNaN(rate)) {
						left = rate * realContainerWidth / 100 + regionPadding;
					}
				}
				if(left < 0) {
					var anchorRegion = getAnchorRegion.call(this, region, "anchorLeft");
					if(anchorRegion) {
						var anchorDom = anchorRegion.control.getDom();
						left = anchorDom.offsetLeft + anchorRegion.realWidth + regionPadding + parseInt(l);
					} else {
						left = parseInt(l) + padding + regionPadding;
					}
				}
			}
			if(constraint.anchorRight == "previous" && constraint.right == null) {
				constraint.right = 0;
			}
			if(constraint.right != null && constraint.anchorRight != "none") {
				var r = constraint.right;
				if(r.constructor == String && r.match("%")) {
					var rate = rp = parseInt(r);
					if(!isNaN(rate)) {
						right = rate * realContainerWidth / 100 + regionPadding;
					}
				}
				if(right < 0) {
					var anchorRegion = getAnchorRegion.call(this, region, "anchorRight");
					if(anchorRegion) {
						var anchorDom = anchorRegion.control.getDom();
						right = clientWidth - anchorDom.offsetLeft + regionPadding + parseInt(r);
					} else {
						right = parseInt(r) + padding + regionPadding;
					}
				}
			}
			if(constraint.anchorTop == "previous" && constraint.top == null) {
				constraint.top = 0;
			}
			if(constraint.top != null && constraint.anchorTop != "none") {
				var t = constraint.top;
				if(t.constructor == String && t.match("%")) {
					var rate = tp = parseInt(t);
					if(!isNaN(rate)) {
						top = rate * realContainerHeight / 100 + regionPadding;
					}
				}
				if(top < 0) {
					var anchorRegion = getAnchorRegion.call(this, region, "anchorTop");
					if(anchorRegion) {
						var anchorDom = anchorRegion.control.getDom();
						top = anchorDom.offsetTop + anchorRegion.realHeight + regionPadding + parseInt(t);
					} else {
						top = parseInt(t) + padding + regionPadding;
					}
				}
			}
			if(constraint.anchorBottom == "previous" && constraint.bottom == null) {
				constraint.bottom = 0;
			}
			if(constraint.bottom != null && constraint.anchorBottom != "none") {
				var b = constraint.bottom;
				if(b.constructor == String && b.match("%")) {
					var rate = bp = parseInt(b);
					if(!isNaN(rate)) {
						bottom = rate * realContainerWidth / 100 + regionPadding;
					}
				}
				if(bottom < 0) {
					var anchorRegion = getAnchorRegion.call(this, region, "anchorBottom");
					if(anchorRegion) {
						var anchorDom = anchorRegion.control.getDom();
						bottom = clientHeight - anchorDom.offsetTop + regionPadding + parseInt(b);
					} else {
						bottom = parseInt(b) + padding + regionPadding;
					}
				}
			}
			var useControlWidth = region.control.getAttributeWatcher().getWritingTimes("width");
			if(useControlWidth || left < 0 || right < 0) {
				var w = region.control._width;
				if(w && w.constructor == String && w.match("%")) {
					var rate = wp = parseInt(w);
					if(!isNaN(rate)) {
						width = rate * realContainerWidth / 100;
					}
				} else {
					width = parseInt(w);
				}
				if(left >= 0 && right >= 0) {
					right = -1;
					rp = false;
				}
			} else {
				if(left >= 0 && right >= 0) {
					if(lp && rp) {
						width = clientWidth - left - right;
						right = -1;
						lp = rp = false;
					} else {
						width = clientWidth;
						if(lp) {
							left = -1;
							width -= right;
						}
						if(rp) {
							right = -1;
							width -= left;
						}
						if(!lp && !rp) {
							width -= (left + right);
							right = -1;
						}
					}
				}
			}
			var useControlHeight = region.control.getAttributeWatcher().getWritingTimes("height");
			if(useControlHeight || top < 0 || bottom < 0) {
				var h = region.control._height;
				if(h && h.constructor == String && h.match("%")) {
					var rate = hp = parseInt(h);
					if(!isNaN(rate)) {
						height = rate * realContainerHeight / 100;
					}
				} else {
					height = parseInt(h);
				}
				if(top >= 0 && bottom >= 0) {
					bottom = -1;
					bp = false;
				}
			} else {
				if(top >= 0 && bottom >= 0) {
					if(tp && bp) {
						height = clientHeight - top - bottom;
						bottom = -1;
						tp = bp = false;
					} else {
						height = clientHeight;
						if(tp) {
							top = -1;
							height -= bottom;
						}
						if(bp) {
							bottom = -1;
							height -= top;
						}
						if(!tp && !bp) {
							height -= (top + bottom);
							bottom = -1;
						}
					}
				}
			}
			if(lp || rp || tp || bp || wp || hp) {
				region.realignArg = realignArg = {
					left: lp,
					right: rp,
					top: tp,
					bottom: bp,
					width: wp,
					height: hp
				};
			}
			if(left >= 0 || right >= 0 || top >= 0 || bottom >= 0) {
				if(padding > 0) {
					if((left >= 0 || right >= 0) && top < 0 && bottom < 0) {
						top = padding + regionPadding;
					}
					if((top >= 0 || bottom >= 0) && left < 0 && right < 0) {
						left = padding + regionPadding;
					}
				}
			} else {
				if(padding > 0) {
					left = top = padding + regionPadding;
				}
			}
			region.left = (left >= 0) ? left + (parseInt(constraint.leftOffset) || 0) : undefined;
			region.right = (right >= 0) ? right - (parseInt(constraint.leftOffset) || 0) : undefined;
			region.top = (top >= 0) ? top + (parseInt(constraint.topOffset) || 0) : undefined;
			region.bottom = (bottom >= 0) ? bottom - (parseInt(constraint.topOffset) || 0) : undefined;
			region.width = (width >= 0) ? width + (parseInt(constraint.widthOffset) || 0) : undefined;
			region.height = (height >= 0) ? height + (parseInt(constraint.heightOffset) || 0) : undefined;
			region.regionPadding = regionPadding || 0;
			var dom = this._dom;
			if(region.right >= 0 && !dom.style.width) {
				dom.style.width = (clientWidth) ? (clientWidth + "px") : "";
			}
			if(region.bottom >= 0 && !dom.style.height) {
				dom.style.height = (clientHeight) ? (clientHeight + "px") : "100%";
			}
			this.renderControl(region, dom, true, true);
			var controlDom = region.control.getDom();
			if(controlDom) {
				var $controlDom = $fly(controlDom);
				region.realWidth = $controlDom.outerWidth();
				region.realHeight = $controlDom.outerHeight();
			} else {
				region.realWidth = region.control.getRealWidth() || 0;
				region.realHeight = region.control.getRealHeight() || 0;
			}
			if(!realignArg) {
				this.recordMaxRange(region);
			}
			return realignArg;
		},
		realignRegion: function (region, realignArg) {
			var controlDom = region.control.getDom();
			var left, right, width, top, bottom, height;
			left = right = width = top = bottom = height = -1;
			var constraint = region.constraint,
				containerDom = this._dom.parentNode;
			var padding = (parseInt(this._padding) || 0);
			var regionPadding = region.regionPadding;
			var clientSize = this._container.getContentContainerSize();
			var clientWidth = clientSize[0],
				clientHeight = clientSize[1],
				realContainerWidth, realContainerHeight;
			if(clientWidth > 10000) {
				clientWidth = realContainerWidth = 0;
			} else {
				realContainerWidth = clientWidth - padding * 2;
			}
			if(clientHeight > 10000) {
				clientHeight = realContainerHeight = 0;
			} else {
				realContainerHeight = clientHeight - padding * 2;
			}
			if(realignArg.left) {
				left = Math.round((realContainerWidth - region.realWidth - (region.right > 0 ? region.right : 0)) * realignArg.left / 100) + padding + regionPadding + (parseInt(constraint.leftOffset) || 0);
			} else {
				if(realignArg.right) {
					right = Math.round((realContainerWidth - region.realWidth - (region.left > 0 ? region.left : 0)) * realignArg.right / 100) + padding + regionPadding + (parseInt(constraint.rightOffset) || 0);
				}
			}
			if(realignArg.top) {
				top = Math.round((realContainerHeight - region.realHeight - (region.bottom > 0 ? region.bottom : 0)) * realignArg.top / 100) + padding + regionPadding + (parseInt(constraint.topOffset) || 0);
			} else {
				if(realignArg.bottom) {
					bottom = Math.round((realContainerHeight - region.realHeight - (region.top > 0 ? region.top : 0)) * realignArg.bottom / 100) + padding + regionPadding + (parseInt(constraint.bottomOffset) || 0);
				}
			}
			var style = controlDom.style;
			if(left >= 0) {
				region.left = left;
				style.left = left + "px";
			}
			if(right >= 0) {
				region.right = right;
				style.right = right + "px";
			}
			if(top >= 0) {
				region.top = top;
				style.top = top + "px";
			}
			if(bottom >= 0) {
				region.bottom = bottom;
				style.bottom = bottom + "px";
			}
			this.recordMaxRange(region);
		},
		resetControlDimension: function (region, layoutDom, autoWidth, autoHeight) {
			var control = region.control,
				controlDom = control.getDom();
			var style = controlDom.style;
			if(region.left >= 0 || region.top >= 0 || region.right >= 0 || region.bottom >= 0) {
				style.position = "absolute";
			}
			style.left = (region.left >= 0) ? (region.left + "px") : "";
			style.right = (region.right >= 0) ? (region.right + "px") : "";
			style.top = (region.top >= 0) ? (region.top + "px") : "";
			style.bottom = (region.bottom >= 0) ? (region.bottom + "px") : "";
			$invokeSuper.call(this, [region, layoutDom, autoWidth, autoHeight]);
		}
	});
})();
(function () {
	var defaultRegionPadding = 0;
	var getLastRegionFuncs = {};
	jQuery.each(["left", "right", "top", "bottom"], function (i, type) {
		getLastRegionFuncs[type] = function (region) {
			while(region.previousRegion) {
				region = region.previousRegion;
				if(region.constraint.type == type) {
					return region;
				}
			}
			return null;
		};
	});
	var defaultConstraintsCache = {
		top: {
			type: "top",
			left: 0,
			right: 0,
			top: 0,
			bottom: undefined,
			anchorLeft: getLastRegionFuncs.left,
			anchorRight: getLastRegionFuncs.right,
			anchorTop: getLastRegionFuncs.top,
			anchorBottom: undefined
		},
		bottom: {
			type: "bottom",
			left: 0,
			right: 0,
			top: undefined,
			bottom: 0,
			anchorLeft: getLastRegionFuncs.left,
			anchorRight: getLastRegionFuncs.right,
			anchorTop: undefined,
			anchorBottom: getLastRegionFuncs.bottom
		},
		left: {
			type: "left",
			left: 0,
			right: undefined,
			top: 0,
			bottom: 0,
			anchorLeft: getLastRegionFuncs.left,
			anchorRight: undefined,
			anchorTop: getLastRegionFuncs.top,
			anchorBottom: getLastRegionFuncs.bottom
		},
		right: {
			type: "right",
			left: undefined,
			right: 0,
			top: 0,
			bottom: 0,
			anchorLeft: undefined,
			anchorRight: getLastRegionFuncs.right,
			anchorTop: getLastRegionFuncs.top,
			anchorBottom: getLastRegionFuncs.bottom
		},
		center: {
			type: "center",
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			anchorLeft: getLastRegionFuncs.left,
			anchorRight: getLastRegionFuncs.right,
			anchorTop: getLastRegionFuncs.top,
			anchorBottom: getLastRegionFuncs.bottom
		}
	};

	function getDefaultConstraint(type) {
		return dorado.Object.apply({}, defaultConstraintsCache[type || "center"]);
	}
	dorado.widget.layout.DockLayout = $extend(dorado.widget.layout.AnchorLayout, {
		$className: "dorado.widget.layout.DockLayout",
		_className: "d-dock-layout",
		ATTRIBUTES: {
			regionPadding: {
				defaultValue: defaultRegionPadding
			}
		},
		preprocessLayoutConstraint: function (layoutConstraint, control) {
			if(!control._visible && control._hideMode == "display") {
				layoutConstraint = dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT;
			}
			if(layoutConstraint) {
				if(layoutConstraint != dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
					if(layoutConstraint.constructor == String) {
						layoutConstraint = getDefaultConstraint(layoutConstraint);
					} else {
						layoutConstraint = dorado.Object.apply(layoutConstraint, getDefaultConstraint(layoutConstraint.type));
					}
				}
			} else {
				layoutConstraint = dorado.Object.apply({}, getDefaultConstraint(null));
			}
			return layoutConstraint;
		},
		addControl: function (control) {
			var layoutConstraint = this.preprocessLayoutConstraint(control._layoutConstraint, control);
			var region = {
				id: dorado.Core.newId(),
				control: control,
				constraint: layoutConstraint
			};
			var regions = this._regions;
			var lastRegion = (regions.size > 0) ? regions.last.data : null;
			if(lastRegion && lastRegion.constraint.type == "center") {
				if(layoutConstraint.type == "center") {
					var lastControl = lastRegion.control;
					if(!lastControl._layoutConstraint || typeof lastControl._layoutConstraint != "object") {
						lastControl._layoutConstraint = "top";
					} else {
						lastControl._layoutConstraint.type = "top";
					}
					dorado.Object.apply(lastRegion.constraint, getDefaultConstraint("top"));
					if(this._rendered) {
						this.refreshControl(control);
					}
					region.previousRegion = lastRegion;
					regions.insert(region);
				} else {
					region.previousRegion = (regions.last.previous) ? regions.last.previous.data : null;
					lastRegion.previousRegion = region;
					regions.insert(region, "before", lastRegion);
				}
			} else {
				region.previousRegion = lastRegion;
				regions.insert(region);
			}
			control._parentLayout = this;
			if(this.onAddControl) {
				this.onAddControl(control);
			}
		},
		renderControl: function (region, containerDom, autoWidth, autoHeight) {
			switch(region.constraint.type) {
			case "top":
			case "bottom":
				autoWidth = true;
				break;
			case "left":
			case "right":
				autoHeight = true;
				break;
			default:
				autoWidth = autoHeight = true;
			}
			return $invokeSuper.call(this, [region, containerDom, autoWidth, autoHeight]);
		}
	});
	dorado.Toolkits.registerPrototype("layout", "Default", dorado.widget.layout.DockLayout);
})();
(function () {
	var defaultRegionPadding = 2;
	var HBOX_ALIGNS = {
			top: "top",
			center: "middle",
			bottom: "bottom"
		},
		HBOX_PACKS = {
			start: "left",
			center: "center",
			end: "right"
		};
	var VBOX_ALIGNS = {
			left: "left",
			center: "center",
			right: "right"
		},
		VBOX_PACKS = {
			start: "top",
			center: "middle",
			end: "bottom"
		};
	dorado.widget.layout.AbstractBoxLayout = $extend(dorado.widget.layout.Layout, {
		$className: "dorado.widget.layout.AbstractBoxLayout",
		ATTRIBUTES: {
			pack: {
				defaultValue: "start"
			},
			stretch: {
				defaultValue: true
			},
			padding: {
				defaultValue: 2
			},
			regionPadding: {
				defaultValue: defaultRegionPadding
			}
		}
	});
	var p = dorado.widget.layout.AbstractBoxLayout.prototype;
	p.onAddControl = p.doRefreshRegion = function () {
		if(!this._attached || this._disableRendering) {
			return;
		}
		this.refresh();
	};
	p.removeControl = function (control) {
		this._regions.removeKey(control._uniqueId);
		if(!this._attached || this._disableRendering) {
			return;
		}
		this.refresh();
	};
	dorado.widget.layout.HBoxLayout = $extend(dorado.widget.layout.AbstractBoxLayout, {
		$className: "dorado.widget.layout.HBoxLayout",
		_className: " d-hbox-layout",
		ATTRIBUTES: {
			align: {
				defaultValue: "center"
			}
		},
		createDom: function () {
			var context = {},
				dom = $DomUtils.xCreate({
					tagName: "TABLE",
					className: this._className,
					cellSpacing: 0,
					cellPadding: 0,
					content: {
						tagName: "TBODY",
						content: {
							tagName: "TR",
							contextKey: "row"
						}
					}
				}, null, context);
			this._row = context.row;
			return dom;
		},
		refreshDom: function (dom) {
			var table = dom,
				row = this._row,
				parentDom = table.parentNode;
			var domCache = this.domCache || {},
				newDomCache = this.domCache = {};
			var padding = parseInt(this._padding) || 0,
				regionPadding = this._regionPadding || 0;
			if(dorado.Browser.msie && dorado.Browser.version < 8) {
				table.style.margin = padding + "px";
			} else {
				table.style.padding = padding + "px";
			}
			var clientSize = this._container.getContentContainerSize();
			var clientWidth = clientSize[0],
				clientHeight = clientSize[1];
			if(clientWidth > 10000) {
				clientWidth = 0;
			}
			if(clientHeight > 10000) {
				clientHeight = 0;
			}
			var realContainerWidth = clientWidth - padding * 2;
			var realContainerHeight = clientHeight - padding * 2;
			if(realContainerWidth < 0) {
				realContainerWidth = 0;
			}
			if(realContainerHeight < 0) {
				realContainerHeight = 0;
			}
			if(dorado.Browser.webkit) {
				realContainerHeight -= padding * 2;
			}
			$fly(parentDom).css("text-align", HBOX_PACKS[this._pack]);
			row.style.verticalAlign = HBOX_ALIGNS[this._align];
			if(!dorado.Browser.webkit) {
				table.style.height = realContainerHeight + "px";
			} else {
				row.style.height = realContainerHeight + "px";
			}
			for(var it = this._regions.iterator(); it.hasNext();) {
				var region = it.next(),
					cell = domCache[region.id];
				if(cell) {
					cell.style.display = "none";
				}
			}
			var i = 0;
			for(var it = this._regions.iterator(); it.hasNext();) {
				var region = it.next();
				var constraint = region.constraint;
				if(constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
					continue;
				}
				var w, cell = domCache[region.id],
					cell, div, isNewCell = false;
				if(!cell) {
					cell = document.createElement("TD");
					isNewCell = true;
				} else {
					delete domCache[region.id];
				}
				newDomCache[region.id] = cell;
				var refCell = row.childNodes[i];
				if(refCell != cell) {
					if(cell.parentNode == row) {
						while(refCell && refCell != cell) {
							row.removeChild(refCell);
							refCell = refCell.nextSibling;
						}
					} else {
						(refCell) ? row.insertBefore(cell, refCell): row.appendChild(cell);
					}
				}
				cell.style.display = "";
				if(constraint.align) {
					cell.style.verticalAlign = (constraint.align == "center") ? "middle" : constraint.align;
				}
				var w = region.control._width;
				if(w) {
					if(w.constructor == String && w.match("%")) {
						var rate = parseInt(w);
						if(!isNaN(rate)) {
							w = rate * realContainerWidth / 100;
						}
					} else {
						w = parseInt(w);
					}
				} else {
					w = undefined;
				}
				region.width = w;
				var h;
				if(!this._stretch || region.control.getAttributeWatcher().getWritingTimes("height")) {
					h = region.control._height;
					if(h) {
						if(h.constructor == String && h.match("%")) {
							var rate = parseInt(h);
							if(!isNaN(rate)) {
								h = rate * realContainerHeight / 100;
							}
						} else {
							h = parseInt(h);
						}
					} else {
						h = undefined;
					}
				} else {
					h = realContainerHeight;
				}
				region.height = h;
				if(i > 0) {
					cell.style.paddingLeft = (region.constraint.padding || regionPadding) + "px";
				}
				if(isNewCell) {
					this.renderControl(region, cell, true, this._stretch);
				} else {
					this.resetControlDimension(region, cell, true, this._stretch);
				}
				i++;
			}
			for(var regionId in domCache) {
				var cell = domCache[regionId];
				if(cell && cell.parentNode == row) {
					row.removeChild(cell);
				}
				delete domCache[regionId];
			}
			if(this._stretch) {
				var rowHeight = row.offsetHeight;
				if(rowHeight > realContainerHeight) {
					table.style.height = "";
					realContainerHeight += (rowHeight - realContainerHeight);
					for(var it = this._regions.iterator(); it.hasNext();) {
						var region = it.next();
						var constraint = region.constraint;
						if(constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
							continue;
						}
						var h = region.control._height;
						if(h) {
							if(h.constructor == String && h.match("%")) {
								var rate = parseInt(h);
								if(!isNaN(rate)) {
									h = rate * realContainerHeight / 100;
								}
							}
						}
						if(h) {
							region.height = h;
							var cell = newDomCache[region.id];
							this.resetControlDimension(region, cell, true, true);
						}
					}
				}
			}
		}
	});
	dorado.widget.layout.VBoxLayout = $extend(dorado.widget.layout.AbstractBoxLayout, {
		$className: "dorado.widget.layout.VBoxLayout",
		_className: "d-vbox-layout",
		ATTRIBUTES: {
			align: {
				defaultValue: "left"
			}
		},
		createDom: function () {
			var context = {},
				dom = $DomUtils.xCreate({
					tagName: "TABLE",
					className: this._className,
					cellSpacing: 0,
					cellPadding: 0,
					content: {
						tagName: "TBODY",
						contextKey: "tbody"
					}
				}, null, context);
			this._tbody = context.tbody;
			return dom;
		},
		preparePackTable: function (container, pack) {
			if(!this._packTable) {
				var context = {};
				this._packTable = $DomUtils.xCreate({
					tagName: "TABLE",
					cellSpacing: 0,
					cellPadding: 0,
					content: {
						tagName: "TR",
						content: {
							tagName: "TD",
							contextKey: "packCell",
							content: this.getDom()
						}
					},
					style: {
						width: "100%",
						height: "100%"
					}
				}, null, context);
				this._packCell = context.packCell;
				container.appendChild(this._packTable);
			}
			this._packCell.style.verticalAlign = VBOX_PACKS[pack];
			this._packCell.style.align = "center";
			this._packCell.align = "center";
			return this._packTable;
		},
		removePackTable: function (container) {
			if(this._packTable) {
				container.removeChild(this._packTable);
				container.appendChild(this.getDom());
				delete this._packTable;
				delete this._packCell;
			}
		},
		refreshDom: function (dom) {
			var parentDom = this._dom.parentNode;
			if(this._pack == "start") {
				this.removePackTable(parentDom);
			} else {
				this.preparePackTable(parentDom, this._pack);
			}
			var table = dom,
				tbody = this._tbody;
			var domCache = this.domCache || {},
				newDomCache = this.domCache = {};
			var padding = parseInt(this._padding) || 0,
				regionPadding = this._regionPadding || 0;
			if(dorado.Browser.msie && dorado.Browser.version < 8) {
				table.style.margin = padding + "px";
			} else {
				table.style.padding = padding + "px";
			}
			var clientSize = this._container.getContentContainerSize();
			var clientWidth = clientSize[0],
				clientHeight = clientSize[1];
			if(clientWidth > 10000) {
				clientWidth = 0;
			}
			if(clientHeight > 10000) {
				clientHeight = 0;
			}
			var realContainerWidth = clientWidth - padding * 2;
			var realContainerHeight = clientHeight - padding * 2;
			if(realContainerWidth < 0) {
				realContainerWidth = 0;
			}
			if(realContainerHeight < 0) {
				realContainerHeight = 0;
			}
			table.style.width = realContainerWidth + "px";
			for(var it = this._regions.iterator(); it.hasNext();) {
				var region = it.next(),
					row = domCache[region.id];
				if(row) {
					row.style.display = "none";
				}
			}
			var i = 0;
			for(var it = this._regions.iterator(); it.hasNext();) {
				var region = it.next();
				var constraint = region.constraint;
				if(constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
					continue;
				}
				var w, row = domCache[region.id],
					cell, div, isNewRow = false;
				if(!row) {
					row = $DomUtils.xCreate({
						tagName: "TR",
						content: {
							tagName: "TD",
							content: (function () {
								if(dorado.Browser.msie && dorado.Browser.version < 8) {
									return undefined;
								} else {
									return {
										tagName: "DIV",
										className: "d-fix-text-align",
										style: !dorado.Browser.webkit ? "display:inline-block;zoom:1" : "display:table-cell"
									};
								}
							})()
						}
					});
					isNewRow = true;
				} else {
					delete domCache[region.id];
				}
				newDomCache[region.id] = row;
				var refRow = tbody.childNodes[i];
				if(refRow != row) {
					if(row.parentNode == tbody) {
						while(refRow && refRow != row) {
							tbody.removeChild(refRow);
							refRow = refRow.nextSibling;
						}
					} else {
						(refRow) ? tbody.insertBefore(row, refRow): tbody.appendChild(row);
					}
				}
				row.style.display = "";
				cell = row.firstChild;
				div = (dorado.Browser.msie && dorado.Browser.version < 8) ? cell : cell.firstChild;
				if(!this._stretch || region.control.getAttributeWatcher().getWritingTimes("width")) {
					w = region.control._width;
					if(w) {
						if(w.constructor == String && w.match("%")) {
							var rate = parseInt(w);
							if(!isNaN(rate)) {
								w = rate * realContainerWidth / 100;
							}
						} else {
							w = parseInt(w);
						}
					} else {
						w = undefined;
					}
				} else {
					w = realContainerWidth;
				}
				region.width = w;
				var h = region.control._height;
				if(h) {
					if(h.constructor == String && h.match("%")) {
						var rate = parseInt(h);
						if(!isNaN(rate)) {
							h = rate * realContainerHeight / 100;
						}
					} else {
						h = parseInt(h);
					}
				} else {
					h = undefined;
				}
				region.height = h;
				cell.align = constraint.align || VBOX_ALIGNS[this._align];
				if(i > 0) {
					cell.style.paddingTop = (region.constraint.padding || regionPadding) + "px";
				}
				if(isNewRow) {
					this.renderControl(region, div, true, true);
					if(dorado.Browser.msie && dorado.Browser.version < 9 && region.control && region.control._rendered) {
						if(dorado.Browser.version < 8) {
							$fly(region.control.getDom()).addClass("i-fix-text-align");
						}
						row.appendChild(cell);
					}
				} else {
					this.resetControlDimension(region, div, true, true);
				}
				i++;
			}
			for(var regionId in domCache) {
				var row = domCache[regionId];
				if(row && row.parentNode == tbody) {
					tbody.removeChild(row);
				}
				delete domCache[regionId];
			}
			var tableWidth = realContainerWidth;
			if(this._stretch && (tableWidth - padding * 2) > realContainerWidth) {
				realContainerWidth += (tableWidth - padding * 2 - realContainerWidth);
				for(var it = this._regions.iterator(); it.hasNext();) {
					var region = it.next();
					var constraint = region.constraint;
					if(constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
						continue;
					}
					var w = region.control._width;
					if(w) {
						if(w.constructor == String && w.match("%")) {
							var rate = parseInt(w);
							if(!isNaN(rate)) {
								w = rate * realContainerWidth / 100;
							}
						}
					}
					if(w) {
						region.width = w;
						var div = newDomCache[region.id];
						this.resetControlDimension(region, div, true, true);
					}
				}
			}
		}
	});
})();
(function () {
	var IGNORE_PROPERTIES = ["colSpan", "rowSpan", "align", "vAlign"];
	dorado.widget.layout.FormLayout = $extend(dorado.widget.layout.Layout, {
		$className: "dorado.widget.layout.FormLayout",
		_className: "d-form-layout",
		ATTRIBUTES: {
			regionClassName: {
				defaultValue: "d-form-layout-region"
			},
			cols: {
				defaultValue: "*,*"
			},
			rowHeight: {
				defaultValue: 22
			},
			colPadding: {
				defaultValue: 6
			},
			rowPadding: {
				defaultValue: 6
			},
			padding: {
				defaultValue: 8
			},
			stretchWidth: {}
		},
		constructor: function (config) {
			this._useBlankRow = true;
			$invokeSuper.call(this, [config]);
		},
		createDom: function () {
			return $DomUtils.xCreate({
				tagName: "TABLE",
				className: this._className,
				cellSpacing: 0,
				cellPadding: 0,
				content: "^TBODY"
			});
		},
		refreshDom: function (dom) {
			function isSameGrid(oldGrid, newGrid) {
				if(!oldGrid) {
					return false;
				}
				if(oldGrid.length != newGrid.length) {
					return false;
				}
				var same = true;
				for(var i = 0; i < newGrid.length && same; i++) {
					var oldRow = oldGrid[i],
						newRow = newGrid[i];
					if(oldRow == null || oldRow.length != newRow.length) {
						same = false;
						break;
					}
					for(var j = 0; j < newRow.length; j++) {
						var oldRegion = oldRow[j],
							newRegion = newRow[j];
						if(oldRegion == null && newRegion == null) {
							continue;
						}
						if(oldRegion == null || newRegion == null || oldRegion.colSpan != newRegion.colSpan || oldRegion.rowSpan != newRegion.rowSpan || oldRegion.regionIndex != newRegion.regionIndex) {
							same = false;
							break;
						}
					}
				}
				return same;
			}
			var tbody;
			var grid = this.precalculateRegions();
			var structureChanged = !isSameGrid(this._grid, grid);
			if(structureChanged) {
				this._domCache = {};
				this._grid = grid;
				tbody = dom.tBodies[0];
				for(var i = 0, rowNum = tbody.childNodes.length, row; i < rowNum; i++) {
					row = tbody.childNodes[i];
					for(var j = 0, cellNum = row.childNodes.length; j < cellNum; j++) {
						var cell = row.childNodes[j];
						if(cell.firstChild) {
							cell.removeChild(cell.firstChild);
						}
					}
				}
				$fly(tbody).remove();
				tbody = document.createElement("TBODY");
				dom.appendChild(tbody);
			} else {
				tbody = dom.tBodies[0];
				grid = this._grid;
			}
			this.resizeTableAndCols();
			var index, realColWidths = this._realColWidths;
			if(this._useBlankRow) {
				if(structureChanged) {
					var tr = document.createElement("TR");
					tr.style.height = 0;
					for(var i = 0; i < realColWidths.length; i++) {
						var td = document.createElement("TD");
						td.style.width = realColWidths[i] + "px";
						tr.appendChild(td);
					}
					tbody.appendChild(tr);
				} else {
					var tr = tbody.childNodes[0];
					for(var i = 0; i < realColWidths.length; i++) {
						var td = tr.childNodes[i];
						td.style.width = realColWidths[i] + "px";
					}
				}
			}
			var realignRegions = [],
				rowIndexOffset = ((this._useBlankRow) ? 1 : 0),
				index = -1;
			for(var row = 0; row < grid.length; row++) {
				var tr;
				if(structureChanged) {
					tr = document.createElement("TR");
					if(row == 0) {
						tr.className = "d-form-layout-row first-row";
					} else {
						tr.className = "d-form-layout-row";
					}
					tbody.appendChild(tr);
				} else {
					tr = tbody.childNodes[row + rowIndexOffset];
				}
				if(!dorado.Browser.webkit) {
					tr.style.height = this._rowHeight + "px";
				}
				var cols = grid[row],
					cellForRenders = [],
					colIndex = 0;
				for(var col = 0; col < cols.length; col++) {
					var region = grid[row][col];
					if(region && region.regionIndex <= index) {
						continue;
					}
					var td;
					if(structureChanged) {
						td = this.createRegionContainer(region);
						if(dorado.Browser.webkit) {
							td.style.height = this._rowHeight + "px";
						}
						tr.appendChild(td);
					} else {
						td = tr.childNodes[colIndex];
					}
					colIndex++;
					var cls = this._colClss[col];
					if(cls) {
						$fly(td).addClass(cls);
					}
					if(region) {
						index = region.regionIndex;
						region.autoWidthAdjust = region.autoHeightAdjust = 0;
						if((col + region.colSpan) < cols.length) {
							region.autoWidthAdjust = 0 - this._colPadding;
						}
						if((row + region.rowSpan) < grid.length) {
							region.autoHeightAdjust = 0 - this._rowPadding;
						}
						td.colSpan = region.colSpan;
						td.rowSpan = region.rowSpan;
						var w = 0;
						if(region.colSpan > 1) {
							var endIndex = region.colIndex + region.colSpan;
							for(var j = region.colIndex; j < endIndex; j++) {
								w += realColWidths[j];
							}
						} else {
							w = realColWidths[region.colIndex];
						}
						region.width = w;
						if(dorado.Browser.msie && dorado.Browser.version < 8) {
							td.style.paddingTop = "0px";
						}
						td.style.paddingBottom = (-region.autoHeightAdjust || 0) + "px";
						cellForRenders.push({
							cell: td,
							region: region
						});
					}
				}
				for(var i = 0; i < cellForRenders.length; i++) {
					var cellInfo = cellForRenders[i],
						td = cellInfo.cell,
						region = cellInfo.region;
					if(region.control._fixedHeight === false) {
						var controlDom = region.control.getDom();
						region.display = controlDom.style.display;
						controlDom.style.display = "none";
						realignRegions.push(region);
					} else {
						var useControlWidth = region.control.getAttributeWatcher().getWritingTimes("width") && region.control._width != "auto";
						this.renderControl(region, td, !useControlWidth, false);
					}
				}
			}
			for(var i = 0; i < realignRegions.length; i++) {
				var region = realignRegions[i],
					td = this.getRegionDom(region);
				var controlDom = region.control.getDom();
				region.height = td.clientHeight;
				controlDom.style.display = region.display;
				var useControlWidth = region.control.getAttributeWatcher().getWritingTimes("width") && region.control._width != "auto";
				this.renderControl(region, td, !useControlWidth, true);
			}
		},
		createRegionContainer: function (region) {
			var dom = this.getRegionDom(region);
			if(!dom) {
				dom = document.createElement("TD");
				if(region) {
					this._domCache[region.id] = dom;
				}
			} else {
				if(dom.firstChild) {
					dom.removeChild(dom.firstChild);
				}
			}
			dom.className = this._regionClassName;
			if(region) {
				var $dom = $fly(dom),
					constraint = region.constraint;
				if(constraint.className) {
					$dom.addClass(constraint.className);
				}
				if(region.colIndex == 0) {
					$dom.addClass("first-cell");
				}
				if(constraint.align) {
					dom.align = constraint.align;
				}
				if(constraint.vAlign) {
					dom.vAlign = constraint.vAlign;
				}
				var css = dorado.Object.apply({}, constraint, function (p, v) {
					if(IGNORE_PROPERTIES.indexOf(p) >= 0) {
						return false;
					}
				});
				$dom.css(css);
			}
			return dom;
		},
		initColInfos: function () {
			this._cols = this._cols || "*";
			var colWidths = this._colWidths = [];
			var colClss = this._colClss = [];
			var dynaColCount = 0,
				fixedWidth = 0;
			jQuery.each(this._cols.split(","), function (i, col) {
				var w, cls, ind = col.indexOf("[");
				if(ind > 0) {
					w = col.substring(0, ind);
					cls = col.substring(ind + 1);
					if(cls.charAt(cls.length - 1) == "]") {
						cls = cls.substring(0, cls.length - 1);
					}
				} else {
					w = col;
				}
				colClss[i] = cls;
				if(w == "*") {
					colWidths.push(-1);
					dynaColCount++;
				} else {
					w = parseInt(w);
					colWidths.push(w);
					fixedWidth += (w || 0);
				}
			});
			this.colCount = colWidths.length;
			this.dynaColCount = dynaColCount;
			this.fixedWidth = fixedWidth;
		},
		precalculateRegions: function () {
			function precalculateRegion(grid, region) {
				function doTestRegion() {
					for(var row = rowIndex; row < rowIndex + rowSpan && row < grid.length; row++) {
						for(var col = colIndex; col < colIndex + colSpan; col++) {
							if(grid[row][col]) {
								return false;
							}
						}
					}
					return true;
				}
				var previousRegion = this.getPreviousRegion(region);
				var pRegionIndex = -1,
					pRowIndex = 0,
					pColIndex = -1,
					pColSpan = 1;
				if(previousRegion) {
					pRegionIndex = previousRegion.regionIndex;
					pRowIndex = previousRegion.rowIndex;
					pColIndex = previousRegion.colIndex;
				}
				var constraint = region.constraint;
				var rowIndex = pRowIndex,
					colIndex = pColIndex;
				var colSpan = ((constraint.colSpan > this.colCount) ? this.colCount : constraint.colSpan) || 1;
				var rowSpan = constraint.rowSpan || 1;
				do {
					colIndex++;
					if(colIndex + colSpan > this.colCount) {
						rowIndex++;
						colIndex = 0;
					}
				} while (!doTestRegion());
				for(var row = 0; row < rowSpan; row++) {
					if((rowIndex + row) >= grid.length) {
						grid.push(new Array(this.colCount));
					}
					for(var col = 0; col < colSpan; col++) {
						grid[rowIndex + row][colIndex + col] = region;
					}
				}
				region.regionIndex = pRegionIndex + 1;
				region.colIndex = colIndex;
				region.rowIndex = rowIndex;
				region.colSpan = colSpan;
				region.rowSpan = rowSpan;
			}
			this.initColInfos();
			var grid = [];
			var regions = this._regions;
			for(var it = regions.iterator(); it.hasNext();) {
				var region = it.next(),
					constraint = region.constraint;
				if(constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
					region.regionIndex = -1;
					continue;
				}
				constraint.colSpan = parseInt(constraint.colSpan);
				constraint.rowSpan = parseInt(constraint.rowSpan);
				precalculateRegion.call(this, grid, region);
			}
			return grid;
		},
		resizeTableAndCols: function () {
			var realColWidths = this._realColWidths;
			if(!realColWidths) {
				this._realColWidths = realColWidths = [];
			}
			var table = this.getDom(),
				padding = parseInt(this._padding) || 0,
				colPadding = this._colPadding || 0;
			var containerWidth = (table.parentNode) ? (jQuery(table.parentNode).width() - padding * 2) : 0;
			if(!(containerWidth >= 0) || containerWidth > 10000) {
				containerWidth = 0;
			}
			if(this._stretchWidth || this.dynaColCount > 0) {
				table.style.width = (containerWidth - $fly(table).edgeWidth()) + "px";
			}
			if(dorado.Browser.msie && dorado.Browser.version < 8) {
				table.style.margin = padding + "px";
			} else {
				table.style.padding = padding + "px";
			}
			containerWidth -= colPadding * (this._colWidths.length - 1);
			var self = this,
				changedCols = [];
			for(var i = 0; i < this._colWidths.length; i++) {
				var w = this._colWidths[i];
				if(self.dynaColCount > 0) {
					if(w == -1) {
						w = parseInt((containerWidth - self.fixedWidth) / self.dynaColCount);
					}
					w = (w < 0) ? 0 : w;
				} else {
					if(self._stretchWidth) {
						w = parseInt(w * containerWidth / self.fixedWidth);
					}
				}
				if(i < this._colWidths.length - 1) {
					w += colPadding;
				}
				if(realColWidths[i] != w) {
					changedCols.push(i);
				}
				realColWidths[i] = w;
			}
			return changedCols;
		}
	});
	var p = dorado.widget.layout.FormLayout.prototype;
	p.onAddControl = p.onRemoveControl = p.doRefreshRegion = function () {
		if(!this._attached || this._disableRendering) {
			return;
		}
		this.refresh();
	};
})();
