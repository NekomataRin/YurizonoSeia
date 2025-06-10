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
]

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

// 1. Replace Discord emoji like <:name:123> or <a:name:123> with 'x'
function replaceDiscordEmoji(text) {
    return text.replace(/<a?:[a-zA-Z0-9_]+:\d+>/g, 'x');
}

// 2. Normalize emoji, superscripts, subscripts
function normalizeIndicators(text) {
    return [...text].map(char =>
        superscriptMap[char] || subscriptMap[char] || emojiLetterMap[char] || char
    ).join('');
}

// 3. Clean everything and unify formatting
function ultraCleanText(text) {
    const emojiStripped = replaceDiscordEmoji(text);
    const normalized = normalizeIndicators(emojiStripped)
        .normalize('NFKC')
        .replace(/[\p{Diacritic}\u0300-\u036f]/gu, '')
        .replace(/[^\p{L}\p{N}x]/gu, '') // keep letters, numbers, emoji placeholder
        .toLowerCase();

    return unhomoglyph(normalized);
}

// 4. Regex match extended slur patterns (including nig- and partial forms)
function isNWords(text) {
    const cleaned = ultraCleanText(text);
    if(WhitelistedWords.includes(cleaned)) return false
    
    // Any of the following patterns:
    const nwordPatterns = [
        /n[1il|!x]*[i1l|!x]*[g96qɢԌx]+[ae3@4αаåâáx]*[rsx]*$/giu,             // Full or partial
        /n[1il|!x]*[i1l|!x]*[g96qɢԌx]*[-–—]$/giu,                             // Ends in hyphen (e.g. 'nigg-', 'nig-')
        /n[1il|!x]*[i1l|!x]*[g96qɢԌx]*$/giu                                   // Raw partial (e.g. 'nigg')
    ];

    return nwordPatterns.some(pattern => pattern.test(cleaned));
}

module.exports = { isNWords, ultraCleanText };
