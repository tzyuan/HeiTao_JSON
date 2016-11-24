


(function () {
    dorado.widget.Intro = $extend(dorado.widget.Component, {$className:"dorado.widget.Intro", ATTRIBUTES:{steps:{}, name:{}, nextLabel:{defaultValue:"Next &rarr;", setter:function (value) {
        if (value) {
            this._nextLabel = value;
            this._proxy.setOption("nextLabel", value);
        }
    }}, prevLabel:{defaultValue:"&larr; Back", setter:function (value) {
        if (value) {
            this._prevLabel = value;
            this._proxy.setOption("prevLabel", value);
        }
    }}, skipLabel:{defaultValue:"Skip", setter:function (value) {
        if (value) {
            this._skipLabel = value;
            this._proxy.setOption("skipLabel", value);
        }
    }}, doneLabel:{defaultValue:"Done", setter:function (value) {
        if (value) {
            this._doneLabel = value;
            this._proxy.setOption("doneLabel", value);
        }
    }}, tooltipPosition:{defaultValue:"bottom"}, tooltipClass:{defaultValue:""}, exitOnEsc:{defaultValue:true}, exitOnOverlayClick:{defaultValue:true}, showStepNumbers:{defaultValue:true}, showSkipButton:{defaultValue:true, setter:function (value) {
        this._showSkipButton = value;
        this._proxy.setOption("showSkipButton", value);
    }}, showPrevButton:{defaultValue:true, setter:function (value) {
        this._showPrevButton = value;
        this._proxy.setOption("showPrevButton", value);
    }}, showNextButton:{defaultValue:true, setter:function (value) {
        this._showNextButton = value;
        this._proxy.setOption("showNextButton", value);
    }}}, EVENTS:{onBeforeStart:{}, onStart:{}, onBeforeChange:{}, onChange:{}, onExit:{}, onComplete:{}}, constructor:function (config) {
        var proxy = this._proxy = introJs(), intro = this;
        dorado.widget.Component.prototype.constructor.call(this, config);
        proxy.onbeforechange(function (element) {
            intro._onBeforeChange.call(intro, element);
        });
        proxy.onchange(function (element) {
            intro._onChange.call(intro, element);
        });
        proxy.onexit(function () {
            intro._onExit.call(intro);
        });
        proxy.oncomplete(function () {
            intro._onComplete.call(intro);
        });
    }, goTo:function (step) {
        var proxy = this._proxy, index = 0;
        this.start();
        if (typeof step == "number") {
            index = step;
        } else {
            var steps = this._steps;
            for (var i = 0, len = steps.length; i < len; i++) {
                if (steps[i].name === step) {
                    index = i;
                    break;
                }
            }
        }
        index && proxy.goToStep(index + 1);
    }, exit:function () {
        var proxy = this._proxy;
        proxy.exit();
        this._onExit();
    }, start:function () {
        var intro = this, proxy = this._proxy;
        intro._refresh();
        var arg = {htmlElements:intro._introHTMLElements, processDefault:true};
        this.fireEvent("onBeforeStart", intro, arg);
        if (arg.processDefault) {
            proxy.start();
            this.fireEvent("onStart", intro, arg);
        }
    }, getStepByName:function (name) {
        var steps = this._steps;
        for (var i = 0, len = steps.length; i < len; i++) {
            var step = steps[i];
            if (step.name === name) {
                return step;
            }
        }
    }, getStepByIndex:function (index) {
        var steps = this._steps;
        return steps[index];
    }, _refresh:function () {
        var intro = this, proxy = this._proxy, steps = this._steps;
        var introSteps = [], htmlElements = [];
        for (var i = 0, len = steps.length; i < len; i++) {
            var step = steps[i];
            var htmlElement = this._getStepHTMLElement(step);
            if (htmlElement) {
                introSteps.push({intro:step.intro, element:htmlElement, position:step.position});
                htmlElements.push(htmlElement);
            }
        }
        proxy.setOptions({nextLabel:intro._nextLabel, prevLabel:intro._prevLabel, skipLabel:intro._skipLabel, doneLabel:intro._doneLabel, tooltipPosition:intro._tooltipPosition, tooltipClass:intro._tooltipClass, exitOnEsc:intro._exitOnEsc, exitOnOverlayClick:intro._exitOnOverlayClick, showStepNumbers:intro._showStepNumbers, showSkipButton:intro._showSkipButton, showNextButton:intro._showNextButton, showPrevButton:intro._showPrevButton, steps:introSteps});
        this._introHTMLElements = htmlElements;
    }, _getStepHTMLElement:function (step) {
        var view = this.get("view");
        var el = step.element, value;
        if (typeof el == "string") {
            var control = view.get("#" + el);
            value = control.getDom();
        } else {
            if (typeof el === "object") {
                if (el._uniqueId) {
                    value = el.getDom();
                }
                if (el instanceof jQuery) {
                    value = el[0];
                }
                if ((el.nodeType === 1) && (typeof el.style === "object") && (typeof el.ownerDocument === "object")) {
                    value = el;
                }
            }
        }
        return value;
    }, _getCurrentIndex:function () {
        var proxy = this._proxy;
        var index = proxy._currentStep;
        return index;
    }, _onBeforeChange:function (element) {
        var index = this._getCurrentIndex(), step = this.getStepByIndex(index);
        var view = this.get("view");
        function scroll(control) {
            var parent, parentDom, sub, subDom, viewId = view.get("id");
            sub = control;
            parent = sub.get("parent");
            do {
                var isBreak = viewId == parent.get("id");
                if (parent.getContentContainer) {
                    parentDom = parent.getContentContainer();
                    subDom = sub.getDom();
                    var subOffset = $(subDom).offset();
                    var p = $fly(parentDom), pInnerHeight = p.innerHeight(), pInnerWidth = p.innerWidth(), pScrollTop = p.scrollTop(), pScrollLeft = p.scrollLeft();
                    var overflowArr = ["visible", "hidden"], defaultOverflow = "auto", contentOverflow = parent.get("contentOverflow") || defaultOverflow, contentOverflowX = parent.get("contentOverflowX") || defaultOverflow, contentOverflowY = parent.get("contentOverflowY") || defaultOverflow;
                    if (overflowArr.indexOf(contentOverflow) < 0) {
                        if (subOffset.top < 0 || pInnerHeight < pScrollTop + subOffset.top) {
                            if (overflowArr.indexOf(contentOverflowX) < 0) {
                                $(parentDom).scrollTop(subOffset.top);
                            }
                        }
                        if (subOffset.left < 0 || pInnerWidth < pScrollLeft + subOffset.left) {
                            if (overflowArr.indexOf(contentOverflowY) < 0) {
                                $(parentDom).scrollLeft(subOffset.left);
                            }
                        }
                    }
                }
                if (isBreak) {
                    break;
                }
                sub = parent;
                parent = parent.get("parent");
            } while (true);
        }
        var el = step.element;
        if (typeof el == "string") {
        } else {
            if (typeof el === "object" && el._uniqueId) {
            }
        }
        this.fireEvent("onBeforeChange", this, {element:element, index:index, step:step});
    }, _onChange:function (element) {
        var index = this._getCurrentIndex();
        this.fireEvent("onChange", this, {element:element, index:index, step:this.getStepByIndex(index)});
    }, _onExit:function () {
        var index = this._getCurrentIndex();
        this.fireEvent("onExit", this, {currentIndex:index});
    }, _onComplete:function () {
        var index = this._getCurrentIndex();
        this.fireEvent("onComplete", this, {currentIndex:index});
    }});
    dorado.Toolkits.registerPrototype("intro", {Default:dorado.widget.Intro});
})();

