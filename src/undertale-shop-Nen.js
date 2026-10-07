(() => {
    "use strict";

    const WIDTH = 1920;
    const HEIGHT = 1080;

    /*
        QC must never cross the white divider into
        the dialogue UI. The widescreen PSD's art
        region ends exactly halfway down the stage.
    */
    const ART_BOTTOM = 540;

    /*
        Keep dialogue in an Undertale-like page:
        max four visual lines, with generous top
        and bottom breathing room.
    */
    /*
        Wrap by measured PIXEL width. 8BitOperator has
        wider glyphs such as m and w, so a fixed
        per-character advance causes collisions.
    */
    const DIALOGUE_MAX_WIDTH = 1540;
    const DIALOGUE_MAX_LINES = 4;

    const FULL_DIALOGUE = {
        /*
            Repaint the ENTIRE lower half so the split
            shop boxes underneath can never show through.
        */
        outerX: 0,
        outerY: 540,
        outerW: 1920,
        outerH: 540,

        border: 16,

        starX: 92,
        textX: 184,
        textY: 586,
        lineHeight: 88
    };

    /*
        The new Snowdin PSD is 2048×1152.
        1920×1080 is the same 16:9 ratio, so it
        scales perfectly by 0.9375 with no crop.
    */
    const UI = {
        dialogueStarX: 92,
        dialogueTextX: 184,
        dialogueY: 604,
        dialogueLineHeight: 90,

        menuHeartX: 1215,
        menuTextX: 1300,

        menuRows: [
            582,
            672,
            762,
            852
        ],

        goldX: 1300,
        inventoryX: 1695,
        statY: 950
    };

    /*
        The font sprite has a small amount of blank
        space above its visible pixels, while the SOUL
        begins almost immediately at its image Y.

        Raw equal Y coordinates therefore make the
        heart LOOK slightly too high.

        Apply one shared optical correction everywhere.
    */
    const SOUL_TEXT_Y_OFFSET = 18;


    const TEXT = {
        /*
            One consistent Undertale-sized text scale
            everywhere on Page 2.
        */
        mainSize: 64,
        mainAdvance: 0,

        dialogueSize: 64,

        topicSize: 64,
        topicAdvance: 0,

        white: "#ffffff",
        yellow: "#ffff00",
        disabled: "#666666"
    };

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => resolve(image);

            image.onerror = () => {
                reject(
                    new Error(
                        `Could not load image: ${src}`
                    )
                );
            };

            image.src = src;
        });
    }

    function loadOptionalImage(src) {
        return loadImage(src).catch((error) => {
            console.warn(error.message);
            return null;
        });
    }

    class ShopEngine {
        constructor(config = {}) {
            this.canvas =
                document.getElementById(
                    "undertale-stage"
                );

            if (!this.canvas) {
                throw new Error(
                    "Missing #undertale-stage canvas."
                );
            }

            this.ctx =
                this.canvas.getContext("2d");

            this.ctx.imageSmoothingEnabled =
                false;

            this.config = {
                background:
                    "assets/art/snowdin shop pic widescreen.png",

                qcComposite:
                    "assets/art/snowdin pic qc widescreen.png",

                soul:
                    "assets/spr_heart_2.png",

                selectSound:
                    "assets/sounds/select.wav",

                /*
                    Undertale-style dialogue voice.
                    QC uses this by default.
                */
                dialogueBlipSound:
                    "assets/sounds/SND_TXT1.wav",

                music:
                    "assets/music/snowdrift.mp3",

                character: {
                    body:
                        "assets/art/qc/body.png",

                    faceBase:
                        "assets/art/qc/face_0.png",

                    faces:
                        Array.from(
                            { length: 7 },
                            (_, i) =>
                                `assets/art/qc/face_${i}.png`
                        ),

                    eyes:
                        Array.from(
                            { length: 4 },
                            (_, i) =>
                                `assets/art/qc/eyes_${i}.png`
                        ),

                    mouths: [
                        "assets/art/qc/mouth_0.png",
                        "assets/art/qc/mouth_1.png"
                    ],

                    /*
                        Calibrated from the QC mockup:
                        body.png is 61×111 and appears
                        at about 5× in the 2048×1152 PSD.

                        The values below are that placement
                        translated to the 1920×1080 stage.
                    */
                    bodyBox: {
                        x: 824,
                        y: 36,
                        w: 286,
                        h: 520
                    },

                    faceBox: {
                        x: 908,
                        y: 144,
                        w: 117,
                        h: 117
                    },

                    eyesBox: {
                        x: 904,
                        y: 181,
                        w: 122,
                        h: 33
                    },

                    mouthBox: {
                        x: 946,
                        y: 228,
                        w: 42,
                        h: 33
                    },

                    mouthFrameMs: 95,

                    blinkMinMs: 3000,
                    blinkMaxMs: 3000,
                    blinkHoldMs: 120
                },

                goldText: "590",
                inventoryText: "8/8",

                statusText:
                    "* Take your time.",

                mainStatusText:
                    null,

                topicPrompt:
                    "Care to chat?",

                ...config
            };

            this.images = {
                background: null,
                qcComposite: null,

                soul: null,

                arm: null,
                body: null,
                faceBase: null,
                faces: [],
                eyes: [],
                mouths: []
            };

            this.selectSound =
                new Audio(
                    this.config.selectSound
                );

            this.selectSound.preload =
                "auto";

            /*
                Cache dialogue blip Audio objects by file path.
                We clone the cached audio for each character so
                rapid Undertale-style blips can overlap naturally
                instead of constantly cutting one another off.
            */
            this.dialogueBlipSounds =
                new Map();

            this.defaultDialogueBlipSound =
                String(
                    this.config.dialogueBlipSound ??
                    ""
                );

            if (this.defaultDialogueBlipSound) {
                const defaultBlip =
                    new Audio(
                        this.defaultDialogueBlipSound
                    );

                defaultBlip.preload =
                    "auto";

                this.dialogueBlipSounds.set(
                    this.defaultDialogueBlipSound,
                    defaultBlip
                );
            }

            this.music =
                this.config.music
                    ? new Audio(
                        this.config.music
                    )
                    : null;

            if (this.music) {
                this.music.loop = true;
                this.music.preload = "auto";
            }

            this.active = false;

            this.characterVisible = false;
            this.characterOpacity = 0;

            /*
                1 = normal shop lighting.
                Lower values place a black overlay over
                the shop art.
            */
            this.backgroundBrightness = 1;

            /*
                During the entrance we crossfade the
                user's exact QC mockup on top of the
                empty shop. Once the fade completes,
                the code-driven QC takes over so eyes
                and mouth can animate normally.
            */
            this.qcCompositeOpacity = 0;

            this.menuVisible = false;
            this.mode = "locked";

            /*
                Used by the whiteout ending so the full
                dialogue panel persists between lines.
            */
            this.fullDialogueHold = false;

            this.mainOptions = [
                {
                    label: "Buy",
                    enabled: false
                },
                {
                    label: "Sell",
                    enabled: false
                },
                {
                    label: "Talk",
                    enabled: true
                },
                {
                    label: "Exit",
                    enabled: false
                }
            ];

            this.mainSelection = 2;

            this.topics = [];
            this.topicSelection = 0;

            this.choice = {
                active: false,
                prompt: "",
                options: [],
                selection: 0,
                resolve: null
            };

            this.statusText =
                String(
                    this.config.statusText ??
                    ""
                );

            this.mainStatusText =
                String(
                    this.config.mainStatusText ??
                    this.config.statusText ??
                    ""
                );

            this.dialogue = {
                active: false,

                lines: [],
                lineIndex: 0,

                fullText: "",
                visibleText: "",

                typing: false,
                timer: null,

                resolve: null,
                returnMode: "topics",

                /*
                    Optional per-say() voice override.
                    Empty string falls back to the character's
                    normal dialogueBlipSound.
                */
                blipSound: "",

                inputUnlockedAt: 0
            };

            this.typeSpeedMs = 32;
            this.fastTypeSpeedMs = 8;
            this.fastText = false;

            this.fullLineLockMs = 280;

            this.talking = false;
            this.mouthFrame = 0;
            this.lastMouthFrameAt = 0;

            this.talkEyeStep = 0;

            this.eyeExpressionFrame = 0;
            this.eyeFrame = 0;
            this.nextBlinkAt = 0;

            this.blinkSequenceActive = false;
            this.blinkStep = 0;
            this.nextBlinkStepAt = 0;
            this.blinkFrameMs = 70;

            this.expressionFrame = 0;

            this.whiteout = 0;
            this.finalText = "";

            this.sharpTextCache =
                new Map();

            this.initialized = false;

            /*
                Page shortcuts can enter/leave shops repeatedly.
                Track lifecycle resources so inactive test scenes do not
                leave RAF loops or keyboard listeners running forever.
            */
            this.destroyed = false;
            this.renderFrameId = null;
            this.oneShotAudio = new Set();

            this.boundKeyDown =
                (event) =>
                    this.onKeyDown(event);

            this.boundKeyUp =
                (event) =>
                    this.onKeyUp(event);

        }

        async init() {
            if (this.initialized) {
                return;
            }

            if (document.fonts?.load) {
                try {
                    await document.fonts.load(
                        '80px "8BitOperator"'
                    );
                } catch {
                    // Canvas fallback remains available.
                }
            }

            const character =
                this.config.character;

            this.blinkFrameMs =
                Number(
                    character.blinkFrameMs
                ) || 70;

            this.images.background =
                await loadImage(
                    this.config.background
                );

            this.images.qcComposite =
                this.config.qcComposite
                    ? await loadOptionalImage(
                        this.config.qcComposite
                    )
                    : null;

            this.images.soul =
                await loadImage(
                    this.config.soul
                );

            this.images.arm =
                character.arm
                    ? await loadOptionalImage(
                        character.arm
                    )
                    : null;

            this.images.body =
                await loadImage(
                    character.body
                );

            this.images.bodyTalking =
                character.bodyTalking
                    ? await loadOptionalImage(
                        character.bodyTalking
                    )
                    : null;

            this.images.faceBase =
                await loadImage(
                    character.faceBase
                );

            this.images.faces =
                await Promise.all(
                    character.faces.map(
                        loadOptionalImage
                    )
                );

            this.images.eyes =
                await Promise.all(
                    character.eyes.map(
                        loadOptionalImage
                    )
                );

            this.images.mouths =
                await Promise.all(
                    character.mouths.map(
                        loadOptionalImage
                    )
                );

            window.addEventListener(
                "keydown",
                this.boundKeyDown
            );

            window.addEventListener(
                "keyup",
                this.boundKeyUp
            );

            this.canvas.style.pointerEvents =
                "none";

            this.scheduleNextBlink(
                performance.now()
            );

            /* A page jump may occur while assets are still loading. */
            if (this.destroyed) {
                return;
            }

            this.initialized = true;

            this.renderFrameId =
                requestAnimationFrame(
                    (time) =>
                        this.renderLoop(time)
                );
        }

        show() {
            if (this.destroyed) {
                return;
            }

            /*
                Only one shop renderer should own the
                shared Undertale canvas at a time.
            */
            if (
                window.__activeUndertaleShop &&
                window.__activeUndertaleShop !== this
            ) {
                window.__activeUndertaleShop.hide();
            }

            window.__activeUndertaleShop =
                this;

            this.active = true;

            this.canvas
                .classList
                .add("active");
        }

        hide() {
            this.active = false;

            if (
                window.__activeUndertaleShop === this
            ) {
                window.__activeUndertaleShop =
                    null;
            }

            this.canvas
                .classList
                .remove("active");
        }

        destroy() {
            if (this.destroyed) {
                return;
            }

            this.destroyed = true;
            this.active = false;

            this.stopTyping();
            this.stopMusic();

            this.fastText = false;
            this.talking = false;

            try {
                this.selectSound.pause();
                this.selectSound.currentTime = 0;
            } catch (_) {}

            this.oneShotAudio.forEach(
                (audio) => {
                    try {
                        audio.pause();
                        audio.currentTime = 0;
                    } catch (_) {}
                }
            );
            this.oneShotAudio.clear();

            if (this.initialized) {
                window.removeEventListener(
                    "keydown",
                    this.boundKeyDown
                );
                window.removeEventListener(
                    "keyup",
                    this.boundKeyUp
                );
            }

            if (this.renderFrameId !== null) {
                cancelAnimationFrame(
                    this.renderFrameId
                );
                this.renderFrameId = null;
            }

            if (window.__activeUndertaleShop === this) {
                window.__activeUndertaleShop = null;
            }

            if (this.canvas) {
                this.canvas.classList.remove(
                    "active"
                );
            }
        }


        setCharacterVisible(value) {
            this.characterVisible =
                Boolean(value);

            if (
                this.characterVisible &&
                this.characterOpacity <= 0
            ) {
                this.characterOpacity = 1;
            }
        }

        setMenuVisible(value) {
            this.menuVisible =
                Boolean(value);
        }

        setStatus(text) {
            this.statusText =
                String(text ?? "");
        }

        setTopics(topics) {
            this.topics =
                topics.map(
                    (topic) => ({
                        isNew: false,
                        ...topic
                    })
                );

            this.topicSelection = 0;
        }

        setMode(mode) {
            this.mode = mode;
        }

        setBackgroundBrightness(value) {
            this.backgroundBrightness =
                clamp(
                    Number(value) || 0,
                    0,
                    1
                );
        }

        setFullDialogueHold(value) {
            this.fullDialogueHold =
                Boolean(value);
        }

        setEyeFrame(frame) {
            const requested =
                Math.max(
                    0,
                    Number(frame) || 0
                );

            this.eyeExpressionFrame =
                this.images.eyes[
                    requested
                ]
                    ? requested
                    : 0;

            this.eyeFrame =
                this.eyeExpressionFrame;

            this.blinkSequenceActive =
                false;

            this.blinkStep = 0;

            this.scheduleNextBlink(
                performance.now()
            );
        }


        setExpression(frame) {
            const max =
                Math.max(
                    0,
                    this.images.faces.length - 1
                );

            this.expressionFrame =
                clamp(
                    Number(frame) || 0,
                    0,
                    max
                );
        }

        async startMusic(
            volume = 0.72
        ) {
            if (
                this.destroyed ||
                !this.music
            ) {
                return;
            }

            this.music.volume =
                clamp(
                    volume,
                    0,
                    1
                );

            try {
                /*
                    startMusic() intentionally means START/RESTART.
                    Temporary dialogue silences use pauseMusic() /
                    resumeMusic() instead.
                */
                this.music.currentTime = 0;

                await this.music.play();
            } catch (error) {
                console.warn(
                    "Shop music did not start:",
                    error
                );
            }
        }


        pauseMusic() {
            if (
                this.destroyed ||
                !this.music
            ) {
                return;
            }

            /*
                IMPORTANT:
                do not touch currentTime here.
            */
            try {
                this.music.pause();
            } catch (_) {}
        }


        async resumeMusic(
            volume = null
        ) {
            if (
                this.destroyed ||
                !this.music
            ) {
                return;
            }


            if (
                Number.isFinite(
                    volume
                )
            ) {
                this.music.volume =
                    clamp(
                        volume,
                        0,
                        1
                    );
            }


            try {
                /*
                    Resume from the exact paused timestamp.
                    No currentTime reset.
                */
                await this.music.play();
            } catch (error) {
                console.warn(
                    "Shop music did not resume:",
                    error
                );
            }
        }


        stopMusic() {
            if (!this.music) {
                return;
            }

            /*
                stopMusic() remains the true scene-ending reset.
            */
            this.music.pause();
            this.music.currentTime = 0;
        }

        playSelect() {
            this.selectSound.pause();

            this.selectSound.currentTime =
                0;

            this.selectSound.volume =
                0.82;

            this.selectSound
                .play()
                .catch(() => {});
        }


        playOneShot(
            src,
            volume = 1
        ) {
            /*
                Fire-and-forget SFX. Audio failures must
                never stop the scene sequence.
            */
            try {
                const audio =
                    new Audio(src);

                this.oneShotAudio.add(
                    audio
                );

                const forgetAudio = () => {
                    this.oneShotAudio.delete(
                        audio
                    );
                };

                audio.addEventListener(
                    "ended",
                    forgetAudio,
                    { once: true }
                );

                audio.addEventListener(
                    "error",
                    forgetAudio,
                    { once: true }
                );

                audio.volume =
                    clamp(
                        volume,
                        0,
                        1
                    );

                audio
                    .play()
                    .catch(
                        (error) => {
                            console.warn(
                                `Could not play ${src}:`,
                                error
                            );
                        }
                    );

                return audio;
            } catch (error) {
                console.warn(
                    `Could not create audio ${src}:`,
                    error
                );

                return null;
            }
        }


        buildDialoguePages(lines) {
            const source =
                Array.isArray(lines)
                    ? lines
                    : [String(lines)];

            const pages = [];


            for (const message of source) {
                const visualLines = [];

                const paragraphs =
                    String(message)
                        .split("\n");


                for (
                    const paragraph of paragraphs
                ) {
                    visualLines.push(
                        ...this.wrapWordsByWidth(
                            paragraph,
                            DIALOGUE_MAX_WIDTH,
                            TEXT.dialogueSize
                        )
                    );
                }


                /*
                    Never allow one page to spill into
                    the bottom border. Long dialogue
                    automatically continues on the next
                    click, just like Undertale.
                */
                for (
                    let i = 0;
                    i < visualLines.length;
                    i += DIALOGUE_MAX_LINES
                ) {
                    pages.push(
                        visualLines
                            .slice(
                                i,
                                i +
                                DIALOGUE_MAX_LINES
                            )
                            .join("\n")
                    );
                }
            }


            return pages.length
                ? pages
                : [""];
        }


        choose(
            prompt,
            options,
            {
                selection = 0
            } = {}
        ) {
            this.stopTyping();

            this.mode = "choice";

            this.choice.active = true;
            this.choice.prompt =
                String(prompt ?? "");

            this.choice.options =
                Array.isArray(options)
                    ? options.map(String)
                    : [];

            this.choice.selection =
                clamp(
                    Number(selection) || 0,
                    0,
                    Math.max(
                        0,
                        this.choice.options.length - 1
                    )
                );

            return new Promise((resolve) => {
                this.choice.resolve =
                    resolve;
            });
        }


        finishChoice() {
            if (
                !this.choice.active ||
                !this.choice.resolve
            ) {
                return;
            }

            const selected =
                this.choice.selection;

            const resolve =
                this.choice.resolve;

            this.choice.active = false;
            this.choice.resolve = null;

            this.mode = "locked";

            resolve(selected);
        }


        confirmMainSelection() {
            /*
                The heart can move across every row.
                TALK is the only scripted action for
                this scene, so the other rows simply
                remain unavailable.
            */
            if (this.mainSelection === 2) {
                this.mode = "topics";
                this.topicSelection = 0;
                this.statusText =
                    "* Care to chat?";
            }
        }

        /*
            QC entrance:
            - starts Snowdrift immediately
            - fades the exact QC mockup in
            - switches seamlessly to the
              code-animated QC afterward
        */
        async fadeInQC(
            duration = 1100
        ) {
            this.characterVisible = false;
            this.characterOpacity = 0;

            this.qcCompositeOpacity = 0;

            const startBrightness =
                this.backgroundBrightness;

            const startTime =
                performance.now();

            await new Promise((resolve) => {
                const step = (now) => {
                    const progress =
                        clamp(
                            (
                                now -
                                startTime
                            ) /
                            duration,
                            0,
                            1
                        );

                    this.qcCompositeOpacity =
                        progress;

                    /*
                        As QC materializes, bring the shop
                        lights smoothly back to normal.
                    */
                    this.backgroundBrightness =
                        startBrightness +
                        (
                            1 -
                            startBrightness
                        ) *
                        progress;

                    if (progress < 1) {
                        requestAnimationFrame(
                            step
                        );
                    } else {
                        resolve();
                    }
                };

                requestAnimationFrame(step);
            });

            /*
                The isolated sprite now replaces the
                mockup so blinking/talking can resume.
            */
            this.characterVisible = true;
            this.characterOpacity = 1;
            this.qcCompositeOpacity = 0;
            this.backgroundBrightness = 1;

            /*
                QC must remain completely on normal eyes
                for THREE FULL SECONDS after appearing
                before her first blink.
            */
            this.eyeFrame = 0;

            this.blinkSequenceActive = false;
            this.blinkStep = 0;
            this.nextBlinkStepAt = 0;

            this.scheduleNextBlink(
                performance.now()
            );
        }

        async fadeInCharacter(
            duration = 900
        ) {
            this.characterVisible = true;
            this.characterOpacity = 0;

            const startBrightness =
                this.backgroundBrightness;

            const startTime =
                performance.now();

            await new Promise((resolve) => {
                const step = (now) => {
                    const progress =
                        clamp(
                            (
                                now -
                                startTime
                            ) /
                            duration,
                            0,
                            1
                        );

                    this.characterOpacity =
                        progress;

                    /*
                        Same lighting behavior as QC:
                        the dim memory-shop returns to
                        full brightness while Gerson
                        materializes.
                    */
                    this.backgroundBrightness =
                        startBrightness +
                        (
                            1 -
                            startBrightness
                        ) *
                        progress;

                    if (progress < 1) {
                        requestAnimationFrame(
                            step
                        );
                    } else {
                        resolve();
                    }
                };

                requestAnimationFrame(step);
            });

            this.characterOpacity = 1;
            this.backgroundBrightness = 1;

            this.eyeExpressionFrame =
                Number(
                    this.config.character
                        .idleEyeFrame
                ) || 0;

            this.eyeFrame =
                this.eyeExpressionFrame;

            this.talkEyeStep = 0;

            this.blinkSequenceActive = false;
            this.blinkStep = 0;
            this.nextBlinkStepAt = 0;

            this.scheduleNextBlink(
                performance.now()
            );
        }


        getDialogueBlipAudio(
            source
        ) {
            source =
                String(
                    source ?? ""
                );

            if (!source) {
                return null;
            }


            if (
                this.dialogueBlipSounds.has(
                    source
                )
            ) {
                return this.dialogueBlipSounds.get(
                    source
                );
            }


            const audio =
                new Audio(
                    source
                );

            audio.preload =
                "auto";

            this.dialogueBlipSounds.set(
                source,
                audio
            );

            return audio;
        }


        playDialogueBlip(
            typedCharacter
        ) {
            /*
                Undertale does not need a voice blip for empty
                spacing between words/lines.
            */
            if (
                !typedCharacter ||
                /\s/.test(
                    typedCharacter
                )
            ) {
                return;
            }


            const source =
                this.dialogue.blipSound ||
                this.defaultDialogueBlipSound;


            const baseAudio =
                this.getDialogueBlipAudio(
                    source
                );


            if (!baseAudio) {
                return;
            }


            try {
                /*
                    cloneNode() lets successive character sounds
                    overlap instead of restarting one shared Audio
                    object every 32 ms.
                */
                const voice =
                    baseAudio.cloneNode(
                        true
                    );

                voice.volume =
                    0.72;

                const attempt =
                    voice.play();

                if (
                    attempt !== undefined
                ) {
                    attempt.catch(
                        () => {}
                    );
                }
            } catch (_) {}
        }


        /* ============================
           DIALOGUE
        ============================ */

        say(
            lines,
            {
                returnMode = "topics",
                blipSound = ""
            } = {}
        ) {
            this.stopTyping();

            this.mode = "dialogue";

            this.dialogue.active = true;

            this.dialogue.lines =
                this.buildDialoguePages(
                    lines
                );

            this.dialogue.lineIndex = 0;

            this.dialogue.returnMode =
                returnMode;

            /*
                Empty override = use the current shop character's
                normal voice. A supplied path changes only this
                say() call and automatically resets on the next one.
            */
            this.dialogue.blipSound =
                String(
                    blipSound ?? ""
                );

            return new Promise((resolve) => {
                this.dialogue.resolve =
                    resolve;

                this.beginDialogueLine();
            });
        }

        beginDialogueLine() {
            const text =
                String(
                    this.dialogue.lines[
                        this.dialogue.lineIndex
                    ] ?? ""
                );

            this.dialogue.fullText =
                text;

            this.dialogue.visibleText =
                "";

            this.dialogue.typing =
                true;

            this.dialogue.inputUnlockedAt =
                0;

            this.fastText = false;
            this.talking = true;

            const character =
                this.config.character;

            if (
                character.freezeEyeWhileTalking
            ) {
                this.blinkSequenceActive =
                    false;

                this.blinkStep = 0;

                this.eyeFrame =
                    this.eyeExpressionFrame;
            }

            let index = 0;

            const typeNext = () => {
                if (
                    !this.active ||
                    !this.dialogue.active
                ) {
                    return;
                }

                if (index >= text.length) {
                    this.dialogue.typing =
                        false;

                    this.talking = false;

                    this.dialogue.inputUnlockedAt =
                        performance.now() +
                        this.fullLineLockMs;

                    return;
                }

                const typedCharacter =
                    text[index];

                this.dialogue.visibleText +=
                    typedCharacter;

                /*
                    Voice blip corresponds to the character that
                    just became visible on screen.
                */
                this.playDialogueBlip(
                    typedCharacter
                );

                index++;

                this.dialogue.timer =
                    setTimeout(
                        typeNext,
                        this.fastText
                            ? this.fastTypeSpeedMs
                            : this.typeSpeedMs
                    );
            };

            typeNext();
        }

        finishCurrentLine() {
            this.stopTyping();

            this.dialogue.visibleText =
                this.dialogue.fullText;

            this.dialogue.typing = false;
            this.talking = false;

            this.dialogue.inputUnlockedAt =
                performance.now() +
                this.fullLineLockMs;
        }

        advanceDialogue() {
            if (!this.dialogue.active) {
                return;
            }

            if (this.dialogue.typing) {
                this.finishCurrentLine();
                return;
            }

            if (
                performance.now() <
                this.dialogue.inputUnlockedAt
            ) {
                return;
            }

            if (
                this.dialogue.lineIndex <
                this.dialogue.lines.length - 1
            ) {
                this.dialogue.lineIndex++;
                this.beginDialogueLine();
                return;
            }

            const resolve =
                this.dialogue.resolve;

            const returnMode =
                this.dialogue.returnMode;

            this.dialogue.active = false;
            this.dialogue.resolve = null;

            this.dialogue.fullText = "";
            this.dialogue.visibleText = "";
            this.dialogue.blipSound = "";

            this.mode = returnMode;

            if (resolve) {
                resolve();
            }
        }

        stopTyping() {
            if (this.dialogue.timer) {
                clearTimeout(
                    this.dialogue.timer
                );
            }

            this.dialogue.timer = null;
            this.dialogue.typing = false;
            this.talking = false;
        }

        /* ============================
           WHITEOUT
        ============================ */

        fadeWhiteoutTo(
            target,
            duration = 350
        ) {
            target =
                clamp(
                    target,
                    0,
                    1
                );

            const start =
                this.whiteout;

            const difference =
                target - start;

            const startTime =
                performance.now();

            return new Promise(
                (resolve) => {
                    const step =
                        (now) => {
                            const progress =
                                clamp(
                                    (
                                        now -
                                        startTime
                                    ) /
                                    duration,
                                    0,
                                    1
                                );

                            this.whiteout =
                                start +
                                difference *
                                progress;

                            if (progress < 1) {
                                requestAnimationFrame(
                                    step
                                );
                            } else {
                                this.whiteout =
                                    target;

                                resolve();
                            }
                        };

                    requestAnimationFrame(
                        step
                    );
                }
            );
        }

        async typeFinalText(
            text,
            speedMs = 150
        ) {
            this.finalText = "";

            for (
                const character of text
            ) {
                this.finalText +=
                    character;

                await wait(speedMs);
            }
        }

        /* ============================
           INPUT
        ============================ */

        onKeyDown(event) {
            if (!this.active) {
                return;
            }

            const key =
                event.key.toLowerCase();


            if (
                this.mode === "dialogue"
            ) {
                if (key === "x") {
                    event.preventDefault();
                    this.fastText = true;
                    return;
                }

                if (
                    key === "enter" ||
                    key === " " ||
                    key === "z"
                ) {
                    event.preventDefault();

                    this.playSelect();
                    this.advanceDialogue();
                }

                return;
            }


            if (
                this.mode === "choice"
            ) {
                if (
                    key === "arrowleft" ||
                    key === "arrowright" ||
                    key === "arrowup" ||
                    key === "arrowdown"
                ) {
                    event.preventDefault();

                    this.playSelect();

                    const direction =
                        (
                            key === "arrowleft" ||
                            key === "arrowup"
                        )
                            ? -1
                            : 1;

                    const count =
                        this.choice.options.length;

                    if (count > 0) {
                        this.choice.selection =
                            (
                                this.choice.selection +
                                direction +
                                count
                            ) %
                            count;
                    }

                    return;
                }


                if (
                    key === "enter" ||
                    key === " " ||
                    key === "z"
                ) {
                    event.preventDefault();

                    this.playSelect();
                    this.finishChoice();

                    return;
                }


                return;
            }


            if (
                this.mode === "main"
            ) {
                if (
                    key === "arrowup" ||
                    key === "arrowdown"
                ) {
                    event.preventDefault();

                    this.playSelect();

                    const direction =
                        key === "arrowup"
                            ? -1
                            : 1;

                    this.mainSelection =
                        (
                            this.mainSelection +
                            direction +
                            this.mainOptions.length
                        ) %
                        this.mainOptions.length;

                    return;
                }

                if (
                    key === "enter" ||
                    key === " " ||
                    key === "z"
                ) {
                    event.preventDefault();

                    this.playSelect();
                    this.confirmMainSelection();
                }

                return;
            }


            if (
                this.mode === "locked"
            ) {
                return;
            }


            if (
                this.mode === "topics"
            ) {
                if (!this.topics.length) {
                    return;
                }


                if (
                    key === "arrowup" ||
                    key === "arrowdown"
                ) {
                    event.preventDefault();

                    this.playSelect();

                    const itemCount =
                        this.topics.length + 1;

                    const direction =
                        key === "arrowup"
                            ? -1
                            : 1;

                    this.topicSelection =
                        (
                            this.topicSelection +
                            direction +
                            itemCount
                        ) %
                        itemCount;

                    return;
                }


                if (
                    key === "enter" ||
                    key === " " ||
                    key === "z"
                ) {
                    event.preventDefault();

                    this.playSelect();

                    if (
                        this.topicSelection ===
                        this.topics.length
                    ) {
                        this.mode = "main";
                        this.topicSelection = 0;
                        this.statusText =
                            this.mainStatusText;
                    } else {
                        this.chooseTopic();
                    }

                    return;
                }


                if (
                    key === "x" ||
                    key === "escape"
                ) {
                    event.preventDefault();

                    this.playSelect();

                    this.mode = "main";
                    this.topicSelection = 0;
                    this.statusText =
                        this.mainStatusText;
                }
            }
        }


        onKeyUp(event) {
            if (
                event.key.toLowerCase() === "x"
            ) {
                this.fastText = false;
            }
        }


        async chooseTopic() {
            const topic =
                this.topics[
                    this.topicSelection
                ];

            if (!topic) {
                return;
            }

            topic.isNew = false;

            if (
                typeof topic.onSelect ===
                "function"
            ) {
                await topic.onSelect(
                    topic,
                    this
                );
            }
        }

        /* ============================
           CHARACTER ANIMATION
        ============================ */

        scheduleNextBlink(now) {
            const character =
                this.config.character;

            const minimum =
                Number(
                    character.blinkMinMs
                ) || 3000;

            const maximum =
                Math.max(
                    minimum,
                    Number(
                        character.blinkMaxMs
                    ) || minimum
                );

            const delay =
                minimum +
                Math.random() *
                (
                    maximum -
                    minimum
                );

            this.nextBlinkAt =
                now + delay;
        }

        updateCharacterAnimation(now) {
            const character =
                this.config.character;


            if (
                this.talking &&
                now -
                this.lastMouthFrameAt >=
                character.mouthFrameMs
            ) {
                this.lastMouthFrameAt =
                    now;

                this.mouthFrame =
                    (
                        this.mouthFrame + 1
                    ) %
                    Math.max(
                        1,
                        this.images.mouths.length
                    );
            }


            if (!this.talking) {
                this.mouthFrame = 0;
            }


            /*
                Gerson's eye is an expression, not a
                second mouth-flap animation.

                While dialogue is actively typing, hold
                the selected expression for the ENTIRE
                line/section. No twitching or blink on
                every speech frame.
            */
            if (
                this.talking &&
                character.freezeEyeWhileTalking
            ) {
                this.blinkSequenceActive =
                    false;

                this.blinkStep = 0;

                this.eyeFrame =
                    this.eyeExpressionFrame;

                return;
            }


            /*
                Idle blinking remains independent of
                player input.
            */
            if (
                !this.blinkSequenceActive &&
                now >= this.nextBlinkAt
            ) {
                this.blinkSequenceActive =
                    true;

                this.blinkStep = 0;
                this.nextBlinkStepAt = now;
            }


            if (
                this.blinkSequenceActive &&
                now >= this.nextBlinkStepAt
            ) {
                const sequence =
                    Array.isArray(
                        character.blinkSequence
                    ) &&
                    character.blinkSequence.length
                        ? character.blinkSequence
                        : [1, 2, 1, 0];

                const requestedFrame =
                    sequence[
                        this.blinkStep
                    ];

                this.eyeFrame =
                    this.images.eyes[
                        requestedFrame
                    ]
                        ? requestedFrame
                        : this.eyeExpressionFrame;

                this.blinkStep++;


                if (
                    this.blinkStep >=
                    sequence.length
                ) {
                    this.blinkSequenceActive =
                        false;

                    this.blinkStep = 0;

                    this.eyeFrame =
                        this.eyeExpressionFrame;

                    this.scheduleNextBlink(
                        now
                    );
                } else {
                    this.nextBlinkStepAt =
                        now +
                        this.blinkFrameMs;
                }
            }
        }

        /* ============================
           RENDERING
        ============================ */

        renderLoop(time) {
            if (this.destroyed) {
                this.renderFrameId = null;
                return;
            }

            if (this.active) {
                this.render(time);
            }

            this.renderFrameId =
                requestAnimationFrame(
                    (nextTime) =>
                        this.renderLoop(
                            nextTime
                        )
                );
        }

        render(time) {
            const ctx =
                this.ctx;

            ctx.clearRect(
                0,
                0,
                WIDTH,
                HEIGHT
            );

            ctx.fillStyle = "#000";

            ctx.fillRect(
                0,
                0,
                WIDTH,
                HEIGHT
            );

            this.drawBackground();

            if (
                this.qcCompositeOpacity > 0 &&
                this.images.qcComposite
            ) {
                ctx.save();

                /*
                    QC is clipped to the shop artwork.
                    She can never render over the white
                    divider or dialogue box.
                */
                ctx.beginPath();
                ctx.rect(
                    0,
                    0,
                    WIDTH,
                    ART_BOTTOM
                );
                ctx.clip();

                ctx.globalAlpha =
                    this.qcCompositeOpacity;

                ctx.drawImage(
                    this.images.qcComposite,
                    0,
                    0,
                    WIDTH,
                    HEIGHT
                );

                ctx.restore();
            }

            if (
                this.characterVisible
            ) {
                this.updateCharacterAnimation(
                    time
                );

                this.drawCharacter();
            }

            this.drawShopUI();

            /*
                Normalize the border after all textbox
                painting so no interior fill can leave a
                little disconnected pixel or seam.
            */
            this.drawCleanShopBorders();

            if (
                this.whiteout > 0
            ) {
                ctx.save();

                ctx.globalAlpha =
                    this.whiteout;

                ctx.fillStyle =
                    "#ffffff";

                ctx.fillRect(
                    0,
                    0,
                    WIDTH,
                    HEIGHT
                );

                ctx.restore();
            }

            if (
                this.finalText
            ) {
                ctx.save();

                ctx.fillStyle =
                    "#000000";

                ctx.font =
                    '64px "8BitOperator", monospace';

                ctx.textAlign =
                    "center";

                ctx.textBaseline =
                    "middle";

                ctx.fillText(
                    this.finalText,
                    WIDTH / 2,
                    HEIGHT / 2
                );

                ctx.restore();
            }
        }

        drawBackground() {
            const image =
                this.images.background;

            if (!image) {
                return;
            }

            const ctx =
                this.ctx;

            ctx.drawImage(
                image,
                0,
                0,
                WIDTH,
                HEIGHT
            );

            if (
                this.backgroundBrightness < 1
            ) {
                ctx.save();

                ctx.fillStyle =
                    "#000000";

                ctx.globalAlpha =
                    1 -
                    this.backgroundBrightness;

                /*
                    Dim only the shop-art region. Keep the
                    dialogue UI itself clean and readable.
                */
                ctx.fillRect(
                    0,
                    0,
                    WIDTH,
                    ART_BOTTOM
                );

                ctx.restore();
            }
        }

        drawCharacter() {
            const ctx =
                this.ctx;

            const character =
                this.config.character;

            ctx.save();

            ctx.beginPath();
            ctx.rect(
                0,
                0,
                WIDTH,
                ART_BOTTOM
            );
            ctx.clip();

            ctx.globalAlpha =
                this.characterOpacity;


            const talkingPose =
                Boolean(
                    this.talking &&
                    this.mouthFrame === 1
                );


            if (
                this.images.arm &&
                character.armBox
            ) {
                const armOffsetX =
                    talkingPose
                        ? (
                            Number(
                                character.talkArmOffsetX
                            ) || 0
                        )
                        : 0;

                const armOffsetY =
                    talkingPose
                        ? (
                            Number(
                                character.talkArmOffsetY
                            ) || 0
                        )
                        : 0;

                ctx.drawImage(
                    this.images.arm,
                    character.armBox.x + armOffsetX,
                    character.armBox.y + armOffsetY,
                    character.armBox.w,
                    character.armBox.h
                );
            }


            if (this.images.body) {
                ctx.drawImage(
                    this.images.body,
                    character.bodyBox.x,
                    character.bodyBox.y,
                    character.bodyBox.w,
                    character.bodyBox.h
                );
            }


            /*
                FACE / MOUTH / EYE COMPOSITING

                QC special faces 1–6 are complete authored faces.
                They should not get the generic talking mouth or
                blinking-eye layers on top of them.
            */
            const isStaticSpecialFace =
                Boolean(
                    character.staticSpecialFaces &&
                    this.expressionFrame !== 0
                );


            const face =
                this.images.faces[
                    this.expressionFrame
                ] ||
                this.images.faceBase;


            const headOffsetX =
                talkingPose && !isStaticSpecialFace
                    ? (
                        Number(
                            character.talkHeadOffsetX
                        ) || 0
                    )
                    : 0;

            const headOffsetY =
                talkingPose && !isStaticSpecialFace
                    ? (
                        Number(
                            character.talkHeadOffsetY
                        ) || 0
                    )
                    : 0;


            if (
                isStaticSpecialFace &&
                character.mouthBox
            ) {
                /*
                    Explicitly wipe the generic mouth region before
                    placing the scripted static face. This guarantees
                    no old mouth frame can show through around the
                    edges of a special expression.
                */
                ctx.fillStyle =
                    character.specialFaceMouthCoverColor ||
                    "#7358cf";

                ctx.fillRect(
                    character.mouthBox.x,
                    character.mouthBox.y,
                    character.mouthBox.w,
                    character.mouthBox.h
                );
            }


            if (face) {
                ctx.drawImage(
                    face,
                    character.faceBox.x + headOffsetX,
                    character.faceBox.y + headOffsetY,
                    character.faceBox.w,
                    character.faceBox.h
                );
            }


            if (!isStaticSpecialFace) {
                const mouth =
                    this.images.mouths[
                        this.mouthFrame
                    ] ||
                    this.images.mouths[0];


                const shouldDrawGenericMouth =
                    !(
                        character.animateMouthOnlyOnBaseFace &&
                        this.expressionFrame !== 0
                    );


                if (
                    shouldDrawGenericMouth &&
                    mouth
                ) {
                    ctx.drawImage(
                        mouth,
                        character.mouthBox.x,
                        character.mouthBox.y,
                        character.mouthBox.w,
                        character.mouthBox.h
                    );
                }


                const eyes =
                    this.images.eyes[
                        this.eyeFrame
                    ] ||
                    this.images.eyes[0];

                if (eyes) {
                    const eyeOffsetX =
                        talkingPose
                            ? (
                                Number(
                                    character.talkEyeOffsetX
                                ) || 0
                            )
                            : 0;

                    const eyeOffsetY =
                        talkingPose
                            ? (
                                Number(
                                    character.talkEyeOffsetY
                                ) || 0
                            )
                            : 0;

                    ctx.drawImage(
                        eyes,
                        character.eyesBox.x + eyeOffsetX,
                        character.eyesBox.y + eyeOffsetY,
                        character.eyesBox.w,
                        character.eyesBox.h
                    );
                }
            }

            ctx.restore();
        }

        drawShopUI() {
            if (
                this.dialogue.active ||
                this.fullDialogueHold
            ) {
                this.drawFullDialoguePanel();

                if (
                    this.dialogue.active
                ) {
                    this.drawDialogue();
                }

                return;
            }


            /*
                YES / NO choice state belongs in the
                full-width Undertale dialogue panel.
                This also paints over the old TALK/stats
                divider before drawing the question.
            */
            if (
                this.mode === "choice"
            ) {
                this.drawFullDialoguePanel();
                this.drawChoice();
                return;
            }


            if (
                this.mode === "topics"
            ) {
                if (this.menuVisible) {
                    this.drawTopicMenu();
                }

                return;
            }

            this.drawStatus();

            if (
                this.menuVisible
            ) {
                this.drawMainMenu();
            }
        }


        drawCleanShopBorders() {
            const ctx =
                this.ctx;

            ctx.save();

            ctx.fillStyle =
                "#ffffff";


            /*
                OUTER BOX
                Exact dimensions of the scaled source
                borders. These OVERWRITE the baked lines;
                they do not add thickness beyond them.
            */

            // top
            ctx.fillRect(
                0,
                540,
                WIDTH,
                18
            );

            // bottom
            ctx.fillRect(
                0,
                1067,
                WIDTH,
                13
            );

            // left
            ctx.fillRect(
                0,
                540,
                18,
                540
            );

            // right
            ctx.fillRect(
                1902,
                540,
                18,
                540
            );


            /*
                SPLIT SHOP DIVIDER

                Only present in normal/menu modes.
                It stays gone during full dialogue and
                YES/NO choice screens.
            */
            const fullWidthPanel =
                Boolean(
                    this.dialogue.active ||
                    this.fullDialogueHold ||
                    this.mode === "choice"
                );

            if (!fullWidthPanel) {
                ctx.fillRect(
                    1185,
                    540,
                    18,
                    540
                );
            }


            ctx.restore();
        }


        drawFullDialoguePanel() {
            const ctx =
                this.ctx;

            /*
                IMPORTANT:
                The 2048x1152 shop PSD already contains
                the correct Undertale white outer border.

                Do NOT redraw that white border here.
                Doing so made QC's dialogue frame look
                thicker than the normal shop UI.

                At 1920x1080, the PSD's black interior is:
                x = 18..1901
                y = 558..1065

                Filling ONLY that interior erases the
                center TALK/stats divider while preserving
                the exact original outer-border thickness.
            */
            ctx.fillStyle =
                "#000000";

            /*
                Fill THROUGH y=1066.

                Previously the black interior ended at
                y=1065, leaving exactly one untouched row
                before the bottom border begins at y=1067.

                That exposed:
                - one tiny remnant of the old center divider
                - a gray source-image edge across the rest
                  of the textbox

                509 rows = y 558..1066 inclusive.
            */
            ctx.fillRect(
                18,
                558,
                1884,
                509
            );
        }


        drawChoice() {
            /*
                Keep the question in the EXACT same
                position as normal full-width dialogue.

                Normal dialogue:
                star  = FULL_DIALOGUE.starX/textY
                text  = FULL_DIALOGUE.textX/textY

                So adding YES / NO does not move the
                narrator's question even one pixel.
            */
            this.drawMonoText(
                "*",
                FULL_DIALOGUE.starX,
                FULL_DIALOGUE.textY,
                TEXT.dialogueSize,
                0,
                TEXT.white
            );

            this.drawWrappedText(
                this.choice.prompt,
                FULL_DIALOGUE.textX,
                FULL_DIALOGUE.textY,
                1500,
                FULL_DIALOGUE.lineHeight,
                TEXT.dialogueSize,
                TEXT.white
            );


            const optionY = 840;

            const optionXs =
                this.choice.options.length === 2
                    ? [560, 1180]
                    : this.choice.options.map(
                        (_, i) =>
                            360 + i * 400
                    );


            for (
                let i = 0;
                i < this.choice.options.length;
                i++
            ) {
                this.drawMonoText(
                    this.choice.options[i],
                    optionXs[i],
                    optionY,
                    TEXT.mainSize,
                    0,
                    TEXT.white
                );
            }


            if (
                this.choice.options.length
            ) {
                /*
                    Soul Y now equals the text row Y.
                    No visual +8 correction.
                */
                this.drawSoul(
                    optionXs[
                        this.choice.selection
                    ] - 72,
                    optionY +
                        SOUL_TEXT_Y_OFFSET,
                    36
                );
            }
        }


        drawStatus() {
            if (!this.statusText) {
                return;
            }

            const raw =
                this.statusText
                    .replace(
                        /^\*\s*/,
                        ""
                    );

            this.drawMonoText(
                "*",
                UI.dialogueStarX,
                UI.dialogueY,
                TEXT.mainSize,
                TEXT.mainAdvance,
                TEXT.white
            );

            this.drawWrappedText(
                raw,
                UI.dialogueTextX,
                UI.dialogueY,
                DIALOGUE_MAX_WIDTH,
                UI.dialogueLineHeight,
                TEXT.mainSize,
                TEXT.white
            );
        }

        drawDialogue() {
            const raw =
                this.dialogue
                    .visibleText
                    .replace(
                        /^\*\s*/,
                        ""
                    );

            this.drawMonoText(
                "*",
                FULL_DIALOGUE.starX,
                FULL_DIALOGUE.textY,
                TEXT.dialogueSize,
                0,
                TEXT.white
            );

            this.drawPrewrappedText(
                raw,
                FULL_DIALOGUE.textX,
                FULL_DIALOGUE.textY,
                FULL_DIALOGUE.lineHeight,
                TEXT.dialogueSize,
                TEXT.white
            );
        }


        drawMainMenu() {
            for (
                let i = 0;
                i <
                this.mainOptions.length;
                i++
            ) {
                const option =
                    this.mainOptions[i];

                const color =
                    option.enabled
                        ? TEXT.white
                        : TEXT.disabled;

                this.drawMonoText(
                    option.label,
                    UI.menuTextX,
                    UI.menuRows[i],
                    TEXT.mainSize,
                    TEXT.mainAdvance,
                    color
                );
            }

            /*
                Match the selected word's exact Y.
            */
            this.drawSoul(
                UI.menuHeartX,
                UI.menuRows[
                    this.mainSelection
                ] +
                    SOUL_TEXT_Y_OFFSET,
                36
            );

            this.drawMonoText(
                this.config.goldText,
                UI.goldX,
                UI.statY,
                TEXT.mainSize,
                TEXT.mainAdvance,
                TEXT.white
            );

            this.drawMonoText(
                this.config.inventoryText,
                UI.inventoryX,
                UI.statY,
                TEXT.mainSize,
                TEXT.mainAdvance,
                TEXT.white
            );
        }

        drawTopicMenu() {
            const x = 184;
            const heartX = 92;

            const rows = [
                606,
                686,
                766,
                846
            ];

            const exitY =
                rows[
                    Math.min(
                        this.topics.length,
                        rows.length - 1
                    )
                ] +
                (
                    this.topics.length >=
                    rows.length
                        ? 100
                        : 0
                );


            for (
                let i = 0;
                i < this.topics.length;
                i++
            ) {
                const topic =
                    this.topics[i];

                const label =
                    topic.isNew
                        ? `${topic.label} (NEW)`
                        : topic.label;

                const color =
                    topic.isNew
                        ? TEXT.yellow
                        : TEXT.white;

                this.drawMonoText(
                    label,
                    x,
                    rows[i],
                    TEXT.topicSize,
                    0,
                    color
                );
            }


            this.drawMonoText(
                "Exit",
                x,
                exitY,
                TEXT.topicSize,
                0,
                TEXT.white
            );


            const promptWords =
                String(
                    this.config.topicPrompt ||
                    ""
                )
                    .trim()
                    .split(/\s+/);

            const promptLine1 =
                promptWords
                    .slice(
                        0,
                        Math.ceil(
                            promptWords.length /
                            2
                        )
                    )
                    .join(" ");

            const promptLine2 =
                promptWords
                    .slice(
                        Math.ceil(
                            promptWords.length /
                            2
                        )
                    )
                    .join(" ");


            this.drawMonoText(
                promptLine1,
                UI.menuTextX,
                606,
                TEXT.mainSize,
                0,
                TEXT.white
            );

            if (promptLine2) {
                this.drawMonoText(
                    promptLine2,
                    UI.menuTextX,
                    686,
                    TEXT.mainSize,
                    0,
                    TEXT.white
                );
            }


            this.drawMonoText(
                this.config.goldText,
                UI.goldX,
                UI.statY,
                TEXT.mainSize,
                0,
                TEXT.white
            );

            this.drawMonoText(
                this.config.inventoryText,
                UI.inventoryX,
                UI.statY,
                TEXT.mainSize,
                0,
                TEXT.white
            );


            if (
                this.topicSelection ===
                this.topics.length
            ) {
                this.drawSoul(
                    heartX,
                    exitY +
                        SOUL_TEXT_Y_OFFSET,
                    36
                );
            } else {
                this.drawSoul(
                    heartX,
                    rows[
                        this.topicSelection
                    ] +
                        SOUL_TEXT_Y_OFFSET,
                    36
                );
            }
        }


        drawSoul(
            x,
            y,
            _size = null
        ) {
            const soul =
                this.images.soul;

            if (!soul) {
                return;
            }

            /*
                Use the exact uploaded spr_heart_2 shape
                at a proper Undertale-menu scale.
            */
            const size = 36;

            this.ctx.save();
            this.ctx.imageSmoothingEnabled = false;

            this.ctx.drawImage(
                soul,
                Math.round(x),
                Math.round(y),
                size,
                size
            );

            this.ctx.restore();
        }

        drawWrappedText(
            text,
            x,
            y,
            maxWidth,
            lineHeight,
            size,
            color
        ) {
            const paragraphs =
                String(text)
                    .split("\n");

            let row = 0;

            for (
                const paragraph of
                paragraphs
            ) {
                const wrapped =
                    this.wrapWordsByWidth(
                        paragraph,
                        maxWidth,
                        size
                    );

                for (
                    const line of wrapped
                ) {
                    this.drawMonoText(
                        line,
                        x,
                        y +
                        row *
                        lineHeight,
                        size,
                        0,
                        color
                    );

                    row++;
                }
            }
        }


        drawPrewrappedText(
            text,
            x,
            y,
            lineHeight,
            size,
            color
        ) {
            const lines =
                String(text)
                    .split("\n");

            lines.forEach(
                (line, row) => {
                    this.drawMonoText(
                        line,
                        x,
                        y +
                        row *
                        lineHeight,
                        size,
                        0,
                        color
                    );
                }
            );
        }


        measureTextWidth(
            text,
            size
        ) {
            const ctx =
                this.ctx;

            ctx.save();

            ctx.font =
                `${size}px "8BitOperator", monospace`;

            const width =
                ctx.measureText(
                    String(text)
                ).width;

            ctx.restore();

            return width;
        }


        wrapWordsByWidth(
            text,
            maxWidth,
            size
        ) {
            const words =
                String(text)
                    .split(/\s+/)
                    .filter(Boolean);

            if (!words.length) {
                return [""];
            }

            const lines = [];
            let line = words.shift();

            for (
                const word of words
            ) {
                const candidate =
                    `${line} ${word}`;

                if (
                    this.measureTextWidth(
                        candidate,
                        size
                    ) <= maxWidth
                ) {
                    line = candidate;
                } else {
                    lines.push(line);
                    line = word;
                }
            }

            lines.push(line);

            return lines;
        }


        parseHexColor(color) {
            const hex =
                String(color)
                    .replace("#", "")
                    .padEnd(6, "0");

            return {
                r: parseInt(
                    hex.slice(0, 2),
                    16
                ),
                g: parseInt(
                    hex.slice(2, 4),
                    16
                ),
                b: parseInt(
                    hex.slice(4, 6),
                    16
                )
            };
        }


        getSharpTextSprite(
            text,
            size,
            color
        ) {
            const key =
                `${size}|${color}|${text}`;

            if (
                this.sharpTextCache.has(key)
            ) {
                return this.sharpTextCache.get(
                    key
                );
            }

            const width =
                Math.max(
                    4,
                    Math.ceil(
                        this.measureTextWidth(
                            text,
                            size
                        )
                    ) + 12
                );

            const height =
                Math.ceil(size * 1.45);

            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width = width;
            canvas.height = height;

            const ctx =
                canvas.getContext(
                    "2d",
                    {
                        willReadFrequently: true
                    }
                );

            ctx.fillStyle =
                color;

            ctx.font =
                `${size}px "8BitOperator", monospace`;

            ctx.textAlign =
                "left";

            ctx.textBaseline =
                "top";

            ctx.fillText(
                String(text),
                4,
                0
            );

            const image =
                ctx.getImageData(
                    0,
                    0,
                    width,
                    height
                );

            const data =
                image.data;

            const rgb =
                this.parseHexColor(
                    color
                );

            for (
                let i = 0;
                i < data.length;
                i += 4
            ) {
                if (data[i + 3] >= 96) {
                    data[i] = rgb.r;
                    data[i + 1] = rgb.g;
                    data[i + 2] = rgb.b;
                    data[i + 3] = 255;
                } else {
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(
                image,
                0,
                0
            );

            if (
                this.sharpTextCache.size >
                500
            ) {
                this.sharpTextCache.clear();
            }

            this.sharpTextCache.set(
                key,
                canvas
            );

            return canvas;
        }


        drawMonoText(
            text,
            x,
            y,
            size,
            _advance,
            color
        ) {
            const sprite =
                this.getSharpTextSprite(
                    String(text),
                    size,
                    color
                );

            this.ctx.save();

            this.ctx.imageSmoothingEnabled =
                false;

            this.ctx.drawImage(
                sprite,
                Math.round(x - 4),
                Math.round(y)
            );

            this.ctx.restore();
        }
    }

    window.UndertaleShop = {
        ShopEngine,
        UI
    };
})();
