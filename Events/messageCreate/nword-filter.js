const unhomoglyph = require('unhomoglyph'); // ⬅️ new

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
        '0': 'o',
        '1': 'i',
        '!': 'i',
        '3': 'e',
        '4': 'a',
        '@': 'a',
        '5': 's',
        '7': 't',
        '$': 's',
        '+': 't',
        '|': 'i',
        '¡': 'i',
        '¥': 'y'
    };

    function normalizeContent(text) {
        // Step 1: Unicode normalization & homoglyph collapse
        let cleaned = unhomoglyph(
            text
                .normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '') // Remove accents
        );

        // Step 2: Lowercase
        cleaned = cleaned.toLowerCase();

        // Step 3: Apply leetspeak substitutions
        cleaned = cleaned
            .split('')
            .map(c => leetMap[c] || c)
            .join('');

        // Step 4: Remove non-letter characters (symbols, spaces, emojis, etc.)
        return cleaned.replace(/[^a-z]/g, '');
    }

    function collapseRepeats(text) {
        return text.replace(/(\w)\1{2,}/g, '$1'); // collapse "ggggg" → "g"
    }

    function generateRegex(word) {
        const separator = `[^a-zA-Z]*`; // match anything non-alphabetic between letters
        const suffix = `[asrzx]{0,9999}`; // allow plural endings
        const pattern = word
            .split('')
            .map(c => `${separator}${c}`)
            .join('') + suffix;

        return new RegExp(pattern, 'i');
    }

    function isOffensive(content) {
        const normalized = collapseRepeats(normalizeContent(content));

        for (const safe of FalseAlarms) {
            if (normalized.includes(safe)) return false;
        }

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
