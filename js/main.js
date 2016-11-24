function isSupportFileApi() {
    if (window.File && window.FileList && window.FileReader && window.Blob) {
        return true;
    }
    return false;
}

function yasuo(ii, str) {
    var text = str;
    if (ii == 1 || ii == 3) {
        text = text.split("\n").join(" ");
        var t = [];
        var inString = false;
        for (var i = 0, len = text.length; i < len; i++) {
            var c = text.charAt(i);
            if (inString && c === inString) {
                // TODO: \\"
                if (text.charAt(i - 1) !== '\\') {
                    inString = false;
                }
            } else if (!inString && (c === '"' || c === "'")) {
                inString = c;
            } else if (!inString && (c === ' ' || c === "\t")) {
                c = '';
            }
            t.push(c);
        }
        text = t.join('');
    }
    if (ii == 2 || ii == 3) {
        text = text.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
    }
    if (ii == 4) {
        text = text.replace(/\\\\/g, "\\").replace(/\\\"/g, '\"');
    }
    return text;
}
dorado.onInit(function() {
    document.getElementById('file').addEventListener('change', fileSelect);

    function fileSelect(e) {
        e = e || window.event;
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var str = this.result.replace(/[\r\n\t]/g, " ");
            // str = str.replace(/\ \+/g, "");
            document.getElementById('preview').innerHTML = str;
            _json = JSON.parse(yasuo(1, str));
            document.getElementById('file').style.display = 'none';
            document.getElementById('fileLabel').style.display = 'none';
            document.getElementById('autoTest').style.display = 'none';

            
            d(_json);
        };
        reader.readAsText(file);
    }

    var moduleData = {};

    function d(_json) {
        var tabs = [{
            caption: 'main',
            $type: 'Control',
            control: {
                $type: 'Container',
                children: (function() {
                    var af=[];
                    var temp = createAutoForm(_json);
                    if (temp) { af.push(temp); }
                    return af;
                })()
            }
        }];
        for (var i = 0; i < _json.module.length; i++) {
            moduleData[_json.module[i].modulename + '_data'] = _json.module[i];

            tabs.push({
                caption: _json.module[i].modulename,
                id: _json.module[i].modulename,
                $type: 'Control',
            });
        }


        var tabControl = new dorado.widget.TabControl({
            id: 'moduleTab',
            tabs: tabs,
            layoutConstraint: {
                $type: 'center'
            }
        });

        var models = $id('moduleTab').objects[0].get('tabs').items;
        for (var i = 1; i < models.length; i++) {
            var dataName = models[i].get('id') + '_data';
            var c = new dorado.widget.Container({
                children: createAll(moduleData[dataName]),
            })
            models[i].set('control', c);
        }

        var toolBar = new dorado.widget.ToolBar({
            items: [{
                caption: '导出JSON',
                onClick: function(self, arg) {
                    // dorado.MessageBox.alert(JSON.stringify(moduleData));
                    var dialog = new dorado.widget.Dialog({
                        caption: '生成JSON',
                        width: 800,
                        height: 500,
                        children: [{
                            $type: 'TextArea',
                            text: JSON.stringify(_json),
                            width: '100%',
                            height: '100%',
                        }]
                    });
                    dialog.show();
                }
            }],
            layoutConstraint: {
                $type: 'top'
            }
        });

        var view = new dorado.widget.View({
            children: [toolBar, tabControl],
            layout: "Dock",
        });
        view.set('renderTo', document.body);
        view.render();
        return;
    }


    function createAutoForm(data, tags, _isArea) {
        var elements = [];
        for (var item in data) {
            if (typeof data[item] == 'string' || typeof data[item] == 'number') {
                elements.push({
                    label: item,
                    property: item,
                    value: data[item],
                    editor: {
                        // text: data[item],
                        $type: data[item].length > 50 ? 'TextArea' : 'TextEditor'
                    }
                });
            }
        }
        if (elements.length > 0) {
            var form = new dorado.widget.AutoForm({
                cols: '*',
                elements: elements,
                labelWidth: 130,
                style: 'padding-bottom:20px;',
                tags: tags
            });
            form.set('entity', data);
            return form;
        }
        return undefined
    }

    function createAll(data, af) {
        if (!af) { af = [] }
        var temp = createAutoForm(data);
        if (temp) { af.push(temp); }

        for (var item in data) {
            if (typeof data[item] == 'object' && data[item].length > 0) {
                for (var i = 0; i < data[item].length; i++) {
                    createAll(data[item][i], af);
                }
            }
        }
        return af;
    }
});
