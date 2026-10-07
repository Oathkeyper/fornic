(() => {
    "use strict";
    const gate = document.getElementById("name-gate");
    const connected = document.getElementById("name-gate-connected");
    const entry = document.getElementById("name-gate-entry");
    const value = document.getElementById("name-gate-value");
    if (!gate || !connected || !entry || !value) return;
    const MAX_LENGTH = 12;
    let phase = "connected";
    let typed = "";
    let finished = false;
    let fullscreenRequested = false;
    const saveSound = new Audio("assets/sounds/snd_save.wav");
    saveSound.preload = "auto";
    function requestGateFullscreen() {
        if (fullscreenRequested || document.fullscreenElement) return;
        fullscreenRequested = true;
        const request = document.documentElement.requestFullscreen;
        if (typeof request !== "function") return;
        try {
            const result = request.call(document.documentElement);
            if (result && typeof result.catch === "function") result.catch(() => {});
        } catch (_) {}
    }
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function renderName() {
        const shown = typed.toUpperCase();
        const blanks = "_".repeat(Math.max(0, MAX_LENGTH - shown.length));
        value.textContent = shown + blanks;
    }
    async function unlock(name) {
        if (finished) return;
        finished = true;
        try {
            saveSound.currentTime = 0;
            saveSound.volume = 0.9;
            saveSound.play().catch(() => {});
        } catch (_) {}
        gate.style.transition = "none";
        gate.style.background = "#000";
        gate.innerHTML = "";
        await wait(850);
        const destinations = {
            lopati: "forlopati/index.html",
            jordan: "forjordan/index.html"
        };
        if (destinations[name]) {
            window.location.replace(destinations[name]);
            return;
        }
        document.body.classList.remove("name-gate-active");
        gate.remove();
    }
    function reject() {
        if (finished) return;
        finished = true;
        try {
            window.open("", "_self");
            window.close();
        } catch (_) {}
        setTimeout(() => {
            try {
                window.location.replace("about:blank");
            } catch (_) {
                document.documentElement.innerHTML = "";
            }
        }, 120);
    }
    function onKeyDown(event) {
        if (!document.body.classList.contains("name-gate-active")) return;
        requestGateFullscreen();
        event.preventDefault();
        event.stopImmediatePropagation();
        if (phase !== "entry" || finished) return;
        if (event.key === "Backspace") {
            typed = typed.slice(0, -1);
            renderName();
            return;
        }
        if (event.key === "Enter") {
            const name = typed.trim().toLowerCase();
            if ([ "nic", "lopati", "jordan" ].includes(name)) unlock(name); else reject();
            return;
        }
        if (/^[a-zA-Z]$/.test(event.key) && typed.length < MAX_LENGTH) {
            typed += event.key;
            renderName();
        }
    }
    document.addEventListener("keydown", onKeyDown, true);
    renderName();
    setTimeout(() => {
        if (finished) return;
        connected.classList.add("hidden");
        entry.classList.remove("hidden");
        phase = "entry";
    }, 1500);
})();
