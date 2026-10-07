(() => {
    "use strict";

    const gate =
        document.getElementById(
            "name-gate"
        );

    const connected =
        document.getElementById(
            "name-gate-connected"
        );

    const entry =
        document.getElementById(
            "name-gate-entry"
        );

    const value =
        document.getElementById(
            "name-gate-value"
        );


    if (
        !gate ||
        !connected ||
        !entry ||
        !value
    ) {
        return;
    }


    const MAX_LENGTH =
        12;

    let phase =
        "connected";

    let typed =
        "";

    let finished =
        false;


    let fullscreenRequested =
        false;


    function requestGateFullscreen() {
        if (
            fullscreenRequested ||
            document.fullscreenElement
        ) {
            return;
        }

        fullscreenRequested =
            true;

        const request =
            document.documentElement
                .requestFullscreen;

        if (
            typeof request !==
            "function"
        ) {
            return;
        }

        try {
            const result =
                request.call(
                    document.documentElement
                );

            if (
                result &&
                typeof result.catch ===
                    "function"
            ) {
                result.catch(
                    () => {
                        /* Browser may deny fullscreen. */
                    }
                );
            }
        } catch (_) {}
    }


    function wait(ms) {
        return new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    ms
                )
        );
    }


    function renderName() {
        const shown =
            typed
                .toUpperCase();

        const blanks =
            "_".repeat(
                Math.max(
                    0,
                    MAX_LENGTH -
                        shown.length
                )
            );

        value.textContent =
            shown +
            blanks;
    }


    async function unlock() {
        if (finished) {
            return;
        }

        finished =
            true;

        gate.classList.add(
            "accepted"
        );


        await wait(
            260
        );


        document.body.classList.remove(
            "name-gate-active"
        );

        gate.remove();


        /*
            IMPORTANT:
            Correctly typing NIC does NOT begin Page 1.

            It only removes the name gate and reveals the website's
            original CLICK TO BEGIN screen underneath. The player must
            still perform the normal first click/title sequence and the
            normal second click that actually starts Gaster/Page 1.
        */
    }


    function reject() {
        if (finished) {
            return;
        }

        finished =
            true;


        /*
            Browsers generally refuse window.close() for a tab the
            user opened manually. Try the real close first; if Chrome
            blocks it, replace the current tab with about:blank so the
            project still immediately disappears.
        */
        try {
            window.open(
                "",
                "_self"
            );

            window.close();
        } catch (_) {}


        setTimeout(
            () => {
                try {
                    window.location.replace(
                        "about:blank"
                    );
                } catch (_) {
                    document.documentElement.innerHTML =
                        "";
                }
            },
            120
        );
    }


    function onKeyDown(event) {
        if (
            !document.body.classList.contains(
                "name-gate-active"
            )
        ) {
            return;
        }


        /*
            The first typed key is a real user gesture, so use it to
            request fullscreen for the connection/name opener.
        */
        requestGateFullscreen();


        /*
            Capture and consume ALL input while the gate is active.
            This prevents Enter, number shortcuts, F/M, etc. from
            leaking into the real site behind the opener.
        */
        event.preventDefault();
        event.stopImmediatePropagation();


        if (
            phase !==
                "entry" ||
            finished
        ) {
            return;
        }


        if (
            event.key ===
            "Backspace"
        ) {
            typed =
                typed.slice(
                    0,
                    -1
                );

            renderName();

            return;
        }


        if (
            event.key ===
            "Enter"
        ) {
            if (
                typed
                    .trim()
                    .toLowerCase() ===
                "nic"
            ) {
                unlock();
            } else {
                reject();
            }

            return;
        }


        if (
            /^[a-zA-Z]$/.test(
                event.key
            ) &&
            typed.length <
                MAX_LENGTH
        ) {
            typed +=
                event.key;

            renderName();
        }
    }


    /*
        Register during capture BEFORE the other page scripts load.
    */
    document.addEventListener(
        "keydown",
        onKeyDown,
        true
    );


    renderName();


    /*
        First terminal beat:
            CONNECTED.
            WELCOME BACK.

        Then switch to the name prompt.
    */
    setTimeout(
        () => {
            if (finished) {
                return;
            }

            connected.classList.add(
                "hidden"
            );

            entry.classList.remove(
                "hidden"
            );

            phase =
                "entry";
        },
        1500
    );
})();
