


(function () {
    dorado.widget.Raphael = $extend(dorado.widget.Control, {$className:"dorado.widget.Raphael", _inherentClassName:"i-Raphael", ATTRIBUTES:{className:{defaultValue:"d-Raphael"}}, createDom:function (dom) {
        var dom = document.createElement("DIV");
        this._paper = new Raphael(dom);
        return dom;
    }, getPaper:function () {
        return this._paper;
    }, resetDimension:function (forced) {
        var changed = $invokeSuper.call(this, [forced]), shouldRepaint = false;
        if (changed) {
            var paper = this.getPaper(), dom = this.getDom();
            paper.setSize(dom.clientWidth, dom.clientHeight);
        }
        return changed;
    }});
})();

