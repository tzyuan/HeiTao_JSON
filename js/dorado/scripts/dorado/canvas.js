


(function () {
    dorado.widget.Canvas = $extend(dorado.widget.Control, {$className:"dorado.widget.Canvas", _inherentClassName:"i-canvas", ATTRIBUTES:{className:{defaultValue:"d-canvas"}}, EVENTS:{onPaint:{}}, createDom:function (dom) {
        var dom = document.createElement("CANVAS");
        dom.style.display = "block";
        return dom;
    }, doOnAttachToDocument:function () {
        if (dorado.Browser.msie && dorado.Browser.version < 9) {
            this._dummyCanvas = window.G_vmlCanvasManager.initElement(this.getDom());
        }
        if (this._hasSkipPaint) {
            delete this._hasSkipPaint;
            this.repaint();
        }
    }, resetDimension:function (forced) {
        var changed = $invokeSuper.call(this, [forced]), shouldRepaint = false;
        if (changed) {
            var dom = this.getDom(), realWidth = this.getRealWidth(), realHeight = this.getRealHeight();
            if (!(typeof realWidth == "string" && realWidth.match("%")) || realWidth == "auto") {
                dom.width = realWidth;
                shouldRepaint = true;
            }
            if (!(typeof realHeight == "string" && realHeight.match("%")) || realHeight == "auto") {
                dom.height = realHeight;
                shouldRepaint = true;
            }
        }
        if (shouldRepaint && this._rendered && this._attached && this._visible && this._currentVisible) {
            this.repaint();
        } else {
            this._hasSkipPaint = true;
        }
        return changed;
    }, getContext:function (contextId) {
        if (dorado.Browser.msie && dorado.Browser.version < 9) {
            return this._dummyCanvas ? this._dummyCanvas.getContext(contextId) : null;
        } else {
            return this._dom ? this._dom.getContext(contextId) : null;
        }
    }, repaint:function () {
        this.fireEvent("onPaint", this);
    }});
})();

