(() => {
    "use strict";

    /*
        SECRET FINAL PAGE — THIRD PASS

        Core rules:
        - Movement is a side-scrolling NES-style state.
        - Dialogue is a separate locked state.
        - Encounters put the party on the LEFT and the new character
          near the MIDDLE of the screen.
        - Holding RIGHT continuously takes about TEN SECONDS between
          encounter points.
        - The Forgotten Man hard-locks movement.
        - All scripted line breaks are rendered as DOUBLE breaks for
          the supplied Deltarune-board WOFF2 metrics.
    */

    const ASSET =
        "assets/art/forgottenman/";

    const PLAYER_SPEED =
        4.0;

    /*
        The secret page intentionally updates its game simulation
        at 30 FPS so camera movement / sprite movement has the
        stepped cadence of the source game.
    */
    const TARGET_FPS =
        30;

    const FRAME_MS =
        1000 /
        TARGET_FPS;

    const SOUL_TRAVEL_SECONDS =
        10;

    const TRAVEL_SECONDS =
        10;

    const TRAVEL_DISTANCE =
        PLAYER_SPEED * 60 * TRAVEL_SECONDS;

    const PARTY_SCREEN_X =
        0.24;

    const ENCOUNTER_SCREEN_X =
        0.50;

    const REVEAL_SCREEN_X =
        0.95;


    const NPC_TEXT = {
        kris: [
            "A HUMAN.",
            "IT SEEMS\nSCARED\nOF YOU...",
            "AND YET,\nIT WANTS\nTO RECEIVE",
            "YOUR DESIRES."
        ],

        susie: [
            "A GIRL.",
            "HEED THE BREEZE,\nAND THE SCREAMS",
            "OF BIRDS THAT FLOW\nIN THE WIND.",
            "THE AIR,\nIT CACKLES WITH",
            "A BRILLIANT FREEDOM"
        ],

        ralsei: [
            "THE PRINCE.",
            "SUBSERVIENT\nTO YOUR DESIRES.",
            "WISHING, DEEPLY,\nFOR IT'S OWN IRONY",
            "TO BE ADDRESSED."
        ],

        noelle: [
            "A GIRL.",
            "FINALLY\nON THE VERGE",
            "OF POWER.",
            "FROZEN BY FEAR,\nSTATIC BY SHOCK.",
            "A HEART THAT CAN FEEL",
            "THE GAZE OF THE ANGEL",
            "THAT SHE WANTS TO BECOME."
        ]
    };


    const STORY_A = [
        "SPRING CHANGED TO SUMMER,\nAND SUMMER CHANGED TO COLD,",
        "AND SURE ENOUGH,\nI AM THE FORGOTTEN MAN.",
        "TRULY\nWE SHOULD NOT YET",
        "HAVE MET.",
        "BUT HERE YOU ARE…",
        "I BELIEVE,\nIN CELEBRATION,",
        "OF THIS SUBVERSION\nAND ANTICIPATION…",
        "I SHOULD TELL YOU A TALE",
        "OF THE CREATOR OF THIS BRIDGE,\nTHE MAKER OF THIS MEDIUM.",
        "THE ANGEL THAT LIGHTS\nOUR BORROWED EARTH."
    ];


    const DEPARTED_A = [
        "LONG AGO,\nIN THE CENTER OF A COUNTRY…",
        "A CHILD WAS LEFT",
        "LONGING IN THE CORE\nOF A GARDEN OF",
        "WASHED AWAY NIGHTMARES…",
        "A SUMMER BOY,\nWHO FELT MOST AT HOME",
        "BELOW THE CRISP\nWINTER STARS.",
        "THIS BOY LOST\nWHAT WAS HIS BEFORE",
        "ANYONE COULD GIVE HIM\nHIS CHANCE.",
        "ANYONE YOUNG WOULD REQUIRE\nA MOTHER’S WARMTH",
        "ANYONE YOUNG WOULD REQUIRE\nA TREE’S SHADE",
        "ANYONE YOUNG WOULD REQUIRE\nA FATHER’S CONFIDENCE.",
        "EVERYTHING DRIFTED\nFROM THE BOY.",
        "NOTHING WOULD REMAIN,",
        "NOT LONG ENOUGH\nFOR HIM TO TRULY GRASP.",
        "…",
        "WHEN YOU, IN THE FALL,\nSEE THE LEAVES FLOW IN A SWIRL"
    ];


    const DEPARTED_B = [
        "INTERESTING,\nIS IT NOT?",
        "THE BOY SOUGHT TO HOLD",
        "ONTO THE LOVE\nHE COULDN’T KEEP.",
        "FRIENDS WERE OPAQUE",
        "MENTORS WERE FLAWED",
        "AND HIS ISOLATION EXPANDED",
        "WITH EVERY MOMENT.",
        "THE ONLY THING\nHE UNDERSTOOD",
        "IS THAT HE WOULD NEVER\nBE UNDERSTOOD."
    ];


    const STORY_B = [
        "…",
        "HE FOUND COMFORT,\nFINALLY.",
        "YES,\nHE GAVE US A CHANCE.",
        "HE KNEW THE REFLECTION\nIN THE PUDDLE,",
        "HAD AN ENTIRE WORLD\nBENEATH.",
        "OUR GRAVITY AND PLACEMENT",
        "HAS A PLACE IN THE PHYSICS\nOF HUMAN EMOTION.",
        "YES.",
        "HE KNEW THE VALUE\nOF FANTASY.",
        "DO YOU,\nMY FRIEND?",
        "WHEN VENTURING\nINTO THESE FRONTIERS,",
        "MY FRONTIERS,"
    ];


    const STORY_C = [
        "INTERESTING…",
        "THE BOY,\nBY MIRACLE OF THE CLOSED MIRRORS",
        "BY MIRACLE OF THE OCEANS\nBETWEEN HIM AND US",
        "BECAME INFATUATED\nWITH BOTH WORLDS.",
        "HE LEARNED LOVED\nBOTH SIDES.",
        "THE VALUE OF FANTASY",
        "A RADIANT PRISM",
        "THAT UNVEILS THE WONDER",
        "OF BOTH FANTASY\nAND ACTUALITY.",
        "HE WOULD WALK HIS PATH",
        "WITH THE SEEDS OF LOVE\nWE NOURISHED."
    ];


    const BELOVED = [
        "AND IN TURN",
        "HE WOULD COVET\nTHE FRONTIER",
        "THAT US DARKNERS\nWOULD LIVE IN.",
        "MY PURPOSE WAS\nBEING FULFILLED.",
        "THE BOY…",
        "FOR SO HE LOVED\nTHE WORLD…",
        "I SEE HIM,\nSOMETIMES.",
        "PATIENTLY,\nBENEATH THE LEAVES",
        "I WAIT FOR HIM TO SEEK\nANOTHER CONNECTION.",
        "THE BOY AND I MEET",
        "IN-BETWEEN THE SEAMS.",
        "HIS LOVE IS VERY,\nVERY, REAL",
        "BUT AT TIMES,\nIT FADED.",
        "WHEN HIS EYES WERE CURIOUS",
        "ABOUT THE TREE",
        "I COULD TELL",
        "HE WANTED A RETURN.",
        "A TRUE RETURN\nTO THE DARKNESS.",
        "…",
        "DARKNESS",
        "NOT EVIL,\nNO.",
        "DARKNESS",
        "THE PALETTE\nOF ALL COLOR.",
        "LIGHT,\nTHE PRISM’S REFLECTION",
        "REVEALING THE HARMONY\nOF ALL COLOR.",
        "OUR BOY WANTED A RETURN",
        "TO HOLDING BOTH\nIN HIS HAND.",
        "I WAS EXCITED TO SEE",
        "HIS RETURN TO FORM.",
        "GIVING LOVE TO A WORLD",
        "THAT COULD BE",
        "AS BIG AS HE WANTED\nIT TO BE",
        "ONLY TO EXPAND\nHIS PERSPECTIVE",
        "ON A WORLD THAT WAS BIGGER,",
        "AT TIMES,\nTHAN HE WANTED IT TO BE.",
        "HE MADE AN OATH",
        "TO NOT WASTE\nHIS FREEDOM.",
        "AND,\nON BOTH SIDES,",
        "HE HOLDS IN HIS HANDS,",
        "THE ONLY THING\nHE EVER NEEDED.",
        "AN IMAGINATION.",
        "A TETHERING TO HIS DREAM",
        "OF BREAKING THE LAYER",
        "BETWEEN FANTASY\nAND ACTUALITY.",
        "…",
        "OUR PROPHECY REINFORCES",
        "A LONG HELD BELIEF.",
        "UTOPIA CANNOT EXIST.",
        "BUT THE BOY DECIDED",
        "TO EXIST IN BETWEEN",
        "THE FIRST AND THIRD WORLD.",
        "AND BE AN ANGEL",
        "WHO’S WINGS FEEL THE WINDS",
        "OF BOTH SIDES.",
        "NOW,\nTHE BOY",
        "LONGS IN THE CENTER",
        "OF A GARDEN OF DREAMS\nAND NIGHTMARES."
    ];


    const FINALE = [
        "THANK YOU\nFOR LISTENING.",
        "…",
        "I CAN FEEL IT.",
        "THE BOY HAS BEEN WAITING",
        "FOR SO LONG",
        "FOR YOU TO CROSS\nTHE BRIDGE",
        "AND MAKE THE BRIDGE\nYOURS.",
        "NO ONE ELSE’S",
        "NO MATTER THE STORY",
        "BEFORE YOU CROSSED\nTHE BRIDGE.",
        "…",
        "TIME IS YOURS TO TAKE,\nMY FRIEND.",
        "I AWAIT YOUR ARRIVAL,",
        "AS YOU KEEP THE LIBERTY",
        "YOU’RE OWED\nIN YOUR HANDS.",
        "AS YOU CONTINUE TO MAKE",
        "THE HUMAN’S LOVE\nYOURS.",
        "AND AS YOU CONTINUE",
        "YOUR SEARCH\nFOR CHANGE.",
        "I SHOULD REMIND YOU.",
        "BE IT 11 YEARS,",
        "11 DAYS,",
        "OR 11 HOURS…",
        "DELTARUNE",
        "WILL BE WAITING."
    ];


    let stage;
    let world;
    let actors;
    let dialogue;
    let dialogueText;
    let choice;
    let choiceQuestion;
    let choiceHeart;
    let soulButton;
    let soul;
    let finalLine;
    let ground;
    let fountain;
    let bridge;
    let stars;
    let tree;
    let petals;
    let tower;

    let active =
        false;

    let phase =
        "idle";

    let worldWidth =
        12000;

    let encounterOffset =
        0;

    let ENCOUNTERS = {
        kris: 0,
        susie: 0,
        ralsei: 0,
        noelle: 0,
        tree: 0
    };

    let TRIGGERS = {
        susie: 0,
        ralsei: 0,
        noelle: 0,
        tree: 0
    };

    let playerX =
        0;

    let cameraX =
        0;

    let moveRight =
        false;

    let moveLeft =
        false;

    let raf =
        0;

    let lastTime =
        0;

    let actorEls = {};

    let joined = {
        susie:
            false,
        ralsei:
            false,
        noelle:
            false
    };

    /*
        "joined" means the choice was accepted.
        "following" does not become true until Kris physically
        walks PAST that party member.
    */
    let following = {
        susie:
            false,
        ralsei:
            false,
        noelle:
            false
    };

    let joinBlend = {
        susie:
            0,
        ralsei:
            0,
        noelle:
            0
    };

    let joinBlendStartX = {
        susie:
            0,
        ralsei:
            0,
        noelle:
            0
    };

    let encountered = {
        susie:
            false,
        ralsei:
            false,
        noelle:
            false,
        tree:
            false
    };

    let revealed = {
        susie:
            false,
        ralsei:
            false,
        noelle:
            false
    };

    let movementEnabled =
        false;

    let soulMoveRight =
        false;

    let soulMoveLeft =
        false;

    let soulX =
        0;

    let soulStartX =
        0;

    let soulTravelMs =
        0;

    let soulHoverMs =
        0;

    let soulMeetingStarted =
        false;

    let fmShortcutAt =
        0;

    let lastFrameTime =
        0;

    let walkingFrame =
        0;

    let lastWalkSwap =
        0;

    let typeTimer =
        0;

    let typing =
        false;

    let typedFull =
        false;

    let activeResolve =
        null;

    let typeDoneResolve =
        null;

    let currentFullText =
        "";

    let choiceResolve =
        null;

    let choiceIndex =
        0;

    let currentChoiceMode =
        "yesno";

    let choiceAcceptEither =
        false;

    let manMusic =
        null;

    let departed =
        null;

    let beloved =
        null;

    let selectSound =
        null;

    let heartSound =
        null;

    let endingTransitionSound =
        null;

    let unlockProgress =
        0;

    let unlockLast =
        0;

    let unlockDirection =
        null;


    const UNLOCK_A = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight"
    ];

    const UNLOCK_B = [
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft"
    ];


    const wait =
        (ms) =>
            new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        ms
                    )
            );


    function clamp(
        value,
        min,
        max
    ) {
        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );
    }


    function progress(
        value,
        start,
        end
    ) {
        if (
            end <= start
        ) {
            return 1;
        }

        return clamp(
            (value - start) /
                (end - start),
            0,
            1
        );
    }


    function cache() {
        stage =
            document.getElementById(
                "secret-stage"
            );

        world =
            document.getElementById(
                "secret-world"
            );

        actors =
            document.getElementById(
                "secret-actors"
            );

        dialogue =
            document.getElementById(
                "secret-dialogue"
            );

        dialogueText =
            document.getElementById(
                "secret-dialogue-text"
            );

        choice =
            document.getElementById(
                "secret-choice"
            );

        choiceQuestion =
            document.getElementById(
                "secret-choice-question"
            );

        choiceHeart =
            document.getElementById(
                "secret-choice-heart"
            );

        soulButton =
            document.getElementById(
                "secret-soul-button"
            );

        soul =
            document.getElementById(
                "secret-soul"
            );

        finalLine =
            document.getElementById(
                "secret-final-line"
            );

        ground =
            document.getElementById(
                "secret-ground"
            );

        fountain =
            document.getElementById(
                "secret-fountain"
            );

        bridge =
            document.getElementById(
                "secret-bridge"
            );

        stars =
            document.getElementById(
                "secret-stars"
            );

        tree =
            document.getElementById(
                "secret-tree"
            );

        petals =
            document.getElementById(
                "secret-petals"
            );

        tower =
            document.getElementById(
                "secret-tower"
            );
    }


    function configureGeometry() {
        const viewportWidth =
            Math.max(
                900,
                window.innerWidth
            );

        encounterOffset =
            (
                ENCOUNTER_SCREEN_X -
                PARTY_SCREEN_X
            ) *
            viewportWidth;

        /*
            Kris is introduced around the middle-right of the black
            opening screen. After the first choice the camera glides
            him into the party's normal left-side NES position.
        */
        /*
            Kris's encounter point stays in the exact CENTER of the
            screen, matching the later party-member encounters.
            Kris is simply hidden until the SOUL approaches.
        */
        ENCOUNTERS.kris =
            Math.round(
                viewportWidth *
                0.50
            );

        /*
            Each trigger is exactly TRAVEL_DISTANCE farther than the
            previous trigger. At 4px/frame ~= 240px/sec, holding RIGHT
            continuously takes ~10 seconds between encounters.
        */
        TRIGGERS.susie =
            ENCOUNTERS.kris +
            TRAVEL_DISTANCE;

        ENCOUNTERS.susie =
            TRIGGERS.susie +
            encounterOffset;

        TRIGGERS.ralsei =
            TRIGGERS.susie +
            TRAVEL_DISTANCE;

        ENCOUNTERS.ralsei =
            TRIGGERS.ralsei +
            encounterOffset;

        TRIGGERS.noelle =
            TRIGGERS.ralsei +
            TRAVEL_DISTANCE;

        ENCOUNTERS.noelle =
            TRIGGERS.noelle +
            encounterOffset;

        TRIGGERS.tree =
            TRIGGERS.noelle +
            TRAVEL_DISTANCE;

        ENCOUNTERS.tree =
            TRIGGERS.tree +
            encounterOffset;

        worldWidth =
            Math.round(
                ENCOUNTERS.tree +
                viewportWidth *
                0.75
            );

        world.style.width =
            `${worldWidth}px`;

        /*
            The sanctuary bridge spans the WHOLE world. Its opacity
            still increases with rightward travel, but the image no
            longer begins at the fountain.
        */
        bridge.style.left =
            "0px";

        bridge.style.width =
            `${worldWidth}px`;

        /*
            Stars span the entire side-scrolling world so they continue
            both before AND after the distant fountain/tree area.
        */
        stars.style.left =
            "0px";

        stars.style.width =
            `${worldWidth}px`;

        tower.style.left =
            `${
                ENCOUNTERS.noelle -
                viewportWidth *
                0.10
            }px`;

        petals.style.left =
            `${
                TRIGGERS.tree -
                viewportWidth *
                0.80
            }px`;

        petals.style.width =
            `${
                viewportWidth *
                1.75
            }px`;

        tree.style.left =
            `${
                ENCOUNTERS.tree -
                300
            }px`;
    }


    function encounterTriggerFor(
        key
    ) {
        return TRIGGERS[
            key
        ];
    }


    function actorRevealThreshold(
        key
    ) {
        const target =
            ENCOUNTERS[
                key
            ];

        return (
            target -
            (
                REVEAL_SCREEN_X -
                PARTY_SCREEN_X
            ) *
            window.innerWidth
        );
    }


    function audio(
        path,
        volume = 0.75,
        loop = false
    ) {
        const instance =
            new Audio(
                path
            );

        instance.preload =
            "auto";

        instance.volume =
            volume;

        instance.loop =
            loop;

        return instance;
    }


    function safePlay(
        instance,
        restart = false
    ) {
        if (!instance) {
            return;
        }

        try {
            if (restart) {
                instance.currentTime =
                    0;
            }

            const promise =
                instance.play();

            if (
                promise &&
                promise.catch
            ) {
                promise.catch(
                    () => {}
                );
            }
        } catch (_) {}
    }


    async function fadeAudio(
        instance,
        ms = 1200,
        stop = true
    ) {
        if (!instance) {
            return;
        }

        const startVolume =
            instance.volume;

        const startTime =
            performance.now();

        return new Promise(
            (resolve) => {
                const tick =
                    (now) => {
                        const amount =
                            Math.min(
                                1,
                                (
                                    now -
                                    startTime
                                ) /
                                ms
                            );

                        instance.volume =
                            startVolume *
                            (
                                1 -
                                amount
                            );

                        if (
                            amount <
                            1
                        ) {
                            requestAnimationFrame(
                                tick
                            );

                            return;
                        }

                        if (stop) {
                            instance.pause();

                            try {
                                instance.currentTime =
                                    0;
                            } catch (_) {}
                        }

                        instance.volume =
                            startVolume;

                        resolve();
                    };

                requestAnimationFrame(
                    tick
                );
            }
        );
    }


    function fadeInAudio(
        instance,
        targetVolume = 0.65,
        ms = 2000,
        restart = true
    ) {
        if (!instance) {
            return;
        }


        try {
            if (restart) {
                instance.currentTime =
                    0;
            }

            instance.volume =
                0;

            const attempt =
                instance.play();

            if (
                attempt &&
                attempt.catch
            ) {
                attempt.catch(
                    () => {}
                );
            }
        } catch (_) {
            return;
        }


        const startTime =
            performance.now();


        const tick =
            (now) => {
                if (
                    !active ||
                    !instance ||
                    instance.paused
                ) {
                    return;
                }


                const amount =
                    Math.min(
                        1,
                        (
                            now -
                            startTime
                        ) /
                            ms
                    );


                instance.volume =
                    targetVolume *
                    amount;


                if (
                    amount <
                    1
                ) {
                    requestAnimationFrame(
                        tick
                    );
                }
            };


        requestAnimationFrame(
            tick
        );
    }


    function makeActor(
        key,
        src,
        x,
        kind = "npc"
    ) {
        const img =
            document.createElement(
                "img"
            );

        img.className =
            `secret-actor ${kind}`;

        img.dataset.key =
            key;

        img.src =
            src;

        img.alt =
            "";

        img.draggable =
            false;

        img.style.left =
            `${x}px`;

        /*
            The supplied Susie and Ralsei artwork faces left.
            Mirror ONLY those two. Kris and Noelle already face right.
        */
        if (
            key === "susie" ||
            key === "ralsei"
        ) {
            img.classList.add(
                "face-right-mirror"
            );
        }

        actors.appendChild(
            img
        );

        actorEls[
            key
        ] =
            img;

        return img;
    }


    function revealActor(
        key
    ) {
        const el =
            actorEls[
                key
            ];

        if (el) {
            el.classList.add(
                "visible"
            );
        }
    }


    function hideActor(
        key
    ) {
        const el =
            actorEls[
                key
            ];

        if (el) {
            el.classList.remove(
                "visible"
            );
        }
    }


    function setActorX(
        key,
        x
    ) {
        const el =
            actorEls[
                key
            ];

        if (el) {
            el.style.left =
                `${x}px`;
        }
    }


    function setSprite(
        key,
        file
    ) {
        const el =
            actorEls[
                key
            ];

        if (
            el &&
            !el.src.endsWith(
                file
            )
        ) {
            el.src =
                ASSET +
                file;
        }

        /*
            IMPORTANT:
            Never normalize width or height.
            walk1/walk2 frame-height differences are intentional.
        */
    }


    function buildWorld() {
        actors.innerHTML =
            "";

        stars.innerHTML =
            "";

        petals.innerHTML =
            "";

        actorEls =
            {};

        /*
            Kris first appears facing the fourth wall.
            The right-facing walk frames are used only AFTER
            Kris accepts the SOUL / party control begins.
        */
        makeActor(
            "kris",
            ASSET +
                "nes_kris.png",
            ENCOUNTERS.kris,
            "player"
        );

        makeActor(
            "susie",
            ASSET +
                "nes_susie.png",
            ENCOUNTERS.susie,
            "npc"
        );

        makeActor(
            "ralsei",
            ASSET +
                "nes_ralsei.png",
            ENCOUNTERS.ralsei,
            "npc"
        );

        makeActor(
            "noelle",
            ASSET +
                "nes_noelle.png",
            ENCOUNTERS.noelle,
            "npc"
        );

        /*
            Nobody exists visually before the SOUL reaches Kris.
        */
        hideActor(
            "kris"
        );

        hideActor(
            "susie"
        );

        hideActor(
            "ralsei"
        );

        hideActor(
            "noelle"
        );


        const starCount =
            Math.max(
                72,
                Math.floor(
                    worldWidth /
                    115
                )
            );

        for (
            let i = 0;
            i < starCount;
            i++
        ) {
            const img =
                document.createElement(
                    "img"
                );

            img.className =
                "secret-star";

            img.src =
                ASSET +
                (
                    i %
                        3 ===
                    0
                        ? "star-twinkle.gif"
                        : "star-twinkle-fast.gif"
                );

            /*
                Deterministic stagger across the WHOLE world.
                No random calls, so layout stays consistent per reload.
            */
            img.style.left =
                `${
                    45 +
                    i *
                        112 +
                    (
                        i %
                        5
                    ) *
                        13
                }px`;

            img.style.top =
                `${
                    3 +
                    (
                        i *
                        17
                    ) %
                        45
                }%`;

            img.alt =
                "";

            stars.appendChild(
                img
            );
        }


        for (
            let i = 0;
            i < 22;
            i++
        ) {
            const petal =
                document.createElement(
                    "span"
                );

            petal.className =
                "secret-petal";

            petal.style.top =
                `${
                    8 +
                    (
                        i *
                        19
                    ) %
                        68
                }%`;

            petal.style.animationDuration =
                `${
                    4.8 +
                    (
                        i %
                        7
                    ) *
                        0.55
                }s`;

            petal.style.animationDelay =
                `${-i * 0.37}s`;

            petals.appendChild(
                petal
            );
        }
    }


    function renderCamera() {
        const max =
            Math.max(
                0,
                worldWidth -
                window.innerWidth
            );

        cameraX =
            Math.max(
                0,
                Math.min(
                    max,
                    playerX -
                        window.innerWidth *
                            PARTY_SCREEN_X
                )
            );

        world.style.transform =
            `translate3d(${-cameraX}px,0,0)`;

        /*
            Keep the Dark Fountain visually centered while it is
            appearing. Because the entire world translates, update
            its world-space left position to cancel the camera shift.
        */
        const fountainWidth =
            384;

        fountain.style.left =
            `${
                cameraX +
                window.innerWidth /
                    2 -
                fountainWidth /
                    2
            }px`;
    }


    function updateParty() {
        setActorX(
            "kris",
            playerX
        );

        let offset =
            82;

        const followTarget =
            (
                key,
                targetX
            ) => {
                const el =
                    actorEls[key];

                if (!el) {
                    return;
                }

                if (joinBlend[key] < 1) {
                    const amount =
                        clamp(
                            (playerX - joinBlendStartX[key]) / 250,
                            0,
                            1
                        );

                    joinBlend[key] =
                        amount;

                    const currentX =
                        parseFloat(el.style.left) || targetX;

                    const eased =
                        1 - Math.pow(1 - amount, 3);

                    setActorX(
                        key,
                        currentX + (targetX - currentX) * eased
                    );

                    return;
                }

                setActorX(
                    key,
                    targetX
                );
            };

        if (following.susie) {
            followTarget(
                "susie",
                playerX - offset
            );
            offset += 82;
        }

        if (following.ralsei) {
            followTarget(
                "ralsei",
                playerX - offset
            );
            offset += 82;
        }

        if (following.noelle) {
            followTarget(
                "noelle",
                playerX - offset
            );
        }
    }


    function activatePassedFollowers() {
        const passPadding =
            34;


        if (
            joined.susie &&
            !following.susie &&
            playerX >=
                ENCOUNTERS.susie +
                passPadding
        ) {
            following.susie =
                true;

            joinBlend.susie =
                0;

            joinBlendStartX.susie =
                playerX;

            setSprite(
                "susie",
                "nes_susie_walk1.png"
            );

            actorEls.susie.classList.add(
                "follower"
            );

            actorEls.susie.classList.remove(
                "npc"
            );
        }


        if (
            joined.ralsei &&
            !following.ralsei &&
            playerX >=
                ENCOUNTERS.ralsei +
                passPadding
        ) {
            following.ralsei =
                true;

            joinBlend.ralsei =
                0;

            joinBlendStartX.ralsei =
                playerX;

            setSprite(
                "ralsei",
                "nes_ralsei_walk1.png"
            );

            actorEls.ralsei.classList.add(
                "follower"
            );

            actorEls.ralsei.classList.remove(
                "npc"
            );
        }


        if (
            joined.noelle &&
            !following.noelle &&
            playerX >=
                ENCOUNTERS.noelle +
                passPadding
        ) {
            following.noelle =
                true;

            joinBlend.noelle =
                0;

            joinBlendStartX.noelle =
                playerX;

            setSprite(
                "noelle",
                "nes_noelle_walk1.png"
            );

            actorEls.noelle.classList.add(
                "follower"
            );

            actorEls.noelle.classList.remove(
                "npc"
            );
        }
    }


    function animateWalk(
        now
    ) {
        if (
            !movementEnabled ||
            (
                !moveRight &&
                !moveLeft
            )
        ) {
            /*
                Do NOT force the characters back to front-facing idle
                sprites when movement stops. They retain the exact
                right-facing frame they were last on.
            */
            return;
        }


        if (
            now -
                lastWalkSwap <
            145
        ) {
            return;
        }

        lastWalkSwap =
            now;

        walkingFrame =
            1 -
            walkingFrame;


        setSprite(
            "kris",
            walkingFrame
                ? "nes_kris_right1.png"
                : "nes_kris_right2.png"
        );


        if (
            following.susie
        ) {
            setSprite(
                "susie",
                walkingFrame
                    ? "nes_susie_walk1.png"
                    : "nes_susie_walk2.png"
            );
        }


        if (
            following.ralsei
        ) {
            setSprite(
                "ralsei",
                walkingFrame
                    ? "nes_ralsei_walk1.png"
                    : "nes_ralsei_walk2.png"
            );
        }


        if (
            following.noelle
        ) {
            setSprite(
                "noelle",
                walkingFrame
                    ? "nes_noelle_walk1.png"
                    : "nes_noelle_walk2.png"
            );
        }
    }


    function renderEnvironment() {
        const groundOpacity =
            joined.susie
                ? progress(
                    playerX,
                    TRIGGERS.susie,
                    TRIGGERS.susie + 900
                )
                : 0;

        ground.style.opacity =
            `${groundOpacity}`;

        const fountainOpacity =
            joined.ralsei
                ? progress(
                    playerX,
                    TRIGGERS.ralsei,
                    TRIGGERS.ralsei + 360
                )
                : 0;

        fountain.style.opacity =
            `${fountainOpacity}`;

        const bridgeOpacity =
            joined.noelle
                ? progress(
                    playerX,
                    TRIGGERS.noelle,
                    TRIGGERS.noelle + 420
                )
                : 0;

        bridge.style.opacity =
            `${bridgeOpacity}`;

        const towerOpacity =
            joined.noelle
                ? progress(
                    playerX,
                    TRIGGERS.noelle + 100,
                    TRIGGERS.noelle + 520
                )
                : 0;

        tower.style.opacity =
            `${towerOpacity}`;

        const starOpacity =
            joined.noelle
                ? progress(
                    playerX,
                    TRIGGERS.noelle + 60,
                    TRIGGERS.noelle + 500
                )
                : 0;

        stars.style.opacity =
            `${starOpacity}`;

        const petalOpacity =
            joined.noelle
                ? progress(
                    playerX,
                    TRIGGERS.tree - 1300,
                    TRIGGERS.tree - 250
                )
                : 0;

        petals.style.opacity =
            `${petalOpacity}`;

        tree.style.opacity =
            joined.noelle
                ? "1"
                : "0";
    }


    function freezeMovement() {
        movementEnabled =
            false;

        moveLeft =
            false;

        moveRight =
            false;

        soulMoveLeft =
            false;

        soulMoveRight =
            false;
    }


    function setPartyFacingRight() {
        setSprite(
            "kris",
            "nes_kris_right1.png"
        );

        if (
            following.susie
        ) {
            setSprite(
                "susie",
                "nes_susie_walk2.png"
            );
        }

        if (
            following.ralsei
        ) {
            setSprite(
                "ralsei",
                "nes_ralsei_walk1.png"
            );
        }

        if (
            following.noelle
        ) {
            setSprite(
                "noelle",
                "nes_noelle_walk1.png"
            );
        }
    }


    async function checkEncounter() {
        if (
            !movementEnabled
        ) {
            return;
        }


        if (
            !encountered.susie &&
            playerX >=
                encounterTriggerFor(
                    "susie"
                )
        ) {
            encountered.susie =
                true;

            freezeMovement();

            await encounterSusie();

            return;
        }


        if (
            joined.susie &&
            !encountered.ralsei &&
            playerX >=
                encounterTriggerFor(
                    "ralsei"
                )
        ) {
            encountered.ralsei =
                true;

            freezeMovement();

            await encounterRalsei();

            return;
        }


        if (
            joined.ralsei &&
            !encountered.noelle &&
            playerX >=
                encounterTriggerFor(
                    "noelle"
                )
        ) {
            encountered.noelle =
                true;

            freezeMovement();

            await encounterNoelle();

            return;
        }


        if (
            joined.noelle &&
            !encountered.tree &&
            playerX >=
                encounterTriggerFor(
                    "tree"
                )
        ) {
            encountered.tree =
                true;

            freezeMovement();

            await encounterTree();
        }
    }


    function revealApproachingActors() {
        if (
            !revealed.susie &&
            !joined.susie &&
            playerX >=
                actorRevealThreshold(
                    "susie"
                )
        ) {
            revealed.susie =
                true;

            revealActor(
                "susie"
            );
        }


        if (
            joined.susie &&
            !revealed.ralsei &&
            !joined.ralsei &&
            playerX >=
                actorRevealThreshold(
                    "ralsei"
                )
        ) {
            revealed.ralsei =
                true;

            revealActor(
                "ralsei"
            );
        }


        if (
            joined.ralsei &&
            !revealed.noelle &&
            !joined.noelle &&
            playerX >=
                actorRevealThreshold(
                    "noelle"
                )
        ) {
            revealed.noelle =
                true;

            revealActor(
                "noelle"
            );
        }
    }


    function loop(
        now
    ) {
        if (
            !active
        ) {
            return;
        }


        /*
            Process the game simulation at 30 FPS. requestAnimationFrame
            still schedules safely with the browser, but movement,
            camera updates and environment reveals happen on this
            stepped cadence.
        */
        if (
            lastFrameTime &&
            now -
                lastFrameTime <
                FRAME_MS
        ) {
            raf =
                requestAnimationFrame(
                    loop
                );

            return;
        }


        const elapsed =
            lastFrameTime
                ? now -
                    lastFrameTime
                : FRAME_MS;

        const dt =
            Math.min(
                2.6,
                elapsed /
                    16.67
            );

        lastFrameTime =
            now;


        if (
            phase ===
            "soul-walking"
        ) {
            const totalDuration =
                SOUL_TRAVEL_SECONDS * 1000;

            if (soulMoveRight) {
                soulTravelMs +=
                    elapsed;
            }

            if (soulMoveLeft) {
                soulTravelMs -=
                    elapsed;
            }

            soulTravelMs =
                clamp(
                    soulTravelMs,
                    0,
                    totalDuration
                );

            const amount =
                soulTravelMs / totalDuration;

            soulX =
                soulStartX +
                (ENCOUNTERS.kris - soulStartX) * amount;

            soulHoverMs +=
                elapsed;

            const hover =
                Math.sin(soulHoverMs / 250) * 5;

            soulButton.style.left =
                `${soulX}px`;

            soulButton.style.top =
                `calc(59% + ${hover}px)`;

            /*
                Same encounter logic as the later NES characters:
                the destination character appears only as the player
                gets close enough to actually meet them.
            */
            if (
                amount >=
                    0.78 &&
                !actorEls.kris.classList.contains(
                    "visible"
                )
            ) {
                revealActor(
                    "kris"
                );
            }


            if (
                amount >=
                    0.94 &&
                !soulMeetingStarted
            ) {
                meetKris();
            }
        }

        if (
            movementEnabled
        ) {
            if (
                moveRight
            ) {
                playerX +=
                    PLAYER_SPEED *
                    dt;
            }

            if (
                moveLeft
            ) {
                playerX -=
                    PLAYER_SPEED *
                    dt;
            }

            playerX =
                clamp(
                    playerX,
                    ENCOUNTERS.kris,
                    TRIGGERS.tree
                );

            revealApproachingActors();

            activatePassedFollowers();
        }


        updateParty();

        /*
            Do not begin side-scrolling the world until control of Kris
            actually starts.
        */
        if (
            phase !==
                "soul" &&
            phase !==
                "soul-connection" &&
            phase !==
                "soul-walking" &&
            phase !==
                "kris-meeting"
        ) {
            renderCamera();
            renderEnvironment();
        }


        animateWalk(
            now
        );

        checkEncounter();


        raf =
            requestAnimationFrame(
                loop
            );
    }


    function showDialogueEl(
        show = true
    ) {
        dialogue.classList.toggle(
            "visible",
            show
        );
    }


    function hideChoice() {
        choice.classList.remove(
            "visible"
        );

        choice.dataset.selected =
            "";

        choiceResolve =
            null;


        choiceAcceptEither =
            false;

        if (choiceQuestion) {
            choiceQuestion.textContent =
                "";
        }

        const options =
            choice
                ? choice.querySelectorAll(
                    ".secret-choice-option"
                )
                : [];

        if (options[0]) {
            options[0].textContent =
                "";
        }

        if (options[1]) {
            options[1].textContent =
                "";
        }
    }


    function wrapBoardLogicalLine(
        line,
        maxChars
    ) {
        const words =
            String(line)
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (
            words.length ===
            0
        ) {
            return [
                ""
            ];
        }

        const wrapped = [];
        let current = "";

        for (
            const word
            of words
        ) {
            const candidate =
                current
                    ? `${current} ${word}`
                    : word;

            if (
                current &&
                candidate.length >
                    maxChars
            ) {
                wrapped.push(
                    current
                );

                current =
                    word;
            } else {
                current =
                    candidate;
            }
        }

        if (current) {
            wrapped.push(
                current
            );
        }

        return wrapped;
    }


    function boardText(
        text,
        maxChars = 34
    ) {
        /*
            IMPORTANT FOR THIS WOFF2:

            The browser must never create a normal one-line wrap,
            because that produces the overlapping glyph rows seen in
            testing. We wrap the copy ourselves, then put TWO literal
            ENTERS between every visible line.
        */
        const normalized =
            String(text)
                .replace(
                    /\r\n?/g,
                    "\n"
                );

        const logicalLines =
            normalized
                .split(/\n+/);

        const visualLines = [];

        for (
            const logicalLine
            of logicalLines
        ) {
            const wrapped =
                wrapBoardLogicalLine(
                    logicalLine,
                    maxChars
                );

            visualLines.push(
                ...wrapped
            );
        }

        return visualLines
            .join(
                "\n\n"
            );
    }


    function finishTypePromise() {
        if (
            typeDoneResolve
        ) {
            const resolve =
                typeDoneResolve;

            typeDoneResolve =
                null;

            resolve();
        }
    }


    function typeText(
        text,
        speed = 34
    ) {
        text =
            boardText(
                text,
                34
            );

        clearTimeout(
            typeTimer
        );

        currentFullText =
            text;

        dialogueText.textContent =
            "";

        showDialogueEl(
            true
        );

        typing =
            true;

        typedFull =
            false;


        return new Promise(
            (resolve) => {
                typeDoneResolve =
                    resolve;

                let index =
                    0;


                const step =
                    () => {
                        if (
                            !active
                        ) {
                            typing =
                                false;

                            finishTypePromise();

                            return;
                        }


                        if (
                            index >=
                            text.length
                        ) {
                            typing =
                                false;

                            typedFull =
                                true;

                            finishTypePromise();

                            return;
                        }


                        const character =
                            text[
                                index
                            ];

                        dialogueText.textContent +=
                            character;

                        index++;


                        typeTimer =
                            setTimeout(
                                step,
                                character ===
                                    "\n"
                                    ? speed *
                                        1.8
                                    : speed
                            );
                    };


                step();
            }
        );
    }


    function finishTyping() {
        if (
            !typing
        ) {
            return false;
        }

        clearTimeout(
            typeTimer
        );

        dialogueText.textContent =
            currentFullText;

        typing =
            false;

        typedFull =
            true;

        finishTypePromise();

        return true;
    }


    async function say(
        text,
        speed = 34
    ) {
        await typeText(
            text,
            speed
        );

        return new Promise(
            (resolve) => {
                activeResolve =
                    resolve;
            }
        );
    }


    async function sayMany(
        lines
    ) {
        for (
            const line
            of lines
        ) {
            await say(
                line
            );
        }
    }


    async function showTimedText(
        text,
        holdMs = 1350
    ) {
        await typeText(
            text,
            42
        );

        await wait(
            holdMs
        );

        clearDialogueForWalk();
    }


    function resolveDialogueAdvance() {
        if (
            typing
        ) {
            finishTyping();

            return true;
        }


        if (
            activeResolve
        ) {
            const resolve =
                activeResolve;

            activeResolve =
                null;

            typedFull =
                false;

            resolve();

            return true;
        }

        return false;
    }


    function clearDialogueForWalk() {
        clearTimeout(
            typeTimer
        );

        typing =
            false;

        typedFull =
            false;

        activeResolve =
            null;

        finishTypePromise();

        dialogueText.textContent =
            "";

        showDialogueEl(
            false
        );

        hideChoice();
    }


    function positionChoiceHeart() {
        const options =
            choice.querySelectorAll(
                ".secret-choice-option"
            );

        const yes =
            options[
                0
            ];

        const no =
            options[
                1
            ];


        /*
            MOCKUP RULE:
            YES and NO never move.
            The question never moves.
            Only the heart moves between fixed slots.
        */
        yes.classList.remove(
            "selected-single"
        );

        choiceHeart.classList.remove(
            "cursor-left",
            "cursor-center",
            "cursor-right",
            "cursor-single"
        );


        if (
            currentChoiceMode ===
            "single"
        ) {
            choice.dataset.selected =
                "single";

            yes.classList.add(
                "selected-single"
            );

            choiceHeart.classList.add(
                "cursor-single"
            );

            return;
        }


        if (
            choiceIndex ===
            -1
        ) {
            choice.dataset.selected =
                "neutral";

            choiceHeart.classList.add(
                "cursor-center"
            );

            return;
        }


        if (
            choiceIndex ===
            0
        ) {
            choice.dataset.selected =
                "yes";

            choiceHeart.classList.add(
                "cursor-left"
            );

            return;
        }


        choice.dataset.selected =
            "no";

        choiceHeart.classList.add(
            "cursor-right"
        );
    }


    async function askChoice(
        question,
        mode = "yesno"
    ) {
        /*
            Give the QUESTION its own space first.
            The player advances the question normally, then the
            YES / NO selector appears on a clean separate beat.
        */
        if (
            question &&
            mode ===
                "yesno"
        ) {
            await say(
                question
            );
        }


        showDialogueEl(
            false
        );

        choiceQuestion.textContent =
            mode ===
                "yesno"
                ? ""
                : boardText(
                    question
                );

        currentChoiceMode =
            mode;

        choiceIndex =
            mode ===
                "yesno"
                ? -1
                : 0;


        const options =
            choice.querySelectorAll(
                ".secret-choice-option"
            );


        if (
            mode ===
            "single"
        ) {
            options[
                0
            ].textContent =
                "PLEASE DO";

            options[
                1
            ].textContent =
                "";
        } else {
            options[
                0
            ].textContent =
                "YES";

            options[
                1
            ].textContent =
                "NO";
        }


        choice.classList.add(
            "visible"
        );

        positionChoiceHeart();


        return new Promise(
            (resolve) => {
                choiceResolve =
                    resolve;
            }
        );
    }


    function commitChoice() {
        if (
            !choiceResolve
        ) {
            return false;
        }


        if (
            currentChoiceMode ===
                "yesno" &&
            choiceIndex ===
                -1
        ) {
            /*
                Neutral center cursor: require an intentional LEFT or
                RIGHT choice before Z can confirm anything.
            */
            return true;
        }


        if (
            currentChoiceMode ===
                "yesno" &&
            choiceIndex ===
                1 &&
            !choiceAcceptEither
        ) {
            /*
                Party-recruitment NO still does not advance because
                the supplied script does not define that branch.
            */
            safePlay(
                selectSound,
                true
            );

            return true;
        }


        safePlay(
            selectSound,
            true
        );


        const result =
            choiceIndex ===
                1
                ? "no"
                : "yes";

        const resolve =
            choiceResolve;

        hideChoice();

        resolve(
            result
        );

        return true;
    }


    function enableMovement() {
        clearDialogueForWalk();

        movementEnabled =
            true;

        phase =
            "walking";
    }


    async function encounterSusie() {
        await sayMany(
            NPC_TEXT.susie
        );

        await askChoice(
            "SHALL SHE JOIN YOU?"
        );

        await say(
            "SHE ENJOYS\nYOUR LOVE."
        );

        joined.susie =
            true;

        /*
            Stay planted at the encounter point. The character begins
            following only after Kris physically walks past them.
        */
        following.susie =
            false;

        enableMovement();
    }


    async function encounterRalsei() {
        await sayMany(
            NPC_TEXT.ralsei
        );

        await askChoice(
            "WILL YOU HELP HIM?"
        );

        await say(
            "HE NOW\nWANTS."
        );

        joined.ralsei =
            true;

        /*
            Stay planted at the encounter point. The character begins
            following only after Kris physically walks past them.
        */
        following.ralsei =
            false;

        enableMovement();
    }


    async function encounterNoelle() {
        await sayMany(
            NPC_TEXT.noelle
        );

        await askChoice(
            "WILL YOU\nREASSURE HER?"
        );

        await say(
            "SHE SEEMS\nHAPPIER",
            34
        );

        await say(
            "BY YOUR SIDE"
        );

        joined.noelle =
            true;

        /*
            Stay planted at the encounter point. The character begins
            following only after Kris physically walks past them.
        */
        following.noelle =
            false;


        await say(
            "NOW,\nYOU ALL HAVE MET."
        );

        await say(
            "JOINING TOGETHER"
        );

        await say(
            "WITH ALL OF YOUR\nWONDERFUL FRIENDS"
        );

        await say(
            "WAS A GREAT DECISION."
        );

        await say(
            "KEEP THEM IN YOUR HEART"
        )

        await say(
            "AND NEVER FORGET\nTHAT THEY ARE BESIDE YOU"
        )

        await say(
            "IN THE DARK."
        )

        await say(
            "NOW VENTURE FORTH"
        );

        await say(
            "SOMEONE IS HERE\nTO MEET YOU."
        );


        enableMovement();
    }


    async function encounterTree() {
        /*
            The tree trigger is calculated so its CENTER lands at the
            middle of the screen while the party remains on the left.
        */
        freezeMovement();

        phase =
            "forgotten-man";

        setPartyFacingRight();

        /*
            Forgotten Man has begun speaking. Arrow keys no longer
            affect the NES party from this point onward.
        */
        await fadeAudio(
            manMusic,
            1400,
            true
        );

        await say(
            "Well,"
        );

        await say(
            "There is a man here."
        );

        await sayMany(
            STORY_A
        );

        await askChoice(
            "SHALL I SPEAK\nTHIS TALE?",
            "single"
        );

        await runForgottenStory();
    }


    async function runForgottenStory() {
        safePlay(
            departed,
            true
        );

        await sayMany(
            DEPARTED_A
        );

        /*
            The new script explicitly gives Nic a response beat here.
            YES and NO both continue to the exact same next dialogue.
        */
        await askChoice(
            "DO YOU WATCH IT IN MARVEL\nOR WANT TO GRASP THEM IN YOUR PALMS?",
            "yesno",
            true
        );

        await sayMany(
            DEPARTED_B
        );

        await fadeAudio(
            departed,
            1200,
            true
        );

        await sayMany(
            STORY_B
        );

        await askChoice(
            "DO YOU LEAVE THEM,\nCHANGED?",
            "yesno",
            true
        );

        await sayMany(
            STORY_C
        );

        safePlay(
            beloved,
            true
        );

        await sayMany(
            BELOVED
        );

        await fadeAudio(
            beloved,
            1400,
            true
        );

        await sayMany(
            FINALE
        );

        endSecret();
    }


    async function beginSoulSequence() {
        if (
            phase !==
            "soul"
        ) {
            return;
        }

        phase =
            "soul-connection";

        soulButton.classList.add(
            "glowing"
        );

        safePlay(
            heartSound,
            true
        );


        const prompt =
            soulButton.querySelector(
                "#secret-soul-prompt"
            );

        prompt.classList.add(
            "dismissed"
        );


        await wait(
            420
        );


        await showTimedText(
            "A WONDERFUL CONNECTION",
            1100
        );


        /*
            The SOUL does NOT travel to Kris automatically.

            First it flows LEFT, exactly as requested. Once it arrives
            on the left, Kris becomes visible in the middle and the
            player must physically hold RIGHT to move the SOUL to Kris.
        */
        soulButton.style.transition =
            "left 1.45s ease-in-out, top 1.0s ease-in-out";

        soulButton.style.left =
            "18%";

        soulButton.style.top =
            "59%";


        await wait(
            1500
        );


        soulX =
            window.innerWidth *
            0.18;

        soulStartX =
            soulX;

        soulTravelMs =
            0;

        soulHoverMs =
            0;

        soulButton.style.left =
            `${soulX}px`;

        soulButton.style.transition =
            "none";


        /*
            Keep Kris hidden while the SOUL travels through the empty
            black space. Kris appears only when the SOUL gets close,
            just like Susie/Ralsei/Noelle appear as Kris approaches.
        */
        setSprite(
            "kris",
            "nes_kris.png"
        );

        hideActor(
            "kris"
        );


        phase =
            "soul-walking";

        soulMoveLeft =
            false;

        soulMoveRight =
            false;

        soulMeetingStarted =
            false;
    }


    async function meetKris() {
        if (
            soulMeetingStarted ||
            phase !==
                "soul-walking"
        ) {
            return;
        }


        soulMeetingStarted =
            true;

        soulMoveLeft =
            false;

        soulMoveRight =
            false;

        phase =
            "kris-meeting";


        /*
            The encounter resolves with Kris exactly in the center.
            Dialogue does not begin until the SOUL reaches them.
        */
        setActorX(
            "kris",
            ENCOUNTERS.kris
        );

        revealActor(
            "kris"
        );

        setSprite(
            "kris",
            "nes_kris.png"
        );


        /*
            Once the player gets close enough, take over for the last
            few pixels and let the SOUL visibly FLOW beneath Kris,
            matching the mockup rather than snapping into place.
        */
        soulX =
            ENCOUNTERS.kris;

        soulButton.style.transition =
            "left .42s ease-out, top .42s ease-out";

        /*
            EXACT same X coordinate as Kris.
            The SOUL is simply lower on Y, centered underneath.
        */
        soulButton.style.left =
            `${ENCOUNTERS.kris}px`;

        soulButton.style.top =
            "63.2%";

        setSprite(
            "kris",
            "nes_kris.png"
        );


        await wait(
            460
        );


        /*
            Keep the connected SOUL beneath Kris during narration.
        */
        await sayMany(
            NPC_TEXT.kris
        );


        /*
            The large world-space SOUL is NOT also the question cursor.
            Hide it before the choice so there is only one heart on
            screen: the small selector inside the question box.
        */
        soulButton.classList.remove(
            "visible"
        );

        await askChoice(
            "JOIN THEM?"
        );

        await say(
            "IT HAS GAINED\nYOUR LOVE"
        );


        setSprite(
            "kris",
            "nes_kris_right1.png"
        );


        clearDialogueForWalk();

        playerX =
            ENCOUNTERS.kris;


        world.classList.add(
            "camera-glide"
        );

        renderCamera();

        await wait(
            760
        );

        world.classList.remove(
            "camera-glide"
        );


        movementEnabled =
            true;

        phase =
            "walking";

        fadeInAudio(
            manMusic,
            0.65,
            2200,
            true
        );
    }


    async function endSecret() {
        phase =
            "ending";

        freezeMovement();

        try {
            manMusic.pause();
            departed.pause();
            beloved.pause();
        } catch (_) {}


        world.style.display =
            "none";

        showDialogueEl(
            false
        );

        hideChoice();

        soulButton.classList.remove(
            "visible"
        );


        await wait(
            180
        );


        /*
            Reuse the same transition cue heard on Page 1.
            Let it hit before the final red line appears.
        */
        safePlay(
            endingTransitionSound,
            true
        );


        await wait(
            850
        );


        finalLine.textContent =
            "see you soon.";

        finalLine.classList.add(
            "visible"
        );
    }


    function resetVisuals() {
        phase =
            "soul";

        configureGeometry();

        playerX =
            ENCOUNTERS.kris;

        cameraX =
            0;

        movementEnabled =
            false;

        moveLeft =
            false;

        moveRight =
            false;

        joined = {
            susie:
                false,
            ralsei:
                false,
            noelle:
                false
        };

        following = {
            susie:
                false,
            ralsei:
                false,
            noelle:
                false
        };
        joinBlend = {
            susie:
                0,
            ralsei:
                0,
            noelle:
                0
        };

        joinBlendStartX = {
            susie:
                0,
            ralsei:
                0,
            noelle:
                0
        };

        encountered = {
            susie:
                false,
            ralsei:
                false,
            noelle:
                false,
            tree:
                false
        };

        revealed = {
            susie:
                false,
            ralsei:
                false,
            noelle:
                false
        };


        world.style.display =
            "block";

        world.style.transform =
            "translate3d(0,0,0)";

        ground.style.opacity =
            "0";

        fountain.style.opacity =
            "0";

        bridge.style.opacity =
            "0";

        stars.style.opacity =
            "0";

        tree.style.opacity =
            "0";

        petals.style.opacity =
            "0";

        tower.style.opacity =
            "0";


        dialogueText.textContent =
            "";

        showDialogueEl(
            false
        );

        hideChoice();

        finalLine.classList.remove(
            "visible"
        );

        finalLine.textContent =
            "";


        soulButton.style.transition =
            "";

        soulButton.style.left =
            "50%";

        soulButton.style.top =
            "50%";

        soulStartX =
            0;

        soulTravelMs =
            0;

        soulHoverMs =
            0;

        soulButton.classList.remove(
            "glowing"
        );

        const prompt =
            soulButton.querySelector(
                "#secret-soul-prompt"
            );

        prompt.classList.remove(
            "dismissed"
        );

        soulButton.classList.add(
            "visible"
        );


        buildWorld();

        /*
            Opening is black. Do not render the gameplay camera yet;
            this keeps Kris off-screen/hidden until the SOUL reaches.
        */
        world.style.transform =
            "translate3d(0,0,0)";
    }


    function onKeyDown(
        event
    ) {
        if (
            !active
        ) {
            return;
        }


        if (
            event.key ===
            "ArrowRight"
        ) {
            if (
                phase ===
                "soul-walking"
            ) {
                soulMoveRight =
                    true;

                event.preventDefault();

                return;
            }


            if (
                choiceResolve &&
                currentChoiceMode ===
                    "yesno"
            ) {
                choiceIndex =
                    1;

                positionChoiceHeart();

                event.preventDefault();

                return;
            }


            if (
                !movementEnabled
            ) {
                event.preventDefault();

                return;
            }


            moveRight =
                true;

            event.preventDefault();

            return;
        }


        if (
            event.key ===
            "ArrowLeft"
        ) {
            if (
                phase ===
                "soul-walking"
            ) {
                soulMoveLeft =
                    true;

                event.preventDefault();

                return;
            }


            if (
                choiceResolve &&
                currentChoiceMode ===
                    "yesno"
            ) {
                choiceIndex =
                    0;

                positionChoiceHeart();

                event.preventDefault();

                return;
            }


            if (
                !movementEnabled
            ) {
                event.preventDefault();

                return;
            }


            moveLeft =
                true;

            event.preventDefault();

            return;
        }


        if (
            event.key.toLowerCase() ===
                "z" ||
            event.key ===
                "Enter" ||
            event.key ===
                " "
        ) {
            event.preventDefault();

            event.stopPropagation();


            if (
                phase ===
                "soul"
            ) {
                beginSoulSequence();

                return;
            }


            if (
                choiceResolve
            ) {
                commitChoice();

                return;
            }


            resolveDialogueAdvance();
        }
    }


    function onKeyUp(
        event
    ) {
        if (
            !active
        ) {
            return;
        }


        if (
            event.key ===
            "ArrowRight"
        ) {
            moveRight =
                false;

            soulMoveRight =
                false;
        }


        if (
            event.key ===
            "ArrowLeft"
        ) {
            moveLeft =
                false;

            soulMoveLeft =
                false;
        }
    }


    function onUnlockKey(
        event
    ) {
        const lowerKey =
            event.key.toLowerCase();

        const now =
            performance.now();


        /*
            DEVELOPMENT SHORTCUT:
            press F, then M within 1.5 seconds from ANY normal page.
        */
        if (
            !active &&
            lowerKey ===
                "f"
        ) {
            fmShortcutAt =
                now;

            return;
        }


        if (
            !active &&
            lowerKey ===
                "m" &&
            fmShortcutAt &&
            now -
                fmShortcutAt <
                1500
        ) {
            fmShortcutAt =
                0;

            event.preventDefault();

            event.stopPropagation();

            start();

            return;
        }


        if (
            active ||
            !document.body.classList.contains(
                "page7-active"
            )
        ) {
            return;
        }


        if (
            event.key !==
                "ArrowLeft" &&
            event.key !==
                "ArrowRight"
        ) {
            return;
        }


        if (
            now -
                unlockLast >
            1800
        ) {
            unlockProgress =
                0;

            unlockDirection =
                null;
        }


        unlockLast =
            now;


        if (
            !unlockDirection
        ) {
            unlockDirection =
                event.key ===
                    "ArrowLeft"
                    ? "A"
                    : "B";

            unlockProgress =
                0;
        }


        const sequence =
            unlockDirection ===
                "A"
                ? UNLOCK_A
                : UNLOCK_B;


        if (
            event.key ===
            sequence[
                unlockProgress
            ]
        ) {
            unlockProgress++;
        } else {
            unlockDirection =
                event.key ===
                    "ArrowLeft"
                    ? "A"
                    : "B";

            unlockProgress =
                1;
        }


        if (
            unlockProgress >=
            sequence.length
        ) {
            unlockProgress =
                0;

            unlockDirection =
                null;

            event.preventDefault();

            event.stopPropagation();

            start();
        }
    }


    function attach() {
        window.addEventListener(
            "keydown",
            onKeyDown,
            true
        );

        window.addEventListener(
            "keyup",
            onKeyUp,
            true
        );

        soulButton.addEventListener(
            "click",
            beginSoulSequence
        );
    }


    function detach() {
        window.removeEventListener(
            "keydown",
            onKeyDown,
            true
        );

        window.removeEventListener(
            "keyup",
            onKeyUp,
            true
        );

        soulButton?.removeEventListener(
            "click",
            beginSoulSequence
        );
    }


    function start() {
        cache();

        if (
            !stage
        ) {
            return;
        }


        if (
            window.Page7Scene?.stop
        ) {
            try {
                window.Page7Scene.stop();
            } catch (_) {}
        }


        active =
            true;

        document.body.classList.add(
            "secret-page-active"
        );

        stage.classList.add(
            "active"
        );


        selectSound =
            selectSound ||
            audio(
                "assets/sounds/select.wav",
                0.75,
                false
            );


        heartSound =
            heartSound ||
            audio(
                "assets/sounds/revival.ogg",
                0.72,
                false
            );


        endingTransitionSound =
            endingTransitionSound ||
            audio(
                "assets/sounds/test.wav",
                0.85,
                false
            );


        manMusic =
            manMusic ||
            audio(
                "assets/music/man2.mp3",
                0.65,
                true
            );


        departed =
            departed ||
            audio(
                "assets/music/dearlydeparted.mp3",
                0.62,
                true
            );


        beloved =
            beloved ||
            audio(
                "assets/music/dearlybeloved.mp3",
                0.62,
                true
            );


        resetVisuals();

        attach();

        lastFrameTime =
            0;

        cancelAnimationFrame(
            raf
        );

        raf =
            requestAnimationFrame(
                loop
            );
    }


    function stop() {
        if (
            !active
        ) {
            return;
        }


        active =
            false;

        detach();

        cancelAnimationFrame(
            raf
        );

        clearTimeout(
            typeTimer
        );


        [
            manMusic,
            departed,
            beloved,
            heartSound,
            endingTransitionSound,
            selectSound
        ].forEach(
            (instance) => {
                if (
                    instance
                ) {
                    try {
                        instance.pause();
                        instance.currentTime =
                            0;
                    } catch (_) {}
                }
            }
        );


        if (
            stage
        ) {
            stage.classList.remove(
                "active"
            );
        }


        document.body.classList.remove(
            "secret-page-active"
        );


        activeResolve =
            null;

        typeDoneResolve =
            null;

        choiceResolve =
            null;
    }


    document.addEventListener(
        "keydown",
        onUnlockKey,
        true
    );


    window.SecretPageScene = {
        start,
        stop
    };
})();
