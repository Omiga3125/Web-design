/* ============================================================
   背景音乐控制（放在 <head> 里执行，页面还没渲染就先起播）
   - 默认开启：能自动播放就直接播，被拦截则等第一次点击/按键/滚动
   - 右下角开关可关闭，选择会被记住
   - 翻页时接着上一页的进度继续，尽量缩短停顿
   ============================================================ */
(function () {
    var TOGGLE_ID = "bgmToggle";
    var STORE = "touhou-bgm-off";
    var TIME_KEY = "touhou-bgm-time";

    // 用脚本自身的地址推算音频路径，
    // 这样无论页面在根目录还是 web/ 子目录都能找到 audio/bgm.mp3
    var here = document.currentScript ? document.currentScript.src : location.href;
    var src = new URL("audio/bgm.mp3", here).href;

    var audio = new Audio();
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0.45;
    audio.src = src;

    var userOff = false;
    try {
        userOff = window.localStorage.getItem(STORE) === "1";
    } catch (e) {
        userOff = false;
    }

    var resumeAt = 0;
    try {
        resumeAt = parseFloat(window.sessionStorage.getItem(TIME_KEY) || "0") || 0;
    } catch (e) {
        resumeAt = 0;
    }

    var btn = null;
    var textEl = null;
    var armed = false;
    var state = userOff ? "off" : "wait";

    /* ---------- 界面 ---------- */

    function paint(s) {
        state = s;
        if (!btn) return;
        btn.classList.toggle("is-on", s === "on");
        btn.classList.toggle("is-wait", s === "wait");
        btn.setAttribute("aria-pressed", s === "on" ? "true" : "false");
        if (textEl) {
            textEl.textContent = s === "on" ? "音乐 开"
                : s === "wait" ? "点击播放"
                    : "音乐 关";
        }
    }

    /* ---------- 播放 ---------- */

    function start() {
        if (userOff) {
            paint("off");
            return;
        }
        var p = audio.play();
        if (p && p.then) {
            p.then(function () {
                paint("on");
            }).catch(function () {
                paint("wait");
                arm();
            });
        } else {
            paint(audio.paused ? "wait" : "on");
        }
    }

    // 先定位到上一页的进度再播放，避免「从头响一声再跳」
    var playStarted = false;

    function seekThenStart() {
        if (playStarted) return;
        playStarted = true;
        if (resumeAt > 1 && audio.duration && resumeAt < audio.duration - 2) {
            try {
                audio.currentTime = resumeAt;
            } catch (e) {
            }
        }
        start();
    }

    if (userOff) {
        paint("off");
    } else if (resumeAt > 1) {
        audio.addEventListener("loadedmetadata", seekThenStart);
        // 兜底：元数据迟迟不到，也先响起来
        window.setTimeout(seekThenStart, 450);
    } else {
        seekThenStart();
    }

    /* ---------- 手势兜底 ---------- */

    function onGesture(ev) {
        if (ev && ev.target && ev.target.closest && ev.target.closest(".bgm-toggle")) {
            return;
        }
        disarm();
        if (!userOff) start();
    }

    function arm() {
        if (armed) return;
        armed = true;
        document.addEventListener("pointerdown", onGesture, true);
        document.addEventListener("keydown", onGesture, true);
        document.addEventListener("touchstart", onGesture, true);
    }

    function disarm() {
        if (!armed) return;
        armed = false;
        document.removeEventListener("pointerdown", onGesture, true);
        document.removeEventListener("keydown", onGesture, true);
        document.removeEventListener("touchstart", onGesture, true);
    }

    /* ---------- 开关 ---------- */

    function onToggle() {
        disarm();
        if (userOff || audio.paused) {
            userOff = false;
            try {
                window.localStorage.setItem(STORE, "0");
            } catch (e) {
            }
            start();
        } else {
            userOff = true;
            try {
                window.localStorage.setItem(STORE, "1");
            } catch (e) {
            }
            audio.pause();
            paint("off");
        }
    }

    function bind() {
        btn = document.getElementById(TOGGLE_ID);
        if (!btn) return;
        textEl = btn.querySelector(".bgm-text");
        paint(state);
        btn.addEventListener("click", onToggle);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bind);
    } else {
        bind();
    }

    /* ---------- 记住进度 ---------- */

    function saveTime() {
        try {
            window.sessionStorage.setItem(TIME_KEY, String(audio.currentTime || 0));
        } catch (e) {
        }
    }

    var saved = -1;
    audio.addEventListener("timeupdate", function () {
        if (Math.abs(audio.currentTime - saved) < 2) return;
        saved = audio.currentTime;
        saveTime();
    });

    window.addEventListener("pagehide", saveTime);
})();
