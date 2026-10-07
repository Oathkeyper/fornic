const Voice = (() => {
    const dialogue = document.getElementById("voice-dialogue");
    const depths = document.getElementById("depths-background");
    const TYPING_SPEED = 90;
    const FULL_LINE_LOCK_MS = 300;
    let messages = [];
    let messageIndex = 0;
    let characterIndex = 0;
    let typingTimer = null;
    let startTimer = null;
    let isTyping = false;
    let isTransitioning = false;
    let active = false;
    let acceptingInput = false;
    let advanceUnlockedAt = 0;
    let holdLastMessage = false;
    let finishSequence = null;
    function showDepths() {
        depths.style.display = "block";
        depths.style.transition = "opacity 2.5s ease";
        depths.style.opacity = "";
        depths.classList.add("visible");
    }
    function hideDepths() {
        depths.classList.remove("visible");
    }
    function cutDepths() {
        depths.style.transition = "none";
        depths.classList.remove("visible");
        depths.style.opacity = "0";
        depths.style.display = "none";
    }
    function clear() {
        dialogue.textContent = "";
    }
    function hideDialogue() {
        dialogue.classList.remove("visible");
    }
    function cutDialogue() {
        dialogue.style.transition = "none";
        dialogue.style.opacity = "0";
        dialogue.classList.remove("visible");
        dialogue.textContent = "";
    }
    function restoreDialoguePresentation() {
        dialogue.style.display = "block";
        dialogue.style.transition = "opacity 0.65s ease";
        dialogue.style.opacity = "";
    }
    function lockAdvance() {
        advanceUnlockedAt = performance.now() + FULL_LINE_LOCK_MS;
    }
    function typeCurrentMessage() {
        clearTimeout(typingTimer);
        const message = messages[messageIndex];
        restoreDialoguePresentation();
        dialogue.textContent = "";
        dialogue.classList.add("visible");
        characterIndex = 0;
        isTyping = true;
        isTransitioning = false;
        acceptingInput = true;
        advanceUnlockedAt = 0;
        function typeNextCharacter() {
            if (!active) return;
            if (characterIndex >= message.length) {
                isTyping = false;
                lockAdvance();
                return;
            }
            dialogue.textContent += message[characterIndex];
            characterIndex++;
            typingTimer = setTimeout(typeNextCharacter, TYPING_SPEED);
        }
        typeNextCharacter();
    }
    function finishCurrentMessage() {
        clearTimeout(typingTimer);
        dialogue.textContent = messages[messageIndex];
        characterIndex = messages[messageIndex].length;
        isTyping = false;
        lockAdvance();
    }
    function resolveSequence() {
        if (!finishSequence) return;
        const resolve = finishSequence;
        finishSequence = null;
        resolve();
    }
    function nextMessage() {
        if (!active || !acceptingInput) return;
        if (isTransitioning) return;
        if (isTyping) {
            finishCurrentMessage();
            return;
        }
        if (performance.now() < advanceUnlockedAt) return;
        if (messageIndex < messages.length - 1) {
            isTransitioning = true;
            messageIndex++;
            typeCurrentMessage();
            return;
        }
        active = false;
        isTransitioning = false;
        if (!holdLastMessage) dialogue.classList.remove("visible");
        resolveSequence();
    }
    function stopSequence(options = {}) {
        const {preserveDialogue: preserveDialogue = false} = options;
        clearTimeout(typingTimer);
        clearTimeout(startTimer);
        isTyping = false;
        isTransitioning = false;
        acceptingInput = false;
        active = false;
        if (!preserveDialogue) {
            dialogue.classList.remove("visible");
            dialogue.textContent = "";
        }
        resolveSequence();
    }
    function runSequence(newMessages, options = {}) {
        const {background: background = true, startDelay: startDelay = 0, keepLastMessage: keepLastMessage = false} = options;
        clearTimeout(startTimer);
        messages = newMessages;
        messageIndex = 0;
        characterIndex = 0;
        isTyping = false;
        isTransitioning = false;
        acceptingInput = false;
        advanceUnlockedAt = 0;
        holdLastMessage = keepLastMessage;
        active = true;
        if (background === true) showDepths(); else if (background === false) hideDepths();
        return new Promise(resolve => {
            finishSequence = resolve;
            if (startDelay > 0) {
                startTimer = setTimeout(() => {
                    if (active) typeCurrentMessage();
                }, startDelay);
                return;
            }
            typeCurrentMessage();
        });
    }
    document.addEventListener("pointerdown", () => {
        if (active) nextMessage();
    });
    document.addEventListener("keydown", event => {
        if (!active) return;
        if (event.key === "Enter" || event.key === " " || event.key.toLowerCase() === "z") {
            event.preventDefault();
            nextMessage();
        }
    });
    return {
        runSequence: runSequence,
        showDepths: showDepths,
        hideDepths: hideDepths,
        cutDepths: cutDepths,
        hideDialogue: hideDialogue,
        cutDialogue: cutDialogue,
        stopSequence: stopSequence,
        clear: clear
    };
})();
