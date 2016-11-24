


(function () {
    var DEBUGGER_SHOW_ON_VISIBLE_KEY = "dorado.Debugger.showOnVisible";
    function setCookie(name, value, expire) {
        var exp = new Date();
        exp.setTime(exp.getTime() + expire);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    }
    function getCookie(name) {
        var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
        if (arr != null) {
            return unescape(arr[2]);
        }
        return null;
    }
    function delCookie(name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = getCookie(name);
        if (cval != null) {
            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
        }
    }
    dorado.debug = {initProcedures:[]};
    dorado.Debugger = {inited:false, initTabs:[], moduleActiveEvent:{}, trapError:true, format2HTML:function (text) {
        var reg1 = new RegExp("&", "g"), pattern = new RegExp("[<>\"\n\t]", "g"), map = {"<":"&lt;", ">":"&gt;", "\n":"<br/>", "\t":"&nbsp;&nbsp;", "\"":"&quot;"};
        return text.replace(reg1, "&amp;").replace(pattern, function (string) {
            return map[string];
        });
    }, init:function () {
        var tabControl = new dorado.widget.TabControl({$type:"TabControl", tabs:dorado.Debugger.initTabs, onTabChange:function (self, arg) {
            var tab = arg.newTab;
            if (tab && tab._name) {
                var callback = dorado.Debugger.moduleActiveEvent[tab._name];
                if (callback) {
                    callback.apply(this, arguments);
                }
            }
        }});
        var dialog = new dorado.widget.Dialog({layout:{$type:"Dock", padding:1}, caption:"Dorado Debugger(" + dorado.Core.VERSION + ")", width:800, height:500, dragOutside:true, center:true, maximizeable:true, exClassName:"d-debugger", contentOverflow:"hidden", children:[tabControl, {$type:"Container", layout:{$type:"Dock", padding:4}, layoutConstraint:"bottom", height:30, children:[{$type:"CheckBox", caption:"Visible on load", checked:!!getCookie(DEBUGGER_SHOW_ON_VISIBLE_KEY), listener:{onValueChange:function (self) {
            if (self._value) {
                setCookie(DEBUGGER_SHOW_ON_VISIBLE_KEY, true, 3600 * 24 * 365 * 1000);
            } else {
                delCookie(DEBUGGER_SHOW_ON_VISIBLE_KEY);
            }
        }}}]}]});
        this.tabControl = tabControl;
        this.dialog = dialog;
        this.inited = true;
    }, extend:function (source) {
        for (var prop in source) {
            dorado.Debugger[prop] = source[prop];
        }
    }, registerModule:function (config) {
        var deb = dorado.Debugger;
        config = config || {};
        if (config.name && config.onActive) {
            deb.moduleActiveEvent[config.name] = config.onActive;
            delete config.onActive;
        }
        if (!deb.inited) {
            deb.initTabs.push(config);
        } else {
            this.tabControl.addTab(config);
        }
    }, show:function () {
        $import("tree-grid", function () {
            if (dorado.debug.initProcedures) {
                dorado.debug.initProcedures.each(function (proc) {
                    proc.call();
                });
                delete dorado.debug.initProcedures;
            }
            var deb = dorado.Debugger;
            if (!deb.inited) {
                deb.init();
            }
            deb.dialog.show();
        });
    }};
    jQuery(document).ready(function () {
        var showOnVisible = getCookie(DEBUGGER_SHOW_ON_VISIBLE_KEY);
        if (showOnVisible) {
            dorado.Debugger.show();
        }
        var $document = jQuery(document);
        $document.bind("keydown", "f2", function () {
            dorado.Debugger.show();
        });
        $document.bind("keydown", "ctrl+f12", function () {
            dorado.Debugger.show();
        });
    });
})();
dorado.debug.initProcedures.push(function () {
    var LOG_LEVELS = {debug:10, info:9, warn:8, error:7, 10:"debug", 9:"info", 8:"warn", 7:"error"};
    dorado.debug.Logger = $extend(dorado.widget.Control, {$className:"dorado.debug.Logger", ATTRIBUTES:{className:{defaultValue:"d-debugger-logger"}, lockScrollBar:{}, level:{defaultValue:"debug", setter:function (value) {
        var logger = this, oldValue = logger._level, dom = logger._dom, i;
        value = value || "debug";
        if (oldValue && dom) {
            if (LOG_LEVELS[oldValue] > LOG_LEVELS[value]) {
                for (i = LOG_LEVELS[value] + 1; i <= LOG_LEVELS[oldValue]; i++) {
                    $fly(dom).find(".log-" + LOG_LEVELS[i]).css("display", "none");
                }
            } else {
                if (LOG_LEVELS[oldValue] < LOG_LEVELS[value]) {
                    for (i = LOG_LEVELS[oldValue] + 1; i <= LOG_LEVELS[value]; i++) {
                        $fly(dom).find(".log-" + LOG_LEVELS[i]).css("display", "");
                    }
                }
            }
            if (!logger._lockScrollBar) {
                logger.scrollToEnd();
            }
        }
        this._level = value;
    }}}, clear:function () {
        var logger = this, logs = logger._logs;
        if (logs) {
            logs = [];
            var dom = logger._dom;
            if (dom) {
                dom.innerHTML = "";
            }
        }
    }, log:function (msg, level) {
        var logger = this, logs = logger._logs;
        level = level in LOG_LEVELS ? level : "debug";
        msg = msg ? msg : "";
        if (!logs) {
            logs = logger._logs = [];
        }
        msg = dorado.Debugger.format2HTML("" + msg);
        logs.push(level + ":" + msg);
        if (logger._rendered) {
            var dom = logger._dom, logDom = $DomUtils.xCreate({tagName:"div", className:"log log-" + level, style:{display:LOG_LEVELS[level] > LOG_LEVELS[logger._level] ? "none" : ""}, content:[{tagName:"div", className:"icon"}, {tagName:"div", className:"msg", content:msg}]});
            dom.appendChild(logDom);
            if (dom.style.display != "none" && !logger._lockScrollBar) {
                $fly(logDom).scrollIntoView(dom);
            }
            return logDom;
        }
    }, dir:function (target, level) {
        var buffer = "{\n";
        for (var prop in target) {
            buffer += "\t" + prop + ": " + target[prop] + "\n";
        }
        buffer += "}\n";
        this.log(buffer, level);
    }, scrollToEnd:function () {
        var logger = this, dom = logger._dom;
        if (dom && dom.style.display != "none") {
            var scrollHeight = dom.scrollHeight, offsetHeight = dom.offsetHeight;
            dom.scrollTop = scrollHeight - offsetHeight;
        }
    }, createDom:function () {
        var logger = this, dom = $DomUtils.xCreate({tagName:"div"}), logs = logger._logs, logDom;
        if (logs) {
            for (var i = 0, j = logs.length; i < j; i++) {
                var log = logs[i], semicolonIndex = log.indexOf(":"), level = log.substring(0, semicolonIndex), msg = log.substr(semicolonIndex + 1);
                logDom = $DomUtils.xCreate({tagName:"div", className:"log log-" + level, style:{display:LOG_LEVELS[level] > LOG_LEVELS[logger._level] ? "none" : ""}, content:[{tagName:"div", className:"icon"}, {tagName:"div", className:"msg", content:msg}]});
                dom.appendChild(logDom);
            }
            if (!logger._lockScrollBar) {
                logger.scrollToEnd();
            }
        }
        return dom;
    }, refreshDom:function (dom) {
        var logger = this;
        $invokeSuper.call(this, arguments);
        if (!logger._lockScrollBar) {
            logger.scrollToEnd();
        }
    }});
    dorado.debug.ConsolePanel = $extend(dorado.widget.Container, {$className:"dorado.debug.ConsolePanel", constructor:function (config) {
        config = config || {};
        var panel = this, logger = new dorado.debug.Logger();
        var debugButton = new dorado.widget.SimpleIconButton({toggleable:true, iconClass:"d-debugger-log-debug-icon", toggled:true, tip:"Set log level to debug", listener:{onClick:function () {
            panel.setLogLevel("debug");
        }}});
        var infoButton = new dorado.widget.SimpleIconButton({iconClass:"d-debugger-log-info-icon", toggleable:true, tip:"Set log level to info", listener:{onClick:function () {
            panel.setLogLevel("info");
        }}});
        var warnButton = new dorado.widget.SimpleIconButton({iconClass:"d-debugger-log-warn-icon", toggleable:true, tip:"Set log level to warn", listener:{onClick:function () {
            panel.setLogLevel("warn");
        }}});
        var errorButton = new dorado.widget.SimpleIconButton({iconClass:"d-debugger-log-error-icon", toggleable:true, tip:"Set log level to error", listener:{onClick:function () {
            panel.setLogLevel("error");
        }}});
        this._debugButton = debugButton;
        this._infoButton = infoButton;
        this._warnButton = warnButton;
        this._errorButton = errorButton;
        this._logger = logger;
        config.children = [{$type:"ToolBar", items:[{caption:"Clear", iconClass:"d-debugger-log-clear-icon", tip:"Clear log console", listener:{onClick:function () {
            logger.clear();
        }}}, {caption:"Lock", iconClass:"d-debugger-log-lock-icon", tip:"Lock log console", toggleable:true, toggled:logger._lockScrollBar, listener:{onToggle:function (self) {
            logger._lockScrollBar = self._toggled;
        }}}, "-", debugButton, infoButton, warnButton, errorButton], layoutConstraint:"top"}, logger];
        $invokeSuper.call(this, [config]);
    }, setLogLevel:function (level) {
        if (level in LOG_LEVELS) {
            this._logger.set("level", level);
            this._debugButton.set("toggled", level == "debug");
            this._infoButton.set("toggled", level == "info");
            this._warnButton.set("toggled", level == "warn");
            this._errorButton.set("toggled", level == "error");
        }
    }, log:function (msg, level) {
        return this._logger.log(msg, level);
    }, dir:function (target, level) {
        return this._logger.dir(target, level);
    }});
    var consolePanel = new dorado.debug.ConsolePanel({layout:{$type:"Dock", padding:0}});
    dorado.Debugger.registerModule({$type:"Control", name:"console", caption:"Console", control:consolePanel});
    dorado.Debugger.extend({consolePanel:consolePanel, log:function (msg, level) {
        var deb = dorado.Debugger;
        if (!deb.inited) {
            deb.init();
        }
        return deb.consolePanel.log(msg, level);
    }, dir:function (target, level) {
        var deb = dorado.Debugger;
        if (!deb.inited) {
            deb.init();
        }
        return deb.consolePanel.dir(target, level);
    }});
    window.$log = dorado.Debugger.log;
    window.$dir = dorado.Debugger.dir;
    if (!window.console) {
        window.console = {log:function () {
            $log.apply(null, arguments);
        }, dir:function () {
            $dir.apply(null, arguments);
        }};
    }
});
dorado.debug.initProcedures.push(function () {
    dorado.debug.DebugPanel = $extend(dorado.widget.Panel, {$className:"dorado.debug.DebugPanel", EVENTS:{onRunCodeError:{}}, constructor:function (config) {
        config = config || {};
        var panel = this;
        var codeTextArea = new dorado.widget.TextArea({width:"100%", layoutConstraint:"center"});
        config.children = [{$type:"ToolBar", items:[{caption:"Run", iconClass:"d-debugger-script-run-icon", tip:"Run Code", listener:{onClick:function () {
            var code = "var $it = $topView._children.iterator(), view; while($it.hasNext()) { var control = $it.next(); if (control instanceof dorado.widget.View) { view = control; break; } }";
            code += codeTextArea.get("text");
            if (dorado.Debugger.trapError) {
                try {
                    eval(code);
                }
                catch (e) {
                    var errorMsg;
                    if (!dorado.Browser.msie) {
                        errorMsg = "name: " + e.name + "\nmessage: " + e.message + "\nstack: " + e.stack;
                    } else {
                        errorMsg = "name: " + e.name + "\nerrorNumber: " + (e.number & 65535) + "\nmessage: " + e.message;
                    }
                    panel.fireEvent("onRunCodeError", panel, {errorMsg:errorMsg});
                }
            } else {
                eval(code);
            }
        }}}, {caption:"Clear", tip:"Clear Code", iconClass:"d-debugger-script-clear-icon", listener:{onClick:function () {
            codeTextArea.set("text", "");
        }}}, "->", {$type:"CheckBox", caption:"Trap Error", width:100, checked:dorado.Debugger.trapError, listener:{onValueChange:function (self) {
            dorado.Debugger.trapError = self._checked;
        }}}], layoutConstraint:"top"}, codeTextArea];
        $invokeSuper.call(this, [config]);
    }});
    dorado.Debugger.registerModule({$type:"Control", caption:"Script", control:new dorado.debug.DebugPanel({border:"none", layout:new dorado.widget.layout.DockLayout({padding:0}), onRunCodeError:function (self, arg) {
        var errorMsg = arg.errorMsg;
        self._parent._parent.set("currentTab", "console");
        var logDom = dorado.Debugger.log(errorMsg, "error");
    }})});
});
dorado.debug.initProcedures.push(function () {
    var ENTITY_STATE_MAP = {0:"none", 1:"new", 2:"modified", 3:"deleted"};
    var mixIf = function (target, source) {
        if (target && source) {
            for (var prop in source) {
                if (target[prop] === undefined) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    };
    function isCollection(object) {
        return object instanceof Array || object instanceof dorado.util.KeyedArray || object instanceof dorado.util.KeyedList || object instanceof dorado.EntityList || object instanceof dorado.Entity;
    }
    var getFnBody = function (text) {
        var entire = typeof text == "function" ? text.toString() : text;
        return jQuery.trim(entire.substring(entire.indexOf("{") + 1, entire.lastIndexOf("}")));
    };
    dorado.debug.AttrGrid = $extend(dorado.widget.TreeGrid, {$className:"dorado.debug.AttrGrid", ATTRIBUTES:{sourceObject:{setter:function (value) {
        var attrGrid = this;
        attrGrid.disableAutoRefresh();
        attrGrid._root.clearChildren();
        attrGrid._root.addNodes(this.getTreeGridNodes(value));
        attrGrid.enableAutoRefresh();
        attrGrid.refresh();
        this._sourceObject = value;
    }}}, constructor:function (config) {
        config = config || {};
        mixIf(config, {expandingMode:"sync", stretchColumnsMode:"lastColumn", columns:[{name:"name", property:"name", width:200}, {name:"value", property:"value"}], treeColumn:"name", beforeExpand:function (self, arg) {
            var node = arg.node, id = node.get("data.label"), value = node.get("data.value");
            if (node.get("userData") || !id) {
            } else {
                node.set("userData", true);
                node.addNodes(self.getTreeGridNodes(value));
            }
        }, onCellValueEdit:function (self, arg) {
            var entity = arg.entity;
            if (entity) {
                var name = entity.get("label"), value = entity.get("value"), sourceObject = self._sourceObject;
                if (sourceObject && dorado.Object.isInstanceOf(sourceObject, dorado.AttributeSupport)) {
                    if (isFinite(value)) {
                        value = parseFloat(value);
                    } else {
                        if (["true", "false"].indexOf(value) >= 0) {
                            value = (value === "true") ? true : false;
                        }
                    }
                    sourceObject.set(name, value);
                }
            }
        }});
        $invokeSuper.call(this, [config]);
    }, getTreeGridNodes:function (object) {
        var prop, value, hasChild, nodes = [];
        if (object instanceof dorado.Entity) {
            nodes.push({label:"State", hasChild:false, data:{label:ENTITY_STATE_MAP[object.state], value:ENTITY_STATE_MAP[object.state]}});
            var data = object.getData();
            if (data) {
                for (prop in data) {
                    if (prop != "$dataType") {
                        value = data[prop];
                        nodes.push({label:prop, hasChild:false, data:{label:prop, value:value}});
                    }
                }
            }
        } else {
            if (object && dorado.Object.isInstanceOf(object, dorado.AttributeSupport)) {
                for (prop in object.ATTRIBUTES) {
                    if (prop in {"view":true, "parent":true}) {
                        continue;
                    }
                    value = object["_" + prop];
                    if (isCollection(value)) {
                        continue;
                    }
                    hasChild = value && typeof value == "object";
                    nodes.push({label:prop, hasChild:hasChild, data:{label:prop, value:value}});
                }
            } else {
                for (prop in object) {
                    if (prop in {"view":true, "parent":true}) {
                        continue;
                    }
                    value = object[prop];
                    if (typeof value == "function" || isCollection(value)) {
                        continue;
                    }
                    hasChild = value && typeof value == "object";
                    nodes.push({label:prop, hasChild:hasChild, data:{label:prop, value:value}});
                }
            }
        }
        nodes.sort(function (a, b) {
            return a.label > b.label ? 1 : -1;
        });
        return nodes;
    }});
    dorado.debug.ControlsPanel = $extend(dorado.widget.Panel, {$className:"dorado.debug.ControlsPanel", EVENTS:{onTreeCurrentChange:{}}, constructor:function (config) {
        config = config || {};
        var panel = this;
        var controlsTree = new dorado.widget.Tree({expandingMode:"sync", $type:"Tree", style:"borderStyle:none", beforeExpand:function (self, arg) {
            var node = arg.node, value = node.get("data.value");
            if (node.get("userData") || !value) {
            } else {
                node.set("userData", true);
                node.addNodes(panel.getTreeNodes(value, false));
            }
        }, onCurrentChange:function (self, arg) {
            panel.fireEvent("onTreeCurrentChange", self, arg);
        }});
        panel._controlsTree = controlsTree;
        mixIf(config, {caption:"View", tools:[{$type:"SimpleIconButton", iconClass:"d-debugger-view-export-icon", listener:{onClick:function () {
            var current = controlsTree.get("currentNode");
            if (!current) {
                dorado.MessageBox.alert($resource("dorado.baseWidget.DebuggerVariableNodeRequired"));
            } else {
                dorado.MessageBox.prompt($resource("dorado.baseWidget.DebuggerVariableExportInput"), function (text) {
                    if (text) {
                        window[text] = current.get("data.value");
                    } else {
                        dorado.MessageBox.alert($resource("dorado.baseWidget.DebuggerVariableNameRequired"));
                    }
                });
            }
        }}}, {$type:"SimpleIconButton", iconClass:"d-debugger-view-refresh-icon", listener:{onClick:function () {
            panel.reload();
        }}}], children:[controlsTree]});
        $invokeSuper.call(this, [config]);
    }, reload:function () {
        var panel = this, controlsTree = panel._controlsTree, topView = $topView, nodes = panel.getTreeNodes(topView._children, true);
        controlsTree.disableAutoRefresh();
        controlsTree._root.clearChildren();
        controlsTree._root.addNodes(nodes);
        controlsTree.enableAutoRefresh();
        controlsTree.refresh();
    }, getTreeNodes:function (object, onlyview) {
        function isCollectionHasElement(object) {
            var result = false, firstObject;
            if (object instanceof Array) {
                firstObject = object[0];
            } else {
                if (object instanceof dorado.util.KeyedArray) {
                    firstObject = object.get(0);
                } else {
                    if (object instanceof dorado.util.KeyedList) {
                        firstObject = object.getFirst();
                    } else {
                        if (object instanceof dorado.EntityList) {
                            firstObject = object.first();
                        } else {
                            if (object instanceof dorado.Entity) {
                                var data = object.getData(), prop, value, hasChild = false;
                                for (prop in data) {
                                    try {
                                        value = object.get(prop);
                                    }
                                    catch (e) {
                                        dorado.Exception.removeException(e);
                                        value = data[prop];
                                    }
                                    if (value instanceof dorado.EntityList || value instanceof dorado.Entity) {
                                        hasChild = true;
                                    }
                                }
                                return hasChild;
                            }
                        }
                    }
                }
            }
            if (firstObject && (firstObject instanceof dorado.Entity || dorado.Object.isInstanceOf(firstObject, dorado.AttributeSupport))) {
                return true;
            }
            return result;
        }
        function isHasChild(object) {
            var prop, value;
            if (object && dorado.Object.isInstanceOf(object, dorado.AttributeSupport)) {
                for (prop in object.ATTRIBUTES) {
                    value = object["_" + prop];
                    if (isCollectionHasElement(value)) {
                        return true;
                    }
                }
            } else {
                for (prop in object) {
                    value = object[prop];
                    if (isCollectionHasElement(value)) {
                        return true;
                    }
                }
            }
            return false;
        }
        function getObjectChildren(object, onlyview) {
            var prop, value, nodes = [], temp = [];
            if (object && dorado.Object.isInstanceOf(object, dorado.AttributeSupport)) {
                for (prop in object.ATTRIBUTES) {
                    value = object["_" + prop];
                    if (isCollectionHasElement(value)) {
                        temp.push({label:prop, hasChild:true, data:{value:value}});
                    }
                }
                if (temp.length != 1) {
                    nodes = temp;
                } else {
                    return getCollectionChildren(temp[0].data.value, onlyview);
                }
            } else {
                for (prop in object) {
                    value = object[prop];
                    if (isCollectionHasElement(value)) {
                        nodes.push({label:prop, hasChild:true, data:{value:value}});
                    }
                }
            }
            return nodes;
        }
        function getCollectionChildren(object, onlyview) {
            var nodes = [];
            function doGetNodes(obj) {
                if (onlyview) {
                    if (obj._parent && obj._parent != $topView) {
                        return;
                    }
                }
                var className = obj.constructor.className || "", $type = className.replace("dorado.widget.", "");
                var label = $type;
                if (obj._id && obj._id.indexOf("_uid") == -1) {
                    label = $type + "(" + obj._id + ")";
                }
                nodes.push({label:label, hasChild:isHasChild(obj), data:{value:obj}});
            }
            var data, prop, value;
            if (object instanceof dorado.Entity) {
                data = object.getData();
                for (prop in data) {
                    try {
                        value = object.get(prop);
                    }
                    catch (e) {
                        dorado.Exception.removeException(e);
                        value = data[prop];
                    }
                    if (value instanceof dorado.EntityList || value instanceof dorado.Entity) {
                        nodes.push({label:prop, hasChild:true, data:{value:value}});
                    }
                }
            } else {
                if (object instanceof dorado.EntityList) {
                    object.each(function (entity) {
                        nodes.push({label:"Entity", hasChild:isCollectionHasElement(entity), data:{value:entity}});
                    });
                } else {
                    if (object && object.each) {
                        object.each(doGetNodes);
                    } else {
                        for (var i = 0; i < object.length; i++) {
                            doGetNodes(object[i]);
                        }
                    }
                }
            }
            return nodes;
        }
        var result;
        if (isCollection(object)) {
            result = getCollectionChildren(object, onlyview);
        } else {
            result = getObjectChildren(object, onlyview);
        }
        return result;
    }});
    dorado.debug.EventsPanel = $extend(dorado.widget.Panel, {$className:"dorado.debug.EventsPanel", ATTRIBUTES:{sourceObject:{setter:function (value) {
        var eventsTree = this._eventsTree;
        eventsTree.disableAutoRefresh();
        eventsTree._root.clearChildren();
        eventsTree._root.addNodes(this.getEventNodes(value));
        eventsTree.enableAutoRefresh();
        eventsTree.refresh();
        this._sourceObject = value;
    }}, eventPreviewPanel:{}}, constructor:function (config) {
        config = config || {};
        var panel = this;
        var eventsTree = new dorado.widget.Tree({expandingMode:"sync", beforeExpand:function (self, arg) {
            var node = arg.node, id = node.get("data.label"), value = node.get("data.value");
            if (node.get("userData") || !id) {
            } else {
                node.set("userData", true);
                node.addNodes(panel.getEventNodes(value));
            }
        }, onCurrentChange:function (self, arg) {
            var current = arg.newCurrent, value, content = "", preview = panel._eventPreviewPanel;
            if (current) {
                value = current.get("data.value");
                if (value && typeof value.listener == "function") {
                    content = dorado.Debugger.format2HTML(getFnBody(value.listener));
                }
            }
            if (preview._dom) {
                preview._dom.innerHTML = content;
            }
        }});
        panel._eventsTree = eventsTree;
        mixIf(config, {$type:"Panel", caption:"Event Panel", border:"none", tools:[{$type:"SimpleIconButton", iconClass:"d-debugger-view-add-icon", listener:{onClick:function () {
            var current = eventsTree.get("currentNode");
            if (current && current.get("level") == 1) {
                var name = current.get("label"), object = current.get("data.object");
                dorado.MessageBox.promptMultiLines($resource("dorado.baseWidget.DebuggerInputListenerCode"), function (text) {
                    object.bind(name, new Function("self", "arg", text));
                    current.clearChildren();
                    current.addNodes(panel.getEventNodes(current.get("data.value")));
                });
            }
        }}}, {$type:"SimpleIconButton", iconClass:"d-debugger-view-delete-icon", listener:{onClick:function () {
            var current = eventsTree.get("currentNode");
            if (current && current.get("level") == 2) {
                var fn = current.get("data.value"), parent = current.get("parent"), name = parent.get("label"), object = parent.get("data.object");
                object.unbind(name, fn.listener);
                current.remove();
            }
        }}}, {$type:"SimpleIconButton", iconClass:"d-debugger-view-edit-icon", listener:{onClick:function () {
            var current = eventsTree.get("currentNode");
            if (current && current.get("level") == 2) {
                var fn = current.get("data.value"), parent = current.get("parent"), object = parent.get("data.object");
                dorado.MessageBox.promptMultiLines($resource("dorado.baseWidget.DebuggerInputListenerCode"), {callback:function (text) {
                    fn.listener = new Function("self", "arg", text);
                    var preview = panel._eventPreviewPanel;
                    preview._dom.innerHTML = dorado.Debugger.format2HTML(getFnBody(fn.listener));
                }, defaultText:getFnBody(fn.listener)});
            }
        }}}], children:[eventsTree]});
        $invokeSuper.call(this, [config]);
    }, getEventNodes:function (object) {
        var nodes = [], value, hasChild;
        if (object && object.EVENTS) {
            var events = object._events || {};
            for (var prop in object.EVENTS) {
                value = events[prop];
                hasChild = value && value.length > 0;
                nodes.push({label:prop, hasChild:hasChild, data:{label:prop, value:value, object:object}});
            }
        } else {
            if (object && object instanceof Array) {
                for (var i = 0; i < object.length; i++) {
                    value = object[i];
                    nodes.push({label:i, hasChild:false, data:{label:i, value:value}});
                }
            }
        }
        return nodes;
    }});
    dorado.debug.ViewPanel = $extend(dorado.widget.SplitPanel, {$className:"dorado.debug.ViewPanel", constructor:function (config) {
        config = config || {};
        var panel = this;
        var eventsPanel = new dorado.debug.EventsPanel({layoutConstraint:"right", width:200});
        var eventPreviewPanel = new dorado.widget.HtmlContainer({});
        eventsPanel._eventPreviewPanel = eventPreviewPanel;
        var attrGrid = new dorado.debug.AttrGrid();
        var controlTreePanel = new dorado.debug.ControlsPanel({layoutConstraint:{type:"left", height:"100%"}, listener:{onTreeCurrentChange:function (self, arg) {
            var current = arg.newCurrent;
            if (current) {
                attrGrid.set("sourceObject", current.get("data.value"));
                eventsPanel.set("sourceObject", current.get("data.value"));
            }
        }}});
        panel._controlTreePanel = controlTreePanel;
        mixIf(config, {position:200, sideControl:controlTreePanel, mainControl:{$type:"TabControl", tabs:[{$type:"Control", caption:"Attributes", control:attrGrid}, {$type:"Control", caption:"Events", control:{$type:"Container", layout:{$type:"Dock", regionPadding:1}, children:[eventsPanel, eventPreviewPanel]}}]}});
        $invokeSuper.call(this, [config]);
    }});
    var viewChildrenLoaded = false, viewPanel = new dorado.debug.ViewPanel();
    dorado.Debugger.registerModule({$type:"Control", name:"view", caption:"View", control:viewPanel, onActive:function () {
        if (!viewChildrenLoaded) {
            setTimeout(function () {
                viewPanel._controlTreePanel.reload();
            }, 0);
            viewChildrenLoaded = true;
        }
    }});
});
dorado.debug.initProcedures.push(function () {
    function HotKey(config) {
        for (var prop in config) {
            this[prop] = config[prop];
        }
    }
    HotKey.prototype.toString = function () {
        return this.key + "(" + this.type + ")";
    };
    dorado.debug.HotkeysPanel = $extend(dorado.widget.SplitPanel, {$className:"dorado.debug.HotkeysPanel", constructor:function (config) {
        config = config || {};
        var panel = this;
        var codePreview = new dorado.widget.HtmlContainer({width:"100%", height:"100%", style:"display: block"});
        var keyList = new dorado.widget.ListBox({style:"border: 0", onCurrentChange:function (self, arg) {
            var item = self.getCurrentItem(), code = "";
            if (item && item.callback) {
                code = item.callback.cb.toString();
            }
            codePreview._dom.innerHTML = "<pre>" + code + "</pre>";
        }});
        this._keyList = keyList;
        config = {position:200, sideControl:{$type:"Panel", caption:"Hotkey", tools:[{$type:"SimpleIconButton", iconClass:"d-debugger-hotkey-refresh-icon", listener:{onClick:function () {
            panel.reload();
        }}}], children:[keyList]}, mainControl:codePreview};
        $invokeSuper.call(this, [config]);
    }, reload:function () {
        var result = [];
        if (hotkeys && hotkeys.triggersMap) {
            var triggersMap = hotkeys.triggersMap;
            for (var prop in triggersMap) {
                var target = triggersMap[prop];
                for (var type in target) {
                    var keyList = target[type];
                    for (var key in keyList) {
                        var callbacks = keyList[key] || [];
                        for (var i = 0, j = callbacks.length; i < j; i++) {
                            result.push(new HotKey({type:type, key:key, callback:callbacks[i]}));
                        }
                    }
                }
            }
            this._keyList.set("items", result);
        }
        this._keyList.refresh();
    }});
    var hotkeysPanel = new dorado.debug.HotkeysPanel(), loaded = false;
    dorado.Debugger.registerModule({$type:"Control", name:"hotkey", caption:"Hotkey", control:hotkeysPanel, onActive:function () {
        if (!loaded) {
            hotkeysPanel.reload();
            loaded = true;
        }
    }});
});
dorado.debug.initProcedures.push(function () {
    var oldAjaxResult = dorado.util.AjaxResult;
    var ajaxResultPool = [];
    dorado.util.AjaxResult = $extend(oldAjaxResult, {constructor:function (options) {
        $invokeSuper.call(this, arguments);
        ajaxResultPool.push(this);
        if (options.url) {
            this.name = options.url.substr(options.url.lastIndexOf("/") + 1);
        }
        if (ajaxResultPoolChange) {
            ajaxResultPoolChange.apply(null, []);
        }
    }});
    dorado.debug.AjaxGrid = $extend(dorado.widget.Grid, {$className:"dorado.debug.AjaxGrid", constructor:function (config) {
        config = config || {};
        var grid = this;
        config = {columns:[{name:"Name", property:"name", width:200}, {name:"Url", property:"url", width:300}, {name:"Method", property:"method"}, {name:"Status", property:"status"}, {name:"StatusText", property:"statusText"}, {name:"Text", property:"text"}, {name:"Exception", property:"exception"}]};
        $invokeSuper.call(this, [config]);
    }, reload:function () {
        this.set("items", ajaxResultPool);
    }});
    var ajaxGrid = new dorado.debug.AjaxGrid();
    function ajaxResultPoolChange() {
        ajaxGrid.reload();
    }
    dorado.Debugger.registerModule({$type:"Control", name:"ajax", caption:"Ajax", control:ajaxGrid});
});

