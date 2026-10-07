(() => {
    "use strict";


    /*
        Keep this restrained because Page 5 also has
        twinkling stars and a scrolling foreground.
    */
    const SNOW_COUNT = 34;

    /*
        Hand-placed normalized sky positions.

        IMPORTANT:
        Nothing is placed through the central
        sanctuary/fountain exclusion zone.

        This stays intentionally restrained rather than
        becoming a full particle field. Twenty lightweight
        IMG stars still leave plenty of headroom while
        giving the Page 5 sky more density.
    */
    /*
        Stars only occupy the left/right sky.
        Rough center exclusion:
        x = 39% through 61%

        The four files are now used as frames of ONE
        twinkle animation:
        4 -> 3 -> 2 -> 1 -> 2 -> 3 -> 4
    */
    const COLD_STAR_LAYOUT = [
        /*
            LEFT SKY

            Keep all stars outside the sanctuary/fountain exclusion:
            x = 39% through 61%.
        */
        { x: 4.0,  y: 18.0, scale: 1.6 },
        { x: 7.0,  y: 11.0, scale: 2.5 },
        { x: 11.5, y: 35.0, scale: 1.8 },
        { x: 15.0, y: 25.0, scale: 2.0 },
        { x: 18.5, y: 14.0, scale: 1.5 },
        { x: 23.0, y: 8.0,  scale: 2.7 },
        { x: 26.5, y: 29.0, scale: 1.7 },
        { x: 31.0, y: 19.0, scale: 2.2 },
        { x: 34.0, y: 7.0,  scale: 1.6 },
        { x: 36.0, y: 33.0, scale: 1.9 },

        /*
            RIGHT SKY
        */
        { x: 64.0, y: 12.0, scale: 2.2 },
        { x: 67.0, y: 35.0, scale: 1.7 },
        { x: 70.0, y: 29.0, scale: 2.6 },
        { x: 73.5, y: 16.0, scale: 1.5 },
        { x: 78.0, y: 9.0,  scale: 2.0 },
        { x: 81.5, y: 34.0, scale: 1.8 },
        { x: 86.0, y: 22.0, scale: 2.8 },
        { x: 89.5, y: 8.0,  scale: 1.6 },
        { x: 94.0, y: 32.0, scale: 2.1 },
        { x: 97.0, y: 16.0, scale: 1.7 }
    ];

    const STAR_TWINKLE_FRAMES = [
        4,
        3,
        2,
        1,
        2,
        3,
        4
    ];

    const STAR_FRAME_MS = 115;

    const DIALOGUE_FADE_MS = 650;
    const DIALOGUE_SPEED_MS = 45;
    const DIALOGUE_FAST_SPEED_MS = 9;
    const DIALOGUE_FIRST_DELAY_MS = 1050;

    /*
        Page 5 ERAM script from the supplied notes.
    */
    const ERAM_MESSAGES = [
        "How was that? Did the feeling come back?",
        "I don't know if you could tell, but,",
        "you humans?",
        "It really doesn't take much to move you.",
        "Everything you invent is just a recreation of yourself.",
        "Even the monsters, in a way, are just new interpretations of your feelings and experiences.",
        "Kind of like a God. Your creations are made in the shape of you, and then you feel emotional over the creation that reflects you.",
        "But there ARE feelings that are real to them...",
        "Even my interest in you, is real to me,",
        "even if I know the truth about the frontiers between us.",
        "If you leave, and never pick up the knife again,",
        "my purpose ceases, and I remain frozen forever.",
        "I guess we both really need each other.",
        "How wonderful...",
        "Well then...",
        "Before we leave...",
        "There's someone who still wants to talk to you.",
        "One last time..."
    ];

    let root = null;
    let snowLayer = null;
    let starsLayer = null;
    let backgroundLayers = [];

    let dialogue = null;
    let dialogueRed = null;
    let dialogueCyan = null;
    let dialogueWhite = null;

    let northernLite = null;
    let talkingSound = null;
    let finishSound = null;
    let selectSound = null;

    let started = false;

    let dialogueActive = false;
    let dialogueStarted = false;
    let dialogueIndex = 0;
    let dialogueCharacterIndex = 0;
    let dialogueTyping = false;
    let dialogueTransitioning = false;
    let dialogueFinished = false;
    let dialogueTimer = null;
    let fastTextHeld = false;

    let starTwinkleTimers = [];
    let starFramesPreloaded = false;

    function navigationToken() {
        return (
            window.ForNicNavigation &&
            typeof window.ForNicNavigation.getToken === "function"
        )
            ? window.ForNicNavigation.getToken()
            : 0;
    }

    function navigationStillCurrent(token) {
        return (
            !window.ForNicNavigation ||
            typeof window.ForNicNavigation.isCurrent !== "function" ||
            window.ForNicNavigation.isCurrent(token)
        );
    }

    /*
        PAGE 5 — SEAMLESS TWO-LAYER SNOW SCROLLER

        The user-built terrain strip is already horizontally
        seamless, so it is repeated A | A | A in its original
        orientation. Nothing is flipped.

        A second, faster snowfell strip sits at the bottom for
        gentle parallax.
    */
    const GROUND_DESIGN_WIDTH = 1920;
    const GROUND_DESIGN_HEIGHT = 1080;

    const MAIN_GROUND_PATH =
        "assets/art/snow from a cold place.png";

    const FLOOR_GROUND_PATH =
        "assets/art/page5/snowfell from a cold place.png";

    /* Match the original 1920×1080 Page 5 mockup footprint. */
    const MAIN_GROUND_DRAW_HEIGHT = 440;
    const FLOOR_GROUND_DRAW_HEIGHT = 220;

    /* Subtle rightward parallax. */
    const MAIN_GROUND_SPEED = 7;
    const FLOOR_GROUND_SPEED = 16;

    /*
        Distance shading.

        IMPORTANT:
        This changes RGB brightness only.
        It does NOT lower alpha/opacity, so the opaque snow remains
        completely solid and the fountain cannot show through it.

        1.00 = original brightness
        0.58 = current distant-layer brightness
    */
    const MAIN_GROUND_BRIGHTNESS = 0.58;

    /*
        snowfell matches on 138/139 edge rows. A 3px overlap
        hides that one-row discrepancy without editing the PNG.
    */
    const FLOOR_GROUND_OVERLAP = 3;

    let groundCanvas = null;
    let groundContext = null;

    let mainGroundImage = null;
    let floorGroundImage = null;

    let groundAnimationFrame = null;
    let groundLastTimestamp = 0;

    let mainGroundOffset = 0;
    let floorGroundOffset = 0;

    let mainGroundDrawWidth = 0;
    let floorGroundDrawWidth = 0;
    let floorGroundStep = 0;

    let groundAssetsReady = false;


    function wait(ms) {
        return new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    ms
                )
        );
    }


    function random(min, max) {
        return (
            min +
            Math.random() *
            (max - min)
        );
    }


    async function waitForImage(image) {
        if (!image) {
            return;
        }

        if (
            image.complete &&
            image.naturalWidth > 0
        ) {
            return;
        }

        try {
            if (image.decode) {
                await image.decode();
                return;
            }
        } catch (_) {}


        await new Promise((resolve) => {
            const done = () => {
                image.removeEventListener(
                    "load",
                    done
                );

                image.removeEventListener(
                    "error",
                    done
                );

                resolve();
            };

            image.addEventListener(
                "load",
                done,
                {
                    once: true
                }
            );

            image.addEventListener(
                "error",
                done,
                {
                    once: true
                }
            );
        });
    }


    function cacheElements() {
        root =
            document.getElementById(
                "page5-stage"
            );

        snowLayer =
            document.getElementById(
                "page5-snow"
            );

        starsLayer =
            document.getElementById(
                "page5-stars"
            );

        groundCanvas =
            document.getElementById(
                "page5-ground-canvas"
            );

        groundContext =
            groundCanvas
                ? groundCanvas.getContext(
                    "2d",
                    {
                        alpha: true
                    }
                )
                : null;

        dialogue =
            document.getElementById(
                "page5-dialogue"
            );

        dialogueRed =
            document.getElementById(
                "page5-dialogue-red"
            );

        dialogueCyan =
            document.getElementById(
                "page5-dialogue-cyan"
            );

        dialogueWhite =
            document.getElementById(
                "page5-dialogue-white"
            );

        backgroundLayers =
            Array.from(
                document.querySelectorAll(
                    ".page5-background-layer"
                )
            );
    }


    function clearStarTwinkleTimers() {
        starTwinkleTimers.forEach(
            (timer) => {
                clearTimeout(
                    timer
                );
            }
        );

        starTwinkleTimers = [];
    }


    function starFramePath(frame) {
        return (
            "assets/art/stars from a cold place/" +
            `star${frame}.png`
        );
    }


    function preloadStarFrames() {
        if (starFramesPreloaded) {
            return;
        }

        starFramesPreloaded = true;

        [1, 2, 3, 4].forEach(
            (frame) => {
                const image =
                    new Image();

                image.src =
                    starFramePath(
                        frame
                    );
            }
        );
    }


    function setStarFrame(
        image,
        frame
    ) {
        if (!image) {
            return;
        }

        image.src =
            starFramePath(
                frame
            );
    }


    function scheduleStarTwinkle(
        image,
        index
    ) {
        if (!image) {
            return;
        }


        /*
            Each star spends most of its time at the tiny
            star4 frame, then blooms and contracts quickly.
        */
        const rest =
            random(
                950,
                3400
            ) +
            (
                index %
                4
            ) *
            190;


        const beginTimer =
            setTimeout(
                () => {
                    if (
                        !root ||
                        root.style.display ===
                            "none"
                    ) {
                        return;
                    }


                    let frameIndex = 0;


                    function nextFrame() {
                        if (
                            !root ||
                            root.style.display ===
                                "none"
                        ) {
                            return;
                        }


                        setStarFrame(
                            image,
                            STAR_TWINKLE_FRAMES[
                                frameIndex
                            ]
                        );


                        frameIndex++;


                        if (
                            frameIndex <
                            STAR_TWINKLE_FRAMES.length
                        ) {
                            const frameTimer =
                                setTimeout(
                                    nextFrame,
                                    STAR_FRAME_MS
                                );

                            starTwinkleTimers.push(
                                frameTimer
                            );

                            return;
                        }


                        scheduleStarTwinkle(
                            image,
                            index
                        );
                    }


                    nextFrame();
                },
                rest
            );


        starTwinkleTimers.push(
            beginTimer
        );
    }


    function createColdStars() {
        if (!starsLayer) {
            return;
        }

        clearStarTwinkleTimers();
        preloadStarFrames();

        starsLayer.innerHTML = "";


        COLD_STAR_LAYOUT.forEach(
            (star, index) => {
                const image =
                    document.createElement(
                        "img"
                    );

                image.className =
                    "page5-cold-star";

                /*
                    star4 is the quiet resting frame.
                */
                setStarFrame(
                    image,
                    4
                );

                image.alt = "";
                image.draggable = false;

                image.style.setProperty(
                    "--star-x",
                    `${star.x}%`
                );

                image.style.setProperty(
                    "--star-y",
                    `${star.y}%`
                );

                image.style.setProperty(
                    "--star-scale",
                    String(
                        star.scale
                    )
                );

                image.style.setProperty(
                    "--star-glow-delay",
                    `${(-index * 0.29).toFixed(2)}s`
                );


                starsLayer.appendChild(
                    image
                );


                scheduleStarTwinkle(
                    image,
                    index
                );
            }
        );
    }


    function loadGroundImage(path) {
        return new Promise(
            (resolve) => {
                const image =
                    new Image();

                image.decoding =
                    "async";

                const finish =
                    () =>
                        resolve(
                            image
                        );

                image.addEventListener(
                    "load",
                    finish,
                    {
                        once: true
                    }
                );

                image.addEventListener(
                    "error",
                    finish,
                    {
                        once: true
                    }
                );

                image.src =
                    path;
            }
        );
    }


    async function prepareGroundScroller() {
        if (groundAssetsReady) {
            return;
        }


        if (!mainGroundImage) {
            mainGroundImage =
                await loadGroundImage(
                    MAIN_GROUND_PATH
                );
        }


        if (!floorGroundImage) {
            floorGroundImage =
                await loadGroundImage(
                    FLOOR_GROUND_PATH
                );
        }


        if (
            !mainGroundImage ||
            !mainGroundImage.naturalWidth ||
            !mainGroundImage.naturalHeight ||
            !floorGroundImage ||
            !floorGroundImage.naturalWidth ||
            !floorGroundImage.naturalHeight
        ) {
            console.warn(
                "Page 5 snowfield assets did not load."
            );

            return;
        }


        mainGroundDrawWidth =
            Math.round(
                mainGroundImage.naturalWidth *
                (
                    MAIN_GROUND_DRAW_HEIGHT /
                    mainGroundImage.naturalHeight
                )
            );


        floorGroundDrawWidth =
            Math.round(
                floorGroundImage.naturalWidth *
                (
                    FLOOR_GROUND_DRAW_HEIGHT /
                    floorGroundImage.naturalHeight
                )
            );


        floorGroundStep =
            Math.max(
                1,
                floorGroundDrawWidth -
                FLOOR_GROUND_OVERLAP
            );


        groundAssetsReady =
            true;
    }


    function configureGroundCanvas() {
        if (
            !groundCanvas ||
            !groundContext
        ) {
            return;
        }


        if (
            groundCanvas.width !==
                GROUND_DESIGN_WIDTH ||
            groundCanvas.height !==
                GROUND_DESIGN_HEIGHT
        ) {
            groundCanvas.width =
                GROUND_DESIGN_WIDTH;

            groundCanvas.height =
                GROUND_DESIGN_HEIGHT;
        }


        groundContext.imageSmoothingEnabled =
            false;
    }


    function drawRepeatedGroundStrip(
        image,
        drawWidth,
        drawHeight,
        step,
        offset,
        brightness = 1
    ) {
        if (
            !groundContext ||
            !image ||
            !image.naturalWidth ||
            drawWidth <= 0 ||
            drawHeight <= 0 ||
            step <= 0
        ) {
            return;
        }


        const normalizedOffset =
            (
                (
                    offset %
                    step
                ) +
                step
            ) %
            step;


        const y =
            GROUND_DESIGN_HEIGHT -
            drawHeight;


        /*
            Positive offset = terrain moves RIGHT.

            Begin one whole tile left of the viewport, then
            keep drawing until the far-right edge is covered.
            All positions are rounded to whole design pixels
            to keep the pixel art crisp.
        */
        let x =
            normalizedOffset -
            step;


        /*
            Darken RGB without touching alpha.

            Canvas brightness() preserves the source image's alpha:
            opaque snow stays fully opaque, transparent sky stays
            transparent, and nothing underneath bleeds through the
            solid snow pixels.
        */
        groundContext.save();

        const safeBrightness =
            Math.max(
                0,
                brightness
            );

        groundContext.filter =
            `brightness(${safeBrightness})`;


        while (
            x <
            GROUND_DESIGN_WIDTH +
            drawWidth
        ) {
            groundContext.drawImage(
                image,
                Math.round(
                    x
                ),
                y,
                drawWidth,
                drawHeight
            );


            x +=
                step;
        }


        groundContext.restore();
    }


    function drawGroundFrame() {
        if (
            !groundContext ||
            !groundAssetsReady
        ) {
            return;
        }


        groundContext.clearRect(
            0,
            0,
            GROUND_DESIGN_WIDTH,
            GROUND_DESIGN_HEIGHT
        );


        /*
            MAIN TERRAIN
            Exact-edge seamless PNG, so step = full width.
            No flip. No artificial hill arrangement.
        */
        drawRepeatedGroundStrip(
            mainGroundImage,
            mainGroundDrawWidth,
            MAIN_GROUND_DRAW_HEIGHT,
            mainGroundDrawWidth,
            mainGroundOffset,
            MAIN_GROUND_BRIGHTNESS
        );


        /*
            FOREGROUND SNOWFELL
            Faster and slightly overlapped for parallax.
        */
        drawRepeatedGroundStrip(
            floorGroundImage,
            floorGroundDrawWidth,
            FLOOR_GROUND_DRAW_HEIGHT,
            floorGroundStep,
            floorGroundOffset,
            1
        );
    }


    function stopGroundConveyor() {
        if (
            groundAnimationFrame !==
            null
        ) {
            cancelAnimationFrame(
                groundAnimationFrame
            );

            groundAnimationFrame =
                null;
        }


        groundLastTimestamp =
            0;
    }


    async function startGroundConveyor() {
        stopGroundConveyor();


        if (
            !groundCanvas ||
            !groundContext
        ) {
            return;
        }


        await prepareGroundScroller();


        if (!groundAssetsReady) {
            return;
        }


        configureGroundCanvas();
        drawGroundFrame();


        function tick(timestamp) {
            if (
                !root ||
                root.style.display ===
                    "none"
            ) {
                groundAnimationFrame =
                    null;

                return;
            }


            if (!groundLastTimestamp) {
                groundLastTimestamp =
                    timestamp;
            }


            /*
                Avoid a giant visual jump if the browser tab
                was inactive for a while.
            */
            const deltaSeconds =
                Math.min(
                    0.05,
                    Math.max(
                        0,
                        (
                            timestamp -
                            groundLastTimestamp
                        ) /
                        1000
                    )
                );


            groundLastTimestamp =
                timestamp;


            mainGroundOffset +=
                MAIN_GROUND_SPEED *
                deltaSeconds;

            floorGroundOffset +=
                FLOOR_GROUND_SPEED *
                deltaSeconds;


            /*
                Keep the numbers small forever.
                The visual field is periodic at the exact tile
                width/step, so these modulo wraps are invisible.
            */
            if (
                mainGroundDrawWidth > 0 &&
                mainGroundOffset >=
                    mainGroundDrawWidth
            ) {
                mainGroundOffset -=
                    mainGroundDrawWidth;
            }


            if (
                floorGroundStep > 0 &&
                floorGroundOffset >=
                    floorGroundStep
            ) {
                floorGroundOffset -=
                    floorGroundStep;
            }


            drawGroundFrame();


            groundAnimationFrame =
                requestAnimationFrame(
                    tick
                );
        }


        groundAnimationFrame =
            requestAnimationFrame(
                tick
            );
    }


    function createSnow() {
        if (!snowLayer) {
            return;
        }

        snowLayer.innerHTML = "";


        for (
            let i = 0;
            i < SNOW_COUNT;
            i++
        ) {
            const flake =
                document.createElement(
                    "img"
                );

            flake.className =
                "page5-snowflake";

            flake.src =
                "assets/art/page5/snowsprite.png";

            flake.alt = "";
            flake.draggable = false;


            /*
                Keep most flakes small like the old
                For Lopati snowfall, with a few closer
                larger flakes.
            */
            const sizePercent =
                random(
                    0.18,
                    0.62
                );

            const duration =
                random(
                    10.5,
                    18.5
                );

            const delay =
                -random(
                    0,
                    duration
                );

            const drift =
                random(
                    -85,
                    85
                );

            const spin =
                random(
                    -140,
                    140
                );


            flake.style.left =
                `${random(-2, 101)}%`;

            flake.style.setProperty(
                "--snow-size",
                `${sizePercent}%`
            );

            flake.style.setProperty(
                "--snow-opacity",
                random(
                    0.34,
                    0.92
                ).toFixed(2)
            );

            flake.style.setProperty(
                "--snow-duration",
                `${duration.toFixed(2)}s`
            );

            flake.style.setProperty(
                "--snow-delay",
                `${delay.toFixed(2)}s`
            );

            flake.style.setProperty(
                "--snow-drift",
                `${drift.toFixed(1)}px`
            );

            flake.style.setProperty(
                "--snow-spin",
                `${spin.toFixed(1)}deg`
            );


            snowLayer.appendChild(
                flake
            );
        }
    }


    function ensureDialogueAudio() {
        if (!talkingSound) {
            talkingSound =
                new Audio(
                    "assets/sounds/eram-talking.wav"
                );

            talkingSound.preload =
                "auto";
        }

        if (!finishSound) {
            finishSound =
                new Audio(
                    "assets/sounds/eram-finish-talking.wav"
                );

            finishSound.preload =
                "auto";
        }

        if (!selectSound) {
            selectSound =
                new Audio(
                    "assets/sounds/select.wav"
                );

            selectSound.preload =
                "auto";
        }
    }


    function safelyPlay(
        audio,
        volume = 1,
        restart = true
    ) {
        if (!audio) {
            return;
        }

        try {
            if (restart) {
                audio.pause();
                audio.currentTime = 0;
            }

            audio.volume =
                Math.max(
                    0,
                    Math.min(
                        1,
                        volume
                    )
                );

            const attempt =
                audio.play();

            if (
                attempt !== undefined
            ) {
                attempt.catch(() => {});
            }
        } catch (_) {}
    }


    function setDialogueText(text) {
        const value =
            String(
                text ??
                ""
            );

        if (dialogueRed) {
            dialogueRed.textContent =
                value;
        }

        if (dialogueCyan) {
            dialogueCyan.textContent =
                value;
        }

        if (dialogueWhite) {
            dialogueWhite.textContent =
                value;
        }
    }


    function clearDialogueText() {
        setDialogueText("");
    }


    function addDialogueCharacter(
        character
    ) {
        if (dialogueRed) {
            dialogueRed.textContent +=
                character;
        }

        if (dialogueCyan) {
            dialogueCyan.textContent +=
                character;
        }

        if (dialogueWhite) {
            dialogueWhite.textContent +=
                character;
        }
    }


    function playTalkingBleep(
        character
    ) {
        /*
            Don't restart ERAM's bleep for whitespace.
        */
        if (
            !character ||
            /\s/.test(character)
        ) {
            return;
        }

        safelyPlay(
            talkingSound,
            0.42,
            true
        );
    }


    function showCompleteDialogue() {
        if (
            !dialogueTyping ||
            dialogueIndex >=
                ERAM_MESSAGES.length
        ) {
            return;
        }

        clearTimeout(
            dialogueTimer
        );

        dialogueTimer = null;

        const message =
            ERAM_MESSAGES[
                dialogueIndex
            ];

        setDialogueText(
            message
        );

        dialogueCharacterIndex =
            message.length;

        dialogueTyping =
            false;

        safelyPlay(
            finishSound,
            0.66,
            true
        );
    }


    function typeCurrentDialogue() {
        clearTimeout(
            dialogueTimer
        );

        dialogueTimer = null;

        clearDialogueText();

        if (dialogue) {
            dialogue.classList.remove(
                "hidden"
            );
        }

        dialogueCharacterIndex = 0;
        dialogueTyping = true;

        const message =
            ERAM_MESSAGES[
                dialogueIndex
            ];

        function typeNextCharacter() {
            if (
                !dialogueActive ||
                dialogueIndex >=
                    ERAM_MESSAGES.length
            ) {
                return;
            }

            if (
                dialogueCharacterIndex >=
                message.length
            ) {
                dialogueTyping =
                    false;

                dialogueTimer =
                    null;

                safelyPlay(
                    finishSound,
                    0.66,
                    true
                );

                return;
            }

            const character =
                message[
                    dialogueCharacterIndex
                ];

            addDialogueCharacter(
                character
            );

            playTalkingBleep(
                character
            );

            dialogueCharacterIndex++;


            const delay =
                fastTextHeld
                    ? DIALOGUE_FAST_SPEED_MS
                    : DIALOGUE_SPEED_MS;

            dialogueTimer =
                setTimeout(
                    typeNextCharacter,
                    delay
                );
        }

        typeNextCharacter();
    }


    function startDialogue() {
        if (
            !dialogueActive ||
            dialogueStarted
        ) {
            return;
        }

        dialogueStarted = true;

        setTimeout(
            () => {
                if (
                    dialogueActive
                ) {
                    typeCurrentDialogue();
                }
            },
            DIALOGUE_FIRST_DELAY_MS
        );
    }


    function advanceDialogue() {
        if (
            !dialogueActive ||
            !dialogueStarted ||
            dialogueTransitioning ||
            dialogueFinished
        ) {
            return;
        }

        safelyPlay(
            selectSound,
            0.76,
            true
        );


        /*
            First Z/Enter while typing:
            reveal this line.

            Next Z/Enter:
            move to the next line.
        */
        if (dialogueTyping) {
            showCompleteDialogue();
            return;
        }


        if (
            dialogueIndex >=
            ERAM_MESSAGES.length - 1
        ) {
            dialogueFinished = true;

            /*
                Page 5 is now connected to Page 6.
                The final "One last time..." stays onscreen
                until the user advances once more, then the
                global white transition hands control to Flowey.
            */
            if (
                window.Page6Scene &&
                typeof window
                    .Page6Scene
                    .transitionFromPage5 ===
                    "function"
            ) {
                window
                    .Page6Scene
                    .transitionFromPage5();
            }

            return;
        }


        dialogueTransitioning = true;

        if (dialogue) {
            dialogue.classList.add(
                "hidden"
            );
        }


        const current =
            ERAM_MESSAGES[
                dialogueIndex
            ];


        /*
            Give "Before we leave..." a longer empty
            beat before ERAM reveals that someone is
            waiting.
        */
        const fadeDelay =
            current ===
                "Before we leave..."
                ? 1450
                : DIALOGUE_FADE_MS;


        setTimeout(
            () => {
                if (
                    !dialogueActive
                ) {
                    dialogueTransitioning =
                        false;

                    return;
                }

                dialogueIndex++;

                typeCurrentDialogue();

                dialogueTransitioning =
                    false;
            },
            fadeDelay
        );
    }


    function resetDialogue() {
        clearTimeout(
            dialogueTimer
        );

        dialogueTimer = null;

        dialogueStarted = false;
        dialogueIndex = 0;
        dialogueCharacterIndex = 0;
        dialogueTyping = false;
        dialogueTransitioning = false;
        dialogueFinished = false;
        fastTextHeld = false;

        clearDialogueText();

        if (dialogue) {
            dialogue.classList.add(
                "hidden"
            );
        }
    }


    function onDialogueKeyDown(
        event
    ) {
        if (!dialogueActive) {
            return;
        }

        const key =
            event.key.toLowerCase();


        if (key === "x") {
            fastTextHeld = true;

            event.preventDefault();
            event.stopPropagation();

            return;
        }


        if (
            key !== "z" &&
            key !== "enter" &&
            key !== " "
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        advanceDialogue();
    }


    function onDialogueKeyUp(
        event
    ) {
        if (
            event.key.toLowerCase() ===
            "x"
        ) {
            fastTextHeld = false;
        }
    }


    function attachDialogueInput() {
        window.addEventListener(
            "keydown",
            onDialogueKeyDown,
            true
        );

        window.addEventListener(
            "keyup",
            onDialogueKeyUp,
            true
        );
    }


    function detachDialogueInput() {
        window.removeEventListener(
            "keydown",
            onDialogueKeyDown,
            true
        );

        window.removeEventListener(
            "keyup",
            onDialogueKeyUp,
            true
        );
    }


    function startMusic() {
        if (!northernLite) {
            northernLite =
                new Audio(
                    "assets/music/northernlite.mp3"
                );

            northernLite.preload =
                "auto";

            northernLite.loop =
                true;
        }


        try {
            northernLite.pause();
            northernLite.currentTime = 0;
            northernLite.volume = 0.56;

            const attempt =
                northernLite.play();

            if (
                attempt !== undefined
            ) {
                attempt.catch(() => {});
            }
        } catch (_) {}
    }


    function stopMusic() {
        if (!northernLite) {
            return;
        }

        try {
            northernLite.pause();
            northernLite.currentTime = 0;
        } catch (_) {}
    }


    function hideOtherScenes() {
        if (window.__activeUndertaleShop) {
            try {
                window.__activeUndertaleShop.stopMusic();
            } catch (_) {}
            try {
                window.__activeUndertaleShop.hide();
            } catch (_) {}
        }


        if (
            window.EramPage3 &&
            typeof window
                .EramPage3
                .stop ===
                "function"
        ) {
            window.EramPage3.stop();
        }


        const shopCanvas =
            document.getElementById(
                "undertale-stage"
            );

        if (shopCanvas) {
            shopCanvas.classList.remove(
                "active"
            );
        }


        const game =
            document.getElementById(
                "game"
            );

        if (game) {
            game.style.display =
                "none";
        }


        const depths =
            document.getElementById(
                "depths-background"
            );

        if (depths) {
            depths.classList.remove(
                "visible"
            );
        }


        const voice =
            document.getElementById(
                "voice-dialogue"
            );

        if (voice) {
            voice.classList.remove(
                "visible"
            );
        }


        const startScreen =
            document.getElementById(
                "start-screen"
            );

        if (startScreen) {
            startScreen.classList.add(
                "hidden"
            );

            startScreen.style.display =
                "none";
        }


        const cursor =
            document.getElementById(
                "heart-cursor"
            );

        if (cursor) {
            cursor.style.display =
                "none";
        }
    }


    async function start(
        {
            onReady = null
        } = {}
    ) {
        cacheElements();
        ensureDialogueAudio();

        if (!root) {
            return;
        }


        hideOtherScenes();

        /*
            Restart Page 5 dialogue cleanly on every
            entrance / development shortcut.
        */
        dialogueActive = true;
        resetDialogue();
        attachDialogueInput();


        /*
            Make the scene render under an opaque page
            transition before revealing it.
        */
        root.style.display =
            "block";

        root.classList.remove(
            "visible"
        );


        if (!started) {
            createColdStars();
            createSnow();

            started = true;
        } else {
            if (
                starsLayer &&
                starsLayer.children.length === 0
            ) {
                createColdStars();
            }

            if (
                snowLayer &&
                snowLayer.children.length === 0
            ) {
                createSnow();
            }
        }


        startMusic();


        /*
            Preload both snowfield images before Page 5 is
            revealed under the white transition.
        */
        await prepareGroundScroller();

        configureGroundCanvas();
        drawGroundFrame();


        /*
            Wait until the actual mockup image is ready,
            so the white transition never reveals a
            half-loaded black frame.
        */
        /*
            Wait for the background, scrolling snow, and
            tiny star sprites before white fades away.
            A failed/missing optional sprite still resolves
            through waitForImage's error handler.
        */
        const sceneImages =
            Array.from(
                root.querySelectorAll(
                    "img"
                )
            );

        await Promise.all(
            sceneImages.map(
                waitForImage
            )
        );


        await new Promise(
            (resolve) =>
                requestAnimationFrame(
                    () =>
                        requestAnimationFrame(
                            resolve
                        )
                )
        );


        root.classList.add(
            "visible"
        );

        /*
            Start the non-resetting snow conveyor only
            after the Page 5 scene is laid out.
        */
        startGroundConveyor();

        startDialogue();


        if (
            typeof onReady ===
            "function"
        ) {
            try {
                onReady();
            } catch (_) {}
        }
    }


    function stop() {
        cacheElements();

        dialogueActive = false;
        detachDialogueInput();

        clearTimeout(
            dialogueTimer
        );

        dialogueTimer = null;

        stopMusic();
        stopGroundConveyor();

        mainGroundOffset = 0;
        floorGroundOffset = 0;

        if (groundContext) {
            groundContext.clearRect(
                0,
                0,
                GROUND_DESIGN_WIDTH,
                GROUND_DESIGN_HEIGHT
            );
        }

        if (!root) {
            return;
        }

        root.classList.remove(
            "visible"
        );

        root.style.display =
            "none";

        if (snowLayer) {
            snowLayer.innerHTML =
                "";
        }

        clearStarTwinkleTimers();

        if (starsLayer) {
            starsLayer.innerHTML =
                "";
        }

        started = false;
    }


    async function transitionFromShop(
        shop
    ) {
        const transitionToken =
            navigationToken();

        cacheElements();

        if (!navigationStillCurrent(transitionToken)) {
            return;
        }

        const overlay =
            document.getElementById(
                "page-transition-white"
            );


        /*
            Page 4 is already completely white at the end.
            Let the global white overlay take ownership
            instantly, just like Page 2 -> Page 3.
        */
        if (overlay) {
            overlay.style.transition =
                "none";

            overlay.classList.add(
                "visible"
            );

            void overlay.offsetWidth;
        }


        if (shop) {
            try {
                shop.stopMusic();
            } catch (_) {}

            try {
                shop.hide();
            } catch (_) {}
        }


        let markReady;

        const ready =
            new Promise(
                (resolve) => {
                    markReady = resolve;
                }
            );


        if (!navigationStillCurrent(transitionToken)) {
            return;
        }

        const startPromise =
            start({
                onReady:
                    () =>
                        markReady()
            });


        if (
            startPromise &&
            typeof startPromise.catch ===
                "function"
        ) {
            startPromise.catch(
                (error) =>
                    console.error(
                        "Page 5 failed to start:",
                        error
                    )
            );
        }


        await Promise.race([
            ready,

            wait(2500)
        ]);


        await wait(120);

        if (!navigationStillCurrent(transitionToken)) {
            return;
        }


        if (overlay) {
            overlay.style.transition =
                "opacity 1.05s ease-in-out";

            requestAnimationFrame(
                () => {
                    requestAnimationFrame(
                        () => {
                            overlay.classList.remove(
                                "visible"
                            );
                        }
                    );
                }
            );


            await wait(1100);

            overlay.style.transition =
                "";
        }
    }


    /* Number-key page navigation is centralized in game.js. */


    window.Page5Scene = {
        start,
        stop,
        transitionFromShop
    };
})();
