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

    // Mappings for 'a'
    'ä': 'a', 'á': 'a', 'â': 'a', 'à': 'a', 'ã': 'a', 'ā': 'a', 'ă': 'a', 'ą': 'a',
    'ɑ': 'a', 'ɐ': 'a', 'ａ': 'a',

    // Mappings for 'n'
    'ň': 'n', 'ń': 'n', 'ņ': 'n', 'ṇ': 'n',
    'ǹ': 'n', 'ṅ': 'n', 'ɲ': 'n', 'ŋ': 'n', 'ｎ': 'n',

    // Mappings for 'g'
    'ğ': 'g', 'ģ': 'g', 'ġ': 'g',
    'ɡ': 'g', 'ǧ': 'g', 'ǥ': 'g', 'ɠ': 'g', 'ｇ': 'g',

    // Mappings for 'r'
    'ɾ': 'r', 'ɹ': 'r', 'ʀ': 'r', 'ｒ': 'r',

    // Mappings for 's'
    'ß': 's', 'ʂ': 's', 'ｓ': 's'
};

function replaceDiscordEmoji(text) {
    return text.replace(/<a?:[a-zA-Z0-9_]+:\d+>/g, 'x');
}

function normalizeIndicators(text) {
    return [...text].map(char =>
        precomposedMap[char] || superscriptMap[char] || subscriptMap[char] || emojiLetterMap[char] || char
    ).join('');
}

function ultraCleanText(text) {
    const emojiStripped = replaceDiscordEmoji(text);
    const normalized = normalizeIndicators(emojiStripped)
        .normalize('NFD')
        .replace(/[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF]/gu, '')
        .replace(/[^a-zA-Z0-9\s x]/gu, '')
        .toLowerCase();
    return normalized;
}

function isNWords(message) {
    const partiallyCleaned = ultraCleanText(message);
    const words = partiallyCleaned.split(/[^a-zA-Z0-9x]+/).filter(word => word.length > 0);
    const nwordPatterns = [
        /^n[1il!x]*[i1l!x][g96qɢԌx]+[ae3@4αаåâáx]*[rsx]*$/iu,
        /^n[1il!x]*[i1l!x][g96qɢԌx]*[-–—]$/iu,
        /^n[1il!x]+[i1l!x]+[g96qɢԌx]+$/iu
    ];
    for (const word of words) {
        const finalCleanedWord = unhomoglyph(word);
        if (WhitelistedWords.includes(finalCleanedWord)) {
            continue;
        }
        if (nwordPatterns.some(pattern => pattern.test(finalCleanedWord))) {
            return true;
        }
    }
    return false;
}

module.exports = { isNWords, ultraCleanText };