var $import, $load, $packagesConfig = window.$packagesConfig || {};
$packagesConfig.defaultContentType = $packagesConfig.defaultContentType || "text/javascript";
var _NULL_FUNCTION = function() {};
(function() {
	var failsafe = {};
	var Browser = {};
	var ua = navigator.userAgent.toLowerCase(),
		s;
	(s = ua.match(/msie ([\d.]+)/)) ? Browser.msie = s[1]: (s = ua.match(/firefox\/([\d.]+)/)) ? Browser.mozilla = s[1] : (s = ua.match(/chrome\/([\d.]+)/)) ? Browser.chrome = s[1] : (s = ua.match(/opera.([\d.]+)/)) ? Browser.opera = s[1] : (s = ua.match(/version\/([\d.]+).*safari/)) ? Browser.safari = s[1] : 0;
	var activeX = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];

	function createXMLHttpRequest() {
		try {
			return new XMLHttpRequest();
		} catch (e) {
			for (var i = 0; i < this.activeX.length; ++i) {
				try {
					return new ActiveXObject(this.activeX[i]);
				} catch (e) {}
			}
		}
	}

	function getContentViaAjax(url, callback) {
		var xmlHttp = createXMLHttpRequest();
		if (callback) {
			xmlHttp.onReadyStateChange = function() {
				if (xmlHttp.readyState == 4) {
					xmlHttp.onreadystatechange = _NULL_FUNCTION;
					if (xmlHttp.status == 200 || xmlHttp.status == 304) {
						callback(xmlHttp.responseText);
					} else {
						alert("XML request error: " + xmlHttp.statusText + " (" + xmlHttp.status + ")");
					}
				}
			};
			xmlHttp.open("GET", url, true);
			xmlHttp.send(null);
		} else {
			xmlHttp.open("GET", url, false);
			xmlHttp.send(null);
			if (xmlHttp.status == 200 || xmlHttp.status == 304) {
				return xmlHttp.responseText;
			} else {
				alert("XML request error: " + xmlHttp.statusText + " (" + xmlHttp.status + ")");
				return "";
			}
		}
	}
	var head;

	function findHead() {
		head = document.getElementsByTagName("head")[0] || document.documentElement;
	}
	var loadedPackages = {};

	function getNeededs(pkgs) {
		function findNeededs(pkgs, context) {
			for (var i = 0; i < pkgs.length; i++) {
				var pkg = pkgs[i];
				var def = packages[pkg];
				if (def && def.depends) {
					var depends = def.depends;
					findNeededs(depends instanceof Array ? depends : depends.split(","), context);
				}
				if (!loadedPackages[pkg] && !context.added[pkg]) {
					context.added[pkg] = true;
					context.needed.push(pkg);
				}
			}
		}
		var packages = $packagesConfig.packages || failsafe,
			context = {
				added: {},
				needed: []
			};
		findNeededs(pkgs, context);
		return context.needed;
	}

	function getRequests(pkgs) {
		function mergePkgs(request) {
			var pattern = request.pattern;
			var fileNames = request["package"].join(",");
			request.url = pattern.url.replace(/\$\{fileName\}/g, encodeURI(fileNames).replace(/\//g, "^"));
		}
		var patterns = $packagesConfig.patterns || failsafe;
		var packages = $packagesConfig.packages || failsafe;
		var defaultPattern = patterns["default"] || failsafe;
		var tempRequests = [],
			toLast;
		for (var i = 0; i < pkgs.length; i++) {
			var pkg = pkgs[i];
			var def = packages[pkg],
				pattern, fileNames, contentType, charset;
			if (def) {
				pattern = patterns[def.pattern];
				fileNames = def.fileName;
				contentType = def.contentType;
				charset = def.charset;
			} else {
				alert("Unknown package [" + pkg + "].");
				continue;
			}
			pattern = pattern || defaultPattern;
			if (!fileNames) {
				fileNames = pkg;
			}
			if (!contentType) {
				contentType = pattern.contentType || $packagesConfig.defaultContentType;
			}
			if (!charset) {
				charset = pattern.charset || $packagesConfig.defaultCharset;
			}
			if (typeof fileNames == "string") {
				fileNames = fileNames.split(",");
			}
			for (var j = 0; j < fileNames.length; j++) {
				var fileName = fileNames[j];
				if (fileName.indexOf("(none)") >= 0) {
					continue;
				}
				var request = {
					id: "_package_" + pkg,
					"package": pkg,
					url: (pattern.url ? pattern.url.replace(/\$\{fileName\}/g, fileName) : fileName),
					contentType: contentType,
					charset: charset,
					pattern: pattern
				};
				if (isJavaScript(request.contentType)) {
					tempRequests.push(request);
				} else {
					if (!toLast) {
						toLast = [];
					}
					toLast.push(request);
				}
			}
		}
		if (toLast) {
			tempRequests.push.apply(tempRequests, toLast);
		}
		var requests = [],
			mergedRequest;
		for (var i = 0; i < tempRequests.length; i++) {
			var request = tempRequests[i];
			if (mergedRequest && mergedRequest.pattern != request.pattern) {
				mergePkgs(mergedRequest);
				mergedRequest = null;
			}
			if (request.pattern.mergeRequests) {
				var pkg = request["package"];
				if (!mergedRequest) {
					mergedRequest = request;
					delete mergedRequest.id;
					request["package"] = [];
					requests.push(request);
				}
				mergedRequest["package"].push(pkg);
			} else {
				requests.push(request);
			}
		}
		if (mergedRequest) {
			mergePkgs(mergedRequest);
		}
		for (var i = 0; i < requests.length; i++) {
			var request = requests[i];
			if (request.url.charAt(0) == ">") {
				var s1 = $packagesConfig.contextPath || "/",
					s2 = request.url.substring(1);
				if (s1) {
					if (s1.charAt(s1.length - 1) == "/") {
						if (s2.charAt(0) == "/") {
							s2 = s2.substring(1);
						}
					} else {
						if (s2.charAt(0) != "/") {
							s2 = "/" + s2;
						}
					}
				}
				request.url = s1 + s2;
			}
		}
		return requests;
	}
	var $readyState;
	if ((Browser.mozilla || Browser.opera) && document.readyState != "loading") {
		function onLoad() {
			$readyState = "complete";
			document.removeEventListener("DOMContentLoaded", onLoad, false);
		}
		$readyState = "loading";
		document.addEventListener("DOMContentLoaded", onLoad, false);
	}

	function isStyleSheet(contentType) {
		return contentType == "text/css";
	}

	function isJavaScript(contentType) {
		return contentType == "text/javascript";
	}

	function markRequestLoaded(request) {
		var pkg = request["package"];
		if (pkg instanceof Array) {
			for (var j = 0; j < pkg.length; j++) {
				loadedPackages[pkg[j]] = true;
			}
		} else {
			loadedPackages[pkg] = true;
		}
	}

	function loadResourceAsync(request, options, callback) {
		function onLoaded(element) {
			element.onreadystatechange = element.onload = null;
			head.removeChild(element);
		}
		var element;
		if (isStyleSheet(request.contentType)) {
			element = document.createElement("link");
			if (request.id) {
				element.id = request.id;
			}
			element.rel = "stylesheet";
			element.type = request.contentType;
			element.href = request.url;
			if (callback) {
				callback(request);
			}
		} else {
			if (isJavaScript(request.contentType)) {
				element = document.createElement("script");
				if (Browser.msie) {
					element.onreadystatechange = function() {
						if (/loaded|complete/.test(this.readyState)) {
							if (callback) {
								callback(request);
							}
							onLoaded(this);
						}
					};
				} else {
					element.onload = function() {
						if (callback) {
							callback(request);
						}
						onLoaded(this);
					};
				}
				if (request.id) {
					element.id = request.id;
				}
				element.type = request.contentType;
				element.charset = request.charset;
				element.src = request.url;
			} else {
				element = document.createElement("script");
				if (request.id) {
					element.id = request.id;
				}
				element.type = request.contentType;
				element.charset = request.charset;
				getContentViaAjax(request.url, function(content) {
					element.text = content;
					if (callback) {
						callback(content);
					}
				});
			}
		}
		head.insertBefore(element, head.firstChild);
		markRequestLoaded(request);
	}

	function loadResourcesAsync(requests, options, callback) {
		function scriptCallback(request) {
			if (++loaded < requests.length) {
				loadResourceAsync(requests[loaded], options, scriptCallback);
			} else {
				callback.call(scope);
			}
		}
		var scope = options ? options.scope : null,
			loaded = 0;
		findHead();
		loadResourceAsync(requests[loaded], options, scriptCallback);
	}

	function loadResource(request, options) {
		var typeAndCharset = "type=\"" + request.contentType + "\" " + (request.charset ? "charset=\"" + request.charset + "\" " : "");
		var attrs = request.id ? ("id=\"" + request.id + "\" ") : "";
		if (isStyleSheet(request.contentType)) {
			document.writeln("<link " + attrs + "rel=\"stylesheet\" " + typeAndCharset + "href=\"" + request.url + "\" />");
		} else {
			if (isJavaScript(request.contentType)) {
				document.writeln("<script " + attrs + typeAndCharset + "src=\"" + request.url + "\"></script>");
			} else {
				findHead();
				var element = document.createElement("script");
				if (request.id) {
					element.id = request.id;
				}
				element.type = request.contentType;
				element.charset = request.charset;
				element.text = getContentViaAjax(request.url);
				head.insertBefore(element, head.firstChild);
			}
		}
		markRequestLoaded(request);
	}

	function doLoadResources(requests, options) {
		for (var i = 0; i < requests.length; i++) {
			var request = requests[i];
			loadResource(request, options);
		}
	}

	function loadResources(requests, options, callback) {
		try {
			if (callback) {
				var scope = options ? options.scope : null;
				if (requests.length) {
					loadResourcesAsync(requests, options, callback);
				} else {
					callback.call(options ? options.scope : null);
				}
			} else {
				if (requests.length) {
					if (!(/loaded|complete/.test($readyState || document.readyState))) {
						doLoadResources(requests, options);
					} else {
						throw new Error("Can not load script synchronous after the document is ready.");
					}
				}
			}
		} catch (e) {
			alert(e.description || e);
		}
	}
	$import = function(pkgs, options) {
		function getOption(p) {
			return ((!options || typeof options[p] == "undefined") ? options : $packagesConfig)[p];
		}
		var callback;
		if (typeof options == "function") {
			callback = options;
			options = null;
		} else {
			if (typeof options == "object") {
				callback = options.callback;
			}
		}
		if (!pkgs) {
			if (callback) {
				callback.call(options ? options.scope : null);
			}
			return;
		}
		if (pkgs instanceof Array) {
			var v = [];
			for (var i = 0; i < pkgs.length; i++) {
				v.concat(pkgs[i].split(","));
			}
			pkgs = v;
		} else {
			pkgs = pkgs.split(",");
		}
		pkgs = getNeededs(pkgs);
		loadResources(getRequests(pkgs), options, callback);
	};
	$load = function(urls, options) {
		if (urls instanceof Array) {
			var v = [];
			for (var i = 0; i < urls.length; i++) {
				v.concat(urls[i].split(","));
			}
			urls = v;
		} else {
			urls = urls.split(",");
		}
		var type, callback;
		if (typeof options == "string") {
			type = options;
			options = null;
		} else {
			if (typeof options == "function") {
				callback = options;
				options = null;
			} else {
				if (options instanceof Object) {
					callback = options.callback;
				}
			}
		}
		var requests = [],
			options = options || {};
		for (var i = 0; i < urls.length; i++) {
			var url = urls[i],
				contentType;
			if (!url) {
				continue;
			}
			if (type == "css" || url.toLowerCase().match("css$") == "css") {
				contentType = "text/css";
			}
			requests.push({
				url: url,
				charset: options.charset || $packagesConfig.defaultCharset,
				contentType: contentType || options.contentType || $packagesConfig.defaultContentType
			});
		}
		loadResources(requests, options, callback);
	};
})();

$packagesConfig.packages = {
	"common": {
		"pattern": "dorado-js",
		"fileName": "(none)"
	},
	"silk": {
		"pattern": "dorado-css",
		"fileName": "resources\/icons\/silk\/silk"
	},
	"font-awesome-support": {
		"pattern": "dorado-css",
		"fileName": "resources\/icons\/font-awesome\/font-face"
	},
	"font-awesome": {
		"pattern": "dorado-css",
		"depends": "font-awesome-support",
		"fileName": "resources\/icons\/font-awesome\/font-awesome"
	},
	"entypo-support": {
		"pattern": "dorado-css",
		"fileName": "resources\/icons\/entypo\/font-face"
	},
	"entypo": {
		"pattern": "dorado-css",
		"depends": "entypo-support",
		"fileName": "resources\/icons\/entypo\/entypo"
	},
	"nprogress-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/nprogress-skin"
	},
	"nprogress": {
		"pattern": "dorado-js",
		"depends": "nprogress-skin",
		"fileName": "scripts\/nprogress\/nprogress"
	},
	"jquery": {
		"pattern": "dorado-js",
		"fileName": "scripts\/jquery\/jquery-1.11.0"
	},
	"jquery-ui": {
		"pattern": "dorado-js",
		"depends": "jquery",
		"fileName": "scripts\/jquery\/jquery-ui-1.10.4.custom"
	},
	"jquery-plugins": {
		"pattern": "dorado-js",
		"depends": "jquery",
		"fileName": [
			"scripts\/jquery\/jquery.easing.1.3",
			"scripts\/jquery\/jquery.mousewheel",
			"scripts\/jquery\/jquery.hotkeys",
			"scripts\/jquery\/jquery.swfobject.1-1-1",
			"scripts\/jquery\/jquery.textarea"
		]
	},
	"json2": {
		"pattern": "dorado-js",
		"fileName": "scripts\/json\/json2"
	},
	"underscore": {
		"pattern": "dorado-js",
		"fileName": "scripts\/underscore\/underscore"
	},
	"core-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/core-skin"
	},
	"core": {
		"pattern": "dorado-js",
		"depends": "jquery,jquery-ui,json2,underscore,core-skin",
		"fileName": [
			"scripts\/dorado\/core",
			"resources\/i18n\/core${locale}"
		]
	},
	"touch-patch": {
		"pattern": "dorado-js",
		"depends": "core",
		"fileName": "scripts\/dorado\/touch-patch"
	},
	"desktop-support-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/desktop-support-skin"
	},
	"desktop-support": {
		"pattern": "dorado-js",
		"depends": "jquery-plugins,core,desktop-support-skin",
		"fileName": "scripts\/dorado\/desktop-support"
	},
	"data": {
		"pattern": "dorado-js",
		"depends": "core",
		"fileName": [
			"scripts\/dorado\/data",
			"resources\/i18n\/data${locale}"
		]
	},
	"widget-support-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/widget-support-skin"
	},
	"widget-support": {
		"pattern": "dorado-js",
		"depends": "touch-patch,data,widget-support-skin",
		"fileName": [
			"scripts\/dorado\/widget-support",
			"skins\/~current\/support",
			"resources\/i18n\/widget-support${locale}"
		]
	},
	"widget": {
		"pattern": "dorado-js",
		"depends": "widget-support",
		"fileName": "(none)"
	},
	"base-widget-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/base-widget-skin"
	},
	"base-widget": {
		"pattern": "dorado-js",
		"depends": "widget,base-widget-skin",
		"fileName": [
			"scripts\/dorado\/base-widget",
			"resources\/i18n\/base-widget${locale}"
		]
	},
	"base-widget-desktop-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/base-widget-desktop-skin"
	},
	"base-widget-desktop": {
		"pattern": "dorado-js",
		"depends": "desktop-support,base-widget,base-widget-desktop-skin",
		"fileName": [
			"scripts\/dorado\/base-widget-desktop",
			"resources\/i18n\/base-widget-desktop${locale}"
		]
	},
	"grid-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/grid-skin"
	},
	"grid": {
		"pattern": "dorado-js",
		"depends": "base-widget-desktop,grid-skin",
		"fileName": [
			"scripts\/dorado\/grid",
			"resources\/i18n\/grid${locale}"
		]
	},
	"tree-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/tree-skin"
	},
	"tree": {
		"pattern": "dorado-js",
		"depends": "base-widget-desktop,tree-skin",
		"fileName": [
			"scripts\/dorado\/tree",
			"resources\/i18n\/tree${locale}"
		]
	},
	"block-view-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/block-view-skin"
	},
	"block-view": {
		"pattern": "dorado-js",
		"depends": "base-widget-desktop,block-view-skin",
		"fileName": "scripts\/dorado\/block-view"
	},
	"tree-grid": {
		"pattern": "dorado-js",
		"depends": "grid,tree",
		"fileName": "scripts\/dorado\/tree-grid"
	},
	"debugger-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/debugger-skin"
	},
	"debugger": {
		"pattern": "dorado-js",
		"depends": "base-widget,debugger-skin",
		"fileName": [
			"scripts\/dorado\/debugger",
			"resources\/i18n\/debugger${locale}"
		]
	},
	"tag-editor-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/tag-editor-skin"
	},
	"tag-editor": {
		"pattern": "dorado-js",
		"depends": "base-widget-desktop,list,tag-editor-skin",
		"fileName": "scripts\/dorado\/tag-editor"
	},
	"color-picker-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/color-picker-skin"
	},
	"color-picker": {
		"pattern": "dorado-js",
		"depends": "base-widget-desktop,color-picker-skin",
		"fileName": "scripts\/dorado\/color-picker"
	},
	"list": {
		"pattern": "dorado-js",
		"depends": "base-widget-desktop",
		"fileName": "(none)"
	},
	"jquery-plugins-touch": {
		"pattern": "dorado-js",
		"depends": "jquery",
		"fileName": "scripts\/jquery\/jquery.easing.1.3"
	},
	"touch-support-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/touch-support-skin"
	},
	"touch-support": {
		"pattern": "dorado-js",
		"depends": "jquery-plugins-touch,core,font-awesome,touch-support-skin,entypo-support",
		"fileName": "scripts\/dorado\/touch-support"
	},
	"widget-touch-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/widget-touch-skin"
	},
	"widget-touch": {
		"pattern": "dorado-js",
		"depends": "widget-touch-skin",
		"fileName": "scripts\/dorado\/widget-touch"
	},
	"base-widget-touch-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/base-widget-touch-skin"
	},
	"base-widget-touch": {
		"pattern": "dorado-js",
		"depends": "touch-support,base-widget,widget-touch,base-widget-touch-skin",
		"fileName": [
			"scripts\/dorado\/base-widget-touch",
			"resources\/i18n\/base-widget-touch${locale}"
		]
	},
	"base-widget-platform": {
		"pattern": "dorado-js",
		"depends": "base-widget-touch",
		"fileName": "(none)"
	},
	"desktop-touch-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/desktop-touch-skin"
	},
	"desktop-touch": {
		"pattern": "dorado-js",
		"depends": "base-widget-touch,desktop-touch-skin",
		"fileName": "scripts\/dorado\/desktop-touch"
	},
	"touch-grid-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/touch-grid-skin"
	},
	"touch-grid": {
		"pattern": "dorado-js",
		"depends": "base-widget-touch,touch-grid-skin",
		"fileName": [
			"scripts\/dorado\/touch-grid",
			"resources\/i18n\/touch-grid${locale}"
		]
	},
	"intro-skins": {
		"pattern": "dorado-css",
		"fileName": "skins\/default\/intro"
	},
	"intro": {
		"pattern": "dorado-js",
		"depends": "widget,intro-skins",
		"fileName": [
			"scripts\/intro\/intro",
			"scripts\/dorado\/intro"
		]
	},
	"html-editor-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/html-editor-skin"
	},
	"html-editor": {
		"pattern": "dorado-js",
		"depends": "base-widget,list,html-editor-skin",
		"fileName": "scripts\/dorado\/html-editor"
	},
	"raphael": {
		"pattern": "dorado-js",
		"depends": "widget",
		"fileName": [
			"scripts\/raphael\/raphael",
			"scripts\/dorado\/raphael"
		]
	},
	"criteria-builder-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/criteria-builder-skin"
	},
	"criteria-builder": {
		"pattern": "dorado-js",
		"depends": "raphael,criteria-builder-skin",
		"fileName": [
			"scripts\/dorado\/criteria-builder",
			"resources\/i18n\/criteria-builder${locale}"
		]
	},
	"desktop-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/desktop-skin"
	},
	"desktop": {
		"pattern": "dorado-js",
		"depends": "base-widget,desktop-skin",
		"fileName": "scripts\/dorado\/desktop"
	},
	"portal-skin": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/portal-skin"
	},
	"portal": {
		"pattern": "dorado-js",
		"depends": "base-widget-desktop,portal-skin",
		"fileName": "scripts\/dorado\/portal"
	},
	"map-skins": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/map-skins"
	},
	"map": {
		"pattern": "dorado-js",
		"depends": "widget,raphael,map-skins,map-china",
		"fileName": "scripts\/dorado\/map"
	},
	"map-china": {
		"pattern": "dorado-js",
		"fileName": "scripts\/dorado\/map-china"
	},
	"map-China-anhui": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-anhui"
	},
	"map-China-beijing": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-beijing"
	},
	"map-China-china": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-china"
	},
	"map-China-chongqing": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-chongqing"
	},
	"map-China-fujian": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-fujian"
	},
	"map-China-gansu": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-gansu"
	},
	"map-China-guangdong": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-guangdong"
	},
	"map-China-guangxi": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-guangxi"
	},
	"map-China-guizhou": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-guizhou"
	},
	"map-China-hainan": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-hainan"
	},
	"map-China-hebei": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-hebei"
	},
	"map-China-heilongjiang": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-heilongjiang"
	},
	"map-China-henan": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-henan"
	},
	"map-China-hubei": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-hubei"
	},
	"map-China-hunan": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-hunan"
	},
	"map-China-jiangsu": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-jiangsu"
	},
	"map-China-jiangxi": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-jiangxi"
	},
	"map-China-jilin": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-jilin"
	},
	"map-China-liaoning": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-liaoning"
	},
	"map-China-neimenggu": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-neimenggu"
	},
	"map-China-ningxia": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-ningxia"
	},
	"map-China-qinghai": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-qinghai"
	},
	"map-China-sanxi": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-sanxi"
	},
	"map-China-shandong": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-shandong"
	},
	"map-China-shanghai": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-shanghai"
	},
	"map-China-shanxi": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-shanxi"
	},
	"map-China-sichuan": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-sichuan"
	},
	"map-China-taiwan": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-taiwan"
	},
	"map-China-tianjin": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-tianjin"
	},
	"map-China-xinjiang": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-xinjiang"
	},
	"map-China-xizang": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-xizang"
	},
	"map-China-yunnan": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-yunnan"
	},
	"map-China-zhejiang": {
		"pattern": "dorado-js",
		"depends": "map",
		"fileName": "scripts\/dorado\/map-China-zhejiang"
	},
	"xchart": {
		"pattern": "dorado-js",
		"depends": "widget",
		"fileName": "scripts\/dorado\/xchart"
	},
	"qrcode-image-skins": {
		"pattern": "dorado-css",
		"fileName": "skins\/~current\/qrcode-image-skins"
	},
	"qrcode-image": {
		"pattern": "dorado-js",
		"depends": "base-widget,qrcode-image-skins",
		"fileName": "scripts\/dorado\/qrcode-image"
	},
	"explorer-canvas": {
		"pattern": "dorado-js",
		"fileName": "scripts\/explorer-canvas\/excanvas"
	},
	"canvas": {
		"pattern": "dorado-js",
		"depends": "widget,explorer-canvas",
		"fileName": "scripts\/dorado\/canvas"
	},
	"kinetic": {
		"pattern": "dorado-js",
		"depends": "widget",
		"fileName": [
			"scripts\/kinetic\/kinetic-v4.6.0",
			"scripts\/dorado\/kinetic"
		]
	},
	"chart": {
		"pattern": "dorado-js",
		"depends": "widget",
		"fileName": "scripts\/dorado\/chart"
	},
};
$packagesConfig.patterns = {
	"dorado-js": {
		contentType: "text/javascript",
		charset: "UTF-8",
		url: ">dorado/${fileName}.js"
	},
	"dorado-css": {
		contentType: "text/css",
		charset: "UTF-8",
		url: ">dorado/${fileName}.css"
	}
};
$packagesConfig.packages = $packagesConfig.packages || {};

(function() {

	function apply(target, source) {
		if (!source) {
			return;
		}
		for (var p in source) {
			target[p] = source[p];
		}
	}

	if (!window.$setting) {
		window.$setting = {};
	}

	window.$setting["ajax.defaultOptions"] = {
		autoBatchEnabled: true
	};

	window.CLIENT_TYPE = undefined;

	var scripts = document.scripts,
		contextPath;
	for (var i = 0; i < scripts.length; i++) {
		var src = scripts[i].src,
			index = src.indexOf("dorado/boot.js");
		if (index > -1) {
			var hashIndex = src.lastIndexOf("#");
			if (hashIndex > -1) {
				var hash = src.substring(hashIndex + 1);
				window.CLIENT_TYPE = (hash.toLowerCase() == "touch") ? "touch" : "desktop";
				$setting["common.simulateTouch"] = (CLIENT_TYPE == "touch");
			}

			src = src.substring(0, index);
			if (src.indexOf(location.origin) == 0) {
				src = src.substring(location.origin.length);
			}

			$setting["common.contextPath"] = contextPath = src;
			$setting["widget.skinRoot"] = ">dorado/skins/";
			break;
		}
	}

	$packagesConfig.contextPath = contextPath;

	window.mergeConfig = function(config) {
		apply($setting, config.setting);
		apply($packagesConfig.patterns, config.patterns);
		apply($packagesConfig.packages, config.packages);
	}

	var oldImport = $import,
		inited;
	$import = function() {
		if (!inited) {
			inited = true;

			var pkgCore = $packagesConfig.packages["widget"];
			pkgCore.depends += (',' + (CLIENT_TYPE || "desktop") + "-support");

			var skin = $setting["widget.skin"],
				locale = $setting["common.locale"];
			if (locale) {
				locale = '.' + locale;
			}

			for (var p in $packagesConfig.packages) {
				var pkg = $packagesConfig.packages[p];
				if (pkg && pkg.fileName) {
					if (pkg.fileName instanceof Array) {
						for (var i = 0; i < pkg.fileName.length; i++) {
							pkg.fileName[i] = pkg.fileName[i].replace(
								/\$\{locale\}/g, locale);
							pkg.fileName[i] = pkg.fileName[i].replace(
								/\~current/g, skin);
						}
					} else {
						pkg.fileName = pkg.fileName.replace(/\$\{locale\}/g,
							locale);
						pkg.fileName = pkg.fileName.replace(/\~current/g, skin);
					}
				}
			}
		}
		oldImport.apply(this, arguments);
	}

	$load(contextPath + "dorado/config.js", {
		immediately: true
	});
})();