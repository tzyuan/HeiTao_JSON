


(function (root, factory) {
    if (typeof exports === "object") {
        factory(exports);
    } else {
        if (typeof define === "function" && define.amd) {
            define(["exports"], factory);
        } else {
            factory(root);
        }
    }
}(this, function (exports) {
    var VERSION = "0.5.0";
    function IntroJs(obj) {
        this._targetElement = obj;
        this._options = {nextLabel:"Next &rarr;", prevLabel:"&larr; Back", skipLabel:"Skip", doneLabel:"Done", tooltipPosition:"bottom", tooltipClass:"", exitOnEsc:true, exitOnOverlayClick:true, showStepNumbers:true, showSkipButton:true, showPrevButton:true, showNextButton:true};
    }
    function _introForElement(targetElm) {
        var introItems = [], self = this;
        if (this._options.steps) {
            var allIntroSteps = [];
            for (var i = 0, stepsLength = this._options.steps.length; i < stepsLength; i++) {
                var currentItem = this._options.steps[i];
                currentItem.step = i + 1;
                if (typeof (currentItem.element) === "string") {
                    currentItem.element = document.querySelector(currentItem.element);
                }
                introItems.push(currentItem);
            }
        } else {
            var allIntroSteps = targetElm.querySelectorAll("*[data-intro]");
            if (allIntroSteps.length < 1) {
                return false;
            }
            for (var i = 0, elmsLength = allIntroSteps.length; i < elmsLength; i++) {
                var currentElement = allIntroSteps[i];
                introItems.push({element:currentElement, intro:currentElement.getAttribute("data-intro"), step:parseInt(currentElement.getAttribute("data-step"), 10), tooltipClass:currentElement.getAttribute("data-tooltipClass"), position:currentElement.getAttribute("data-position") || this._options.tooltipPosition});
            }
        }
        introItems.sort(function (a, b) {
            return a.step - b.step;
        });
        self._introItems = introItems;
        if (_addOverlayLayer.call(self, targetElm)) {
            _nextStep.call(self);
            var skipButton = targetElm.querySelector(".introjs-skipbutton"), nextStepButton = targetElm.querySelector(".introjs-nextbutton");
            self._onKeyDown = function (e) {
                if (e.keyCode === 27 && self._options.exitOnEsc == true) {
                    _exitIntro.call(self, targetElm);
                    if (self._introExitCallback != undefined) {
                        self._introExitCallback.call(self);
                    }
                } else {
                    if (e.keyCode === 37) {
                        _previousStep.call(self);
                    } else {
                        if (e.keyCode === 39 || e.keyCode === 13) {
                            _nextStep.call(self);
                            if (e.preventDefault) {
                                e.preventDefault();
                            } else {
                                e.returnValue = false;
                            }
                        }
                    }
                }
            };
            self._onResize = function (e) {
                _setHelperLayerPosition.call(self, document.querySelector(".introjs-helperLayer"));
            };
            if (window.addEventListener) {
                window.addEventListener("keydown", self._onKeyDown, true);
                window.addEventListener("resize", self._onResize, true);
            } else {
                if (document.attachEvent) {
                    document.attachEvent("onkeydown", self._onKeyDown);
                    document.attachEvent("onresize", self._onResize);
                }
            }
        }
        return false;
    }
    function _goToStep(step) {
        this._currentStep = step - 2;
        if (typeof (this._introItems) !== "undefined") {
            _nextStep.call(this);
        }
    }
    function _nextStep() {
        if (typeof (this._currentStep) === "undefined") {
            this._currentStep = 0;
        } else {
            ++this._currentStep;
        }
        if ((this._introItems.length) <= this._currentStep) {
            if (typeof (this._introCompleteCallback) === "function") {
                this._introCompleteCallback.call(this);
            }
            _exitIntro.call(this, this._targetElement);
            return;
        }
        var nextStep = this._introItems[this._currentStep];
        if (typeof (this._introBeforeChangeCallback) !== "undefined") {
            this._introBeforeChangeCallback.call(this, nextStep.element);
        }
        _showElement.call(this, nextStep);
    }
    function _previousStep() {
        if (this._currentStep === 0) {
            return false;
        }
        var nextStep = this._introItems[--this._currentStep];
        if (typeof (this._introBeforeChangeCallback) !== "undefined") {
            this._introBeforeChangeCallback.call(this, nextStep.element);
        }
        _showElement.call(this, nextStep);
    }
    function _exitIntro(targetElement) {
        var overlayLayer = targetElement.querySelector(".introjs-overlay");
        overlayLayer.style.opacity = 0;
        setTimeout(function () {
            if (overlayLayer.parentNode) {
                overlayLayer.parentNode.removeChild(overlayLayer);
            }
        }, 500);
        var helperLayer = targetElement.querySelector(".introjs-helperLayer");
        if (helperLayer) {
            helperLayer.parentNode.removeChild(helperLayer);
        }
        var showElement = document.querySelector(".introjs-showElement");
        if (showElement) {
            showElement.className = showElement.className.replace(/introjs-[a-zA-Z]+/g, "").replace(/^\s+|\s+$/g, "");
        }
        var fixParents = document.querySelectorAll(".introjs-fixParent");
        if (fixParents && fixParents.length > 0) {
            for (var i = fixParents.length - 1; i >= 0; i--) {
                fixParents[i].className = fixParents[i].className.replace(/introjs-fixParent/g, "").replace(/^\s+|\s+$/g, "");
            }
        }
        if (window.removeEventListener) {
            window.removeEventListener("keydown", this._onKeyDown, true);
        } else {
            if (document.detachEvent) {
                document.detachEvent("onkeydown", this._onKeyDown);
            }
        }
        this._currentStep = undefined;
    }
    function _placeTooltip(targetElement, tooltipLayer, arrowLayer, numberLayer) {
        $(tooltipLayer).css({top:"", right:"", bottom:"", left:""});
        $(arrowLayer).css({top:"", right:"", bottom:"", left:""});
        numberLayer && $(numberLayer).css({right:"", left:""});
        if (!this._introItems[this._currentStep]) {
            return;
        }
        var tooltipCssClass = "";
        var currentStepObj = this._introItems[this._currentStep];
        if (typeof (currentStepObj.tooltipClass) === "string") {
            tooltipCssClass = currentStepObj.tooltipClass;
        } else {
            tooltipCssClass = this._options.tooltipClass;
        }
        tooltipLayer.className = ("introjs-tooltip " + tooltipCssClass).replace(/^\s+|\s+$/g, "");
        var helperOffset = _getOffset(targetElement), toolTipOffset = _getOffset(tooltipLayer);
        var left = helperOffset.left, top = helperOffset.top, width = helperOffset.width, height = helperOffset.height, winHeight = $(window).height(), winWidth = $(window).width();
        var bottom = winHeight - (top + height), right = winWidth - (left + width);
        var bt = bottom >= top ? "bottom" : "top", lr = right >= left ? "right" : "left";
        var position, blankWidth = 10;
        if (lr == "right") {
            if (winWidth >= (left + width + toolTipOffset.width + blankWidth)) {
                position = lr;
            }
        } else {
            if (0 <= (left - toolTipOffset.width - blankWidth)) {
                position = lr;
            }
        }
        if (bt == "bottom") {
            if (winHeight >= (top + height + toolTipOffset.height + blankWidth)) {
                if (position) {
                    if (winWidth >= (left + toolTipOffset.width + blankWidth)) {
                        position = bt;
                    }
                } else {
                    position = bt;
                }
            }
        } else {
            if (0 <= (top - toolTipOffset.height - blankWidth)) {
                if (position) {
                    if (winWidth >= (left + toolTipOffset.width + blankWidth)) {
                        position = bt;
                    }
                } else {
                    position = bt;
                }
            }
        }
        if (!position) {
            position = (left >= right ? left : right) >= (top >= bottom ? top : bottom) ? lr : bt;
        }
        var currentTooltipPosition = position;
        switch (currentTooltipPosition) {
          case "right":
            if (bt == "top") {
                tooltipLayer.style.top = "1px";
                arrowLayer.style.top = "10px";
            } else {
                tooltipLayer.style.top = "1px";
                arrowLayer.style.top = "10px";
            }
            if (numberLayer) {
                numberLayer.style.right = "-16px";
            }
            tooltipLayer.style.left = (width + 15) + "px";
            arrowLayer.className = "introjs-arrow left";
            break;
          case "left":
            if (bt == "top") {
                tooltipLayer.style.bottom = "0px";
                arrowLayer.style.bottom = "10px";
            } else {
                tooltipLayer.style.top = "0px";
                arrowLayer.style.top = "10px";
            }
            if (numberLayer) {
                numberLayer.style.left = "-16px";
            }
            tooltipLayer.style.right = (width + 20) + "px";
            arrowLayer.className = "introjs-arrow right";
            break;
          case "top":
            if (lr == "left") {
                tooltipLayer.style.right = "0px";
                arrowLayer.style.right = "10px";
                if (numberLayer) {
                    numberLayer.style.left = "-16px";
                }
            } else {
                tooltipLayer.style.left = "0px";
                arrowLayer.style.left = "10px";
                if (numberLayer) {
                    numberLayer.style.right = "-16px";
                }
            }
            tooltipLayer.style.bottom = (height + 20) + "px";
            arrowLayer.className = "introjs-arrow bottom";
            break;
          case "bottom":
            if (lr == "left") {
                tooltipLayer.style.right = "0px";
                if (numberLayer) {
                    numberLayer.style.left = "-16px";
                }
                arrowLayer.style.right = "10px";
            } else {
                tooltipLayer.style.left = "0px";
                arrowLayer.style.left = "10px";
                if (numberLayer) {
                    numberLayer.style.right = "-16px";
                }
            }
            tooltipLayer.style.top = (height + 20) + "px";
            arrowLayer.className = "introjs-arrow top";
            break;
        }
    }
    function _setHelperLayerPosition(helperLayer) {
        if (helperLayer) {
            if (!this._introItems[this._currentStep]) {
                return;
            }
            var elementPosition = _getOffset(this._introItems[this._currentStep].element);
            helperLayer.setAttribute("style", "width: " + (elementPosition.width + 10) + "px; " + "height:" + (elementPosition.height + 10) + "px; " + "top:" + (elementPosition.top - 5) + "px;" + "left: " + (elementPosition.left - 5) + "px;");
        }
    }
    function _showElement(targetElement) {
        if (typeof (this._introChangeCallback) !== "undefined") {
            this._introChangeCallback.call(this, targetElement.element);
        }
        var self = this, oldHelperLayer = document.querySelector(".introjs-helperLayer"), elementPosition = _getOffset(targetElement.element);
        if (oldHelperLayer != null) {
            var oldHelperNumberLayer = oldHelperLayer.querySelector(".introjs-helperNumberLayer"), oldtooltipLayer = oldHelperLayer.querySelector(".introjs-tooltiptext"), oldArrowLayer = oldHelperLayer.querySelector(".introjs-arrow"), oldtooltipContainer = oldHelperLayer.querySelector(".introjs-tooltip");
            oldtooltipContainer.style.opacity = 0;
            _setHelperLayerPosition.call(self, oldHelperLayer);
            var fixParents = document.querySelectorAll(".introjs-fixParent");
            if (fixParents && fixParents.length > 0) {
                for (var i = fixParents.length - 1; i >= 0; i--) {
                    fixParents[i].className = fixParents[i].className.replace(/introjs-fixParent/g, "").replace(/^\s+|\s+$/g, "");
                }
            }
            var oldShowElement = document.querySelector(".introjs-showElement");
            oldShowElement.className = oldShowElement.className.replace(/introjs-[a-zA-Z]+/g, "").replace(/^\s+|\s+$/g, "");
            if (self._lastShowElementTimer) {
                clearTimeout(self._lastShowElementTimer);
            }
            self._lastShowElementTimer = setTimeout(function () {
                if (oldHelperNumberLayer != null) {
                    oldHelperNumberLayer.innerHTML = targetElement.step;
                }
                oldtooltipLayer.innerHTML = targetElement.intro;
                _placeTooltip.call(self, targetElement.element, oldtooltipContainer, oldArrowLayer, oldHelperNumberLayer);
                oldtooltipContainer.style.opacity = 1;
            }, 350);
        } else {
            var helperLayer = document.createElement("div"), arrowLayer = document.createElement("div"), tooltipLayer = document.createElement("div"), helperNumberLayer;
            helperLayer.className = "introjs-helperLayer";
            oldHelperLayer = helperLayer;
            _setHelperLayerPosition.call(self, helperLayer);
            this._targetElement.appendChild(helperLayer);
            arrowLayer.className = "introjs-arrow";
            tooltipLayer.innerHTML = "<div class=\"introjs-tooltiptext\">" + targetElement.intro + "</div><div class=\"introjs-tooltipbuttons\"></div>";
            if (this._options.showStepNumbers) {
                helperNumberLayer = document.createElement("span");
                helperNumberLayer.className = "introjs-helperNumberLayer";
                helperNumberLayer.innerHTML = targetElement.step;
                tooltipLayer.appendChild(helperNumberLayer);
            }
            tooltipLayer.appendChild(arrowLayer);
            helperLayer.appendChild(tooltipLayer);
            var tooltipButtonsLayer = tooltipLayer.querySelector(".introjs-tooltipbuttons");
            var skipTooltipButton = document.createElement("a");
            skipTooltipButton.className = "introjs-button introjs-skipbutton";
            skipTooltipButton.href = "javascript:void(0);";
            skipTooltipButton.innerHTML = this._options.skipLabel;
            skipTooltipButton.onclick = function () {
                if (self._introItems.length - 1 == self._currentStep && typeof (self._introCompleteCallback) === "function") {
                    self._introCompleteCallback.call(self);
                }
                if (self._introItems.length - 1 != self._currentStep && typeof (self._introExitCallback) === "function") {
                    self._introExitCallback.call(self);
                }
                _exitIntro.call(self, self._targetElement);
            };
            tooltipButtonsLayer.appendChild(skipTooltipButton);
            var prevTooltipButton = document.createElement("a");
            prevTooltipButton.className = "introjs-button introjs-prevbutton";
            prevTooltipButton.onclick = function () {
                if (self._currentStep != 0) {
                    _previousStep.call(self);
                }
            };
            prevTooltipButton.href = "javascript:void(0);";
            prevTooltipButton.innerHTML = this._options.prevLabel;
            if (this._introItems.length > 1) {
                tooltipButtonsLayer.appendChild(prevTooltipButton);
            }
            var nextTooltipButton = document.createElement("a");
            nextTooltipButton.className = "introjs-button introjs-nextbutton";
            nextTooltipButton.onclick = function () {
                if (self._introItems.length - 1 != self._currentStep) {
                    _nextStep.call(self);
                }
            };
            nextTooltipButton.href = "javascript:void(0);";
            nextTooltipButton.innerHTML = this._options.nextLabel;
            if (this._introItems.length > 1) {
                tooltipButtonsLayer.appendChild(nextTooltipButton);
            }
            _placeTooltip.call(self, targetElement.element, tooltipLayer, arrowLayer, helperNumberLayer);
        }
        var skipTooltipButton = $(".introjs-skipbutton", oldHelperLayer), prevTooltipButton = $(".introjs-prevbutton", oldHelperLayer), nextTooltipButton = $(".introjs-nextbutton", oldHelperLayer);
        var options = this._options;
        var hashNext = this._introItems.length - 1 == this._currentStep;
        prevTooltipButton.toggleClass("introjs-disabled", this._currentStep == 0);
        nextTooltipButton.toggleClass("introjs-disabled", hashNext);
        skipTooltipButton.css("display", options.showSkipButton ? "inline-block" : "none");
        prevTooltipButton.css("display", options.showPrevButton ? "inline-block" : "none");
        nextTooltipButton.css("display", options.showNextButton ? "inline-block" : "none");
        skipTooltipButton.html(hashNext ? options.doneLabel : options.skipLabel);
        prevTooltipButton.html(options.prevLabel);
        nextTooltipButton.html(options.nextLabel);
        options.showNextButton && nextTooltipButton.focus();
        targetElement.element.className += " introjs-showElement";
        var currentElementPosition = _getPropValue(targetElement.element, "position");
        if (currentElementPosition !== "absolute" && currentElementPosition !== "relative") {
            targetElement.element.className += " introjs-relativePosition";
        }
        var parentElm = targetElement.element.parentNode;
        while (parentElm != null) {
            if (parentElm.tagName.toLowerCase() === "body") {
                break;
            }
            var zIndex = _getPropValue(parentElm, "z-index");
            if (/[0-9]+/.test(zIndex)) {
                parentElm.className += " introjs-fixParent";
            }
            parentElm = parentElm.parentNode;
        }
        if (!_elementInViewport(targetElement.element)) {
            var rect = targetElement.element.getBoundingClientRect(), top = rect.bottom - (rect.bottom - rect.top), bottom = rect.bottom - _getWinSize().height;
            if (top < 0) {
                window.scrollBy(0, top - 30);
            } else {
                window.scrollBy(0, bottom + 100);
            }
        }
    }
    function _getPropValue(element, propName) {
        var propValue = "";
        if (element.currentStyle) {
            propValue = element.currentStyle[propName];
        } else {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                propValue = document.defaultView.getComputedStyle(element, null).getPropertyValue(propName);
            }
        }
        if (propValue && propValue.toLowerCase) {
            return propValue.toLowerCase();
        } else {
            return propValue;
        }
    }
    function _getWinSize() {
        if (window.innerWidth != undefined) {
            return {width:window.innerWidth, height:window.innerHeight};
        } else {
            var D = document.documentElement;
            return {width:D.clientWidth, height:D.clientHeight};
        }
    }
    function _elementInViewport(el) {
        var rect = el.getBoundingClientRect();
        return (rect.top >= 0 && rect.left >= 0 && (rect.bottom + 80) <= window.innerHeight && rect.right <= window.innerWidth);
    }
    function _addOverlayLayer(targetElm) {
        var overlayLayer = document.createElement("div"), styleText = "", self = this;
        overlayLayer.className = "introjs-overlay";
        if (targetElm.tagName.toLowerCase() === "body") {
            styleText += "top: 0;bottom: 0; left: 0;right: 0;position: fixed;";
            overlayLayer.setAttribute("style", styleText);
        } else {
            var elementPosition = _getOffset(targetElm);
            if (elementPosition) {
                styleText += "width: " + elementPosition.width + "px; height:" + elementPosition.height + "px; top:" + elementPosition.top + "px;left: " + elementPosition.left + "px;";
                overlayLayer.setAttribute("style", styleText);
            }
        }
        targetElm.appendChild(overlayLayer);
        overlayLayer.onclick = function () {
            if (self._options.exitOnOverlayClick == true) {
                _exitIntro.call(self, targetElm);
            }
            if (self._introExitCallback != undefined) {
                self._introExitCallback.call(self);
            }
        };
        setTimeout(function () {
            styleText += "opacity: .8;";
            overlayLayer.setAttribute("style", styleText);
        }, 10);
        return true;
    }
    function _getOffset(element) {
        var elementPosition = {};
        elementPosition.width = element.offsetWidth;
        elementPosition.height = element.offsetHeight;
        var offset = $(element).offset();
        elementPosition.top = offset.top;
        elementPosition.left = offset.left;
        return elementPosition;
    }
    function _mergeOptions(obj1, obj2) {
        var obj3 = {};
        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }
        for (var attrname in obj2) {
            obj3[attrname] = obj2[attrname];
        }
        return obj3;
    }
    var introJs = function (targetElm) {
        if (typeof (targetElm) === "object") {
            return new IntroJs(targetElm);
        } else {
            if (typeof (targetElm) === "string") {
                var targetElement = document.querySelector(targetElm);
                if (targetElement) {
                    return new IntroJs(targetElement);
                } else {
                    throw new Error("There is no element with given selector.");
                }
            } else {
                return new IntroJs(document.body);
            }
        }
    };
    introJs.version = VERSION;
    introJs.fn = IntroJs.prototype = {clone:function () {
        return new IntroJs(this);
    }, setOption:function (option, value) {
        this._options[option] = value;
        return this;
    }, setOptions:function (options) {
        this._options = _mergeOptions(this._options, options);
        return this;
    }, start:function () {
        _introForElement.call(this, this._targetElement);
        return this;
    }, goToStep:function (step) {
        _goToStep.call(this, step);
        return this;
    }, exit:function () {
        _exitIntro.call(this, this._targetElement);
    }, refresh:function () {
        _setHelperLayerPosition.call(this, document.querySelector(".introjs-helperLayer"));
        return this;
    }, onbeforechange:function (providedCallback) {
        if (typeof (providedCallback) === "function") {
            this._introBeforeChangeCallback = providedCallback;
        } else {
            throw new Error("Provided callback for onbeforechange was not a function");
        }
        return this;
    }, onchange:function (providedCallback) {
        if (typeof (providedCallback) === "function") {
            this._introChangeCallback = providedCallback;
        } else {
            throw new Error("Provided callback for onchange was not a function.");
        }
        return this;
    }, oncomplete:function (providedCallback) {
        if (typeof (providedCallback) === "function") {
            this._introCompleteCallback = providedCallback;
        } else {
            throw new Error("Provided callback for oncomplete was not a function.");
        }
        return this;
    }, onexit:function (providedCallback) {
        if (typeof (providedCallback) === "function") {
            this._introExitCallback = providedCallback;
        } else {
            throw new Error("Provided callback for onexit was not a function.");
        }
        return this;
    }};
    exports.introJs = introJs;
    return introJs;
}));

