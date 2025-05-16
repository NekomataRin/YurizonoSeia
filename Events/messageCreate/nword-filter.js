module.exports = async (client, message) => {
    const IgnoredChannels = [
        '1201818078711918602',
        '1152527869533229126',
    ]

    if (message.author.bot) return
    if (message.guild.id !== process.env.GUILD_ID) return
    if (IgnoredChannels.includes(message.channel.id)) return

    const NWords = ['nigger', 'nigga', 'niga', 'nigg', 'nig', 'nega', 'negga', 'negger', 'niggers', 'niggas', 'neggas', 'negas', 'neggers', 'niggerian']
    const FalseAlarms = ['niger', 'nigeria', 'nigerian', 'niigata']
    const separator = `[\\W_\\*\\.\\|\\-]*`

    const leetMap = {
        a: '[a@4*\'#&%$]',
        i: '[i1!|íîïìį𝗂𝖎*\'#&%$]',
        g: '[gq96𝗀𝖌b*\'#&%$]',
        e: '[e3éèêëėę*\'#&%$]',
        r: '[r₹*\'#&%$]',
        n: '[nñń𝗇𝖓*\'#&%$]',
        s: '[5*\'#&%$abcdefghijklmnopqrstuvwxyz]',
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
        return text
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .split('')
            .map(c => leetMap[c] || c)
            .join('');
    }

    function generateRegex(word) {
        const pattern = word
            .split('')
            .map(c => leetMap[c.toLowerCase()] || c)
            .map(c => `${c}${separator}`)
            .map(group => `[\\W_]*${group}[\\W_]*`) // allow symbols or spacing between
            .join('');

        return new RegExp(`\\b${pattern}\\b`, 'i');
    }

    function isOffensive(a) {
        const normalized = normalizeContent(a);

        // If it includes a whitelisted word like "nigeria", skip
        for (const safe of FalseAlarms) {
            if (normalized.includes(safe)) return false;
        }

        // Check against offensive word patterns
        return NWords.some(badWord => {
            const regex = generateRegex(badWord);
            return regex.test(a);
        });
    }

    if (isOffensive(message.content)) {
        await message.delete()
        await message.channel.send('<:SeiaMuted:1244890584276008970> • Oi! That word is offensive, you know? You cannot say the **N-Word** HERE!')
    }
}