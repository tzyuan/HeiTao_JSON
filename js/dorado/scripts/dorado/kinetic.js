


(function () {
    dorado.widget.Kinetic = $extend(dorado.widget.Control, {$className:"dorado.widget.Kinetic", _inherentClassName:"i-kinetic", ATTRIBUTES:{className:{defaultValue:"d-kinetic"}}, createDom:function (dom) {
        var dom = document.createElement("DIV");
        if (dorado.Browser.msie && dorado.Browser.version < 9) {
            var warn = $resource("dorado.core.html5CompatibilityWarning", "<canvas>");
            dom.innerText = warn;
            dom.title = warn;
        } else {
            this._stage = new Kinetic.Stage({container:dom});
        }
        return dom;
    }, getStage:function () {
        return this._stage;
    }, resetDimension:function (forced) {
        var changed = $invokeSuper.call(this, [forced]), shouldRepaint = false;
        if (changed) {
            var stage = this.getStage();
            if (stage) {
                var dom = this.getDom();
                stage.setSize(dom.clientWidth, dom.clientHeight);
            }
        }
        return changed;
    }});
})();

