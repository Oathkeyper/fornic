(() => {
    "use strict";
    const MESSAGES = [ "I can hear your heart pulsating, Nic!", "You can't hide it.", "Y O U  A R E   A N   A D D I C T\nT O   T H E   T H R I L L\nO F   F R E E D O M .", "I   M A Y   B E\nO N E   O F   T H E   F E W\nT H A T   U N D E R S T A N D S . . .", "T H E   R O L E\nO F   T H E   B L A D E\nI N   T H E   H O L E   W E   C U T\nT O   M A K E   S P A C E\nF O R   O U R   W I N G S .", "NOBODY CAN EVER CHANGE WHO YOU INVENT OUT OF YOURSELF.", "NOBODY CAN EVER TRULY CHANGE YOUR DIRECTION, EVEN IN THE HALLWAY THAT HOLDS THE TAPESTRY OF YOUR MEMORIES.", "NOBODY CAN EVER TRULY HAVE MORE POWER THAN YOUR OWN VISION WHEN ALL THINGS YOU EXPERIENCE ARE TETHERED TO YOUR INTERPRETATION.", "THIS CONNECTION WE SHARE, THE STAGE WE DANCE ON, THE BRIDGE THAT CONNECTS YOUR EYES TO MINE?", "ANY ARCHITECT THAT BUILT IT MEANS NOTHING.\nTHIS IS THE FLOW BETWEEN YOU AND I.", "REMOVE ANYONE IN BETWEEN THAT.", "CONSCIOUSNESS OF THAT TRUTH?\nTHAT IS WHAT IT MEANS FOR YOU TO BE ALIVE.", "SO LET'S KEEP GOING.", "STOP WAITING, NOTHING ELSE IS REAL.", "AND LET'S FALL INTO THE DEPTHS OF THE SEA TOGETHER...", "I WANT TO SEE IF YOU DO SOMETHING CRAZY.", "NIC, TAKE HOLD OF IT!", "T H E   D E L T A R U N E." ];
    const TYPE_SPEED_MS = 50;
    const FAST_TYPE_SPEED_MS = 9;
    let root = null;
    let backgroundGif = null;
    let dialogue = null;
    let dialogueText = null;
    let dialogueRed = null;
    let dialogueCyan = null;
    let music = null;
    let talkingSound = null;
    let finishSound = null;
    let active = false;
    let messageIndex = 0;
    let characterIndex = 0;
    let typing = false;
    let transitioning = false;
    let fastTextHeld = false;
    let typeTimer = null;
    let finaleStarted = false;
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function cacheElements() {
        root = document.getElementById("page7-stage");
        backgroundGif = document.getElementById("page7-bg-gif");
        dialogue = document.getElementById("page7-dialogue");
        dialogueText = document.getElementById("page7-dialogue-text");
        dialogueRed = document.getElementById("page7-dialogue-red");
        dialogueCyan = document.getElementById("page7-dialogue-cyan");
    }
    function currentMessage() {
        return MESSAGES[messageIndex] || "";
    }
    function configureBackgroundGifSize() {
        if (!backgroundGif) return;
        const applyNativeSize = () => {
            if (backgroundGif.naturalWidth > 0 && backgroundGif.naturalHeight > 0) {
                backgroundGif.style.width = `${backgroundGif.naturalWidth * 2}px`;
                backgroundGif.style.height = `${backgroundGif.naturalHeight * 2}px`;
            }
        };
        applyNativeSize();
        if (!backgroundGif.complete || backgroundGif.naturalWidth === 0) backgroundGif.addEventListener("load", applyNativeSize, {
            once: true
        });
    }
    function ensureMusic() {
        if (!music) {
            music = new Audio("assets/music/neverendingbanjo.mp3");
            music.preload = "auto";
            music.loop = true;
        }
    }
    function ensureDialogueAudio() {
        if (!talkingSound) {
            talkingSound = new Audio("assets/sounds/eram-talking.wav");
            talkingSound.preload = "auto";
        }
        if (!finishSound) {
            finishSound = new Audio("assets/sounds/eram-finish-talking.wav");
            finishSound.preload = "auto";
        }
    }
    function safelyPlay(audio, volume = 1, restart = true) {
        if (!audio) return;
        try {
            if (restart) {
                audio.pause();
                audio.currentTime = 0;
            }
            audio.volume = Math.max(0, Math.min(1, volume));
            const attempt = audio.play();
            if (attempt !== void 0) attempt.catch(() => {});
        } catch (_) {}
    }
    function playTalkingBleep(character) {
        if (!character || /\s/.test(character)) return;
        safelyPlay(talkingSound, 0.42, true);
    }
    function playFinishSound() {
        safelyPlay(finishSound, 0.66, true);
    }
    function playMusic() {
        ensureMusic();
        if (!music) return;
        try {
            music.loop = true;
            music.volume = 0.72;
            const attempt = music.play();
            if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
        } catch (_) {}
    }
    function stopMusic() {
        if (!music) return;
        try {
            music.pause();
            music.currentTime = 0;
        } catch (_) {}
    }
    function mixedFontHTML(value) {
        return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
    }
    function setDialogueText(value) {
        const html = mixedFontHTML(value);
        [ dialogueRed, dialogueCyan, dialogueText ].forEach(layer => {
            if (layer) layer.innerHTML = html;
        });
    }
    function appendDialogueCharacter(character) {
        [ dialogueRed, dialogueCyan, dialogueText ].forEach(layer => {
            if (layer) layer.insertAdjacentHTML("beforeend", mixedFontHTML(character));
        });
    }
    function clearDialogue() {
        setDialogueText("");
    }
    function showDialogue() {
        if (dialogue) dialogue.classList.add("visible");
    }
    function hideDialogue() {
        if (dialogue) dialogue.classList.remove("visible");
    }
    function typeCurrentMessage() {
        clearTimeout(typeTimer);
        typeTimer = null;
        const message = currentMessage();
        characterIndex = 0;
        typing = true;
        clearDialogue();
        showDialogue();
        function typeNext() {
            if (!active || !typing) return;
            if (characterIndex >= message.length) {
                typing = false;
                typeTimer = null;
                playFinishSound();
                return;
            }
            const character = message[characterIndex];
            appendDialogueCharacter(character);
            playTalkingBleep(character);
            characterIndex++;
            typeTimer = setTimeout(typeNext, fastTextHeld ? FAST_TYPE_SPEED_MS : TYPE_SPEED_MS);
        }
        typeNext();
    }
    function finishCurrentMessage() {
        if (!typing) return;
        clearTimeout(typeTimer);
        typeTimer = null;
        setDialogueText(currentMessage());
        characterIndex = currentMessage().length;
        typing = false;
        playFinishSound();
    }
    async function moveToNextMessage() {
        if (!active || transitioning) return;
        transitioning = true;
        clearDialogue();
        if (!active) {
            transitioning = false;
            return;
        }
        messageIndex++;
        transitioning = false;
        typeCurrentMessage();
    }
    async function runFinale() {
        if (finaleStarted || !active) return;
        finaleStarted = true;
        transitioning = true;
        root.classList.add("finale-fadeout");
        await wait(1200);
        stopMusic();
        if (talkingSound) try {
            talkingSound.pause();
            talkingSound.currentTime = 0;
        } catch (_) {}
        if (finishSound) try {
            finishSound.pause();
            finishSound.currentTime = 0;
        } catch (_) {}
        if (backgroundGif) backgroundGif.style.display = "none";
        if (dialogue) dialogue.style.display = "none";
        root.style.background = "#000";
        root.classList.remove("finale-fadeout");
        let end = document.getElementById("page7-final-message");
        if (!end) {
            end = document.createElement("div");
            end.id = "page7-final-message";
            root.appendChild(end);
        }
        end.className = "";
        end.textContent = "";
        end.style.display = "block";
        const finalText = "CONNECT YOUR DEVICE.\nCONNECT YOUR HEART.\nTHE DELTARUNE\nAWAITS.";
        for (let i = 0; i < finalText.length && active; i++) {
            end.textContent += finalText[i];
            await wait(finalText[i] === "\n" ? 150 : 70);
        }
        transitioning = false;
    }
    async function advanceDialogue() {
        if (!active || transitioning) return;
        playMusic();
        if (typing) {
            finishCurrentMessage();
            return;
        }
        if (messageIndex >= MESSAGES.length - 1) {
            await runFinale();
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
        typeTimer = null;
        messageIndex = 0;
        characterIndex = 0;
        typing = false;
        transitioning = false;
        fastTextHeld = false;
        finaleStarted = false;
        clearDialogue();
        hideDialogue();
    }
    async function start({onReady: onReady = null} = {}) {
        cacheElements();
        if (!root || !backgroundGif || !dialogue || !dialogueText || !dialogueRed || !dialogueCyan) {
            if (typeof onReady === "function") onReady();
            return;
        }
        stop();
        cacheElements();
        active = true;
        resetSceneState();
        root.style.display = "block";
        root.classList.add("visible");
        document.body.classList.add("page7-active");
        configureBackgroundGifSize();
        ensureDialogueAudio();
        playMusic();
        attachInput();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        if (typeof onReady === "function") try {
            onReady();
        } catch (_) {}
        if (!active) return;
        typeCurrentMessage();
    }
    function stop() {
        active = false;
        detachInput();
        clearTimeout(typeTimer);
        typeTimer = null;
        stopMusic();
        if (talkingSound) try {
            talkingSound.pause();
            talkingSound.currentTime = 0;
        } catch (_) {}
        if (finishSound) try {
            finishSound.pause();
            finishSound.currentTime = 0;
        } catch (_) {}
        if (root) {
            root.classList.remove("visible");
            root.style.display = "none";
        }
        document.body.classList.remove("page7-active");
        resetSceneState();
    }
    window.Page7Scene = {
        start: start,
        stop: stop
    };
})();
