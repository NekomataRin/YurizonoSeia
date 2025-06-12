const unhomoglyph = require("unhomoglyph");

const WhitelistedWords = [
    "again", "against", "agenda", "agnostic", "align", "aligned", "aligning", "algorithm", "along", "analog",
    "among", "angel", "anger", "angry", "anything", "arrange", "assign", "band", "bang", "bank",
    "banned", "begin", "beginning", "beginner", "behind", "belong", "blessing", "binge", "binary", "bring",
    "bugging", "campaign", "change", "cognition", "coding", "concern", "config", "congenial", "consign", "danger",
    "debugging", "denying", "design", "designate", "diagnosis", "digital", "dingy", "during", "earning", "engage",
    "engine", "engineer", "enlighten", "evening", "everything", "finger", "foreign", "fringe", "gain", "gaining",
    "gainful", "gang", "gangland", "gangster", "gaming", "genie", "genesis", "genuine", "gig", "gigabit",
    "gingery", "gingham", "gingivitis", "going", "hang", "hinge", "ignite", "ignition", "ignoble", "ignorance",
    "ignorant", "ignore", "ignoring", "illegitimate", "illuminate", "imagine", "incoming", "indigenous", "indignant", "indignation",
    "indulge", "infringe", "ingrained", "ingratiate", "ingress", "inhering", "iniquity", "initiate", "injunction", "innate",
    "innocence", "innovation", "inquire", "insignia", "insignificant", "insight", "instigate", "integer", "integrate", "integrity",
    "intelligence", "interrogate", "intrigued", "junior", "king", "knight", "knowledge", "lagging", "language", "learning",
    "long", "longing", "login", "logout", "magnificent", "magnify", "malignancy", "malignant", "manage", "manager",
    "meaning", "mingle", "mongrel", "morning", "nagging", "nail", "naively", "name", "narrative", "narrow",
    "nasty", "nation", "native", "natural", "naught", "naughty", "naval", "navigate", "navigation", "near",
    "nearly", "neat", "necessary", "neck", "need", "needle", "negative", "negotiate", "negotiation", "neighbor",
    "neither", "nephew", "nerve", "nervous", "nest", "net", "network", "neutral", "never", "new",
    "news", "next", "nice", "nicely", "niche", "nickname", "niece", "niger", "nigeria", "nigerian",
    "nigel", "night", "nightmare", "nil", "nimble", "nine", "nineteen", "ninety", "nip", "nitrogen",
    "no", "noble", "nobody", "nod", "nodding", "noise", "noisy", "nominate", "non", "nonchalant",
    "none", "nonetheless", "nonprofit", "nonsense", "nook", "noon", "nor", "normal", "north", "northeast",
    "northwest", "nose", "notable", "note", "nothing", "notice", "notion", "notorious", "novel", "now",
    "nowhere", "nub", "nuclear", "nude", "nuisance", "null", "numb", "numbness", "number", "numerical",
    "numerous", "nuptial", "nurse", "nurture", "nurturing", "nut", "nutrition", "nylon", "onion", "opinion",
    "organization", "original", "ping", "pinging", "planning", "plugin", "program", "prognosis", "ranging", "recognize",
    "recognition", "regional", "reign", "render", "reunion", "rigging", "ringing", "running", "senior", "sign",
    "sign-in", "signal", "signature", "significant", "signify", "singing", "single", "something", "spring", "strong",
    "string", "technique", "terminal", "thing", "tingle", "tonight", "training", "turning", "union", "wing",
    "winning", "wrong", "young"
];

const superscriptMap = {
    'ⁿ': 'n', 'ⁱ': 'i', 'ᵍ': 'g', 'ᵃ': 'a', 'ʳ': 'r', 'ˢ': 's'
};
const subscriptMap = {
    'ₙ': 'n', 'ᵢ': 'i', '₉': 'g', 'ₐ': 'a', 'ᵣ': 'r', 'ₛ': 's'
};
const emojiLetterMap = {
    '🅽': 'n', '🅘': 'i', '🅖': 'g', '🅐': 'a', '🅡': 'r', '🅢': 's',
    '🇳': 'n', '🇮': 'i', '🇬': 'g', '🇦': 'a', '🇷': 'r', '🇸': 's'
};
const precomposedMap = {
    // Mappings for 'i'
    'ï': 'i', 'í': 'i', 'î': 'i', 'ì': 'i', 'ĩ': 'i', 'ī': 'i', 'ĭ': 'i', 'į': 'i',
    'ı': 'i', 'ɩ': 'i', 'ɪ': 'i', 'ｉ': 'i',
    'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'í': 'i', 'ị': 'i', // Vietnamese i variants

    // Mappings for 'a'
    'ä': 'a', 'á': 'a', 'â': 'a', 'à': 'a', 'ã': 'a', 'ā': 'a', 'ă': 'a', 'ą': 'a',
    'ɑ': 'a', 'ɐ': 'a', 'ａ': 'a',
    'ả': 'a', 'ã': 'a', 'á': 'a', 'ạ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ắ': 'a', 'ặ': 'a', // Vietnamese a variants

    // Mappings for 'n'
    'ň': 'n', 'ń': 'n', 'ņ': 'n', 'ṇ': 'n',
    'ǹ': 'n', 'ṅ': 'n', 'ɲ': 'n', 'ŋ': 'n', 'ｎ': 'n',
    'ń': 'n', 'ǹ': 'n', 'ñ': 'n', // Additional n variants

    // Mappings for 'g'
    'ğ': 'g', 'ģ': 'g', 'ġ': 'g',
    'ɡ': 'g', 'ǧ': 'g', 'ǥ': 'g', 'ɠ': 'g', 'ｇ': 'g',

    // Mappings for 'r'
    'ɾ': 'r', 'ɹ': 'r', 'ʀ': 'r', 'ｒ': 'r',

    // Mappings for 's'
    'ß': 's', 'ʂ': 's', 'ｓ': 's',

    // Mappings for 'e'
    'é': 'e', 'è': 'e', 'ê': 'e', 'ẽ': 'e', 'ē': 'e', 'ę': 'e', 'ě': 'e', 'ë': 'e',
    'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ế': 'e', 'ề': 'e', 'ễ': 'e', 'ể': 'e', 'ệ': 'e', 'ê': 'e', 'ệ': 'e', 'ề': 'e', // Vietnamese e variants

    // Mappings for 'o'
    'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ō': 'o', 'ŏ': 'o', 'ő': 'o', 'ơ': 'o',
    'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ố': 'o', 'ồ': 'o', 'ỗ': 'o', 'ổ': 'o', 'ộ': 'o', 'ớ': 'o', 'ờ': 'o', 'ỡ': 'o', 'ở': 'o', 'ợ': 'o', // Vietnamese o variants

    // Mappings for 'm'
    'ｍ': 'm' // Explicitly map full-width m to preserve m
};

function replaceDiscordEmoji(text) {
    // Handle both Discord-style emojis (<:emoji:123>) and plain <emoji> tags
    return text.replace(/<a?:[a-zA-Z0-9_]+:\d+>|<emoji>/g, '');
}

function removeTags(text) {
    // Remove all <...> tags, including <word>, <emoji>, etc.
    return text.replace(/<[^>]+>/g, '');
}

function normalizeIndicators(text) {
    return [...text].map(char =>
        precomposedMap[char] || superscriptMap[char] || subscriptMap[char] || emojiLetterMap[char] || char
    ).join('');
}

function ultraCleanText(text) {
    const tagStripped = removeTags(text);
    const emojiStripped = replaceDiscordEmoji(tagStripped);
    const normalized = normalizeIndicators(emojiStripped)
        .normalize('NFD')
        .replace(/[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF]/gu, '')
        .replace(/[^a-zA-Z0-9\s]/gu, '')
        .toLowerCase();
    return normalized;
}

function isNWords(message) {
    const partiallyCleaned = ultraCleanText(message);
    const words = partiallyCleaned.split(/\s+/);
    // Check combinations of adjacent words
    for (let i = 0; i < words.length; i++) {
        let combinedWord = words[i];
        const finalCleanedWord = unhomoglyph(combinedWord) || combinedWord; // Fallback if unhomoglyph fails
        if (WhitelistedWords.includes(finalCleanedWord)) {
            continue;
        }
        if (nwordPatterns.some(pattern => pattern.test(finalCleanedWord))) {
            return true;
        }
        // Check next word if it forms a blacklisted word
        for (let j = i + 1; j < words.length; j++) {
            combinedWord += words[j];
            const finalCombinedWord = unhomoglyph(combinedWord) || combinedWord; // Fallback if unhomoglyph fails
            if (WhitelistedWords.includes(finalCombinedWord)) {
                break; // Skip if the combined word is whitelisted
            }
            if (nwordPatterns.some(pattern => pattern.test(finalCombinedWord))) {
                return true;
            }
        }
    }
    // Check for substring matches within the entire message
    const allText = partiallyCleaned.replace(/\s+/g, '');
    for (const pattern of nwordPatterns) {
        if (pattern.test(allText)) {
            return true;
        }
    }
    return false;
}

const nwordPatterns = [
    /n[1il!]*[i1l!][g96qɢԌ]+[ae3@4αаåâá]*(?:r[s]*)?/iu, // Handles "nigga" or "nigger" (substring)
    /n[1il!]*[i1l!][g96qɢԌ]*[-–—]/iu,
    /n[1il!]+[i1l!]+[g96qɢԌ]+/iu,
    /n[1il!]*[e3@4αаåâá][g96qɢԌ]+[a3@4αаåâá](?:r[s]*)?/iu, // Handles "negga" (substring)
    /n[1il!]*[i1l!][cс][hɦ][g96qɢԌ]+[a3@4αаåâá]/iu, // Handles "nichga" (substring)
    /n[1il!]*[e3@4αаåâá][g96qɢԌ]+[a3@4αаåâá]/iu, // Handles "nega" (substring)
    /n[1il!]*[i1l!][b6]+[b6][a3@4αаåâá]/iu, // Handles "nibba" (substring)
    /n[1il!]*[i1l!][e3@4αаåâá](?:r[s]*)?/iu, // Handles "nier" and variants (substring)
    /n[1il!]*[i1l!][cс][hɦ][goóòôõōŏőơọỏõốồỗổộớờỡởợ]/iu // Handles "nichgo" with Vietnamese o variants
];

module.exports = { isNWords, ultraCleanText };