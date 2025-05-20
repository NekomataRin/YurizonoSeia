const unhomoglyph = require('unhomoglyph');

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

    const FalseAlarms = ['niger', 'nigeria', 'nigerian', 'niigata'];

    const leetMap = {
        '0': 'o', '1': 'i', '!': 'i', '3': 'e', '4': 'a', '@': 'a',
        '5': 's', '7': 't', '$': 's', '+': 't', '|': 'i', '¡': 'i', '¥': 'y'
    };

    function normalizeContent(text) {
        // Step 1: Remove accents/homoglyphs & lowercase
        let cleaned = unhomoglyph(text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')).toLowerCase();
        
        // Step 2: Convert leetspeak to letters
        cleaned = cleaned.split('').map(c => leetMap[c] || c).join('');
        
        // Step 3: Remove ALL non-letters (spaces, symbols, numbers)
        return cleaned.replace(/[^a-z]/g, '');
    }

    function collapseRepeats(text) {
        return text.replace(/([a-z])\1{2,}/g, '$1'); // "gggg" → "g"
    }

    function generateRegex(word) {
        // Match even if embedded in other words (no word boundaries)
        const pattern = word.split('').join('[^a-z]*') + '[a-z]*';
        return new RegExp(pattern, 'i');
    }

    function isOffensive(content) {
        const normalized = collapseRepeats(normalizeContent(content));

        // Skip if a false alarm word is present
        if (FalseAlarms.some(safe => normalized.includes(safe))) return false;

        // Check against all N-word variants
        return NWords.some(word => generateRegex(word).test(normalized));
    }

    if (isOffensive(message.content)) {
        await message.delete();
        await message.channel.send('<:SeiaMuted:1244890584276008970> • Oi! That word is offensive, you know? You cannot say the **N-Word** HERE!');
    }
};