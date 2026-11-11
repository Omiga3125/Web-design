/* ============================================================
   站内搜索
   索引由 search-data.js 提供（window.SEARCH_DATA），
   本文件负责输入、匹配与结果跳转，纯前端、无后端。
   ============================================================ */
(function () {
    var script = document.currentScript;
    var ROOT = new URL("./", script ? script.src : location.href).href;

    var input = document.getElementById("siteSearch");
    var panel = document.getElementById("searchPanel");
    var list = document.getElementById("searchResults");
    if (!input || !panel || !list) return;

    var DATA = window.SEARCH_DATA || [];
    var active = -1;
    var current = [];

    // 预先拼好检索用的字符串
    var pool = DATA.map(function (d) {
        return {
            c: d.c || "",
            t: d.t || "",
            s: d.s || "",
            u: d.u || "",
            hay: ((d.t || "") + " " + (d.s || "") + " " + (d.k || "") + " " + (d.c || ""))
                .toLowerCase()
        };
    });

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (m) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m];
        });
    }

    function mark(text, q) {
        var i = text.toLowerCase().indexOf(q);
        if (i < 0) return esc(text);
        return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) +
            "</mark>" + esc(text.slice(i + q.length));
    }

    function search(q) {
        q = q.trim().toLowerCase();
        if (!q) return [];
        var hits = [];
        for (var i = 0; i < pool.length; i++) {
            var d = pool[i];
            var pos = d.hay.indexOf(q);
            if (pos < 0) continue;
            // 标题开头命中排最前，其次标题包含，再是其他字段
            var score = 3;
            var tl = d.t.toLowerCase();
            if (tl === q) score = 0;
            else if (tl.indexOf(q) === 0) score = 1;
            else if (tl.indexOf(q) > 0) score = 2;
            hits.push({ d: d, score: score, pos: pos });
        }
        hits.sort(function (a, b) {
            return a.score - b.score;
        });
        return hits.slice(0, 8).map(function (h) { return h.d; });
    }

    function render(q) {
        current = search(q);
        active = -1;
        if (!q.trim()) {
            panel.setAttribute("hidden", "");
            return;
        }
        var html = "";
        if (!current.length) {
            html = '<li class="search-empty">没有找到「' + esc(q) + '」，试试作品名或社团名</li>';
        } else {
            for (var i = 0; i < current.length; i++) {
                var d = current[i];
                html += '<li><a href="' + ROOT + d.u + '">' +
                    '<span class="sr-cat">' + esc(d.c) + "</span>" +
                    '<span class="sr-title">' + mark(d.t, q.trim().toLowerCase()) + "</span>" +
                    '<span class="sr-sub">' + esc(d.s) + "</span></a></li>";
            }
        }
        list.innerHTML = html;
        panel.removeAttribute("hidden");
    }

    function move(step) {
        var items = list.querySelectorAll("li");
        if (!items.length) return;
        if (active >= 0) items[active].classList.remove("is-active");
        active = (active + step + items.length) % items.length;
        items[active].classList.add("is-active");
        items[active].scrollIntoView({ block: "nearest" });
    }

    function go() {
        var items = list.querySelectorAll("li a");
        if (!items.length) return;
        if (active >= 0) {
            location.href = items[active].href;
        } else {
            location.href = items[0].href;
        }
    }

    input.addEventListener("input", function () {
        render(input.value);
    });

    input.addEventListener("focus", function () {
        if (input.value.trim()) render(input.value);
    });

    input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            go();
        } else if (e.key === "Escape") {
            panel.setAttribute("hidden", "");
            input.blur();
        }
    });

    document.addEventListener("click", function (e) {
        if (!e.target.closest || !e.target.closest(".search")) {
            panel.setAttribute("hidden", "");
        }
    });

    // 按 “/” 直接跳到搜索框
    document.addEventListener("keydown", function (e) {
        if (e.key === "/" && document.activeElement !== input &&
            !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
            e.preventDefault();
            input.focus();
            input.select();
        }
    });
})();
