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

        // Step 4: Remove non-alphanumeric characters (but keep letters and numbers)
        return cleaned.replace(/[^a-z0-9]/g, '');
    }

    function collapseRepeats(text) {
        return text.replace(/([a-z])\1{2,}/gi, '$1$1'); // collapse "ggggg" → "gg" (keep 2 repeats)
    }

    function generatePatterns(word) {
        // Create multiple pattern variations
        const patterns = [];
        
        // Basic pattern with optional separators
        patterns.push(
            word.split('').join('[^a-z0-9]*') + '[a-z]*'
        );
        
        // Pattern with optional repeated letters (like "nniiggaa")
        patterns.push(
            word.split('').map(c => `${c}+`).join('[^a-z0-9]*') + '[a-z]*'
        );
        
        return patterns.map(p => new RegExp(p, 'i'));
    }

    function isOffensive(content) {
        const normalized = collapseRepeats(normalizeContent(content));

        // First check for false alarms - if found, skip further checks
        for (const safe of FalseAlarms) {
            if (normalized.includes(safe)) return false;
        }

        // Check each offensive word with multiple patterns
        return NWords.some(word => {
            const patterns = generatePatterns(word);
            return patterns.some(regex => regex.test(normalized));
        });
    }

    if (isOffensive(message.content)) {
        await message.delete();
        await message.channel.send('<:SeiaMuted:1244890584276008970> • Oi! That word is offensive, you know? You cannot say the **N-Word** HERE!');
    }
};