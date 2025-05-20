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
        '5': 's', '7': 't', '$': 's', '+': 't', '|': 'i', '¡': 'i', '¥': 'y',
        '*': 'a', '#': 'h', '%': 'a', '6': 'g', '9': 'g' // Added for censored characters
    };

    function normalizeContent(text) {
        // Step 1: Remove accents/homoglyphs & lowercase
        let cleaned = unhomoglyph(text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')).toLowerCase();
        
        // Step 2: Convert leetspeak AND censor symbols to letters
        cleaned = cleaned.split('').map(c => leetMap[c] || c).join('');
        
        // Step 3: Remove ALL non-letters (keeps only a-z)
        return cleaned.replace(/[^a-z]/g, '');
    }

    function generateRegex(word) {
        // Match both original and censored variants (n*gga, n!**a, etc.)
        const pattern = word.split('')
            .map(c => `[${c}*#@%]`) // Allow original char or censor symbols
            .join('[^a-z]*') +      // Optional separators
            '[a-z]*';               // Optional suffix
            
        return new RegExp(pattern, 'i');
    }

    function isOffensive(content) {
        const normalized = normalizeContent(content);

        // Skip if a false alarm word is present
        if (FalseAlarms.some(safe => normalized.includes(normalizeContent(safe)))) return false;

        // Check against all N-word variants (including censored)
        return NWords.some(word => {
            const regex = generateRegex(word);
            return regex.test(normalized);
        });
    }

    if (isOffensive(message.content)) {
        await message.delete();
        await message.channel.send('<:SeiaMuted:1244890584276008970> • Oi! That word is offensive, you know? You cannot say the **N-Word** HERE!');
    }
};