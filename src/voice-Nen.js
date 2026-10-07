const Voice = (() => {
    const dialogue = document.getElementById("voice-dialogue");
    const depths = document.getElementById("depths-background");

    const TYPING_SPEED = 90;
    const FADE_TIME = 650;
    const TRANSITION_PAUSE = 350;

    /*
        Stops one fast double-click from acting as:
        click 1 = finish the line
        click 2 = immediately skip to the next line.
    */
    const FULL_LINE_LOCK_MS = 300;

    const selectSound =
        new Audio("assets/sounds/select.wav");

    selectSound.preload = "auto";

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


    function playSelectSound() {
        selectSound.pause();
        selectSound.currentTime = 0;
        selectSound.volume = 0.82;

        selectSound.play().catch(() => {
            // The experience still works if audio is unavailable.
        });
    }


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
        /*
            True instant disappearance.
            We do NOT use display:none so the next
            Gaster sequence can reuse this element.
        */
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
        advanceUnlockedAt =
            performance.now() + FULL_LINE_LOCK_MS;
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

                /*
                    Even if the final character naturally
                    appears between two fast clicks, give
                    the completed line a moment before it
                    can advance.
                */
                lockAdvance();
                return;
            }

            dialogue.textContent +=
                message[characterIndex];

            characterIndex++;

            typingTimer = setTimeout(
                typeNextCharacter,
                TYPING_SPEED
            );
        }


        typeNextCharacter();
    }


    function finishCurrentMessage() {
        clearTimeout(typingTimer);

        dialogue.textContent =
            messages[messageIndex];

        characterIndex =
            messages[messageIndex].length;

        isTyping = false;

        /*
            A click used to reveal the full line
            can never also advance it.
        */
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

        /*
            Use the same select.wav feedback as
            the For Lopati website.
        */
        playSelectSound();


        /*
            Ignore extra clicks while a fade/line
            transition is already underway.
        */
        if (isTransitioning) {
            return;
        }


        /*
            FIRST click while typing:
            reveal the COMPLETE current line.
        */
        if (isTyping) {
            finishCurrentMessage();
            return;
        }


        /*
            A very fast second click after revealing
            the line is ignored instead of skipping it.
        */
        if (performance.now() < advanceUnlockedAt) {
            return;
        }


        /*
            SECOND deliberate click:
            move to the next message.
        */
        if (messageIndex < messages.length - 1) {
            isTransitioning = true;

            dialogue.classList.remove("visible");

            setTimeout(() => {
                if (!active) return;

                messageIndex++;
                typeCurrentMessage();

            }, FADE_TIME + TRANSITION_PAUSE);

            return;
        }


        /*
            End of this sequence.

            For the first Gaster section we can keep the
            final line visible so test.wav #1 is the thing
            that actually removes it.
        */
        active = false;
        isTransitioning = false;

        if (!holdLastMessage) {
            dialogue.classList.remove("visible");
        }

        resolveSequence();
    }


    function stopSequence(options = {}) {
        const {
            preserveDialogue = false
        } = options;

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
        const {
            background = true,
            startDelay = 0,
            keepLastMessage = false
        } = options;

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


        /*
            background: true  -> show the Depths
            background: false -> hide the Depths
            background: "keep" -> don't change it
        */
        if (background === true) {
            showDepths();
        } else if (background === false) {
            hideDepths();
        }


        return new Promise((resolve) => {
            finishSequence = resolve;

            /*
                This gives the Depths time to appear
                BEFORE Gaster begins speaking.
            */
            if (startDelay > 0) {
                startTimer = setTimeout(() => {
                    if (active) {
                        typeCurrentMessage();
                    }
                }, startDelay);

                return;
            }

            typeCurrentMessage();
        });
    }


    /*
        Mouse / touch
    */
    document.addEventListener(
        "pointerdown",
        () => {
            if (active) {
                nextMessage();
            }
        }
    );


    /*
        Keyboard
    */
    document.addEventListener(
        "keydown",
        (event) => {
            if (!active) return;

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                nextMessage();
            }
        }
    );


    return {
        runSequence,
        showDepths,
        hideDepths,
        cutDepths,
        hideDialogue,
        cutDialogue,
        stopSequence,
        playSelectSound,
        clear
    };
})();
