


(function () {
    try {
        if (HTMLElement && !HTMLElement.prototype.innerText) {
            HTMLElement.prototype.__defineGetter__("innerText", function () {
                var text = this.textContent;
                if (text) {
                    text = text.replace(/<BR>/g, "\n");
                }
                return text;
            });
            HTMLElement.prototype.__defineSetter__("innerText", function (text) {
                if (text && text.constructor == String) {
                    var sections = text.split("\n");
                    if (sections.length > 1) {
                        this.innerHTML = "";
                        for (var i = 0; i < sections.length; i++) {
                            if (i > 0) {
                                this.appendChild(document.createElement("BR"));
                            }
                            this.appendChild(document.createTextNode(sections[i]));
                        }
                        return;
                    }
                }
                this.textContent = text;
            });
        }
    }
    catch (ex) {
    }
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (str) {
            return this.slice(0, str.length) == str;
        };
    }
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (str) {
            return this.slice(-str.length) == str;
        };
    }
    if (!Array.prototype.push) {
        Array.prototype.push = function (element) {
            this[this.length] = element;
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (element) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == element) {
                    return i;
                }
            }
            return -1;
        };
    }
    if (!Array.prototype.remove) {
        Array.prototype.remove = function (element) {
            var i = this.indexOf(element);
            if (i >= 0) {
                this.splice(i, 1);
            }
            return i;
        };
    }
    if (!Array.prototype.removeAt) {
        Array.prototype.removeAt = function (i) {
            this.splice(i, 1);
        };
    }
    if (!Array.prototype.insert) {
        Array.prototype.insert = function (element, i) {
            this.splice(i || 0, 0, element);
        };
    }
    if (!Array.prototype.peek) {
        Array.prototype.peek = function () {
            return this[this.length - 1];
        };
    }
    if (!Array.prototype.each) {
        Array.prototype.each = function (fn) {
            for (var i = 0; i < this.length; i++) {
                if (fn.call(this, this[i], i) === false) {
                    break;
                }
            }
        };
    }
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (target) {
            var fn = this;
            return function () {
                return fn.apply(target, arguments);
            };
        };
    }
})();
(function ($) {
    var matched, browser;
    jQuery.uaMatch = function (ua) {
        ua = ua.toLowerCase();
        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || /(trident).*rv\:([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
        return {browser:match[1] || "", version:match[2] || "0"};
    };
    matched = jQuery.uaMatch(navigator.userAgent);
    browser = {};
    if (matched.browser) {
        browser[matched.browser] = true;
        browser.version = matched.version;
    }
    if (browser.chrome) {
        browser.webkit = true;
    } else {
        if (browser.webkit) {
            browser.safari = true;
        } else {
            if (browser.trident) {
                browser.msie = true;
            }
        }
    }
    jQuery.browser = browser;
    var superReady = $.prototype.ready;
    $.prototype.ready = function (fn) {
        if (jQuery.browser.webkit) {
            var self = this;
            function waitForReady() {
                if (document.readyState !== "complete") {
                    setTimeout(waitForReady, 10);
                } else {
                    superReady.call(self, fn);
                }
            }
            waitForReady();
        } else {
            superReady.call(this, fn);
        }
    };
    var flyableElem = $();
    flyableElem.length = 1;
    var flyableArray = $();
    $fly = function (elems) {
        if (elems instanceof Array) {
            if ((dorado.Browser.mozilla && dorado.Browser.version >= 2) || dorado.Browser.msie) {
                for (var i = flyableArray.length - 1; i >= 0; i--) {
                    delete flyableArray[i];
                }
            }
            Array.prototype.splice.call(flyableArray, 0, flyableArray.length);
            Array.prototype.push.apply(flyableArray, elems);
            return flyableArray;
        } else {
            flyableElem[0] = elems;
            return flyableElem;
        }
    };
})(jQuery);
var dorado = {id:"_" + parseInt(Math.random() * Math.pow(10, 8)), _ID_SEED:0, _TIMESTAMP_SEED:0, _GET_ID:function (obj) {
    return obj._id;
}, _GET_NAME:function (obj) {
    return obj._name;
}, _NULL_FUNCTION:function () {
}, _UNSUPPORTED_FUNCTION:function () {
    return function () {
        throw new dorado.ResourceException("dorado.core.OperationNotSupported", dorado.getFunctionDescription(arguments.callee));
    };
}, Browser:(function () {
    var browser = {};
    for (var p in jQuery.browser) {
        if (jQuery.browser.hasOwnProperty(p)) {
            browser[p] = jQuery.browser[p];
        }
    }
    function detect(ua) {
        var os = {}, android = ua.match(/(Android)\s+([\d.]+)/), android_40 = ua.match(/(Android)\s+(4.0)/), ipad = ua.match(/(iPad).*OS\s([\d_]+)/), iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/), miui = ua.match(/(MiuiBrowser)\/([\d.]+)/i);
        if (android) {
            os.android = true;
            os.version = android[2];
        } else {
            if (iphone) {
                os.ios = true;
                os.version = iphone[2].replace(/_/g, ".");
                os.iphone = true;
            } else {
                if (ipad) {
                    os.ios = true;
                    os.version = ipad[2].replace(/_/g, ".");
                    os.ipad = true;
                }
            }
        }
        if (miui) {
            os.miui = true;
        }
        if (android_40) {
            os.android_40 = true;
        }
        return os;
    }
    var ua = navigator.userAgent, os = detect(ua);
    if (os.iphone) {
        browser.isPhone = os.iphone;
    } else {
        if (os.android) {
            var screenSize = window.screen.width;
            if (screenSize > window.screen.height) {
                screenSize = window.screen.height;
            }
            browser.isPhone = (screenSize / window.devicePixelRatio) < 768;
            if (os.miui) {
                browser.miui = true;
            }
        }
    }
    browser.android = os.android;
    browser.android_40 = os.android_40;
    browser.iOS = os.ios;
    browser.osVersion = os.version;
    browser.isTouch = (browser.android || browser.iOS) && !!("ontouchstart" in window || (window["$setting"] && $setting["common.simulateTouch"]));
    browser.version = parseInt(browser.version);
    return browser;
})(), beforeInit:function (listener) {
    if (this.beforeInitFired) {
        throw new dorado.Exception("'beforeInit' already fired.");
    }
    if (!this.beforeInitListeners) {
        this.beforeInitListeners = [];
    }
    this.beforeInitListeners.push(listener);
}, fireBeforeInit:function () {
    if (this.beforeInitListeners) {
        this.beforeInitListeners.each(function (listener) {
            return listener.call(dorado);
        });
        delete this.beforeInitListeners;
    }
    this.beforeInitFired = true;
}, onInit:function (listener) {
    if (this.onInitFired) {
        throw new dorado.Exception("'onInit' already fired.");
    }
    if (!this.onInitListeners) {
        this.onInitListeners = [];
    }
    this.onInitListeners.push(listener);
}, fireOnInit:function () {
    if (this.onInitListeners) {
        this.onInitListeners.each(function (listener) {
            return listener.call(dorado);
        });
        delete this.onInitListeners;
    }
    this.onInitFired = true;
}, afterInit:function (listener) {
    if (this.afterInitFired) {
        throw new dorado.Exception("'afterInit' already fired.");
    }
    if (!this.afterInitListeners) {
        this.afterInitListeners = [];
    }
    this.afterInitListeners.push(listener);
}, fireAfterInit:function () {
    if (this.afterInitListeners) {
        this.afterInitListeners.each(function (listener) {
            return listener.call(dorado);
        });
        delete this.afterInitListeners;
    }
    this.afterInitFired = true;
}, defaultToString:function (obj) {
    var s = obj.constructor.className || "[Object]";
    if (obj.id) {
        s += (" id=" + obj.id);
    }
    if (obj.name) {
        s += (" name=" + obj.name);
    }
}, getFunctionDescription:function (fn) {
    var defintion = fn.toString().split("\n")[0], name;
    if (fn.methodName) {
        var className;
        if (fn.declaringClass) {
            className = fn.declaringClass.className;
        }
        name = (className ? (className + ".") : "function ") + fn.methodName;
    } else {
        var regexpResult = defintion.match(/^function (\w*)/);
        name = "function " + (regexpResult && regexpResult[1] || "anonymous");
    }
    var regexpResult = defintion.match(/\((.*)\)/);
    return name + (regexpResult && regexpResult[0]);
}, getFunctionInfo:function (fn) {
    var defintion = fn.toString().substring(8), len = defintion.length, name = "", signature = "";
    var inSignatrue = false;
    for (var i = 0; i < len; i++) {
        var c = defintion.charAt(i);
        if (c === " " || c === "\t" || c === "\n" || c === "\r") {
            continue;
        } else {
            if (c === "(") {
                inSignatrue = true;
            } else {
                if (c === ")") {
                    break;
                } else {
                    if (inSignatrue) {
                        signature += c;
                    } else {
                        name += c;
                    }
                }
            }
        }
    }
    return {name:name, signature:signature};
}};
dorado.Core = {VERSION:"7.4.0", newId:function () {
    return "_uid_" + (++dorado._ID_SEED);
}, getTimestamp:function () {
    return ++dorado._TIMESTAMP_SEED;
}, scopify:function (scope, fn) {
    if (typeof fn == "function") {
        return function () {
            return fn.apply(scope, arguments);
        };
    } else {
        return function () {
            return eval("(function(){return(" + fn + ")}).call(scope)");
        };
    }
}, setTimeout:function (scope, fn, timeMillis) {
    if (dorado.Browser.mozilla && dorado.Browser.version >= 8) {
        return window.setTimeout(function () {
            (dorado.Core.scopify(scope, fn))();
        }, timeMillis);
    } else {
        return setTimeout(dorado.Core.scopify(scope, fn), timeMillis);
    }
}, setInterval:function (scope, fn, timeMillis) {
    if (dorado.Browser.mozilla && dorado.Browser.version >= 8) {
        return setInterval(function () {
            (dorado.Core.scopify(scope, fn))();
        }, timeMillis);
    } else {
        return setInterval(dorado.Core.scopify(scope, fn), timeMillis);
    }
}, clone:function (obj, deep) {
    function doClone(obj, deep) {
        if (obj == null || typeof (obj) != "object") {
            return obj;
        }
        if (typeof obj.clone == "function") {
            return obj.clone(deep);
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        } else {
            var constr = obj.constructor;
            var cloned = new constr();
            for (var attr in obj) {
                if (cloned[attr] === undefined) {
                    var v = obj[attr];
                    if (deep) {
                        v = doClone(v, deep);
                    }
                    cloned[attr] = v;
                }
            }
            return cloned;
        }
    }
    return doClone(obj, deep);
}};
(function () {
    window.$create = (dorado.Browser.msie && dorado.Browser.version < 9) ? document.createElement : function (arg) {
        return document.createElement(arg);
    };
    window.$scopify = dorado.Core.scopify;
    window.$setTimeout = dorado.Core.setTimeout;
    window.$setInterval = dorado.Core.setInterval;
})();
(function () {
    var CLASS_REPOSITORY = {};
    var UNNAMED_CLASS = "#UnnamedClass";
    function newClassName(prefix) {
        var i = 1;
        while (CLASS_REPOSITORY[prefix + i]) {
            i++;
        }
        return prefix + i;
    }
    function adapterFunction(fn) {
        var adapter = function () {
            return fn.apply(this, arguments);
        };
        adapter._doradoAdapter = true;
        return adapter;
    }
    function cloneDefintions(defs) {
        var newDefs = {};
        for (var p in defs) {
            if (defs.hasOwnProperty(p)) {
                newDefs[p] = dorado.Object.apply({}, defs[p]);
            }
        }
        return newDefs;
    }
    function overrideDefintions(subClass, defProp, defs, overwrite) {
        if (!defs) {
            return;
        }
        var sdefs = subClass.prototype[defProp];
        if (!sdefs) {
            subClass.prototype[defProp] = cloneDefintions(defs);
        } else {
            for (var p in defs) {
                if (defs.hasOwnProperty(p)) {
                    var odef = defs[p];
                    if (odef === undefined) {
                        return;
                    }
                    var cdef = sdefs[p];
                    if (cdef === undefined) {
                        sdefs[p] = cdef = {};
                    }
                    for (var m in odef) {
                        if (odef.hasOwnProperty(m) && (overwrite || cdef[m] === undefined)) {
                            var odefv = odef[m];
                            if (typeof odefv == "function") {
                                if (!odefv.declaringClass) {
                                    odefv.declaringClass = subClass;
                                    odefv.methodName = m;
                                    odefv.definitionType = defProp;
                                    odefv.definitionName = p;
                                }
                            }
                            cdef[m] = odefv;
                        }
                    }
                }
            }
        }
    }
    function override(subClass, overrides, overwrite) {
        if (!overrides) {
            return;
        }
        if (overwrite === undefined) {
            overwrite = true;
        }
        var subp = subClass.prototype;
        for (var p in overrides) {
            var override = overrides[p];
            if (p == "ATTRIBUTES" || p == "EVENTS") {
                overrideDefintions(subClass, p, override, overwrite);
                continue;
            }
            if (subp[p] === undefined || overwrite) {
                if (typeof override == "function") {
                    if (!override.declaringClass) {
                        override.declaringClass = subClass;
                        override.methodName = p;
                    }
                }
                subp[p] = override;
            }
        }
    }
    dorado.Object = {createNamespace:function (name) {
        var names = name.split(".");
        var parent = window;
        for (var i = 0; i < names.length; i++) {
            var n = names[i];
            var p = parent[n];
            if (p === undefined) {
                parent[n] = p = {};
            }
            parent = p;
        }
        return parent;
    }, createClass:function (p) {
        var constr = p.constructor;
        if (constr === Object) {
            constr = new Function();
        }
        constr.className = p.$className || newClassName(UNNAMED_CLASS);
        delete p.$className;
        for (var m in p) {
            if (p.hasOwnProperty(m)) {
                var v = p[m];
                if (typeof v == "function") {
                    if (!v.declaringClass) {
                        v.declaringClass = constr;
                        v.methodName = m;
                    }
                }
            }
        }
        constr.prototype = p;
        CLASS_REPOSITORY[constr.className] = constr;
        return constr;
    }, override:override, extend:(function () {
        var oc = Object.prototype.constructor;
        return function (superClass, overrides) {
            var sc, scs;
            if (superClass instanceof Array) {
                scs = superClass;
                sc = superClass[0];
            } else {
                sc = superClass;
            }
            var subClass = (overrides && overrides.constructor != oc) ? overrides.constructor : function () {
                sc.apply(this, arguments);
            };
            var fn = new Function();
            var sp = fn.prototype = sc.prototype;
            if (!sc.className) {
                sp.constructor = sc;
                sc.className = newClassName(UNNAMED_CLASS);
                sc.declaringClass = sp;
                sc.methodName = "constructor";
            }
            var subp = subClass.prototype = new fn();
            subp.constructor = subClass;
            subClass.className = overrides.$className || newClassName((sc.$className || UNNAMED_CLASS) + "$");
            subClass.superClass = sc;
            subClass.declaringClass = subClass;
            subClass.methodName = "constructor";
            delete overrides.$className;
            delete overrides.constructor;
            var attrs = subp["ATTRIBUTES"];
            if (attrs) {
                subp["ATTRIBUTES"] = cloneDefintions(attrs);
            }
            var events = subp["EVENTS"];
            if (events) {
                subp["EVENTS"] = cloneDefintions(events);
            }
            var ps = [sc];
            if (scs) {
                for (var i = 1, p; i < scs.length; i++) {
                    p = scs[i].prototype;
                    override(subClass, p, false);
                    ps.push(scs[i]);
                }
            }
            subClass.superClasses = ps;
            override(subClass, overrides, true);
            CLASS_REPOSITORY[subClass.className] = subClass;
            return subClass;
        };
    })(), eachProperty:function (object, fn) {
        if (object && fn) {
            for (var p in object) {
                fn.call(object, p, object[p]);
            }
        }
    }, apply:function (target, source, options) {
        if (source) {
            for (var p in source) {
                if (typeof options == "function" && options.call(target, p, source[p]) === false) {
                    continue;
                }
                if (options === false && target[p] !== undefined) {
                    continue;
                }
                target[p] = source[p];
            }
        }
        return target;
    }, isInstanceOf:function (object, type) {
        function hasSuperClass(superClasses) {
            if (!superClasses) {
                return false;
            }
            if (superClasses.indexOf(type) >= 0) {
                return true;
            }
            for (var i = 0; i < superClasses.length; i++) {
                if (hasSuperClass(superClasses[i].superClasses)) {
                    return true;
                }
            }
            return false;
        }
        if (!object) {
            return false;
        }
        var b = false;
        if (type.className) {
            b = object instanceof type;
        }
        if (!b) {
            var t = object.constructor;
            if (t) {
                b = hasSuperClass(t.superClasses);
            }
        }
        return b;
    }, clone:function (object, options) {
        if (typeof object == "object") {
            var objClone, options = options || {};
            if (options.onCreate) {
                objClone = new options.onCreate(object);
            } else {
                objClone = new object.constructor();
            }
            for (var p in object) {
                if (!options.onCopyProperty || options.onCopyProperty(p, object, objClone)) {
                    objClone[p] = object[p];
                }
            }
            objClone.toString = object.toString;
            objClone.valueOf = object.valueOf;
            return objClone;
        } else {
            return object;
        }
    }, hashCode:function (object) {
        if (object == null) {
            return 0;
        }
        var strKey = (typeof object) + "|" + dorado.JSON.stringify(object), hash = 0;
        for (i = 0; i < strKey.length; i++) {
            var c = strKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash = hash & hash;
        }
        return hash;
    }};
    window.$namespace = dorado.Object.createNamespace;
    window.$class = dorado.Object.createClass;
    window.$extend = dorado.Object.extend;
    var getSuperClass = window.$getSuperClass = function () {
        var fn = getSuperClass.caller, superClass;
        if (fn.declaringClass) {
            superClass = fn.declaringClass.superClass;
        }
        return superClass || {};
    };
    var getSuperClasses = window.$getSuperClasses = function () {
        var fn = getSuperClasses.caller, superClass;
        if (dorado.Browser.opera && dorado.Browser.version < 10) {
            fn = fn.caller;
        }
        if (fn.caller && fn.caller._doradoAdapter) {
            fn = fn.caller;
        }
        if (fn.declaringClass) {
            superClasses = fn.declaringClass.superClasses;
        }
        return superClasses || [];
    };
    var invokeSuper = window.$invokeSuper = function (args) {
        var fn = invokeSuper.caller;
        if (fn.caller && fn.caller._doradoAdapter) {
            fn = fn.caller;
        }
        if (fn.declaringClass) {
            var superClasses = fn.declaringClass.superClasses;
            if (!superClasses) {
                return;
            }
            var superClass, superFn;
            for (var i = 0; i < superClasses.length; i++) {
                superClass = superClasses[i].prototype;
                if (fn.definitionType) {
                    superFn = superClass[fn.definitionType][fn.definitionName][fn.methodName];
                } else {
                    superFn = superClass[fn.methodName];
                }
                if (superFn) {
                    return superFn.apply(this, args || []);
                }
            }
        }
    };
    invokeSuper.methodName = "$invokeSuper";
})();
(function () {
    var doradoServierURI = ">dorado/view-service";
    dorado.Setting = {"common.defaultDateFormat":"Y-m-d", "common.defaultTimeFormat":"H:i:s", "common.defaultDateTimeFormat":"Y-m-d H:i:s", "common.defaultDisplayDateFormat":"Y-m-d", "common.defaultDisplayTimeFormat":"H:i:s", "common.defaultDisplayDateTimeFormat":"Y-m-d H:i:s", "ajax.defaultOptions":{batchable:true}, "ajax.dataTypeRepositoryOptions":{url:doradoServierURI, method:"POST", batchable:true}, "ajax.dataProviderOptions":{url:doradoServierURI, method:"POST", batchable:true}, "ajax.dataResolverOptions":{url:doradoServierURI, method:"POST", batchable:true}, "ajax.remoteServiceOptions":{url:doradoServierURI, method:"POST", batchable:true}, "longPolling.pollingOptions":{url:doradoServierURI, method:"GET", batchable:false}, "longPolling.sendingOptions":{url:doradoServierURI, method:"POST", batchable:true}, "dom.useCssShadow":true, "widget.skin":"~current", "widget.panel.useCssCurveBorder":true, "widget.datepicker.defaultYearMonthFormat":"m &nbsp;&nbsp; Y"};
    if (window.$setting instanceof Object) {
        dorado.Object.apply(dorado.Setting, $setting);
    }
    var contextPath = dorado.Setting["common.contextPath"];
    if (contextPath) {
        if (contextPath.charAt(contextPath.length - 1) != "/") {
            contextPath += "/";
        }
    } else {
        contextPath = "/";
    }
    dorado.Setting["common.contextPath"] = contextPath;
    window.$setting = dorado.Setting;
})();
dorado.AbstractException = $class({$className:"dorado.AbstractException", constructor:function () {
    dorado.Exception.EXCEPTION_STACK.push(this);
    if (dorado.Browser.msie || dorado.Browser.mozilla) {
        window.onerror = function (message, url, line) {
            var result = false;
            if (dorado.Exception.EXCEPTION_STACK.length > 0) {
                var e;
                while (e = dorado.Exception.EXCEPTION_STACK.peek()) {
                    dorado.Exception.processException(e);
                }
                result = true;
            }
            window.onerror = null;
            return result;
        };
    }
    $setTimeout(this, function () {
        if (dorado.Exception.EXCEPTION_STACK.indexOf(this) >= 0) {
            dorado.Exception.processException(this);
        }
    }, 50);
}});
dorado.Exception = $extend(dorado.AbstractException, {$className:"dorado.Exception", constructor:function (message) {
    this.message = message || this.$className;
    if ($setting["common.debugEnabled"]) {
        this._buildStackTrace();
    }
    $invokeSuper.call(this, arguments);
}, _buildStackTrace:function () {
    var stack = [];
    var funcCaller = dorado.Exception.caller, callers = [];
    while (funcCaller && callers.indexOf(funcCaller) < 0) {
        callers.push(funcCaller);
        stack.push(dorado.getFunctionDescription(funcCaller));
        funcCaller = funcCaller.caller;
    }
    this.stack = stack;
    if (dorado.Browser.mozilla || dorado.Browser.chrome) {
        var stack = new Error().stack;
        if (stack) {
            stack = stack.split("\n");
            this.systemStack = stack.slice(2, stack.length - 1);
        }
    }
}, formatStack:function (stack) {
    return dorado.Exception.formatStack(stack);
}, toString:function () {
    return this.message;
}});
dorado.Exception.formatStack = function (stack) {
    var msg = "";
    if (stack) {
        if (typeof stack == "string") {
            msg = stack;
        } else {
            for (var i = 0; i < stack.length; i++) {
                if (i > 0) {
                    msg += "\n";
                }
                var trace = jQuery.trim(stack[i]);
                if (trace.indexOf("at ") != 0) {
                    trace = "at " + trace;
                }
                msg += " > " + trace;
                if (i > 255) {
                    msg += "\n > ... ... ...";
                    break;
                }
            }
        }
    }
    return msg;
};
dorado.AbortException = $extend(dorado.Exception, {$className:"dorado.AbortException"});
dorado.RunnableException = $extend(dorado.AbstractException, {$className:"dorado.RunnableException", constructor:function (script) {
    this.script = script;
    $invokeSuper.call(this, arguments);
}, toString:function () {
    return this.script;
}});
dorado.ResourceException = $extend(dorado.Exception, {$className:"dorado.ResourceException", constructor:function () {
    $invokeSuper.call(this, [$resource.apply(this, arguments)]);
}});
dorado.RemoteException = $extend(dorado.Exception, {$className:"dorado.RemoteException", constructor:function (message, exceptionType, remoteStack) {
    $invokeSuper.call(this, [message]);
    this.exceptionType = exceptionType;
    this.remoteStack = remoteStack;
}});
dorado.Exception.EXCEPTION_STACK = [];
dorado.Exception.IGNORE_ALL_EXCEPTIONS = false;
dorado.Exception.getExceptionMessage = function (e) {
    if (!e || e instanceof dorado.AbortException) {
        return null;
    }
    var msg;
    if (e instanceof dorado.Exception) {
        msg = e.message;
    } else {
        if (e instanceof Error) {
            msg = e.message;
        } else {
            msg = e;
        }
    }
    return msg;
};
dorado.Exception.processException = function (e) {
    if (dorado.Exception.IGNORE_ALL_EXCEPTIONS || dorado.windowClosed) {
        return;
    }
    dorado.Exception.removeException(e);
    if (!e || e instanceof dorado.AbortException) {
        return;
    }
    if (e instanceof dorado.RunnableException) {
        eval(e.script).call(window, e);
    } else {
        var delay = e._processDelay || 0;
        setTimeout(function () {
            if (dorado.windowClosed) {
                return;
            }
            var msg = dorado.Exception.getExceptionMessage(e);
            if ($setting["common.showExceptionStackTrace"]) {
                if (e instanceof dorado.Exception) {
                    if (e.stack) {
                        msg += "\n\nDorado Stack:\n" + dorado.Exception.formatStack(e.stack);
                    }
                    if (e.remoteStack) {
                        msg += "\n\nRemote Stack:\n" + dorado.Exception.formatStack(e.remoteStack);
                    }
                    if (e.systemStack) {
                        msg += "\n\nSystem Stack:\n" + dorado.Exception.formatStack(e.systemStack);
                    }
                } else {
                    if (e instanceof Error) {
                        if (e.stack) {
                            msg += "\n\nSystem Stack:\n" + dorado.Exception.formatStack(e.stack);
                        }
                    }
                }
            }
            if (window.console) {
                console.log(msg);
            }
            if (!dorado.Exception.alertException || !document.body) {
                dorado.Exception.removeException(e);
                alert(dorado.Exception.getExceptionMessage(e));
            } else {
                try {
                    dorado.Exception.alertException(e);
                }
                catch (e2) {
                    dorado.Exception.removeException(e2);
                    alert(dorado.Exception.getExceptionMessage(e));
                }
            }
        }, delay);
    }
};
dorado.Exception.removeException = function (e) {
    dorado.Exception.EXCEPTION_STACK.remove(e);
};
(function () {
    dorado.AttributeException = $extend(dorado.ResourceException, {$className:"dorado.AttributeException"});
    dorado.AttributeSupport = $class({$className:"dorado.AttributeSupport", ATTRIBUTES:{tags:{setter:function (tags) {
        if (typeof tags == "string") {
            tags = tags.split(",");
        }
        if (this._tags) {
            dorado.TagManager.unregister(this);
        }
        this._tags = tags;
        if (tags) {
            dorado.TagManager.register(this);
        }
    }}}, EVENTS:{onAttributeChange:{}}, constructor:function () {
        var defs = this.ATTRIBUTES;
        for (var p in defs) {
            var def = defs[p];
            if (def && def.defaultValue != undefined && this["_" + p] == undefined) {
                var dv = def.defaultValue;
                this["_" + p] = (typeof dv == "function" && !def.dontEvalDefaultValue) ? dv() : dv;
            }
        }
    }, getAttributeWatcher:function () {
        if (!this.attributeWatcher) {
            this.attributeWatcher = new dorado.AttributeWatcher();
        }
        return this.attributeWatcher;
    }, get:function (attr) {
        var i = attr.indexOf(".");
        if (i > 0) {
            var result = this.doGet(attr.substring(0, i));
            if (result) {
                var subAttr = attr.substring(i + 1);
                if (typeof result.get == "function") {
                    result = result.get(subAttr);
                } else {
                    var as = subAttr.split(".");
                    for (var i = 0; i < as.length; i++) {
                        var a = as[i];
                        result = (typeof result.get == "function") ? result.get(a) : result[a];
                        if (!result) {
                            break;
                        }
                    }
                }
            }
            return result;
        } else {
            return this.doGet(attr);
        }
    }, doGet:function (attr) {
        var def = this.ATTRIBUTES[attr] || (this.PRIVATE_ATTRIBUTES && this.PRIVATE_ATTRIBUTES[attr]);
        if (def) {
            if (def.writeOnly) {
                throw new dorado.AttributeException("dorado.core.AttributeWriteOnly", attr);
            }
            var result;
            if (def.getter) {
                result = def.getter.call(this, attr);
            } else {
                if (def.path) {
                    var sections = def.path.split("."), owner = this;
                    for (var i = 0; i < sections.length; i++) {
                        var section = sections[i];
                        if (section.charAt(0) != "_" && typeof owner.get == "function") {
                            owner = owner.get(section);
                        } else {
                            owner = owner[section];
                        }
                        if (owner == null || i == sections.length - 1) {
                            result = owner;
                            break;
                        }
                    }
                } else {
                    result = this["_" + attr];
                }
            }
            return result;
        } else {
            throw new dorado.AttributeException("dorado.core.UnknownAttribute", attr);
        }
    }, set:function (attr, value, options) {
        var skipUnknownAttribute, tryNextOnError, preventOverwriting, lockWritingTimes;
        if (attr && typeof attr == "object") {
            options = value;
        }
        if (options && typeof options == "object") {
            skipUnknownAttribute = options.skipUnknownAttribute;
            tryNextOnError = options.tryNextOnError;
            preventOverwriting = options.preventOverwriting;
            lockWritingTimes = options.lockWritingTimes;
        }
        if (attr.constructor != String) {
            var attrInfos = [];
            for (var p in attr) {
                if (attr.hasOwnProperty(p)) {
                    var v = attr[p], attrInfo = {attr:p, value:v};
                    if (p == "listener" || typeof v == "function") {
                        attrInfos.insert(attrInfo);
                    } else {
                        if (p == "DEFINITION") {
                            if (v) {
                                if (v.ATTRIBUTES) {
                                    if (!this.PRIVATE_ATTRIBUTES) {
                                        this.PRIVATE_ATTRIBUTES = {};
                                    }
                                    for (var defName in v.ATTRIBUTES) {
                                        if (v.ATTRIBUTES.hasOwnProperty(defName)) {
                                            var def = v.ATTRIBUTES[defName];
                                            overrideDefinition(this.PRIVATE_ATTRIBUTES, def, defName);
                                            if (def && def.defaultValue != undefined && this["_" + p] == undefined) {
                                                var dv = def.defaultValue;
                                                this["_" + p] = (typeof dv == "function" && !def.dontEvalDefaultValue) ? dv() : dv;
                                            }
                                        }
                                    }
                                }
                                if (v.EVENTS) {
                                    if (!this.PRIVATE_EVENTS) {
                                        this.PRIVATE_EVENTS = {};
                                    }
                                    for (var defName in v.EVENTS) {
                                        if (v.EVENTS.hasOwnProperty(defName)) {
                                            overrideDefinition(this.PRIVATE_EVENTS, v.EVENTS[defName], defName);
                                        }
                                    }
                                }
                            }
                        } else {
                            attrInfos.push(attrInfo);
                        }
                    }
                }
            }
            if (preventOverwriting) {
                watcher = this.getAttributeWatcher();
            }
            for (var i = 0; i < attrInfos.length; i++) {
                var attrInfo = attrInfos[i];
                if (preventOverwriting && watcher.getWritingTimes(attrInfo.attr)) {
                    continue;
                }
                try {
                    this.doSet(attrInfo.attr, attrInfo.value, skipUnknownAttribute, lockWritingTimes);
                }
                catch (e) {
                    if (!tryNextOnError) {
                        throw e;
                    } else {
                        if (e instanceof dorado.Exception) {
                            dorado.Exception.removeException(e);
                        }
                    }
                }
            }
        } else {
            if (preventOverwriting) {
                if (this.getAttributeWatcher().getWritingTimes(attr)) {
                    return;
                }
            }
            try {
                this.doSet(attr, value, skipUnknownAttribute, lockWritingTimes);
            }
            catch (e) {
                if (!tryNextOnError) {
                    throw e;
                } else {
                    if (e instanceof dorado.Exception) {
                        dorado.Exception.removeException(e);
                    }
                }
            }
        }
        return this;
    }, doSet:function (attr, value, skipUnknownAttribute, lockWritingTimes) {
        if (attr.charAt(0) == "$") {
            return;
        }
        var path, def;
        if (attr.indexOf(".") > 0) {
            path = attr;
        } else {
            def = this.ATTRIBUTES[attr] || (this.PRIVATE_ATTRIBUTES && this.PRIVATE_ATTRIBUTES[attr]);
            if (def) {
                path = def.path;
            }
        }
        if (path) {
            var sections = path.split("."), owner = this;
            for (var i = 0; i < sections.length - 1 && owner != null; i++) {
                var section = sections[i];
                if (section.charAt(0) !== "_" && typeof owner.get === "function") {
                    owner = owner.get(section);
                } else {
                    owner = owner[section];
                }
            }
            if (owner != null) {
                var section = sections[sections.length - 1];
                (section.charAt(0) == "_") ? (owner[section] = value) : owner.set(section, value);
            } else {
                this["_" + attr] = value;
            }
        } else {
            if (def) {
                if (def.readOnly) {
                    throw new dorado.AttributeException("dorado.core.AttributeReadOnly", attr);
                }
                var attributeWatcher = this.getAttributeWatcher();
                if (def.writeOnce && attributeWatcher.getWritingTimes(attr) > 0) {
                    throw new dorado.AttributeException("dorado.core.AttributeWriteOnce", attr);
                }
                if (!lockWritingTimes) {
                    attributeWatcher.incWritingTimes(attr);
                }
                if (def.setter) {
                    def.setter.call(this, value, attr);
                } else {
                    this["_" + attr] = value;
                }
                if (this.fireEvent && this.getListenerCount("onAttributeChange")) {
                    this.fireEvent("onAttributeChange", this, {attribute:attr, value:value});
                }
            } else {
                if (value instanceof Object && this.EVENTS && (this.EVENTS[attr] || (this.PRIVATE_EVENTS && this.PRIVATE_EVENTS[attr]))) {
                    if (typeof value === "function") {
                        this.addListener(attr, value);
                    } else {
                        if (value.listener) {
                            this.addListener(attr, value.listener, value.options);
                        }
                    }
                } else {
                    if (!skipUnknownAttribute) {
                        throw new dorado.AttributeException("dorado.core.UnknownAttribute", attr);
                    }
                }
            }
        }
    }, hasTag:function (tag) {
        if (this._tags) {
            return this._tags.indexOf(tag) >= 0;
        } else {
            return false;
        }
    }});
    dorado.AttributeWatcher = $class({$className:"dorado.AttributeWatcher", getWritingTimes:function (attr) {
        return this[attr] || 0;
    }, incWritingTimes:function (attr) {
        this[attr] = (this[attr] || 0) + 1;
    }, setWritingTimes:function (attr, n) {
        this[attr] = n;
    }});
    function overrideDefinition(targetDefs, def, name) {
        if (!def) {
            return;
        }
        var targetDef = targetDefs[name];
        if (targetDef) {
            dorado.Object.apply(targetDef, def);
        } else {
            targetDefs[name] = dorado.Object.apply({}, def);
        }
    }
})();
dorado.Callback = {};
window.$callback = dorado.Callback.invokeCallback = function (callback, success, arg, options) {
    function invoke(fn, args) {
        if (delay > 0) {
            setTimeout(function () {
                fn.apply(scope, args);
            }, delay);
        } else {
            fn.apply(scope, args);
        }
    }
    if (!callback) {
        return;
    }
    if (success == null) {
        success = true;
    }
    var scope, delay;
    if (options) {
        scope = options.scope;
        delay = options.delay;
    }
    if (typeof callback == "function") {
        if (!success) {
            return;
        }
        invoke(callback, [arg]);
    } else {
        scope = callback.scope || scope || window;
        delay = callback.delay || delay;
        if (typeof callback.callback == "function") {
            invoke(callback.callback, [success, arg]);
        }
        var name = (success) ? "success" : "failure";
        if (typeof callback[name] == "function") {
            invoke(callback.callback, [arg]);
        }
    }
};
dorado.Callback.simultaneousCallbacks = function (tasks, callback) {
    function getSimultaneousCallback(task) {
        var fn = function () {
            suspendedTasks.push({task:task, scope:this, args:arguments});
            if (taskReg[task.id]) {
                delete taskReg[task.id];
                taskNum--;
                if (taskNum == 0) {
                    jQuery.each(suspendedTasks, function (i, suspendedTask) {
                        suspendedTask.task.callback.apply(suspendedTask.scope, suspendedTask.args);
                    });
                    $callback(callback, true);
                }
            }
        };
        return fn;
    }
    var taskReg = {}, taskNum = tasks.length, suspendedTasks = [];
    if (taskNum > 0) {
        jQuery.each(tasks, function (i, task) {
            if (!task.id) {
                task.id = dorado.Core.newId();
            }
            var simCallback = getSimultaneousCallback(task);
            taskReg[task.id] = callback;
            task.run(simCallback);
        });
    } else {
        $callback(callback, true);
    }
};
dorado.EventSupport = $class({$className:"dorado.EventSupport", ATTRIBUTES:{listener:{setter:function (v) {
    if (!v) {
        return;
    }
    for (var p in v) {
        if (v.hasOwnProperty(p)) {
            var listener = v[p];
            if (listener) {
                if (listener instanceof Array) {
                    for (var i = 0; i < listener.length; i++) {
                        var l = listener[i];
                        if (typeof l == "function") {
                            this.bind(p, l);
                        } else {
                            if (typeof l.fn == "function") {
                                this.bind(p, l.fn, l.options);
                            }
                        }
                    }
                } else {
                    if (typeof listener == "function") {
                        this.bind(p, listener);
                    } else {
                        if (typeof listener.fn == "function") {
                            this.bind(p, listener.fn, listener.options);
                        }
                    }
                }
            }
        }
    }
}, writeOnly:true}}, EVENTS:{}, _disableListenersCounter:0, addListener:function (name, listener, options) {
    return this.bind(name, listener, options);
}, removeListener:function (name, listener) {
    return this.unbind(name, listener);
}, bind:function (name, listener, options) {
    var i = name.indexOf("."), alias;
    if (i > 0) {
        alias = name.substring(i + 1);
        name = name.substring(0, i);
    }
    var def = this.EVENTS[name] || (this.PRIVATE_EVENTS && this.PRIVATE_EVENTS[name]);
    if (!def) {
        throw new dorado.ResourceException("dorado.core.UnknownEvent", name);
    }
    var handler = dorado.Object.apply({}, options);
    handler.alias = alias;
    handler.listener = listener;
    handler.options = options;
    if (!this._events) {
        this._events = {};
    }
    var handlers = this._events[name];
    if (handlers) {
        if (def.disallowMultiListeners && handlers.length) {
            new dorado.ResourceException("dorado.core.MultiListenersNotSupport", name);
        }
        handlers.push(handler);
    } else {
        this._events[name] = [handler];
    }
    return this;
}, unbind:function (name, listener) {
    var i = name.indexOf("."), alias;
    if (i > 0) {
        alias = name.substring(i + 1);
        name = name.substring(0, i);
    }
    var def = this.EVENTS[name] || (this.PRIVATE_EVENTS && this.PRIVATE_EVENTS[name]);
    if (!def) {
        throw new dorado.ResourceException("dorado.core.UnknownEvent", name);
    }
    if (!this._events) {
        return;
    }
    if (listener) {
        var handlers = this._events[name];
        if (handlers) {
            for (var i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i].listener == listener && (!alias || handlers[i].alias == alias)) {
                    handlers.removeAt(i);
                }
            }
        }
    } else {
        if (alias) {
            var handlers = this._events[name];
            if (handlers) {
                for (var i = handlers.length - 1; i >= 0; i--) {
                    if (handlers[i].alias == alias) {
                        handlers.removeAt(i);
                    }
                }
            }
        } else {
            delete this._events[name];
        }
    }
}, clearListeners:function (name) {
    if (!this._events) {
        return;
    }
    this._events[name] = null;
}, disableListeners:function () {
    this._disableListenersCounter++;
}, enableListeners:function () {
    if (this._disableListenersCounter > 0) {
        this._disableListenersCounter--;
    }
}, fireEvent:function (name) {
    var def = this.EVENTS[name] || (this.PRIVATE_EVENTS && this.PRIVATE_EVENTS[name]);
    if (!def) {
        throw new dorado.ResourceException("dorado.core.UnknownEvent", name);
    }
    var handlers = (this._events) ? this._events[name] : null;
    if ((!handlers || !handlers.length) && !def.interceptor) {
        return;
    }
    var self = this;
    var superFire = function () {
        if (handlers) {
            for (var i = 0; i < handlers.length; ) {
                var handler = handlers[i];
                if (handler.once) {
                    handlers.removeAt(i);
                } else {
                    i++;
                }
                if (self.notifyListener(handler, arguments) === false) {
                    return false;
                }
            }
        }
        return true;
    };
    try {
        var interceptor = (typeof def.interceptor == "function") ? def.interceptor : null;
        if (interceptor) {
            arguments[0] = superFire;
            return interceptor.apply(this, arguments);
        } else {
            if (handlers && this._disableListenersCounter == 0) {
                return superFire.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    }
    catch (e) {
        if (def.processException) {
            dorado.Exception.processException(e);
        } else {
            throw e;
        }
    }
    return true;
}, getListenerCount:function (name) {
    if (this._events) {
        var handlers = this._events[name];
        return (handlers) ? handlers.length : 0;
    } else {
        return 0;
    }
}, notifyListener:function (handler, args) {
    var listener = handler.listener;
    var scope = handler.scope;
    if (!scope && this.getListenerScope) {
        scope = this.getListenerScope();
    }
    scope = scope || this;
    if (handler.autowire !== false) {
        if (handler.signature === undefined) {
            var info = dorado.getFunctionInfo(handler.listener);
            if (!info.signature || info.signature == "self,arg") {
                handler.signature = null;
            } else {
                handler.signature = info.signature.split(",");
            }
        }
        if (handler.signature) {
            var customArgs = [];
            if (dorado.widget && dorado.widget.View && scope instanceof dorado.widget.View) {
                for (var i = 0; i < handler.signature.length; i++) {
                    var param = handler.signature[i];
                    if (param == "self") {
                        customArgs.push(args[0]);
                    } else {
                        if (param == "arg") {
                            customArgs.push(args[1]);
                        } else {
                            if (param == "view") {
                                customArgs.push(scope);
                            } else {
                                var object = scope.id(param);
                                if (object == null) {
                                    object = scope.getDataType(param);
                                }
                                if (!object) {
                                    if (i == 0) {
                                        object = args[0];
                                    } else {
                                        if (i == 1) {
                                            object = args[1];
                                        }
                                    }
                                }
                                customArgs.push(object);
                            }
                        }
                    }
                }
            } else {
                for (var i = 0; i < handler.signature.length; i++) {
                    var param = handler.signature[i];
                    if (param == "self") {
                        customArgs.push(args[0]);
                    } else {
                        if (param == "arg") {
                            customArgs.push(args[1]);
                        } else {
                            customArgs = null;
                            break;
                        }
                    }
                }
            }
            if (customArgs) {
                args = customArgs;
            }
        }
    }
    var delay = handler.delay;
    if (delay >= 0) {
        setTimeout(function () {
            listener.apply(scope, args);
        }, delay);
    } else {
        return listener.apply(scope, args);
    }
}});
dorado.util = {};
dorado.util.Resource = {strings:{}, append:function (namespace, items) {
    if (arguments.length == 1 && namespace && namespace.constructor != String) {
        items = namespace;
        namespace = null;
    }
    for (var p in items) {
        if (items.hasOwnProperty(p)) {
            if (namespace) {
                this.strings[namespace + "." + p] = items[p];
            } else {
                this.strings[p] = items[p];
            }
        }
    }
}, sprintf:function () {
    var num = arguments.length;
    var s = arguments[0];
    for (var i = 1; i < num; i++) {
        var pattern = "\\{" + (i - 1) + "\\}";
        var re = new RegExp(pattern, "g");
        s = s.replace(re, arguments[i]);
    }
    return s;
}, get:function (path) {
    var str = this.strings[path];
    if (arguments.length > 1 && str) {
        arguments[0] = str;
        return this.sprintf.apply(this, arguments);
    } else {
        return str;
    }
}};
window.$resource = function (path, args) {
    return dorado.util.Resource.get.apply(dorado.util.Resource, arguments);
};
(function () {
    Date.parseFunctions = {count:0};
    Date.parseRegexes = [];
    Date.formatFunctions = {count:0};
    Date.prototype.formatDate = function (format) {
        if (Date.formatFunctions[format] == null) {
            Date.createNewFormat(format);
        }
        var func = Date.formatFunctions[format];
        return this[func]();
    };
    Date.createNewFormat = function (format) {
        var funcName = "format" + Date.formatFunctions.count++;
        Date.formatFunctions[format] = funcName;
        var code = "Date.prototype." + funcName + " = function(){return ";
        var special = false;
        var ch = "";
        for (var i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else {
                if (special) {
                    special = false;
                    code += "'" + String.escape(ch) + "' + ";
                } else {
                    code += Date.getFormatCode(ch);
                }
            }
        }
        eval(code.substring(0, code.length - 3) + ";}");
    };
    Date.getFormatCode = function (character) {
        switch (character) {
          case "d":
            return "String.leftPad(this.getDate(), 2, '0') + ";
          case "D":
            return "getDayNames()[this.getDay()].substring(0, 3) + ";
          case "j":
            return "this.getDate() + ";
          case "l":
            return "getDayNames()[this.getDay()] + ";
          case "S":
            return "this.getSuffix() + ";
          case "w":
            return "this.getDay() + ";
          case "z":
            return "this.getDayOfYear() + ";
          case "W":
            return "this.getWeekOfYear() + ";
          case "F":
            return "getMonthNames()[this.getMonth()] + ";
          case "m":
            return "String.leftPad(this.getMonth() + 1, 2, '0') + ";
          case "M":
            return "getMonthNames()[this.getMonth()].substring(0, 3) + ";
          case "n":
            return "(this.getMonth() + 1) + ";
          case "t":
            return "this.getDaysInMonth() + ";
          case "L":
            return "(this.isLeapYear() ? 1 : 0) + ";
          case "Y":
            return "this.getFullYear() + ";
          case "y":
            return "('' + this.getFullYear()).substring(2, 4) + ";
          case "a":
            return "(this.getHours() < 12 ? 'am' : 'pm') + ";
          case "A":
            return "(this.getHours() < 12 ? 'AM' : 'PM') + ";
          case "g":
            return "((this.getHours() %12) ? this.getHours() % 12 : 12) + ";
          case "G":
            return "this.getHours() + ";
          case "h":
            return "String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";
          case "H":
            return "String.leftPad(this.getHours(), 2, '0') + ";
          case "i":
            return "String.leftPad(this.getMinutes(), 2, '0') + ";
          case "s":
            return "String.leftPad(this.getSeconds(), 2, '0') + ";
          case "O":
            return "this.getGMTOffset() + ";
          case "T":
            return "this.getTimezone() + ";
          case "Z":
            return "(this.getTimezoneOffset() * -60) + ";
          default:
            return "'" + String.escape(character) + "' + ";
        }
    };
    Date.parseDate = function (input, format) {
        if (Date.parseFunctions[format] == null) {
            Date.createParser(format);
        }
        var func = Date.parseFunctions[format];
        return Date[func](input);
    };
    Date.createParser = function (format) {
        var funcName = "parse" + Date.parseFunctions.count++;
        var regexNum = Date.parseRegexes.length;
        var currentGroup = 1;
        Date.parseFunctions[format] = funcName;
        var code = "Date." + funcName + " = function(input){\n" + "var y = -1, m = -1, d = -1, h = -1, i = -1, s = -1;\n" + "var d = new Date();\n" + "y = d.getFullYear();\n" + "m = d.getMonth();\n" + "d = d.getDate();\n" + "var results = input.match(Date.parseRegexes[" + regexNum + "]);\n" + "if (results && results.length > 0) {";
        var regex = "";
        var special = false;
        var ch = "";
        for (var i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else {
                if (special) {
                    special = false;
                    regex += String.escape(ch);
                } else {
                    obj = Date.formatCodeToRegex(ch, currentGroup);
                    currentGroup += obj.g;
                    regex += obj.s;
                    if (obj.g && obj.c) {
                        code += obj.c;
                    }
                }
            }
        }
        code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n" + "{return new Date(y, m, d, h, i, s);}\n" + "else if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n" + "{return new Date(y, m, d, h, i);}\n" + "else if (y > 0 && m >= 0 && d > 0 && h >= 0)\n" + "{return new Date(y, m, d, h);}\n" + "else if (y > 0 && m >= 0 && d > 0)\n" + "{return new Date(y, m, d);}\n" + "else if (y > 0 && m >= 0)\n" + "{return new Date(y, m);}\n" + "else if (y > 0)\n" + "{return new Date(y);}\n" + "}return null;}";
        Date.parseRegexes[regexNum] = new RegExp("^" + regex + "$");
        eval(code);
    };
    Date.formatCodeToRegex = function (character, currentGroup) {
        switch (character) {
          case "D":
            return {g:0, c:null, s:"(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"};
          case "j":
          case "d":
            return {g:1, c:"d = parseInt(results[" + currentGroup + "], 10);\n", s:"(\\d{1,2})"};
          case "l":
            return {g:0, c:null, s:"(?:" + getDayNames().join("|") + ")"};
          case "S":
            return {g:0, c:null, s:"(?:st|nd|rd|th)"};
          case "w":
            return {g:0, c:null, s:"\\d"};
          case "z":
            return {g:0, c:null, s:"(?:\\d{1,3})"};
          case "W":
            return {g:0, c:null, s:"(?:\\d{2})"};
          case "F":
            return {g:1, c:"m = parseInt(Date.monthNumbers[results[" + currentGroup + "].substring(0, 3)], 10);\n", s:"(" + getMonthNames().join("|") + ")"};
          case "M":
            return {g:1, c:"m = parseInt(Date.monthNumbers[results[" + currentGroup + "]], 10);\n", s:"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"};
          case "n":
          case "m":
            return {g:1, c:"m = parseInt(results[" + currentGroup + "], 10) - 1;\n", s:"(\\d{1,2})"};
          case "t":
            return {g:0, c:null, s:"\\d{1,2}"};
          case "L":
            return {g:0, c:null, s:"(?:1|0)"};
          case "Y":
            return {g:1, c:"y = parseInt(results[" + currentGroup + "], 10);\n", s:"(\\d{4})"};
          case "y":
            return {g:1, c:"var ty = parseInt(results[" + currentGroup + "], 10);\n" + "y = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n", s:"(\\d{1,2})"};
          case "a":
            return {g:1, c:"if (results[" + currentGroup + "] == 'am') {\n" + "if (h == 12) { h = 0; }\n" + "} else { if (h < 12) { h += 12; }}", s:"(am|pm)"};
          case "A":
            return {g:1, c:"if (results[" + currentGroup + "] == 'AM') {\n" + "if (h == 12) { h = 0; }\n" + "} else { if (h < 12) { h += 12; }}", s:"(AM|PM)"};
          case "g":
          case "G":
          case "h":
          case "H":
            return {g:1, c:"h = parseInt(results[" + currentGroup + "], 10);\n", s:"(\\d{1,2})"};
          case "i":
            return {g:1, c:"i = parseInt(results[" + currentGroup + "], 10);\n", s:"(\\d{2})"};
          case "s":
            return {g:1, c:"s = parseInt(results[" + currentGroup + "], 10);\n", s:"(\\d{2})"};
          case "O":
            return {g:0, c:null, s:"[+-]\\d{4}"};
          case "T":
            return {g:0, c:null, s:"[A-Z]{3}"};
          case "Z":
            return {g:0, c:null, s:"[+-]\\d{1,5}"};
          default:
            return {g:0, c:null, s:String.escape(character)};
        }
    };
    Date.prototype.getTimezone = function () {
        return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*? [0-9]{4}.* \(([A-Z]{3})\)$/g, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3");
    };
    Date.prototype.getGMTOffset = function () {
        return (this.getTimezoneOffset() > 0 ? "-" : "+") + String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset() / 60)), 2, "0") + String.leftPad(this.getTimezoneOffset() % 60, 2, "0");
    };
    Date.prototype.getDayOfYear = function () {
        var num = 0;
        Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
        for (var i = 0; i < this.getMonth(); ++i) {
            num += Date.daysInMonth[i];
        }
        return num + this.getDate() - 1;
    };
    Date.prototype.getWeekOfYear = function () {
        var now = this.getDayOfYear() + (4 - this.getDay());
        var jan1 = new Date(this.getFullYear(), 0, 1);
        var then = (7 - jan1.getDay() + 4);
        return String.leftPad(((now - then) / 7) + 1, 2, "0");
    };
    Date.prototype.isLeapYear = function () {
        var year = this.getFullYear();
        return ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    };
    Date.prototype.getFirstDayOfMonth = function () {
        var day = (this.getDay() - (this.getDate() - 1)) % 7;
        return (day < 0) ? (day + 7) : day;
    };
    Date.prototype.getLastDayOfMonth = function () {
        var day = (this.getDay() + (Date.daysInMonth[this.getMonth()] - this.getDate())) % 7;
        return (day < 0) ? (day + 7) : day;
    };
    Date.prototype.getDaysInMonth = function () {
        Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
        return Date.daysInMonth[this.getMonth()];
    };
    Date.prototype.getSuffix = function () {
        switch (this.getDate()) {
          case 1:
          case 21:
          case 31:
            return "st";
          case 2:
          case 22:
            return "nd";
          case 3:
          case 23:
            return "rd";
          default:
            return "th";
        }
    };
    String.escape = function (string) {
        return string.replace(/('|\\)/g, "\\$1");
    };
    String.leftPad = function (val, size, ch) {
        var result = new String(val);
        if (ch == null) {
            ch = " ";
        }
        while (result.length < size) {
            result = ch + result;
        }
        return result;
    };
    Date.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    Date.y2kYear = 50;
    Date.monthNumbers = {Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11};
    Date.patterns = {ISO8601LongPattern:"Y-m-d H:i:s", ISO8601ShortPattern:"Y-m-d", ShortDatePattern:"n/j/Y", LongDatePattern:"l, F d, Y", FullDateTimePattern:"l, F d, Y g:i:s A", MonthDayPattern:"F d", ShortTimePattern:"g:i A", LongTimePattern:"g:i:s A", SortableDateTimePattern:"Y-m-d\\TH:i:s", UniversalSortableDateTimePattern:"Y-m-d H:i:sO", YearMonthPattern:"F, Y"};
    function getMonthNames() {
        if (!Date.monthNames) {
            Date.monthNames = ($resource("dorado.core.AllMonths") || "January,February,March,April,May,June,July,August,September,October,November,December").split(",");
        }
        return Date.monthNames;
    }
    function getDayNames() {
        if (!Date.dayNames) {
            Date.dayNames = ($resource("dorado.core.AllWeeks") || "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday").split(",");
        }
        return Date.dayNames;
    }
})();
dorado.util.Common = {URL_VARS:{}, concatURL:function () {
    var url = "";
    for (var i = 0; i < arguments.length; i++) {
        var section = arguments[i];
        if (typeof section == "string" && section) {
            section = jQuery.trim(section);
            var e = (url.charAt(url.length - 1) == "/");
            var s = (section.charAt(0) == "/");
            if (s == e) {
                if (s) {
                    url += section.substring(1);
                } else {
                    url += "/" + section;
                }
            } else {
                url += section;
            }
        }
    }
    return url;
}, translateURL:function (url) {
    if (!url) {
        return url;
    }
    var reg = /^.+\>/, m = url.match(reg);
    if (m) {
        m = m[0];
        var varName = m.substring(0, m.length - 1);
        if (varName.charAt(0) == ">") {
            varName = varName.substring(1);
        }
        var s1 = this.URL_VARS[varName] || "", s2 = url.substring(m.length);
        url = this.concatURL(s1, s2);
    } else {
        if (url.charAt(0) == ">") {
            url = this.concatURL($setting["common.contextPath"], url.substring(1));
        }
    }
    return url;
}, parseExponential:function (n) {
    n = n + "";
    var cv = n.split("e-");
    var leadingZero = "";
    var fl = parseInt(cv[1]);
    for (var i = 0; fl > 1 && i < fl - 1; i++) {
        leadingZero += "0";
    }
    var es = cv[0];
    var pi = es.indexOf(".");
    if (pi > 0) {
        es = es.substring(0, pi) + es.substring(pi + 1);
    }
    n = "0." + leadingZero + es;
    return n;
}, formatFloat:function (n, format) {
    function formatInt(n, format, dec) {
        if (!format) {
            return (parseInt(n.substring(0, nfs.length), 10) + 1) + "";
        }
        var c, f, r = "", j = 0, prefix = "";
        var fv = format.split("");
        for (var i = 0; i < fv.length; i++) {
            f = fv[i];
            if (f == "#" || f == "0" || f == "`") {
                fv = fv.slice(i);
                break;
            }
            prefix += f;
        }
        fv = fv.reverse();
        var cv = n.split("").reverse();
        for (var i = 0; i < fv.length; i++) {
            f = fv[i];
            if (f == "#") {
                if (j < cv.length) {
                    if (n == "0") {
                        j = cv.length;
                    } else {
                        if (n == "-0") {
                            if (dec) {
                                r += "-";
                            }
                            j = cv.length;
                        } else {
                            r += cv[j++];
                        }
                    }
                }
            } else {
                if (f == "0") {
                    if (j < cv.length) {
                        r += cv[j++];
                    } else {
                        r += f;
                    }
                } else {
                    if (f == "`") {
                        var commaCount = 3;
                        while (j < cv.length) {
                            var c = cv[j++];
                            if (commaCount == 3 && c != "-") {
                                r += ",";
                                commaCount = 0;
                            }
                            r += c;
                            commaCount++;
                        }
                    } else {
                        r += f;
                    }
                }
            }
        }
        while (j < cv.length) {
            r += cv[j++];
        }
        return prefix + r.split("").reverse().join("");
    }
    function formatDecimal(n, format) {
        var nfs = (format) ? format.match(/[\#0]/g) : null;
        if (nfs === null) {
            return [format, (n && n.charAt(0) > "4")];
        } else {
            if (n && n.length > nfs.length && n.charAt(nfs.length) > "4") {
                var n = n.substring(0, nfs.length);
                n = (parseInt(n, 10) + 1) + "";
                var overflow = n.length > nfs.length;
                if (overflow) {
                    n = n.substring(n.length - nfs.length);
                } else {
                    var leadingZero = "";
                    for (var i = n.length; i < nfs.length; i++) {
                        leadingZero += "0";
                    }
                    n = leadingZero + n;
                }
            }
        }
        var f, r = "", j = 0;
        for (var i = 0; i < format.length; i++) {
            f = format.charAt(i);
            if (f == "#" || f == "0") {
                if (n && j < n.length) {
                    r += n.charAt(j++);
                } else {
                    if (f == "0") {
                        r += f;
                    }
                }
            } else {
                r += f;
            }
        }
        return [r, overflow];
    }
    if (n == null || isNaN(n)) {
        return "";
    }
    n = n + "";
    if (n.indexOf("e-") > 0) {
        n = dorado.util.Common.parseExponential(n);
    }
    if (!format) {
        return n;
    }
    var n1, n2, f1, f2, i;
    i = n.indexOf(".");
    if (i > 0) {
        n1 = n.substring(0, i);
        n2 = n.substring(i + 1);
    } else {
        n1 = n;
    }
    i = format.indexOf(".");
    if (i > 0) {
        f1 = format.substring(0, i);
        f2 = format.substring(i + 1);
    } else {
        f1 = format;
    }
    f1 = f1.replace(/\#,/g, "`");
    var r = formatDecimal(n2, f2);
    var dec = r[0];
    if (r[1]) {
        n1 = (parseInt(n1, 10) + ((n1.charAt(0) == "-") ? -1 : 1)) + "";
    }
    return formatInt(n1, f1, dec) + ((dec) ? ("." + dec) : "");
}, parseFloat:function (s) {
    if (s === 0) {
        return 0;
    }
    if (!s) {
        return Number.NaN;
    }
    s = s + "";
    if (s.indexOf("e-") > 0) {
        s = dorado.util.Common.parseExponential(s);
    }
    var ns = s.match(/[-\d\.]/g);
    if (!ns) {
        return Number.NaN;
    }
    var n = parseFloat(ns.join(""));
    if (n > 9007199254740991) {
        throw new dorado.ResourceException("dorado.data.ErrorNumberOutOfRangeG");
    } else {
        if (n < -9007199254740991) {
            throw new dorado.ResourceException("dorado.data.ErrorNumberOutOfRangeL");
        }
    }
    return n;
}, _classTypeCache:{}, getClassType:function (type, silence) {
    var classType = null;
    try {
        classType = this._classTypeCache[type];
        if (classType === undefined) {
            var path = type.split("."), obj = window, i = 0, len = path.length;
            for (; i < len && obj; i++) {
                obj = obj[path[i]];
            }
            if (i == len) {
                classType = obj;
            }
            this._classTypeCache[type] = (classType || null);
        }
    }
    catch (e) {
        if (!silence) {
            throw new dorado.ResourceException("dorado.core.UnknownType", type);
        }
    }
    return classType;
}, singletonInstance:{}, getSingletonInstance:function (factory) {
    var typeName;
    if (typeof factory == "string") {
        typeName = factory;
    } else {
        typeName = factory._singletonId;
        if (!typeName) {
            factory._singletonId = typeName = dorado.Core.newId();
        }
    }
    var instance = this.singletonInstance[typeName];
    if (!instance) {
        if (typeof factory == "string") {
            var classType = dorado.util.Common.getClassType(typeName);
            instance = new classType();
        } else {
            instance = new factory();
        }
        this.singletonInstance[typeName] = instance;
    }
    return instance;
}};
window.$url = function (url) {
    return dorado.util.Common.translateURL(url);
};
dorado.util.Common.URL_VARS.skin = $url($setting["widget.skinRoot"] + ($setting["widget.skin"] ? ($setting["widget.skin"] + "/") : ""));
window.$singleton = function (factory) {
    return dorado.util.Common.getSingletonInstance(factory);
};
(function () {
    dorado.util.Iterator = $class({$className:"dorado.util.Iterator", first:dorado._NULL_FUNCTION, last:dorado._NULL_FUNCTION, hasPrevious:dorado._NULL_FUNCTION, hasNext:dorado._NULL_FUNCTION, previous:dorado._NULL_FUNCTION, next:dorado._NULL_FUNCTION, current:dorado._NULL_FUNCTION, createBookmark:dorado._UNSUPPORTED_FUNCTION(), restoreBookmark:dorado._UNSUPPORTED_FUNCTION()});
    dorado.util.ArrayIterator = $extend(dorado.util.Iterator, {$className:"dorado.util.ArrayIterator", constructor:function (v, nextIndex) {
        this._v = v;
        this._current = (nextIndex || 0) - 1;
    }, first:function () {
        this._current = -1;
    }, last:function () {
        this._current = this._v.length;
    }, hasPrevious:function () {
        return this._current > 0;
    }, hasNext:function () {
        return this._current < (this._v.length - 1);
    }, previous:function () {
        return (this._current < 0) ? null : this._v[--this._current];
    }, next:function () {
        return (this._current >= this._v.length) ? null : this._v[++this._current];
    }, current:function () {
        return this._v[this._current];
    }, setNextIndex:function (nextIndex) {
        this._current = nextIndex - 1;
    }, createBookmark:function () {
        return this._current;
    }, restoreBookmark:function (bookmark) {
        this._current = bookmark;
    }});
})();
dorado.util.KeyedArray = $class({$className:"dorado.util.KeyedArray", constructor:function (getKeyFunction) {
    this.items = [];
    this._keyMap = {};
    this._getKeyFunction = getKeyFunction;
}, size:0, _getKey:function (data) {
    var key = this._getKeyFunction ? this._getKeyFunction(data) : null;
    return key + "";
}, insert:function (data, insertMode, refData) {
    var ctx;
    if (this.beforeInsert) {
        ctx = this.beforeInsert(data);
    }
    if (!isFinite(insertMode) && insertMode) {
        switch (insertMode) {
          case "begin":
            insertMode = 0;
            break;
          case "before":
            insertMode = this.items.indexOf(refData);
            if (insertMode < 0) {
                insertMode = 0;
            }
            break;
          case "after":
            insertMode = this.items.indexOf(refData) + 1;
            if (insertMode >= this.items.length) {
                insertMode = null;
            }
            break;
          default:
            insertMode = null;
            break;
        }
    }
    if (insertMode != null && isFinite(insertMode) && insertMode >= 0) {
        this.items.insert(data, insertMode);
    } else {
        this.items.push(data);
    }
    this.size++;
    var key = this._getKey(data);
    if (key) {
        this._keyMap[key] = data;
    }
    if (this.afterInsert) {
        this.afterInsert(data, ctx);
    }
}, append:function (data) {
    this.insert(data);
}, remove:function (data) {
    var ctx;
    if (this.beforeRemove) {
        ctx = this.beforeRemove(data);
    }
    var i = this.items.remove(data);
    if (i >= 0) {
        this.size--;
        var key = this._getKey(data);
        if (key) {
            delete this._keyMap[key];
        }
    }
    if (this.afterRemove) {
        this.afterRemove(data, ctx);
    }
    return i;
}, removeAt:function (i) {
    if (i >= 0 && i < this.size) {
        var data = this.items[i], ctx;
        if (data) {
            if (this.beforeRemove) {
                ctx = this.beforeRemove(data);
            }
            var key = this._getKey(data);
            if (key) {
                delete this._keyMap[key];
            }
        }
        this.items.removeAt(i);
        this.size--;
        if (data && this.afterRemove) {
            this.afterRemove(data, ctx);
        }
        return data;
    }
    return null;
}, indexOf:function (data) {
    return this.items.indexOf(data);
}, replace:function (oldData, newData) {
    var i = this.indexOf(oldData);
    if (i >= 0) {
        this.removeAt(i);
        this.insert(newData, i);
    }
    return i;
}, get:function (k) {
    return (typeof k == "number") ? this.items[k] : this._keyMap[k];
}, clear:function () {
    for (var i = this.size - 1; i >= 0; i--) {
        this.removeAt(i);
    }
}, iterator:function (from) {
    var start = this.items.indexOf(from);
    if (start < 0) {
        start = 0;
    }
    return new dorado.util.ArrayIterator(this.items, start);
}, each:function (fn, scope) {
    var array = this.items;
    for (var i = 0; i < array.length; i++) {
        if (fn.call(scope || array[i], array[i], i) === false) {
            return i;
        }
    }
}, toArray:function () {
    return this.items.slice(0);
}, clone:function () {
    var cloned = dorado.Core.clone(this);
    cloned.items = dorado.Core.clone(this.items);
    cloned._keyMap = dorado.Core.clone(this._keyMap);
    return cloned;
}, deepClone:function () {
    var cloned = new dorado.util.KeyedArray(this._getKeyFunction);
    for (var i = 0; i < this.items.length; i++) {
        cloned.append(dorado.Core.clone(this.items[i]));
    }
    return cloned;
}});
dorado.util.KeyedList = $class({$className:"dorado.util.KeyedList", constructor:function (getKeyFunction) {
    this._keyMap = {};
    this._getKeyFunction = getKeyFunction;
}, size:0, _getKey:function (data) {
    return this._getKeyFunction ? this._getKeyFunction(data) : null;
}, _registerEntry:function (entry) {
    var key = this._getKey(entry.data);
    if (key != null) {
        this._keyMap[key] = entry;
    }
}, _unregisterEntry:function (entry) {
    var key = this._getKey(entry.data);
    if (key != null) {
        delete this._keyMap[key];
    }
}, _unregisterAllEntries:function () {
    this._keyMap = {};
}, insertEntry:function (entry, insertMode, refEntry) {
    var e1, e2;
    switch (insertMode) {
      case "begin":
        e1 = null;
        e2 = this.first;
        break;
      case "before":
        e1 = (refEntry) ? refEntry.previous : null;
        e2 = refEntry;
        break;
      case "after":
        e1 = refEntry;
        e2 = (refEntry) ? refEntry.next : null;
        break;
      default:
        e1 = this.last;
        e2 = null;
        break;
    }
    entry.previous = e1;
    entry.next = e2;
    if (e1) {
        e1.next = entry;
    } else {
        this.first = entry;
    }
    if (e2) {
        e2.previous = entry;
    } else {
        this.last = entry;
    }
    this._registerEntry(entry);
    this.size++;
}, removeEntry:function (entry) {
    var e1, e2;
    e1 = entry.previous;
    e2 = entry.next;
    if (e1) {
        e1.next = e2;
    } else {
        this.first = e2;
    }
    if (e2) {
        e2.previous = e1;
    } else {
        this.last = e1;
    }
    this._unregisterEntry(entry);
    this.size--;
}, findEntry:function (data) {
    if (data == null) {
        return null;
    }
    var key = this._getKey(data);
    if (key != null) {
        return this._keyMap[key];
    } else {
        var entry = this.first;
        while (entry) {
            if (entry.data === data) {
                return entry;
            }
            entry = entry.next;
        }
    }
    return null;
}, insert:function (data, insertMode, refData) {
    var refEntry = null;
    if (refData != null) {
        refEntry = this.findEntry(refData);
    }
    var entry = {data:data};
    this.insertEntry(entry, insertMode, refEntry);
}, append:function (data) {
    this.insert(data);
}, remove:function (data) {
    var entry = this.findEntry(data);
    if (entry != null) {
        this.removeEntry(entry);
    }
    return (entry != null);
}, removeKey:function (key) {
    var entry = this._keyMap[key];
    if (entry) {
        this.removeEntry(entry);
        return entry.data;
    }
    return null;
}, get:function (key) {
    var entry = this._keyMap[key];
    if (entry) {
        return entry.data;
    }
    return null;
}, clear:function () {
    var entry = this.first;
    while (entry) {
        if (entry.data) {
            delete entry.data;
        }
        entry = entry.next;
    }
    this._unregisterAllEntries();
    this.first = null;
    this.last = null;
    this.size = 0;
}, iterator:function (from) {
    return new dorado.util.KeyedListIterator(this, from);
}, each:function (fn, scope) {
    var entry = this.first, i = 0;
    while (entry != null) {
        if (fn.call(scope || entry.data, entry.data, i++) === false) {
            break;
        }
        entry = entry.next;
    }
}, toArray:function () {
    var v = [], entry = this.first;
    while (entry != null) {
        v.push(entry.data);
        entry = entry.next;
    }
    return v;
}, getFirst:function () {
    return this.first ? this.first.data : null;
}, getLast:function () {
    return this.last ? this.last.data : null;
}, clone:function () {
    var cloned = new dorado.util.KeyedList(this._getKeyFunction);
    var entry = this.first;
    while (entry != null) {
        cloned.append(entry.data);
        entry = entry.next;
    }
    return cloned;
}, deepClone:function () {
    var cloned = new dorado.util.KeyedList(this._getKeyFunction);
    var entry = this.first;
    while (entry != null) {
        cloned.append(dorado.Core.clone(entry.data));
        entry = entry.next;
    }
    return cloned;
}});
dorado.util.KeyedListIterator = $extend(dorado.util.Iterator, {$className:"dorado.util.KeyedListIterator", constructor:function (list, from) {
    this._list = list;
    this.current = null;
    if (from) {
        this.current = list.findEntry(from);
    }
    this.isFirst = (this.current == null);
    this.isLast = false;
}, first:function () {
    this.isFirst = true;
    this.isLast = false;
    this.current = null;
}, last:function () {
    this.isFirst = false;
    this.isLast = true;
    this.current = null;
}, hasNext:function () {
    if (this.isFirst) {
        return (this._list.first != null);
    } else {
        if (this.current != null) {
            return (this.current.next != null);
        } else {
            return false;
        }
    }
}, hasPrevious:function () {
    if (this.isLast) {
        return (this._list.last != null);
    } else {
        if (this.current != null) {
            return (this.current.previous != null);
        } else {
            return false;
        }
    }
}, next:function () {
    var current = this.current;
    if (this.isFirst) {
        current = this._list.first;
    } else {
        if (current != null) {
            current = current.next;
        } else {
            current = null;
        }
    }
    this.current = current;
    this.isFirst = false;
    if (current != null) {
        this.isLast = false;
        return current.data;
    } else {
        this.isLast = true;
        return null;
    }
}, previous:function () {
    var current = this.current;
    if (this.isLast) {
        current = this._list.last;
    } else {
        if (current != null) {
            current = current.previous;
        } else {
            current = null;
        }
    }
    this.current = current;
    this.isLast = false;
    if (current != null) {
        this.isFirst = false;
        return current.data;
    } else {
        this.isFirst = true;
        return null;
    }
}, current:function () {
    return (this.current) ? this.current.data : null;
}, createBookmark:function () {
    return {isFirst:this.isFirst, isLast:this.isLast, current:this.current};
}, restoreBookmark:function (bookmark) {
    this.isFirst = bookmark.isFirst;
    this.isLast = bookmark.isLast;
    this.current = bookmark.current;
}});
dorado.util.ObjectPool = $class({$className:"dorado.util.ObjectPool", constructor:function (factory) {
    dorado.util.ObjectPool.OBJECT_POOLS.push(this);
    this._factory = factory;
    this._idlePool = [];
    this._activePool = [];
}, borrowObject:function () {
    var object = null;
    var factory = this._factory;
    if (this._idlePool.length > 0) {
        object = this._idlePool.pop();
    } else {
        object = factory.makeObject();
    }
    if (object != null) {
        this._activePool.push(object);
        if (factory.activateObject) {
            factory.activateObject(object);
        }
    }
    return object;
}, returnObject:function (object) {
    if (object != null) {
        var factory = this._factory;
        var i = this._activePool.indexOf(object);
        if (i < 0) {
            return;
        }
        if (factory.passivateObject) {
            factory.passivateObject(object);
        }
        this._activePool.removeAt(i);
        this._idlePool.push(object);
    }
}, getNumActive:function () {
    return this._activePool.length;
}, getNumIdle:function () {
    return this._idlePool.length;
}, destroy:function () {
    if (!!this._destroyed) {
        return;
    }
    var factory = this._factory;
    function returnObject(object) {
        if (factory.passivateObject) {
            factory.passivateObject(object);
        }
    }
    function destroyObject(object) {
        if (factory.destroyObject) {
            factory.destroyObject(object);
        }
    }
    var activePool = this._activePool;
    for (var i = 0; i < activePool.length; i++) {
        var object = activePool[i];
        returnObject(object);
        destroyObject(object);
    }
    var idlePool = this._idlePool;
    for (var i = 0; i < idlePool.length; i++) {
        var object = idlePool[i];
        destroyObject(object);
    }
    this._factory = null;
    this._destroyed = true;
}});
dorado.util.ObjectPool.OBJECT_POOLS = [];
(function () {
    function f(n) {
        return n < 10 ? "0" + n : n;
    }
    Date.prototype.toJSON = function (key) {
        return this.getFullYear() + "-" + f(this.getMonth() + 1) + "-" + f(this.getDate()) + "T" + f(this.getHours()) + ":" + f(this.getMinutes()) + ":" + f(this.getSeconds()) + "Z";
    };
    dorado.JSON = {parse:function (text, untrusty) {
        return text ? ((untrusty) ? JSON.parse(text) : eval("(" + text + ")")) : null;
    }, stringify:function (value, options) {
        if (value != null) {
            if (value instanceof dorado.Entity || value instanceof dorado.EntityList) {
                value = value.toJSON(options);
            }
        }
        return JSON.stringify(value, (options != null) ? options.replacer : null);
    }, evaluate:function (template) {
        function toJSON(obj) {
            if (typeof obj == "function") {
                obj = obj.call(dorado.$this || this);
            } else {
                if (obj instanceof dorado.util.Map) {
                    obj = obj.toJSON();
                }
            }
            var json;
            if (obj instanceof dorado.Entity || obj instanceof dorado.EntityList) {
                json = obj.toJSON({generateDataType:true});
            } else {
                if (obj instanceof Array) {
                    json = [];
                    for (var i = 0; i < obj.length; i++) {
                        json.push(toJSON(obj[i]));
                    }
                } else {
                    if (obj instanceof Object && !(obj instanceof Date)) {
                        if (typeof obj.toJSON == "function") {
                            json = obj.toJSON();
                        } else {
                            json = {};
                            for (var p in obj) {
                                if (obj.hasOwnProperty(p)) {
                                    v = obj[p];
                                    if (v === undefined) {
                                        continue;
                                    }
                                    if (v != null) {
                                        v = toJSON.call(obj, v);
                                    }
                                    json[p] = v;
                                }
                            }
                        }
                    } else {
                        json = obj;
                    }
                }
            }
            return json;
        }
        return toJSON(template);
    }};
})();
dorado.util.AjaxConnectionPool = new dorado.util.ObjectPool({activeX:["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"], _createXMLHttpRequest:function () {
    try {
        return new XMLHttpRequest();
    }
    catch (e) {
        for (var i = 0; i < this.activeX.length; ++i) {
            try {
                return new ActiveXObject(this.activeX[i]);
            }
            catch (e) {
            }
        }
    }
}, makeObject:function () {
    return {conn:this._createXMLHttpRequest()};
}, passivateObject:function (connObj) {
    delete connObj.url;
    delete connObj.method;
    delete connObj.options;
    var conn = connObj.conn;
    conn.onreadystatechange = dorado._NULL_FUNCTION;
    conn.abort();
}});
dorado.util.AjaxEngine = $extend([dorado.AttributeSupport, dorado.EventSupport], {$className:"dorado.util.AjaxEngine", constructor:function (options) {
    this._requests = [];
    this._connectionPool = dorado.util.AjaxConnectionPool;
    $invokeSuper.call(this);
    if (options) {
        this.set(options);
    }
}, ATTRIBUTES:{defaultOptions:{writeOnce:true}, autoBatchEnabled:{setter:function (value) {
    if (value && !(this._defaultOptions && this._defaultOptions.url)) {
        throw new dorado.ResourceException("dorado.core.BatchUrlUndefined");
    }
    this._autoBatchEnabled = value;
}}, minConnectInterval:{defaultValue:50}, maxBatchSize:{defaultValue:20}}, EVENTS:{beforeRequest:{}, onResponse:{}, beforeConnect:{}, onDisconnect:{}}, request:function (options, callback) {
    if (typeof options == "string") {
        options = {url:options};
    }
    var id = dorado.Core.newId();
    dorado.util.AjaxEngine.ASYNC_REQUESTS[id] = true;
    var callbackWrapper = {callback:function (success, result) {
        var timerId = dorado.util.AjaxEngine.ASYNC_REQUESTS[id];
        if (timerId) {
            if (typeof timerId == "number") {
                clearTimeout(timerId);
            }
            delete dorado.util.AjaxEngine.ASYNC_REQUESTS[id];
            $callback(callback, success, result);
        }
    }};
    var useBatch = this._autoBatchEnabled && (options.batchable === true);
    if (useBatch) {
        if (options) {
            if (options.url && options.url != this._defaultOptions.url || options.method && options.method != "POST" || options.timeout) {
                useBatch = false;
            }
            if (useBatch && options.headers) {
                for (var prop in options.headers) {
                    if (options.headers.hasOwnProperty(prop)) {
                        useBatch = false;
                        break;
                    }
                }
            }
        }
        var requests = this._requests;
        if (requests.length == 0) {
            this._batchTimerId = $setTimeout(this, function () {
                this._requestBatch();
            }, this._minConnectInterval);
        }
        this.fireEvent("beforeRequest", this, {async:true, options:options});
        var message = options.message, taskId;
        if (message && message != "none") {
            taskId = dorado.util.TaskIndicator.showTaskIndicator(message, options.modal ? "main" : "daemon");
        }
        if (callback && options && options.timeout) {
            dorado.util.AjaxEngine.ASYNC_REQUESTS[id] = $setTimeout(this, function () {
                var result = new dorado.util.AjaxResult(options);
                result._setException(new dorado.util.AjaxTimeoutException($resource("dorado.core.AsyncRequestTimeout", options.timeout)));
                $callback(callbackWrapper, false, result, {scope:this});
            }, options.timeout);
        }
        requests.push({options:options, callback:callbackWrapper, taskId:taskId});
        if (requests.length >= this._maxBatchSize) {
            this._requestBatch();
        }
    } else {
        this.requestAsync(options, callbackWrapper);
    }
}, _requestBatch:function () {
    if (this._batchTimerId) {
        clearTimeout(this._batchTimerId);
        this._batchTimerId = 0;
    }
    var requests = this._requests;
    if (requests.length == 0) {
        return;
    }
    this._requests = [];
    var batchCallback = {scope:this, callback:function (success, batchResult) {
        function createAjaxResult(options) {
            var result = new dorado.util.AjaxResult(options);
            result._init(batchResult._connObj);
            return result;
        }
        if (success) {
            var xmlDoc = jQuery(batchResult.getXmlDocument());
            var i = 0;
            xmlDoc.find("result>request").each($scopify(this, function (index, elem) {
                var request = requests[i];
                if (request.taskId) {
                    dorado.util.TaskIndicator.hideTaskIndicator(request.taskId);
                }
                var result = createAjaxResult(request.options);
                var el = jQuery(elem);
                var exceptionEl = el.children("exception");
                var success = (exceptionEl.size() == 0);
                if (success) {
                    var responseEl = el.children("response");
                    result.text = responseEl.text();
                } else {
                    result.text = exceptionEl.text();
                    if (exceptionEl.attr("type") == "runnable") {
                        result._parseRunnableException(result.text);
                    } else {
                        result._setException(result._parseException(result.text, batchResult._connObj));
                    }
                }
                $callback(request.callback, success, result);
                this.fireEvent("onResponse", this, {async:true, result:result});
                i++;
            }));
        } else {
            for (var i = 0; i < requests.length; i++) {
                var request = requests[i];
                if (request.taskId) {
                    dorado.util.TaskIndicator.hideTaskIndicator(request.taskId);
                }
                var result = createAjaxResult(request.options);
                result._setException(batchResult.exception);
                $callback(request.callback, false, result);
                this.fireEvent("onResponse", this, {async:true, result:result});
            }
        }
    }};
    var sendData = ["<batch>\n"];
    for (var i = 0; i < requests.length; i++) {
        var request = requests[i];
        var options = request.options;
        var type = "";
        if (options) {
            if (options.xmlData) {
                type = "xml";
            } else {
                if (options.jsonData) {
                    type = "json";
                }
            }
        }
        sendData.push("<request type=\"" + type + "\"><![CDATA[");
        var data = this._getSendData(options);
        if (data) {
            data = data.replace(/]]>/g, "]]]]><![CDATA[>");
        }
        sendData.push(data);
        sendData.push("]]></request>\n");
    }
    sendData.push("</batch>");
    var batchOptions = {isBatch:true, xmlData:sendData.join("")};
    this.requestAsync(batchOptions, batchCallback);
}, requestAsync:function (options, callback) {
    var connObj = this._connectionPool.borrowObject();
    this._init(connObj, options, true);
    var eventArg = {async:true, options:options};
    if (options == null || !options.isBatch) {
        this.fireEvent("beforeRequest", this, eventArg);
    }
    this.fireEvent("beforeConnect", this, eventArg);
    var conn = connObj.conn;
    var message = options.message, taskId;
    if (message && message != "none") {
        taskId = dorado.util.TaskIndicator.showTaskIndicator(message, options.modal ? "main" : "daemon");
    }
    if (callback && options && options.timeout) {
        connObj.timeoutTimerId = $setTimeout(this, function () {
            try {
                if (taskId) {
                    dorado.util.TaskIndicator.hideTaskIndicator(taskId);
                }
                var result = new dorado.util.AjaxResult(options);
                try {
                    result._init(connObj);
                }
                catch (e) {
                }
                result._setException(new dorado.util.AjaxTimeoutException($resource("dorado.core.AsyncRequestTimeout", options.timeout), null, connObj));
                $callback(callback, false, result, {scope:this});
                var eventArg = {async:true, result:result};
                this.fireEvent("onDisconnect", this, eventArg);
                if (options == null || !options.isBatch) {
                    this.fireEvent("onResponse", this, eventArg);
                }
            }
            finally {
                this._connectionPool.returnObject(connObj);
            }
        }, options.timeout);
    }
    conn.onreadystatechange = $scopify(this, function () {
        if (conn.readyState == 4) {
            try {
                if (taskId) {
                    dorado.util.TaskIndicator.hideTaskIndicator(taskId);
                }
                if (callback && options && options.timeout) {
                    clearTimeout(connObj.timeoutTimerId);
                }
                var result = new dorado.util.AjaxResult(options, connObj);
                var eventArg = {async:true, result:result};
                this.fireEvent("onDisconnect", this, eventArg);
                $callback(callback, result.success, result, {scope:this});
                if (options == null || !options.isBatch) {
                    this.fireEvent("onResponse", this, eventArg);
                }
            }
            finally {
                this._connectionPool.returnObject(connObj);
            }
        }
    });
    conn.send(this._getSendData(options));
}, _setHeader:function (connObj, options) {
    function setHeaders(conn, headers) {
        if (!headers) {
            return;
        }
        for (var prop in headers) {
            if (headers.hasOwnProperty(prop)) {
                var value = headers[prop];
                if (value != null) {
                    conn.setRequestHeader(prop, value);
                }
            }
        }
    }
    if (this._defaultOptions) {
        setHeaders(connObj.conn, this._defaultOptions.headers);
    }
    if (options) {
        setHeaders(connObj.conn, options.headers);
    }
}, _init:function (connObj, options, async) {
    function urlAppend(url, p, s) {
        if (s) {
            return url + (url.indexOf("?") === -1 ? "?" : "&") + p + "=" + encodeURI(s);
        }
        return url;
    }
    var url, method;
    if (options) {
        url = options.url;
        method = options.method;
        if (!options.headers) {
            options.headers = {};
        }
        if (options.xmlData) {
            options.headers["content-type"] = "text/xml";
            method = "POST";
        } else {
            if (options.jsonData) {
                options.headers["content-type"] = "text/javascript";
                method = "POST";
            }
        }
    }
    var defaultOptions = (this._defaultOptions) ? this._defaultOptions : {};
    url = url || defaultOptions.url;
    method = method || defaultOptions.method || "GET";
    var parameter = options.parameter;
    if (parameter && (method == "GET" || options.xmlData || options.jsonData)) {
        for (var p in parameter) {
            if (parameter.hasOwnProperty(p)) {
                url = urlAppend(url, p, parameter[p]);
            }
        }
    }
    connObj.url = url = $url(url);
    connObj.method = method;
    connObj.options = options;
    connObj.conn.open(method, url, async);
    this._setHeader(connObj, options);
}, _getSendData:function (options) {
    if (!options) {
        return null;
    }
    var data = null;
    if (options.xmlData) {
        data = options.xmlData;
    } else {
        if (options.jsonData) {
            data = dorado.JSON.stringify(options.jsonData, {replacer:function (key, value) {
                return (typeof value == "function") ? value.call(this) : value;
            }});
        } else {
            if (options.parameter) {
                var parameter = options.parameter;
                data = "";
                var i = 0;
                for (var p in parameter) {
                    if (parameter.hasOwnProperty(p)) {
                        data += (i > 0 ? "&" : "") + p + "=" + encodeURI(parameter[p]);
                        i++;
                    }
                }
            }
        }
    }
    return data;
}, requestSync:function (options, alwaysReturn) {
    if (typeof options == "string") {
        options = {url:options};
    }
    var connObj = this._connectionPool.borrowObject();
    try {
        var eventArg = {async:false, options:options};
        this.fireEvent("beforeRequest", this, eventArg);
        this.fireEvent("beforeConnect", this, eventArg);
        var exception = null;
        try {
            this._init(connObj, options, false);
            connObj.conn.send(this._getSendData(options));
        }
        catch (e) {
            exception = e;
        }
        var result = new dorado.util.AjaxResult(options);
        if (exception != null) {
            result._init(connObj);
            result._setException(exception);
        } else {
            result._init(connObj, true);
        }
        eventArg = {async:true, result:result};
        this.fireEvent("onDisconnect", this, eventArg);
        this.fireEvent("onResponse", this, eventArg);
        if (!alwaysReturn && exception != null) {
            throw exception;
        }
        return result;
    }
    finally {
        this._connectionPool.returnObject(connObj);
    }
}});
dorado.util.AjaxEngine._parseXml = function (xml) {
    var xmlDoc = null;
    try {
        if (dorado.Browser.msie) {
            var activeX = ["MSXML2.DOMDocument", "MSXML.DOMDocument"];
            for (var i = 0; i < activeX.length; ++i) {
                try {
                    xmlDoc = new ActiveXObject(activeX[i]);
                    break;
                }
                catch (e) {
                }
            }
            xmlDoc.loadXML(xml);
        } else {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(xml, "text/xml");
        }
    }
    finally {
        return xmlDoc;
    }
};
dorado.util.AjaxException = $extend(dorado.Exception, {$className:"dorado.util.AjaxException", constructor:function (message, description, connObj) {
    this.message = message || "Unknown Exception.";
    this.description = description;
    if (connObj != null) {
        this.url = connObj.url;
        this.method = connObj.method;
        this.status = connObj.conn.status;
        this.statusText = connObj.conn.statusText;
        if (this.status === 1223) {
            this.status = 204;
        }
    }
    $invokeSuper.call(this, arguments);
}, toString:function () {
    var text = this.message;
    if (this.url) {
        text += "\nURL: " + this.url;
    }
    if (this.status) {
        text += "\nStatus: " + this.statusText + "(" + this.status + ")";
    }
    if (this.description) {
        text += "\n" + this.description;
    }
    return text;
}});
dorado.util.AjaxTimeoutException = $extend(dorado.util.AjaxException, {$className:"dorado.util.AjaxTimeoutException"});
dorado.util.AjaxResult = $class({$className:"dorado.util.AjaxResult", constructor:function (options, connObj) {
    this.options = options;
    if (connObj != null) {
        this._init(connObj, true);
    }
}, success:true, _init:function (connObj, parseResponse) {
    this._connObj = connObj;
    this.url = connObj.url;
    this.method = connObj.method;
    var conn = connObj.conn;
    this.status = conn.status;
    this.statusText = conn.statusText;
    this.allResponseHeaders = conn.getAllResponseHeaders();
    if (parseResponse) {
        this.text = conn.responseText;
        var exception, contentType = this.getResponseHeaders()["content-type"];
        if (contentType && contentType.indexOf("text/dorado-exception") >= 0) {
            exception = this._parseException(conn.responseText, connObj);
        } else {
            if (contentType && contentType.indexOf("text/runnable") >= 0) {
                exception = this._parseRunnableException(conn.responseText, connObj);
            } else {
                if (conn.status < 200 || conn.status >= 400) {
                    if (dorado.windowClosed && conn.status == 0) {
                        exception = new dorado.AbortException();
                    } else {
                        exception = new dorado.util.AjaxException("HTTP " + conn.status + " " + conn.statusText, null, connObj);
                        if (conn.status == 0) {
                            exception._processDelay = 1000;
                        }
                    }
                }
            }
        }
        if (exception) {
            this._setException(exception);
        }
    }
}, _setException:function (exception) {
    this.success = false;
    this.exception = exception;
}, _parseException:function (text) {
    var json = dorado.JSON.parse(text);
    return new dorado.RemoteException(json.message, json.exceptionType, json.stackTrace);
}, _parseRunnableException:function (text) {
    return new dorado.RunnableException(text);
}, getResponseHeaders:function () {
    var responseHeaders = this._responseHeaders;
    if (responseHeaders === undefined) {
        responseHeaders = {};
        this._responseHeaders = responseHeaders;
        try {
            var headerStr = this.allResponseHeaders;
            var headers = headerStr.split("\n");
            for (var i = 0; i < headers.length; i++) {
                var header = headers[i];
                var delimitPos = header.indexOf(":");
                if (delimitPos != -1) {
                    responseHeaders[header.substring(0, delimitPos).toLowerCase()] = header.substring(delimitPos + 2);
                }
            }
        }
        catch (e) {
        }
    }
    return responseHeaders;
}, getXmlDocument:function () {
    var responseXML = this._responseXML;
    if (responseXML === undefined) {
        responseXML = dorado.util.AjaxEngine._parseXml(this.text);
        this._responseXML = responseXML;
    }
    return responseXML;
}, getJsonData:function (untrusty) {
    var jsonData = this._jsonData;
    if (jsonData === undefined) {
        this._jsonData = jsonData = dorado.JSON.parse(this.text, untrusty);
    }
    return jsonData;
}});
dorado.util.AjaxEngine.SHARED_INSTANCES = {};
dorado.util.AjaxEngine.ASYNC_REQUESTS = {};
dorado.util.AjaxEngine.getInstance = function (options) {
    var defaultOptions = $setting["ajax.defaultOptions"];
    if (defaultOptions) {
        defaultOptions = dorado.Object.apply({}, defaultOptions);
        options = dorado.Object.apply(defaultOptions, options);
    }
    var key = (options.url || "#EMPTY") + "|" + (options.batchable || false);
    var ajax = dorado.util.AjaxEngine.SHARED_INSTANCES[key];
    if (ajax === undefined) {
        ajax = new dorado.util.AjaxEngine({defaultOptions:options, autoBatchEnabled:options.autoBatchEnabled || options.batchable});
        dorado.util.AjaxEngine.SHARED_INSTANCES[key] = ajax;
    }
    return ajax;
};
window.$ajax = new dorado.util.AjaxEngine();
dorado.util.Map = $class({$className:"dorado.util.Map", constructor:function (config) {
    this._map = {};
    if (config && config instanceof Object) {
        this.put(config);
    }
}, put:function (k, v) {
    if (!k) {
        return;
    }
    if (v === undefined && k instanceof Object) {
        var obj = k;
        if (obj instanceof dorado.util.Map) {
            obj = obj._map;
        }
        if (obj) {
            var map = this._map;
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    map[p] = obj[p];
                }
            }
        }
    } else {
        this._map[k] = v;
    }
}, set:function () {
    this.put.apply(this, arguments);
}, get:function (k) {
    return this._map[k];
}, isEmpty:function () {
    var map = this._map;
    for (var k in map) {
        if (map.hasOwnProperty(k)) {
            return false;
        }
    }
    return true;
}, remove:function (k) {
    delete this._map[k];
}, clear:function () {
    this._map = {};
}, toJSON:function () {
    return this._map;
}, keys:function () {
    var map = this._map, keys = [];
    for (var k in map) {
        if (map.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    return keys;
}, eachKey:function (fn) {
    if (!fn) {
        return;
    }
    var map = this._map;
    for (var k in map) {
        if (map.hasOwnProperty(k)) {
            fn.call(this, k, map[k]);
        }
    }
}, toString:function () {
    return "dorado.util.Map";
}});
window.$map = function (obj) {
    return new dorado.util.Map(obj);
};
(function () {
    var maxZIndex = 9999;
    window.$DomUtils = dorado.util.Dom = {getInvisibleContainer:function () {
        var id = "_dorado_invisible_div";
        var div = document.getElementById(id);
        if (!div) {
            div = this.xCreate({tagName:"DIV", id:id, style:{position:"absolute", width:100, height:100, left:-200, top:-200, overflow:"hidden"}});
            document.body.appendChild(div);
        }
        return div;
    }, getUndisplayContainer:function () {
        var id = "_dorado_undisplay_div";
        var div = document.getElementById(id);
        if (!div) {
            div = this.xCreate({tagName:"DIV", id:id, style:{visibility:"hidden", display:"none"}});
            document.body.appendChild(div);
        }
        return div;
    }, getOwnerWindow:function (node) {
        return dorado.Browser.msie ? node.ownerDocument.parentWindow : node.ownerDocument.defaultView;
    }, isOwnerOf:function (node, owner) {
        while (true) {
            node = node.parentNode;
            if (node == null) {
                return false;
            }
            if (node == owner) {
                return true;
            }
        }
    }, findParent:function (node, fn, includeSelf) {
        if (includeSelf !== false) {
            if (fn(node)) {
                return node;
            }
        }
        while (true) {
            node = node.parentNode;
            if (!node) {
                break;
            }
            if (fn(node)) {
                return node;
            }
        }
        return null;
    }, xCreate:function (template, arg, context) {
        function setAttrs(el, attrs, jqEl) {
            var $el = jQuery(el);
            for (var attrName in attrs) {
                var attrValue = attrs[attrName];
                switch (attrName) {
                  case "style":
                    if (attrValue.constructor == String) {
                        $el.attr("style", attrValue);
                    } else {
                        for (var styleName in attrValue) {
                            var v = attrValue[styleName];
                            if (styleName.match(/^width$|^height$|^top$|^left$|^right$|^bottom$/)) {
                                if (isFinite(v)) {
                                    v += "px";
                                }
                            }
                            el.style[styleName] = v;
                        }
                    }
                    break;
                  case "outerWidth":
                    jqEl.outerWidth(attrValue);
                    break;
                  case "outerHeight":
                    jqEl.outerHeight(attrValue);
                    break;
                  case "tagName":
                  case "content":
                  case "contentText":
                    continue;
                  case "contextKey":
                    if (context instanceof Object && attrValue && typeof attrValue == "string") {
                        context[attrValue] = el;
                    }
                    continue;
                  case "data":
                    $el.data(attrValue);
                    break;
                  default:
                    if (attrName.substr(0, 2) == "on") {
                        var event = attrName.substr(2);
                        if (typeof attrValue != "function") {
                            attrValue = new Function(attrValue);
                        }
                        jqEl.bind(event, attrValue);
                    } else {
                        el[attrName] = attrValue;
                    }
                }
            }
            return el;
        }
        function setText(el, content, jqEl, isText) {
            var isHtml = /(<\S[^><]*>)|(&.+;)/g;
            if (isText !== true && content.match(isHtml) != null && el.tagName.toUpperCase() != "TEXTAREA") {
                el.innerHTML = content;
            } else {
                if (dorado.Browser.mozilla) {
                    el.innerHTML = content.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/\n/g, "<br />\n");
                } else {
                    el.innerText = content;
                }
            }
            return el;
        }
        function appendChild(parentEl, el) {
            if (parentEl.nodeName.toUpperCase() == "TABLE" && el.nodeName.toUpperCase() == "TR") {
                var tbody;
                if (parentEl && parentEl.tBodies[0]) {
                    tbody = parentEl.tBodies[0];
                } else {
                    tbody = parentEl.appendChild(document.createElement("tbody"));
                }
                parentEl = tbody;
            }
            parentEl.appendChild(el);
        }
        if (typeof template == "function") {
            template = template(arg || window);
        }
        if (template instanceof Array) {
            var elements = [];
            for (var i = 0; i < template.length; i++) {
                elements.push(this.xCreate(template[i], arg, context));
            }
            return elements;
        }
        var tagName = template.tagName || "DIV";
        tagName = tagName.toUpperCase();
        var content = template.content;
        var el;
        if (dorado.Core.msie && tagName == "INPUT" && template.type) {
            el = document.createElement("<" + tagName + " type=\"" + template.type + "\"/>");
        } else {
            el = document.createElement(tagName);
        }
        var jqEl = jQuery(el);
        el = setAttrs(el, template, jqEl);
        if (content != null) {
            if (content.constructor == String) {
                if (content.charAt(0) == "^") {
                    appendChild(el, document.createElement(content.substring(1)));
                } else {
                    el = setText(el, content, jqEl);
                }
            } else {
                if (content instanceof Array) {
                    for (var i = 0; i < content.length; i++) {
                        var c = content[i];
                        if (c.constructor == String) {
                            if (c.charAt(0) == "^") {
                                appendChild(el, document.createElement(c.substring(1)));
                            } else {
                                appendChild(el, document.createTextNode(c));
                            }
                        } else {
                            appendChild(el, this.xCreate(c, arg, context));
                        }
                    }
                } else {
                    if (content.nodeType) {
                        appendChild(el, content);
                    } else {
                        appendChild(el, this.xCreate(content, arg, context));
                    }
                }
            }
        } else {
            var contentText = template.contentText;
            if (contentText != null && contentText.constructor == String) {
                el = setText(el, contentText, jqEl, true);
            }
        }
        return el;
    }, BLANK_IMG:dorado.Setting["common.contextPath"] + "dorado/client/resources/blank.gif", setImgSrc:function (img, src) {
        src = $url(src) || BLANK_IMG;
        if (img.src != src) {
            img.src = src;
        }
    }, setBackgroundImage:function (el, url) {
        if (url) {
            var reg = /url\(.*\)/i, m = url.match(reg);
            if (m) {
                m = m[0];
                var realUrl = jQuery.trim(m.substring(4, m.length - 1));
                realUrl = $url(realUrl);
                el.style.background = url.replace(reg, "url(" + realUrl + ")");
                return;
            }
            url = $url(url);
            url = "url(" + url + ")";
        } else {
            url = "";
        }
        if (el.style.backgroundImage != url) {
            el.style.backgroundImage = url;
            el.style.backgroundPosition = "center";
        }
    }, placeCenterElement:function (element, container) {
        var offset = $fly(container).offset();
        element.style.left = (offset.left + (container.offsetWidth - element.offsetWidth) / 2) + "px";
        element.style.top = (offset.top + (container.offsetHeight - element.offsetHeight) / 2) + "px";
    }, getOrCreateChild:function (parentNode, index, tagName, fn) {
        var child, refChild;
        if (index < parentNode.childNodes.length) {
            child = refChild = parentNode.childNodes[index];
            if (fn && fn(child) === false) {
                child = null;
            }
        }
        if (!child) {
            child = (typeof tagName == "function") ? tagName(index) : ((tagName.constructor == String) ? document.createElement(tagName) : this.xCreate(tagName));
            (refChild) ? parentNode.insertBefore(child, refChild) : parentNode.appendChild(child);
        }
        return child;
    }, removeChildrenFrom:function (parentNode, from, fn) {
        var toRemove = [];
        for (var i = parentNode.childNodes.length - 1; i >= from; i--) {
            var child = parentNode.childNodes[i];
            if (fn && fn(child) === false) {
                continue;
            }
            toRemove.push(child);
        }
        if (toRemove.length > 0) {
            $fly(toRemove).remove();
        }
    }, isDragging:function () {
        var currentDraggable = jQuery.ui.ddmanager.current;
        return (currentDraggable && currentDraggable._mouseStarted);
    }, getCellPosition:function (event) {
        var element = event.srcElement || event.target, row = -1, column = -1;
        while (element && element != element.ownerDocument.body) {
            var tagName = element.tagName.toLowerCase();
            if (tagName == "td") {
                row = element.parentNode.rowIndex;
                column = element.cellIndex;
                break;
            }
            element = element.parentNode;
        }
        if (element != element.ownerDocument.body) {
            return {"row":row, "column":column, "element":element};
        }
        return null;
    }, dockAround:function (element, fixedElement, options) {
        options = options || {};
        var align = options.align || "innerleft", vAlign = options.vAlign || "innertop", offsetLeft = options.offsetLeft || 0, offsetTop = options.offsetTop || 0, autoAdjustPosition = options.autoAdjustPosition, handleOverflow = options.handleOverflow, offsetParentEl = $fly(element.offsetParent), offsetParentWidth = offsetParentEl.width(), offsetParentHeight = offsetParentEl.height(), offsetParentBottom, offsetParentRight, overflowTrigger = false, offsetParentOffset = offsetParentEl.offset() || {left:0, top:0}, maxWidth, maxHeight, adjustLeft, adjustTop;
        offsetParentRight = offsetParentWidth + offsetParentOffset.left;
        offsetParentBottom = offsetParentHeight + offsetParentOffset.top;
        var position = jQuery(fixedElement == window ? document.body : fixedElement).offset(), left = position.left, top = position.top, rect, newAlign, vAlignPrefix, overflowRect;
        if (fixedElement) {
            rect = getRect(fixedElement);
            if (options.gapX) {
                rect.left -= options.gapX;
                rect.right += options.gapX;
            }
            if (options.gapY) {
                rect.top -= options.gapY;
                rect.bottom += options.gapY;
            }
            if (align) {
                left = getLeft(rect, element, align);
                if ((left + element.offsetWidth > offsetParentRight) || (left < 0)) {
                    if (!(autoAdjustPosition === false)) {
                        if (align != "center") {
                            if (align.indexOf("left") != -1) {
                                newAlign = align.replace("left", "right");
                            } else {
                                if (align.indexOf("right") != -1) {
                                    newAlign = align.replace("right", "left");
                                }
                            }
                            adjustLeft = getLeft(rect, element, newAlign);
                            if ((adjustLeft + element.offsetWidth > offsetParentRight) || (adjustLeft < 0)) {
                                left = 0;
                                overflowTrigger = true;
                                maxWidth = offsetParentWidth;
                            } else {
                                left = adjustLeft;
                                align = newAlign;
                            }
                        } else {
                            if (align == "center") {
                                if (left < 0) {
                                    left = 0;
                                    overflowTrigger = true;
                                    maxWidth = offsetParentWidth;
                                }
                            }
                        }
                    } else {
                        overflowTrigger = true;
                    }
                }
            }
            if (vAlign) {
                top = getTop(rect, element, vAlign);
                if ((top + element.offsetHeight > offsetParentBottom) || (top < 0)) {
                    if (!(autoAdjustPosition === false)) {
                        if (vAlign != "center") {
                            if (vAlign.indexOf("top") != -1) {
                                vAlign = vAlign.replace("top", "bottom");
                                vAlignPrefix = vAlign.replace("top", "");
                            } else {
                                if (vAlign.indexOf("bottom") != -1) {
                                    vAlign = vAlign.replace("bottom", "top");
                                    vAlignPrefix = vAlign.replace("bottom", "");
                                }
                            }
                            adjustTop = getTop(rect, element, vAlign);
                            if (adjustTop + element.offsetHeight > offsetParentBottom) {
                                overflowTrigger = true;
                                if (adjustTop < (offsetParentHeight / 2)) {
                                    top = adjustTop;
                                    maxHeight = offsetParentHeight - top;
                                    vAlign = vAlignPrefix + "bottom";
                                } else {
                                    maxHeight = element.offsetHeight + top;
                                    vAlign = vAlignPrefix + "top";
                                }
                            } else {
                                if (adjustTop < 0) {
                                    overflowTrigger = true;
                                    if (top > (offsetParentHeight / 2)) {
                                        top = 0;
                                        maxHeight = element.offsetHeight + adjustTop;
                                        vAlign = vAlignPrefix + "top";
                                    } else {
                                        maxHeight = offsetParentHeight - top;
                                        vAlign = vAlignPrefix + "bottom";
                                    }
                                } else {
                                    top = adjustTop;
                                }
                            }
                        } else {
                            if (vAlign == "center") {
                                if (top < 0) {
                                    overflowTrigger = true;
                                    top = 0;
                                    maxHeight = offsetParentHeight;
                                }
                            }
                        }
                    } else {
                        overflowTrigger = true;
                    }
                }
            }
        }
        options.align = align;
        options.vAlign = vAlign;
        var finalLeft = left + offsetLeft, finalTop = top + offsetTop;
        $fly(element).offset({left:finalLeft, top:finalTop});
        finalLeft = parseInt($fly(element).css("left"), 10);
        finalTop = parseInt($fly(element).css("top"), 10);
        if (!(handleOverflow === false) && overflowTrigger) {
            if (typeof options.overflowHandler == "function") {
                overflowRect = {left:finalLeft, top:finalTop, align:align, vAlign:vAlign, maxHeight:maxHeight, maxWidth:maxWidth};
                options.overflowHandler.call(null, overflowRect);
            }
        }
        return {left:finalLeft, top:finalTop, 0:finalLeft, 1:finalTop};
    }, locateIn:function (element, options) {
        options = options || {};
        var offsetLeft = options.offsetLeft || 0, offsetTop = options.offsetTop || 0, handleOverflow = options.handleOverflow, parent = options.parent, offsetParentEl = $fly(element.offsetParent), offsetParentWidth = offsetParentEl.width(), offsetParentHeight = offsetParentEl.height(), adjustLeft, adjustTop, overflowTrigger = false, maxWidth, maxHeight, position = options.position, left = position ? position.left : 0, top = position ? position.top : 0, autoAdjustPosition = options.autoAdjustPosition;
        if (parent) {
            var parentPos = $fly(parent).offset();
            left += parentPos.left;
            top += parentPos.top;
        }
        if (!(autoAdjustPosition === false)) {
            if (top < 0) {
                top = 0;
            }
            if (left < 0) {
                left = 0;
            }
            if (left + element.offsetWidth > offsetParentWidth) {
                if (!(handleOverflow === false)) {
                    adjustLeft = left - element.offsetWidth;
                    if (adjustLeft > 0) {
                        left = adjustLeft;
                    } else {
                        left = 0;
                        overflowTrigger = true;
                        maxWidth = offsetParentWidth;
                    }
                } else {
                    overflowTrigger = true;
                }
            }
            if (top + element.offsetHeight >= offsetParentHeight) {
                if (!(handleOverflow === false)) {
                    adjustTop = top - element.offsetHeight;
                    if (adjustTop < 0) {
                        top = 0;
                        overflowTrigger = true;
                        maxHeight = offsetParentHeight;
                    } else {
                        top = adjustTop;
                    }
                } else {
                    overflowTrigger = true;
                }
            }
        }
        var finalLeft = left + offsetLeft, finalTop = top + offsetTop;
        $fly(element).left(finalLeft).top(finalTop);
        if (handleOverflow !== false && overflowTrigger) {
            if (typeof options.overflowHandler == "function") {
                var overflowRect = {left:finalLeft, top:finalTop, maxHeight:maxHeight, maxWidth:maxWidth};
                options.overflowHandler.call(null, overflowRect);
            }
        }
        return {left:finalLeft, top:finalTop, 0:finalLeft, 1:finalTop};
    }, disableUserSelection:function (element) {
        if (dorado.Browser.msie) {
            $fly(element).bind("selectstart.disableUserSelection", onSelectStart);
        } else {
            element.style.MozUserSelect = "none";
            element.style.KhtmlUserSelect = "none";
            element.style.webkitUserSelect = "none";
            element.style.OUserSelect = "none";
            element.unselectable = "on";
        }
    }, enableUserSelection:function (element) {
        if (dorado.Browser.msie) {
            $fly(element).unbind("selectstart.disableUserSelection");
        } else {
            element.style.MozUserSelect = "";
            element.style.KhtmlUserSelect = "";
            element.style.webkitUserSelect = "";
            element.style.OUserSelect = "";
            element.unselectable = "";
        }
    }, bringToFront:function (dom) {
        if (dorado.Browser.msie) {
            maxZIndex += 2;
        } else {
            maxZIndex += 1;
        }
        if (dom) {
            dom.style.zIndex = maxZIndex;
        }
        return maxZIndex;
    }};
    function onSelectStart() {
        return false;
    }
    function getRect(element) {
        if (element) {
            var width, height;
            if (element == window) {
                var $win = $fly(window), left = $win.scrollLeft(), top = $win.scrollTop();
                width = $win.width();
                height = $win.height();
                return {left:left, top:top, right:left + width, bottom:top + height};
            }
            var offset = $fly(element).offset();
            if (element == document.body) {
                width = $fly(window).width();
                height = $fly(window).height();
            } else {
                width = $fly(element).outerWidth();
                height = $fly(element).outerHeight();
            }
            return {left:offset.left, top:offset.top, right:offset.left + width, bottom:offset.top + height};
        }
        return null;
    }
    function getLeft(rect, dom, align) {
        switch (align.toLowerCase()) {
          case "left":
            return rect.left - dom.offsetWidth;
          case "innerleft":
            return rect.left;
          case "center":
            return (rect.left + rect.right - dom.offsetWidth) / 2;
          case "innerright":
            return rect.right - dom.offsetWidth;
          case "right":
          default:
            return rect.right;
        }
    }
    function getTop(rect, dom, vAlign) {
        switch (vAlign.toLowerCase()) {
          case "top":
            return rect.top - dom.offsetHeight;
          case "innertop":
            return rect.top;
          case "center":
            return (rect.top + rect.bottom - dom.offsetHeight) / 2;
          case "innerbottom":
            return rect.bottom - dom.offsetHeight;
          case "bottom":
          default:
            return rect.bottom;
        }
    }
    function findValidContent(container) {
        var childNodes = container.childNodes;
        for (var i = 0, j = childNodes.length; i < j; i++) {
            var child = childNodes[i];
            with (child.style) {
                if (display != "none" && (position == "" || position == "static")) {
                    return child;
                }
            }
        }
        return null;
    }
})();
jQuery.fn.shadow = function (options) {
    if (dorado.Browser.msie && dorado.Browser.version < 9) {
        return this;
    }
    options = options || {};
    var mode = options.mode || "drop";
    switch (mode.toLowerCase()) {
      case "drop":
        this.addClass("d-shadow-drop");
        break;
      case "sides":
        this.addClass("d-shadow-sides");
        break;
      case "frame":
        this.addClass("d-shadow-frame");
        break;
    }
    return this;
};
jQuery.fn.unshadow = function (options) {
    if (dorado.Browser.msie && dorado.Browser.version < 9) {
        return this;
    }
    options = options || {};
    var mode = options.mode || "drop";
    switch (mode.toLowerCase()) {
      case "drop":
        this.removeClass("d-shadow-drop");
        break;
      case "sides":
        this.removeClass("d-shadow-sides");
        break;
      case "frame":
        this.removeClass("d-shadow-frame");
        break;
    }
    return this;
};
(function ($) {
    function num(el, prop) {
        return parseInt(jQuery.css(el.jquery ? el[0] : el, prop, true)) || 0;
    }
    $.fn.bringToFront = function () {
        return this.css("zIndex", $DomUtils.bringToFront());
    };
    $.each(["left", "top", "right", "bottom"], function (i, name) {
        $.fn[name] = function (val) {
            return this.css(name, val);
        };
    });
    var oldPosition = $.fn.position;
    $.fn.position = function (left, top) {
        if (arguments.length) {
            this.css("left", left).css("top", top);
            return this;
        } else {
            return oldPosition.call(this);
        }
    };
    $.each(["Height", "Width"], function (i, name) {
        var tl = i ? "Left" : "Top";
        var br = i ? "Right" : "Bottom";
        var fn = $.fn["outer" + name];
        $.fn["outer" + name] = function (arg) {
            if (arg != null && (arg.constructor != Boolean || arguments.length > 1)) {
                if (arg.constructor == String) {
                    if (arg == "auto" || arg.match("%")) {
                        return this[name.toLowerCase()](arg);
                    } else {
                        if (arg == "none") {
                            return this.css(name.toLowerCase(), "");
                        }
                    }
                } else {
                    var n = parseInt(arg);
                    if (arguments[1] === true) {
                        n = n - num(this, "padding" + tl) - num(this, "padding" + br) - num(this, "border" + tl + "Width") - num(this, "border" + br + "Width") - num(this, "margin" + tl) - num(this, "margin" + br);
                    } else {
                        n = n - num(this, "padding" + tl) - num(this, "padding" + br) - num(this, "border" + tl + "Width") - num(this, "border" + br + "Width");
                    }
                    return this[name.toLowerCase()](n);
                }
                return this;
            }
            return fn.apply(this, arguments);
        };
    });
    $.each(["Left", "Top", "Right", "Bottom"], function (i, name) {
        $.fn["edge" + name] = function (includeMargin) {
            var n = num(this, "padding" + name) + num(this, "border" + name + "Width");
            if (includeMargin) {
                n += num(this, "margin" + name);
            }
            return n;
        };
    });
    $.fn.edgeWidth = function (includeMargin) {
        return this.edgeLeft(includeMargin) + this.edgeRight(includeMargin);
    };
    $.fn.edgeHeight = function (includeMargin) {
        return this.edgeTop(includeMargin) + this.edgeBottom(includeMargin);
    };
    $.fn.addClassOnHover = function (cls, clsOwner, fn) {
        var clsOwner = clsOwner || this;
        this.hover(function () {
            if ($DomUtils.isDragging()) {
                return;
            }
            if (typeof fn == "function" && !fn.call(this)) {
                return;
            }
            clsOwner.addClass(cls);
        }, function () {
            clsOwner.removeClass(cls);
        });
        return this;
    };
    $.fn.addClassOnFocus = function (cls, clsOwner, fn) {
        var clsOwner = clsOwner || this;
        this.focus(function () {
            if (typeof fn == "function" && !fn.call(this)) {
                return;
            }
            clsOwner.addClass(cls);
        });
        this.blur(function () {
            clsOwner.removeClass(cls);
        });
        return this;
    };
    $.fn.addClassOnClick = function (cls, clsOwner, fn) {
        var clsOwner = clsOwner || this;
        this.mousedown(function () {
            if (typeof fn == "function" && !fn.call(this)) {
                return;
            }
            clsOwner.addClass(cls);
            $(document).one("mouseup", function () {
                clsOwner.removeClass(cls);
            });
        });
        return this;
    };
    $.fn.repeatOnClick = function (fn, interval) {
        this.mousedown(function () {
            var timer;
            if (typeof fn == "function") {
                fn.apply(null, []);
                timer = setInterval(fn, interval || 100);
            }
            $(document).one("mouseup", function () {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            });
        });
        return this;
    };
    var disableMouseWheel = function (event) {
        event.preventDefault();
    };
    $.fn.fullWindow = function (options) {
        var self = this;
        if (self.length == 1) {
            var dom = self[0], containBlock = dom.parentNode, parentsOverflow = [], parentsPositioned = false, parentsPosition = [];
            function doFilter() {
                if (this == document.body || (/(auto|scroll|hidden)/).test(jQuery.css(this, "overflow") + jQuery.css(this, "overflow-y"))) {
                    parentsOverflow.push({parent:this, overflow:jQuery.css(this, "overflow"), overflowY:jQuery.css(this, "overflow-y"), scrollTop:this.scrollTop});
                    var overflowValue = this == document.body ? "hidden" : "visible";
                    var $this = jQuery(this);
                    $this.prop("scrollTop", 0).css({overflow:overflowValue, overflowY:overflowValue});
                    if ($this.mousewheel) {
                        $this.mousewheel(disableMouseWheel);
                    }
                }
                if (!parentsPositioned && dorado.Browser.msie && dorado.Browser.version <= 7) {
                    if (this == document.body || (/(relative|absolute)/).test(jQuery.css(this, "position"))) {
                        if (jQuery.css(this, "z-index") == "") {
                            parentsPosition.push(this);
                            parentsPositioned = true;
                            jQuery(this).css("z-index", 100);
                        }
                    }
                }
            }
            while (containBlock != document.body) {
                if (jQuery(containBlock).css("position") != "static") {
                    break;
                }
                containBlock = containBlock.parentNode;
            }
            options = options || {};
            var docWidth = jQuery(window).width(), docHeight = jQuery(window).height();
            var isAbs = (self.css("position") == "absolute");
            var backupStyle = {position:dom.style.position, left:dom.style.left, top:dom.style.top};
            var poffset = jQuery(containBlock).offset() || {left:0, top:0}, position, left, top;
            self.css({position:"absolute", left:0, top:0});
            position = self.position();
            left = -1 * (poffset.left + position.left);
            top = -1 * (poffset.top + position.top);
            self.parents().filter(doFilter);
            var targetStyle = {position:"absolute", left:left, top:top};
            if (options.modifySize !== false) {
                backupStyle.width = dom.style.width;
                backupStyle.height = dom.style.height;
                targetStyle.width = docWidth;
                targetStyle.height = docHeight;
            }
            jQuery.data(dom, "fullWindow.backupStyle", backupStyle);
            jQuery.data(dom, "fullWindow.parentsOverflow", parentsOverflow);
            jQuery.data(dom, "fullWindow.parentsPosition", parentsPosition);
            jQuery.data(dom, "fullWindow.backupSize", {width:self.outerWidth(), height:self.outerHeight()});
            self.css(targetStyle).bringToFront();
            if (dorado.Browser.msie && dorado.Browser.msie <= 7) {
                jQuery(".d-dialog .button-panel").css("visibility", "hidden");
                jQuery(".d-dialog .dialog-footer").css("visibility", "hidden");
            }
            var callback = options.callback;
            if (callback) {
                callback({width:docWidth, height:docHeight});
            }
        }
        return this;
    };
    $.fn.unfullWindow = function (options) {
        var self = this;
        if (self.length == 1) {
            options = options || {};
            var dom = self[0], callback = options.callback;
            var backupStyle = jQuery.data(dom, "fullWindow.backupStyle"), backupSize = jQuery.data(dom, "fullWindow.backupSize"), parentsOverflow = jQuery.data(dom, "fullWindow.parentsOverflow"), parentsPosition = jQuery.data(dom, "fullWindow.parentsPosition");
            if (backupStyle) {
                self.css(backupStyle);
            }
            if (callback) {
                callback(backupSize);
            }
            if (parentsOverflow) {
                for (var i = 0, j = parentsOverflow.length; i < j; i++) {
                    var parentOverflow = parentsOverflow[i];
                    var $parent = jQuery(parentOverflow.parent);
                    $parent.css({overflow:parentOverflow.overflow, overflowY:parentOverflow.overflowY}).prop("scrollTop", parentOverflow.scrollTop);
                    if ($parent.unmousewhee) {
                        $parent.unmousewheel(disableMouseWheel);
                    }
                }
            }
            if (parentsPosition) {
                for (var i = 0, j = parentsPosition.length; i < j; i++) {
                    var parentPosition = parentsPosition[i];
                    jQuery(parentPosition).css("z-index", "");
                }
            }
            if (dorado.Browser.msie && dorado.Browser.msie <= 7) {
                jQuery(".d-dialog .button-panel").css("visibility", "");
                jQuery(".d-dialog .dialog-footer").css("visibility", "");
            }
            jQuery.data(dom, "fullWindow.backupStyle", null);
            jQuery.data(dom, "fullWindow.backupSize", null);
            jQuery.data(dom, "fullWindow.parentsOverflow", null);
        }
        return this;
    };
    var hashTimerInited = false, storedHash;
    $.fn.hashchange = function (fn) {
        this.bind("hashchange", fn);
        if (!hashTimerInited && jQuery.browser.msie && jQuery.browser.version < 8) {
            hashTimerInited = true;
            var storedHash = window.location.hash;
            window.setInterval(function () {
                if (window.location.hash != storedHash) {
                    storedHash = window.location.hash;
                    $(window).trigger("hashchange");
                }
            }, 100);
        }
    };
})(jQuery);
jQuery.fn.xCreate = function (template, arg, options) {
    var parentEl = this[0];
    var element = $DomUtils.xCreate(template, arg, (options ? options.context : null));
    if (element) {
        var insertBef = false, returnNewElements = false, refNode = null;
        if (options instanceof Object) {
            insertBef = options.insertBefore;
            refNode = (options.refNode) ? options.refNode : parentEl.firstChild;
            returnNewElements = options.returnNewElements;
        }
        var elements = (element instanceof Array) ? element : [element];
        for (var i = 0; i < elements.length; i++) {
            if (insertBef && refNode) {
                parentEl.insertBefore(elements[i], refNode);
            } else {
                parentEl.appendChild(elements[i]);
            }
        }
    }
    return returnNewElements ? jQuery(elements) : this;
};
(function () {
    if (jQuery.Tween) {
        var oldFn = jQuery.Tween.prototype.run;
        jQuery.Tween.prototype.run = function (percent) {
            this.state = percent;
            return oldFn.apply(this, arguments);
        };
    }
    jQuery.fn.region = function () {
        var self = this, element = self[0];
        if (self.length == 1) {
            var position = self.offset(), width = element.offsetWidth, height = element.offsetHeight;
            return {top:position.top, right:position.left + width, left:position.left, bottom:position.top + height, height:height, width:width};
        }
    };
    jQuery.fn.innerRegion = function () {
        var el = this, element = el[0];
        if (el.length == 1) {
            var position = el.offset(), width = el.width(), height = el.height(), borderTop = parseInt(el.css("border-left-width"), 10) || 0, borderLeft = parseInt(el.css("border-top-width"), 10) || 0, paddingLeft = parseInt(el.css("padding-left"), 10) || 0, paddingTop = parseInt(el.css("padding-top"), 10) || 0;
            return {top:position.top + borderLeft + paddingTop, right:position.left + borderTop + paddingLeft + width, left:position.left + borderTop + paddingLeft, bottom:position.top + borderLeft + paddingTop + height, height:height, width:width};
        }
    };
    var propertyMap = {normal:["position", "visibility", "left", "right", "top", "bottom", "width", "height", "zIndex"], safe:["overflow", "position", "width", "height"], child:["position", "left", "right", "top", "bottom", "width", "height"]}, DOCKABLE_STYLE_RESTORE = "dockStyleRestore", DOCK_DATA = "dockData";
    var backupStyle = function (element, type) {
        var props = propertyMap[type || "normal"], object = {};
        if (props) {
            for (var i = 0, j = props.length; i < j; i++) {
                var prop = props[i];
                object[prop] = element.style[prop];
            }
        }
        jQuery.data(element, DOCKABLE_STYLE_RESTORE, object);
    };
    var ratioMap = {top:1, bottom:-1, left:1, right:-1}, dockStyleMap = {top:{horizontal:"left", vertical:"top", style:{left:0, top:0, right:"auto", bottom:"auto"}}, bottom:{horizontal:"left", vertical:"bottom", style:{left:0, top:"auto", right:"auto", bottom:0}}, left:{horizontal:"left", vertical:"top", style:{left:0, top:0, right:"auto", bottom:"auto"}}, right:{horizontal:"right", vertical:"top", style:{left:"auto", top:0, right:0, bottom:"auto"}}};
    jQuery.fn.dockable = function (direction, safe, showMask) {
        var self = this;
        if (self.length == 1) {
            direction = direction || "bottom";
            var element = self[0], absolute = (self.css("position") == "absolute"), leftStart = absolute ? parseInt(self.css("left"), 10) || 0 : 0, topStart = absolute ? parseInt(self.css("top"), 10) || 0 : 0;
            backupStyle(element, safe ? "safe" : "normal");
            self.css({visibility:"hidden", display:"block"});
            var dockConfig = dockStyleMap[direction], hori = dockConfig.horizontal, vert = dockConfig.vertical, rect = {width:self.outerWidth(), height:self.outerHeight()}, wrap, mask;
            if (safe) {
                var horiRatio = ratioMap[hori], vertRatio = ratioMap[vert], parentRegion = self.innerRegion(), child = element.firstChild, region, childStyle = {}, childEl;
                while (child) {
                    childEl = jQuery(child);
                    backupStyle(child, "child");
                    region = childEl.region();
                    childStyle[hori] = horiRatio * (region[hori] - parentRegion[hori]);
                    childStyle[vert] = vertRatio * (region[vert] - parentRegion[vert]);
                    childEl.css(childStyle).outerWidth(child.offsetWidth).outerHeight(child.offsetHeight);
                    child = child.nextSibling;
                }
                if (absolute) {
                    self.outerWidth(rect.width).outerHeight(rect.height).css({overflow:"hidden", visibility:""}).find("> *").css("position", "absolute");
                } else {
                    self.css({overflow:"hidden", position:"relative", visibility:""}).find("> *").css("position", "absolute");
                }
            } else {
                wrap = document.createElement("div");
                var wrapEl = jQuery(wrap);
                if (absolute) {
                    wrap.style.position = "absolute";
                    wrap.style.left = self.css("left");
                    wrap.style.top = self.css("top");
                    wrapEl.bringToFront();
                } else {
                    wrap.style.position = "relative";
                    element.style.position = "absolute";
                }
                wrap.style.overflow = "hidden";
                wrapEl.insertBefore(element);
                wrap.appendChild(element);
                var style = dockConfig.style;
                style.visibility = "";
                self.css(style).outerWidth(rect.width).outerHeight(rect.height);
            }
            if (showMask !== false) {
                mask = document.createElement("div");
                var maskEl = jQuery(mask);
                maskEl.css({position:"absolute", left:0, top:0, background:"white", opacity:0}).bringToFront().outerWidth(rect.width).outerHeight(rect.height);
                if (safe) {
                    element.appendChild(mask);
                } else {
                    wrap.appendChild(mask);
                }
            }
            jQuery.data(element, DOCK_DATA, {rect:rect, mask:mask, wrap:wrap, leftStart:leftStart, topStart:topStart});
        }
        return this;
    };
    jQuery.fn.undockable = function (safe) {
        var self = this;
        if (self.length == 1) {
            var element = self[0], dockData = jQuery.data(element, DOCK_DATA);
            if (dockData == null) {
                return;
            }
            if (safe) {
                self.css(jQuery.data(element, DOCKABLE_STYLE_RESTORE)).find("> *").each(function (index, child) {
                    var style = jQuery.data(child, DOCKABLE_STYLE_RESTORE);
                    if (style != null) {
                        jQuery(child).css(style);
                    }
                    jQuery.data(child, DOCKABLE_STYLE_RESTORE, null);
                });
                jQuery(dockData.mask).remove();
            } else {
                var wrap = dockData.wrap;
                if (wrap) {
                    self.css(jQuery.data(element, DOCKABLE_STYLE_RESTORE)).insertAfter(wrap);
                    jQuery(wrap).remove();
                }
            }
            jQuery.data(element, DOCK_DATA, null);
            jQuery.data(element, DOCKABLE_STYLE_RESTORE, null);
        }
        return this;
    };
    var slideInDockDirMap = {l2r:"right", r2l:"left", t2b:"bottom", b2t:"top"}, slideOutDockDirMap = {l2r:"left", r2l:"right", t2b:"top", b2t:"bottom"}, slideSizeMap = {l2r:"height", r2l:"height", t2b:"width", b2t:"width"};
    var getAnimateConfig = function (type, direction, element, safe) {
        var dockData = jQuery.data(element, DOCK_DATA), rect = dockData.rect, leftStart = dockData.leftStart, topStart = dockData.topStart;
        if (safe) {
            if (type == "out") {
                switch (direction) {
                  case "t2b":
                    return {top:[topStart, topStart + rect.height], height:[rect.height, 0]};
                  case "r2l":
                    return {width:[rect.width, 0]};
                  case "b2t":
                    return {height:[rect.height, 0]};
                  case "l2r":
                    return {left:[leftStart, leftStart + rect.width], width:[rect.width, 0]};
                }
            } else {
                switch (direction) {
                  case "t2b":
                    return {height:[0, rect.height]};
                  case "l2r":
                    return {width:[0, rect.width]};
                  case "b2t":
                    return {top:[topStart + rect.height, topStart], height:[0, rect.height]};
                  case "r2l":
                    return {left:[leftStart + rect.width, leftStart], width:[0, rect.width]};
                }
            }
        } else {
            var property = slideSizeMap[direction];
            jQuery(dockData.wrap).css(property, dockData.rect[property]);
            if (type == "in") {
                switch (direction) {
                  case "t2b":
                    return {height:[0, rect.height]};
                  case "l2r":
                    return {width:[0, rect.width]};
                  case "b2t":
                    return {top:[topStart + rect.height, topStart], height:[0, rect.height]};
                  case "r2l":
                    return {left:[leftStart + rect.width, leftStart], width:[0, rect.width]};
                }
            } else {
                if (type == "out") {
                    switch (direction) {
                      case "t2b":
                        return {top:[topStart, topStart + rect.height], height:[rect.height, 0]};
                      case "r2l":
                        return {width:[rect.width, 0]};
                      case "b2t":
                        return {height:[rect.height, 0]};
                      case "l2r":
                        return {left:[leftStart, leftStart + rect.width], width:[rect.width, 0]};
                    }
                }
            }
        }
    };
    var slide = function (type, element, options, safe) {
        options = typeof options == "string" ? {direction:options} : options || {};
        var direction = options.direction || "t2b", callback = options.complete, step = options.step, start = options.start, animConfig, animElement = element, animEl, delayFunc, inited = false;
        delayFunc = function (direction) {
            if (start) {
                if (type == "in") {
                    $fly(element).css("display", "");
                }
                start.call(element);
            }
            $fly(element).dockable(type == "in" ? slideInDockDirMap[direction] : slideOutDockDirMap[direction], safe);
            animConfig = getAnimateConfig(type, direction, element, safe);
            animEl = jQuery(safe ? animElement : jQuery.data(element, DOCK_DATA).wrap);
            for (var prop in animConfig) {
                var value = animConfig[prop];
                animEl.css(prop, value[0]);
            }
            inited = true;
        };
        options.step = function (now, animate) {
            if (!inited) {
                delayFunc(direction);
            }
            var defaultEasing = animate.options.easing || (jQuery.easing.swing ? "swing" : "linear"), pos = jQuery.easing[defaultEasing](animate.state, animate.options.duration * animate.state, 0, 1, animate.options.duration);
            var nowStyle = {};
            for (var prop in animConfig) {
                var range = animConfig[prop];
                nowStyle[prop] = Math.round(range[0] + (range[1] - range[0]) * pos);
            }
            animEl.css(nowStyle);
            if (step) {
                step.call(animate.elem, nowStyle, animate);
            }
        };
        options.complete = function () {
            $fly(element).undockable(safe);
            $fly(element).css("display", type == "out" ? "none" : "");
            if (typeof callback == "function") {
                callback.apply(null, []);
            }
        };
        options.duration = options.duration ? options.duration : 300;
        $fly(element).animate({dummy:1}, options);
    };
    jQuery.fn.slideIn = function (options) {
        var self = this;
        if (self.length == 1) {
            slide("in", self[0], options, false);
        }
        return this;
    };
    jQuery.fn.slideOut = function (options) {
        var self = this;
        if (self.length == 1) {
            slide("out", self[0], options, false);
        }
        return this;
    };
    jQuery.fn.safeSlideIn = function (options) {
        var self = this;
        if (self.length == 1) {
            slide("in", self[0], options, true);
        }
        return this;
    };
    jQuery.fn.safeSlideOut = function (options) {
        var self = this;
        if (self.length == 1) {
            slide("out", self[0], options, true);
        }
        return this;
    };
    var zoomCoverPool = new dorado.util.ObjectPool({makeObject:function () {
        var cover = document.createElement("div");
        cover.className = "i-animate-zoom-proxy d-animate-zoom-proxy";
        jQuery(document.body).append(cover);
        return cover;
    }});
    var zoom = function (type, element, options) {
        var position = options.position, animTarget = options.animateTarget, startLeft, startTop, endLeft, endTop, offset, isTypeIn = (type != "out"), elWidth, elHeight;
        if (position) {
            var oldLeft = element.style.left, oldTop = element.style.top;
            position = $fly(element).css(position).offset();
            $fly(element).css({"left":oldLeft || "", "top":oldTop || ""});
        }
        if (typeof animTarget == "string") {
            animTarget = jQuery(animTarget)[0];
        } else {
            if (animTarget instanceof dorado.widget.Control) {
                animTarget = animTarget._dom;
            }
        }
        var elementEl = jQuery(element), animTargetEl = jQuery(animTarget);
        if (type == "in") {
            if (animTarget) {
                offset = animTargetEl.offset();
                startTop = offset.top;
                startLeft = offset.left;
                endTop = position.top;
                endLeft = position.left;
            } else {
                offset = elementEl.offset();
                elWidth = elementEl.outerWidth();
                elHeight = elementEl.outerHeight();
                startTop = offset.top + elHeight / 2;
                startLeft = offset.left + elWidth / 2;
                endTop = position.top;
                endLeft = position.left;
            }
        } else {
            if (animTarget) {
                offset = animTargetEl.offset();
                if (!position) {
                    position = elementEl.offset();
                }
                startTop = position.top;
                startLeft = position.left;
                endTop = offset.top;
                endLeft = offset.left;
            } else {
                offset = elementEl.offset();
                elWidth = elementEl.outerWidth();
                elHeight = elementEl.outerHeight();
                startTop = offset.top;
                startLeft = offset.left;
                endTop = offset.top + elHeight / 2;
                endLeft = offset.left + elWidth / 2;
            }
        }
        var cover = zoomCoverPool.borrowObject();
        jQuery(cover).css({display:"", top:startTop, left:startLeft, width:isTypeIn ? 0 : elementEl.width(), height:isTypeIn ? 0 : elementEl.height()}).bringToFront().animate({top:endTop, left:endLeft, width:isTypeIn ? elementEl.width() : 0, height:isTypeIn ? elementEl.height() : 0}, {duration:options.animateDuration || 300, easing:options.animateEasing, complete:function () {
            cover.style.display = "none";
            zoomCoverPool.returnObject(cover);
            options.complete.apply(null, []);
        }});
    };
    jQuery.fn.zoomIn = function (options) {
        var self = this;
        if (self.length == 1) {
            zoom("in", self[0], options);
        }
        return this;
    };
    jQuery.fn.zoomOut = function (options) {
        var self = this;
        if (self.length == 1) {
            zoom("out", self[0], options);
        }
        return this;
    };
    var isFunction = function (value) {
        return ({}).toString.call(value) == "[object Function]";
    };
    var vendor = (/webkit/i).test(navigator.appVersion) ? "webkit" : (/firefox/i).test(navigator.userAgent) ? "moz" : (/trident/i).test(navigator.userAgent) ? "ms" : "opera" in window ? "o" : "", cssVendor = "-" + vendor + "-", TRANSITION = cssVendor + "transition", TRANSFORM = cssVendor + "transform", TRANSFORMORIGIN = cssVendor + "transform-origin", BACKFACEVISIBILITY = cssVendor + "backface-visibility";
    var transitionEnd = "transitionEnd";
    if (jQuery.browser.webkit) {
        transitionEnd = "webkitTransitionEnd";
    } else {
        if (jQuery.browser.msie) {
            transitionEnd = "msTransitionEnd";
        } else {
            if (jQuery.browser.mozilla) {
                transitionEnd = "transitionend";
            } else {
                if (jQuery.browser.opera) {
                    transitionEnd = "oTransitionEnd";
                }
            }
        }
    }
    jQuery.fn.anim = function (properties, duration, ease, callback) {
        var transforms = [], opacity, key, callbackCalled = false;
        for (key in properties) {
            if (key === "opacity") {
                opacity = properties[key];
            } else {
                transforms.push(key + "(" + properties[key] + ")");
            }
        }
        var invokeCallback = function () {
            if (!callbackCalled) {
                callback();
                callbackCalled = true;
            }
        };
        if (parseFloat(duration) !== 0 && isFunction(callback)) {
            this.one(transitionEnd, invokeCallback);
            setTimeout(invokeCallback, duration * 1000 + 50);
        } else {
            setTimeout(callback, 0);
        }
        return this.css({opacity:opacity}).css(TRANSITION, "all " + (duration !== undefined ? duration : 0.5) + "s " + (ease || "")).css(TRANSFORM, transforms.join(" "));
    };
    var modernZoom = function (type, el, options) {
        if (!el) {
            return;
        }
        options = options || {};
        var position = options.position, animTarget = options.animateTarget, startLeft, startTop, endLeft, endTop, offset;
        if (typeof animTarget == "string") {
            animTarget = jQuery(animTarget)[0];
        } else {
            if (animTarget instanceof dorado.widget.Control) {
                animTarget = animTarget._dom;
            }
        }
        var elementEl = jQuery(el), animTargetEl = jQuery(animTarget);
        if (type == "in") {
            if (animTarget) {
                offset = animTargetEl.offset();
                startTop = offset.top;
                startLeft = offset.left;
                endTop = position.top;
                endLeft = position.left;
            }
        } else {
            if (animTarget) {
                offset = animTargetEl.offset();
                if (!position) {
                    position = elementEl.offset();
                }
                startTop = position.top;
                startLeft = position.left;
                endTop = offset.top;
                endLeft = offset.left;
            }
        }
        var fromScale = 1, toScale = 1;
        if (type == "out") {
            toScale = 0.01;
        } else {
            fromScale = 0.01;
        }
        if (animTarget) {
            $(el).css({left:startLeft, top:startTop}).css(TRANSFORM, "scale(" + fromScale + ")").css(TRANSFORMORIGIN, "0 0");
        } else {
            $(el).css(TRANSFORM, "scale(" + fromScale + ")").css(TRANSFORMORIGIN, "50% 50%");
        }
        var callback = function () {
            if (options.complete) {
                options.complete.apply(null, []);
            }
            $(el).css(TRANSITION, "").css(TRANSFORMORIGIN, "").css(TRANSFORM, "");
        };
        if (animTarget) {
            setTimeout(function () {
                $(el).anim({}, options.animateDuration ? options.animateDuration / 1000 : 0.3, "ease-in-out", callback).css({left:endLeft, top:endTop}).css(TRANSFORM, "scale(" + toScale + ")").css(TRANSFORMORIGIN, "0 0");
            }, 5);
        } else {
            setTimeout(function () {
                $(el).anim({}, options.animateDuration ? options.animateDuration / 1000 : 0.3, "ease-in-out", callback).css(TRANSFORM, "scale(" + toScale + ")").css(TRANSFORMORIGIN, "50% 50%");
            }, 5);
        }
    };
    var flip = function (type, el, options) {
        if (!el) {
            return;
        }
        options = options || {};
        var callback = function () {
            if (options.complete) {
                options.complete.apply(null, []);
            }
            $(el).css(TRANSITION, "").css(TRANSFORMORIGIN, "").css(TRANSFORM, "").css(BACKFACEVISIBILITY, "");
        };
        var rotateProp = "Y", fromScale = 1, toScale = 1, fromRotate = 0, toRotate = 0;
        if (type == "out") {
            toRotate = -180;
            toScale = 0.8;
        } else {
            fromRotate = 180;
            fromScale = 0.8;
        }
        if (options.direction == "up" || options.direction == "down") {
            rotateProp = "X";
        }
        if (options.direction == "right" || options.direction == "left") {
            toRotate *= -1;
            fromRotate *= -1;
        }
        $(el).css(TRANSFORM, "rotate" + rotateProp + "(" + fromRotate + "deg) scale(" + fromScale + ")").css(BACKFACEVISIBILITY, "hidden");
        setTimeout(function () {
            $(el).anim({}, options.animateDuration ? options.animateDuration / 1000 : 0.3, "linear", callback).css(TRANSFORM, "rotate" + rotateProp + "(" + toRotate + "deg) scale(" + toScale + ")").css(BACKFACEVISIBILITY, "hidden");
        }, 5);
    };
    jQuery.fn.modernZoomIn = function (options) {
        var self = this;
        if (self.length == 1) {
            modernZoom("in", self[0], options);
        }
        return this;
    };
    jQuery.fn.modernZoomOut = function (options) {
        var self = this;
        if (self.length == 1) {
            modernZoom("out", self[0], options);
        }
        return this;
    };
    jQuery.fn.flipIn = function (options) {
        var self = this;
        if (self.length == 1) {
            options.direction = "left";
            flip("in", self[0], options);
        }
        return this;
    };
    jQuery.fn.flipOut = function (options) {
        var self = this;
        if (self.length == 1) {
            options.direction = "right";
            flip("out", self[0], options);
        }
        return this;
    };
    var getWin = function (elem) {
        return (elem && ("scrollTo" in elem) && elem["document"]) ? elem : elem && elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : elem === undefined ? window : false;
    }, SCROLL_TO = "scrollTo", DOCUMENT = "document";
    jQuery.fn.scrollIntoView = function (container, top, hscroll) {
        var self = this, elem;
        if (self.length == 1) {
            elem = self[0];
        }
        container = typeof container == "string" ? jQuery(container)[0] : container;
        hscroll = hscroll === undefined ? true : !!hscroll;
        top = top === undefined ? true : !!top;
        if (!container || container === window) {
            return elem.scrollIntoView(top);
        }
        if (container && container.nodeType == 9) {
            container = getWin(container);
        }
        var isWin = container && (SCROLL_TO in container) && container[DOCUMENT], elemOffset = self.offset(), containerOffset = isWin ? {left:jQuery(container).scrollLeft(), top:jQuery(container).scrollTop()} : jQuery(container).offset(), diff = {left:elemOffset["left"] - containerOffset["left"], top:elemOffset["top"] - containerOffset["top"]}, ch = isWin ? jQuery(window).height() : container.clientHeight, cw = isWin ? jQuery(window).width() : container.clientWidth, cl = jQuery(container).scrollLeft(), ct = jQuery(container).scrollTop(), cr = cl + cw, cb = ct + ch, eh = elem.offsetHeight, ew = elem.offsetWidth, l = diff.left + cl - (parseInt(jQuery(container).css("borderLeftWidth")) || 0), t = diff.top + ct - (parseInt(jQuery(container).css("borderTopWidth")) || 0), r = l + ew, b = t + eh, t2, l2;
        if (eh > ch || t < ct || top) {
            t2 = t;
        } else {
            if (b > cb) {
                t2 = b - ch;
            }
        }
        if (hscroll) {
            if (ew > cw || l < cl || top) {
                l2 = l;
            } else {
                if (r > cr) {
                    l2 = r - cw;
                }
            }
        }
        if (isWin) {
            if (t2 !== undefined || l2 !== undefined) {
                container[SCROLL_TO](l2, t2);
            }
        } else {
            if (t2 !== undefined) {
                container["scrollTop"] = t2;
            }
            if (l2 !== undefined) {
                container["scrollLeft"] = l2;
            }
        }
    };
})();
(function ($) {
    var oldDraggable = $.fn.draggable;
    $.fn.draggable = function (options) {
        var draggingInfo, doradoDraggable;
        if (options) {
            draggingInfo = options.draggingInfo;
            doradoDraggable = options.doradoDraggable;
        }
        if (draggingInfo || doradoDraggable) {
            var originOptions = options;
            options = dorado.Object.apply({}, originOptions);
            options.createDraggingInfo = function (evt) {
                var draggingInfo = originOptions.draggingInfo;
                if (typeof draggingInfo == "function") {
                    draggingInfo = draggingInfo.call(this, this, options);
                }
                if (!draggingInfo) {
                    if (doradoDraggable) {
                        draggingInfo = doradoDraggable.createDraggingInfo(this, options);
                    }
                    if (!draggingInfo) {
                        draggingInfo = new dorado.DraggingInfo();
                    }
                }
                if (draggingInfo) {
                    draggingInfo.set("element", this);
                }
                return draggingInfo;
            };
            if (typeof originOptions.revert != "string") {
                options.revert = function (dropped) {
                    var revert = originOptions.revert;
                    if (revert == null) {
                        revert = !dropped;
                    } else {
                        if (typeof revert == "function") {
                            revert = revert.call(this, dropped);
                        }
                    }
                    return revert;
                };
            }
            if (typeof originOptions.helper != "string") {
                options.helper = function (evt) {
                    var helper;
                    if (typeof originOptions.helper == "function") {
                        helper = originOptions.helper.apply(this, arguments);
                    }
                    if (doradoDraggable) {
                        helper = doradoDraggable.onGetDraggingIndicator(helper, evt, this);
                    }
                    var draggingInfo = options.createDraggingInfo.call(this, evt);
                    $fly(this).data("ui-draggable").draggingInfo = draggingInfo;
                    if (helper instanceof dorado.DraggingIndicator) {
                        draggingInfo.set("indicator", helper);
                        helper = helper.getDom();
                    }
                    return helper;
                };
            }
            options.start = function (evt, ui) {
                var b = true;
                if (originOptions.start) {
                    b = originOptions.start.apply(this, arguments);
                }
                if (b !== false) {
                    var draggingInfo = dorado.DraggingInfo.getFromElement(this);
                    if (draggingInfo) {
                        draggingInfo._targetDroppables = [];
                        if (doradoDraggable) {
                            b = doradoDraggable.onDragStart(draggingInfo, evt);
                            if (b !== false) {
                                doradoDraggable.initDraggingInfo(draggingInfo, evt);
                                var indicator = draggingInfo.get("indicator");
                                if (indicator) {
                                    doradoDraggable.initDraggingIndicator(indicator, draggingInfo, evt);
                                }
                            }
                        }
                    }
                }
                return b;
            };
            options.stop = function (evt, ui) {
                var b = true;
                if (originOptions.stop) {
                    b = originOptions.stop.apply(this, arguments);
                }
                if (b !== false) {
                    var draggingInfo = dorado.DraggingInfo.getFromElement(this);
                    if (draggingInfo) {
                        if (doradoDraggable) {
                            b = doradoDraggable.onDragStop(draggingInfo, evt);
                        }
                        if (b !== false) {
                            setTimeout(function () {
                                var targetDroppable = draggingInfo._targetDroppables.peek();
                                if (targetDroppable) {
                                    targetDroppable.onDraggingSourceOut(draggingInfo, evt);
                                }
                            }, 20);
                        }
                    }
                }
                return b;
            };
            options.drag = function (evt, ui) {
                if (originOptions.drag) {
                    originOptions.drag.apply(this, arguments);
                }
                var draggingInfo = dorado.DraggingInfo.getFromElement(this);
                if (draggingInfo) {
                    if (doradoDraggable) {
                        doradoDraggable.onDragMove(draggingInfo, evt);
                    }
                    var targetDroppable = draggingInfo._targetDroppables.peek();
                    if (targetDroppable) {
                        targetDroppable.onDraggingSourceMove(draggingInfo, evt);
                    }
                }
            };
        }
        return oldDraggable.apply(this, arguments);
    };
    var oldDroppable = $.fn.droppable;
    $.fn.droppable = function (options) {
        var doradoDroppable = options ? options.doradoDroppable : null;
        if (doradoDroppable) {
            var originOptions = options;
            options = dorado.Object.apply({}, originOptions);
            options.over = function (evt, ui) {
                if (originOptions.over) {
                    originOptions.over.apply(this, arguments);
                }
                if (doradoDroppable) {
                    var draggingInfo = dorado.DraggingInfo.getFromJQueryUI(ui);
                    if (draggingInfo) {
                        if (draggingInfo._targetDroppables.peek() != doradoDroppable) {
                            draggingInfo._targetDroppables.push(doradoDroppable);
                        }
                        doradoDroppable.onDraggingSourceOver(draggingInfo, evt);
                    }
                }
            };
            options.out = function (evt, ui) {
                if (originOptions.out) {
                    originOptions.out.apply(this, arguments);
                }
                if (doradoDroppable) {
                    var draggingInfo = dorado.DraggingInfo.getFromJQueryUI(ui);
                    if (draggingInfo) {
                        doradoDroppable.onDraggingSourceOut(draggingInfo, evt);
                        if (draggingInfo._targetDroppables.peek() == doradoDroppable) {
                            draggingInfo._targetDroppables.pop();
                        }
                    }
                }
            };
            options.drop = function (evt, ui) {
                var draggable = jQuery(ui.draggable).data("ui-draggable");
                if (!jQuery.ui.ddmanager.accept) {
                    if (draggable && draggable.options.revert == "invalid") {
                        draggable.options.revert = true;
                        draggable.options.forceRevert = true;
                    }
                    return false;
                } else {
                    if (draggable && draggable.options.forceRevert) {
                        draggable.options.revert = "invalid";
                        draggable.options.forceRevert = false;
                    }
                    var dropped = false;
                    if (originOptions.drop) {
                        dropped = originOptions.drop.apply(this, arguments);
                    }
                    if (!dropped && doradoDroppable) {
                        var draggingInfo = dorado.DraggingInfo.getFromJQueryUI(ui);
                        if (draggingInfo) {
                            setTimeout(function () {
                                if (doradoDroppable.beforeDraggingSourceDrop(draggingInfo, evt)) {
                                    doradoDroppable.onDraggingSourceDrop(draggingInfo, evt);
                                }
                            }, 20);
                        }
                    }
                    return true;
                }
            };
            options.accept = function (draggable) {
                var accept = originOptions.accept;
                if (accept) {
                    if (typeof accept == "function") {
                        accept = accept.apply(this, arguments);
                    } else {
                        accept = draggable.is(accept);
                    }
                }
                return !!accept;
            };
        }
        return oldDroppable.call(this, options);
    };
    if (dorado.Browser.chrome || dorado.Browser.safari) {
        jQuery.ui.draggable.prototype.options.userSelectFix = true;
        $.ui.plugin.add("draggable", "userSelectFix", {start:function (evt, ui) {
            $DomUtils.disableUserSelection(document.body);
        }, stop:function (evt, ui) {
            $DomUtils.enableUserSelection(document.body);
        }});
    }
    jQuery.ui.draggable.prototype.options.iframeFix = true;
})(jQuery);
dorado.Renderer = $class({$className:"dorado.Renderer", render:function (dom, arg) {
}});
dorado.Renderer.NONE_RENDERER = new dorado.Renderer();
dorado.Renderer.render = function (renderer, dom, arg) {
    if (renderer instanceof dorado.Renderer) {
        renderer.render(dom, arg);
    } else {
        if (typeof renderer == "function") {
            renderer(dom, arg);
        }
    }
};
dorado.RenderableElement = $extend(dorado.AttributeSupport, {$className:"dorado.RenderableElement", _ignoreRefresh:0, ATTRIBUTES:{className:{writeBeforeReady:true}, exClassName:{skipRefresh:true, setter:function (v) {
    if (this._rendered && this._exClassName) {
        $fly(this.getDom()).removeClass(this._exClassName);
    }
    this._exClassName = v;
    if (this._rendered && v) {
        $fly(this.getDom()).addClass(v);
    }
}}, width:{setter:function (v) {
    this._width = isFinite(v) ? parseInt(v) : v;
}}, height:{setter:function (v) {
    this._height = isFinite(v) ? parseInt(v) : v;
}}, style:{setter:function (v) {
    if (typeof v == "string" || !this._style) {
        this._style = v;
    } else {
        if (v) {
            dorado.Object.apply(this._style, v);
        }
    }
}}, rendered:{readOnly:true}}, destroy:function () {
    var dom = this._dom;
    if (dom) {
        delete this._dom;
        if (dorado.windowClosed) {
            $fly(dom).unbind();
        } else {
            $fly(dom).remove();
        }
    }
    $invokeSuper.call(this);
}, doSet:function (attr, value) {
    $invokeSuper.call(this, [attr, value]);
    var def = this.ATTRIBUTES[attr];
    if (this._rendered && this._ignoreRefresh < 1 && def && !def.skipRefresh) {
        dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", this.refresh, 50);
    }
}, createDom:function () {
    return document.createElement("DIV");
}, refreshDom:function (dom) {
    if (dom.nodeType != 3) {
        this.applyStyle(dom);
        this.resetDimension();
    }
}, resetDimension:function (forced) {
    var dom = this.getDom(), $dom = $fly(dom), changed = false;
    var width = this.getRealWidth();
    var height = this.getRealHeight();
    if (forced || width && this._currentWidth != width) {
        if (width < 0) {
            this._currentWidth = null;
            dom.style.width = "";
        } else {
            this._currentWidth = width;
            if (this._useInnerWidth) {
                $dom.width(width);
            } else {
                $dom.outerWidth(width);
            }
        }
        changed = true;
    }
    if (forced || height && this._currentHeight != height) {
        if (height < 0) {
            this._currentHeight = null;
            dom.style.height = "";
        } else {
            this._currentHeight = height;
            if (this._useInnerHeight) {
                $dom.height(height);
            } else {
                $dom.outerHeight(height);
            }
        }
        changed = true;
    }
    return changed;
}, getRealWidth:function () {
    return (this._realWidth == null) ? this._width : this._realWidth;
}, getRealHeight:function () {
    return (this._realHeight == null) ? this._height : this._realHeight;
}, applyStyle:function (dom) {
    if (this._style) {
        var style = this._style;
        if (typeof this._style == "string") {
            var map = {};
            jQuery.each(style.split(";"), function (i, section) {
                var i = section.indexOf(":");
                if (i > 0) {
                    var attr = jQuery.trim(section.substring(0, i));
                    var value = jQuery.trim(section.substring(i + 1));
                    if (dorado.Browser.msie && attr.toLowerCase() == "filter") {
                        dom.style.filter = value;
                    } else {
                        map[attr] = value;
                    }
                }
            });
            style = map;
        }
        $fly(dom).css(style);
        delete this._style;
    }
}, getDom:function () {
    if (!this._dom) {
        this._dom = this.createDom();
        var $dom = $fly(this._dom);
        var className = (this._inherentClassName) ? this._inherentClassName : "";
        if (this._className) {
            className += (" " + this._className);
        }
        if (this._exClassName) {
            className += (" " + this._exClassName);
        }
        if (className) {
            $dom.addClass(className);
        }
        this.applyStyle(this._dom);
    }
    return this._dom;
}, doRenderToOrReplace:function (replace, element, nextChildElement) {
    var dom = this.getDom();
    if (!dom) {
        return;
    }
    if (replace) {
        if (!element.parentNode) {
            return;
        }
        element.parentNode.replaceChild(dom, element);
    } else {
        if (!element) {
            element = document.body;
        }
        if (dom.parentNode != element || (nextChildElement && dom.nextSibling != nextChildElement)) {
            if (nextChildElement) {
                element.insertBefore(dom, nextChildElement);
            } else {
                element.appendChild(dom);
            }
        }
    }
    this.refreshDom(dom);
    this._rendered = true;
}, render:function (containerElement, nextChildElement) {
    this.doRenderToOrReplace(false, containerElement, nextChildElement);
}, replace:function (elmenent) {
    this.doRenderToOrReplace(true, elmenent);
}, unrender:function () {
    var dom = this.getDom();
    if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom);
    }
}, refresh:function (delay) {
    if (!this._rendered) {
        return;
    }
    if (delay) {
        dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", function () {
            dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
            this.refreshDom(this.getDom());
        }, 50);
    } else {
        dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
        this.refreshDom(this.getDom());
    }
}});
dorado.TagManager = {_map:{}, _register:function (tag, object) {
    if (!object._id) {
        object._id = dorado.Core.newId();
    }
    var info = this._map[tag];
    if (info) {
        if (!info.idMap[object._id]) {
            info.list.push(object);
            info.idMap[object._id] = object;
        }
    } else {
        this._map[tag] = info = {list:[object], idMap:{}};
        info.idMap[object._id] = object;
    }
}, _unregister:function (tag, object) {
    var info = this._map[tag];
    if (info) {
        if (info.idMap[object._id]) {
            delete info.idMap[object._id];
            info.list.remove(object);
        }
    }
}, _regOrUnreg:function (object, remove) {
    var tags = object._tags;
    if (tags) {
        if (typeof tags == "string") {
            tags = tags.split(",");
        }
        if (tags instanceof Array) {
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                if (typeof tag == "string" && tag.length > 0) {
                    remove ? this._unregister(tag, object) : this._register(tag, object);
                }
            }
        }
    }
}, register:function (object) {
    this._regOrUnreg(object);
}, unregister:function (object) {
    this._regOrUnreg(object, true);
}, find:function (tags) {
    var info = this._map[tags];
    return new dorado.ObjectGroup(info ? info.list : null);
}};
dorado.ObjectGroup = $class({constructor:function (objects) {
    if (objects && !(objects instanceof Array)) {
        objects = [objects];
    }
    this.objects = objects || [];
}, set:function (attr, value) {
    if (!this.objects) {
        return;
    }
    for (var i = 0; i < this.objects.length; i++) {
        var object = this.objects[i];
        if (object) {
            object.set(attr, value, true);
        }
    }
    return this;
}, get:function (attr) {
    var attrs = attr.split("."), objects = this.objects;
    for (var i = 0; i < attrs.length; i++) {
        var a = attrs[i], results = [];
        for (var j = 0; j < objects.length; j++) {
            var object = objects[j], result;
            if (!object) {
                continue;
            }
            if (typeof object.get == "function") {
                result = object.get(a);
            } else {
                result = object[a];
            }
            if (result != null) {
                results.push(result);
            }
        }
        objects = results;
    }
    return new dorado.ObjectGroup(objects);
}, addListener:function (name, listener, options) {
    return this.bind(name, listener, options);
}, removeListener:function (name, listener) {
    return this.unbind(name, listener);
}, bind:function (name, listener, options) {
    if (!this.objects) {
        return;
    }
    for (var i = 0; i < this.objects.length; i++) {
        var object = this.objects[i];
        if (object && typeof object.bind == "function") {
            object.bind(name, listener, options);
        }
    }
}, unbind:function (name, listener) {
    if (!this.objects) {
        return;
    }
    for (var i = 0; i < this.objects.length; i++) {
        var object = this.objects[i];
        if (object && object.unbind) {
            object.unbind(name, listener);
        }
    }
}, invoke:function (methodName) {
    if (!this.objects) {
        return;
    }
    for (var i = 0; i < this.objects.length; i++) {
        var object = this.objects[i];
        if (object) {
            var method = object[methodName];
            if (typeof method == "function") {
                method.apply(object, Array.prototype.slice.call(arguments, 1));
            }
        }
    }
}, each:function (callback) {
    if (!this.objects) {
        return;
    }
    this.objects.each(callback);
}});
window.$group = function () {
    return new dorado.ObjectGroup(Array.prototype.slice.call(arguments));
};
window.$tag = function (tags) {
    return dorado.TagManager.find(tags);
};
dorado.Toolkits = {typesRegistry:{}, typeTranslators:{}, registerPrototype:function (namespace, name, constr) {
    function register(namespace, name, constr) {
        this.typesRegistry[namespace + "." + name] = constr;
    }
    if (typeof name == "object") {
        for (var p in name) {
            if (name.hasOwnProperty(p)) {
                register.call(this, namespace, p, name[p]);
            }
        }
    } else {
        register.call(this, namespace, name, constr);
    }
}, registerTypeTranslator:function (namespace, typeTranslator) {
    this.typeTranslators[namespace] = typeTranslator;
}, getPrototype:function (namespace, name) {
    var ns = namespace.split(",");
    for (var i = 0; i < ns.length; i++) {
        var n = ns[i], constr = this.typesRegistry[n + "." + (name || "Default")];
        if (!constr) {
            var typeTranslator = this.typeTranslators[n];
            if (typeTranslator && typeof typeTranslator == "function") {
                constr = typeTranslator(name);
            }
        }
        if (constr) {
            return constr;
        }
    }
}, createInstance:function (namespace, config, typeTranslator) {
    var type;
    if (typeof config == "string") {
        type = config;
        config = null;
    } else {
        type = config ? config.$type : undefined;
    }
    var constr = this.getPrototype(namespace, type);
    if (!constr) {
        if (typeTranslator && typeTranslator.constructor == String) {
            type = typeTranslator;
        }
        if (!constr) {
            if (typeTranslator && typeof typeTranslator == "function") {
                constr = typeTranslator(type);
            }
            if (!constr) {
                if (type) {
                    constr = dorado.util.Common.getClassType(type);
                } else {
                    throw new dorado.ResourceException("dorado.core.TypeUndefined");
                }
            }
        }
        if (constr && type) {
            this.registerPrototype(namespace, type, constr);
        }
    }
    if (!constr) {
        throw new dorado.ResourceException("dorado.core.UnknownType", type);
    }
    return new constr(config);
}, setDelayedAction:function (owner, actionId, fn, timeMillis) {
    actionId = actionId || dorado.Core.newId();
    this.cancelDelayedAction(owner, actionId);
    owner[actionId] = $setTimeout(owner, fn, timeMillis);
}, cancelDelayedAction:function (owner, actionId) {
    if (owner[actionId]) {
        clearTimeout(owner[actionId]);
        owner[actionId] = undefined;
        return true;
    }
    return false;
}, STATE_CODE:{info:0, ok:1, warn:2, error:3, validating:99}, getTopMessage:function (messages) {
    if (!messages) {
        return null;
    }
    var topMessage = null, topStateCode = -1;
    for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        var code = this.STATE_CODE[message.state];
        if (code > topStateCode) {
            topStateCode = code;
            topMessage = message;
        }
    }
    return topMessage;
}, getTopMessageState:function (messages) {
    if (!messages) {
        return null;
    }
    var topMessage = this.getTopMessage(messages);
    return topMessage ? topMessage.state : null;
}, trimSingleMessage:function (message, defaultState) {
    if (!message) {
        return null;
    }
    if (typeof message == "string") {
        message = {state:defaultState, text:message};
    } else {
        message.state = message.state || defaultState;
    }
    return message;
}, trimMessages:function (message, defaultState) {
    if (!message) {
        return null;
    }
    var result;
    if (message instanceof Array) {
        var array = [];
        for (var i = 0; i < message.length; i++) {
            var m = this.trimSingleMessage(message[i], defaultState);
            if (!m) {
                continue;
            }
            array.push(m);
        }
        result = (array.length) ? array : null;
    } else {
        result = [this.trimSingleMessage(message, defaultState)];
    }
    return result;
}};
dorado.DraggingIndicator = $extend(dorado.RenderableElement, {$className:"dorado.DraggingIndicator", ATTRIBUTES:{className:{defaultValue:"d-dragging-indicator"}, accept:{skipRefresh:true, setter:function (v) {
    if (this._accept != v) {
        this._accept = v;
        this.refresh();
    }
}}, icon:{}, iconClass:{}, contentOffsetLeft:{defaultValue:20}, contentOffsetTop:{defaultValue:20}, content:{writeOnly:true, setter:function (content) {
    if (content instanceof jQuery) {
        content = content[0];
    }
    if (content) {
        content.style.position = "";
        content.style.left = 0;
        content.style.top = 0;
        content.style.right = 0;
        content.style.bottom = 0;
    }
    this._content = content;
}}}, constructor:function (config) {
    $invokeSuper.call(this, arguments);
    if (config) {
        this.set(config);
    }
}, createDom:function () {
    var dom = $DomUtils.xCreate({tagName:"div", content:[{tagName:"div", className:"content-container"}, {tagName:"div"}]});
    this._contentContainer = dom.firstChild;
    this._iconDom = dom.lastChild;
    return dom;
}, refreshDom:function (dom) {
    $invokeSuper.call(this, arguments);
    var contentContainer = this._contentContainer, $contentContainer = $fly(this._contentContainer), content = this._content;
    $contentContainer.toggleClass("default-content", (content == null)).left(this._contentOffsetLeft || 0).top(this._contentOffsetTop || 0);
    if (content) {
        if (content.parentNode != contentContainer) {
            $contentContainer.empty().append(content);
        }
    } else {
        $contentContainer.empty();
    }
    var w = contentContainer.offsetWidth + (this._contentOffsetLeft || 0);
    var h = contentContainer.offsetHeight + (this._contentOffsetTop || 0);
    $fly(dom).width(w).height(h);
    var iconDom = this._iconDom;
    $fly(iconDom).attr("class", "icon");
    var icon = this._icon, iconClass = this._iconClass;
    if (!icon && !iconClass) {
        iconClass = this._accept ? "accept-icon" : "denied-icon";
    }
    if (icon) {
        $DomUtils.setBackgroundImage(iconDom, icon);
    } else {
        if (iconClass) {
            $fly(iconDom).addClass(iconClass);
        }
    }
}});
dorado.DraggingIndicator.create = function () {
    return new dorado.DraggingIndicator();
};
(function () {
    dorado.DraggingInfo = $extend(dorado.AttributeSupport, {$className:"dorado.DraggingInfo", ATTRIBUTES:{object:{setter:function (object) {
        this._object = object;
        this._insertMode = null;
        this._refObject = null;
    }}, element:{}, tags:{}, sourceControl:{}, targetObject:{}, targetControl:{}, insertMode:{}, refObject:{}, accept:{getter:function () {
        return jQuery.ui.ddmanager.accept;
    }, setter:function (accept) {
        if (this._indicator) {
            this._indicator.set("accept", accept);
        }
        jQuery.ui.ddmanager.accept = accept;
    }}, indicator:{}, options:{}}, constructor:function (options) {
        if (options) {
            this.set(options);
        }
        if (!this._tags) {
            this._tags = [];
        }
    }, isDropAcceptable:function (droppableTags) {
        if (droppableTags && droppableTags.length && this._tags.length) {
            for (var i = 0; i < droppableTags.length; i++) {
                if (this._tags.indexOf(droppableTags[i]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }});
    dorado.DraggingInfo.getFromJQueryUI = function (ui) {
        return $fly(ui.draggable[0]).data("ui-draggable").draggingInfo;
    };
    dorado.DraggingInfo.getFromElement = function (element) {
        element = (element instanceof jQuery) ? element : $fly(element);
        return element.data("ui-draggable").draggingInfo;
    };
    dorado.Draggable = $class({$className:"dorado.Draggable", defaultDraggableOptions:{distance:5, revert:"invalid", cursorAt:{left:8, top:8}}, ATTRIBUTES:{draggable:{}, dragTags:{skipRefresh:true, setter:function (v) {
        if (typeof v == "string") {
            v = v.split(",");
        }
        this._dragTags = v || [];
    }}}, EVENTS:{onGetDraggingIndicator:{}, onDragStart:{}, onDragStop:{}, onDragMove:{}}, getDraggableOptions:function (dom) {
        var options = dorado.Object.apply({doradoDraggable:this}, this.defaultDraggableOptions);
        return options;
    }, applyDraggable:function (dom, options) {
        if (dom._currentDraggable !== this._draggable) {
            if (this._draggable) {
                options = options || this.getDraggableOptions(dom);
                $fly(dom).draggable(options);
            } else {
                if ($fly(dom).data("ui-draggable")) {
                    $fly(dom).draggable("destroy");
                }
            }
            dom._currentDraggable = this._draggable;
        }
    }, createDraggingInfo:function (dom, options) {
        var info = new dorado.DraggingInfo({sourceControl:this, options:options, tags:this._dragTags});
        return info;
    }, initDraggingInfo:function (draggingInfo, evt) {
    }, initDraggingIndicator:function (indicator, draggingInfo, evt) {
    }, onGetDraggingIndicator:function (indicator, evt, draggableElement) {
        if (!indicator) {
            indicator = dorado.DraggingIndicator.create();
        }
        var eventArg = {indicator:indicator, event:evt, draggableElement:draggableElement};
        this.fireEvent("onGetDraggingIndicator", this, eventArg);
        indicator = eventArg.indicator;
        if (indicator instanceof dorado.DraggingIndicator) {
            if (!indicator.get("rendered")) {
                indicator.render();
            }
            var dom = indicator.getDom();
            $fly(dom).bringToFront();
        }
        return indicator;
    }, onDragStart:function (draggingInfo, evt) {
        var eventArg = {draggingInfo:draggingInfo, event:evt, processDefault:true};
        this.fireEvent("onDragStart", this, eventArg);
        return eventArg.processDefault;
    }, onDragStop:function (draggingInfo, evt) {
        var eventArg = {draggingInfo:draggingInfo, event:evt, processDefault:true};
        this.fireEvent("onDragStop", this, eventArg);
        return eventArg.processDefault;
    }, onDragMove:function (draggingInfo, evt) {
        var eventArg = {draggingInfo:draggingInfo, event:evt};
        this.fireEvent("onDragMove", this, eventArg);
    }});
    dorado.Droppable = $class({$className:"dorado.Droppable", defaultDroppableOptions:{accept:"*", greedy:true, tolerance:"pointer"}, ATTRIBUTES:{droppable:{}, droppableTags:{skipRefresh:true, setter:function (v) {
        if (typeof v == "string") {
            v = v.split(",");
        }
        this._droppableTags = v || [];
    }}}, EVENTS:{onDraggingSourceOver:{}, onDraggingSourceOut:{}, onDraggingSourceMove:{}, beforeDraggingSourceDrop:{}, onDraggingSourceDrop:{}}, getDroppableOptions:function (dom) {
        var options = dorado.Object.apply({doradoDroppable:this}, this.defaultDroppableOptions);
        return options;
    }, applyDroppable:function (dom, options) {
        if (dom._currentDroppable !== this._droppable) {
            if (this._droppable) {
                options = options || this.getDroppableOptions(dom);
                $fly(dom).droppable(options);
            } else {
                if ($fly(dom).data("ui-droppable")) {
                    $fly(dom).droppable("destroy");
                }
            }
            dom._currentDroppable = this._droppable;
        }
    }, onDraggingSourceOver:function (draggingInfo, evt) {
        var accept = draggingInfo.isDropAcceptable(this._droppableTags);
        var eventArg = {draggingInfo:draggingInfo, event:evt, accept:accept};
        this.fireEvent("onDraggingSourceOver", this, eventArg);
        draggingInfo.set("accept", eventArg.accept);
        return eventArg.accept;
    }, onDraggingSourceOut:function (draggingInfo, evt) {
        var eventArg = {draggingInfo:draggingInfo, event:evt};
        this.fireEvent("onDraggingSourceOut", this, eventArg);
        draggingInfo.set({targetObject:null, insertMode:null, refObject:null, accept:false});
    }, onDraggingSourceMove:function (draggingInfo, evt) {
        var eventArg = {draggingInfo:draggingInfo, event:evt};
        this.fireEvent("onDraggingSourceMove", this, eventArg);
    }, beforeDraggingSourceDrop:function (draggingInfo, evt) {
        var eventArg = {draggingInfo:draggingInfo, event:evt, processDefault:true};
        this.fireEvent("beforeDraggingSourceDrop", this, eventArg);
        return eventArg.processDefault;
    }, onDraggingSourceDrop:function (draggingInfo, evt) {
        var eventArg = {draggingInfo:draggingInfo, event:evt};
        this.fireEvent("onDraggingSourceDrop", this, eventArg);
    }, getMousePosition:function (evt) {
        var offset = $fly(this.getDom()).offset();
        return {x:evt.pageX - offset.left, y:evt.pageY - offset.top};
    }});
})();
dorado.ModalManager = {_controlStack:[], getMask:function () {
    var manager = dorado.ModalManager, maskDom = manager._dom;
    if (!maskDom) {
        maskDom = manager._dom = document.createElement("div");
        $fly(maskDom).mousedown(function (evt) {
            var repeat = function (fn, times, delay) {
                var first = true;
                return function () {
                    if (times-- >= 0) {
                        if (first) {
                            first = false;
                        } else {
                            fn.apply(null, arguments);
                        }
                        var args = Array.prototype.slice.call(arguments);
                        var self = arguments.callee;
                        setTimeout(function () {
                            self.apply(null, args);
                        }, delay);
                    }
                };
            };
            if (!dorado.Browser.msie && evt.target == maskDom) {
                var stack = manager._controlStack, stackEl = stack[stack.length - 1], dom;
                if (stackEl) {
                    dom = stackEl.dom;
                }
                if (dom) {
                    var control = dorado.widget.Control.findParentControl(dom);
                    if (control) {
                        var count = 1, fn = repeat(function () {
                            dorado.widget.setFocusedControl(count++ % 2 == 1 ? control : null);
                        }, 3, 100);
                        fn();
                    }
                }
            }
            evt.stopPropagation();
            evt.preventDefault();
            evt.returnValue = false;
            return false;
        }).mouseenter(function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.returnValue = false;
            return false;
        }).mouseleave(function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.returnValue = false;
            return false;
        });
        $fly(document.body).append(maskDom);
    }
    manager.resizeMask();
    return maskDom;
}, resizeMask:function () {
    var manager = dorado.ModalManager, maskDom = manager._dom;
    if (maskDom) {
        var doc = maskDom.ownerDocument, bodyHeight = $fly(doc).height(), bodyWidth;
        if (dorado.Browser.msie) {
            if (dorado.Browser.version == 6) {
                bodyWidth = $fly(doc).width() - (parseInt($fly(doc.body).css("margin-left"), 10) || 0) - (parseInt($fly(doc.body).css("margin-right"), 10) || 0);
                $fly(maskDom).width(bodyWidth - 2).height(bodyHeight - 4);
            } else {
                if (dorado.Browser.version == 7) {
                    $fly(maskDom).height(bodyHeight);
                } else {
                    $fly(maskDom).height(bodyHeight - 4);
                }
            }
        } else {
            $fly(maskDom).height(bodyHeight - 4);
        }
    }
}, show:function (dom, maskClass) {
    var manager = dorado.ModalManager, stack = manager._controlStack, maskDom = manager.getMask();
    if (dom) {
        maskClass = maskClass || "d-modal-mask";
        $fly(maskDom).css({display:""}).bringToFront();
        stack.push({dom:dom, maskClass:maskClass, zIndex:maskDom.style.zIndex});
        $fly(dom).bringToFront();
        setTimeout(function () {
            $fly(maskDom).prop("class", maskClass);
        }, 0);
    }
}, hide:function (dom) {
    var manager = dorado.ModalManager, stack = manager._controlStack, maskDom = manager.getMask();
    if (dom) {
        if (stack.length > 0) {
            var target = stack[stack.length - 1];
            if (target && target.dom == dom) {
                stack.pop();
            } else {
                for (var i = 0, j = stack.length; i < j; i++) {
                    if (dom == (stack[i] || {}).dom) {
                        stack.removeAt(i);
                        break;
                    }
                }
            }
            if (stack.length == 0) {
                $fly(maskDom).prop("class", "").css("display", "none");
            } else {
                target = stack[stack.length - 1];
                $fly(maskDom).css({zIndex:target.zIndex}).prop("class", target.maskClass);
            }
        }
    }
}};
$fly(window).bind("resize", function () {
    if (dorado.ModalManager.onResizeTimerId) {
        clearTimeout(dorado.ModalManager.onResizeTimerId);
        delete dorado.ModalManager.onResizeTimerId;
    }
    dorado.ModalManager.onResizeTimerId = setTimeout(function () {
        delete dorado.ModalManager.onResizeTimerId;
        dorado.ModalManager.resizeMask();
    }, 20);
});
dorado.util.TaskIndicator = {type:null, idseed:0, _taskGroups:{}, init:function () {
    if (this.inited) {
        return;
    }
    this.inited = true;
    var mainType = $setting["common.taskIndicator.main.type"] || "panel";
    var daemonType = $setting["common.taskIndicator.daemon.type"] || "panel";
    var taskGroupConfig = {type:mainType, modal:true};
    if (mainType == "icon") {
        taskGroupConfig.showOptions = {align:"center", vAlign:"center"};
        taskGroupConfig.className = "d-main-task-indicator";
    } else {
        if (mainType == "panel") {
            taskGroupConfig.showOptions = {align:"center", vAlign:"center"};
            taskGroupConfig.className = "d-main-task-indicator";
        }
    }
    this.registerTaskGroup("main", taskGroupConfig);
    taskGroupConfig = {type:daemonType};
    if (daemonType == "icon") {
        taskGroupConfig.showOptions = {align:"innerright", vAlign:"innertop", offsetLeft:-15, offsetTop:15};
        taskGroupConfig.className = "d-daemon-task-indicator";
    } else {
        if (mainType == "panel") {
            taskGroupConfig.showOptions = {align:"innerright", vAlign:"innertop", offsetLeft:-15, offsetTop:15};
            taskGroupConfig.className = "d-daemon-task-indicator";
        }
    }
    this.registerTaskGroup("daemon", taskGroupConfig);
}, registerTaskGroup:function (groupName, options) {
    var indicator = this, taskGroups = indicator._taskGroups;
    if (taskGroups[groupName]) {
    } else {
        options = options || {};
        taskGroups[groupName] = options;
    }
}, showTaskIndicator:function (taskInfo, groupName, startTime) {
    this.init();
    var indicator = this, taskGroups = indicator._taskGroups, taskGroupConfig;
    groupName = groupName || "daemon";
    taskGroupConfig = taskGroups[groupName];
    if (taskGroupConfig) {
        var groupPanel = taskGroupConfig.groupPanel;
        if (!groupPanel) {
            groupPanel = taskGroupConfig.groupPanel = new dorado.util.TaskGroupPanel(taskGroupConfig);
        }
        var taskId = groupName + "@" + ++indicator.idseed;
        groupPanel.show();
        groupPanel.addTask(taskId, taskInfo, startTime);
        return taskId;
    } else {
        return null;
    }
}, updateTaskIndicator:function (taskId, taskInfo, startTime) {
    var indicator = this, taskGroups = indicator._taskGroups, taskGroupName, taskGroupConfig;
    taskGroupName = taskId.substring(0, taskId.indexOf("@"));
    taskGroupConfig = taskGroups[taskGroupName];
    if (taskGroupConfig) {
        var groupPanel = taskGroupConfig.groupPanel;
        if (groupPanel) {
            groupPanel.updateTask(taskId, taskInfo, startTime);
        }
    }
}, hideTaskIndicator:function (taskId) {
    var indicator = this, taskGroups = indicator._taskGroups, taskGroupName, taskGroupConfig;
    taskGroupName = taskId.substring(0, taskId.indexOf("@"));
    taskGroupConfig = taskGroups[taskGroupName];
    if (taskGroupConfig) {
        var groupPanel = taskGroupConfig.groupPanel;
        if (groupPanel) {
            groupPanel.removeTask(taskId);
        }
    }
}};
dorado.util.TaskGroupPanel = $extend(dorado.RenderableElement, {$className:"dorado.util.TaskGroupPanel", tasks:null, taskGroupConfig:null, _intervalId:null, ATTRIBUTES:{className:{defaultValue:"d-task-group"}}, constructor:function (taskGroupConfig) {
    $invokeSuper.call(this);
    var panel = this;
    if (!taskGroupConfig) {
        throw new dorado.Exception("taskGrooupRequired");
    }
    panel.taskGroupConfig = taskGroupConfig;
    panel.tasks = new dorado.util.KeyedArray(function (object) {
        return object.taskId;
    });
}, createDom:function () {
    var panel = this, dom, doms = {}, taskGroupConfig = panel.taskGroupConfig;
    if (taskGroupConfig.type == "bar") {
        dom = null;
    } else {
        if (taskGroupConfig.type == "icon") {
            dom = $DomUtils.xCreate({tagName:"div", className:panel._className + " " + panel._className + "-" + taskGroupConfig.type + " " + taskGroupConfig.className, content:{tagName:"div", className:"icon", content:{tagName:"div", className:"spinner"}}});
        } else {
            dom = $DomUtils.xCreate({tagName:"div", className:panel._className + " " + panel._className + "-" + taskGroupConfig.type + " " + taskGroupConfig.className, content:[{tagName:"div", className:"icon", content:{tagName:"div", className:"spinner"}}, {tagName:"div", className:"count-info", contextKey:"countInfo"}, {tagName:"ul", className:"task-list", contextKey:"taskList", content:{tagName:"li", className:"more", content:"... ... ...", contextKey:"more", style:"display: none"}}]}, null, doms);
            panel._doms = doms;
            taskGroupConfig.caption = taskGroupConfig.caption ? taskGroupConfig.caption : $resource("dorado.core.DefaultTaskCountInfo");
            taskGroupConfig.executeTimeCaption = taskGroupConfig.executeTimeCaption ? taskGroupConfig.executeTimeCaption : $resource("dorado.core.DefaultTaskExecuteTime");
        }
    }
    return dom;
}, addTask:function (taskId, taskInfo, startTime) {
    startTime = (startTime || new Date()).getTime();
    var time = (new Date()).getTime();
    var panel = this, taskGroupConfig = panel.taskGroupConfig;
    if (taskGroupConfig.type == "panel") {
        var listDom = panel._doms.taskList, li = $DomUtils.xCreate({tagName:"li", className:"task-item", content:[{tagName:"span", className:"interval-span", content:taskGroupConfig.executeTimeCaption.replace("${taskExecuteTime}", parseInt((time - startTime) / 1000, 10))}, {tagName:"span", className:"caption-span", content:taskInfo}]});
        if (panel.tasks.size >= (panel.taskGroupConfig.showOptions.maxLines || 3)) {
            li.style.display = "none";
            panel._doms.more.style.display = "";
        }
        listDom.insertBefore(li, panel._doms.more);
        if (panel.tasks.size == 0) {
            panel._intervalId = setInterval(function () {
                panel.refreshInterval();
            }, 500);
        }
    }
    panel.tasks.append({taskId:taskId, dom:li, startTime:startTime});
    if (taskGroupConfig.type == "panel") {
        $fly(panel._doms.countInfo).text(taskGroupConfig.caption.replace("${taskNum}", panel.tasks.size));
    }
}, updateTask:function (taskId, taskInfo, startTime) {
    var panel = this, target = panel.tasks.get(taskId), taskGroupConfig = panel.taskGroupConfig;
    if (target) {
        if (startTime) {
            target.startTime = startTime;
        }
        if (taskGroupConfig.type == "panel") {
            if (target.dom) {
                $fly(target.dom).find(">.caption-span")[0].innerText = taskInfo;
            }
        }
    }
}, removeTask:function (taskId) {
    var panel = this, target = panel.tasks.get(taskId), taskGroupConfig = panel.taskGroupConfig;
    if (target) {
        if (taskGroupConfig.type == "bar" || taskGroupConfig.type == "icon") {
            panel.tasks.remove(target);
            if (panel.tasks.size == 0) {
                panel.hide();
            }
        } else {
            if (taskGroupConfig.type == "panel") {
                setTimeout(function () {
                    $fly(target.dom).remove();
                    panel.tasks.remove(target);
                    var maxLines = panel.taskGroupConfig.showOptions.maxLines || 3;
                    if (panel.tasks.size > maxLines) {
                        var i = 0;
                        panel.tasks.each(function (task) {
                            task.dom.style.display = "";
                            if (++i == maxLines) {
                                return false;
                            }
                        });
                    } else {
                        panel._doms.more.style.display = "none";
                        if (panel.tasks.size == 0) {
                            clearInterval(panel._intervalId);
                            panel._intervalId = null;
                            panel.hide();
                        } else {
                            panel.tasks.each(function (task) {
                                task.dom.style.display = "";
                            });
                        }
                    }
                    $fly(panel._doms.countInfo).text(taskGroupConfig.caption.replace("${taskNum}", panel.tasks.size));
                }, 500);
            }
        }
    }
}, refreshInterval:function () {
    var panel = this, time = new Date().getTime();
    panel.tasks.each(function (task) {
        var el = task.dom, startTime = task.startTime;
        if (el && startTime) {
            var interval = parseInt((time - startTime) / 1000, 10);
            $fly(el).find(".interval-span").text(panel.taskGroupConfig.executeTimeCaption.replace("${taskExecuteTime}", interval));
        }
    });
}, show:function (options) {
    var panel = this, taskGroupConfig = panel.taskGroupConfig;
    options = options || taskGroupConfig.showOptions;
    if (panel._hideTimer) {
        clearTimeout(panel._hideTimer);
        panel._hideTimer = null;
        return;
    }
    if (taskGroupConfig.type == "bar") {
        if (!panel._rendered) {
            panel._rendered = true;
            NProgress.configure({positionUsing:(dorado.Browser.isTouch && dorado.Browser.version < "535.0") ? "margin" : "", showSpinner:false});
            panel._dom = NProgress.render(true);
        }
        NProgress.start();
    } else {
        if (!panel._rendered) {
            panel.render(document.body);
        } else {
            $fly(panel._dom).css("display", "").css("visibility", "");
        }
    }
    if (panel.tasks.size == 0 && taskGroupConfig.modal) {
        dorado.ModalManager.show(panel._dom);
    }
    $fly(panel._dom).bringToFront();
    if (options) {
        $DomUtils.dockAround(panel._dom, document.body, options);
    }
}, hide:function () {
    var panel = this;
    var taskGroupConfig = panel.taskGroupConfig;
    if (taskGroupConfig.type == "bar") {
        NProgress.done();
    } else {
        if (panel._rendered) {
            jQuery(panel._dom).css("display", "none").css("visibility", "hidden");
        }
    }
    if (taskGroupConfig.modal) {
        dorado.ModalManager.hide(panel._dom);
    }
}});
(function ($) {
    var SCROLLER_SIZE = $setting["widget.scrollerSize"] || 4, SCROLLER_EXPANDED_SIZE = $setting["widget.scrollerExpandedSize"] || 16;
    var SCROLLER_PADDING = 0, MIN_SLIDER_SIZE = SCROLLER_EXPANDED_SIZE, MIN_SPILLAGE = 2;
    function insertAfter(element, refElement) {
        var parent = refElement.parentNode;
        if (parent.lastChild == refElement) {
            parent.appendChild(element);
        } else {
            parent.insertBefore(element, refElement.nextSibling);
        }
    }
    dorado.util.Dom.ThinScroller = $class({constructor:function (container, direction, options) {
        this.container = container;
        this.direction = direction;
        if (options) {
            dorado.Object.apply(this, options);
        }
    }, destroy:function () {
        delete this.dom;
        delete this.doms;
        delete this.container;
    }, createDom:function () {
        var scroller = this, doms = scroller.doms = {}, dom = scroller.dom = $DomUtils.xCreate({tagName:"DIV", className:"d-modern-scroller", style:"position: absolute", content:[{tagName:"DIV", contextKey:"track", className:"track", style:{width:"100%", height:"100%"}}, {tagName:"DIV", contextKey:"slider", className:"slider", style:"position: absolute"}]}, null, doms);
        var $dom = $(dom), slider = doms.slider, $slider = $(slider), track = doms.track, $track = $(track);
        var draggableOptions = {containment:"parent", start:function () {
            scroller.dragging = true;
        }, stop:function () {
            scroller.dragging = false;
            (scroller.hover) ? scroller.doMouseEnter() : scroller.doMouseLeave();
        }, drag:function () {
            var container = scroller.container;
            if (scroller.direction == "h") {
                container.scrollLeft = Math.round(slider.offsetLeft * scroller.positionRatio);
            } else {
                container.scrollTop = Math.round(slider.offsetTop * scroller.positionRatio);
            }
        }};
        if (scroller.direction == "h") {
            dom.style.height = SCROLLER_SIZE + "px";
            slider.style.height = "100%";
            slider.style.top = "0px";
            draggableOptions.axis = "x";
        } else {
            dom.style.width = SCROLLER_SIZE + "px";
            slider.style.width = "100%";
            slider.style.left = "0px";
            draggableOptions.axis = "y";
        }
        $slider.draggable(draggableOptions);
        $dom.hover(function () {
            scroller.update();
            scroller.doMouseEnter();
        }, function () {
            scroller.doMouseLeave();
        });
        $track.click(function (evt) {
            var container = scroller.container;
            if (scroller.direction == "h") {
                if (evt.offsetX > slider.offsetLeft) {
                    container.scrollLeft += container.clientWidth;
                } else {
                    container.scrollLeft -= container.clientWidth;
                }
            } else {
                if (evt.offsetY > slider.offsetTop) {
                    container.scrollTop += container.clientHeight;
                } else {
                    container.scrollTop -= container.clientHeight;
                }
            }
        });
        $DomUtils.disableUserSelection(dom);
        $DomUtils.disableUserSelection(doms.track);
        return dom;
    }, doMouseEnter:function () {
        var scroller = this;
        scroller.hover = true;
        if (scroller.dragging) {
            return;
        }
        $fly(scroller.dom).addClass("d-modern-scroller-hover");
        scroller.expand();
    }, doMouseLeave:function () {
        var scroller = this;
        scroller.hover = false;
        if (scroller.dragging) {
            return;
        }
        $fly(scroller.dom).removeClass("d-modern-scroller-hover");
        scroller.unexpand();
    }, expand:function () {
        var scroller = this;
        dorado.Toolkits.cancelDelayedAction(scroller, "$expandTimerId");
        if (scroller.expanded) {
            return;
        }
        var animOptions;
        if (scroller.direction == "h") {
            animOptions = {height:SCROLLER_EXPANDED_SIZE};
        } else {
            animOptions = {width:SCROLLER_EXPANDED_SIZE};
        }
        scroller.expanded = true;
        var $dom = $(scroller.dom);
        $dom.addClass("d-modern-scroller-expand");
        if (dorado.Browser.msie && dorado.Browser.version < 7) {
            $dom.css(animOptions);
        } else {
            scroller.duringAnimation = true;
            $dom.animate(animOptions, 0, function () {
                scroller.duringAnimation = false;
            });
        }
    }, unexpand:function () {
        var scroller = this;
        dorado.Toolkits.setDelayedAction(scroller, "$expandTimerId", function () {
            var animOptions, container = scroller.container;
            if (scroller.direction == "h") {
                animOptions = {height:SCROLLER_SIZE};
            } else {
                animOptions = {width:SCROLLER_SIZE};
            }
            var $dom = $(scroller.dom);
            if (dorado.Browser.msie && dorado.Browser.version < 7) {
                $dom.css(animOptions);
                scroller.expanded = false;
            } else {
                scroller.duringAnimation = true;
                $dom.animate(animOptions, 300, function () {
                    scroller.expanded = false;
                    scroller.duringAnimation = false;
                    $dom.removeClass("d-modern-scroller-expand");
                });
            }
        }, 700);
    }, update:function () {
        var scroller = this, container = scroller.container;
        if (!container) {
            return;
        }
        var dom = scroller.dom, $container = $(container), scrollerSize = scroller.expanded ? SCROLLER_EXPANDED_SIZE : SCROLLER_SIZE;
        if (scroller.direction == "h") {
            if (container.scrollWidth > (container.clientWidth + MIN_SPILLAGE) && container.clientWidth > 0) {
                if (!dom) {
                    dom = scroller.createDom();
                    dom.style.zIndex = 9999;
                    dom.style.bottom = 0;
                    dom.style.left = 0;
                    if (!dorado.Browser.msie || dorado.Browser.version != 6) {
                        dom.style.width = "100%";
                    }
                    container.parentNode.appendChild(dom);
                } else {
                    dom.style.display = "";
                }
                if (dorado.Browser.msie && dorado.Browser.version == 6) {
                    dom.style.width = container.offsetWidth + "px";
                }
                var trackSize = container.offsetWidth - SCROLLER_PADDING * 2;
                var slider = scroller.doms.slider;
                var sliderSize = (trackSize * container.clientWidth / container.scrollWidth);
                if (sliderSize < MIN_SLIDER_SIZE) {
                    trackSize -= (MIN_SLIDER_SIZE - sliderSize);
                    sliderSize = MIN_SLIDER_SIZE;
                }
                scroller.positionRatio = container.scrollWidth / trackSize;
                slider.style.left = Math.round(container.scrollLeft / scroller.positionRatio) + "px";
                slider.style.width = Math.round(sliderSize) + "px";
            } else {
                if (dorado.Browser.msie && dorado.Browser.version == 9 && container.offsetWidth > 0) {
                    setTimeout(function () {
                        scroller.update();
                    }, 0);
                }
                if (dom) {
                    dom.style.display = "none";
                }
            }
        } else {
            if (container.scrollHeight > (container.clientHeight + MIN_SPILLAGE) && container.clientHeight > 0) {
                if (!dom) {
                    dom = scroller.createDom();
                    dom.style.zIndex = 9999;
                    dom.style.top = 0;
                    dom.style.right = 0;
                    if (!dorado.Browser.msie || dorado.Browser.version != 6) {
                        dom.style.height = "100%";
                    }
                    container.parentNode.appendChild(dom);
                } else {
                    dom.style.display = "";
                }
                if (dorado.Browser.msie && dorado.Browser.version == 6) {
                    dom.style.height = container.offsetHeight + "px";
                }
                var trackSize = container.offsetHeight - SCROLLER_PADDING * 2;
                var slider = scroller.doms.slider;
                var sliderSize = (trackSize * container.clientHeight / container.scrollHeight);
                if (sliderSize < MIN_SLIDER_SIZE) {
                    trackSize -= (MIN_SLIDER_SIZE - sliderSize);
                    sliderSize = MIN_SLIDER_SIZE;
                }
                scroller.positionRatio = container.scrollHeight / trackSize;
                slider.style.top = Math.round(container.scrollTop / scroller.positionRatio) + "px";
                slider.style.height = Math.round(sliderSize) + "px";
            } else {
                if (dorado.Browser.msie && dorado.Browser.version == 9 && container.offsetHeight > 0) {
                    setTimeout(function () {
                        scroller.update();
                    }, 0);
                }
                if (dom) {
                    dom.style.display = "none";
                }
            }
        }
    }});
    var ModernScroller = dorado.util.Dom.ModernScroller = $class({constructor:function (container, options) {
        this.id = dorado.Core.newId();
        this.container = container;
        this.options = options || {};
        var $container = $(container), options = this.options;
        if (options.listenSize || options.listenContainerSize || options.listenContentSize) {
            addListenModernScroller(this);
        }
    }, destroy:function () {
        this.destroyed = true;
        var options = this.options;
        if (options.listenSize || options.listenContainerSize || options.listenContentSize) {
            removeListenModernScroller(this);
        }
        delete this.container;
    }, setScrollLeft:dorado._NULL_FUNCTION, setScrollTop:dorado._NULL_FUNCTION, scrollToElement:dorado._NULL_FUNCTION});
    dorado.util.Dom.DesktopModernScroller = $extend(ModernScroller, {constructor:function (container, options) {
        $invokeSuper.call(this, arguments);
        var options = this.options;
        $container = $(container), parentDom = container.parentNode, $parentDom = $(parentDom);
        var overflowX = $container.css("overflowX"), overflowY = $container.css("overflowY");
        var width = $container.css("width"), height = $container.css("height");
        var xScroller, yScroller;
        if (!(overflowX == "hidden" || overflowX != "scroll" && (width == "" || width == "auto"))) {
            $container.css("overflowX", "hidden");
            xScroller = new dorado.util.Dom.ThinScroller(container, "h", options);
        }
        if (!(overflowY == "hidden" || overflowY != "scroll" && (height == "" || height == "auto"))) {
            $container.css("overflowY", "hidden");
            yScroller = new dorado.util.Dom.ThinScroller(container, "v", options);
        }
        if (!xScroller && !yScroller) {
            throw new dorado.AbortException();
        }
        this.xScroller = xScroller;
        this.yScroller = yScroller;
        var position = $parentDom.css("position");
        if (position != "relative" && position != "absolute") {
            $parentDom.css("position", "relative");
        }
        position = $container.css("position");
        if (position != "relative" && position != "absolute") {
            $container.css("position", "relative");
        }
        this.update();
        var modernScroller = this;
        if ($container.mousewheel) {
            $container.mousewheel(function (evt, delta) {
                if (container.scrollHeight > container.clientHeight) {
                    var scrollTop = container.scrollTop - delta * 25;
                    if (scrollTop <= 0) {
                        scrollTop = 0;
                    } else {
                        if (scrollTop + container.clientHeight > container.scrollHeight) {
                            scrollTop = container.scrollHeight - container.clientHeight;
                        }
                    }
                    var gap = container.scrollTop - scrollTop;
                    if (gap) {
                        container.scrollTop = scrollTop;
                        if (Math.abs(gap) > MIN_SPILLAGE) {
                            return false;
                        }
                    }
                }
            });
        }
        $container.bind("scroll", function (evt) {
            modernScroller.update();
            var arg = {scrollLeft:container.scrollLeft, scrollTop:container.scrollTop, scrollWidth:container.scrollWidth, scrollHeight:container.scrollHeight, clientWidth:container.clientWidth, clientHeight:container.clientHeight};
            $(container).trigger("modernScrolling", arg).trigger("modernScrolled", arg);
        }).resize(function (evt) {
            modernScroller.update();
        });
    }, update:function () {
        if (this.destroyed || this.dragging) {
            return;
        }
        if (this.xScroller) {
            this.xScroller.update();
        }
        if (this.yScroller) {
            this.yScroller.update();
        }
        var container = this.container;
        this.currentClientWidth = container.clientWidth;
        this.currentClientHeight = container.clientHeight;
        this.currentScrollWidth = container.scrollWidth;
        this.currentScrollHeight = container.scrollHeight;
    }, setScrollLeft:function (pos) {
        this.container.scrollLeft = pos;
    }, setScrollTop:function (pos) {
        this.container.scrollTop = pos;
    }, scrollToElement:function (dom) {
        var container = this.container, offsetElement = $fly(dom).offset(), offsetContainer = $fly(container).offset();
        var offsetLeft = offsetElement.left - offsetContainer.left, offsetTop = offsetElement.top - offsetContainer.top;
        var offsetRight = offsetLeft + dom.offsetWidth, offsetBottom = offsetTop + dom.offsetHeight;
        var scrollLeft = container.scrollLeft, scrollTop = container.scrollTop;
        var scrollRight = scrollLeft + container.clientWidth, scrollBottom = scrollTop + container.clientHeight;
        if (offsetLeft < scrollLeft) {
            if (offsetRight <= scrollRight) {
                this.setScrollLeft(offsetLeft);
            }
        } else {
            if (offsetRight > scrollRight) {
                this.setScrollLeft(offsetRight + dom.offsetWidth);
            }
        }
        if (offsetTop < scrollTop) {
            if (offsetBottom <= scrollBottom) {
                this.setScrollTop(offsetTop);
            }
        } else {
            if (offsetBottom > scrollBottom) {
                this.setScrollTop(offsetBottom + dom.offsetHeight);
            }
        }
    }, destroy:function () {
        $invokeSuper.call(this, arguments);
        if (this.xScroller) {
            this.xScroller.destroy();
        }
        if (this.yScroller) {
            this.yScroller.destroy();
        }
    }});
    dorado.util.Dom.IScrollerWrapper = $extend(ModernScroller, {constructor:function (container, options) {
        var $container = $(container);
        var overflowX = $container.css("overflowX"), overflowY = $container.css("overflowY");
        var width = $container.css("width"), height = $container.css("height");
        options = options || {};
        if (options.autoDisable === undefined) {
            options.autoDisable = true;
        }
        var onScrolling = function () {
            var arg = {scrollLeft:this.x * -1, scrollTop:this.y * -1, scrollWidth:container.scrollWidth, scrollHeight:container.scrollHeight, clientWidth:container.clientWidth, clientHeight:container.clientHeight};
            $container.trigger("modernScrolling", arg);
        };
        var modernScroller = this, options = modernScroller.options = dorado.Object.apply({scrollbarClass:"iscroll", hideScrollbar:true, fadeScrollbar:true, onScrolling:onScrolling, onScrollMove:onScrolling, onScrollEnd:function () {
            var arg = {scrollLeft:this.x * -1, scrollTop:this.y * -1, scrollWidth:container.scrollWidth, scrollHeight:container.scrollHeight, clientWidth:container.clientWidth, clientHeight:container.clientHeight};
            $container.trigger("modernScrolled", arg);
        }}, options, false);
        $container.css("overflowX", "hidden").css("overflowY", "hidden");
        setTimeout(function () {
            modernScroller.iscroll = new iScroll(container, modernScroller.options);
            if (options.autoDisable && container.scrollHeight <= (container.clientHeight + 2) && (container.scrollWidth <= container.clientWidth + 2)) {
                modernScroller.iscroll.disable();
            }
        }, 0);
        $invokeSuper.call(modernScroller, [container, modernScroller.options]);
        var $container = $(container);
        $container.bind("scroll", function (evt) {
            modernScroller.update();
        }).resize(function (evt) {
            modernScroller.update();
        });
    }, update:function () {
        if (!this.iscroll || this.destroyed || this.dragging) {
            return;
        }
        var iscroll = this.iscroll;
        if (this.options.autoDisable) {
            var container = this.container;
            if (container.scrollHeight - (iscroll.y || 0) > (container.clientHeight + 2) || container.scrollWidth - (iscroll.x || 0) > (container.clientWidth + 2)) {
                this.iscroll.enable();
                this.iscroll.refresh();
            } else {
                this.iscroll.disable();
                this.iscroll.refresh();
            }
        } else {
            this.iscroll.refresh();
        }
    }, scrollToElement:function (dom) {
        if (this.iscroll) {
            this.iscroll.scrollToElement(dom);
        }
    }});
    var listenModernScrollers = new dorado.util.KeyedList(dorado._GET_ID), listenTimerId;
    function addListenModernScroller(modernScroller) {
        listenModernScrollers.insert(modernScroller);
        if (listenModernScrollers.size == 1) {
            listenTimerId = setInterval(function () {
                listenModernScrollers.each(function (modernScroller) {
                    var container = modernScroller.container, shouldUpdate = false;
                    if (modernScroller.options.listenSize || modernScroller.options.listenContainerSize) {
                        if (modernScroller.currentClientWidth != container.clientWidth || modernScroller.currentClientHeight != container.clientHeight) {
                            shouldUpdate = true;
                        }
                    }
                    if (modernScroller.options.listenSize || modernScroller.options.listenContentSize) {
                        if (modernScroller.currentScrollWidth != container.scrollWidth || modernScroller.currentScrollHeight != container.scrollHeight) {
                            shouldUpdate = true;
                        }
                    }
                    if (shouldUpdate) {
                        modernScroller.update();
                    }
                });
            }, 300);
        }
    }
    function removeListenModernScroller(modernScroller) {
        listenModernScrollers.remove(modernScroller);
        if (listenModernScrollers.size == 0 && listenTimerId) {
            clearInterval(listenTimerId);
            listenTimerId = 0;
        }
    }
    dorado.util.Dom.modernScroll = function (container, options) {
        var $container = $(container);
        if ($container.data("modernScroller")) {
            return;
        }
        try {
            var modernScroller;
            var parentDom = container.parentNode;
            if (parentDom) {
                if (options && options.scrollerType) {
                    modernScroller = new options.scrollerType(container, options);
                } else {
                    if (dorado.Browser.isTouch || $setting["common.simulateTouch"]) {
                        modernScroller = new dorado.util.Dom.IScrollerWrapper(container, options);
                    } else {
                        modernScroller = new dorado.util.Dom.DesktopModernScroller(container, options);
                    }
                }
            }
            if (modernScroller) {
                $container.data("modernScroller", modernScroller);
            }
        }
        catch (e) {
            dorado.Exception.processException(e);
        }
        return modernScroller;
    };
    dorado.util.Dom.destroyModernScroll = function (container, options) {
        var modernScroller = $(container).data("modernScroller");
        if (modernScroller) {
            modernScroller.destroy();
        }
    };
})(jQuery);
(function () {
    dorado.SocketProtocol = $class({$className:"dorado.SocketProtocol"});
    dorado.LongPollingProtocol = $extend(dorado.SocketProtocol, {$className:"dorado.LongPollingProtocol", serviceAction:"long-polling", constructor:function () {
        this._sockets = new dorado.util.KeyedArray(function (socket) {
            return socket._socketId;
        });
        this._socketIds = [];
        this._pollingOptions = $setting["longPolling.pollingOptions"];
        this._sendingOptions = $setting["longPolling.sendingOptions"];
    }, connect:function (socket, callback) {
        var self = this;
        if (!self._pollingAjaxEngine || !self._sendingAjaxEngine) {
            self._pollingAjaxEngine = dorado.util.AjaxEngine.getInstance(self._pollingOptions);
            self._sendingAjaxEngine = dorado.util.AjaxEngine.getInstance(self._sendingOptions);
        }
        socket._setState("connecting");
        if (self._connecting && !self._groupId) {
            if (!self._pendingConnects) {
                self._pendingConnects = [];
            }
            self._pendingConnects.push({socket:socket, callback:callback});
        } else {
            self.doConnection(socket, callback);
        }
    }, doConnection:function (socket, callback) {
        var self = this;
        self._sendingAjaxEngine.bind("beforeConnect", function () {
            self._connecting = true;
        }, {once:true}).bind("onDisconnect", function () {
            self._connecting = false;
            if (self._polling) {
                self.stopPoll();
            }
            if (self._pendingConnects) {
                var pendingConnects = self._pendingConnects;
                delete self._pendingConnects;
                pendingConnects.each(function (c) {
                    self.doConnection(c.socket, c.callback);
                });
            }
        }, {once:true});
        self._sendingAjaxEngine.request({jsonData:{action:self.serviceAction, subAction:"hand-shake", groupId:self._groupId, service:socket._service, parameter:socket._parameter, responseDelay:((socket._responseDelay >= 0) ? socket._responseDelay : -1)}}, {callback:function (success, result) {
            if (success) {
                var data = result.getJsonData();
                self._groupId = data.groupId;
                socket._connected(data.socketId);
                self._sockets.append(socket);
                self._socketIds.push(socket._socketId);
                if (!self._polling) {
                    self._pollingErrorTimes = 0;
                    self.poll();
                }
                $callback(callback, success, data.returnValue);
            } else {
                $callback(callback, success, result.exception);
            }
        }});
    }, disconnect:function (socket, callback) {
        var self = this;
        socket._setState("disconnecting");
        self._sockets.remove(socket);
        self._socketIds.remove(socket._socketId);
        self._sendingAjaxEngine.request({jsonData:{action:self.serviceAction, subAction:"disconnect", socketId:socket._socketId}}, {callback:function (success, result) {
            if (success) {
                socket._disconnected();
            }
            $callback(callback, success, result);
        }});
    }, destroy:function () {
        this._sockets.each(function (socket) {
            socket._disconnected();
        });
    }, poll:function (callback) {
        var self = this;
        if (!self._groupId) {
            throw new dorado.Exception("Polling groupId undefined.");
        }
        self._polling = true;
        self._pollingAjaxEngine.request({jsonData:{action:self.serviceAction, subAction:"poll", groupId:self._groupId, socketIds:self._socketIds}}, {callback:function (success, result) {
            if (!success) {
                self._pollingErrorTimes++;
            }
            if (self._pollingErrorTimes < 5 && self._sockets.size) {
                self.poll(callback);
            } else {
                self._polling = false;
            }
            if (!success && result.exception instanceof dorado.util.AjaxException && result.status == 0) {
                dorado.Exception.removeException(result.exception);
            }
            if (success && result) {
                var messages = result.getJsonData();
                messages.each(function (wrapper) {
                    var socket = self._sockets.get(wrapper.socketId);
                    if (socket && socket._state == "connected") {
                        try {
                            var message = wrapper.message;
                            if (message.type == "$terminate") {
                                socket._disconnected();
                                return;
                            }
                            socket._received(message.type, message.data);
                        }
                        catch (e) {
                            dorado.Exception.processException(e);
                        }
                    }
                });
            }
            $callback(callback, success, result);
        }});
    }, stopPoll:function (callback) {
        var self = this;
        if (!self._groupId) {
            throw new dorado.Exception("Polling groupId undefined.");
        }
        self._sendingAjaxEngine.request({jsonData:{action:self.serviceAction, subAction:"stop-poll", groupId:self._groupId}}, {callback:function (success, result) {
            if (success) {
                $callback(callback, success, result.getJsonData());
            } else {
                $callback(callback, success, result.exception);
            }
        }});
    }, send:function (socket, type, data, callback) {
        var self = this;
        self._sendingAjaxEngine.request({jsonData:{action:self.serviceAction, subAction:"send", socketId:socket._socketId, type:type, data:data}}, {callback:function (success, result) {
            if (success) {
                $callback(callback, success, result.getJsonData());
            } else {
                $callback(callback, success, result.exception);
            }
        }});
    }});
    dorado.Socket = $extend([dorado.AttributeSupport, dorado.EventSupport], {$className:"dorado.Socket", ATTRIBUTES:{service:{}, parameter:{}, protocol:{readOnly:true}, state:{readOnly:true, defaultValue:"disconnected"}, connected:{readOnly:true, getter:function () {
        return this._state == "connected";
    }}}, EVENTS:{onConnect:{}, onDisconnect:{}, onStateChange:{}, onReceive:{}, onSend:{}}, constructor:function (options) {
        this._protocol = this.getSocketProtocol();
        $invokeSuper.call(this, [options]);
        if (options) {
            this.set(options);
        }
    }, _setState:function (state) {
        if (this._state != state) {
            var oldState = this._state;
            this._state = state;
            this.fireEvent("onStateChange", this, {oldState:oldState, state:state});
        }
    }, _received:function (type, data) {
        var socket = this;
        socket.fireEvent("onReceive", socket, {type:type, data:data});
    }, connect:function (callback) {
        var socket = this;
        if (socket._state != "disconnected") {
            throw new dorado.Exception("Illegal socket state.");
        }
        socket._protocol.connect(socket, callback);
    }, _connected:function (socketId) {
        var socket = this;
        socket._socketId = socketId;
        socket._setState("connected");
        socket.fireEvent("onConnect", socket);
    }, disconnect:function (callback) {
        var socket = this;
        if (socket._state != "connected") {
            throw new dorado.Exception("Not connected yet.");
        }
        socket._protocol.disconnect(socket, callback);
    }, _disconnected:function () {
        var socket = this;
        socket._setState("disconnected");
        socket.fireEvent("onDisconnect", socket);
        delete socket._socketId;
    }, send:function (type, data, callback) {
        var socket = this;
        if (socket._state != "connected") {
            throw new dorado.Exception("Not connected yet.");
        }
        socket._protocol.send(socket, type, data, {callback:function (success, packet) {
            if (success) {
                socket.fireEvent("onSend", socket, {type:type, data:data});
            }
            $callback(callback, success, packet);
        }});
    }});
    var defaultSocketProtocol;
    dorado.LongPollingSocket = $extend(dorado.Socket, {ATTRIBUTES:{responseDelay:{defaultValue:-1}}, getSocketProtocol:function () {
        if (!defaultSocketProtocol) {
            defaultSocketProtocol = new dorado.LongPollingProtocol();
        }
        return defaultSocketProtocol;
    }});
    dorado.Socket.connect = function (options, callback) {
        var socket = new dorado.LongPollingSocket(options);
        socket.connect(callback);
        return socket;
    };
    jQuery(window).unload(function () {
        if (defaultSocketProtocol) {
            defaultSocketProtocol.destroy();
        }
    });
})();

