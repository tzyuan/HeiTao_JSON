


function open_flash_chart_data() {
    return JSON.stringify({"bg_colour":"#ffffff", elements:[{"type":"pie"}]});
}
(function () {
    dorado.widget.ofc = {getForm:function (options) {
        options = options || {};
        if (!dorado.widget.ofc.downloadform) {
            var form, iframe, iframeName = "ofcDownloadIframe", formName = "ofcDownloadForm", action = $url(">dorado/ofc/imagedownload");
            var fileName, fileData;
            if (dorado.Browser.msie && dorado.Browser.version < 9) {
                fileName = document.createElement("<input type='hidden' name='fileName' />");
                fileData = document.createElement("<input type='hidden' name='fileName' />");
            } else {
                fileName = document.createElement("input");
                fileName.type = "hidden";
                fileName.name = "fileName";
                fileData = document.createElement("input");
                fileData.type = "hidden";
                fileData.name = "fileData";
            }
            if (dorado.Browser.msie && dorado.Browser.version < 9) {
                iframe = document.createElement("<iframe name='" + iframeName + "'></iframe>");
            } else {
                iframe = document.createElement("iframe");
                iframe.name = iframeName;
            }
            iframe.style.display = "none";
            if (dorado.Browser.msie && dorado.Browser.version < 9) {
                form = document.createElement("<form name ='" + formName + "' action='" + action + "' method='post' target='" + iframeName + "'></form>");
            } else {
                form = document.createElement("form");
                form.action = action;
                form.method = "post";
                form.target = iframeName;
            }
            form.appendChild(fileName);
            form.appendChild(fileData);
            document.body.appendChild(form);
            document.body.appendChild(iframe);
            dorado.widget.ofc.fileName = fileName;
            dorado.widget.ofc.fileData = fileData;
            dorado.widget.ofc.downloadform = form;
        }
        dorado.widget.ofc.fileName.value = options.fileName || "chart.png";
        dorado.widget.ofc.fileData.value = options.fileData;
        return dorado.widget.ofc.downloadform;
    }, downloadImage:function (chart, fileName) {
        var form = dorado.widget.ofc.getForm({fileName:fileName, fileData:chart.imageBinary()});
        form.submit();
    }};
    var ofc_id_seed = 1;
    function isPlainObject(o) {
        return o && Object.prototype.toString.call(o) === "[object Object]" && ("isPrototypeOf" in o);
    }
    function toJSON() {
        var object = this, result = {}, ATTRIBUTES = object.ATTRIBUTES;
        for (var attr in ATTRIBUTES) {
            var attrConfig = ATTRIBUTES[attr], jsonAttr = attrConfig.jsonProperty || attr;
            if (attrConfig.jsonable) {
                var value = object["_" + attr];
                if (value !== undefined) {
                    if (dorado.Object.isInstanceOf(value, dorado.AttributeSupport)) {
                        result[jsonAttr] = value.toJSON();
                    } else {
                        result[jsonAttr] = value;
                    }
                }
            }
        }
        return result;
    }
    dorado.widget.ofc.JSONizable = $extend(dorado.AttributeSupport, {$className:"dorado.widget.ofc.JSONizable", constructor:function (config) {
        $invokeSuper.call(this, arguments);
        if (config) {
            this.set(config);
        }
    }, toJSON:toJSON});
    dorado.widget.ofc.Text = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.Text", ATTRIBUTES:{style:{jsonable:true, defaultValue:""}, text:{jsonable:true}}});
    dorado.widget.ofc.Key = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.Key", ATTRIBUTES:{color:{jsonable:true, jsonProperty:"colour"}, fontSize:{jsonable:true, jsonProperty:"font-size"}, text:{jsonable:true}}});
    var mouseMap = {Closest:0, Proximity:1, Normal:2};
    dorado.widget.ofc.ToolTip = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.ToolTip", ATTRIBUTES:{backgroundColor:{jsonable:true, jsonProperty:"bg_colour"}, color:{jsonable:true, jsonProperty:"colour"}, titleStyle:{jsonable:true, jsonProperty:"title_style"}, bodyStyle:{jsonable:true, jsonProperty:"body_style"}, mouse:{jsonable:true}, shadow:{jsonable:true}, stroke:{jsonable:true}, rounded:{jsonable:true}}, toJSON:function () {
        var json = toJSON.call(this, arguments);
        if (this._mouse) {
            json.mouse = mouseMap[this._mouse];
        }
        return json;
    }});
    dorado.widget.ofc.Legend = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.Legend", ATTRIBUTES:{alpha:{jsonable:true}, backgroundColor:{jsonable:true, jsonProperty:"bg_colour"}, border:{jsonable:true}, borderColor:{jsonable:true}, stroke:{jsonable:true}, margin:{jsonable:true}, padding:{jsonable:true}, position:{jsonable:true}, visible:{jsonable:true}, shadow:{jsonable:true}}});
    dorado.widget.ofc.showAnimateTypeMap = {popUp:"pop-up", explode:"", midSlide:"mid-slide", drop:"drop", fadeIn:"fade-in", shrinkIn:"shrink-in"};
    dorado.widget.ofc.ShowAnimation = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.ShowAnimation", ATTRIBUTES:{type:{jsonable:true}, cascade:{jsonable:true}, delay:{jsonable:true}}, toJSON:function () {
        var json = $invokeSuper.call(this, arguments), type = this._type;
        if (type) {
            json.type = dorado.widget.ofc.showAnimateTypeMap[type];
        }
        return json;
    }});
    dorado.widget.ofc.OpenFlashChart = $extend(dorado.widget.Control, {$className:"dorado.widget.ofc.OpenFlashChart", ATTRIBUTES:{hideMode:{defaultValue:"visibility"}, width:{defaultValue:600}, height:{defaultValue:400}, backgroundColor:{jsonable:true, jsonProperty:"bg_colour"}, elements:{jsonable:true, innerComponent:"", setter:function (value) {
        if (value) {
            for (var i = 0; i < value.length; i++) {
                var element = value[i];
                element.parent = this;
            }
        }
        this._elements = value;
    }}, legend:{jsonable:true, innerComponent:"ofc.Legend"}, radarAxis:{jsonable:true, jsonProperty:"radar_axis", innerComponent:"ofc.axis.RadarAxis"}, title:{jsonable:true, innerComponent:"ofc.Text"}, toolTip:{innerComponent:"ofc.ToolTip", jsonable:true, jsonProperty:"tooltip"}, xLegend:{jsonable:true, jsonProperty:"x_legend", innerComponent:"ofc.Text"}, yLegend:{jsonable:true, jsonProperty:"y_legend", innerComponent:"ofc.Text"}, yLegendRight:{jsonable:true, jsonProperty:"y2_legend", innerComponent:"ofc.Text"}, xAxis:{jsonable:true, jsonProperty:"x_axis", innerComponent:"ofc.axis.XAxis"}, yAxis:{jsonable:true, jsonProperty:"y_axis", innerComponent:"ofc.axis.YAxis"}, yAxisRight:{jsonable:true, jsonProperty:"y_axis_right", innerComponent:"ofc.axis.YAxis"}, decimalSeparatorComma:{}, fixedNumDecimalsForced:{}, thousandSeparatorDisabled:{}, numDecimals:{}}, createDom:function () {
        var chart = this, dom = document.createElement("div");
        dom.className = "d-ofc";
        dom.style.overflow = "hidden";
        dom.id = "dorado_ofc_" + ofc_id_seed++;
        return dom;
    }, onActualVisibleChange:function () {
        $invokeSuper.call(this, arguments);
        var visible = this._visible;
        if (visible) {
            this.reload();
        }
    }, rasterize:function (dst) {
        var _dst = document.getElementById(dst);
        var e = document.createElement("div");
        e.innerHTML = this.image();
        _dst.parentNode.replaceChild(e, _dst);
    }, image:function () {
        var chart = this;
        if (chart._dom && chart._dom.id) {
            return "<img src='data:image/png;base64," + chart._dom.firstChild.get_img_binary() + "' />";
        }
    }, imageBinary:function () {
        var chart = this;
        if (chart._dom && chart._dom.id) {
            return chart._dom.firstChild.get_img_binary();
        }
        return "";
    }, popup:function () {
        var img_win = window.open("", "Image");
        img_win.document.write("<html><head><title>Charts: Export as Image</title></head><body>" + this.image() + "</body></html>");
    }, download:function (options) {
        dorado.widget.ofc.downloadImage(this, options);
    }, reload:function (str) {
        var chart = this;
        if (chart._dom && chart._dom.id) {
            var swf = chart._dom.firstChild;
            if (swf) {
                if (swf.load) {
                    clearTimeout(chart._initSWFTimer);
                    chart._initSWFTimer = null;
                    if (chart._reloadTimer != null) {
                        clearTimeout(chart._reloadTimer);
                    }
                    chart._reloadTimer = setTimeout(function () {
                        try {
                            swf.load(str || JSON.stringify(chart));
                        }
                        catch (e) {
                        }
                        chart._reloadTimer = null;
                    }, 100);
                } else {
                    if (chart._initSWFTimer == null) {
                        chart._initSWFTimer = setTimeout(function () {
                            chart._initSWFTimer = null;
                            chart.reload(str);
                        }, 500);
                    }
                }
            }
        }
    }, onAttachToDocument:function () {
        $invokeSuper.call(this, arguments);
        jQuery(this._dom).flash({id:"dorado_ofc_flash_" + ofc_id_seed, name:"dorado_ofc_flash_" + ofc_id_seed, swf:$url(">dorado/client/resources/open-flash-chart.swf?" + (new Date()).getTime()), wmode:"transparent", width:"100%", height:"100%"});
        this.reload();
    }, insertElement:function (element, index) {
        var elements = this._elements;
        if (!elements) {
            elements = this._elements = [];
        }
        if (!(element instanceof dorado.widget.ofc.Element)) {
            element = dorado.Toolkits.createInstance("widget", element);
            element.parent = this;
        }
        if (typeof index == "number") {
            elements.insert(element, index);
        } else {
            elements.push(element);
        }
        this.refresh();
    }, refreshDom:function () {
        $invokeSuper.call(this, arguments);
        this.reload();
    }, addElement:function (element) {
        this.insertElement(element);
    }, addElements:function (elements) {
        if (elements) {
            for (var i = 0, j = elements.length; i < j; i++) {
                this.addElement(elements[i]);
            }
        }
    }, removeElement:function (index) {
        var elements = this._elements;
        if (elements) {
            if (typeof index == "number") {
                elements.removeAt(index);
            } else {
                elements.remove(index);
            }
        }
        this.refresh();
    }, toJSON:toJSON});
    var element_seed = 1;
    dorado.widget.ofc.Element = $extend([dorado.widget.Component, dorado.widget.DataControl], {$className:"dorado.widget.ofc.Element", constructor:function (config) {
        this._eventIndex = element_seed++;
        $invokeSuper.call(this, arguments);
    }, ATTRIBUTES:{alpha:{jsonable:true}, text:{jsonable:true}, color:{jsonable:true}, fontSize:{jsonable:true, jsonProperty:"font-size"}, colors:{jsonable:true, jsonProperty:"colours"}, values:{jsonable:true, setter:function (value) {
        if (typeof value == "string") {
            eval("value = " + value);
        }
        this._values = value;
    }}, toolTip:{jsonable:true, jsonProperty:"tip"}, bindingConfig:{setter:function (value) {
        if (isPlainObject(value)) {
            value = this.createBindingConfig(value);
        }
        this._bindingConfig = value;
    }}}, EVENTS:{onClick:{}}, getValue:function (index) {
        var values = this._values;
        if (values) {
            return values[index];
        }
        return null;
    }, insertValue:function (value, index) {
        var values = this._values;
        if (!values) {
            this._values = values = [];
        }
        if (typeof index == "number") {
            values.insert(value, index);
        } else {
            values.push(value);
        }
    }, addValue:function (value) {
        this.insertValue(value);
    }, removeValue:function (index) {
        var values = this._values;
        if (values) {
            if (typeof index == "number") {
                values.removeAt(index);
            }
        }
    }, doExportEvents:function () {
        var element = this;
        window["dorado_ofc_onclick_" + element._eventIndex] = function (index) {
            var arg = {index:index};
            if (index !== undefined) {
                var data = element.getBindingData();
                if (data instanceof dorado.Entity) {
                    if (index == 0) {
                        arg.entity = data;
                    }
                } else {
                    if (data instanceof dorado.EntityList) {
                        arg.entity = data.toArray()[index];
                    }
                }
            }
            element.fireEvent("onClick", element, arg);
        };
    }, eventsToJSON:function (object) {
        if (!this._eventsExported) {
            this.doExportEvents();
            this._eventsExported = true;
        }
        object["on-click"] = "dorado_ofc_onclick_" + this._eventIndex;
    }, toJSON:function () {
        var json = toJSON.call(this, arguments);
        if (this.doGetType) {
            json.type = this.doGetType();
        } else {
            json.type = this.type;
        }
        json.values = this.getValues();
        this.eventsToJSON(json);
        return json;
    }, diggData:function (bindingConfig, data) {
        var chart = this, result = [];
        if (bindingConfig && data) {
            if (data instanceof dorado.Entity) {
                result.push(chart.diggEntity(bindingConfig, data));
            } else {
                if (data instanceof dorado.EntityList) {
                    data.each(function (entity) {
                        result.push(chart.diggEntity(bindingConfig, entity));
                    });
                } else {
                    if (data instanceof Array) {
                        data.each(function (record) {
                            if (record instanceof dorado.Entity) {
                                result.push(chart.diggEntity(bindingConfig, record));
                            } else {
                                if (record instanceof dorado.EntityList) {
                                    record.each(function (entity) {
                                        result.push(chart.diggEntity(bindingConfig, entity));
                                    });
                                }
                            }
                        });
                    }
                }
            }
        }
        return result;
    }, diggEntity:function (bindingConfig, entity) {
        var bindingMap = bindingConfig.toJSON(), result = {};
        for (var binding in bindingMap) {
            var property = bindingMap[binding];
            result[binding] = entity.get(property);
        }
        return this.createValue(result);
    }, getValues:function () {
        var chart = this, data = chart.getBindingData({firstResultOnly:false}), bindingConfig = chart._bindingConfig;
        if (bindingConfig && data) {
            chart._values = chart.diggData(bindingConfig, data);
        }
        return chart._values;
    }, processDataSetMessage:function (messageCode, arg, data) {
        switch (messageCode) {
          case dorado.widget.DataSet.MESSAGE_REFRESH:
            this.parent.reload();
            break;
          case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
          case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
          case dorado.widget.DataSet.MESSAGE_DELETED:
          case dorado.widget.DataSet.MESSAGE_INSERTED:
            this.parent.reload();
            break;
        }
    }});
})();
(function () {
    function isPlainObject(o) {
        return o && Object.prototype.toString.call(o) === "[object Object]" && ("isPrototypeOf" in o);
    }
    dorado.widget.ofc.model = {};
    dorado.widget.ofc.model.Column = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.model.Column", ATTRIBUTES:{value:{path:"top"}, top:{jsonable:true}, bottom:{jsonable:true}, color:{jsonable:true, jsonProperty:"colour"}, toolTip:{jsonable:true, jsonProperty:"tip"}}});
    dorado.widget.ofc.model.FilledColumn = $extend(dorado.widget.ofc.model.Column, {$className:"dorado.widget.ofc.model.FilledColumn", ATTRIBUTES:{outlineColor:{jsonable:true, jsonProperty:"outline-colour"}}});
    dorado.widget.ofc.model.SketchColumn = $extend(dorado.widget.ofc.model.FilledColumn, {$className:"dorado.widget.ofc.model.SketchColumn", ATTRIBUTES:{offset:{jsonable:true}}});
    dorado.widget.ofc.model.Candle = $extend(dorado.widget.ofc.model.Column, {$className:"dorado.widget.ofc.model.Candle", ATTRIBUTES:{high:{jsonable:true}, low:{jsonable:true}, negativeColor:{jsonable:true, jsonProperty:"negative-colour"}}});
    dorado.widget.ofc.model.Bar = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.model.Bar", ATTRIBUTES:{value:{path:"right"}, left:{jsonable:true}, right:{jsonable:true}, color:{jsonable:true, jsonProperty:"colour"}, toolTip:{jsonable:true, jsonProperty:"tip"}}});
    dorado.widget.ofc.model.Point = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.model.Point", ATTRIBUTES:{x:{jsonable:true}, y:{jsonable:true}}});
    dorado.widget.ofc.model.Stack = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.model.Stack", ATTRIBUTES:{values:{jsonable:true, setter:function (value) {
        if (value instanceof Array) {
            for (var i = 0, j = value.length; i < j; i++) {
                var v = value[i];
                if (isPlainObject(v)) {
                    value[i] = new dorado.widget.ofc.model.StackElement(v);
                }
            }
        }
        this._values = value;
    }}}, toJSON:function () {
        return this._values || [];
    }});
    dorado.widget.ofc.model.StackElement = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.model.StackElement", ATTRIBUTES:{color:{jsonable:true, jsonProperty:"colour"}, value:{jsonable:true, jsonProperty:"val"}}});
    dorado.widget.ofc.model.PieSlice = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.model.PieSlice", ATTRIBUTES:{text:{jsonable:true}, label:{jsonable:true}, labelColor:{jsonable:true, jsonProperty:"label-colour"}, value:{jsonable:true}, toolTip:{jsonable:true, jsonProperty:"tip"}}});
    dorado.widget.ofc.dotTypeMap = {Anchor:"anchor", Bow:"bow", Dot:"dot", HollowDot:"hollow-dot", SolidDot:"solid-dot", StarDot:"star"};
    dorado.widget.ofc.model.LineDot = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.model.LineDot", ATTRIBUTES:{value:{jsonable:true}, x:{jsonable:true}, y:{jsonable:true}, type:{jsonable:true}, axis:{jsonable:true}, color:{jsonable:true, jsonProperty:"colour"}, dotSize:{jsonable:true, jsonProperty:"dot-size"}, haloSize:{jsonable:true, jsonProperty:"halo-size"}, width:{jsonable:true}, sides:{jsonable:true}, rotation:{jsonable:true}, hollow:{jsonable:true}, backgroundColor:{jsonable:true, jsonProperty:"background-colour"}, backgroundAlpha:{jsonable:true, jsonProperty:"background-colour"}, toolTip:{jsonable:true, jsonProperty:"tip"}}, toJSON:function () {
        var json = $invokeSuper.call(this, arguments), type = this._type;
        if (type) {
            json.type = dorado.widget.ofc.dotTypeMap[type];
        }
        return json;
    }});
    dorado.widget.ofc.model.Tag = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.model.Tag", ATTRIBUTES:{alpha:{jsonable:true}, backgroundColor:{jsonable:true, jsonProperty:"background"}, color:{jsonable:true, jsonProperty:"colour"}, alignX:{jsonable:true, jsonProperty:"align-x"}, alignY:{jsonable:true, jsonProperty:"align-y"}, padX:{jsonable:true, jsonProperty:"pad-x"}, padY:{jsonable:true, jsonProperty:"pad-y"}, font:{jsonable:true}, bold:{jsonable:true}, rotate:{jsonable:true}, text:{jsonable:true}, fontSize:{jsonable:true, jsonProperty:"font-size"}, border:{jsonable:true}, underline:{jsonable:true}, axis:{jsonable:true}, x:{jsonable:true}, y:{jsonable:true}}});
})();
dorado.widget.ofc.binding = {};
dorado.widget.ofc.binding.ChartBindingConfig = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.binding.ChartBindingConfig", toJSON:function () {
    var object = this, result = {}, ATTRIBUTES = object.ATTRIBUTES;
    for (var attr in ATTRIBUTES) {
        var attrConfig = ATTRIBUTES[attr], jsonAttr = attrConfig.jsonProperty || attr;
        jsonAttr = jsonAttr.replace("Property", "");
        if (attrConfig.jsonable) {
            var value = object["_" + attr];
            if (value !== undefined) {
                if (dorado.Object.isInstanceOf(value, dorado.AttributeSupport)) {
                    result[jsonAttr] = value.toJSON();
                } else {
                    result[jsonAttr] = value;
                }
            }
        }
    }
    return result;
}});
dorado.widget.ofc.binding.PieSliceBindingConfig = $extend(dorado.widget.ofc.binding.ChartBindingConfig, {$className:"dorado.widget.ofc.binding.PieSliceBindingConfig", ATTRIBUTES:{valueProperty:{jsonable:true}, labelProperty:{jsonable:true}, labelColorProperty:{jsonable:true}, textProperty:{jsonable:true}, fontSizeProperty:{jsonable:true}, toolTipProperty:{jsonable:true}}});
dorado.widget.ofc.binding.PointBindingConfig = $extend(dorado.widget.ofc.binding.ChartBindingConfig, {$className:"dorado.widget.ofc.binding.PointBindingConfig", ATTRIBUTES:{xProperty:{jsonable:true}, yProperty:{jsonable:true}}});
dorado.widget.ofc.binding.StackBindingConfig = $extend(dorado.widget.ofc.binding.ChartBindingConfig, {$className:"dorado.widget.ofc.binding.StackBindingConfig", ATTRIBUTES:{valuesProperty:{jsonable:true}, valueProperty:{jsonable:true, jsonProperty:"value"}, colorProperty:{jsonable:true, jsonProperty:"color"}}});
dorado.widget.ofc.binding.TagBindingConfig = $extend(dorado.widget.ofc.binding.ChartBindingConfig, {$className:"dorado.widget.ofc.binding.TagBindingConfig", ATTRIBUTES:{xProperty:{jsonable:true}, yProperty:{jsonable:true}, backgroundColorProperty:{jsonable:true}, axisProperty:{jsonable:true}, colorProperty:{jsonable:true}, alignXProperty:{jsonable:true}, alignYProperty:{jsonable:true}, padXProperty:{jsonable:true}, padYProperty:{jsonable:true}, fontProperty:{jsonable:true}, boldProperty:{jsonable:true}, rotateProperty:{jsonable:true}, textProperty:{jsonable:true}, fontSizeProperty:{jsonable:true}, borderProperty:{jsonable:true}, underlineProperty:{jsonable:true}, alphaProperty:{jsonable:true}}});
dorado.widget.ofc.binding.LineDotBindingConfig = $extend(dorado.widget.ofc.binding.ChartBindingConfig, {$className:"dorado.widget.ofc.binding.LineDotBindingConfig", ATTRIBUTES:{typeProperty:{jsonable:true}, colorProperty:{jsonable:true}, haloSizeProperty:{jsonable:true}, sizeProperty:{jsonable:true}, toolTipProperty:{jsonable:true}, valueProperty:{jsonable:true}, xProperty:{jsonable:true}, yProperty:{jsonable:true}, sidesProperty:{jsonable:true}, rotationProperty:{jsonable:true}, hollowProperty:{jsonable:true}}});
dorado.widget.ofc.binding.ColumnBindingConfig = $extend(dorado.widget.ofc.binding.ChartBindingConfig, {$className:"dorado.widget.ofc.binding.ColumnBindingConfig", ATTRIBUTES:{valueProperty:{jsonable:true}, topProperty:{jsonable:true}, bottomProperty:{jsonable:true}, colorProperty:{jsonable:true}, toolTipProperty:{jsonable:true}}});
dorado.widget.ofc.binding.BarBindingConfig = $extend(dorado.widget.ofc.binding.ChartBindingConfig, {$className:"dorado.widget.ofc.binding.BarBindingConfig", ATTRIBUTES:{valueProperty:{jsonable:true}, leftProperty:{jsonable:true}, rightProperty:{jsonable:true}, colorProperty:{jsonable:true}, toolTipProperty:{jsonable:true}}});
dorado.widget.ofc.binding.SketchColumnBindingConfig = $extend(dorado.widget.ofc.binding.ColumnBindingConfig, {$className:"dorado.widget.ofc.binding.SketchColumnBindingConfig", ATTRIBUTES:{offsetProperty:{jsonable:true}, outlineColorProperty:{jsonable:true}}});
dorado.widget.ofc.binding.CandleBindingConfig = $extend(dorado.widget.ofc.binding.ColumnBindingConfig, {$className:"dorado.widget.ofc.binding.CandleBindingConfig", ATTRIBUTES:{valueProperty:{jsonable:true}, highProperty:{jsonable:true}, lowProperty:{jsonable:true}, negativeColorProperty:{jsonable:true}}});
(function () {
    var axisToJSON = function () {
        var json = $invokeSuper.call(this, arguments), labelsShortcut = this._labelsShortcut;
        if (labelsShortcut) {
            var labels = this._labels;
            if (labels) {
                json.labels.labels = labelsShortcut.split(",");
            } else {
                json.labels = {labels:labelsShortcut.split(",")};
            }
        }
        return json;
    };
    var yAxisToJSON = function () {
        var json = $invokeSuper.call(this, arguments), labelsShortcut = this._labelsShortcut;
        if (labelsShortcut) {
            json.labels = labelsShortcut.split(",");
        }
        return json;
    };
    dorado.widget.ofc.axis = {};
    dorado.widget.ofc.axis.AbstractAxis = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.axis.AbstractAxis", ATTRIBUTES:{color:{jsonable:true, jsonProperty:"colour"}, gridColor:{jsonable:true, jsonProperty:"grid-colour"}, stroke:{jsonable:true}, max:{jsonable:true}, min:{jsonable:true}, steps:{jsonable:true}}});
    dorado.widget.ofc.axis.AxisLabel = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.axis.AxisLabel", ATTRIBUTES:{color:{jsonable:true, jsonProperty:"colour"}, rotate:{jsonable:true}, size:{jsonable:true}, text:{jsonable:true}, align:{jsonable:true}, justify:{jsonable:true}, visible:{defaultValue:true, jsonable:true}}});
    dorado.widget.ofc.axis.XAxis = $extend(dorado.widget.ofc.axis.AbstractAxis, {$className:"dorado.widget.ofc.axis.XAxis", ATTRIBUTES:{zDepth3D:{jsonable:true, jsonProperty:"3d"}, offset:{jsonable:true}, tickHeight:{jsonable:true, jsonProperty:"tick-height"}, labels:{jsonable:true, innerComponent:"ofc.axis.XAxisLabels", setter:function (value) {
        if (!(value instanceof dorado.widget.ofc.axis.XAxisLabels)) {
            value = new dorado.widget.ofc.axis.XAxisLabels(value);
        }
        this._labels = value;
    }}, labelsShortcut:{setter:function (value) {
        if (value) {
            this._labelsShortcut = value;
        }
    }}}, toJSON:axisToJSON});
    dorado.widget.ofc.axis.XAxisLabels = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.axis.XAxisLabels", ATTRIBUTES:{color:{jsonable:true, jsonProperty:"colour"}, rotate:{jsonable:true}, size:{jsonable:true}, text:{jsonable:true}, visible:{jsonable:true}, steps:{jsonable:true}, align:{jsonable:true}, justify:{jsonable:true}, labels:{jsonable:true, setter:function (value) {
        if (value instanceof Array) {
            for (var i = 0, j = value.length; i < j; i++) {
                var item = value[i];
                if (!(item instanceof dorado.widget.ofc.axis.AxisLabel)) {
                    value[i] = new dorado.widget.ofc.axis.AxisLabel(item);
                }
            }
        }
        this._labels = value;
    }}}});
    dorado.widget.ofc.axis.YAxis = $extend(dorado.widget.ofc.axis.AbstractAxis, {$className:"dorado.widget.ofc.axis.YAxis", ATTRIBUTES:{zDepth3D:{jsonable:true, jsonProperty:"3d"}, offset:{jsonable:true}, tickLength:{jsonable:true, jsonProperty:"tick-length"}, labels:{jsonable:true, innerComponent:"ofc.axis.YAxisLabels", setter:function (value) {
        if (!(value instanceof dorado.widget.ofc.axis.YAxisLabels)) {
            value = new dorado.widget.ofc.axis.YAxisLabels(value);
        }
        this._labels = value;
    }}, logScale:{jsonable:true, jsonProperty:"log-scale"}, labelsShortcut:{setter:function (value) {
        if (value) {
            this._labelsShortcut = value;
        }
    }}}, toJSON:yAxisToJSON});
    dorado.widget.ofc.axis.YAxisLabels = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.axis.YAxisLabels", ATTRIBUTES:{color:{jsonable:true, jsonProperty:"colour"}, rotate:{jsonable:true}, size:{jsonable:true}, text:{jsonable:true}, visible:{jsonable:true, jsonProperty:"show_labels"}, steps:{jsonable:true}, labels:{jsonable:true, setter:function (value) {
        if (value instanceof Array) {
            for (var i = 0, j = value.length; i < j; i++) {
                var item = value[i];
                if (!(item instanceof dorado.widget.ofc.axis.AxisLabel)) {
                    value[i] = new dorado.widget.ofc.axis.AxisLabel(item);
                }
            }
        }
        this._labels = value;
    }}}});
    dorado.widget.ofc.axis.RadarAxisLabels = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.axis.RadarAxisLabels", ATTRIBUTES:{steps:{jsonable:true}, color:{jsonable:true, jsonProperty:"colour"}, labels:{jsonable:true}}});
    dorado.widget.ofc.axis.RadarAxisSpokeLabels = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.axis.RadarAxisSpokeLabels", ATTRIBUTES:{color:{jsonable:true, jsonProperty:"colour"}, labels:{jsonable:true}}});
    dorado.widget.ofc.axis.RadarAxis = $extend(dorado.widget.ofc.axis.AbstractAxis, {$className:"dorado.widget.ofc.axis.RadarAxis", ATTRIBUTES:{labelsShortcut:{setter:function (value) {
        if (value) {
            this._labelsShortcut = value;
        }
    }}, spokeLabelsShortcut:{setter:function (value) {
        if (value) {
            this._spokeLabels = {labels:value.split(",")};
        }
    }}, labels:{jsonable:true}, spokeLabels:{jsonable:true, jsonProperty:"spoke-labels"}}, toJSON:axisToJSON});
})();
(function () {
    function isPlainObject(o) {
        return o && Object.prototype.toString.call(o) === "[object Object]" && ("isPrototypeOf" in o);
    }
    dorado.widget.ofc.Pie = $extend(dorado.widget.ofc.Element, {$className:"dorado.widget.ofc.Pie", type:"pie", ATTRIBUTES:{alpha:{jsonable:true}, animate:{defaultValue:false, jsonable:true}, borderWidth:{jsonable:true, jsonProperty:"border"}, gradientFill:{jsonable:true, jsonProperty:"gradient-fill"}, labelColor:{jsonable:true, jsonProperty:"label-colour"}, noLabels:{jsonable:true, jsonProperty:"no-labels"}, radius:{jsonable:true}, startAngle:{jsonable:true, jsonProperty:"start-angle"}}, createValue:function (options) {
        return new dorado.widget.ofc.model.PieSlice(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.PieSliceBindingConfig(options);
    }});
    dorado.widget.ofc.Scatter = $extend(dorado.widget.ofc.Element, {$className:"dorado.widget.ofc.Scatter", ATTRIBUTES:{color:{jsonable:true, jsonProperty:"colour"}, axis:{jsonable:true}, dotStyle:{jsonable:true, jsonProperty:"dot-style", setter:function (value) {
        if (value && !(value instanceof dorado.widget.ofc.LineDotStyle)) {
            value = new dorado.widget.ofc.LineDotStyle(value);
        }
        this._dotStyle = value;
    }}, width:{jsonable:true}, type:{defaultValue:"point"}}, createValue:function (options) {
        return new dorado.widget.ofc.model.LineDot(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.LineDotBindingConfig(options);
    }, doGetType:function () {
        return this._type == "line" ? "scatter_line" : "scatter";
    }});
    dorado.widget.ofc.StackedColumn = $extend(dorado.widget.ofc.Element, {$className:"dorado.widget.ofc.StackedColumn", type:"bar_stack", ATTRIBUTES:{keys:{jsonable:true, setter:function (value) {
        if (value instanceof Array) {
            for (var i = 0, j = value.length; i < j; i++) {
                var v = value[i];
                if (!(v instanceof dorado.widget.ofc.Key)) {
                    value[i] = new dorado.widget.ofc.Key(v);
                }
            }
        }
        this._keys = value;
    }}}, createValue:function (options) {
        return new dorado.widget.ofc.model.StackElement(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.StackBindingConfig(options);
    }, diggData:function (bindingConfig, data) {
        var chart = this, result = [];
        if (bindingConfig && data) {
            if (data instanceof dorado.Entity) {
                result.push(chart.diggStack(bindingConfig, data));
            } else {
                if (data instanceof dorado.EntityList) {
                    data.each(function (entity) {
                        result.push(chart.diggStack(bindingConfig, entity));
                    });
                } else {
                    if (data instanceof Array) {
                        data.each(function (record) {
                            if (record instanceof dorado.Entity) {
                                result.push(chart.diggStack(bindingConfig, record));
                            } else {
                                if (record instanceof dorado.EntityList) {
                                    record.each(function (entity) {
                                        result.push(chart.diggStack(bindingConfig, entity));
                                    });
                                }
                            }
                        });
                    }
                }
            }
        }
        return result;
    }, diggStack:function (bindingConfig, entity) {
        var chart = this, bindingMap = bindingConfig.toJSON(), result = [];
        var valuesProperty = bindingMap["values"];
        if (valuesProperty) {
            var values = entity.get(valuesProperty);
            if (values) {
                values.each(function (value) {
                    result.push(chart.diggStackElement(bindingConfig, value));
                });
            }
        }
        return new dorado.widget.ofc.model.Stack({values:result});
    }, diggStackElement:function (bindingConfig, entity) {
        var bindingMap = bindingConfig.toJSON(), result = {}, valueProperty = bindingMap["value"], colorProperty = bindingMap["color"];
        if (valueProperty) {
            result.value = entity.get(valueProperty);
        }
        if (colorProperty) {
            result.color = entity.get(colorProperty);
        }
        return result;
    }});
    dorado.widget.ofc.Shape = $extend(dorado.widget.ofc.Element, {$className:"dorado.widget.ofc.Shape", type:"shape", ATTRIBUTES:{width:{jsonable:true}, lineColor:{jsonable:true, jsonProperty:"line-colour"}, lineAlpha:{jsonable:true, jsonProperty:"line-alpha"}, color:{jsonable:true, jsonProperty:"colour"}}, createValue:function (options) {
        return new dorado.widget.ofc.model.Point(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.PointBindingConfig(options);
    }});
    dorado.widget.ofc.Arrow = $extend(dorado.widget.ofc.Element, {$className:"dorado.widget.ofc.Arrow", type:"arrow", ATTRIBUTES:{start:{jsonable:true}, end:{jsonable:true}, color:{jsonable:true, jsonProperty:"colour"}, barbLength:{jsonable:true, jsonProperty:"barb-length"}}, toJSON:function () {
        var json = $invokeSuper.call(this, arguments);
        if (json.start instanceof Array) {
            var start = json.start;
            json.start = {x:start[0], y:start[1]};
        }
        if (json.end instanceof Array) {
            var end = json.end;
            json.end = {x:end[0], y:end[1]};
        }
        return json;
    }});
    dorado.widget.ofc.Tags = $extend(dorado.widget.ofc.Element, {$className:"dorado.widget.ofc.Tags", type:"tags", ATTRIBUTES:{color:{jsonable:true, jsonProperty:"colour"}, backgroundColor:{jsonable:true, jsonProperty:"background"}, alignX:{jsonable:true, jsonProperty:"align-x"}, alignY:{jsonable:true, jsonProperty:"align-y"}, padX:{jsonable:true, jsonProperty:"pad-x"}, padY:{jsonable:true, jsonProperty:"pad-y"}, font:{jsonable:true}, bold:{jsonable:true}, rotate:{jsonable:true}, fontSize:{jsonable:true, jsonProperty:"font-size"}, border:{jsonable:true}, underline:{jsonable:true}}, createValue:function (options) {
        return new dorado.widget.ofc.model.Tag(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.TagBindingConfig(options);
    }});
    dorado.widget.ofc.Column = $extend(dorado.widget.ofc.Element, {$className:"dorado.widget.ofc.Column", ATTRIBUTES:{showAnimation:{jsonable:true, jsonProperty:"on-show"}, barWidth:{jsonable:true, jsonProperty:"barwidth"}, color:{jsonable:true, jsonProperty:"colour"}, type:{defaultValue:"Bar"}}, createValue:function (options) {
        return new dorado.widget.ofc.model.Column(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.ColumnBindingConfig(options);
    }, doGetType:function () {
        var typeMap = {Column:"bar", Glass:"bar_glass", Cylinder:"bar_cylinder", CylinderOutline:"bar_cylinder_outline", Dome:"bar_dome", Round:"bar_round", RoundGlass:"bar_round_glass", Round3D:"bar_round3d", Column3D:"bar_3d", Plastic:"bar_plastic", PlasticFlat:"bar_plastic_flat"};
        return typeMap[this._type] || "bar";
    }});
    dorado.widget.ofc.Bar = $extend(dorado.widget.ofc.Element, {$className:"dorado.widget.ofc.Bar", ATTRIBUTES:{barWidth:{jsonable:true, jsonProperty:"bar-width"}, color:{jsonable:true, jsonProperty:"colour"}}, createValue:function (options) {
        return new dorado.widget.ofc.model.Bar(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.BarBindingConfig(options);
    }, doGetType:function () {
        return "hbar";
    }});
    dorado.widget.ofc.FilledColumn = $extend(dorado.widget.ofc.Column, {$className:"dorado.widget.ofc.FilledColumn", ATTRIBUTES:{outlineColor:{jsonable:true, jsonProperty:"outline-colour"}}, doGetType:function () {
        return "bar_filled";
    }});
    dorado.widget.ofc.SketchColumn = $extend(dorado.widget.ofc.FilledColumn, {$className:"dorado.widget.ofc.SketchColumn", ATTRIBUTES:{offset:{jsonable:true}}, createValue:function (options) {
        return new dorado.widget.ofc.model.SketchColumn(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.SketchColumnBindingConfig(options);
    }, doGetType:function () {
        return "bar_sketch";
    }});
    dorado.widget.ofc.Candle = $extend(dorado.widget.ofc.Column, {$className:"dorado.widget.ofc.Candle", ATTRIBUTES:{negativeColor:{jsonable:true, jsonProperty:"negative-colour"}}, createValue:function (options) {
        return new dorado.widget.ofc.model.Candle(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.CandleBindingConfig(options);
    }, doGetType:function () {
        return "candle";
    }});
    dorado.widget.ofc.LineStyle = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.LineStyle", ATTRIBUTES:{style:{jsonable:true}, on:{jsonable:true}, off:{jsonable:true}}});
    dorado.widget.ofc.LineDotStyle = $extend(dorado.widget.ofc.JSONizable, {$className:"dorado.widget.ofc.LineDotStyle", ATTRIBUTES:{type:{jsonable:true}, axis:{jsonable:true}, alpha:{jsonable:true}, color:{jsonable:true, jsonProperty:"colour"}, dotSize:{jsonable:true, jsonProperty:"dot-size"}, haloSize:{jsonable:true, jsonProperty:"halo-size"}, width:{jsonable:true}, toolTip:{jsonable:true, jsonProperty:"tip"}, sides:{jsonable:true}, rotation:{jsonable:true}, hollow:{jsonable:true}, backgroundColor:{jsonable:true, jsonProperty:"background-colour"}, backgroundAlpha:{jsonable:true, jsonProperty:"background-colour"}}, toJSON:function () {
        var json = $invokeSuper.call(this, arguments), type = this._type;
        if (type) {
            json.type = dorado.widget.ofc.dotTypeMap[type];
        }
        return json;
    }});
    dorado.widget.ofc.Line = $extend(dorado.widget.ofc.Element, {$className:"dorado.widget.ofc.Line", type:"line", ATTRIBUTES:{showAnimation:{jsonable:true, jsonProperty:"on-show", setter:function (value) {
        if (isPlainObject(value)) {
            value = new dorado.widget.ofc.ShowAnimation(value);
        }
        this._showAnimation = value;
    }}, color:{jsonable:true, jsonProperty:"colour"}, width:{jsonable:true}, axis:{jsonable:true}, dotStyle:{jsonable:true, jsonProperty:"dot-style", setter:function (value) {
        if (value && !(value instanceof dorado.widget.ofc.LineStyle)) {
            value = new dorado.widget.ofc.LineDotStyle(value);
        }
        this._dotStyle = value;
    }}, lineStyle:{jsonable:true, jsonProperty:"line-style", setter:function (value) {
        if (value && !(value instanceof dorado.widget.ofc.LineStyle)) {
            value = new dorado.widget.ofc.LineStyle(value);
        }
        this._lineStyle = value;
    }}}, createValue:function (options) {
        return new dorado.widget.ofc.model.LineDot(options);
    }, createBindingConfig:function (options) {
        return new dorado.widget.ofc.binding.LineDotBindingConfig(options);
    }});
    dorado.widget.ofc.Area = $extend(dorado.widget.ofc.Line, {$className:"dorado.widget.ofc.Area", type:"area", ATTRIBUTES:{fillAlpha:{jsonable:true, jsonProperty:"fill-alpha"}, fillColor:{jsonable:true, jsonProperty:"fill"}, loop:{jsonable:true}}});
})();

