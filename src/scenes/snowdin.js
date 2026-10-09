(() => {
    "use strict";
    let activeShop = null;
    function navigationToken() {
        return window.ForNicNavigation && typeof window.ForNicNavigation.getToken === "function" ? window.ForNicNavigation.getToken() : 0;
    }
    function navigationStillCurrent(token) {
        return !window.ForNicNavigation || typeof window.ForNicNavigation.isCurrent !== "function" || window.ForNicNavigation.isCurrent(token);
    }
    const TOPIC_DATA = {
        helloAgain: {
            label: "Hello, again",
            first: [ {
                face: 5,
                lines: [ "A couple people were heading toward the barrier. They were running through Snowdin towards the Castle, but they came back, with excited looks on their face, telling us that we're finally free." ]
            }, {
                face: 6,
                lines: [ "...", "Is it...", "Is it true?", "Did you free us, traveler?", "Is that what that white light was?" ]
            }, {
                face: 2,
                lines: [ "Thank you...", "I'm so..." ]
            }, {
                face: 6,
                lines: [ "Excited? Happy?" ]
            }, {
                face: 2,
                lines: [ "I don't know." ]
            } ],
            repeat: [ {
                face: 0,
                lines: [ "On behalf of Snowdin, we hope we can see you again! Somewhere!", "Despite being down here for so long, monsters still held on to hope.", "Because of that hope, we chose to still have families and maintain some sort of community.", "There's nothing that held us together more than seeing the slightest smirk on our children's faces...", "Even if they were only smiling to keep us happy." ]
            }, {
                face: 2,
                lines: [ "Heh..." ]
            }, {
                face: 0,
                lines: [ "It got easier when the skeleton brothers showed up, especially the tall one.", "He gave us hope.", "And now?", "You did, too.", "We all deserve this freedom. That's what I think." ]
            } ]
        },
        whereAmI: {
            label: "Where am I?",
            first: [ {
                face: 6,
                lines: [ "Uh... My Shop?" ]
            }, {
                face: 0,
                lines: [ "Did that white light give you amnesia?", "You look like you haven't opened up your eyes in years." ]
            }, {
                face: 6,
                lines: [ "Or...kind of like you're scared of somethin'?", "What's giving you fear, young'n?" ]
            } ],
            repeat: [ {
                face: 0,
                lines: [ "There's nothing I could tell you that could help.", "But, I can tell you this...", "Once, when the 3rd human was here... The one with a bandana...", "My family was a bit worried. Humans are really strong, y'know?", "One of the young'ins of mine ran up to them, and looked at them dead in their eye.", "They said to them:", '"Leave us alone, please! You big bully! We didn\'t do anything wrong!"', "Before they threw a rock at 'em.", "The human giggled, and left us alone.", "My young'n was shaking, terrified afterward." ]
            }, {
                face: 4,
                lines: [ "All this to say...", "You're stronger, and more fierce than ya think!", "The power you expect outta what's giving you fear..." ]
            }, {
                face: 0,
                lines: [ "It's your imagination, ain't it?" ]
            }, {
                face: 5,
                lines: [ "Why not imagine yourself equally as powerful? Maybe even more so?" ]
            } ]
        },
        againMeaning: {
            label: 'What do you mean "again"?',
            first: [ {
                face: 0,
                lines: [ "You were here before, you might've forgotten." ]
            }, {
                face: 4,
                lines: [ "To buy...somethin'..." ]
            }, {
                face: 1,
                lines: [ "I promise I'm not pulling ya leg to advertise to ya. I'm getting ready to move my store to the surface, so I have nothing to sell anymore anyway." ]
            } ],
            repeat: [ {
                face: 5,
                lines: [ "By the way, all of Snowdin town missed ya!", "Stinks that ya just barely missed the Holidays, they would've accommodated your arrival.", "...?" ]
            }, {
                face: 4,
                lines: [ "No, the Holidays.", "Like, the family of deer." ]
            }, {
                face: 6,
                lines: [ "?" ]
            }, {
                face: 2,
                lines: [ "Sounds like ya already met them before..." ]
            } ]
        },
        rememberMe: {
            label: "Do you remember me?",
            first: [ {
                face: 5,
                lines: [ "Of course I do!", "Do you remember us? You were walking through here only a bit ago with a smile on your face!" ]
            }, {
                face: 2,
                lines: [ "It was so lovely. You had the face of an angel.", "Walking amongst our townsfolk.", "I'm not religious, not exactly.", "But I see why people believe in a higher power. Your presence here gave me so much faith.", "That maybe, we would matter." ]
            } ],
            repeat: [ {
                face: 5,
                lines: [ "You reminded me that it's important to not give up, so I'll always remember you.", "Here, let's make a promise.", "Wherever either of us go, even if we never meet again...", "Let's continue to continue, y'hear?", "It's just like what the king would tell us when we would come to him with worries.", '"Stay Determined."', "What a great motto!" ]
            } ]
        }
    };
    const MEMORY_INTRO = [ "Remember this?", "You were here.", "Not too long ago...", "It may feel like it was only a blip for you...", "A mere stop in your journey of 10,000 steps.", "But, for us?", "It was Acts...", "Acts 12:6-11.", "...", "Let's continue..." ];
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function sayFaceScript(shop, segments, {returnMode: returnMode = "topics", resetExpression: resetExpression = true} = {}) {
        const normalized = Array.isArray(segments) ? segments : [];
        for (let i = 0; i < normalized.length; i++) {
            const segment = normalized[i];
            const isLast = i === normalized.length - 1;
            shop.setExpression(Number(segment.face) || 0);
            await shop.say(segment.lines, {
                returnMode: isLast ? returnMode : "locked"
            });
        }
        if (resetExpression) shop.setExpression(0);
    }
    async function ominousFade(shop, target, duration) {
        try {
            shop.playOneShot("assets/sounds/snd_ominous.wav", 1);
        } catch (error) {}
        await shop.fadeWhiteoutTo(target, duration);
    }
    async function transitionToPage3(shop, token = navigationToken()) {
        if (!window.EramPage3 || !navigationStillCurrent(token) || !shop || shop.destroyed) return;
        const overlay = document.getElementById("page-transition-white");
        if (overlay) {
            overlay.style.transition = "none";
            overlay.classList.add("visible");
            overlay.offsetWidth;
        }
        shop.hide();
        shop.stopMusic();
        if (!navigationStillCurrent(token)) return;
        window.EramPage3.start();
        await wait(120);
        if (!navigationStillCurrent(token)) return;
        if (overlay) {
            overlay.style.transition = "opacity 1.05s ease-in-out";
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    overlay.classList.remove("visible");
                });
            });
            await wait(1100);
            overlay.style.transition = "";
        }
    }
    async function playWhiteoutEnding(shop, sceneToken = navigationToken()) {
        shop.setMode("locked");
        shop.setMenuVisible(false);
        shop.setStatus("");
        shop.setFullDialogueHold(true);
        shop.setExpression(0);
        await shop.say([ "Anyway, imma start heading out. Got a lot to do." ], {
            returnMode: "locked"
        });
        shop.setExpression(0);
        const interruptedLine = shop.say([ "Feel free to-" ], {
            returnMode: "locked"
        });
        while (shop.dialogue.active && shop.dialogue.typing) await wait(16);
        await wait(320);
        shop.advanceDialogue();
        await interruptedLine;
        shop.stopMusic();
        await ominousFade(shop, 0.15, 180);
        await sayFaceScript(shop, [ {
            face: 0,
            lines: [ "...?" ]
        }, {
            face: 6,
            lines: [ "Hey, what's happening to ya?" ]
        } ], {
            returnMode: "locked",
            resetExpression: false
        });
        await ominousFade(shop, 0.28, 180);
        await sayFaceScript(shop, [ {
            face: 6,
            lines: [ "Hey? Buddy?", "What's happening? Why is your SOUL..." ]
        } ], {
            returnMode: "locked",
            resetExpression: false
        });
        await ominousFade(shop, 0.42, 180);
        await sayFaceScript(shop, [ {
            face: 6,
            lines: [ "..." ]
        }, {
            face: 6,
            lines: [ "Wait, stop!" ]
        } ], {
            returnMode: "locked",
            resetExpression: false
        });
        await ominousFade(shop, 0.56, 180);
        await sayFaceScript(shop, [ {
            face: 6,
            lines: [ "Are you gonna be okay? Answer me, please!", "..." ]
        } ], {
            returnMode: "locked",
            resetExpression: false
        });
        await ominousFade(shop, 0.72, 180);
        await sayFaceScript(shop, [ {
            face: 6,
            lines: [ "I promise you'll be okay! Your SOUL never sent you the wrong way before!", "And we're with you! In spirit! No matter where you end up!" ]
        } ], {
            returnMode: "locked",
            resetExpression: false
        });
        await ominousFade(shop, 0.88, 220);
        await sayFaceScript(shop, [ {
            face: 6,
            lines: [ "Just remember that! Y'hear?" ]
        } ], {
            returnMode: "locked",
            resetExpression: false
        });
        const completed = await window.ForNicTransition.whiteout({
            token: sceneToken,
            shop: shop
        });
        if (!completed) return;
        shop.setMenuVisible(false);
        shop.setCharacterVisible(false);
        shop.setFullDialogueHold(false);
        await shop.typeFinalText("D O N ' T   F O R G E T .", 140);
        await wait(900);
        if (!navigationStillCurrent(sceneToken) || shop.destroyed) return;
        await transitionToPage3(shop, sceneToken);
    }
    async function start({onReady: onReady = null} = {}) {
        const sceneToken = navigationToken();
        const {ShopEngine: ShopEngine} = window.UndertaleShop;
        const shop = new ShopEngine({
            background: "assets/art/snowdin shop pic widescreen.png",
            qcComposite: "assets/art/snowdin pic qc widescreen.png",
            soul: "assets/spr_heart_2.png",
            music: "assets/music/snowdrift.mp3",
            character: {
                body: "assets/art/qc/body.png",
                faceBase: "assets/art/qc/face_0.png",
                faces: Array.from({
                    length: 7
                }, (_, i) => `assets/art/qc/face_${i}.png`),
                eyes: Array.from({
                    length: 4
                }, (_, i) => `assets/art/qc/eyes_${i}.png`),
                mouths: [ "assets/art/qc/mouth_0.png", "assets/art/qc/mouth_1.png" ],
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
                animateMouthOnlyOnBaseFace: true,
                staticSpecialFaces: true,
                specialFaceMouthCoverColor: "#7358cf",
                blinkMinMs: 3000,
                blinkMaxMs: 3000,
                blinkHoldMs: 120
            },
            goldText: "723G",
            inventoryText: "8/8"
        });
        activeShop = shop;
        await shop.init();
        if (!navigationStillCurrent(sceneToken) || shop.destroyed) {
            shop.destroy();
            return null;
        }
        const webpageCursor = document.getElementById("heart-cursor");
        if (webpageCursor) webpageCursor.style.display = "none";
        shop.show();
        shop.setCharacterVisible(false);
        shop.setMenuVisible(false);
        shop.setStatus("");
        shop.setBackgroundBrightness(0.18);
        await wait(60);
        if (typeof onReady === "function") try {
            onReady(shop);
        } catch (_) {}
        const qcDialogueBlip = shop.defaultDialogueBlipSound;
        shop.defaultDialogueBlipSound = "";
        await shop.say(MEMORY_INTRO, {
            returnMode: "locked"
        });
        shop.setMenuVisible(false);
        await shop.fadeInQC(1100);
        shop.defaultDialogueBlipSound = qcDialogueBlip;
        shop.setExpression(0);
        await shop.say([ "Hiya, traveler!", "Long time no see." ], {
            returnMode: "locked"
        });
        await shop.startMusic();
        shop.setStatus("* Take your time.");
        shop.setMode("main");
        shop.setMenuVisible(true);
        const seenCounts = {
            helloAgain: 0,
            whereAmI: 0,
            againMeaning: 0,
            rememberMe: 0
        };
        const exhausted = new Set;
        let endingStarted = false;
        async function selectTopic(key) {
            if (endingStarted) return;
            const topic = TOPIC_DATA[key];
            const count = seenCounts[key];
            const lines = count === 0 ? topic.first : topic.repeat;
            seenCounts[key]++;
            await sayFaceScript(shop, lines, {
                returnMode: "topics"
            });
            const topicState = shop.topics.find(item => item.key === key);
            if (topicState && seenCounts[key] === 1) topicState.isNew = true;
            if (seenCounts[key] >= 2) exhausted.add(key);
            if (exhausted.size === 4 && !endingStarted) {
                endingStarted = true;
                await playWhiteoutEnding(shop, sceneToken);
            }
        }
        shop.setTopics([ {
            key: "helloAgain",
            label: TOPIC_DATA.helloAgain.label,
            onSelect: () => selectTopic("helloAgain")
        }, {
            key: "whereAmI",
            label: TOPIC_DATA.whereAmI.label,
            onSelect: () => selectTopic("whereAmI")
        }, {
            key: "againMeaning",
            label: TOPIC_DATA.againMeaning.label,
            onSelect: () => selectTopic("againMeaning")
        }, {
            key: "rememberMe",
            label: TOPIC_DATA.rememberMe.label,
            onSelect: () => selectTopic("rememberMe")
        } ]);
        shop.setMode("main");
        return shop;
    }
    function stop() {
        if (activeShop) {
            try {
                activeShop.destroy();
            } catch (_) {}
            activeShop = null;
        }
    }
    window.SnowdinScene = {
        start: start,
        stop: stop
    };
})();
