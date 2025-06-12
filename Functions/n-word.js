const unhomoglyph = require("unhomoglyph");
const fs = require('node:fs');
const path = require('path');

const wpath = path.join(__dirname, "..", "Assets", "words.txt");
const WhitelistedWords = fs.readFileSync(wpath, "utf-8").split('\n').map(word => word.trim()).concat(["nier", "nia"]); // Add safe words

const superscriptMap = {
    'ⁿ': 'n', 'ⁱ': 'i', 'ᵍ': 'g', 'ᵃ': 'a', 'ʳ': 'r', 'ˢ': 's',
    'ᵉ': 'e', 'ᵒ': 'o', 'ᵇ': 'b'
};
const subscriptMap = {
    'ₙ': 'n', 'ᵢ': 'i', '₉': 'g', 'ₐ': 'a', 'ᵣ': 'r', 'ₛ': 's',
    'ₑ': 'e', 'ₒ': 'o', 'ᵦ': 'b'
};

function normalizeUnicode(char) {
    const codePoint = char.codePointAt(0);
    let normalized = char.normalize('NFKD');
    let baseChar = [...normalized].find(c => /[a-zA-Z]/.test(c)) || char;

    if (codePoint >= 0x00A0 && codePoint <= 0x00FF) {
        return baseChar.toLowerCase();
    } else if (codePoint >= 0x0100 && codePoint <= 0x024F) {
        return baseChar.toLowerCase();
    } else if (codePoint >= 0x0400 && codePoint <= 0x04FF) {
        const cyrillicMap = {
            'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'e', 'Ж': 'zh',
            'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm', 'Н': 'n', 'О': 'o',
            'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u', 'Ф': 'f', 'Х': 'kh', 'Ц': 'ts',
            'Ч': 'ch', 'Ш': 'sh', 'Щ': 'shch', 'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu',
            'Я': 'ya'
        };
        return cyrillicMap[char.toUpperCase()] || baseChar.toLowerCase();
    } else if (codePoint >= 0x0370 && codePoint <= 0x03FF) {
        const greekMap = {
            'Α': 'a', 'Β': 'b', 'Γ': 'g', 'Δ': 'd', 'Ε': 'e', 'Ζ': 'z', 'Η': 'h', 'Θ': 'th',
            'Ι': 'i', 'Κ': 'k', 'Λ': 'l', 'Μ': 'm', 'Ν': 'n', 'Ξ': 'x', 'Ο': 'o', 'Π': 'p',
            'Ρ': 'r', 'Σ': 's', 'Τ': 't', 'Υ': 'u', 'Φ': 'ph', 'Χ': 'ch', 'Ψ': 'ps', 'Ω': 'o'
        };
        return greekMap[char.toUpperCase()] || baseChar.toLowerCase();
    } else if (codePoint >= 0x1D400 && codePoint <= 0x1D7FF) {
        if (codePoint >= 0x1D400 && codePoint <= 0x1D419) {
            return String.fromCharCode(codePoint - 0x1D38F).toLowerCase();
        } else if (codePoint >= 0x1D422 && codePoint <= 0x1D43B) {
            return String.fromCharCode(codePoint - 0x1D361).toLowerCase();
        }
    } else if (codePoint >= 0x2070 && codePoint <= 0x209F) {
        return superscriptMap[char] || baseChar.toLowerCase();
    } else if (codePoint >= 0x2080 && codePoint <= 0x208E) {
        return subscriptMap[char] || baseChar.toLowerCase();
    }

    return baseChar.toLowerCase();
}

function replaceDiscordEmoji(text) {
    return text.replace(/<a?:[a-zA-Z0-9_]+:\d+>|<emoji>/g, 'x');
}

function normalizeIndicators(text) {
    return [...text].map(char => {
        const unhomoglyphResult = unhomoglyph(char);
        return unhomoglyphResult || normalizeUnicode(char) || char;
    }).join('');
}

function ultraCleanText(text) {
    const emojiStripped = replaceDiscordEmoji(text);
    const preCleaned = emojiStripped.replace(/[^a-zA-Z0-9\s*_\-]/gu, ''); // Preserve *, -, _ for censored patterns
    const normalized = normalizeIndicators(preCleaned)
        .normalize('NFKD')
        .replace(/[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF]/gu, '') // Remove diacritics
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
            combinedWord += ' ' + words[j];
            const finalCombinedWord = unhomoglyph(combinedWord) || combinedWord;
            if (WhitelistedWords.includes(finalCombinedWord)) {
                break;
            }
            if (nwordPatterns.some(pattern => pattern.test(finalCombinedWord))) {
                return true;
            }
        }
    }
    const allText = partiallyCleaned.replace(/\s+/g, '');
    const wordsInText = allText.split(/\s+/);
    for (const word of wordsInText) {
        if (!WhitelistedWords.includes(word) && nwordPatterns.some(pattern => pattern.test(word))) {
            return true;
        }
    }
    return false;
}

const nwordPatterns = [
    /n(?:[*_\-]|[*-_])*([i1l!][*_\-]*)*[g96qɢԌ](?:[*_\-]*[ae3@4αаåâá])+(?:[*_\-]*[rs])?/iu, // "n*gga", "n-gga", "n_gga"
    /n(?:[*_\-]|[*-_])*[i1l!][*_\-]*[g96qɢԌ][*_\-]*[-–—]/iu,
    /n(?:[*_\-]|[*-_])+[i1l!]+[*_\-]+[g96qɢԌ]+/iu,
    /n(?:[*_\-]|[*-_])*[e3@4αаåâá][*_\-]*[g96qɢԌ][*_\-]*[a3@4αаåâá](?:[*_\-]*[rs])?/iu, // "n*e-gga"
    /n(?:[*_\-]|[*-_])*[i1l!][*_\-]*[cс][*_\-]*[hɦ][*_\-]*[g96qɢԌ][*_\-]*[a3@4αаåâá]/iu, // "n*i-ch-ga"
    /n(?:[*_\-]|[*-_])*[e3@4αаåâá][*_\-]*[g96qɢԌ][*_\-]*[a3@4αаåâá]/iu, // "n*e-ga"
    /n(?:[*_\-]|[*-_])*[i1l!][*_\-]*[b6][*_\-]*[b6][*_\-]*[a3@4αаåâá]/iu, // "n*i-b-b-a"
    /n(?:[*_\-]|[*-_])*([i1l!][*_\-]*)+[e3@4αаåâá]?r[*_\-]*[bcdfgjklmnpqrstvwxyz]/iu, // "ni**er" with consonant
    /n(?:[*_\-]|[*-_])+[i1l!][*_\-]*[g96qɢԌ]?[e3@4αаåâá][*_\-]*r[*_\-]*[bcdfgjklmnpqrstvwxyz]\b/iu,
    /n(?:[*_\-]|[*-_])*[i1l!][*_\-]*[cс][*_\-]*[hɦ][*_\-]*[goóòôõōŏőơọỏõốồỗổộớờỡởợ]/iu, // "n*i-ch-go"
    /n(?:[*_\-]|[*-_])*[i1l!][*_\-]*[g96qɢԌ]?[ae3@4αаåâá][*_\-]*[bcdfgjklmnpqrstvwxyz]/iu, // "n*a" with consonant
    /n(?:[*_\-]|[*-_])+[i1l!][*_\-]*[g96qɢԌ]?[ae3@4αаåâá][*_\-]*[bcdfgjklmnpqrstvwxyz]\b/iu,
    /n(?:[*_\-]|[*-_])+er\b(?!(?:\s|$)nier)/iu, // Fallback for "n*er" excluding "nier"
    /n(?:[*_\-]|[*-_])+a\b(?!(?:\s|$)nia)/iu   // Fallback for "n*a" excluding "nia"
];

module.exports = { isNWords, ultraCleanText };