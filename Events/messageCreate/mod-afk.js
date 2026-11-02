const ModAfk = require('../../Database/Server/mod-afk')
const { DbReady } = require('../../Database/connect')
const { SavedLanguage } = require('../../Utils/language')
const Clock = require('../../Utils/clock')

// One reminder per channel + AFK person every 30s, so a ping spam doesn't turn into a Seia spam
const Reminded = new Map()
const Gap = 30000

// Someone pinged (mention or reply with ping) a Mod / owner who is AFK (/mod-afk) -> Seia reminds them
module.exports = async (client, message) => {
    //Database down: skip quietly (no error log on every message)
    if (message.author.bot || !message.inGuild() || !message.mentions.users.size || !DbReady()) return

    const Pinged = [...message.mentions.users.keys()].filter(id => id !== message.author.id)
    if (!Pinged.length) return
    const Away = await ModAfk.find({ GuildID: message.guild.id, UserID: { $in: Pinged } }).lean()
    if (!Away.length) return

    const now = Clock.Now()
    for (const [key, time] of Reminded) if (now - time > Gap) Reminded.delete(key)
    const Fresh = Away.filter(a => !Reminded.has(`${message.channelId}-${a.UserID}`))
    if (!Fresh.length) return
    for (const a of Fresh) Reminded.set(`${message.channelId}-${a.UserID}`, now)

    //Language of the one who pinged (not set = Vietnamese, both servers are Vietnamese)
    const vi = ((await SavedLanguage(message.author.id).catch(() => null)) || 'vi') === 'vi'
    const Names = Fresh.map(a => `<@${a.UserID}>`).join(', ')
    await message.reply({
        content: vi
            ? `<:SeiaMenacing:1244890322090201162> ${message.author}, oi! Bạn ping người trong **Staff Team** (${Names}) thế này lúc họ đang bận hay AFK... Nếu họ cáu thì bạn tính sao?`
            : `<:SeiaMenacing:1244890322090201162> ${message.author}, hey! You pinged someone from the **Staff Team** (${Names}) while they're busy or AFK... What if they get mad?`,
        //Only the one who pinged gets pinged back, not the AFK staff again
        allowedMentions: { users: [message.author.id], repliedUser: false }
    }).catch(() => {})
}
