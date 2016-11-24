window.onload = function() {
    document.getElementById('en').addEventListener('input', auto, false);
    document.getElementById('cn').addEventListener('input', auto, false);
    document.getElementById('py').addEventListener('input', auto, false);

    function auto() {
        var en = document.getElementById('en').value;
        var cn = document.getElementById('cn').value;
        var py = document.getElementById('py').value;

        var pEn = document.getElementById('autoEn');
        var pCn = document.getElementById('autoCn');
        var pPy = document.getElementById('autoPy');

        pEn.innerHTML = createHtml(en);
        pCn.innerHTML = createHtml(cn);
        pPy.innerHTML = createHtml(py);

        var es = document.querySelectorAll('#autoEn span');
        var cs = document.querySelectorAll('#autoCn span');
        var ps = document.querySelectorAll('#autoPy span');

        var max = Math.max(es.length, cs.length, ps.length);
        console.log(max);
        //开始自动对齐
        for (var i = 0; i < max; i++) {
            var _e = es[i],
                _c = cs[i],
                _p = ps[i];
            if (_e && _c && _p) {
                var w = Math.max(_e.offsetWidth, _c.offsetWidth, _p.offsetWidth);
                _e.style.width = w + 'px';
                _c.style.width = w + 'px';
                _p.style.width = w + 'px';

                _e.style.opacity = 1;
                _c.style.opacity = 1;
                _p.style.opacity = 1;
            }
            if (_e && _c) {
                var w = Math.max(_e.offsetWidth, _c.offsetWidth);
                _e.style.width = w + 'px';
                _c.style.width = w + 'px';

                _e.style.opacity = 1;
                _c.style.opacity = 1;
            }
            if (_e && _p) {
                var w = Math.max(_e.offsetWidth, _p.offsetWidth);
                _e.style.width = w + 'px';
                _p.style.width = w + 'px';

                _e.style.opacity = 1;
                _p.style.opacity = 1;
            }
            if (_c && _p) {
                var w = Math.max(_c.offsetWidth, _p.offsetWidth);
                _c.style.width = w + 'px';
                _p.style.width = w + 'px';

                _c.style.opacity = 1;
                _p.style.opacity = 1;
            }

            if (_e) {
                _e.style.opacity = 1;
            }
            if (_c) {
                _c.style.opacity = 1;
            }
            if (_p) {
                _p.style.opacity = 1;
            }

        }










        function createHtml(str) {
            var a = str.split(' ');
            var html = '';
            for (var i = 0; i < a.length; i++) {
                html += '<span>' + a[i] + '</span>';
            }
            return html;
        }

    }
}
