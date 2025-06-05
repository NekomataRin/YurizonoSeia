const unhomoglyph = require('unhomoglyph');

const morseMap = {
    '.-': 'a', '-...': 'b', '-.-.': 'c', '-..': 'd',
    '.': 'e', '..-.': 'f', '--.': 'g', '....': 'h',
    '..': 'i', '.---': 'j', '-.-': 'k', '.-..': 'l',
    '--': 'm', '-.': 'n', '---': 'o', '.--.': 'p',
    '--.-': 'q', '.-.': 'r', '...': 's', '-': 't',
    '..-': 'u', '...-': 'v', '.--': 'w', '-..-': 'x',
    '-.--': 'y', '--..': 'z'
};

function decodeMorseIfDetected(text) {
    if (/^[\s.\-]+$/.test(text)) {
        return text
            .trim()
            .split(/\s+/)
            .map(code => morseMap[code] || '')
            .join('');
    }
    return text;
}

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
        '(': 'c', ')': 'o', '#': 'h', '8': 'b', '2': 'z'
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
        /^\W*n[\W_]*[i1!|\*]+[\W_]*[g6]+[\W_]*[g6]+[\W_]*[e3]+[\W_]*[r2]+[\W_]*[s5]?\W*$/i, // Matches n*i*g*g*e*r, n1ggers
        /^\W*n[\W_]*[i1!|\*]+[\W_]*[g6]+[\W_]*[a4@]+\W*$/i, // Matches n*i*g*a, n1gga
        /^\W*n[\W_]*[i1!|\*]+[\W_]*[g6]+[\W_]*[g6]*[\W_]*[a4@e3r2s5]*\W*$/i // Matches nig, nigg, n1g
    ];

    function normalizeContent(text) {
        text = decodeMorseIfDetected(text);

        let cleaned = unhomoglyph(
            text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        ).toLowerCase();

        cleaned = cleaned.replace(/[\u200B-\u200D\u2060\u00A0\u180E\uFEFF]/g, '');
        cleaned = cleaned.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');

        cleaned = [...cleaned]
            .map(c => scriptMap[c] || leetMap[c] || regionalIndicatorToLetter(c) || c)
            .join('');

        cleaned = cleaned.replace(/[^a-z0-9\s-]/g, '');

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

    function isOffensive(content) {
        const normalized = normalizeContent(content);
        const collapsed = collapseForOffensiveCheck(normalized);

        const scriptBypasses = ['ᴺᴵᴳᴳᴱᴿ', 'ᴺᴵᴳᴳᴬ', 'ₙᵢ₉₉ₑᵣ', 'ⁿⁱᵍᵍᵉʳ'];
        if (scriptBypasses.includes(content)) {
            console.log(`Flagged by script bypass: ${content} -> ${normalized} -> ${collapsed}`);
            return true;
        }

        for (const pattern of PartialCensorshipPatterns) {
            if (pattern.test(collapsed)) {
                console.log(`Flagged by partial censorship pattern: ${content} -> ${normalized} -> ${collapsed}`);
                return true;
            }
        }

        if (normalized.length < 3) return false;

        const normalizedWords = normalized.split(/\b\W*\b/g).filter(Boolean);
        for (const safe of FalseAlarms) {
            if (normalizedWords.includes(safe.toLowerCase())) {
                console.log(`Skipped due to false alarm word: ${safe} in ${content} -> ${normalized}`);
                return false;
            }
        }

        const allWords = [...NWords];
        const isMatch = allWords.some(word => {
            const regex = generateRegex(word);
            const match = regex.test(collapsed);
            if (match) {
                console.log(`Flagged by regex for word "${word}": ${content} -> ${normalized} -> ${collapsed}`);
            }
            return match;
        });

        return isMatch;
    }

    if (isOffensive(message.content)) {
        await message.delete().catch(err => console.error(`Failed to delete message: ${err}`));
        await message.channel.send('<:SeiaMuted:1244890584276008970> • Oi! That word is offensive, you know? You cannot say the **N-Word** HERE!');
    }
};