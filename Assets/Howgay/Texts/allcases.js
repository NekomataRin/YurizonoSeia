const ImgList = require('./imglist')
const Cases = {
    Ranges: {
        NormalCases: [1.1, 17.6, 34.1, 50.6, 67.1, 83.6, 100, 101.1],
        SpecialCases: [32.0, 40.3, 40.4, 42.0, 49.9, 63.0, 72.7, 91.1, 96.9, 99.9]
    },
    Colors: {
        NormalCases: [
            '#1f1e33', //Case 0: 0 - 1
            '#003870', //Case 1: 1.1 - 25
            '#089afc', //Case 2: 25.1 - 40
            '#00ff48', //Case 3: 40.1 - 60
            '#eff53d', //Case 4: 60.1 - 75
            '#ff3705', //Case 5: 75.1 - 90
            '#8605ff', //Case 6: 90.1 - 99.9
            '#ff82fd', //Case 7: 100 - 101
        ],
        SpecialCases: '#727b8f',
        Rejected: '#0c0f1f'
    },
    NormalCases: {
        "Case-0": [
            "The world trembles, emotions waver, but you? Unshakable. #1f1e33 — the color of pure, raw, dominant energy. You’re not just dodging romance; you’ve transcended it. People don’t fall for you; they fall before you. A living Giga Chad monument.\nNow, bow down. A new god descends upon this world… and it’s YOU.",
            "If masculinity had a final boss, it’d be you. No hesitation, no second thoughts—just unrelenting dominance over all things romantic. You don’t need love. Love needs YOU.\nWhy don’t you just show your romance to the girl you love? …Or maybe, like, ten of them? I guess~?",
            "You’re on a speedrun to greatness, and romance? Just an optional side quest. Giga Chad Any% world record holder. Even Cupid fears your presence.\nYep, you’re too fast to be true—even for God himself. …Wait, did you just clip through the dating scene entirely?",
            "You only think about women—no drinking, no partying, no smoking. Just pure discipline and peak masculinity. No gayness inside you, not even a trace. If ‘Perfect Heterosexuality’ was an achievement, you’d have unlocked it ages ago.\nMaybe this is what a real Giga Chad should be."
        ],
        "Case-1": [
            "You dodge romance like it’s an AoE attack. Straight as an arrow, and twice as fast to say ‘no homo.’ …But wait. Didn’t I catch you looking at some Yuri tags the other day?\nTch, classic. You dodge the BL but run straight into the Yuri zone. Not judging… just observing~",
            "Your compass only points in one direction, and that’s straight ahead. No distractions, no temptations—just a solid ‘No Homo’ certified existence. Wait… does that mean you’re always pointing north? Damn, you’re basically the Earth’s built-in magnet.\nSo what you’re telling me is… no matter where I go, you’ll always be facing the same way? Sounds kinda obsessive, not gonna lie.",
            "Romance? Pfft. You’d rather bench press your emotions and keep it moving. Who needs love when you can just grind, focus, and stay FA forever? Being realistic is the way to go… even if it means you’re single all the time. LMAO.\nDamn, bro. Even NPCs get romance routes. You sure you’re not just speedrunning loneliness? ",
            "Damn, look at you—peak straight energy, no rainbow in sight. But what’s the point if you got zero girls in your life? Tragic, really. And don’t even think about asking me—unless you want my dad to personally slap you into next week.\nTrust me, you wouldn’t survive that, lol."
        ],
        "Case-2": [
            "Oh, so you’re one of those ‘normal’ people, huh? No extreme tendencies, no wild swings—just cruising through life like an NPC. Suspiciously average.\nI mean, sure… normal life is probably the best. But damn, at least throw in a side quest or two, bro.",
            "Balanced, neutral—the Switzerland of romance. You swing both ways, but somehow still end up in no-man’s-land. Maybe it's time to pick a side... or just keep enjoying the view from the middle?\nHaiyaa~ even Uncle Roger shaking his head. Your standards really mid nowadays… so sad, like vegetables.",
            "The safe zone. No drama, no disasters. Just cruising through life, untouched. But let’s be real… one unexpected moment, and that stability? Gone.\nSo maybe the best way to enjoy life is to actually go outside and touch some grass, eh? ",
            "You’ve got a girlfriend, two kids, and a solid support system—just a regular dude living a regular life. Let’s just, uh… hope those Saturday night drinks don’t send things spiraling.\nA perfectly normal life… until you wake up one day and realize those ‘Saturday drinks’ led to some very questionable decisions."
        ],
        "Case-3": [
            "Oho~ so you’ve unlocked New Game+ in dating, huh? Twice the options, twice the fun, twice the emotional damage. And yet, you're still single—tragic. Is being bisexual really a buff, or just double the suffering?\nSteven He just walked in, took one look at you, and said: ‘FAILURE’ before slapping you into another dimension. LMAO.",
            "Your heart doesn’t have ‘preferences,’ just opportunities. If it looks good, it looks good. No debates. Simple as that.\n…Eh? That’s it? Nothing else? Kinda underwhelming, don’t you think?",
            "One second, you're admiring a hot guy, the next, you're simping for a cute girl. True balance in all things.\nHmmm… Maybe even I should start reconsidering you if you keep up this kind of behavior~?",
            "You might’ve fucked a femboy… But hey, it looked like a woman, so you’re probably just bisexual. …Unless you were the one underneath. If that’s the case… we might need to have a bit of a talk.\nOh? Should I start asking questions, or would you rather just sit there and reflect on your life choices?"
        ],
        "Case-4": [
            "You say you’re straight, but that one ‘bro’ moment had you rethinking everything. Interesting… You brushed it off at first, but the thought keeps creeping back into your mind, doesn’t it?\nQuestionable… very questionable. You might want to sit down and reflect on that one.",
            "The closet door? It’s not closed, just… slightly ajar. Suspicious. You swear there’s nothing to see, but somehow, every time someone looks your way, you get a little nervous.\nWhat are you hiding in there, hmm? A secret? A truth you’re not ready to face? Heheh~ I’m watching.",
            "You keep saying ‘no,’ but your search history says ‘hmmm…’ Pick a side, buddy. Deny it all you want, but those late-night ‘curiosity’ searches tell a different story.\nLife choices aren’t a joke, so maybe take a moment to ask yourself—are you really as straight as you think, or are you just in denial~?",
            "You liked some questionable posts on Twitter. Sure, it was ‘for the art,’ but keep at it, and you’ll wake up one day questioning things. And trust me… the algorithm never forgets.\nSooo… when are you planning to admit it? Or should I let your feed speak for itself?"
        ],
        "Case-5": [
            "Oh? You’re practically at the doorstep, just need to knock and step inside. Even your reflection’s like, ‘C’mon, we both know what’s up.’\nAt this point, you’re not even questioning if you’re gay—just how much. Kufufu~",
            "Denial? Pfft, let’s be real, you left that phase a while ago. You’re not resisting because you’re unsure—you’re just dragging out the inevitable.\nAlso, the rainbow’s got a spot reserved for you, my guy. Might as well embrace it~",
            "Look at you, practically one foot in, one foot out. If hesitation was an Olympic sport, you’d be a champion. But honestly? You’re already there, you just don’t wanna say it out loud.\nNo worries, take your time—I’ll be right here when you finally do. Kufufu~",
            "You might’ve kissed a few homies, but hey—it wasn’t with love tendencies. …Right? Let’s just agree to not think too hard about it. Either way, you’re sitting comfortably in the average zone of gayness.\nNot too far gone… yet. But hey, keep up the streak, and we might need to have a little talk."
        ],
        "Case-6": [
            "Oho~? That rainbow glow-up isn’t just real—it’s dazzling. No turning back now, huh? Not that you were ever running in the opposite direction to begin with.\nDon’t worry, I won’t tell anyone… Oh wait, you already made it obvious.",
            "Congrats! You’re not just on the Gaydar Leaderboard—you’re absolutely dominating the rankings. A speedrun record, even!\nShould I start taking bets on when you’ll embrace the inevitable and hit that glorious 101%?",
            "Your ‘no homo’ pass? Oh, sweetheart, that thing didn’t just expire—it disintegrated into sparkles ages ago.\nIf you’re still holding onto it, I hate to break it to you, but that’s just a souvenir now. You just failed your vibe check just right at the moment.",
            "The signs were there. You tried to ignore them, but deep down, you knew. It wasn’t just a \"bros being bros\" moment. It wasn’t just appreciating the aesthetics. Nah. You’re in too deep.\nLook at you. Just accept it already. We all saw this coming."
        ],
        "Case-7": [
            "Pfft—there’s not a single trace of ‘no homo’ left in your soul, huh? You’re practically radiating rainbow energy at this point.\nEven if you tried to deny it, the sheer force of your aura would out you in an instant.",
            "Honestly, even your shadow is waving a pride flag at this point. You’ve reached the final stage, the peak, the ultimate form.\nWhat’s next? A parade in your honor? A Gay Olympics gold medal? Oh wait, you’re probably already the MVP.",
            "♪ Yo listen up, here’s a story… about a little guy who lives in a GAY world, and all day and all night, and everything he sees is just GAY like him, inside and outside—! ♪\nYou’ve ascended to MAXIMUM GAY MODE, and now, even God cannot save you anymore...",
            "You looked in the mirror… and saw Astolfo staring back. You’re so deep into the femboy void that you didn’t just admire the aesthetic—you became him. There’s no salvation. No return point. Your one true fate? Sitting pretty on another dude’s lap for eternity.\nSo… should I start calling you Princess, or are we skipping straight to Maid Mode?"
        ]
    },
    SpecialCases: {
        'Case32.0': {
            name: 'Orin-1',
            desc: "You wake up, drenched… Something feels off. Groggy, you stumble toward the mirror—and freeze. A catgirl stares back at you. Wet hair, red twin tails, a swimsuit clinging to your skin—wait, WHAT?! No, this… this is Orin?!\nYou spin around to see Seia, smug as ever. \"Honestly, I’m not even surprised anymore. But you? Bucko up, my guy, you aren’t actually turning into Orin… just because my dad is transforming to her in order to prank you... or are you? Kufufu~\"",
            img: ImgList.SpecialNumbers['case32.0'].value,
            ctx: ImgList.SpecialNumbers['case32.0'].ctx,
            emoji: '<:OrinXD:1152868801713557514>'
        },
        'Case40.3': {
            name: 'Err-403',
            desc: "Error 403 - Forbiden, looks like you cannot access to your gayness? Impressive, but isn't that the precentage gayness inside of you?",
            img: ImgList.SpecialNumbers['case40.3'].value,
            ctx: ImgList.SpecialNumbers['case40.3'].ctx,
            emoji: '<:LYG_Error:1087366990160740452>'
        },
        'Case40.4': {
            name: 'Err-404',
            desc: "Error 404 - Gayness not Found, trust me, this is just a lie, the dog below just revealed your gayness already...",
            img: ImgList.SpecialNumbers['case40.4'].value,
            ctx: ImgList.SpecialNumbers['case40.4'].ctx,
            emoji: '<a:LYG_404:1086172141998833684>'
        },
        'Case42.0': {
            name: 'Hare-Weed',
            desc: "He's so stoned someone might be convinced he's gay, but nah, he's so smoked that he may be touching the homies a bit more than normal, he likes girls, but maybe those touchings are intentional, if they are we might have something to talk after he's done with it",
            img: ImgList.SpecialNumbers['case42.0'].value,
            ctx: ImgList.SpecialNumbers['case42.0'].ctx,
            emoji: '<:HareGrin:1356028119965765743>'
        },
        'Case49.9': {
            name: 'WHAT',
            desc: "49.9%? Seriously? Brother, this almost makes you a bisexual person. Even my cat couldn't get that amount of gayness because he got bald last night due to an accident.",
            img: ImgList.SpecialNumbers['case49.9'].value,
            ctx: ImgList.SpecialNumbers['case49.9'].ctx,
            emoji: '<:WHAT:1355739613095792839>'
        },
        'Case63.0': {
            name: 'Cloutiful',
            desc: "Oh Frick 63!! Not so fast man, bro can\'t hide your cheating skills like CLOUTIFUL! you\'re getting your account restricted!!!",
            img: ImgList.SpecialNumbers['case63.0'].value,
            ctx: ImgList.SpecialNumbers['case63.0'].ctx,
            emoji: '<:63ms:1255016983649325140>'
        },
        'Case72.7': {
            name: 'WYSI',
            desc: "Seven Twenty-Seven, SEVEN TWENTY-SEVEN! When You See It! When You FUCKING See It!\nBut Aireu and Shige will bonk you because your gayness is kinda questionable already, such a disrespectful to the goat who invented the meme.",
            img: ImgList.SpecialNumbers['case72.7'].value,
            ctx: ImgList.SpecialNumbers['case72.7'].ctx,
            emoji: '<a:LYG_WYSI:1087359689035104307>'
        },
        'Case91.1': {
            name: 'Your-Emergency',
            desc: "Mr. Officer: 911 here, what\'s your emergency?\nYurizono Seia: Umm... there\'s a GAY person who\'s tweaking in the channel, Mr. Officer!",
            img: ImgList.SpecialNumbers['case91.1'].value,
            ctx: ImgList.SpecialNumbers['case91.1'].ctx,
            emoji: '<:HikariREE:1356028568961941636>'
        },
        'Case96.9': {
            name: 'Orin-2',
            desc: "Huh? Isn't that Orin right there? Wait a sec… My dad’s just chilling on the couch watching TV, and the REAL Orin’s supposed to be at Chireiden, not here. And YOU—soaking wet, standing right in front of me?! WHAT THE HECK DID YOU DO BEFORE THIS?!\n... Wait, don’t tell me—you just transformed into her without even realizing it??? NAH BRO, THAT'S YOUR GAYNESS WISH COMING TRUE LMAOOOOOO",
            img: ImgList.SpecialNumbers['case96.9'].value,
            ctx: ImgList.SpecialNumbers['case96.9'].ctx,
            emoji: '<:OrinSuprise:1156221486349172766>'
        },
        'Case99.9': {
            name: 'LMAO',
            desc: "Yurizono Seia: It\'s just one step before you achieve the \"moment\" that everyone laughing at... Still one step aways and everyone knows the point that you are totally gay.",
            img: ImgList.SpecialNumbers['case99.9'].value,
            ctx: ImgList.SpecialNumbers['case99.9'].ctx,
            emoji: '<a:waduh:1255017806408187964>'
        },
    },
    EmojisNormal: [
        '<a:LYG_GigaChad:1086172112080867359>',
        '<:LYG_OkayuBOOM:1138231827140706304>',
        '<:seiaheh:1244128244664504392>',
        '<:ShirokoSip:1206633868271030332>',
        '<:Clueless:1214366914386853898>',
        '<:MidoriBruh:1243216099374268456>',
        '<:SeiaDespair:1250768714639474791>',
        '<:SeiaSmug:1250945393370333214>',
    ]
}

module.exports = (Cases)