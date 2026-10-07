(() => {
    "use strict";
    const MESSAGES = [ "Psst. Hey! Over here!", "Well...!", "Why are you back?", "Whatever, I had a feeling you'd get bored anyway.", "You're all so annoying.", "...", "As you were walking throught Mt. Ebott, I was watching you, you know?", "Yeah, I was following your every move.", "Waiting for the day when I would get my power back.", "But, well...", "Yeah, okay, we both know how that went.", "Regardless, our time is up.", "I'm ready to, sort of, fade away.", "Or something.", "I didn't really have anything to tell you.", "But!", "They did.", "They seem really excited for some reason.", "They shouldn't even be back here, we set them free.", "But, listen!", "They're apologizing...", "It seems like they're sorry for keeping you in anticipation.", "You probably wanted to meet them, and I think they know they kept you anticipating.", "There's more...", "They can't speak. Not here.", "But I owe it to them to be their voice.", "They all have personalities.", "More than just unique, they all have things they lost that they keep thinking about.", "Families, friends, goals.", "Hopes.", "Dreams.", "At times, when I do want to sleep,", "I dream along with them.", "I know I don't deserve to, but since we've been keeping each other company, they invite me.", "I hope one day, they can-", "H-hey! What's going on?!", "Does your SOUL want to go free?!", "... Wait... How?", "I thought all SOULs were part of the human's body?", "How are they separate now?!", "And why's it glowing?!", "Nic! No! You can't leave me! Not again!", "I still have a lot to tell you!", "Shit! Hey, Nic! Remember when mom asked you why you like your glass filled up all the way to the top?!", "And you said something about it being the most efficient way to fill it?", "I get it now, I really do!", "You wanted power right? Everything you did, you wanted it to be top notch!", "I hope... I hope where you go, you finally have that power!", "I know you didn't have that power when you were on the surface! But I promise!", "Your choices DO matter!", "You hear me?! Remember that, always!", "D O N ' T   F O R G E T" ];
    const TYPE_SPEED_MS = 42;
    const FAST_TYPE_SPEED_MS = 8;
    const MESSAGE_FADE_MS = 260;
    const OPENING_DELAY_MS = 980;
    const SOUL_EMERGE_MS = 920;
    const SOUL_FILES = [ "cyansoul.png", "orangesoul.png", "bluesoul.png", "purplesoul.png", "greensoul.png", "yellowsoul.png" ];
    const WHITE_CUES = new Map([ [ "H-hey! What's going on?!", 0.20 ], [ "Nic! No! You can't leave me! Not again!", 0.40 ], [ "Shit! Hey, Nic! Remember when mom asked you why you like your glass filled up all the way to the top?!", 0.60 ], [ "You wanted power right? Everything you did, you wanted it to be top notch!", 0.78 ], [ "D O N ' T   F O R G E T", 1.0 ] ]);
    let root = null;
    let floweyWrap = null;
    let floweySprite = null;
    let floweyFaceOverlay = null;
    let floweyMouthOverlay = null;
    let soulsRoot = null;
    let dialogue = null;
    let dialogueText = null;
    let whitewash = null;
    let active = false;
    let messageIndex = 0;
    let characterIndex = 0;
    let typing = false;
    let transitioning = false;
    let fastTextHeld = false;
    let typeTimer = null;
    let openingTimer = null;
    let soulElements = [];
    let soulsRevealed = false;
    let soulsOrbiting = false;
    let orbitFrame = null;
    let orbitStart = 0;
    const VISUAL_FRAME_MS = 1000 / 30;
    let lastSoulDrawFrame = -1;
    let anEnding1 = null;
    let sevenSuns = null;
    let floweyTalk1 = null;
    let ominousCue = null;
    let lastBlipAt = 0;
    const FLOWEY_RISE_FRAMES = [ "spr_flowey_riseanim_0.png", "spr_flowey_riseanim_1.png", "spr_flowey_riseanim_2.png", "spr_flowey_riseanim_3.png", "spr_flowey_riseanim_4.png", "spr_flowey_riseanim_5.png", "spr_flowey_riseanim_6.png", "spr_flowey_riseanim_7.png", "spr_flowey_riseanim_8.png" ];
    const FLOWEY_EXPRESSIONS = {
        nice: {
            frames: [ "spr_floweynice_0.png", "spr_floweynice_1.png" ]
        },
        plain: {
            frames: [ "spr_floweyplain_0.png", "spr_floweyplain_1.png" ]
        },
        sassy: {
            frames: [ "spr_floweysassy_0.png", "spr_floweysassy_1.png" ]
        },
        grin: {
            frames: [ "spr_floweygrin_0.png", "spr_floweygrin_1.png" ]
        },
        niceside: {
            frames: [ "spr_floweyniceside_0.png", "spr_floweyniceside_1.png" ]
        },
        evil: {
            frames: [ "spr_floweyevil_0.png", "spr_floweyevil_1.png" ]
        },
        pissed: {
            frames: [ "spr_floweypissed_0.png", "spr_floweypissed_1.png" ]
        },
        side: {
            frames: [ "spr_floweyside.png", "spr_floweyside_talk.png" ]
        },
        as: {
            overlayFrames: [ "spr_flowey_as/spr_flowey_as_1.png", "spr_flowey_as/spr_flowey_as_2.png" ]
        },
        l3_2: {
            staticFace: "spr_floweyface_l3_stable/spr_floweyface_l3_2.png",
            talkOverlayFrames: [ "spr_floweyface_l3_stable/spr_floweyface_l3_2.png", "spr_floweyface_l3_stable/spr_floweyface_l3_22.png" ]
        },
        l3_4: {
            staticFace: "spr_floweyface_l3_stable/spr_floweyface_l3_4.png",
            talkOverlayFrames: [ "spr_floweyface_l3_stable/spr_floweyface_l3_4.png", "spr_floweyface_l3_stable/spr_floweyface_l3_42.png" ]
        },
        l3_5: {
            staticFace: "spr_floweyface_l3_stable/spr_floweyface_l3_5.png",
            talkOverlayFrames: [ "spr_floweyface_l3_stable/spr_floweyface_l3_5.png", "spr_floweyface_l3_stable/spr_floweyface_l3_52.png" ]
        },
        l3_6: {
            staticFace: "spr_floweyface_l3_stable/spr_floweyface_l3_6.png",
            talkOverlayFrames: [ "spr_floweyface_l3_stable/spr_floweyface_l3_6.png", "spr_floweyface_l3_stable/spr_floweyface_l3_62.png" ]
        },
        l3_7: {
            staticFace: "spr_floweyface_l3_stable/spr_floweyface_l3_7.png",
            talkOverlayFrames: [ "spr_floweyface_l3_stable/spr_floweyface_l3_7.png", "spr_floweyface_l3_stable/spr_floweyface_l3_72.png" ]
        },
        l3_10: {
            staticFace: "spr_floweyface_l3_stable/spr_floweyface_l3_10.png",
            talkOverlayFrames: [ "spr_floweyface_l3_stable/spr_floweyface_l3_10.png", "spr_floweyface_l3_stable/spr_floweyface_l3_102.png" ]
        }
    };
    const FLOWEY_MESSAGE_EXPRESSIONS = new Map([ [ "Well...!", "plain" ], [ "Why are you back?", "sassy" ], [ "Whatever, I had a feeling you'd get bored anyway.", "grin" ], [ "You're all so annoying.", "grin" ], [ "...", "grin" ], [ "As you were walking throught Mt. Ebott, I was watching you, you know?", "plain" ], [ "Yeah, I was following your every move.", "niceside" ], [ "Waiting for the day when I would get my power back.", "evil" ], [ "But, well...", "plain" ], [ "Yeah, okay, we both know how that went.", "pissed" ], [ "Regardless, our time is up.", "plain" ], [ "I'm ready to, sort of, fade away.", "plain" ], [ "Or something.", "side" ], [ "I didn't really have anything to tell you.", "plain" ], [ "But!", "evil" ], [ "They did.", "nice" ], [ "They seem really excited for some reason.", "plain" ], [ "They shouldn't even be back here, we set them free.", "plain" ], [ "But, listen!", "plain" ], [ "They're apologizing...", "side" ], [ "It seems like they're sorry for keeping you in anticipation.", "nice" ], [ "You probably wanted to meet them, and I think they know they kept you anticipating.", "nice" ], [ "There's more...", "side" ], [ "They can't speak. Not here.", "plain" ], [ "But I owe it to them to be their voice.", "plain" ], [ "They all have personalities.", "nice" ], [ "More than just unique, they all have things they lost that they keep thinking about.", "niceside" ], [ "Families, friends, goals.", "nice" ], [ "Hopes.", "plain" ], [ "Dreams.", "nice" ], [ "At times, when I do want to sleep,", "side" ], [ "I dream along with them.", "niceside" ], [ "I know I don't deserve to, but since we've been keeping each other company, they invite me.", "l3_5" ], [ "I hope one day, they can-", "l3_6" ], [ "H-hey! What's going on?!", "l3_4" ], [ "Does your SOUL want to go free?!", "l3_4" ], [ "... Wait... How?", "l3_4" ], [ "I thought all SOULs were part of the human's body?", "l3_4" ], [ "How are they separate now?!", "l3_4" ], [ "And why's it glowing?!", "l3_4" ], [ "Nic! No! You can't leave me! Not again!", "l3_4" ], [ "I still have a lot to tell you!", "l3_4" ], [ "Shit! Hey, Nic! Remember when mom asked you why you like your glass filled up all the way to the top?!", "pissed" ], [ "And you said something about it being the most efficient way to fill it?", "pissed" ], [ "I get it now, I really do!", "as" ], [ "You wanted power right? Everything you did, you wanted it to be top notch!", "as" ], [ "I hope... I hope where you go, you finally have that power!", "as" ], [ "I know you didn't have that power when you were on the surface! But I promise!", "as" ], [ "Your choices DO matter!", "as" ], [ "You hear me?! Remember that, always!", "as" ], [ "D O N ' T   F O R G E T", "as" ] ]);
    const FLOWEY_MESSAGE_SEGMENTS = new Map([ [ "As you were walking throught Mt. Ebott, I was watching you, you know?", [ {
        at: "I was watching you, you know?",
        expression: "nice"
    } ] ] ]);
    const FLOWEY_RISE_FRAME_MS = 90;
    let floweyEntered = false;
    let floweyRising = false;
    let floweyExpression = "nice";
    let floweyTalkFrame = 0;
    let floweyTalkTimer = null;
    const FLOWEY_TALK_STEP_MIN_MS = 52;
    let floweyLastTalkStepAt = 0;
    const floweyImageCache = new Map;
    let floweySpriteRequestId = 0;
    let floweyOverlayRequestId = 0;
    let floweyMouthOverlayRequestId = 0;
    let endingMusicStarted = false;
    let sevenSunsStarted = false;
    const SEVEN_SUNS_VOLUME = 0.67;
    let sevenSunsPausedForWhiteout = false;
    let sevenSunsResumePending = false;
    let sevenSunsPlayPending = false;
    let sevenSunsPlaybackToken = 0;
    let sevenSunsFadeToken = 0;
    let floweyShakeTimer = null;
    let floweyShaking = false;
    let floweyShakeStep = 0;
    const FLOWEY_NO_MOUTH_MESSAGES = new Set([ "Does your SOUL want to go free?!" ]);
    const FLOWEY_SHAKE_MESSAGES = new Set([ "H-hey! What's going on?!", "Does your SOUL want to go free?!", "... Wait... How?", "I thought all SOULs were part of the human's body?", "How are they separate now?!", "And why's it glowing?!", "Nic! No! You can't leave me! Not again!", "I still have a lot to tell you!" ]);
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function navigationToken() {
        return window.ForNicNavigation && typeof window.ForNicNavigation.getToken === "function" ? window.ForNicNavigation.getToken() : 0;
    }
    function navigationStillCurrent(token) {
        return !window.ForNicNavigation || typeof window.ForNicNavigation.isCurrent !== "function" || window.ForNicNavigation.isCurrent(token);
    }
    function cacheElements() {
        root = document.getElementById("page6-stage");
        floweyWrap = document.getElementById("page6-flowey-wrap");
        floweySprite = document.getElementById("page6-flowey-sprite");
        floweyFaceOverlay = document.getElementById("page6-flowey-face-overlay");
        floweyMouthOverlay = document.getElementById("page6-flowey-mouth-overlay");
        soulsRoot = document.getElementById("page6-souls");
        dialogue = document.getElementById("page6-dialogue");
        dialogueText = document.getElementById("page6-dialogue-text");
        whitewash = document.getElementById("page6-whitewash");
    }
    function ensureAudio() {
        if (!anEnding1) {
            anEnding1 = new Audio("assets/music/anending1.ogg");
            anEnding1.preload = "auto";
            anEnding1.loop = true;
        }
        if (!sevenSuns) {
            sevenSuns = new Audio("assets/music/sevensuns.mp3");
            sevenSuns.preload = "auto";
            sevenSuns.loop = true;
        }
        if (!floweyTalk1) {
            floweyTalk1 = new Audio("assets/sounds/snd_floweytalk1.wav");
            floweyTalk1.preload = "auto";
        }
        if (!ominousCue) {
            ominousCue = new Audio("assets/sounds/snd_ominous.wav");
            ominousCue.preload = "auto";
        }
    }
    function safeStop(audio) {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (_) {}
    }
    function safePlay(audio, volume = 0.62, restart = false) {
        if (!audio || !active) return;
        try {
            if (restart) audio.currentTime = 0;
            audio.volume = volume;
            const attempt = audio.play();
            if (attempt !== void 0) attempt.catch(() => {});
        } catch (_) {}
    }
    function fadeAudio(audio, toVolume, durationMs, {stopAtEnd: stopAtEnd = false} = {}) {
        if (!audio) return;
        const fromVolume = Number.isFinite(audio.volume) ? audio.volume : 0;
        const startedAt = performance.now();
        function frame(now) {
            if (!active && !stopAtEnd) return;
            const progress = Math.min(1, (now - startedAt) / durationMs);
            try {
                audio.volume = fromVolume + (toVolume - fromVolume) * progress;
            } catch (_) {}
            if (progress < 1) {
                requestAnimationFrame(frame);
                return;
            }
            if (stopAtEnd) safeStop(audio);
        }
        requestAnimationFrame(frame);
    }
    function startEndingExcerpt() {
        if (endingMusicStarted || !anEnding1) return;
        endingMusicStarted = true;
        try {
            anEnding1.volume = 0;
            anEnding1.currentTime = 0;
        } catch (_) {}
        safePlay(anEnding1, 0, false);
        fadeAudio(anEnding1, 0.62, 1200);
    }
    function cancelSevenSunsFade() {
        sevenSunsFadeToken++;
    }
    function fadeSevenSuns(targetVolume, durationMs) {
        if (!sevenSuns) return;
        const token = ++sevenSunsFadeToken;
        const fromVolume = Number.isFinite(sevenSuns.volume) ? sevenSuns.volume : 0;
        const startedAt = performance.now();
        function frame(now) {
            if (token !== sevenSunsFadeToken || !sevenSuns) return;
            const progress = Math.min(1, (now - startedAt) / Math.max(1, durationMs));
            sevenSuns.volume = fromVolume + (targetVolume - fromVolume) * progress;
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }
    function pauseSevenSunsForWhiteout() {
        if (!sevenSuns || !sevenSunsStarted || sevenSunsPausedForWhiteout) return;
        sevenSunsPlaybackToken++;
        sevenSunsPlayPending = false;
        sevenSunsPausedForWhiteout = true;
        sevenSunsResumePending = false;
        cancelSevenSunsFade();
        try {
            sevenSuns.pause();
        } catch (_) {}
    }
    function resumeSevenSunsAfterWhiteout() {
        if (!active || !sevenSuns || !sevenSunsStarted || sevenSunsPlayPending) return;
        sevenSunsPausedForWhiteout = false;
        sevenSunsResumePending = true;
        sevenSunsPlayPending = true;
        const token = ++sevenSunsPlaybackToken;
        cancelSevenSunsFade();
        sevenSuns.volume = 0;
        const onStarted = () => {
            if (token !== sevenSunsPlaybackToken || !active || sevenSunsPausedForWhiteout) return;
            sevenSunsPlayPending = false;
            sevenSunsResumePending = false;
            fadeSevenSuns(SEVEN_SUNS_VOLUME, 650);
        };
        const onBlocked = () => {
            if (token !== sevenSunsPlaybackToken || !active) return;
            sevenSunsPlayPending = false;
            sevenSunsResumePending = true;
        };
        try {
            Promise.resolve(sevenSuns.play()).then(onStarted, onBlocked);
        } catch (_) {
            onBlocked();
        }
    }
    function ensureSevenSunsFinalePlayback() {
        if (!sevenSuns || !active || !sevenSunsStarted || sevenSunsPausedForWhiteout || sevenSunsPlayPending || !sevenSunsResumePending) return;
        resumeSevenSunsAfterWhiteout();
    }
    function startSevenSuns() {
        if (sevenSunsStarted || !sevenSuns) return;
        sevenSunsStarted = true;
        if (anEnding1) fadeAudio(anEnding1, 0, 850, {
            stopAtEnd: true
        });
        try {
            sevenSuns.volume = 0;
            sevenSuns.currentTime = 0;
        } catch (_) {}
        safePlay(sevenSuns, 0, false);
        sevenSunsPlaybackToken++;
        sevenSunsPlayPending = false;
        sevenSunsPausedForWhiteout = false;
        sevenSunsResumePending = false;
        fadeSevenSuns(SEVEN_SUNS_VOLUME, 1250);
    }
    function floweySpritePath(filename) {
        return "assets/art/flowey/" + filename;
    }
    function loadFloweyImage(filename) {
        if (floweyImageCache.has(filename)) return floweyImageCache.get(filename);
        let resolveLoad;
        const loadPromise = new Promise(resolve => {
            resolveLoad = resolve;
        });
        const record = {
            loaded: false,
            failed: false,
            image: new Image,
            promise: loadPromise
        };
        record.image.onload = () => {
            record.loaded = true;
            resolveLoad(record);
        };
        record.image.onerror = () => {
            record.failed = true;
            resolveLoad(record);
        };
        record.image.src = floweySpritePath(filename);
        floweyImageCache.set(filename, record);
        if (record.image.complete && record.image.naturalWidth > 0 && !record.loaded) {
            record.loaded = true;
            resolveLoad(record);
        }
        return record;
    }
    function setFloweySprite(filename) {
        if (!floweySprite) return;
        const requestId = ++floweySpriteRequestId;
        const record = loadFloweyImage(filename);
        if (record.loaded) {
            floweySprite.src = record.image.src;
            return;
        }
        if (record.failed) return;
        const display = () => {
            if (requestId !== floweySpriteRequestId || !record.loaded || !floweySprite) return;
            floweySprite.src = record.image.src;
        };
        record.image.addEventListener("load", display, {
            once: true
        });
    }
    function currentFloweyExpression() {
        return FLOWEY_EXPRESSIONS[floweyExpression] || FLOWEY_EXPRESSIONS.nice;
    }
    function hideFloweyFaceOverlay() {
        floweyOverlayRequestId++;
        if (!floweyFaceOverlay) return;
        floweyFaceOverlay.classList.remove("visible");
        floweyFaceOverlay.removeAttribute("src");
    }
    function showFloweyFaceOverlay(source) {
        if (!floweyFaceOverlay) return;
        const requestId = ++floweyOverlayRequestId;
        const record = loadFloweyImage(source);
        const display = () => {
            if (requestId !== floweyOverlayRequestId || !record.loaded || !floweyFaceOverlay) return;
            floweyFaceOverlay.src = record.image.src;
            floweyFaceOverlay.classList.add("visible");
        };
        if (record.loaded) {
            display();
            return;
        }
        if (record.failed) return;
        record.image.addEventListener("load", display, {
            once: true
        });
    }
    function hideFloweyMouthOverlay() {
        floweyMouthOverlayRequestId++;
        if (!floweyMouthOverlay) return;
        floweyMouthOverlay.classList.remove("visible");
        floweyMouthOverlay.removeAttribute("src");
    }
    function showFloweyMouthOverlay(source) {
        if (!floweyMouthOverlay) return;
        const requestId = ++floweyMouthOverlayRequestId;
        const record = loadFloweyImage(source);
        const display = () => {
            if (requestId !== floweyMouthOverlayRequestId || !record.loaded || !floweyMouthOverlay) return;
            floweyMouthOverlay.src = record.image.src;
            floweyMouthOverlay.classList.add("visible");
        };
        if (record.loaded) {
            display();
            return;
        }
        if (record.failed) return;
        record.image.addEventListener("load", display, {
            once: true
        });
    }
    function renderFloweyExpressionRest() {
        if (!floweyEntered || floweyRising) return;
        const expression = currentFloweyExpression();
        hideFloweyMouthOverlay();
        if (expression.staticFace) {
            setFloweySprite("spr_floweyplain_0.png");
            showFloweyFaceOverlay(expression.staticFace);
            return;
        }
        if (expression.overlayFrames) {
            setFloweySprite("spr_floweyplain_0.png");
            showFloweyFaceOverlay(expression.overlayFrames[0]);
            return;
        }
        if (expression.restFrame) {
            hideFloweyFaceOverlay();
            setFloweySprite(expression.restFrame);
            return;
        }
        hideFloweyFaceOverlay();
        if (expression.frames) setFloweySprite(expression.frames[0]);
    }
    function setFloweyExpression(expressionName, {restartTalking: restartTalking = false} = {}) {
        if (!FLOWEY_EXPRESSIONS[expressionName]) return;
        floweyExpression = expressionName;
        if (restartTalking && typing) {
            startFloweyTalking();
            return;
        }
        renderFloweyExpressionRest();
    }
    function applyMessageExpression(message) {
        const expression = FLOWEY_MESSAGE_EXPRESSIONS.get(message);
        if (expression) setFloweyExpression(expression);
    }
    function applyMessageSegmentExpression(message, characterPosition) {
        const segments = FLOWEY_MESSAGE_SEGMENTS.get(message);
        if (!segments) return;
        segments.forEach(segment => {
            const position = message.indexOf(segment.at);
            if (position >= 0 && characterPosition === position) setFloweyExpression(segment.expression, {
                restartTalking: true
            });
        });
    }
    function applyFinalMessageExpression(message) {
        const segments = FLOWEY_MESSAGE_SEGMENTS.get(message);
        if (segments && segments.length) {
            setFloweyExpression(segments[segments.length - 1].expression);
            return;
        }
        applyMessageExpression(message);
    }
    function stopFloweyTalking() {
        clearInterval(floweyTalkTimer);
        floweyTalkTimer = null;
        floweyTalkFrame = 0;
        floweyLastTalkStepAt = 0;
        renderFloweyExpressionRest();
    }
    function startFloweyTalking() {
        clearInterval(floweyTalkTimer);
        floweyTalkTimer = null;
        floweyTalkFrame = 0;
        floweyLastTalkStepAt = 0;
        hideFloweyMouthOverlay();
        if (!floweyEntered || floweyRising || !floweySprite) return;
        const expression = currentFloweyExpression();
        if (FLOWEY_NO_MOUTH_MESSAGES.has(currentMessage())) {
            renderFloweyExpressionRest();
            return;
        }
        if (expression.overlayFrames) {
            setFloweySprite("spr_floweyplain_0.png");
            showFloweyFaceOverlay(expression.overlayFrames[0]);
            return;
        }
        if (expression.talkOverlayFrames) {
            setFloweySprite("spr_floweyplain_0.png");
            showFloweyFaceOverlay(expression.talkOverlayFrames[0]);
            return;
        }
        if (expression.borrowedMouthFrames) {
            renderFloweyExpressionRest();
            return;
        }
        if (expression.frames) {
            hideFloweyFaceOverlay();
            setFloweySprite(expression.frames[0]);
            return;
        }
        renderFloweyExpressionRest();
    }
    function stepFloweyTalking(character) {
        if (!active || !typing || !floweyEntered || floweyRising || !floweySprite) return;
        if (!character || /\s/.test(character)) return;
        const now = performance.now();
        if (floweyLastTalkStepAt && now - floweyLastTalkStepAt < FLOWEY_TALK_STEP_MIN_MS) return;
        floweyLastTalkStepAt = now;
        const expression = currentFloweyExpression();
        if (FLOWEY_NO_MOUTH_MESSAGES.has(currentMessage())) return;
        floweyTalkFrame = floweyTalkFrame === 0 ? 1 : 0;
        if (expression.overlayFrames) {
            setFloweySprite("spr_floweyplain_0.png");
            showFloweyFaceOverlay(expression.overlayFrames[floweyTalkFrame]);
            return;
        }
        if (expression.talkOverlayFrames) {
            setFloweySprite("spr_floweyplain_0.png");
            showFloweyFaceOverlay(expression.talkOverlayFrames[floweyTalkFrame]);
            return;
        }
        if (expression.borrowedMouthFrames) {
            const borrowed = expression.borrowedMouthFrames[floweyTalkFrame];
            if (borrowed) showFloweyMouthOverlay(borrowed); else hideFloweyMouthOverlay();
            return;
        }
        if (!expression.frames) return;
        hideFloweyMouthOverlay();
        hideFloweyFaceOverlay();
        setFloweySprite(expression.frames[floweyTalkFrame]);
    }
    async function preloadFloweySprites() {
        const sources = new Set([ ...FLOWEY_RISE_FRAMES, "spr_floweyplain_0.png" ]);
        Object.values(FLOWEY_EXPRESSIONS).forEach(expression => {
            if (expression.frames) expression.frames.forEach(source => sources.add(source));
            if (expression.overlayFrames) expression.overlayFrames.forEach(source => sources.add(source));
            if (expression.talkOverlayFrames) expression.talkOverlayFrames.forEach(source => sources.add(source));
            if (expression.borrowedMouthFrames) expression.borrowedMouthFrames.forEach(source => {
                if (source) sources.add(source);
            });
            if (expression.talkFrames) expression.talkFrames.forEach(source => sources.add(source));
            if (expression.restFrame) sources.add(expression.restFrame);
            if (expression.staticFace) sources.add(expression.staticFace);
        });
        const records = Array.from(sources).map(filename => loadFloweyImage(filename));
        await Promise.all(records.map(record => record.promise));
    }
    async function riseFlowey() {
        if (floweyEntered || floweyRising || !floweySprite) return;
        floweyRising = true;
        for (let index = 0; index < FLOWEY_RISE_FRAMES.length; index++) {
            if (!active) {
                floweyRising = false;
                return;
            }
            setFloweySprite(FLOWEY_RISE_FRAMES[index]);
            await wait(FLOWEY_RISE_FRAME_MS);
        }
        if (!active) {
            floweyRising = false;
            return;
        }
        floweyEntered = true;
        floweyRising = false;
        floweyExpression = "nice";
        renderFloweyExpressionRest();
    }
    function currentMessage() {
        return MESSAGES[messageIndex] || "";
    }
    function playFloweyBlip(character) {
        if (!character || /\s/.test(character)) return;
        const now = performance.now();
        if (now - lastBlipAt < 28) return;
        lastBlipAt = now;
        const base = floweyTalk1;
        if (!base) return;
        try {
            const voice = base.cloneNode(true);
            voice.volume = 0.54;
            const attempt = voice.play();
            if (attempt !== void 0) attempt.catch(() => {});
        } catch (_) {}
    }
    function setFloweyShaking(shouldShake) {
        if (floweyShaking === shouldShake) return;
        floweyShaking = shouldShake;
        clearInterval(floweyShakeTimer);
        floweyShakeTimer = null;
        floweyShakeStep = 0;
        if (!floweyWrap) return;
        if (!shouldShake) {
            floweyWrap.style.setProperty("--page6-flowey-shake-x", "0px");
            floweyWrap.style.setProperty("--page6-flowey-shake-y", "0px");
            return;
        }
        const OFFSETS = [ [ 0, 0 ], [ 2, -1 ], [ -2, 1 ], [ 1, 2 ], [ -1, -2 ], [ 2, 1 ], [ -2, -1 ] ];
        floweyShakeTimer = setInterval(() => {
            if (!floweyWrap) return;
            const offset = OFFSETS[floweyShakeStep % OFFSETS.length];
            floweyShakeStep++;
            floweyWrap.style.setProperty("--page6-flowey-shake-x", `${offset[0]}px`);
            floweyWrap.style.setProperty("--page6-flowey-shake-y", `${offset[1]}px`);
        }, 55);
    }
    function showDialogue() {
        if (dialogue) dialogue.classList.add("visible");
    }
    function hideDialogue() {
        if (dialogue) dialogue.classList.remove("visible");
    }
    function clearDialogue() {
        if (dialogueText) dialogueText.textContent = "";
    }
    function playOminousWhiteoutCue() {
        if (!active) return;
        try {
            const cue = new Audio("assets/sounds/snd_ominous.wav");
            cue.preload = "auto";
            cue.volume = 1;
            const attempt = cue.play();
            if (attempt !== void 0) attempt.catch(() => {});
        } catch (_) {}
    }
    function applyCueForMessage(message) {
        if (message === "H-hey! What's going on?!") pauseSevenSunsForWhiteout();
        const shitIndex = MESSAGES.indexOf("Shit! Hey, Nic! Remember when mom asked you why you like your glass filled up all the way to the top?!");
        const weirdRouteStartIndex = MESSAGES.indexOf("H-hey! What's going on?!");
        if (weirdRouteStartIndex >= 0 && shitIndex >= 0 && messageIndex >= weirdRouteStartIndex && messageIndex < shitIndex) pauseSevenSunsForWhiteout();
        if (messageIndex >= shitIndex && shitIndex >= 0) if (message.startsWith("Shit! Hey, Nic!")) resumeSevenSunsAfterWhiteout(); else ensureSevenSunsFinalePlayback();
        if (WHITE_CUES.has(message) && whitewash) {
            const opacity = WHITE_CUES.get(message);
            playOminousWhiteoutCue();
            whitewash.style.opacity = String(opacity);
            if (opacity >= 1 && root) root.classList.add("final-white");
        }
    }
    function finishCurrentMessage() {
        clearTimeout(typeTimer);
        typeTimer = null;
        if (dialogueText) dialogueText.textContent = currentMessage();
        characterIndex = currentMessage().length;
        typing = false;
        applyFinalMessageExpression(currentMessage());
        stopFloweyTalking();
    }
    function typeCurrentMessage() {
        if (!active || transitioning) return;
        const message = currentMessage();
        applyCueForMessage(message);
        const shakingNow = FLOWEY_SHAKE_MESSAGES.has(message);
        if (shakingNow) setFloweyExpression("l3_4"); else applyMessageExpression(message);
        setFloweyShaking(shakingNow);
        clearDialogue();
        showDialogue();
        characterIndex = 0;
        typing = true;
        startFloweyTalking();
        function typeNext() {
            if (!active || transitioning) return;
            if (characterIndex >= message.length) {
                typing = false;
                typeTimer = null;
                applyFinalMessageExpression(message);
                stopFloweyTalking();
                return;
            }
            applyMessageSegmentExpression(message, characterIndex);
            const character = message[characterIndex];
            if (dialogueText) dialogueText.textContent += character;
            stepFloweyTalking(character);
            playFloweyBlip(character);
            characterIndex++;
            typeTimer = setTimeout(typeNext, fastTextHeld ? FAST_TYPE_SPEED_MS : TYPE_SPEED_MS);
        }
        typeNext();
    }
    async function bringFloweyIn() {
        if (floweyEntered || floweyRising || !floweySprite) return;
        hideDialogue();
        await wait(MESSAGE_FADE_MS);
        if (!active) return;
        await riseFlowey();
        await wait(180);
    }
    function buildSouls() {
        if (!soulsRoot || soulElements.length > 0) return;
        SOUL_FILES.forEach((filename, index) => {
            const image = document.createElement("img");
            image.className = "page6-soul";
            image.src = "assets/art/flowey/" + filename;
            image.alt = "";
            image.draggable = false;
            image.dataset.index = String(index);
            image.style.opacity = "0";
            soulsRoot.appendChild(image);
            soulElements.push(image);
        });
    }
    function soulOrbitRadius() {
        if (!root) return 230;
        return Math.min(300, Math.max(205, Math.min(root.clientWidth, root.clientHeight) * 0.245));
    }
    function drawSoulsAt(radius, orbitRotation = 0, force = false) {
        const frame = Math.floor(performance.now() / VISUAL_FRAME_MS);
        if (!force && frame === lastSoulDrawFrame) return;
        lastSoulDrawFrame = frame;
        const count = soulElements.length;
        if (!count || !root || !floweyWrap) return;
        const rootRect = root.getBoundingClientRect();
        const floweyRect = floweyWrap.getBoundingClientRect();
        const centerX = floweyRect.left - rootRect.left + floweyRect.width / 2;
        const centerY = floweyRect.top - rootRect.top + floweyRect.height / 2;
        soulElements.forEach((soul, index) => {
            const baseAngle = -Math.PI / 2 + Math.PI * 2 * index / count;
            const angle = baseAngle + orbitRotation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius * 0.84;
            soul.style.left = `${Math.round(x)}px`;
            soul.style.top = `${Math.round(y)}px`;
            soul.style.transform = "translate(-50%, -50%)";
        });
    }
    function startSoulOrbit() {
        if (soulsOrbiting || soulElements.length === 0) return;
        soulsOrbiting = true;
        orbitStart = performance.now();
        soulElements.forEach(soul => soul.classList.add("orbiting"));
        const radius = soulOrbitRadius();
        function frame(now) {
            if (!active || !soulsOrbiting) {
                orbitFrame = null;
                return;
            }
            const rotation = (now - orbitStart) * 0.000545;
            drawSoulsAt(radius, rotation);
            orbitFrame = requestAnimationFrame(frame);
        }
        orbitFrame = requestAnimationFrame(frame);
    }
    async function revealSouls() {
        if (soulsRevealed) return;
        soulsRevealed = true;
        if (anEnding1) fadeAudio(anEnding1, 0, SOUL_EMERGE_MS, {
            stopAtEnd: true
        });
        endingMusicStarted = false;
        buildSouls();
        soulElements.forEach(soul => {
            soul.style.opacity = "1";
        });
        const startAt = performance.now();
        const targetRadius = soulOrbitRadius();
        await new Promise(resolve => {
            function frame(now) {
                if (!active) {
                    resolve();
                    return;
                }
                const progress = Math.min(1, (now - startAt) / SOUL_EMERGE_MS);
                const c1 = 1.70158;
                const c3 = c1 + 1;
                const t = progress - 1;
                const eased = 1 + c3 * t * t * t + c1 * t * t;
                drawSoulsAt(targetRadius * eased, 0, progress >= 1);
                if (progress < 1) {
                    requestAnimationFrame(frame);
                    return;
                }
                resolve();
            }
            requestAnimationFrame(frame);
        });
        if (active) startSoulOrbit();
    }
    async function moveToNextMessage() {
        if (!active || transitioning) return;
        const previous = currentMessage();
        transitioning = true;
        hideDialogue();
        await wait(MESSAGE_FADE_MS);
        if (!active) {
            transitioning = false;
            return;
        }
        if (previous === "You're all so annoying.") startEndingExcerpt();
        if (previous === "They shouldn't even be back here, we set them free.") startSevenSuns();
        if (previous === "They did.") {
            await revealSouls();
            await wait(310);
        }
        messageIndex++;
        transitioning = false;
        typeCurrentMessage();
    }
    async function advanceDialogue() {
        if (!active || transitioning) return;
        if (typing) {
            finishCurrentMessage();
            return;
        }
        if (messageIndex === 0 && !floweyEntered) {
            transitioning = true;
            await bringFloweyIn();
            if (!active) {
                transitioning = false;
                return;
            }
            messageIndex = 1;
            transitioning = false;
            typeCurrentMessage();
            return;
        }
        if (messageIndex >= MESSAGES.length - 1) {
            if (window.ForNicNavigation && typeof window.ForNicNavigation.openPage === "function") window.ForNicNavigation.openPage(7);
            return;
        }
        await moveToNextMessage();
    }
    function onKeyDown(event) {
        if (!active) return;
        const key = event.key.toLowerCase();
        if (key === "x") {
            fastTextHeld = true;
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if (key !== "z" && key !== "enter" && key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        ensureSevenSunsFinalePlayback();
        advanceDialogue();
    }
    function onKeyUp(event) {
        if (event.key.toLowerCase() === "x") fastTextHeld = false;
    }
    function attachInput() {
        window.addEventListener("keydown", onKeyDown, true);
        window.addEventListener("keyup", onKeyUp, true);
    }
    function detachInput() {
        window.removeEventListener("keydown", onKeyDown, true);
        window.removeEventListener("keyup", onKeyUp, true);
    }
    function resetSceneState() {
        clearTimeout(typeTimer);
        clearTimeout(openingTimer);
        clearInterval(floweyTalkTimer);
        clearInterval(floweyShakeTimer);
        typeTimer = null;
        openingTimer = null;
        floweyTalkTimer = null;
        floweyShakeTimer = null;
        floweyShaking = false;
        floweyShakeStep = 0;
        if (orbitFrame !== null) {
            cancelAnimationFrame(orbitFrame);
            orbitFrame = null;
        }
        messageIndex = 0;
        characterIndex = 0;
        typing = false;
        transitioning = false;
        fastTextHeld = false;
        floweyEntered = false;
        floweyRising = false;
        floweyExpression = "nice";
        floweyTalkFrame = 0;
        floweyLastTalkStepAt = 0;
        soulsRevealed = false;
        soulsOrbiting = false;
        orbitStart = 0;
        lastSoulDrawFrame = -1;
        endingMusicStarted = false;
        sevenSunsStarted = false;
        sevenSunsPlaybackToken++;
        sevenSunsPlayPending = false;
        sevenSunsPausedForWhiteout = false;
        sevenSunsResumePending = false;
        cancelSevenSunsFade();
        lastBlipAt = 0;
        hideFloweyFaceOverlay();
        hideFloweyMouthOverlay();
        if (floweyWrap) {
            floweyWrap.style.setProperty("--page6-flowey-shake-x", "0px");
            floweyWrap.style.setProperty("--page6-flowey-shake-y", "0px");
        }
        setFloweySprite(FLOWEY_RISE_FRAMES[0]);
        soulElements.forEach(soul => soul.remove());
        soulElements = [];
        clearDialogue();
        hideDialogue();
        if (whitewash) whitewash.style.opacity = "0";
        if (root) root.classList.remove("final-white");
    }
    function hideOtherScenes() {
        const sceneIds = [ "eram-page3", "page5-stage" ];
        sceneIds.forEach(id => {
            const scene = document.getElementById(id);
            if (!scene) return;
            scene.classList.remove("visible");
            scene.style.display = "none";
        });
        const undertaleStage = document.getElementById("undertale-stage");
        if (undertaleStage) {
            undertaleStage.classList.remove("active");
            undertaleStage.style.display = "none";
        }
        const game = document.getElementById("game");
        if (game) game.style.display = "none";
        const cursor = document.getElementById("heart-cursor");
        if (cursor) cursor.style.display = "none";
    }
    async function waitForImage(image) {
        if (!image) return;
        if (image.complete && image.naturalWidth > 0) return;
        await new Promise(resolve => {
            const finish = () => {
                image.removeEventListener("load", finish);
                image.removeEventListener("error", finish);
                resolve();
            };
            image.addEventListener("load", finish, {
                once: true
            });
            image.addEventListener("error", finish, {
                once: true
            });
        });
    }
    async function start({onReady: onReady = null} = {}) {
        cacheElements();
        ensureAudio();
        if (!root) return;
        active = true;
        document.body.classList.add("page6-active");
        hideOtherScenes();
        resetSceneState();
        buildSouls();
        await preloadFloweySprites();
        if (!active) return;
        root.style.display = "block";
        root.classList.remove("visible");
        await waitForImage(floweySprite);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        if (!active) return;
        root.classList.add("visible");
        attachInput();
        if (typeof onReady === "function") try {
            onReady();
        } catch (_) {}
        openingTimer = setTimeout(() => {
            if (active && messageIndex === 0) typeCurrentMessage();
        }, OPENING_DELAY_MS);
    }
    function stop() {
        cacheElements();
        active = false;
        document.body.classList.remove("page6-active");
        detachInput();
        clearInterval(floweyTalkTimer);
        floweyTalkTimer = null;
        floweyTalkFrame = 0;
        hideFloweyFaceOverlay();
        hideFloweyMouthOverlay();
        clearTimeout(typeTimer);
        clearTimeout(openingTimer);
        typeTimer = null;
        openingTimer = null;
        if (orbitFrame !== null) {
            cancelAnimationFrame(orbitFrame);
            orbitFrame = null;
        }
        soulsOrbiting = false;
        sevenSunsPlaybackToken++;
        sevenSunsPlayPending = false;
        sevenSunsPausedForWhiteout = false;
        sevenSunsResumePending = false;
        cancelSevenSunsFade();
        safeStop(anEnding1);
        safeStop(sevenSuns);
        safeStop(floweyTalk1);
        safeStop(ominousCue);
        if (root) {
            root.classList.remove("visible", "final-white");
            root.style.display = "none";
        }
        if (whitewash) whitewash.style.opacity = "0";
        hideDialogue();
    }
    async function transitionFromPage5() {
        const token = navigationToken();
        const overlay = document.getElementById("page-transition-white");
        if (overlay) {
            overlay.style.transition = "opacity 0.92s ease-in-out";
            overlay.classList.add("visible");
        }
        await wait(980);
        if (!navigationStillCurrent(token)) return;
        if (window.Page5Scene && typeof window.Page5Scene.stop === "function") window.Page5Scene.stop();
        let readyResolve;
        const ready = new Promise(resolve => {
            readyResolve = resolve;
        });
        const startPromise = start({
            onReady: readyResolve
        });
        if (startPromise && typeof startPromise.catch === "function") startPromise.catch(() => readyResolve());
        await Promise.race([ ready, wait(3000) ]);
        if (!navigationStillCurrent(token)) return;
        await wait(100);
        if (overlay) {
            overlay.style.transition = "opacity 0.82s ease-in-out";
            requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.remove("visible")));
            await wait(900);
            overlay.style.transition = "";
        }
    }
    window.Page6Scene = {
        start: start,
        stop: stop,
        transitionFromPage5: transitionFromPage5
    };
})();
