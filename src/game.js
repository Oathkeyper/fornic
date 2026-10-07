const canvas = document.getElementById("game");

const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("start-screen");

const startButton = document.getElementById("start-button");

const titleScreenLogo = document.getElementById("title-screen-logo");

const titleStartPrompt = document.getElementById("title-start-prompt");

const heartCursor = document.getElementById("heart-cursor");

const GAME_WIDTH = 1920;

const GAME_HEIGHT = 1080;

let titleSequenceStarted = false;

let titleSequenceReady = false;

let experienceStarted = false;

let controlsIntroActive = false;

let controlsIntroReady = false;

let gameStarted = false;

const DEBUG_SKIP_ENABLED = true;

let skipBuffer = "";

let debugPhase = "before-start";

const drone = new Audio("assets/music/drone.mp3");

drone.loop = true;

drone.preload = "auto";

const titleBuildUp = new Audio("assets/sounds/title-buildup.ogg");

titleBuildUp.preload = "auto";

const titleDropSound = new Audio("assets/sounds/intronoise.ogg");

titleDropSound.preload = "auto";

const depthTransitionSound = "assets/sounds/test.wav";

const activeDepthTransitionSounds = new Set;

window.ForNicTransition = (() => {
    const cuePath = "assets/sounds/dtintronoise.mp3";
    const preload = new Audio(cuePath);
    preload.preload = "auto";
    let cancelActive = null;
    function cancel() {
        if (cancelActive) cancelActive();
    }
    function whiteout({token: token = getNavigationToken(), shop: shop = null} = {}) {
        cancel();
        const overlay = shop ? null : document.getElementById("page-transition-white");
        const start = shop ? shop.whiteout : 0;
        const audio = new Audio(cuePath);
        audio.preload = "auto";
        audio.volume = 1;
        return new Promise(resolve => {
            let frameId = null;
            let done = false;
            let fallbackAt = null;
            let loadTimer;
            if (overlay) {
                overlay.style.transition = "none";
                overlay.style.opacity = "0";
                overlay.classList.add("visible");
            }
            const paint = progress => {
                if (shop) shop.whiteout = start + (1 - start) * progress;
                if (overlay) overlay.style.opacity = String(progress);
            };
            const finish = completed => {
                if (done) return;
                done = true;
                clearTimeout(loadTimer);
                cancelAnimationFrame(frameId);
                audio.removeEventListener("ended", onEnded);
                audio.removeEventListener("error", onError);
                audio.removeEventListener("playing", onPlaying);
                audio.pause();
                if (completed) paint(1);
                if (overlay) {
                    if (!completed) overlay.classList.remove("visible");
                    overlay.style.opacity = "";
                    overlay.offsetWidth;
                    overlay.style.transition = "";
                }
                if (cancelActive === abort) cancelActive = null;
                resolve(completed);
            };
            const abort = () => finish(false);
            const onEnded = () => finish(isNavigationTokenCurrent(token));
            const onPlaying = () => clearTimeout(loadTimer);
            const onError = () => {
                if (done || fallbackAt !== null) return;
                clearTimeout(loadTimer);
                audio.pause();
                fallbackAt = performance.now();
            };
            const frame = now => {
                if (done) return;
                if (!isNavigationTokenCurrent(token) || shop && shop.destroyed) {
                    finish(false);
                    return;
                }
                if (fallbackAt !== null) {
                    const progress = Math.min(1, (now - fallbackAt) / 1050);
                    paint(progress);
                    if (progress >= 1) {
                        finish(true);
                        return;
                    }
                } else if (Number.isFinite(audio.duration) && audio.duration > 0) paint(Math.min(1, audio.currentTime / audio.duration));
                frameId = requestAnimationFrame(frame);
            };
            cancelActive = abort;
            audio.addEventListener("ended", onEnded);
            audio.addEventListener("error", onError);
            audio.addEventListener("playing", onPlaying);
            loadTimer = setTimeout(onError, 8000);
            frameId = requestAnimationFrame(frame);
            try {
                Promise.resolve(audio.play()).catch(onError);
            } catch (_) {
                onError();
            }
        });
    }
    return {
        whiteout: whiteout,
        cancel: cancel
    };
})();

function clearScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fadeAudio(audio, targetVolume, duration) {
    const startVolume = audio.volume;
    const difference = targetVolume - startVolume;
    const startTime = performance.now();
    function update(now) {
        if (audio.paused) return;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = startVolume + difference * progress;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function playOneShot(audio, volume = 1) {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(error => {});
}

function playAudioAndWait(audio, volume = 1) {
    return new Promise(resolve => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;
        const finish = () => {
            resolve();
        };
        audio.addEventListener("ended", finish, {
            once: true
        });
        audio.addEventListener("error", finish, {
            once: true
        });
        audio.play().catch(error => {
            resolve();
        });
    });
}

function playDepthTransitionHit() {
    return new Promise(resolve => {
        const sound = new Audio(depthTransitionSound);
        activeDepthTransitionSounds.add(sound);
        sound.preload = "auto";
        sound.volume = 1;
        const finish = () => {
            activeDepthTransitionSounds.delete(sound);
            resolve();
        };
        sound.addEventListener("ended", finish, {
            once: true
        });
        sound.addEventListener("error", finish, {
            once: true
        });
        sound.play().catch(error => {
            resolve();
        });
    });
}

function typeTitlePrompt() {
    const text = "CLICK TO BEGIN";
    let index = 0;
    titleStartPrompt.textContent = "";
    titleStartPrompt.classList.add("visible");
    titleStartPrompt.classList.remove("ready");
    setTimeout(typeNextLetter, 1200);
    function typeNextLetter() {
        if (index >= text.length) {
            titleStartPrompt.classList.add("ready");
            titleSequenceReady = true;
            return;
        }
        titleStartPrompt.textContent += text[index];
        index++;
        setTimeout(typeNextLetter, 70);
    }
}

async function startTitleSequence() {
    if (titleSequenceStarted) return;
    titleSequenceStarted = true;
    debugPhase = "title-sequence";
    const buildUpPromise = playAudioAndWait(titleBuildUp, 0.8);
    document.documentElement.requestFullscreen().catch(error => {});
    startButton.classList.add("title-sequence-started");
    setTimeout(() => {
        startButton.style.display = "none";
    }, 180);
    startScreen.classList.add("title-mode");
    await buildUpPromise;
    titleScreenLogo.classList.add("visible");
    playOneShot(titleDropSound, 0.8);
    typeTitlePrompt();
}

async function playDepthTransition() {
    debugPhase = "transition";
    Voice.cutDialogue();
    const firstHit = playDepthTransitionHit();
    await wait(750);
    Voice.cutDepths();
    drone.pause();
    drone.currentTime = 0;
    const secondHit = playDepthTransitionHit();
    await Promise.all([ firstHit, secondHit ]);
    await wait(100);
}

async function showControlsIntro() {
    if (controlsIntroActive || experienceStarted) return;
    controlsIntroActive = true;
    controlsIntroReady = false;
    titleScreenLogo.classList.remove("visible");
    titleStartPrompt.classList.remove("visible", "ready");
    titleStartPrompt.textContent = "";
    startButton.style.display = "block";
    startButton.classList.remove("title-sequence-started");
    startButton.style.whiteSpace = "pre-line";
    startButton.classList.add("controls-intro");
    startButton.textContent = "";
    const message = "USE THE ARROW KEYS TO MOVE.\nPRESS Z TO SELECT.\nHOLD X TO SPEED UP TEXT.";
    for (const char of message) {
        startButton.textContent += char;
        await wait(char === "\n" ? 180 : 34);
    }
    controlsIntroReady = true;
}

async function beginExperience({force: force = false, navigationToken: navigationToken = null} = {}) {
    const runToken = navigationToken === null ? getNavigationToken() : navigationToken;
    if (!force && experienceStarted || !force && !titleSequenceReady) return;
    experienceStarted = true;
    gameStarted = true;
    debugPhase = "intro";
    drone.currentTime = 0;
    drone.volume = 0.08;
    drone.play().catch(error => {});
    fadeAudio(drone, 0.52, 8000);
    startScreen.classList.add("hidden");
    setTimeout(() => {
        startScreen.style.display = "none";
    }, 500);
    clearScreen();
    await Voice.runSequence([ "GREETINGS.", "IT HAS BEEN\nA WHILE\nHAS IT NOT?", "HAVE YOU BEEN WELL?", "...", "PERHAPS\nTHIS QUESTION IS\nUNWARRANTED.", "MY CURIOSITY,\nHOWEVER,\nOVERWHELMS ME.", "AFTER ALL THIS TIME,\nIT SEEMS YOU HAVE GROWN.", "MY UNCHANGING SCENERY\nOF YOU AND YOUR SOUL...", "I SPENT YEARS\nFINDING COMFORT\nIN YOUR PRESCENCE.", "SPRING CHANGED TO SUMMER,\nAND SUMMER CHANGED TO COLD,", "AND AFTER ALL THIS TIME,\nYOU RETURN.", "I HAVE FOUND MYSELF\nLONGING\nFOR YOUR GLOW AGAIN", "DAYS\nTHAT FELT LIKE YEARS", "YEARS\nTHAT FELT LIKE DAYS.", "IT FEELS\nSELFISH\nOF ME", "TO FEEL\nTHE MOON'S WARM EMBRACE", "WITHOUT YOU.", "SELFISH OF ME", "TO WATCH THE SUNSET,", "THE BREATHTAKING SUNSET...", "TO FEEL THE HEAT INVIGORATE LIFE\n", "WITHOUT YOU.", "FEEL NO FEAR\nAS THE SUN SINKS...\nAND THE SKY DARKENS...", "I WELCOME YOU BACK\nTO YOUR OWN DESIRES.", "HOWEVER...", "YOUR PERSPECTIVE HAS BEEN TAINTED.", "IT HAS BECOME MORE THAN APPARENT\nTHAT YOU ARE PROCEEDING\nWITH ISSUES IN OUR CONDUCTING." ], {
        background: true,
        startDelay: 2200,
        keepLastMessage: true
    });
    if (!isNavigationTokenCurrent(runToken)) return;
    await playDepthTransition();
    if (!isNavigationTokenCurrent(runToken)) return;
    debugPhase = "after-transition";
    await Voice.runSequence([ "HOW CURIOUS...", "I HAVE BEEN THERE\nALL THIS TIME.", "WITH YOU.", "INSTEAD OF\nENGAGING\nWITH ME...", "YOU TURNED AWAY.", "YET\nI WAS THERE, NEAR YOU.", "FEELING EVERYTHING.", "...", "ALLOW ME TO RE-IMMERSE YOU.", "INTO THIS FRONTIER.\nFAITHFULLY.", "THIS TIME\nNOBODY\nWILL INTERRUPT OUR TETHERING.", "DO NOT BE AFRAID OF FALLING", "BENEATH THE ANGEL'S HEAVEN." ], {
        background: false
    });
    if (!isNavigationTokenCurrent(runToken)) return;
    debugPhase = "page-1-complete";
    if (window.SnowdinScene && isNavigationTokenCurrent(runToken)) await transitionToSnowdinPage2(runToken);
}

async function transitionToSnowdinPage2(transitionToken = getNavigationToken()) {
    if (!window.SnowdinScene || !isNavigationTokenCurrent(transitionToken)) return;
    const overlay = document.getElementById("page-transition-white");
    const completed = await window.ForNicTransition.whiteout({
        token: transitionToken
    });
    if (!completed) return;
    if (!isNavigationTokenCurrent(transitionToken)) return;
    let markReady;
    const ready = new Promise(resolve => {
        markReady = resolve;
    });
    const page2Promise = window.SnowdinScene.start({
        onReady: () => markReady()
    });
    if (page2Promise && typeof page2Promise.catch === "function") page2Promise.catch(error => {});
    await Promise.race([ ready, new Promise(resolve => setTimeout(resolve, 2500)) ]);
    await wait(100);
    if (!isNavigationTokenCurrent(transitionToken)) return;
    if (overlay) overlay.classList.remove("visible");
}

startScreen.addEventListener("pointerdown", event => {
    event.stopPropagation();
    if (!titleSequenceStarted) {
        startTitleSequence();
        return;
    }
    if (!titleSequenceReady) return;
    showControlsIntro();
});

document.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    if (!titleSequenceStarted) {
        startTitleSequence();
        return;
    }
    if (titleSequenceReady && !experienceStarted) beginExperience();
});

document.addEventListener("keydown", event => {
    if (!DEBUG_SKIP_ENABLED || !gameStarted || debugPhase !== "intro") return;
    if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
    skipBuffer += event.key.toLowerCase();
    skipBuffer = skipBuffer.slice(-4);
    if (skipBuffer === "skip") {
        skipBuffer = "";
        Voice.stopSequence({
            preserveDialogue: true
        });
    }
});

document.addEventListener("keydown", event => {
    if (!controlsIntroActive || experienceStarted) return;
    const key = event.key.toLowerCase();
    if (key === "x") {
        event.preventDefault();
        return;
    }
    if (key === "z" && controlsIntroReady) {
        event.preventDefault();
        controlsIntroActive = false;
        startButton.classList.remove("controls-intro");
        beginExperience();
    }
});

const HEART_NORMAL = "assets/spr_heart_0.png";

const HEART_CLICK = "assets/spr_heart_1.png";

document.addEventListener("mousemove", event => {
    const undertaleStage = document.getElementById("undertale-stage");
    if (undertaleStage && undertaleStage.classList.contains("active")) {
        heartCursor.style.display = "none";
        return;
    }
    heartCursor.style.display = "block";
    heartCursor.style.left = `${event.clientX}px`;
    heartCursor.style.top = `${event.clientY}px`;
});

document.addEventListener("mousedown", () => {
    heartCursor.src = HEART_CLICK;
});

document.addEventListener("mouseup", () => {
    heartCursor.src = HEART_NORMAL;
});

document.addEventListener("mouseleave", () => {
    heartCursor.style.display = "none";
});

window.addEventListener("blur", () => {
    heartCursor.src = HEART_NORMAL;
});

clearScreen();

let navigationSerial = 0;

function getNavigationToken() {
    return navigationSerial;
}

function isNavigationTokenCurrent(token) {
    return token === navigationSerial;
}

function stopDepthTransitionSounds() {
    activeDepthTransitionSounds.forEach(sound => {
        try {
            sound.pause();
            sound.currentTime = 0;
        } catch (_) {}
    });
    activeDepthTransitionSounds.clear();
}

function stopEveryScene() {
    window.ForNicTransition.cancel();
    [ drone, titleBuildUp, titleDropSound ].forEach(audio => {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (_) {}
    });
    stopDepthTransitionSounds();
    if (Voice) try {
        Voice.stopSequence({
            preserveDialogue: false
        });
        Voice.cutDepths();
        Voice.cutDialogue();
    } catch (_) {}
    [ window.SnowdinScene, window.EramPage3, window.GersonPage4, window.Page5Scene, window.Page6Scene, window.Page7Scene, window.SecretPageScene ].forEach(scene => {
        if (scene && typeof scene.stop === "function") try {
            scene.stop();
        } catch (_) {}
    });
    if (window.__activeUndertaleShop) {
        const oldShop = window.__activeUndertaleShop;
        try {
            oldShop.stopMusic();
        } catch (_) {}
        try {
            if (typeof oldShop.destroy === "function") oldShop.destroy(); else oldShop.hide();
        } catch (_) {}
    }
}

function makeTransitionOpaque() {
    const overlay = document.getElementById("page-transition-white");
    if (!overlay) return null;
    overlay.style.transition = "none";
    overlay.classList.add("visible");
    overlay.offsetWidth;
    return overlay;
}

async function revealDestination(overlay, token) {
    if (!overlay || !isNavigationTokenCurrent(token)) return;
    overlay.style.transition = "opacity 0.72s ease-in-out";
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (isNavigationTokenCurrent(token)) overlay.classList.remove("visible");
        });
    });
    await wait(780);
    if (isNavigationTokenCurrent(token)) overlay.style.transition = "";
}

function prepareUiForPage(pageNumber) {
    startScreen.classList.add("hidden");
    startScreen.style.display = "none";
    const undertaleStage = document.getElementById("undertale-stage");
    if (undertaleStage) if (pageNumber === 2 || pageNumber === 4) undertaleStage.style.display = ""; else {
        undertaleStage.classList.remove("active");
        undertaleStage.style.display = "none";
    }
    if (heartCursor) heartCursor.style.display = "none";
    canvas.style.display = pageNumber === 1 ? "block" : "none";
}

function startAndWaitForReady(starter, timeoutMs = 2600) {
    return new Promise(resolve => {
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            resolve();
        };
        try {
            const result = starter(finish);
            if (result && typeof result.catch === "function") result.catch(error => {
                finish();
            });
        } catch (error) {
            finish();
        }
        setTimeout(finish, timeoutMs);
    });
}

async function openPageDirect(pageNumber) {
    if (pageNumber < 1 || pageNumber > 7) return;
    const token = ++navigationSerial;
    const overlay = makeTransitionOpaque();
    stopEveryScene();
    prepareUiForPage(pageNumber);
    if (pageNumber === 1) {
        experienceStarted = false;
        gameStarted = false;
        debugPhase = "intro";
        titleSequenceReady = true;
        const page1 = beginExperience({
            force: true,
            navigationToken: token
        });
        if (page1 && typeof page1.catch === "function") page1.catch(error => {});
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    if (pageNumber === 2 && window.SnowdinScene) await startAndWaitForReady(ready => window.SnowdinScene.start({
        onReady: ready
    }));
    if (pageNumber === 3 && window.EramPage3) {
        window.EramPage3.start();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    if (pageNumber === 4 && window.GersonPage4) await startAndWaitForReady(ready => window.GersonPage4.start({
        onReady: ready
    }));
    if (pageNumber === 5 && window.Page5Scene) await startAndWaitForReady(ready => window.Page5Scene.start({
        onReady: ready
    }), 3200);
    if (pageNumber === 6 && window.Page6Scene) await startAndWaitForReady(ready => window.Page6Scene.start({
        onReady: ready
    }), 2600);
    if (pageNumber === 7 && window.Page7Scene) await startAndWaitForReady(ready => window.Page7Scene.start({
        onReady: ready
    }), 2600);
    if (!isNavigationTokenCurrent(token)) return;
    await revealDestination(overlay, token);
}

window.ForNicNavigation = {
    getToken: getNavigationToken,
    isCurrent: isNavigationTokenCurrent,
    openPage: openPageDirect
};

document.addEventListener("keydown", event => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.repeat || !/^[1-7]$/.test(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openPageDirect(Number(event.key));
}, true);
