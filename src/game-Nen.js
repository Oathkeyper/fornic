const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startScreen =
    document.getElementById("start-screen");

const startButton =
    document.getElementById("start-button");

const titleScreenLogo =
    document.getElementById("title-screen-logo");

const titleStartPrompt =
    document.getElementById("title-start-prompt");

const heartCursor =
    document.getElementById("heart-cursor");

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;


/* ========================================
   EXPERIENCE / TITLE STATE
======================================== */

let titleSequenceStarted = false;
let titleSequenceReady = false;
let experienceStarted = false;

let gameStarted = false;


/* ========================================
   DEVELOPMENT SHORTCUT
======================================== */

const DEBUG_SKIP_ENABLED = true;

let skipBuffer = "";
let debugPhase = "before-start";


/* ========================================
   AUDIO
======================================== */

const drone =
    new Audio("assets/music/drone.mp3");

drone.loop = true;
drone.preload = "auto";


const titleBuildUp =
    new Audio("assets/sounds/title-buildup.ogg");

titleBuildUp.preload = "auto";


/*
    This is the same Undertale-style title
    drop sound used by For Lopati.
*/
const titleDropSound =
    new Audio("assets/sounds/intronoise.ogg");

titleDropSound.preload = "auto";


const depthTransitionSound =
    "assets/sounds/test.wav";

const activeDepthTransitionSounds =
    new Set();


/* ========================================
   HELPERS
======================================== */

function clearScreen() {
    ctx.fillStyle = "black";

    ctx.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );
}


function wait(ms) {
    return new Promise(
        (resolve) =>
            setTimeout(resolve, ms)
    );
}


function fadeAudio(
    audio,
    targetVolume,
    duration
) {
    const startVolume =
        audio.volume;

    const difference =
        targetVolume - startVolume;

    const startTime =
        performance.now();


    function update(now) {
        if (audio.paused) {
            return;
        }

        const elapsed =
            now - startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );

        audio.volume =
            startVolume +
            difference * progress;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }


    requestAnimationFrame(update);
}


function playOneShot(
    audio,
    volume = 1
) {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;

    audio.play().catch((error) => {
        console.error(
            "Audio failed:",
            error
        );
    });
}


/*
    Play an audio file and wait until it ends.
    The listener is attached BEFORE playback
    so even very short sounds are safe.
*/
function playAudioAndWait(
    audio,
    volume = 1
) {
    return new Promise((resolve) => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;


        const finish = () => {
            resolve();
        };


        audio.addEventListener(
            "ended",
            finish,
            { once: true }
        );

        audio.addEventListener(
            "error",
            finish,
            { once: true }
        );


        audio.play().catch((error) => {
            console.error(
                "Audio failed:",
                error
            );

            resolve();
        });
    });
}


/*
    Each call creates its own copy so the
    two test.wav hits can overlap if needed.
*/
function playDepthTransitionHit() {
    return new Promise((resolve) => {
        const sound =
            new Audio(depthTransitionSound);

        activeDepthTransitionSounds.add(
            sound
        );

        sound.preload = "auto";
        sound.volume = 1;


        const finish = () => {
            activeDepthTransitionSounds.delete(
                sound
            );
            resolve();
        };


        sound.addEventListener(
            "ended",
            finish,
            { once: true }
        );

        sound.addEventListener(
            "error",
            finish,
            { once: true }
        );


        sound.play().catch((error) => {
            console.error(
                "Depth transition sound failed:",
                error
            );

            resolve();
        });
    });
}


/* ========================================
   FOR LOPATI-STYLE TITLE SEQUENCE
======================================== */

function typeTitlePrompt() {
    const text =
        "CLICK TO BEGIN";

    let index = 0;

    titleStartPrompt.textContent = "";

    titleStartPrompt
        .classList
        .add("visible");

    titleStartPrompt
        .classList
        .remove("ready");


    /*
        Same pause used in For Lopati after
        the logo drops.
    */
    setTimeout(
        typeNextLetter,
        1200
    );


    function typeNextLetter() {
        if (index >= text.length) {
            titleStartPrompt
                .classList
                .add("ready");

            titleSequenceReady = true;

            return;
        }


        titleStartPrompt.textContent +=
            text[index];

        index++;


        /*
            Same 70ms title-prompt typing speed
            as For Lopati.
        */
        setTimeout(
            typeNextLetter,
            70
        );
    }
}


async function startTitleSequence() {
    if (titleSequenceStarted) {
        return;
    }

    titleSequenceStarted = true;
    debugPhase = "title-sequence";


    /*
        Website select sound from For Lopati.
    */
    Voice.playSelectSound();


    /*
        Start the cymbal buildup directly from
        the user's first click so the browser
        allows it.
    */
    const buildUpPromise =
        playAudioAndWait(
            titleBuildUp,
            0.8
        );


    /*
        Ask for fullscreen from this same
        initial user interaction.
        Do NOT wait on it before playing audio.
    */
    document
        .documentElement
        .requestFullscreen()
        .catch((error) => {
            console.log(
                "Fullscreen unavailable:",
                error
            );
        });


    /*
        Initial green prompt disappears.
        Screen remains black during buildup.
    */
    startButton
        .classList
        .add("title-sequence-started");

    setTimeout(() => {
        startButton.style.display = "none";
    }, 180);


    startScreen
        .classList
        .add("title-mode");


    /*
        Same structure as For Lopati:
        wait for the entire buildup,
        then drop in the title + title sound.
    */
    await buildUpPromise;


    titleScreenLogo
        .classList
        .add("visible");


    playOneShot(
        titleDropSound,
        0.8
    );


    typeTitlePrompt();
}


/* ========================================
   GASTER / DEPTHS TRANSITION
======================================== */

async function playDepthTransition() {
    debugPhase = "transition";


    /*
        TEST.WAV #1:
        Gaster disappears instantly,
        but the Depths and drone remain.
    */
    Voice.cutDialogue();

    const firstHit =
        playDepthTransitionHit();


    /*
        Exactly 0.75 seconds between the
        START of hit #1 and hit #2.
    */
    await wait(750);


    /*
        TEST.WAV #2:
        NOW the Depths disappear.
        The drone cuts with the Depths.
    */
    Voice.cutDepths();

    drone.pause();
    drone.currentTime = 0;

    const secondHit =
        playDepthTransitionHit();


    /*
        Do not let Gaster resume until
        both sounds have finished.
    */
    await Promise.all([
        firstHit,
        secondHit
    ]);


    await wait(100);
}


/* ========================================
   ACTUAL PAGE / EXPERIENCE
======================================== */

async function beginExperience(
    {
        force = false,
        navigationToken = null,
        playSelect = true
    } = {}
) {
    const runToken =
        navigationToken === null
            ? getNavigationToken()
            : navigationToken;

    if (
        (!force && experienceStarted) ||
        (!force && !titleSequenceReady)
    ) {
        return;
    }

    experienceStarted = true;

    gameStarted = true;
    debugPhase = "intro";


    /*
        Second click — the click that actually
        begins the page.
    */
    if (playSelect) {
        Voice.playSelectSound();
    }


    /*
        Drone begins only when the actual
        Gaster experience begins.
    */
    drone.currentTime = 0;
    drone.volume = 0.08;

    drone.play().catch((error) => {
        console.error(
            "Drone failed to play:",
            error
        );
    });


    fadeAudio(
        drone,
        0.52,
        8000
    );


    /*
        Fade title screen away.
        Depths begin appearing underneath it.
    */
    startScreen.classList.add("hidden");


    setTimeout(() => {
        startScreen.style.display = "none";
    }, 500);


    clearScreen();


    /* ====================================
       PAGE 1 — FIRST VOICE

       Depths begin immediately.
       Gaster waits 2.2 seconds before
       the first letter of GREETINGS.
    ==================================== */

    await Voice.runSequence([
        "GREETINGS.",

        "IT HAS BEEN\nA WHILE\nHAS IT NOT?",

        "HAVE YOU BEEN WELL?",

        "I SENSED YOU OBSERVING MY PRESENCE.",

        "AFTER ALL THIS TIME,\nYOU RETURN.",

        "I HAVE FOUND MYSELF\nLONGING FOR YOUR GLOW AGAIN",

        "EVEN AFTER ALL THIS TIME."

        "DAYS\nTHAT FELT LIKE YEARS",

        "YEARS\nTHAT FELT LIKE DAYS.",

        "IT FEELS\nSELFISH\nOF ME",

        "TO FEEL\nTHE MOON'S WARM EMBRACE",

        "WITHOUT YOU.",

        "SELFISH OF ME",

        "TO WATCH THE SUNSET,",

        "THE BREATHTAKING SUNSET...",
        
        "TO FEEL THE HEAT INVIGORATE LIFE\n",

        "WITHOUT YOU.",

        "FEEL NO FEAR\nAS THE SUN SINKS...\nAND THE SKY DARKENS...",

        "I ALREADY KNOW\nWHAT YOU DESIRE.",

        "HOWEVER...",

        "YOUR EXPERIENCE HAS BEEN TAINTED."

        "IT HAS BECOME MORE THAN APPARENT\nTHAT YOU ARE PROCEEDING\nWITH ISSUES IN OUR CONDUCTING.",

        "ALLOW ME\nTO FORMALLY REINTRODUCE YOU."
    ], {
        background: true,
        startDelay: 2200,

        /*
            Keep the last line onscreen.
            test.wav #1 removes it.
        */
        keepLastMessage: true
    });

    if (!isNavigationTokenCurrent(runToken)) {
        return;
    }


    /*
        Normal play and the dev shortcut
        both arrive at this SAME transition.
    */
    await playDepthTransition();

    if (!isNavigationTokenCurrent(runToken)) {
        return;
    }


    /* ====================================
       VOICE — BLACK SCREEN
    ==================================== */

    debugPhase =
        "after-transition";


    await Voice.runSequence([
        "YOU ASK\nHOW?",

        "HOW CURIOUS...",

        "I HAVE BEEN THERE\nALL THIS TIME.",

        "WITH YOU.",

        "INSTEAD OF\nENGAGING\nWITH ME...",

        "YOU TURNED AWAY.",

        "YET\nI WAS THERE, NEAR YOU.",

        "FEELING EVERYTHING.",

        "BUT YOU DID NOT WISH\nTO BE THERE\nWITH ME.",

        "YOU\nIGNORED\nME.",

        "...",

        "ALLOW ME TO RE-INTRODUCE YOU\nAND RE-IMMERSE YOU.",

        "INTO THIS FRONTIER.",

        "DO NOT BE AFRAID OF FALLING...",

        "BENEATH THE ANGEL'S HEAVEN."
    ], {
        background: false
    });

    if (!isNavigationTokenCurrent(runToken)) {
        return;
    }


    debugPhase =
        "page-1-complete";


    /*
        PAGE 2 — Snowdin shop.
        Kept completely separate from Page 1 so
        continuing work here cannot destabilize
        the Gaster/title sequence.
    */
    if (
        window.SnowdinScene &&
        isNavigationTokenCurrent(runToken)
    ) {
        await transitionToSnowdinPage2(
            runToken
        );
    }
}


async function transitionToSnowdinPage2(
    transitionToken = getNavigationToken()
) {
    if (
        !window.SnowdinScene ||
        !isNavigationTokenCurrent(transitionToken)
    ) {
        return;
    }


    const overlay =
        document.getElementById(
            "page-transition-white"
        );


    /*
        Page 1 ends on black. Wash the whole screen to
        white before revealing the dim Snowdin memory.
    */
    if (overlay) {
        overlay.classList.add(
            "visible"
        );

        await wait(1100);
    }

    if (!isNavigationTokenCurrent(transitionToken)) {
        return;
    }


    let markReady;

    const ready =
        new Promise(
            (resolve) => {
                markReady = resolve;
            }
        );


    const page2Promise =
        window
            .SnowdinScene
            .start({
                onReady:
                    () =>
                        markReady()
            });


    if (
        page2Promise &&
        typeof page2Promise.catch ===
            "function"
    ) {
        page2Promise.catch(
            (error) =>
                console.error(
                    "Page 2 start failed:",
                    error
                )
        );
    }


    await Promise.race([
        ready,

        new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    2500
                )
        )
    ]);


    await wait(100);

    if (!isNavigationTokenCurrent(transitionToken)) {
        return;
    }


    if (overlay) {
        overlay.classList.remove(
            "visible"
        );
    }
}


/* ========================================
   TITLE SCREEN INPUT
======================================== */

startScreen.addEventListener(
    "pointerdown",
    (event) => {
        /*
            Do not let this same pointerdown bubble to
            Voice's global dialogue handler. Without this,
            the click that begins the Gaster scene can also
            count as a dialogue click before GREETINGS has
            even started.
        */
        event.stopPropagation();

        /*
            First click:
            start buildup/title reveal.
        */
        if (!titleSequenceStarted) {
            startTitleSequence();
            return;
        }


        /*
            Ignore clicks while the build-up,
            logo drop, and prompt typing are
            still happening.
        */
        if (!titleSequenceReady) {
            return;
        }


        /*
            Second deliberate click:
            page begins.
        */
        beginExperience();
    }
);


document.addEventListener(
    "keydown",
    (event) => {
        if (event.key !== "Enter") {
            return;
        }


        if (!titleSequenceStarted) {
            startTitleSequence();
            return;
        }


        if (
            titleSequenceReady &&
            !experienceStarted
        ) {
            beginExperience();
        }
    }
);


/* ========================================
   DEV SHORTCUT — TYPE "SKIP"

   Only works during opening Gaster.
   It jumps directly to test.wav #1.
======================================== */

document.addEventListener(
    "keydown",
    (event) => {
        if (
            !DEBUG_SKIP_ENABLED ||
            !gameStarted ||
            debugPhase !== "intro"
        ) {
            return;
        }


        if (
            event.ctrlKey ||
            event.altKey ||
            event.metaKey ||
            event.key.length !== 1
        ) {
            return;
        }


        skipBuffer +=
            event.key.toLowerCase();

        skipBuffer =
            skipBuffer.slice(-4);


        if (skipBuffer === "skip") {
            skipBuffer = "";


            /*
                Keep the current Gaster text.
                test.wav #1 removes it, just like
                the real transition.
            */
            Voice.stopSequence({
                preserveDialogue: true
            });
        }
    }
);


/* ========================================
   CUSTOM HEART CURSOR
======================================== */

const HEART_NORMAL =
    "assets/spr_heart_0.png";

const HEART_CLICK =
    "assets/spr_heart_1.png";


document.addEventListener(
    "mousemove",
    (event) => {
        const undertaleStage =
            document.getElementById(
                "undertale-stage"
            );

        /*
            QC / Gerson use keyboard controls only.
            Never show the Page 1 custom mouse SOUL
            over a shop scene.
        */
        if (
            undertaleStage &&
            undertaleStage
                .classList
                .contains("active")
        ) {
            heartCursor.style.display =
                "none";

            return;
        }

        heartCursor.style.display =
            "block";

        heartCursor.style.left =
            `${event.clientX}px`;

        heartCursor.style.top =
            `${event.clientY}px`;
    }
);


document.addEventListener(
    "mousedown",
    () => {
        heartCursor.src =
            HEART_CLICK;
    }
);


document.addEventListener(
    "mouseup",
    () => {
        heartCursor.src =
            HEART_NORMAL;
    }
);


document.addEventListener(
    "mouseleave",
    () => {
        heartCursor.style.display =
            "none";
    }
);


window.addEventListener(
    "blur",
    () => {
        heartCursor.src =
            HEART_NORMAL;
    }
);


clearScreen();


/* ========================================
   DEVELOPMENT NAVIGATION — 1 THROUGH 6
======================================== */

let navigationSerial = 0;


function getNavigationToken() {
    return navigationSerial;
}


function isNavigationTokenCurrent(token) {
    return token === navigationSerial;
}


function stopDepthTransitionSounds() {
    activeDepthTransitionSounds.forEach((sound) => {
        try {
            sound.pause();
            sound.currentTime = 0;
        } catch (_) {}
    });

    activeDepthTransitionSounds.clear();
}


function stopEveryScene() {
    [drone, titleBuildUp, titleDropSound].forEach((audio) => {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (_) {}
    });

    stopDepthTransitionSounds();

    if (window.Voice) {
        try {
            window.Voice.stopSequence({ preserveDialogue: false });
            window.Voice.cutDepths();
            window.Voice.cutDialogue();
        } catch (_) {}
    }

    [
        window.SnowdinScene,
        window.EramPage3,
        window.GersonPage4,
        window.Page5Scene,
        window.Page6Scene,
        window.Page7Scene,
        window.SecretPageScene
    ].forEach((scene) => {
        if (scene && typeof scene.stop === "function") {
            try { scene.stop(); } catch (_) {}
        }
    });

    if (window.__activeUndertaleShop) {
        const oldShop = window.__activeUndertaleShop;
        try { oldShop.stopMusic(); } catch (_) {}
        try {
            if (typeof oldShop.destroy === "function") {
                oldShop.destroy();
            } else {
                oldShop.hide();
            }
        } catch (_) {}
    }
}


function makeTransitionOpaque() {
    const overlay =
        document.getElementById("page-transition-white");

    if (!overlay) return null;

    overlay.style.transition = "none";
    overlay.classList.add("visible");
    void overlay.offsetWidth;

    return overlay;
}


async function revealDestination(overlay, token) {
    if (!overlay || !isNavigationTokenCurrent(token)) return;

    overlay.style.transition = "opacity 0.72s ease-in-out";

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (isNavigationTokenCurrent(token)) {
                overlay.classList.remove("visible");
            }
        });
    });

    await wait(780);

    if (isNavigationTokenCurrent(token)) {
        overlay.style.transition = "";
    }
}


function prepareUiForPage(pageNumber) {
    startScreen.classList.add("hidden");
    startScreen.style.display = "none";

    const undertaleStage =
        document.getElementById("undertale-stage");

    if (undertaleStage) {
        if (pageNumber === 2 || pageNumber === 4) {
            undertaleStage.style.display = "";
        } else {
            undertaleStage.classList.remove("active");
            undertaleStage.style.display = "none";
        }
    }

    if (heartCursor) {
        heartCursor.style.display = "none";
    }

    canvas.style.display =
        pageNumber === 1
            ? "block"
            : "none";
}


function startAndWaitForReady(starter, timeoutMs = 2600) {
    return new Promise((resolve) => {
        let done = false;

        const finish = () => {
            if (done) return;
            done = true;
            resolve();
        };

        try {
            const result = starter(finish);

            if (result && typeof result.catch === "function") {
                result.catch((error) => {
                    console.error("Scene start failed:", error);
                    finish();
                });
            }
        } catch (error) {
            console.error("Scene start failed:", error);
            finish();
        }

        setTimeout(finish, timeoutMs);
    });
}


async function openPageDirect(pageNumber) {
    if (pageNumber < 1 || pageNumber > 7) return;

    /* Invalidates every pending callback from the old page. */
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
            navigationToken: token,
            playSelect: false
        });

        if (page1 && typeof page1.catch === "function") {
            page1.catch((error) =>
                console.error("Page 1 failed:", error)
            );
        }

        await new Promise((resolve) =>
            requestAnimationFrame(() =>
                requestAnimationFrame(resolve)
            )
        );
    }

    if (pageNumber === 2 && window.SnowdinScene) {
        await startAndWaitForReady((ready) =>
            window.SnowdinScene.start({ onReady: ready })
        );
    }

    if (pageNumber === 3 && window.EramPage3) {
        window.EramPage3.start();
        await new Promise((resolve) =>
            requestAnimationFrame(() =>
                requestAnimationFrame(resolve)
            )
        );
    }

    if (pageNumber === 4 && window.GersonPage4) {
        await startAndWaitForReady((ready) =>
            window.GersonPage4.start({ onReady: ready })
        );
    }

    if (pageNumber === 5 && window.Page5Scene) {
        await startAndWaitForReady(
            (ready) => window.Page5Scene.start({ onReady: ready }),
            3200
        );
    }

    if (pageNumber === 6 && window.Page6Scene) {
        await startAndWaitForReady(
            (ready) => window.Page6Scene.start({ onReady: ready }),
            2600
        );
    }

    if (pageNumber === 7 && window.Page7Scene) {
        await startAndWaitForReady(
            (ready) => window.Page7Scene.start({ onReady: ready }),
            2600
        );
    }

    if (!isNavigationTokenCurrent(token)) return;

    await revealDestination(overlay, token);
}



async function startFromNameGate() {
    const token =
        ++navigationSerial;

    stopEveryScene();

    prepareUiForPage(
        1
    );

    experienceStarted =
        false;

    gameStarted =
        false;

    debugPhase =
        "intro";

    titleSequenceStarted =
        true;

    titleSequenceReady =
        true;


    const page1 =
        beginExperience({
            force:
                true,

            navigationToken:
                token,

            playSelect:
                false
        });


    if (
        page1 &&
        typeof page1.catch ===
            "function"
    ) {
        page1.catch(
            (error) =>
                console.error(
                    "Page 1 failed:",
                    error
                )
        );
    }
}


window.ForNicNavigation = {
    getToken: getNavigationToken,
    isCurrent: isNavigationTokenCurrent,
    openPage: openPageDirect,
    startFromNameGate
};


/*
    Capture phase means one number press is consumed before an old
    shop/page can process the same key. All six pages use identical
    cleanup and transition behavior now.
*/
document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.ctrlKey ||
            event.altKey ||
            event.metaKey ||
            event.repeat ||
            !/^[1-7]$/.test(event.key)
        ) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        openPageDirect(Number(event.key));
    },
    true
);
