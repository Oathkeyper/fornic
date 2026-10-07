(function () {
    "use strict";

    const MESSAGE_FADE_MS = 650;
    const TYPE_SPEED_MS = 45;
    const FIRST_LINE_DELAY_MS = 1200;

    const messages = [
        "Nic...oh, Nic...",
        "Do you miss them?",
        "Well, they missed you.\nDon't worry, though...",
        "Now, they're free.",
        "Free to totally forget you.",
        "I mean, be honest...",
        "They didn't REALLY impress you, did they?",
        "The type of things you like are so much more interesting.",
        "These flat minds...",
        "In a flat world...",
        "With flat dreams...",
        "They don't even look intriguing!",
        "Your eyes can't hide it, Nic.",
        "You're offended.",
        "This world, to you, doesn't measure up.\nIt's expendable.",
        "You can ONLY enjoy journeys of a higher glamour!",
        "Golden water cleaning your feet,\ndiamonds actually raining from the sky,\ncathedrals that pierce the sky...",
        "Even MY words have to be of the highest definition.",
        "Everything has to be of the highest esteem\nto even THINK of being interacted with by you.",
        "That's why you left!\nIt's clear to me.",
        "But there's another factor, isn't there?",
        "You were scared of being attached to them.",
        "...?",
        "How am I wrong?",
        "Don't give me that sour face.",
        "I can see in the dark, you know!",
        "Question is...",
        "Can you?",

        "There's been hunger in your eyes before, Nic.",
        "The day we meet will be the day we get to play together!",
        "If you don't give in, we can reveal the realest idea of fun!",
        "I know, I know...",
        "You must be thinking:",
        "\"Why are you here?\"",
        "\"Are you talking to me just to be confusing and vague?\"",
        "I'm happy to let you know",
        "My job is MUCH more interesting...",
        "When we meet, we have to FIGHT.",
        "But there's a rule to our interactions.",
        "If I fall once, you win.",
        "If you fall once, you can try as often as you want.",
        "You have the hand of God with you.",
        "It may be useless for me to challenge you, but I have to.",
        "It's unfair, right?",
        "But I don't care, though.",
        "Everyone who's ever tasted victory in battle knows that there's something deeper than winning.",
        "And that \"something\" actually changes them.",
        "It's my job to leave you with that",
        "Let's see what it means to you."
    ];

    let root;
    let fountain;
    let door;
    let prompt;
    let dialogue;
    let redLayer;
    let cyanLayer;
    let whiteLayer;
    let cursor;

    let music;
    let waterfellMusic;
    let talkingSound;
    let finishSound;
    let selectSound;
    let laughSound;
    let pageTransitionSound;

    let active = false;
    let experienceStarted = false;
    let musicStarted = false;
    let messageIndex = 0;
    let characterIndex = 0;
    let typingTimer = null;
    let isTyping = false;
    let isTransitioning = false;
    let finalMessageFinished = false;

    let blackPhaseStarted = false;
    let doorPhaseStarted = false;
    let waterfellFadeStarted = false;
    let page4TransitionStarted = false;

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

    function getElements() {
        root = document.getElementById("eram-page3");
        fountain = document.getElementById("eram-page3-fountain");
        door = document.getElementById("eram-page3-door");
        prompt = document.getElementById("eram-page3-prompt");
        dialogue = document.getElementById("eram-page3-dialogue");
        redLayer = document.getElementById("eram-page3-red");
        cyanLayer = document.getElementById("eram-page3-cyan");
        whiteLayer = document.getElementById("eram-page3-white");
        cursor = document.getElementById("eram-page3-cursor");
    }

    function ensureAudio() {
        if (!music) {
            music = new Audio("assets/music/eram.mp3");
            music.preload = "auto";
            music.loop = true;
        }

        if (!waterfellMusic) {
            waterfellMusic = new Audio(
                "assets/music/waterfell.ogg"
            );

            waterfellMusic.preload = "auto";

            /*
                No volume automation anymore.
                Waterfall now loops normally at one
                constant level.
            */
            waterfellMusic.loop = true;
        }

        if (!talkingSound) {
            talkingSound = new Audio("assets/sounds/eram-talking.wav");
            talkingSound.preload = "auto";
        }

        if (!finishSound) {
            finishSound = new Audio("assets/sounds/eram-finish-talking.wav");
            finishSound.preload = "auto";
        }

        if (!selectSound) {
            selectSound = new Audio("assets/sounds/select.wav");
            selectSound.preload = "auto";
        }

        if (!laughSound) {
            laughSound = new Audio(
                "assets/sounds/letsactlikethisiseram.ogg"
            );
            laughSound.preload = "auto";
        }

        if (!pageTransitionSound) {
            pageTransitionSound =
                new Audio(
                    "assets/sounds/dtintronoise.mp3"
                );

            pageTransitionSound.preload =
                "auto";
        }
    }

    function safelyPlay(audio, volume = 1, restart = true) {
        if (!audio) {
            return;
        }

        try {
            if (restart) {
                audio.pause();
                audio.currentTime = 0;
            }

            audio.volume = Math.max(0, Math.min(1, volume));

            const attempt = audio.play();

            if (attempt !== undefined) {
                attempt.catch(() => {});
            }
        } catch (_) {
            // Audio must never stop the dialogue sequence.
        }
    }


    function playLaughBeat() {
        return new Promise((resolve) => {
            if (!laughSound) {
                resolve();
                return;
            }

            let finished = false;

            const finish = () => {
                if (finished) {
                    return;
                }

                finished = true;

                laughSound.removeEventListener(
                    "ended",
                    finish
                );

                laughSound.removeEventListener(
                    "error",
                    finish
                );

                resolve();
            };

            try {
                laughSound.pause();
                laughSound.currentTime = 0;
                laughSound.volume = 0.9;

                laughSound.addEventListener(
                    "ended",
                    finish,
                    { once: true }
                );

                laughSound.addEventListener(
                    "error",
                    finish,
                    { once: true }
                );

                const attempt =
                    laughSound.play();

                if (attempt !== undefined) {
                    attempt.catch(() => {
                        /*
                            If autoplay/audio decoding fails,
                            preserve the dramatic pause anyway.
                        */
                        setTimeout(
                            finish,
                            900
                        );
                    });
                }

                /*
                    Safety timeout so a malformed OGG can
                    never freeze Page 3.
                */
                setTimeout(
                    finish,
                    5000
                );
            } catch (_) {
                setTimeout(
                    finish,
                    900
                );
            }
        });
    }

    function fadeAudio(audio, targetVolume, duration) {
        if (!audio) {
            return;
        }

        if (audio._page3FadeTimer) {
            clearInterval(audio._page3FadeTimer);
        }

        const startVolume = audio.volume;
        const delta = targetVolume - startVolume;
        const startedAt = performance.now();

        audio._page3FadeTimer = setInterval(() => {
            const progress = Math.min(
                (performance.now() - startedAt) / duration,
                1
            );

            audio.volume = Math.max(
                0,
                Math.min(1, startVolume + delta * progress)
            );

            if (progress >= 1) {
                clearInterval(audio._page3FadeTimer);
                audio._page3FadeTimer = null;
            }
        }, 40);
    }

    function startEramMusic() {
        if (musicStarted) {
            return;
        }

        musicStarted = true;
        music.pause();
        music.currentTime = 0;
        music.loop = true;
        music.volume = 0;

        const attempt = music.play();

        if (attempt !== undefined) {
            attempt
                .then(() => {
                    fadeAudio(music, 0.58, 1800);
                })
                .catch(() => {
                    musicStarted = false;
                });
        }
    }


    function cutEramMusic() {
        if (!music) {
            return;
        }

        if (music._page3FadeTimer) {
            clearInterval(
                music._page3FadeTimer
            );

            music._page3FadeTimer = null;
        }

        music.pause();
        music.currentTime = 0;
        music.volume = 0;

        musicStarted = false;
    }


    function beginBlackPhase() {
        if (blackPhaseStarted) {
            return;
        }

        blackPhaseStarted = true;

        cutEramMusic();

        if (fountain) {
            fountain.classList.add(
                "quick-hidden"
            );
        }
    }


    function startWaterfellMusic() {
        if (!waterfellMusic) {
            return;
        }

        waterfellFadeStarted = false;

        if (
            waterfellMusic._page3FadeTimer
        ) {
            clearInterval(
                waterfellMusic._page3FadeTimer
            );

            waterfellMusic._page3FadeTimer =
                null;
        }

        waterfellMusic.pause();
        waterfellMusic.currentTime = 0;
        waterfellMusic.volume = 0.52;
        waterfellMusic.loop = true;

        const attempt =
            waterfellMusic.play();

        if (attempt !== undefined) {
            attempt.catch(() => {});
        }
    }


    function beginDoorPhase() {
        if (doorPhaseStarted) {
            return Promise.resolve();
        }

        doorPhaseStarted = true;

        startWaterfellMusic();

        if (door) {
            door.classList.add(
                "visible"
            );
        }

        return new Promise(
            (resolve) => {
                setTimeout(
                    resolve,
                    3400
                );
            }
        );
    }

    function unlockVoiceAudio() {
        talkingSound.volume = 0;

        const attempt = talkingSound.play();

        if (attempt !== undefined) {
            attempt
                .then(() => {
                    talkingSound.pause();
                    talkingSound.currentTime = 0;
                    talkingSound.volume = 0.58;
                })
                .catch(() => {
                    talkingSound.volume = 0.58;
                });
        }
    }

    function playTalkingBleep(character) {
        if (
            character === " " ||
            character === "\n" ||
            character === "\t"
        ) {
            return;
        }

        safelyPlay(talkingSound, 0.58, true);
    }

    function clearDialogue() {
        redLayer.textContent = "";
        cyanLayer.textContent = "";
        whiteLayer.textContent = "";
    }

    function setDialogueText(text) {
        redLayer.textContent = text;
        cyanLayer.textContent = text;
        whiteLayer.textContent = text;
    }

    function addCharacter(character) {
        redLayer.textContent += character;
        cyanLayer.textContent += character;
        whiteLayer.textContent += character;
    }

    function showCompleteMessage() {
        if (!isTyping) {
            return;
        }

        clearTimeout(typingTimer);
        typingTimer = null;

        const message = messages[messageIndex];
        setDialogueText(message);

        characterIndex = message.length;
        isTyping = false;

        safelyPlay(finishSound, 0.72, true);
    }

    function typeCurrentMessage() {
        clearTimeout(typingTimer);
        typingTimer = null;
        clearDialogue();

        dialogue.classList.remove("hidden");

        characterIndex = 0;
        isTyping = true;

        const message = messages[messageIndex];

        if (
            message === "Question is..."
        ) {
            beginBlackPhase();
        }

        function typeNextCharacter() {
            if (!active) {
                return;
            }

            if (characterIndex >= message.length) {
                isTyping = false;
                typingTimer = null;
                safelyPlay(finishSound, 0.72, true);
                return;
            }

            const character = message[characterIndex];

            addCharacter(character);
            playTalkingBleep(character);

            characterIndex++;

            typingTimer = setTimeout(
                typeNextCharacter,
                TYPE_SPEED_MS
            );
        }

        typeNextCharacter();
    }

    function advanceDialogue() {
        if (
            !active ||
            !experienceStarted ||
            isTransitioning ||
            finalMessageFinished
        ) {
            return;
        }

        safelyPlay(selectSound, 0.85, true);

        /*
            Same Page 5 rule:
            first click while typing reveals the line;
            the NEXT click advances.
        */
        if (isTyping) {
            showCompleteMessage();
            return;
        }

        if (messageIndex >= messages.length - 1) {
            finalMessageFinished = true;

            transitionToPage4();

            return;
        }

        isTransitioning = true;
        dialogue.classList.add("hidden");

        /*
            Special ERAM laugh beat:
            after "You were scared of being attached to them."
            the player's click clears all dialogue, then the
            laugh plays against the empty fountain before
            "...?" appears automatically.
        */
        const currentMessage =
            messages[messageIndex];

        if (
            currentMessage ===
                "You were scared of being attached to them." ||
            currentMessage ===
                "It's unfair, no?"
        ) {
            setTimeout(async () => {
                clearDialogue();

                await playLaughBeat();

                if (!active) {
                    isTransitioning = false;
                    return;
                }

                messageIndex++;

                typeCurrentMessage();
                isTransitioning = false;
            }, MESSAGE_FADE_MS);

            return;
        }

        if (
            currentMessage ===
            "Can you?"
        ) {
            setTimeout(async () => {
                clearDialogue();

                await beginDoorPhase();

                if (!active) {
                    isTransitioning = false;
                    return;
                }

                messageIndex++;

                typeCurrentMessage();
                isTransitioning = false;
            }, MESSAGE_FADE_MS);

            return;
        }


        setTimeout(() => {
            messageIndex++;

            /*
                Source timing:
                "Do you miss them?" is heard in silence.
                ERAM's OST begins as the next line arrives.
            */
            if (messageIndex === 2) {
                startEramMusic();
            }

            typeCurrentMessage();
            isTransitioning = false;
        }, MESSAGE_FADE_MS);
    }

    async function transitionToPage4() {
        const transitionToken =
            navigationToken();

        if (
            page4TransitionStarted ||
            !window.GersonPage4
        ) {
            return;
        }

        page4TransitionStarted = true;
        isTransitioning = true;

        dialogue.classList.add(
            "hidden"
        );

        /*
            Transition sound begins at the exact moment
            the whole screen starts washing to white.
        */
        safelyPlay(
            pageTransitionSound,
            1,
            true
        );


        const overlay =
            document.getElementById(
                "page-transition-white"
            );

        if (overlay) {
            overlay.classList.add(
                "visible"
            );
        }


        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    1150
                )
        );

        if (!navigationStillCurrent(transitionToken)) {
            return;
        }


        stop();


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

        const page4Promise =
            window
                .GersonPage4
                .start({
                    onReady:
                        () =>
                            markReady()
                });


        /*
            Do NOT await the whole Page 4 scene here.
            Page 4 contains interactive dialogue and can
            remain pending for minutes. We only wait until
            its renderer/background is ready underneath
            the white overlay.
        */
        if (
            page4Promise &&
            typeof page4Promise.catch ===
                "function"
        ) {
            page4Promise.catch(
                (error) =>
                    console.error(
                        "Page 4 start failed:",
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


        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    100
                )
        );

        if (!navigationStillCurrent(transitionToken)) {
            return;
        }


        if (overlay) {
            overlay.classList.remove(
                "visible"
            );
        }
    }


    function beginExperience() {
        if (!active || experienceStarted) {
            return;
        }

        experienceStarted = true;

        prompt.classList.add("hidden");
        safelyPlay(selectSound, 0.85, true);
        unlockVoiceAudio();

        setTimeout(() => {
            if (active) {
                typeCurrentMessage();
            }
        }, FIRST_LINE_DELAY_MS);
    }

    function onPointerDown(event) {
        if (!active) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (!experienceStarted) {
            beginExperience();
            return;
        }

        advanceDialogue();
    }

    function onKeyDown(event) {
        if (!active) {
            return;
        }

        const key = event.key.toLowerCase();

        if (
            key !== "enter" &&
            key !== "z" &&
            key !== " "
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (!experienceStarted) {
            beginExperience();
            return;
        }

        advanceDialogue();
    }

    function onMouseMove(event) {
        if (!active || !cursor) {
            return;
        }

        const rect = root.getBoundingClientRect();

        cursor.style.display = "block";
        cursor.style.left = `${event.clientX - rect.left}px`;
        cursor.style.top = `${event.clientY - rect.top}px`;
    }

    function onMouseDown() {
        if (active && cursor) {
            cursor.src = "assets/spr_heart_1.png";
        }
    }

    function onMouseUp() {
        if (active && cursor) {
            cursor.src = "assets/spr_heart_0.png";
        }
    }

    function resetState() {
        clearTimeout(typingTimer);
        typingTimer = null;

        experienceStarted = false;
        musicStarted = false;
        messageIndex = 0;
        characterIndex = 0;
        isTyping = false;
        isTransitioning = false;
        finalMessageFinished = false;

        blackPhaseStarted = false;
        doorPhaseStarted = false;
        waterfellFadeStarted = false;
        page4TransitionStarted = false;

        clearDialogue();

        dialogue.classList.add("hidden");
        prompt.classList.remove("hidden");

        if (fountain) {
            fountain.classList.remove(
                "quick-hidden"
            );
        }

        if (door) {
            door.classList.remove(
                "visible"
            );
        }

        if (cursor) {
            cursor.src = "assets/spr_heart_0.png";
            cursor.style.display = "none";
        }

        if (music) {
            music.pause();
            music.currentTime = 0;
            music.volume = 0;
        }

        if (waterfellMusic) {
            waterfellMusic.pause();
            waterfellMusic.currentTime = 0;
            waterfellMusic.volume = 0;
        }

        if (laughSound) {
            laughSound.pause();
            laughSound.currentTime = 0;
        }
    }

    function attachInput() {
        root.addEventListener("pointerdown", onPointerDown);
        root.addEventListener("mousemove", onMouseMove);
        root.addEventListener("mousedown", onMouseDown);
        root.addEventListener("mouseup", onMouseUp);
        window.addEventListener("keydown", onKeyDown, true);
    }

    function detachInput() {
        root.removeEventListener("pointerdown", onPointerDown);
        root.removeEventListener("mousemove", onMouseMove);
        root.removeEventListener("mousedown", onMouseDown);
        root.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("keydown", onKeyDown, true);
    }

    function start() {
        getElements();
        ensureAudio();

        if (!root || active) {
            return;
        }

        active = true;
        resetState();
        attachInput();

        root.style.display = "block";

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                root.classList.add("visible");
                fountain.classList.add("visible");
            });
        });
    }

    function stop() {
        if (!active) {
            return;
        }

        active = false;
        detachInput();

        clearTimeout(typingTimer);
        typingTimer = null;

        if (music) {
            music.pause();
            music.currentTime = 0;
        }

        if (waterfellMusic) {
            waterfellMusic.pause();
            waterfellMusic.currentTime = 0;
            waterfellMusic.volume = 0;
        }

        if (laughSound) {
            laughSound.pause();
            laughSound.currentTime = 0;
        }

        [
            talkingSound,
            finishSound,
            selectSound,
            pageTransitionSound
        ].forEach((audio) => {
            if (!audio) return;
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (_) {}
        });

        root.classList.remove("visible");
        fountain.classList.remove("visible");
        fountain.classList.remove("quick-hidden");

        if (door) {
            door.classList.remove("visible");
        }

        setTimeout(() => {
            if (!active) {
                root.style.display = "none";
            }
        }, 1800);
    }

    window.EramPage3 = {
        start,
        stop,
        advance: advanceDialogue
    };
})();
