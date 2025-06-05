const unhomoglyph = require('unhomoglyph');

function regionalIndicatorToLetter(char) {
    const code = char.codePointAt(0);
    if (code >= 0x1F1E6 && code <= 0x1F1FF) {
        return String.fromCharCode(code - 0x1F1E6 + 97);
    }
    return char;
}

module.exports = async (client, message) => {
    const IgnoredChannels = [
        '1201818078711918602',
        '1152527869533229126',
    ];

    if (message.author.bot) return;
    if (message.guild.id !== process.env.GUILD_ID) return;
    if (IgnoredChannels.includes(message.channel.id)) return;

    let n = await message.fetch();
    let EditedContent = n.content;
    //console.log(`Processing updated message from ${message.author.tag}: "${EditedContent}"`);

    const NWords = [
        'nigger', 'nigga', 'niga', 'nigg', 'nig', 'nega', 'negga', 'negger',
        'niggers', 'niggas', 'neggas', 'negas', 'neggers', 'niggerian'
    ];

    const FalseAlarms = [
        'nigeria', 'nigerian', 'niger', 'niigata', 'finger', 'zinger', 'bigger',
        'trigger', 'snigger', 'digger', 'rigor', 'vigor', 'winger', 'stinger',
        'giggle', 'jiggle', 'fidget', 'digest', 'regatta', 'beginner', 'dingers',
        'linger', 'migraine', 'shingles', 'tangelo', 'singlet', 'tingle',
        'bungalow', 'jingle', 'mingle', 'single', 'bringer', 'clinger',
        'stringer', 'swingers', 'lingerers', 'congratulations', 'indigenous',
        'magnitude', 'negligence', 'nightingale', 'significance', 'assign',
        'benign', 'dignity', 'malign', 'pigment', 'regime', 'signal', 'ignite',
        'ignorant', 'ignoring', 'cognition', 'recognize', 'magnificent',
        'signature', 'designate', 'aligning',
        'banned', 'doxxing', 'night', 'knight', 'mining', 'dining', 'ning', 'ding',
        'binge', 'hinge', 'tinge', 'fringe', 'ginger', 'contingent', 'contingency',
        'congenial', 'genie', 'genetic', 'regime', 'imagine', 'malignant', 'signature',
        'ignoble', 'magnetic', 'pigsty', 'piglet', 'piggy', 'digging', 'rigging',
        'wiggling', 'jiggly', 'giga', 'giggle', 'jigg', 'fringe', 'singing',
        'king', 'ringing', 'swing', 'wing', 'thing', 'sting', 'fling', 'bring',
        'longing', 'strongest', 'belonging', 'amongst', 'hangin', 'ingot', 'angle',
        'bangle', 'tangle', 'mangled', 'bungled', 'tingled', 'angled', 'mingled',
        'single', 'shingles', 'conging', 'ringworm', 'nightmare', 'nightfall',
        'nightgown', 'negligee', 'nigella', 'niger', 'nigeria', 'nigerian',
        'knight', 'knights', 'knighted', 'agnostic', 'cognitive', 'cognizant'
    ];

    const leetMap = {
        '0': 'o', '1': 'i', '!': 'i', '3': 'e', '4': 'a', '@': 'a',
        '5': 's', '7': 't', '$': 's', '+': 't', '|': 'i', '¡': 'i',
        '¥': 'y', '%': 'a', '6': 'g', '9': 'g', '^': 'a', '=': 'e',
        '(': 'c', ')': 'o', '#': 'h', '8': 'b', '2': 'z', 'l': 'i'
    };

    const scriptMap = {
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
        'ᵃ': 'a', 'ᵇ': 'b', 'ᶜ': 'c', 'ᵈ': 'd', 'ᵉ': 'e', 'ᶠ': 'f', 'ᵍ': 'g', 'ʰ': 'h', 'ⁱ': 'i', 'ʲ': 'j',
        'ᵏ': 'k', 'ˡ': 'l', 'ᵐ': 'm', 'ⁿ': 'n', 'ᵒ': 'o', 'ᵖ': 'p', 'ʳ': 'r', 'ˢ': 's', 'ᵗ': 't', 'ᵘ': 'u',
        'ᵛ': 'v', 'ʷ': 'w', 'ˣ': 'x', 'ʸ': 'y', 'ᶻ': 'z',
        '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
        'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ᵢ': 'i', 'ᵣ': 'r', 'ᵤ': 'u', 'ᵥ': 'v'
    };

    const PartialCensorshipPatterns = [
        /^\W*n[\W_]*[i1!|\*]+[\W_]*[g6]+[\W_]*[g6]+[\W_]*[e3]+[\W_]*[r2]+[\W_]*[s5]?\W*$/i,
        /^\W*n[\W_]*[i1!|\*]+[\W_]*[g6]+[\W_]*[a4@]+\W*$/i,
        /^\W*n[\W_]*[i1!|\*]+[\W_]*[g6]+[\W_]*[g6]*[\W_]*[a4@e3r2s5]*\W*$/i
    ];

    function normalizeContent(text) {
        let cleaned = unhomoglyph(
            text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        ).toLowerCase();

        cleaned = cleaned.replace(/[\u200B-\u200D\u2060\u00A0\u180E\uFEFF]/g, '');
        cleaned = cleaned.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');

        cleaned = [...cleaned]
            .map(c => scriptMap[c] || leetMap[c] || regionalIndicatorToLetter(c) || c)
            .join('');

        cleaned = cleaned.replace(/[^a-z0-9\s-]/g, '');
        //console.log(`Normalized content: "${cleaned}"`);

        return cleaned;
    }

    function generateRegex(word) {
        const separator = `[\\s-]*`;
        const pattern = word
            .split('')
            .map(c => `${c}${separator}`)
            .join('') + '[s]?';
        return new RegExp(`\\b${pattern}\\b`, 'i');
    }

    function collapseForOffensiveCheck(text) {
        return text.replace(/([gri])\1+|([aeiou])\1+/gi, '$1$2');
    }

    function splitRepeats(word, target) {
        const segments = [];
        let current = word;
        const targetLen = target.length;

        while (current.length >= targetLen) {
            if (current.startsWith(target)) {
                segments.push(target);
                current = current.slice(targetLen);
            } else {
                break;
            }
        }

        if (current.length > 0) {
            segments.push(current);
        }

        return segments;
    }

    function isOffensive(content) {
        const normalized = normalizeContent(content);
        const collapsed = collapseForOffensiveCheck(normalized);
        let offensiveCount = 0;
        const offensiveWordsFound = [];

        const scriptBypasses = ['ᴺᴵᴳᴳᴱᴿ', 'ᴺᴵᴳᴳᴬ', 'ₙᵢ₉₉ₑᵣ', 'ⁿⁱᵍᵍᵉʳ'];
        const words = normalized.split(/\s+/).filter(Boolean);
        //console.log(`Checking words: ${words.join(', ')}`);

        for (let word of words) {
            let collapsedWord = collapseForOffensiveCheck(word);
            //console.log(`Checking word "${word}" (collapsed: "${collapsedWord}")`);

            let segmentsToCheck = [word];

            for (const bypass of scriptBypasses) {
                if (word.includes(bypass)) {
                    const segments = splitRepeats(word, bypass);
                    //console.log(`Split "${word}" into segments for script bypass "${bypass}": ${segments.join(', ')}`);
                    segmentsToCheck = segments;
                    break;
                }
            }

            for (const nWord of NWords) {
                if (collapsedWord.includes(nWord)) {
                    const segments = splitRepeats(collapsedWord, nWord);
                    //console.log(`Split "${collapsedWord}" into segments for NWord "${nWord}": ${segments.join(', ')}`);
                    segmentsToCheck = segments;
                    break;
                }
            }

            for (const segment of segmentsToCheck) {
                const collapsedSegment = collapseForOffensiveCheck(segment);
                //console.log(`Checking segment "${segment}" (collapsed: "${collapsedSegment}")`);

                if (scriptBypasses.includes(segment)) {
                    //console.log(`Flagged by script bypass: ${segment} -> ${collapsedSegment}`);
                    offensiveWordsFound.push(segment);
                    offensiveCount++;
                    continue;
                }

                for (const pattern of PartialCensorshipPatterns) {
                    if (pattern.test(collapsedSegment)) {
                        //console.log(`Flagged by partial censorship pattern: ${segment} -> ${collapsedSegment}`);
                        offensiveWordsFound.push(segment);
                        offensiveCount++;
                        continue;
                    }
                }

                if (collapsedSegment.length < 3) continue;

                if (FalseAlarms.includes(collapsedSegment.toLowerCase())) {
                    //console.log(`Skipped due to false alarm word: ${segment} -> ${collapsedSegment}`);
                    continue;
                }

                const isMatch = NWords.some(nWord => {
                    const regex = generateRegex(nWord);
                    const match = regex.test(collapsedSegment);
                    if (match) {
                        //console.log(`Flagged by regex for word "${nWord}": ${segment} -> ${collapsedSegment}`);
                        offensiveWordsFound.push(segment);
                        offensiveCount++;
                    }
                    return match;
                });

                if (isMatch) continue;
            }
        }

        if (offensiveCount > 0) {
            //console.log(`Found ${offensiveCount} offensive word(s): ${offensiveWordsFound.join(', ')}`);
            return true;
        }

        //console.log('No offensive words found.');
        return false;
    }

    if (isOffensive(EditedContent)) {
        try {
            await message.delete();
            //console.log(`Deleted message from ${message.author.tag}`);
        } catch (err) {
            console.error(`Failed to delete message: ${err}`);
        }
        await message.channel.send(`<:SeiaMuted:1244890584276008970> • ${message.author} That word is offensive, you know? You cannot say the **N-Word** HERE!`);
    }
};