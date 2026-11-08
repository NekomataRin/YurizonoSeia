const { EmbedBuilder } = require('discord.js')

const ModAfk = require('../../Database/Server/mod-afk')
const { DbReady } = require('../../Database/connect')
const { SavedLanguage } = require('../../Utils/language')
const { Footer } = require('../../Utils/embed')
const BotOwner = require('../../Utils/owners')
const Clock = require('../../Utils/clock')

// One reminder per channel + AFK person every 30s, so a ping spam doesn't turn into a Seia spam
const Reminded = new Map()
const Gap = 30000
// The main owner (first of Utils/owners.js) gets his own reminder, in the Typhoeus role color
const MainOwner = BotOwner[0]
const OwnerColor = '#DCC3E3'

// Special reminder when someone pings the main owner while he's AFK
function OwnerEmbed(message, away, vi) {
    const Since = (away.Since) ? `\n> ${vi ? 'Ổng AFK từ' : 'He\'s been AFK since'} <t:${Math.floor(away.Since / 1000)}:R>` : ''
    return new EmbedBuilder()
        .setColor(OwnerColor)
        .setTitle(vi ? '<:SeiaPeek:1244890461592621147> Papa của em đang AFK~' : '<:SeiaPeek:1244890461592621147> My dad is AFK~')
        .setDescription(vi
            ? `Suỵt! Người bạn vừa ping là **papa của em** (<@${MainOwner}>) đó${Since}\n> Có việc gì thì cứ để lại lời nhắn, ổng về sẽ đọc nhé!`
            : `Shh! You just pinged **my dad** (<@${MainOwner}>)${Since}\n> Leave a message, he'll read it when he's back!`)
        .setThumbnail(message.mentions.users.get(MainOwner)?.displayAvatarURL?.({ size: 128 }) ?? null)
        .setTimestamp()
        .setFooter(Footer())
}

// Someone pinged (mention or reply with ping) a Mod / owner who is AFK (/mod-afk) -> Seia reminds them. Bots are ignored
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
    const Owner = Fresh.find(a => a.UserID === MainOwner)
    const Staff = Fresh.filter(a => a.UserID !== MainOwner)
    const Names = Staff.map(a => `<@${a.UserID}>`).join(', ')
    await message.reply({
        //The normal reminder for the other staff, just a ping when it's only the main owner
        content: (!Staff.length)
            ? `${message.author}`
            : vi
                ? `<:SeiaMenacing:1244890322090201162> ${message.author}, oi! Bạn ping người trong **Staff Team** (${Names}) thế này lúc họ đang bận hay AFK... Nếu họ cáu thì bạn tính sao?`
                : `<:SeiaMenacing:1244890322090201162> ${message.author}, hey! You pinged someone from the **Staff Team** (${Names}) while they're busy or AFK... What if they get mad?`,
        embeds: (Owner) ? [OwnerEmbed(message, Owner, vi)] : [],
        //Only the one who pinged gets pinged back, not the AFK staff again
        allowedMentions: { users: [message.author.id], repliedUser: false }
    }).catch(() => {})
}
