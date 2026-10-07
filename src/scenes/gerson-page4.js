(() => {
    "use strict";
    const TEN_MINUTES = 10 * 60 * 1000;
    let activeShop = null;
    let activeAsgorePiano = null;
    function navigationToken() {
        return window.ForNicNavigation && typeof window.ForNicNavigation.getToken === "function" ? window.ForNicNavigation.getToken() : 0;
    }
    function navigationStillCurrent(token) {
        return !window.ForNicNavigation || typeof window.ForNicNavigation.isCurrent !== "function" || window.ForNicNavigation.isCurrent(token);
    }
    const TOPIC_DATA = {
        heyThere: {
            label: "Hey there.",
            first: [ "Nice to see you again.", "I tell ya, I wasn't worried one bit!", "I told you the king's a friendly guy!", "King Fluffybuns...I knew he wouldn't cause you any trouble...", "Oh? He did? He almost what?", "...", "Woah there! You're back!" ],
            repeat: [ "Undyne probably gave you trouble.", "Yeah...There goes the little urchin...ready to fight humans with no fear! Wa ha ha!", "Y'know...", "Tell no one this, not even her.", "Her power... at its deepest, is unimaginable.", "I reckon that in the heat of the moment, if all hope was lost...", "She'd rise up. Her power would be absolutely glorious. Even if it would kill her, she'd rise up.", "A warrior spirit, through and through.", "The only one that could stop her even when she's determined...", "Is you, probably. Geheheh...", "Can I ask that ya keep an eye out for her? Keep her safe?", "No matter where you both end up." ]
        },
        emblem: {
            label: "That emblem behind you...",
            firstBeforeStop: [ "Yeah, it seems the prophecy came true!", "Everyone's was running through 'ere all excited.", "I'm not one to run down on the fun parade...", "But," ],
            firstAfterStop: [ "I don't know how to feel about it.", "Not being free, no.\nWe LONGED for liberty!", "I'm talkin' about what they call \"fate\".", "I don't believe in it.", "..." ],
            repeat: [ "Guess I can't be too gloomy, though.", "I've got dreams! This shop 'ere finally made me enough money to get started?", "First I need to buy a lot of ink and...", "Hm? What's that I'm talking about?", "...", "Keep your eyes open. That's all I can say." ]
        },
        king: {
            label: "I met the king",
            first: [ "And that's where everything went down, eh?", "Yeah, maybe if you brought the hammer with you, things woulda gone smoother.", "But I have a hard time giving children weapons.", "Look what happened with Undyne. Wa ha ha!", "...", "Don't let 'er know I said that." ],
            repeatBeforeStop: [ "Once, on an anniversary of the war...", "The King and I, we were sitting down in New Home, having some tea.", "Two old men reminiscing on the good ol days.", "Even grown men can get lost in old memories sometimes, y'know?" ],
            peculiar: [ "He asked me a... peculiar question while we were drinking the tea." ],
            asgore: [ '"... Gerson?"', '"This weird sense of deja vu I get...It has left me curious..."', "\"As all the humans fell down, I could see their spirit in their eyes.\nSome were full of hope, some were full of despair, but all were filled with a sense of intrigue.\nThey either told me\n'We don't have to do this!'\nOr\n'We didn't have to do this.'\"", '"Afterward, I lost sleep."', '"Gerson...\nDo you think...\nDo you think I could actually change?"' ],
            afterAsgore: [ "I tell ya. Both of you.", "People can be changed...", "Even the worst person can.", "That's what I believe.", "The question is...\nThe story of your life...\nAnd all the journeys that comprise your chapters...", "Can you revise it?", 'I guess "fate" awaits your answer, little one.' ]
        }
    };
    async function sayWithEyes(shop, lines, frames, options = {}) {
        for (let index = 0; index < lines.length; index++) {
            if (!shop.active || shop.destroyed) return;
            await shop.say([ lines[index] ], {
                ...options,
                eyeFrame: frames[index] ?? 0,
                returnMode: index === lines.length - 1 ? options.returnMode ?? "topics" : "locked"
            });
        }
    }
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function safeStop(audio) {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (_) {}
    }
    function fadeInAudio(audio, target = 0.72, duration = 1800) {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0;
            const attempt = audio.play();
            if (attempt !== void 0) attempt.then(() => {
                const start = performance.now();
                const step = now => {
                    if (!audio || audio.paused) return;
                    const progress = Math.max(0, Math.min(1, (now - start) / duration));
                    audio.volume = target * progress;
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }).catch(() => {});
        } catch (_) {}
    }
    async function ominousFade(shop, target, duration) {
        try {
            shop.playOneShot("assets/sounds/snd_ominous.wav", 1);
        } catch (_) {}
        await shop.fadeWhiteoutTo(target, duration);
    }
    async function playEnding(shop, token = navigationToken()) {
        shop.setMode("locked");
        shop.setMenuVisible(false);
        shop.setStatus("");
        shop.setFullDialogueHold(true);
        shop.stopMusic();
        await sayWithEyes(shop, [ "Eh? What's going on?", "Is that...?", "Heh. Geheheh.", "Haven't seen one in a long while.", "A human SOUL." ], {
            4: 3
        }, {
            returnMode: "locked"
        });
        await ominousFade(shop, 0.24, 350);
        await shop.say([ "See ya, bub! That must be fate calling you back!", "Don't be scared, you can fight it! Anytime, anyplace!" ], {
            returnMode: "locked"
        });
        await ominousFade(shop, 0.48, 350);
        await shop.say([ "Don't you worry a little hair on your head! I'm sure where you're going is somewhere just fine!" ], {
            returnMode: "locked"
        });
        await ominousFade(shop, 0.72, 350);
        await shop.say([ "By the by! Our little talk? About Asgore! Never forget it! Keep it logged in the back of yer brainstems!", "Ya hear me?!" ], {
            returnMode: "locked"
        });
        const completed = await window.ForNicTransition.whiteout({
            token: token,
            shop: shop
        });
        if (!completed) return;
        shop.setMenuVisible(false);
        shop.setCharacterVisible(false);
        shop.setFullDialogueHold(false);
        await shop.typeFinalText("D O N ' T   F O R G E T .", 135);
        await wait(900);
        if (!navigationStillCurrent(token) || !shop || shop.destroyed || !window.Page5Scene || typeof window.Page5Scene.transitionFromShop !== "function") return;
        await window.Page5Scene.transitionFromShop(shop);
    }
    async function start({onReady: onReady = null} = {}) {
        const sceneToken = navigationToken();
        const {ShopEngine: ShopEngine} = window.UndertaleShop;
        const stage = document.getElementById("undertale-stage");
        if (stage) stage.style.display = "";
        const shop = new ShopEngine({
            background: "assets/art/gerson-shop-widescreen.png",
            qcComposite: null,
            soul: "assets/spr_heart_2.png",
            dialogueBlipSound: "assets/sounds/SND_TXT1.wav",
            music: "assets/music/Ashdrift.wav",
            character: {
                arm: "assets/art/gerson/ripped/arm.png",
                body: "assets/art/gerson/ripped/body.png",
                faceBase: "assets/art/gerson/ripped/mouthtop.png",
                faces: [],
                eyes: [ "assets/art/gerson/ripped/eyes_0.png", "assets/art/gerson/ripped/eyes_1.png", "assets/art/gerson/ripped/eyes_2.png", "assets/art/gerson/ripped/eyes_3.png", "assets/art/gerson/ripped/eyes_4.png" ],
                mouths: [ "assets/art/gerson/ripped/mouthbottom.png", "assets/art/gerson/ripped/mouthbottom.png" ],
                mouthBehindFace: true,
                armBox: {
                    x: 651,
                    y: 228,
                    w: 282,
                    h: 312
                },
                bodyBox: {
                    x: 933,
                    y: 330,
                    w: 342,
                    h: 210
                },
                faceBox: {
                    x: 837,
                    y: 96,
                    w: 270,
                    h: 240
                },
                eyesBox: {
                    x: 837,
                    y: 186,
                    w: 150,
                    h: 72
                },
                mouthBox: {
                    x: 909,
                    y: 282,
                    w: 156,
                    h: 174
                },
                talkArmOffsetX: 6,
                talkArmOffsetY: 6,
                talkHeadOffsetX: 0,
                talkHeadOffsetY: 18,
                talkEyeOffsetX: 0,
                talkEyeOffsetY: 18,
                freezeEyeWhileTalking: true,
                idleEyeFrame: 0,
                blinkEnabled: false,
                resetEyesOnSay: true,
                mouthFrameMs: 145,
                blinkMinMs: 3400,
                blinkMaxMs: 6200,
                blinkHoldMs: 120
            },
            statusText: "",
            mainStatusText: '* Guess our "angel" is back...',
            topicPrompt: "Care to chat?",
            goldText: "723G",
            inventoryText: "8/8"
        });
        activeShop = shop;
        await shop.init();
        if (!navigationStillCurrent(sceneToken) || shop.destroyed) {
            shop.destroy();
            return null;
        }
        shop.show();
        shop.setCharacterVisible(false);
        shop.setMenuVisible(false);
        shop.setStatus("");
        shop.setMode("locked");
        shop.setBackgroundBrightness(0.18);
        await wait(60);
        if (typeof onReady === "function") try {
            onReady(shop);
        } catch (_) {}
        const gersonDialogueBlip = shop.defaultDialogueBlipSound;
        shop.defaultDialogueBlipSound = "";
        await shop.say([ "Remember this?", "I'm sure you do.", "There was a lot going on back then.", "I'm sure not all of these memories are pleasant, but...", "Do you still care? About them?" ], {
            returnMode: "locked"
        });
        let cares = false;
        while (!cares) {
            const answer = await shop.choose("Do you still care? About them?", [ "YES", "NO" ], {
                selection: 0
            });
            if (answer === 0) {
                cares = true;
                break;
            }
            await shop.say([ "Then why are you here?" ], {
                returnMode: "locked"
            });
            await wait(TEN_MINUTES);
            await shop.say([ "I'll ask again...", "Do you still care about them?" ], {
                returnMode: "locked"
            });
        }
        await shop.say([ "Then...", "Proceed." ], {
            returnMode: "locked"
        });
        await shop.fadeInCharacter(900);
        shop.defaultDialogueBlipSound = gersonDialogueBlip;
        await shop.say([ "Woah there! You're back!", "Haven't seen you since the white light took over my one eye's vision! Wa ha ha!" ], {
            returnMode: "locked"
        });
        await shop.startMusic();
        const asgorePiano = new Audio("assets/music/asgore-talks.mp3");
        activeAsgorePiano = asgorePiano;
        asgorePiano.preload = "auto";
        asgorePiano.loop = true;
        const seenCounts = {
            heyThere: 0,
            emblem: 0,
            king: 0
        };
        const exhausted = new Set;
        let endingStarted = false;
        async function selectTopic(key) {
            if (endingStarted) return;
            const count = seenCounts[key];
            if (key === "heyThere") {
                const lines = count === 0 ? TOPIC_DATA.heyThere.first : TOPIC_DATA.heyThere.repeat;
                seenCounts[key]++;
                await sayWithEyes(shop, lines, count === 0 ? {
                    0: 2,
                    3: 1,
                    5: 4
                } : {
                    0: 2,
                    1: 1,
                    3: 3,
                    6: 2,
                    11: 4
                }, {
                    returnMode: "topics"
                });
            }
            if (key === "emblem") {
                seenCounts[key]++;
                if (count === 0) {
                    await sayWithEyes(shop, TOPIC_DATA.emblem.firstBeforeStop, {
                        0: 0,
                        2: 1
                    }, {
                        returnMode: "locked"
                    });
                    shop.pauseMusic();
                    await sayWithEyes(shop, TOPIC_DATA.emblem.firstAfterStop, {
                        1: 2,
                        2: 1,
                        3: 1,
                        4: 3
                    }, {
                        returnMode: "locked"
                    });
                    const fateAnswer = await shop.choose("Do you..?", [ "I do", "I do not" ], {
                        selection: 0,
                        eyeFrame: 3
                    });
                    if (fateAnswer === 0) await sayWithEyes(shop, [ "Interesting...", "Very,", "very,", "interesting" ], {
                        0: 3,
                        1: 3,
                        2: 3,
                        3: 3
                    }, {
                        returnMode: "locked"
                    }); else await sayWithEyes(shop, [ "Wa ha ha!", "I knew I could count on ya!", "Why would fate keep us down here, anyway?" ], {
                        0: 3,
                        1: 3,
                        2: 3
                    }, {
                        returnMode: "locked"
                    });
                    await shop.resumeMusic();
                    shop.setMode("topics");
                } else await sayWithEyes(shop, TOPIC_DATA.emblem.repeat, {
                    1: 2,
                    2: 2,
                    4: 4,
                    5: 3
                }, {
                    returnMode: "topics"
                });
            }
            if (key === "king") {
                seenCounts[key]++;
                if (count === 0) await sayWithEyes(shop, TOPIC_DATA.king.first, {
                    0: 1,
                    1: 2,
                    3: 2
                }, {
                    returnMode: "topics"
                }); else {
                    await sayWithEyes(shop, TOPIC_DATA.king.repeatBeforeStop, {
                        0: 4,
                        2: 1,
                        3: 4
                    }, {
                        returnMode: "locked"
                    });
                    shop.pauseMusic();
                    shop.setFullDialogueHold(true);
                    await sayWithEyes(shop, TOPIC_DATA.king.peculiar, {
                        0: 4
                    }, {
                        returnMode: "locked"
                    });
                    fadeInAudio(asgorePiano, 0.72, 1800);
                    await shop.say(TOPIC_DATA.king.asgore, {
                        returnMode: "locked",
                        blipSound: "assets/sounds/snd_txtasg.wav"
                    });
                    safeStop(asgorePiano);
                    await shop.resumeMusic();
                    await sayWithEyes(shop, TOPIC_DATA.king.afterAsgore, {
                        0: 4,
                        6: 3
                    }, {
                        returnMode: "topics"
                    });
                    shop.setFullDialogueHold(false);
                }
            }
            const topicState = shop.topics.find(item => item.key === key);
            if (topicState && seenCounts[key] === 1) topicState.isNew = true;
            if (seenCounts[key] >= 2) exhausted.add(key);
            if (exhausted.size === 3 && !endingStarted) {
                endingStarted = true;
                await playEnding(shop, sceneToken);
            }
        }
        shop.setTopics([ {
            key: "heyThere",
            label: TOPIC_DATA.heyThere.label,
            onSelect: () => selectTopic("heyThere")
        }, {
            key: "emblem",
            label: TOPIC_DATA.emblem.label,
            onSelect: () => selectTopic("emblem")
        }, {
            key: "king",
            label: TOPIC_DATA.king.label,
            onSelect: () => selectTopic("king")
        } ]);
        shop.setStatus('* Guess our "angel" is back...');
        shop.setMode("main");
        shop.setMenuVisible(true);
        return shop;
    }
    function stop() {
        if (activeAsgorePiano) {
            safeStop(activeAsgorePiano);
            activeAsgorePiano = null;
        }
        if (activeShop) {
            try {
                activeShop.destroy();
            } catch (_) {}
            activeShop = null;
        }
    }
    window.GersonPage4 = {
        start: start,
        stop: stop
    };
})();
