(() => {
    "use strict";
    const ASSET = "assets/art/forgottenman/";
    const PLAYER_SPEED = 4.0;
    const TARGET_FPS = 30;
    const FRAME_MS = 1000 / TARGET_FPS;
    const SOUL_TRAVEL_SECONDS = 10;
    const TRAVEL_SECONDS = 10;
    const TRAVEL_DISTANCE = PLAYER_SPEED * 60 * TRAVEL_SECONDS;
    const TREE_TRAVEL_DISTANCE = PLAYER_SPEED * 60 * (TRAVEL_SECONDS + 5);
    const PARTY_SCREEN_X = 0.24;
    const ENCOUNTER_SCREEN_X = 0.50;
    const REVEAL_SCREEN_X = 0.95;
    const NPC_TEXT = {
        kris: [ "A HUMAN.", "THEY SEEM\nSCARED\nOF YOU...", "AND YET,\nTHEY WILL\nRECEIVE", "YOUR DESIRES,", "YOUR CURIOSITY,", "YOUR LOVE." ],
        susie: [ "A GIRL.", "HEED THE BREEZE,\nAND THE SCREAMS", "OF THE PHOENIXES\nTHAT SOAR\nIN THE WIND.", "THE AIR,\nIT CACKLES WITH", "A BRILLIANT FREEDOM" ],
        ralsei: [ "THE PRINCE.", "SUBSERVIENT\nTO YOUR DESIRES.", "WISHING, DEEPLY,\nFOR HIS OWN IRONY", "TO BE ADDRESSED." ],
        noelle: [ "A GIRL.", "FINALLY\nON THE VERGE", "OF POWER.", "FROZEN BY SHOCK,\nSTATIC BY FEAR.", "A HEART THAT CAN FEEL", "THE GAZE OF THE ANGEL", "THAT SHE WANTS TO BECOME." ]
    };
    const STORY_A = [ "SPRING CHANGED TO SUMMER,\nAND SUMMER CHANGED TO COLD,", "AND SURE ENOUGH,\nI AM THE FORGOTTEN MAN.", "TRULY\nWE SHOULD NOT YET", "HAVE MET.", "BUT HERE YOU ARE…", "IT SEEMS THAT IN CELEBRATION", "OF THIS SUBVERSION\nAND ANTICIPATION…", "I SHOULD TELL YOU A TALE", "OF THE CREATOR OF THIS BRIDGE,\nTHE MAKER OF THIS MEDIUM.", "THE ANGEL THAT LIGHTS\nOUR BORROWED EARTH." ];
    const DEPARTED_A = [ "LONG AGO,\nIN THE CENTER OF A COUNTRY…", "A CHILD WAS LEFT", "LONGING IN THE CORE\nOF A GARDEN OF", "WASHED AWAY NIGHTMARES…", "A SUMMER BOY\nWHO FELT MOST AT HOME", "BELOW THE CRISP\nWINTER STARS.", "THIS BOY LOST\nWHAT WAS HIS BEFORE", "ANYONE COULD GIVE HIM\nHIS CHANCE.", "ANYONE YOUNG WOULD REQUIRE\nA MOTHER’S WARMTH", "ANYONE YOUNG WOULD REQUIRE\nA TREE’S SHADE", "ANYONE YOUNG WOULD REQUIRE\nA FATHER’S CONFIDENCE.", "EVERYTHING DRIFTED\nFROM THE BOY.", "NOTHING WOULD REMAIN.", "NOT LONG ENOUGH\nFOR HIM TO TRULY GRASP.", "…", "WHEN YOU, IN THE FALL,\nSEE THE LEAVES FLOW IN A SWIRL" ];
    const DEPARTED_B = [ "INTERESTING,\nIS IT NOT?", "THE BOY SOUGHT TO HOLD", "ONTO THE LOVE\nHE COULD NOT KEEP.", "FRIENDS WERE OPAQUE", "MENTORS WERE FLAWED", "AND HIS ISOLATION EXPANDED", "WITH EVERY MOMENT.", "THE ONLY THING\nHE UNDERSTOOD", "IS THAT HE WOULD NEVER\nBE UNDERSTOOD." ];
    const STORY_B = [ "…", "HE FOUND COMFORT,\nFINALLY.", "YES,\nHE GAVE US A CHANCE.", "HE KNEW THE REFLECTION\nIN THE PUDDLE,", "HAD AN ENTIRE WORLD\nBENEATH.", "OUR GRAVITY AND PLACEMENT", "HAS A PLACE IN THE PHYSICS\nOF HUMAN EMOTION.", "YES.", "HE KNEW THE VALUE\nOF FANTASY.", "DO YOU,\nMY FRIEND?", "WHEN VENTURING\nINTO THESE FRONTIERS,", "MY FRONTIERS," ];
    const STORY_C = [ "INTERESTING…", "THE BOY,\nBY MIRACLE OF THE CLOSED MIRRORS", "BY MIRACLE OF THE OCEANS\nBETWEEN HIM AND US", "BECAME INFATUATED\nWITH BOTH WORLDS.", "HE LEARNED LOVE FROM\nBOTH SIDES.", "THE VALUE OF FANTASY", "A RADIANT PRISM", "THAT UNVEILS THE WONDER", "OF BOTH FANTASY\nAND ACTUALITY.", "HE WOULD WALK HIS PATH", "WITH THE SEEDS OF LOVE\nWE NOURISHED." ];
    const BELOVED = [ "AND IN TURN", "HE WOULD COVET\nTHE FRONTIER", "THAT US DARKNERS\nWOULD LIVE IN.", "MY PURPOSE WAS\nBEING FULFILLED.", "THE BOY…", "FOR SO HE LOVED\nTHE WORLD…", "I SEE HIM,\nSOMETIMES.", "PATIENTLY,\nBENEATH THE LEAVES", "I WAIT FOR HIM TO SEEK\nANOTHER CONNECTION.", "THE BOY AND I MEET", "IN-BETWEEN THE SEAMS.", "HIS LOVE IS VERY,\nVERY REAL", "BUT AT TIMES,\nIT FADED.", "WHEN HIS EYES WERE CURIOUS", "ABOUT THE TREE", "I COULD TELL", "HE WANTED A RETURN.", "A TRUE RETURN\nTO THE DARKNESS.", "…", "DARKNESS", "NOT EVIL,\nNO.", "DARKNESS", "THE PALETTE\nOF ALL COLOR.", "LIGHT,\nTHE PRISM’S REFLECTION", "REVEALING THE HARMONY\nOF ALL COLOR.", "OUR BOY WANTED A RETURN", "TO HOLDING BOTH\nIN HIS HAND.", "I WAS EXCITED TO SEE", "HIS RETURN TO FORM.", "GIVING LOVE TO A WORLD", "THAT COULD BE", "AS BIG AS HE WANTED\nIT TO BE", "ONLY TO EXPAND\nHIS PERSPECTIVE", "ON A WORLD THAT WAS BIGGER,", "AT TIMES,\nTHAN HE WANTED IT TO BE.", "HE MADE AN OATH", "TO NOT WASTE\nHIS FREEDOM.", "AND,\nON BOTH SIDES,", "HE HOLDS IN HIS HANDS,", "THE ONLY THING\nHE EVER NEEDED.", "AN IMAGINATION.", "A TETHERING TO HIS DREAM", "OF BREAKING THE LAYER", "BETWEEN FANTASY\nAND ACTUALITY.", "…", "OUR PROPHECY REINFORCES", "A LONG HELD BELIEF.", "UTOPIA CANNOT EXIST.", "BUT THE BOY DECIDED", "TO EXIST IN BETWEEN", "THE FIRST AND THIRD WORLD.", "AND BE AN ANGEL", "WHOSE WINGS FEEL THE WINDS", "OF BOTH SIDES.", "NOW,\nTHE BOY", "LONGS IN THE CENTER", "OF A GARDEN OF DREAMS\nAND NIGHTMARES." ];
    const FINALE = [ "THANK YOU\nFOR LISTENING.", "…", "I CAN FEEL IT.", "THE BOY HAS BEEN WAITING", "SO LONG", "FOR YOU TO CROSS\nTHE BRIDGE", "AND MAKE THE BRIDGE\nYOURS.", "NO ONE ELSE’S", "NO MATTER THE STORY", "BEFORE YOU CROSSED\nTHE BRIDGE.", "…", "TIME IS YOURS TO TAKE,\nMY FRIEND.", "I AWAIT YOUR ARRIVAL,", "AS YOU KEEP THE LIBERTY", "YOU’RE OWED\nIN YOUR HANDS.", "AS YOU CONTINUE TO MAKE", "THE HUMAN’S LOVE\nYOURS.", "AND AS YOU CONTINUE", "YOUR SEARCH\nFOR CHANGE.", "I SHOULD REMIND YOU OF", "THE ANCIENT DECREE", "BE IT 11 YEARS,", "11 DAYS,", "OR 11 HOURS…", "DELTARUNE WILL BE WAITING." ];
    let stage;
    let world;
    let actors;
    let dialogue;
    let dialogueText;
    let choice;
    let choiceQuestion;
    let choiceHeart;
    let soulButton;
    let finalLine;
    let ground;
    let fountain;
    let bridge;
    let stars;
    let tree;
    let petals;
    let tower;
    let forgottenPetalLineCount = 0;
    let forgottenPetalLevel = 0;
    let belovedStarted = false;
    let active = false;
    let phase = "idle";
    let worldWidth = 12000;
    let encounterOffset = 0;
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
    let playerX = 0;
    let cameraX = 0;
    let moveRight = false;
    let moveLeft = false;
    let raf = 0;
    let actorEls = {};
    let joined = {
        susie: false,
        ralsei: false,
        noelle: false
    };
    let following = {
        susie: false,
        ralsei: false,
        noelle: false
    };
    let joinBlend = {
        susie: 0,
        ralsei: 0,
        noelle: 0
    };
    let joinBlendStartX = {
        susie: 0,
        ralsei: 0,
        noelle: 0
    };
    let encountered = {
        susie: false,
        ralsei: false,
        noelle: false,
        tree: false
    };
    let revealed = {
        susie: false,
        ralsei: false,
        noelle: false
    };
    let movementEnabled = false;
    let soulMoveRight = false;
    let soulMoveLeft = false;
    let soulX = 0;
    let soulStartX = 0;
    let soulTravelMs = 0;
    let soulHoverMs = 0;
    let soulMeetingStarted = false;
    let fmShortcutAt = 0;
    let lastFrameTime = 0;
    let walkingFrame = 0;
    let lastWalkSwap = 0;
    let typeTimer = 0;
    let typing = false;
    let activeResolve = null;
    let typeDoneResolve = null;
    let currentFullText = "";
    let choiceResolve = null;
    let choiceIndex = 0;
    let currentChoiceMode = "yesno";
    let choiceAcceptEither = false;
    let manMusic = null;
    let departed = null;
    let beloved = null;
    let selectSound = null;
    let heartSound = null;
    let endingTransitionSound = null;
    let unlockProgress = 0;
    let unlockLast = 0;
    let unlockDirection = null;
    const UNLOCK_A = [ "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight" ];
    const UNLOCK_B = [ "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft" ];
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    function progress(value, start, end) {
        if (end <= start) return 1;
        return clamp((value - start) / (end - start), 0, 1);
    }
    function cache() {
        stage = document.getElementById("secret-stage");
        world = document.getElementById("secret-world");
        actors = document.getElementById("secret-actors");
        dialogue = document.getElementById("secret-dialogue");
        dialogueText = document.getElementById("secret-dialogue-text");
        choice = document.getElementById("secret-choice");
        choiceQuestion = document.getElementById("secret-choice-question");
        choiceHeart = document.getElementById("secret-choice-heart");
        soulButton = document.getElementById("secret-soul-button");
        finalLine = document.getElementById("secret-final-line");
        ground = document.getElementById("secret-ground");
        fountain = document.getElementById("secret-fountain");
        bridge = document.getElementById("secret-bridge");
        stars = document.getElementById("secret-stars");
        tree = document.getElementById("secret-tree");
        petals = document.getElementById("secret-petals");
        tower = document.getElementById("secret-tower");
    }
    function configureGeometry() {
        const viewportWidth = Math.max(900, window.innerWidth);
        encounterOffset = (ENCOUNTER_SCREEN_X - PARTY_SCREEN_X) * viewportWidth;
        ENCOUNTERS.kris = Math.round(viewportWidth * 0.50);
        TRIGGERS.susie = ENCOUNTERS.kris + TRAVEL_DISTANCE;
        ENCOUNTERS.susie = TRIGGERS.susie + encounterOffset;
        TRIGGERS.ralsei = TRIGGERS.susie + TRAVEL_DISTANCE;
        ENCOUNTERS.ralsei = TRIGGERS.ralsei + encounterOffset;
        TRIGGERS.noelle = TRIGGERS.ralsei + TRAVEL_DISTANCE;
        ENCOUNTERS.noelle = TRIGGERS.noelle + encounterOffset;
        TRIGGERS.tree = TRIGGERS.noelle + TREE_TRAVEL_DISTANCE;
        ENCOUNTERS.tree = TRIGGERS.tree + encounterOffset;
        worldWidth = Math.round(ENCOUNTERS.tree + viewportWidth * 0.75);
        world.style.width = `${worldWidth}px`;
        bridge.style.left = "0px";
        bridge.style.width = `${worldWidth}px`;
        stars.style.left = "0px";
        stars.style.width = `${worldWidth}px`;
        tower.style.left = `${ENCOUNTERS.noelle - viewportWidth * 0.10}px`;
        petals.style.left = `${TRIGGERS.tree - viewportWidth * 0.80}px`;
        petals.style.width = `${viewportWidth * 1.75}px`;
        tree.style.left = `${ENCOUNTERS.tree - 300}px`;
    }
    function encounterTriggerFor(key) {
        return TRIGGERS[key];
    }
    function actorRevealThreshold(key) {
        const target = ENCOUNTERS[key];
        return target - (REVEAL_SCREEN_X - PARTY_SCREEN_X) * window.innerWidth;
    }
    function audio(path, volume = 0.75, loop = false) {
        const instance = new Audio(path);
        instance.preload = "auto";
        instance.volume = volume;
        instance.loop = loop;
        return instance;
    }
    function safePlay(instance, restart = false) {
        if (!instance) return;
        try {
            if (restart) instance.currentTime = 0;
            const promise = instance.play();
            if (promise && promise.catch) promise.catch(() => {});
        } catch (_) {}
    }
    async function fadeAudio(instance, ms = 1200, stop = true) {
        if (!instance) return;
        const startVolume = instance.volume;
        const startTime = performance.now();
        return new Promise(resolve => {
            const tick = now => {
                const amount = Math.min(1, (now - startTime) / ms);
                instance.volume = startVolume * (1 - amount);
                if (amount < 1) {
                    requestAnimationFrame(tick);
                    return;
                }
                if (stop) {
                    instance.pause();
                    try {
                        instance.currentTime = 0;
                    } catch (_) {}
                }
                instance.volume = startVolume;
                resolve();
            };
            requestAnimationFrame(tick);
        });
    }
    function fadeInAudio(instance, targetVolume = 0.65, ms = 2000, restart = true) {
        if (!instance) return;
        try {
            if (restart) instance.currentTime = 0;
            instance.volume = 0;
            const attempt = instance.play();
            if (attempt && attempt.catch) attempt.catch(() => {});
        } catch (_) {
            return;
        }
        const startTime = performance.now();
        const tick = now => {
            if (!active || !instance || instance.paused) return;
            const amount = Math.min(1, (now - startTime) / ms);
            instance.volume = targetVolume * amount;
            if (amount < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    function makeActor(key, src, x, kind = "npc") {
        const img = document.createElement("img");
        img.className = `secret-actor ${kind}`;
        img.dataset.key = key;
        img.src = src;
        img.alt = "";
        img.draggable = false;
        img.style.left = `${x}px`;
        if (key === "susie" || key === "ralsei") img.classList.add("face-right-mirror");
        actors.appendChild(img);
        actorEls[key] = img;
        return img;
    }
    function revealActor(key) {
        const el = actorEls[key];
        if (el) el.classList.add("visible");
    }
    function hideActor(key) {
        const el = actorEls[key];
        if (el) el.classList.remove("visible");
    }
    function setActorX(key, x) {
        const el = actorEls[key];
        if (el) el.style.left = `${x}px`;
    }
    function setSprite(key, file) {
        const el = actorEls[key];
        if (el && !el.src.endsWith(file)) el.src = ASSET + file;
    }
    function buildWorld() {
        actors.innerHTML = "";
        stars.innerHTML = "";
        petals.innerHTML = "";
        actorEls = {};
        makeActor("kris", ASSET + "nes_kris.png", ENCOUNTERS.kris, "player");
        makeActor("susie", ASSET + "nes_susie.png", ENCOUNTERS.susie, "npc");
        makeActor("ralsei", ASSET + "nes_ralsei.png", ENCOUNTERS.ralsei, "npc");
        makeActor("noelle", ASSET + "nes_noelle.png", ENCOUNTERS.noelle, "npc");
        hideActor("kris");
        hideActor("susie");
        hideActor("ralsei");
        hideActor("noelle");
        const starCount = Math.max(72, Math.floor(worldWidth / 115));
        for (let i = 0; i < starCount; i++) {
            const img = document.createElement("img");
            img.className = "secret-star";
            img.src = ASSET + (i % 3 === 0 ? "star-twinkle.gif" : "star-twinkle-fast.gif");
            img.style.left = `${45 + i * 112 + i % 5 * 13}px`;
            img.style.top = `${3 + i * 17 % 45}%`;
            img.alt = "";
            stars.appendChild(img);
        }
        for (let i = 0; i < 22; i++) {
            const petal = document.createElement("img");
            petal.className = "secret-petal";
            petal.src = ASSET + (i % 2 === 0 ? "petal1.png" : "petal2.png");
            petal.alt = "";
            petal.draggable = false;
            petal.style.top = `${8 + i * 19 % 68}%`;
            petal.style.animationDuration = `${4.8 + i % 7 * 0.55}s`;
            petal.style.animationDelay = `${-i * 0.37}s`;
            petals.appendChild(petal);
        }
    }
    function intensifyForgottenPetals() {
        if (!petals) return;
        forgottenPetalLevel = Math.floor(forgottenPetalLineCount / 6);
        const level = forgottenPetalLevel;
        const travel = 1500 + level * 260;
        const drop = 190 + level * 34;
        petals.style.setProperty("--petal-travel", `${travel}px`);
        petals.style.setProperty("--petal-drop", `${drop}px`);
        const all = petals.querySelectorAll(".secret-petal");
        if (level > 0) for (let j = 0; j < 4; j++) {
            const i = all.length + j;
            const petal = document.createElement("img");
            petal.className = "secret-petal";
            petal.src = ASSET + (i % 2 === 0 ? "petal1.png" : "petal2.png");
            petal.alt = "";
            petal.draggable = false;
            petal.style.top = `${8 + i * 19 % 68}%`;
            const base = 4.8 + i % 7 * 0.55;
            petal.style.animationDuration = `${base}s`;
            petal.style.animationDelay = `${-i * 0.21}s`;
            petals.appendChild(petal);
        }
    }
    function renderCamera() {
        const max = Math.max(0, worldWidth - window.innerWidth);
        cameraX = Math.max(0, Math.min(max, playerX - window.innerWidth * PARTY_SCREEN_X));
        world.style.transform = `translate3d(${-cameraX}px,0,0)`;
        const fountainWidth = 384;
        fountain.style.left = `${cameraX + window.innerWidth / 2 - fountainWidth / 2}px`;
    }
    function updateParty() {
        setActorX("kris", playerX);
        let offset = 82;
        const followTarget = (key, targetX) => {
            const el = actorEls[key];
            if (!el) return;
            if (joinBlend[key] < 1) {
                const amount = clamp((playerX - joinBlendStartX[key]) / 250, 0, 1);
                joinBlend[key] = amount;
                const currentX = parseFloat(el.style.left) || targetX;
                const eased = 1 - Math.pow(1 - amount, 3);
                setActorX(key, currentX + (targetX - currentX) * eased);
                return;
            }
            setActorX(key, targetX);
        };
        if (following.susie) {
            followTarget("susie", playerX - offset);
            offset += 82;
        }
        if (following.ralsei) {
            followTarget("ralsei", playerX - offset);
            offset += 82;
        }
        if (following.noelle) followTarget("noelle", playerX - offset);
    }
    function activatePassedFollowers() {
        const passPadding = 34;
        if (joined.susie && !following.susie && playerX >= ENCOUNTERS.susie + passPadding) {
            following.susie = true;
            joinBlend.susie = 0;
            joinBlendStartX.susie = playerX;
            setSprite("susie", "nes_susie_walk1.png");
            actorEls.susie.classList.add("follower");
            actorEls.susie.classList.remove("npc");
        }
        if (joined.ralsei && !following.ralsei && playerX >= ENCOUNTERS.ralsei + passPadding) {
            following.ralsei = true;
            joinBlend.ralsei = 0;
            joinBlendStartX.ralsei = playerX;
            setSprite("ralsei", "nes_ralsei_walk1.png");
            actorEls.ralsei.classList.add("follower");
            actorEls.ralsei.classList.remove("npc");
        }
        if (joined.noelle && !following.noelle && playerX >= ENCOUNTERS.noelle + passPadding) {
            following.noelle = true;
            joinBlend.noelle = 0;
            joinBlendStartX.noelle = playerX;
            setSprite("noelle", "nes_noelle_walk1.png");
            actorEls.noelle.classList.add("follower");
            actorEls.noelle.classList.remove("npc");
        }
    }
    function animateWalk(now) {
        if (!movementEnabled || !moveRight && !moveLeft) return;
        if (now - lastWalkSwap < 145) return;
        lastWalkSwap = now;
        walkingFrame = 1 - walkingFrame;
        setSprite("kris", walkingFrame ? "nes_kris_right1.png" : "nes_kris_right2.png");
        if (following.susie) setSprite("susie", walkingFrame ? "nes_susie_walk1.png" : "nes_susie_walk2.png");
        if (following.ralsei) setSprite("ralsei", walkingFrame ? "nes_ralsei_walk1.png" : "nes_ralsei_walk2.png");
        if (following.noelle) setSprite("noelle", walkingFrame ? "nes_noelle_walk1.png" : "nes_noelle_walk2.png");
    }
    function renderEnvironment() {
        const groundOpacity = joined.susie ? progress(playerX, TRIGGERS.susie, TRIGGERS.susie + 900) : 0;
        ground.style.opacity = `${groundOpacity}`;
        const fountainOpacity = joined.ralsei ? progress(playerX, TRIGGERS.ralsei, TRIGGERS.ralsei + 360) : 0;
        fountain.style.opacity = `${fountainOpacity}`;
        const bridgeOpacity = joined.noelle ? progress(playerX, TRIGGERS.noelle, TRIGGERS.noelle + 420) : 0;
        bridge.style.opacity = `${bridgeOpacity}`;
        const towerOpacity = joined.noelle ? progress(playerX, TRIGGERS.noelle + 100, TRIGGERS.noelle + 520) : 0;
        tower.style.opacity = `${towerOpacity}`;
        const starOpacity = joined.noelle ? progress(playerX, TRIGGERS.noelle + 60, TRIGGERS.noelle + 500) : 0;
        stars.style.opacity = `${starOpacity}`;
        const petalOpacity = joined.noelle ? progress(playerX, TRIGGERS.tree - 1300, TRIGGERS.tree - 250) : 0;
        petals.style.opacity = `${petalOpacity}`;
        tree.style.opacity = joined.noelle ? "1" : "0";
    }
    function freezeMovement() {
        movementEnabled = false;
        moveLeft = false;
        moveRight = false;
        soulMoveLeft = false;
        soulMoveRight = false;
    }
    function setPartyFacingRight() {
        setSprite("kris", "nes_kris_right1.png");
        if (following.susie) setSprite("susie", "nes_susie_walk2.png");
        if (following.ralsei) setSprite("ralsei", "nes_ralsei_walk1.png");
        if (following.noelle) setSprite("noelle", "nes_noelle_walk1.png");
    }
    async function checkEncounter() {
        if (!movementEnabled) return;
        if (!encountered.susie && playerX >= encounterTriggerFor("susie")) {
            encountered.susie = true;
            freezeMovement();
            await encounterSusie();
            return;
        }
        if (joined.susie && !encountered.ralsei && playerX >= encounterTriggerFor("ralsei")) {
            encountered.ralsei = true;
            freezeMovement();
            await encounterRalsei();
            return;
        }
        if (joined.ralsei && !encountered.noelle && playerX >= encounterTriggerFor("noelle")) {
            encountered.noelle = true;
            freezeMovement();
            await encounterNoelle();
            return;
        }
        if (joined.noelle && !encountered.tree && playerX >= encounterTriggerFor("tree")) {
            encountered.tree = true;
            freezeMovement();
            await encounterTree();
        }
    }
    function revealApproachingActors() {
        if (!revealed.susie && !joined.susie && playerX >= actorRevealThreshold("susie")) {
            revealed.susie = true;
            revealActor("susie");
        }
        if (joined.susie && !revealed.ralsei && !joined.ralsei && playerX >= actorRevealThreshold("ralsei")) {
            revealed.ralsei = true;
            revealActor("ralsei");
        }
        if (joined.ralsei && !revealed.noelle && !joined.noelle && playerX >= actorRevealThreshold("noelle")) {
            revealed.noelle = true;
            revealActor("noelle");
        }
    }
    function loop(now) {
        if (!active) return;
        if (lastFrameTime && now - lastFrameTime < FRAME_MS) {
            raf = requestAnimationFrame(loop);
            return;
        }
        const elapsed = lastFrameTime ? now - lastFrameTime : FRAME_MS;
        const dt = Math.min(2.6, elapsed / 16.67);
        lastFrameTime = now;
        if (phase === "soul-walking") {
            const totalDuration = SOUL_TRAVEL_SECONDS * 1000;
            if (soulMoveRight) soulTravelMs += elapsed;
            if (soulMoveLeft) soulTravelMs -= elapsed;
            soulTravelMs = clamp(soulTravelMs, 0, totalDuration);
            const amount = soulTravelMs / totalDuration;
            soulX = soulStartX + (ENCOUNTERS.kris - soulStartX) * amount;
            soulHoverMs += elapsed;
            const hover = Math.sin(soulHoverMs / 250) * 5;
            soulButton.style.left = `${soulX}px`;
            soulButton.style.top = `calc(59% + ${hover}px)`;
            if (amount >= 0.78 && !actorEls.kris.classList.contains("visible")) revealActor("kris");
            if (amount >= 0.94 && !soulMeetingStarted) meetKris();
        }
        if (movementEnabled) {
            if (moveRight) playerX += PLAYER_SPEED * dt;
            if (moveLeft) playerX -= PLAYER_SPEED * dt;
            playerX = clamp(playerX, ENCOUNTERS.kris, TRIGGERS.tree);
            revealApproachingActors();
            activatePassedFollowers();
        }
        updateParty();
        if (phase !== "soul" && phase !== "soul-connection" && phase !== "soul-walking" && phase !== "kris-meeting") {
            renderCamera();
            renderEnvironment();
        }
        animateWalk(now);
        checkEncounter();
        raf = requestAnimationFrame(loop);
    }
    function showDialogueEl(show = true) {
        dialogue.classList.toggle("visible", show);
    }
    function hideChoice() {
        choice.classList.remove("visible");
        choice.dataset.selected = "";
        choiceResolve = null;
        choiceAcceptEither = false;
        if (choiceQuestion) choiceQuestion.textContent = "";
        const options = choice ? choice.querySelectorAll(".secret-choice-option") : [];
        if (options[0]) options[0].textContent = "";
        if (options[1]) options[1].textContent = "";
    }
    function wrapBoardLogicalLine(line, maxChars) {
        const words = String(line).trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return [ "" ];
        const wrapped = [];
        let current = "";
        for (const word of words) {
            const candidate = current ? `${current} ${word}` : word;
            if (current && candidate.length > maxChars) {
                wrapped.push(current);
                current = word;
            } else current = candidate;
        }
        if (current) wrapped.push(current);
        return wrapped;
    }
    function normalizeAdventureBoardText(text) {
        return String(text).replace(/\u2026/g, "...").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-");
    }
    function boardText(text, maxChars = 34) {
        const normalized = normalizeAdventureBoardText(text).replace(/\r\n?/g, "\n");
        const logicalLines = normalized.split(/\n+/);
        const visualLines = [];
        for (const logicalLine of logicalLines) {
            const wrapped = wrapBoardLogicalLine(logicalLine, maxChars);
            visualLines.push(...wrapped);
        }
        return visualLines.join("\n");
    }
    function finishTypePromise() {
        if (typeDoneResolve) {
            const resolve = typeDoneResolve;
            typeDoneResolve = null;
            resolve();
        }
    }
    function fitBoardText(text) {
        dialogueText.style.fontSize = "";
        dialogueText.textContent = text;
        const panelStyle = getComputedStyle(dialogue);
        const availableHeight = dialogue.clientHeight - parseFloat(panelStyle.paddingTop) - parseFloat(panelStyle.paddingBottom);
        if (availableHeight <= 0 || dialogueText.clientWidth <= 0) {
            dialogueText.textContent = "";
            return;
        }
        for (let pass = 0; pass < 3; pass++) {
            const scale = Math.min(1, dialogueText.clientWidth / Math.max(1, dialogueText.scrollWidth), availableHeight / Math.max(1, dialogueText.scrollHeight));
            if (scale >= 1) break;
            const fontSize = parseFloat(getComputedStyle(dialogueText).fontSize);
            dialogueText.style.fontSize = `${fontSize * scale * 0.98}px`;
        }
        dialogueText.textContent = "";
    }
    function mixedFontHTML(text) {
        return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function typeText(text, speed = 34) {
        text = boardText(text, 34);
        clearTimeout(typeTimer);
        currentFullText = text;
        dialogueText.textContent = "";
        showDialogueEl(true);
        fitBoardText(text);
        typing = true;
        return new Promise(resolve => {
            typeDoneResolve = resolve;
            let index = 0;
            const step = () => {
                if (!active) {
                    typing = false;
                    finishTypePromise();
                    return;
                }
                if (index >= text.length) {
                    typing = false;
                    finishTypePromise();
                    return;
                }
                const character = text[index];
                dialogueText.innerHTML = mixedFontHTML(text.slice(0, index + 1));
                index++;
                const frameMs = 1000 / 30;
                const requestedDelay = character === "\n" ? speed * 1.8 : speed;
                const frameCount = Math.max(1, Math.round(requestedDelay / frameMs));
                typeTimer = setTimeout(step, frameCount * frameMs);
            };
            step();
        });
    }
    function finishTyping() {
        if (!typing) return false;
        clearTimeout(typeTimer);
        dialogueText.textContent = currentFullText;
        typing = false;
        finishTypePromise();
        return true;
    }
    async function say(text, speed = 34) {
        if (phase === "forgotten-man") {
            forgottenPetalLineCount++;
            if (forgottenPetalLineCount % 6 === 0) intensifyForgottenPetals();
            if (!belovedStarted && String(text).includes("VALUE\nOF FANTASY")) {
                belovedStarted = true;
                safePlay(beloved, true);
            }
        }
        await typeText(text, speed);
        return new Promise(resolve => {
            activeResolve = resolve;
        });
    }
    async function sayMany(lines) {
        for (const line of lines) await say(line);
    }
    async function sayManyPacked(lines, maxRows = 4) {
        let panelText = "";
        for (const line of lines) {
            const candidate = panelText ? `${panelText}\n${line}` : String(line);
            const renderedRows = boardText(candidate, 34).split("\n").length;
            if (panelText && renderedRows > maxRows) {
                await say(panelText);
                panelText = String(line);
            } else panelText = candidate;
        }
        if (panelText) await say(panelText);
    }
    async function showTimedText(text, holdMs = 1350) {
        await typeText(text, 42);
        await wait(holdMs);
        clearDialogueForWalk();
    }
    function resolveDialogueAdvance() {
        if (typing) {
            finishTyping();
            return true;
        }
        if (activeResolve) {
            const resolve = activeResolve;
            activeResolve = null;
            resolve();
            return true;
        }
        return false;
    }
    function clearDialogueForWalk() {
        clearTimeout(typeTimer);
        typing = false;
        activeResolve = null;
        finishTypePromise();
        dialogueText.textContent = "";
        showDialogueEl(false);
        hideChoice();
    }
    function positionChoiceHeart() {
        const options = choice.querySelectorAll(".secret-choice-option");
        const yes = options[0];
        const no = options[1];
        yes.classList.remove("selected-single");
        choiceHeart.src = "assets/spr_heart_2.png";
        if (currentChoiceMode === "single") {
            choice.dataset.selected = "single";
            yes.classList.add("selected-single");
            return;
        }
        const wordRect = element => {
            const range = document.createRange();
            range.selectNodeContents(element);
            const rect = range.getBoundingClientRect();
            range.detach?.();
            return rect;
        };
        const yesRect = wordRect(yes);
        const noRect = wordRect(no);
        const parent = choiceHeart.offsetParent || document.getElementById("secret-choice-row");
        const parentRect = parent.getBoundingClientRect();
        const heartWidth = 26;
        let left;
        if (choiceIndex === -1) {
            choice.dataset.selected = "neutral";
            const gapCenter = (yesRect.right + noRect.left) / 2;
            left = gapCenter - parentRect.left - heartWidth / 2;
        } else {
            const selectedRect = choiceIndex === 1 ? noRect : yesRect;
            choice.dataset.selected = choiceIndex === 1 ? "no" : "yes";
            left = selectedRect.left - parentRect.left - heartWidth - 18;
        }
        const referenceRect = choiceIndex === 1 ? noRect : yesRect;
        const top = referenceRect.top - parentRect.top + 5;
        choiceHeart.style.left = `${left}px`;
        choiceHeart.style.top = `${top}px`;
    }
    async function askChoice(question, mode = "yesno", acceptEither = false) {
        if (question) await say(question);
        showDialogueEl(false);
        choiceQuestion.textContent = "";
        currentChoiceMode = mode;
        choiceAcceptEither = acceptEither;
        choiceIndex = mode === "single" ? 0 : -1;
        const options = choice.querySelectorAll(".secret-choice-option");
        if (mode === "single") {
            options[0].textContent = "PLEASE DO";
            options[1].textContent = "";
        } else if (mode === "watchgrasp") {
            options[0].textContent = "WATCH";
            options[1].textContent = "GRASP";
        } else {
            options[0].textContent = "YES";
            options[1].textContent = "NO";
        }
        choiceHeart.src = "assets/spr_heart_2.png";
        choice.classList.add("visible");
        if (mode === "yesno" || mode === "watchgrasp") options.forEach((option, index) => {
            option.onmouseenter = () => {
                choiceIndex = index;
                positionChoiceHeart();
            };
            option.onclick = () => {
                choiceIndex = index;
                positionChoiceHeart();
                if (choiceResolve) {
                    const resolve = choiceResolve;
                    choiceResolve = null;
                    const result = currentChoiceMode === "watchgrasp" ? index === 1 ? "grasp" : "watch" : index === 1 ? "no" : "yes";
                    hideChoice();
                    resolve(result);
                }
            };
        });
        positionChoiceHeart();
        return new Promise(resolve => {
            choiceResolve = resolve;
        });
    }
    function commitChoice() {
        if (!choiceResolve) return false;
        if (currentChoiceMode !== "single" && choiceIndex === -1) return true;
        if (currentChoiceMode === "yesno" && choiceIndex === 1 && !choiceAcceptEither) {
            safePlay(selectSound, true);
            return true;
        }
        safePlay(selectSound, true);
        const result = currentChoiceMode === "watchgrasp" ? choiceIndex === 1 ? "grasp" : "watch" : choiceIndex === 1 ? "no" : "yes";
        const resolve = choiceResolve;
        hideChoice();
        resolve(result);
        return true;
    }
    function enableMovement() {
        clearDialogueForWalk();
        movementEnabled = true;
        phase = "walking";
    }
    function stopSecretMusicImmediately() {
        [ manMusic, departed, beloved ].forEach(track => {
            if (!track) return;
            try {
                track.pause();
                track.currentTime = 0;
            } catch (_) {}
        });
    }
    async function runRecruitmentNoRoute() {
        stopSecretMusicImmediately();
        freezeMovement();
        phase = "recruitment-no";
        await say("NO?");
        await say("WELL...");
        await say("THEN I REGRET TO INFORM YOU.");
        await say("THAT YOUR DISCONNECTION", 115);
        await say("HAS ARRIVED.", 145);
        showDialogueEl(false);
        hideChoice();
        soulButton.classList.remove("visible");
        const scare = document.createElement("div");
        scare.id = "secret-eyes-jumpscare";
        scare.style.cssText = "position:fixed;inset:0;z-index:2147483647;" + "background:#000;display:flex;align-items:center;" + "justify-content:center;";
        const eyes = document.createElement("img");
        eyes.src = "assets/art/forgottenman/eyes.png";
        eyes.alt = "";
        eyes.draggable = false;
        eyes.style.cssText = "width:384px;height:144px;object-fit:fill;" + "image-rendering:pixelated;image-rendering:crisp-edges;" + "pointer-events:none;user-select:none;";
        scare.appendChild(eyes);
        document.body.appendChild(scare);
        const demon = new Audio("assets/sounds/thedemon.mp3");
        demon.preload = "auto";
        demon.volume = 1;
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            scare.replaceChildren();
            scare.style.background = "#000";
            try {
                window.close();
            } catch (_) {}
        };
        demon.addEventListener("ended", finish, {
            once: true
        });
        demon.addEventListener("error", () => {
            setTimeout(finish, 4200);
        }, {
            once: true
        });
        try {
            demon.currentTime = 0;
            await demon.play();
        } catch (_) {
            setTimeout(finish, 4200);
        }
    }
    async function encounterSusie() {
        await sayMany(NPC_TEXT.susie);
        const answer = await askChoice("SHALL SHE JOIN YOU?", "yesno", true);
        if (answer === "no") {
            await runRecruitmentNoRoute();
            return;
        }
        await say("SHE ENJOYS\nYOUR LOVE.");
        joined.susie = true;
        following.susie = false;
        enableMovement();
    }
    async function encounterRalsei() {
        await sayMany(NPC_TEXT.ralsei);
        const answer = await askChoice("WILL YOU HELP HIM?", "yesno", true);
        if (answer === "no") {
            await runRecruitmentNoRoute();
            return;
        }
        await say("HE NOW\nWANTS.");
        joined.ralsei = true;
        following.ralsei = false;
        enableMovement();
    }
    async function encounterNoelle() {
        await sayMany(NPC_TEXT.noelle);
        const answer = await askChoice("WILL YOU\nREASSURE HER?", "yesno", true);
        if (answer === "no") {
            await runRecruitmentNoRoute();
            return;
        }
        await say("SHE SEEMS\nHAPPIER", 34);
        await say("BY YOUR SIDE");
        joined.noelle = true;
        following.noelle = false;
        await say("NOW,\nYOU ALL HAVE MET.");
        await say("JOINING TOGETHER");
        await say("WITH ALL OF YOUR\nWONDERFUL FRIENDS");
        await say("WAS A GREAT DECISION.");
        await say("KEEP THEM IN YOUR HEART");
        await say("AND NEVER FORGET\nTHAT THEY ARE BESIDE YOU");
        await say("IN THE DARK.");
        await say("NOW VENTURE FORTH");
        await say("SOMEONE IS HERE\nTO MEET YOU.");
        enableMovement();
    }
    async function encounterTree() {
        freezeMovement();
        phase = "forgotten-man";
        setPartyFacingRight();
        await fadeAudio(manMusic, 1400, true);
        await say("Well,\nThere is a man here.");
        await sayManyPacked(STORY_A, 4);
        await askChoice("SHALL I SPEAK\nTHIS TALE?", "single");
        await runForgottenStory();
    }
    async function runForgottenStory() {
        safePlay(departed, true);
        await sayManyPacked(DEPARTED_A, 4);
        await askChoice("DO YOU WATCH IT IN MARVEL\nOR WANT TO GRASP THEM IN YOUR PALMS?", "watchgrasp", true);
        await sayManyPacked(DEPARTED_B, 4);
        await fadeAudio(departed, 1200, true);
        await sayManyPacked(STORY_B, 4);
        await askChoice("DO YOU LEAVE THEM,\nCHANGED?", "yesno", true);
        await sayManyPacked(STORY_C, 4);
        if (!belovedStarted) {
            belovedStarted = true;
            safePlay(beloved, true);
        }
        await sayManyPacked(BELOVED, 4);
        await fadeAudio(beloved, 1400, true);
        await sayManyPacked(FINALE, 4);
        endSecret();
    }
    async function beginSoulSequence() {
        if (phase !== "soul") return;
        phase = "soul-connection";
        soulButton.classList.add("glowing");
        safePlay(heartSound, true);
        const prompt = soulButton.querySelector("#secret-soul-prompt");
        prompt.classList.add("dismissed");
        await wait(420);
        await showTimedText("A WONDERFUL CONNECTION", 1100);
        soulButton.style.transition = "left 1.45s ease-in-out, top 1.0s ease-in-out";
        soulButton.style.left = "18%";
        soulButton.style.top = "59%";
        await wait(1500);
        soulX = window.innerWidth * 0.18;
        soulStartX = soulX;
        soulTravelMs = 0;
        soulHoverMs = 0;
        soulButton.style.left = `${soulX}px`;
        soulButton.style.transition = "none";
        setSprite("kris", "nes_kris.png");
        hideActor("kris");
        phase = "soul-walking";
        soulMoveLeft = false;
        soulMoveRight = false;
        soulMeetingStarted = false;
    }
    function soulTargetAtKris(beneath = false) {
        const krisRect = actorEls.kris.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        return {
            x: krisRect.left - stageRect.left + krisRect.width / 2,
            y: beneath ? krisRect.bottom - stageRect.top + 72 : krisRect.top - stageRect.top + krisRect.height / 2
        };
    }
    async function mergeSoulIntoKris() {
        const below = soulTargetAtKris(true);
        soulButton.style.transition = "none";
        soulButton.style.left = `${below.x}px`;
        soulButton.style.top = `${below.y}px`;
        soulButton.style.opacity = "1";
        soulButton.classList.add("visible");
        soulButton.offsetWidth;
        const center = soulTargetAtKris();
        soulButton.style.transition = "left 1.8s ease-in-out, top 1.8s ease-in-out, opacity 1.8s linear";
        soulButton.style.left = `${center.x}px`;
        soulButton.style.top = `${center.y}px`;
        soulButton.style.opacity = "0.65";
        await wait(1800);
        if (!active || phase !== "kris-meeting") return false;
        soulButton.classList.remove("glowing");
        soulButton.classList.add("connected");
        await wait(250);
        if (!active || phase !== "kris-meeting") return false;
        soulButton.style.transition = "opacity 1.1s linear";
        soulButton.style.opacity = "0";
        await wait(1100);
        if (!active || phase !== "kris-meeting") return false;
        soulButton.classList.remove("visible");
        return true;
    }
    async function meetKris() {
        if (soulMeetingStarted || phase !== "soul-walking") return;
        soulMeetingStarted = true;
        soulMoveLeft = false;
        soulMoveRight = false;
        phase = "kris-meeting";
        setActorX("kris", ENCOUNTERS.kris);
        revealActor("kris");
        setSprite("kris", "nes_kris.png");
        const soulTarget = soulTargetAtKris(true);
        soulX = soulTarget.x;
        soulButton.style.transition = "left .42s ease-out, top .42s ease-out";
        soulButton.style.left = `${soulTarget.x}px`;
        soulButton.style.top = `${soulTarget.y}px`;
        setSprite("kris", "nes_kris.png");
        await wait(460);
        await sayMany(NPC_TEXT.kris);
        soulButton.classList.remove("visible");
        const joinAnswer = await askChoice("JOIN THEM?");
        if (joinAnswer !== "yes") return;
        hideChoice();
        if (!await mergeSoulIntoKris()) return;
        await say("THEY HAVE GAINED\nYOUR LOVE");
        setSprite("kris", "nes_kris_right1.png");
        clearDialogueForWalk();
        playerX = ENCOUNTERS.kris;
        world.classList.add("camera-glide");
        renderCamera();
        await wait(760);
        world.classList.remove("camera-glide");
        movementEnabled = true;
        phase = "walking";
        fadeInAudio(manMusic, 0.65, 2200, true);
    }
    async function endSecret() {
        phase = "ending";
        freezeMovement();
        try {
            manMusic.pause();
            departed.pause();
            beloved.pause();
        } catch (_) {}
        world.style.display = "none";
        showDialogueEl(false);
        hideChoice();
        soulButton.classList.remove("visible");
        await wait(180);
        safePlay(endingTransitionSound, true);
        await wait(850);
        finalLine.textContent = "see you soon.";
        finalLine.classList.add("visible");
    }
    function resetVisuals() {
        phase = "soul";
        configureGeometry();
        playerX = ENCOUNTERS.kris;
        cameraX = 0;
        movementEnabled = false;
        moveLeft = false;
        moveRight = false;
        joined = {
            susie: false,
            ralsei: false,
            noelle: false
        };
        following = {
            susie: false,
            ralsei: false,
            noelle: false
        };
        joinBlend = {
            susie: 0,
            ralsei: 0,
            noelle: 0
        };
        joinBlendStartX = {
            susie: 0,
            ralsei: 0,
            noelle: 0
        };
        encountered = {
            susie: false,
            ralsei: false,
            noelle: false,
            tree: false
        };
        revealed = {
            susie: false,
            ralsei: false,
            noelle: false
        };
        world.style.display = "block";
        world.style.transform = "translate3d(0,0,0)";
        ground.style.opacity = "0";
        fountain.style.opacity = "0";
        bridge.style.opacity = "0";
        stars.style.opacity = "0";
        tree.style.opacity = "0";
        petals.style.opacity = "0";
        tower.style.opacity = "0";
        dialogueText.textContent = "";
        showDialogueEl(false);
        hideChoice();
        finalLine.classList.remove("visible");
        finalLine.textContent = "";
        soulButton.style.transition = "";
        soulButton.style.opacity = "";
        soulButton.classList.remove("connected");
        soulButton.style.left = "50%";
        soulButton.style.top = "62.4%";
        soulStartX = 0;
        soulTravelMs = 0;
        soulHoverMs = 0;
        soulButton.classList.remove("glowing");
        const prompt = soulButton.querySelector("#secret-soul-prompt");
        prompt.classList.remove("dismissed");
        soulButton.classList.add("visible");
        buildWorld();
        world.style.transform = "translate3d(0,0,0)";
    }
    function onKeyDown(event) {
        if (!active) return;
        if (event.key === "ArrowRight") {
            if (phase === "soul-walking") {
                soulMoveRight = true;
                event.preventDefault();
                return;
            }
            if (choiceResolve && (currentChoiceMode === "yesno" || currentChoiceMode === "watchgrasp")) {
                choiceIndex = 1;
                positionChoiceHeart();
                event.preventDefault();
                return;
            }
            if (!movementEnabled) {
                event.preventDefault();
                return;
            }
            moveRight = true;
            event.preventDefault();
            return;
        }
        if (event.key === "ArrowLeft") {
            if (phase === "soul-walking") {
                soulMoveLeft = true;
                event.preventDefault();
                return;
            }
            if (choiceResolve && (currentChoiceMode === "yesno" || currentChoiceMode === "watchgrasp")) {
                choiceIndex = 0;
                positionChoiceHeart();
                event.preventDefault();
                return;
            }
            if (!movementEnabled) {
                event.preventDefault();
                return;
            }
            moveLeft = true;
            event.preventDefault();
            return;
        }
        if (event.key.toLowerCase() === "z" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            if (phase === "soul") {
                beginSoulSequence();
                return;
            }
            if (choiceResolve) {
                commitChoice();
                return;
            }
            resolveDialogueAdvance();
        }
    }
    function onKeyUp(event) {
        if (!active) return;
        if (event.key === "ArrowRight") {
            moveRight = false;
            soulMoveRight = false;
        }
        if (event.key === "ArrowLeft") {
            moveLeft = false;
            soulMoveLeft = false;
        }
    }
    function onUnlockKey(event) {
        const lowerKey = event.key.toLowerCase();
        const now = performance.now();
        if (!active && lowerKey === "f") {
            fmShortcutAt = now;
            return;
        }
        if (!active && lowerKey === "m" && fmShortcutAt && now - fmShortcutAt < 1500) {
            fmShortcutAt = 0;
            event.preventDefault();
            event.stopPropagation();
            start();
            return;
        }
        if (active || !document.body.classList.contains("page7-active")) return;
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        if (now - unlockLast > 1800) {
            unlockProgress = 0;
            unlockDirection = null;
        }
        unlockLast = now;
        if (!unlockDirection) {
            unlockDirection = event.key === "ArrowLeft" ? "A" : "B";
            unlockProgress = 0;
        }
        const sequence = unlockDirection === "A" ? UNLOCK_A : UNLOCK_B;
        if (event.key === sequence[unlockProgress]) unlockProgress++; else {
            unlockDirection = event.key === "ArrowLeft" ? "A" : "B";
            unlockProgress = 1;
        }
        if (unlockProgress >= sequence.length) {
            unlockProgress = 0;
            unlockDirection = null;
            event.preventDefault();
            event.stopPropagation();
            start();
        }
    }
    function attach() {
        window.addEventListener("keydown", onKeyDown, true);
        window.addEventListener("keyup", onKeyUp, true);
        soulButton.addEventListener("click", beginSoulSequence);
    }
    function detach() {
        window.removeEventListener("keydown", onKeyDown, true);
        window.removeEventListener("keyup", onKeyUp, true);
        soulButton?.removeEventListener("click", beginSoulSequence);
    }
    function setForgottenManFavicon() {
        let icon = document.querySelector('link[rel~="icon"]');
        if (!icon) {
            icon = document.createElement("link");
            icon.rel = "icon";
            document.head.appendChild(icon);
        }
        icon.href = "assets/art/headpg.png";
    }
    function start() {
        cache();
        setForgottenManFavicon();
        if (!stage) return;
        if (window.Page7Scene?.stop) try {
            window.Page7Scene.stop();
        } catch (_) {}
        active = true;
        forgottenPetalLineCount = 0;
        forgottenPetalLevel = 0;
        belovedStarted = false;
        document.body.classList.add("secret-page-active");
        stage.classList.add("active");
        selectSound = selectSound || audio("assets/sounds/select.wav", 0.75, false);
        heartSound = heartSound || audio("assets/sounds/revival.ogg", 0.72, false);
        endingTransitionSound = endingTransitionSound || audio("assets/sounds/test.wav", 0.85, false);
        manMusic = manMusic || audio("assets/music/man2.mp3", 0.65, true);
        departed = departed || audio("assets/music/dearlydeparted.mp3", 0.62, true);
        beloved = beloved || audio("assets/music/dearlybeloved.mp3", 0.62, true);
        resetVisuals();
        attach();
        lastFrameTime = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
    }
    function stop() {
        if (!active) return;
        active = false;
        detach();
        cancelAnimationFrame(raf);
        clearTimeout(typeTimer);
        [ manMusic, departed, beloved, heartSound, endingTransitionSound, selectSound ].forEach(instance => {
            if (instance) try {
                instance.pause();
                instance.currentTime = 0;
            } catch (_) {}
        });
        if (stage) stage.classList.remove("active");
        document.body.classList.remove("secret-page-active");
        activeResolve = null;
        typeDoneResolve = null;
        choiceResolve = null;
    }
    document.addEventListener("keydown", onUnlockKey, true);
    window.SecretPageScene = {
        start: start,
        stop: stop
    };
})();
