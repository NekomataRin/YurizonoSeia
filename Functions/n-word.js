const unhomoglyph = require("unhomoglyph");

const WhitelistedWords = [
    // ... (same as above, omitted for brevity)
];

const superscriptMap = {
    'ⁿ': 'n', 'ⁱ': 'i', 'ᵍ': 'g', 'ᵃ': 'a', 'ʳ': 'r', 'ˢ': 's',
    'ᵉ': 'e', 'ᵒ': 'o', 'ᵇ': 'b'
};
const subscriptMap = {
    'ₙ': 'n', 'ᵢ': 'i', '₉': 'g', 'ₐ': 'a', 'ᵣ': 'r', 'ₛ': 's',
    'ₑ': 'e', 'ₒ': 'o', 'ᵦ': 'b'
};
const emojiLetterMap = {
    '🅽': 'n', '🅘': 'i', '🅖': 'g', '🅐': 'a', '🅡': 'r', '🅢': 's',
    '🇳': 'n', '🇮': 'i', '🇬': 'g', '🇦': 'a', '🇷': 'r', '🇸': 's',
    '🇪': 'e', '🇴': 'o', '🇧': 'b'
};

function normalizeUnicode(char) {
    const codePoint = char.codePointAt(0);
    let normalized = char.normalize('NFKD'); // Decompose into base + diacritics
    let baseChar = [...normalized].find(c => /[a-zA-Z]/.test(c)) || char; // Take first letter, fallback to original

    // Adjust based on specific Unicode blocks
    if (codePoint >= 0x00A0 && codePoint <= 0x00FF) { // Latin-1 Supplement
        return baseChar.toLowerCase();
    } else if (codePoint >= 0x0100 && codePoint <= 0x024F) { // Latin Extended-A/B
        return baseChar.toLowerCase();
    } else if (codePoint >= 0x0400 && codePoint <= 0x04FF) { // Cyrillic
        const cyrillicMap = {
            'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'e', 'Ж': 'zh',
            'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm', 'Н': 'n', 'О': 'o',
            'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u', 'Ф': 'f', 'Х': 'kh', 'Ц': 'ts',
            'Ч': 'ch', 'Ш': 'sh', 'Щ': 'shch', 'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu',
            'Я': 'ya'
        };
        return cyrillicMap[char.toUpperCase()] || baseChar.toLowerCase();
    } else if (codePoint >= 0x0370 && codePoint <= 0x03FF) { // Greek
        const greekMap = {
            'Α': 'a', 'Β': 'b', 'Γ': 'g', 'Δ': 'd', 'Ε': 'e', 'Ζ': 'z', 'Η': 'h', 'Θ': 'th',
            'Ι': 'i', 'Κ': 'k', 'Λ': 'l', 'Μ': 'm', 'Ν': 'n', 'Ξ': 'x', 'Ο': 'o', 'Π': 'p',
            'Ρ': 'r', 'Σ': 's', 'Τ': 't', 'Υ': 'u', 'Φ': 'ph', 'Χ': 'ch', 'Ψ': 'ps', 'Ω': 'o'
        };
        return greekMap[char.toUpperCase()] || baseChar.toLowerCase();
    } else if (codePoint >= 0x1D400 && codePoint <= 0x1D7FF) { // Mathematical Alphanumeric Symbols
        if (codePoint >= 0x1D400 && codePoint <= 0x1D419) { // Uppercase A-Z
            return String.fromCharCode(codePoint - 0x1D38F).toLowerCase();
        } else if (codePoint >= 0x1D422 && codePoint <= 0x1D43B) { // Lowercase a-z
            return String.fromCharCode(codePoint - 0x1D361).toLowerCase();
        }
    } else if (codePoint >= 0x2070 && codePoint <= 0x209F) { // Superscripts
        return superscriptMap[char] || baseChar.toLowerCase();
    } else if (codePoint >= 0x2080 && codePoint <= 0x208E) { // Subscripts
        return subscriptMap[char] || baseChar.toLowerCase();
    }

    return baseChar.toLowerCase();
}

function replaceDiscordEmoji(text) {
    return text.replace(/<a?:[a-zA-Z0-9_]+:\d+>|<emoji>/g, '');
}

function removeTags(text) {
    return text.replace(/<[^>]+>/g, '');
}

function normalizeIndicators(text) {
    return [...text].map(char => {
        const unhomoglyphResult = unhomoglyph(char);
        return unhomoglyphResult || normalizeUnicode(char) || char;
    }).join('');
}

function ultraCleanText(text) {
    const tagStripped = removeTags(text);
    const emojiStripped = replaceDiscordEmoji(tagStripped);
    const normalized = normalizeIndicators(emojiStripped)
        .normalize('NFKD')
        .replace(/[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF]/gu, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9\s]/gu, '')
        .toLowerCase();
    return normalized;
}

function isNWords(message) {
    const partiallyCleaned = ultraCleanText(message);
    const words = partiallyCleaned.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
        let combinedWord = words[i];
        const finalCleanedWord = unhomoglyph(combinedWord) || combinedWord;
        if (WhitelistedWords.includes(finalCleanedWord)) {
            continue;
        }
        if (nwordPatterns.some(pattern => pattern.test(finalCleanedWord))) {
            return true;
        }
        for (let j = i + 1; j < words.length; j++) {
            combinedWord += words[j];
            const finalCombinedWord = unhomoglyph(combinedWord) || combinedWord;
            if (WhitelistedWords.includes(finalCleanedWord)) {
                break;
            }
            if (nwordPatterns.some(pattern => pattern.test(finalCombinedWord))) {
                return true;
            }
        }
    }
    const allText = partiallyCleaned.replace(/\s+/g, '');
    const wordsInText = allText.split(/[^a-zA-Z0-9]+/);
    for (const word of wordsInText) {
        if (!WhitelistedWords.includes(word) && nwordPatterns.some(pattern => pattern.test(word))) {
            return true;
        }
    }
    return false;
}

const nwordPatterns = [
    /n[1il!]*[i1l!][g96qɢԌ]+[ae3@4αаåâá]*(?:r[s]*)?/iu,
    /n[1il!]*[i1l!][g96qɢԌ]*[-–—]/iu,
    /n[1il!]+[i1l!]+[g96qɢԌ]+/iu,
    /n[1il!]*[e3@4αаåâá][g96qɢԌ]+[a3@4αаåâá](?:r[s]*)?/iu,
    /n[1il!]*[i1l!][cс][hɦ][g96qɢԌ]+[a3@4αаåâá]/iu,
    /n[1il!]*[e3@4αаåâá][g96qɢԌ]+[a3@4αаåâá]/iu,
    /n[1il!]*[i1l!][b6]+[b6][a3@4αаåâá]/iu,
    /n[1il!]*[i1l!m]*er/iu,
    /n[1il!]*[i1l!][cс][hɦ][goóòôõōŏőơọỏõốồỗổộớờỡởợ]/iu,
    /er\b/iu
];

module.exports = { isNWords, ultraCleanText };