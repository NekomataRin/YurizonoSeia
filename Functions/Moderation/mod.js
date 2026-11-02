const { MessageFlags } = require('discord.js')
const { SeiaEmbed } = require('../../Utils/embed')
const { IsMod } = require('../../Utils/mod')
const Config = require('../../Utils/config')
const Log = require('../../Utils/logger')

// Emojis of the moderation commands (from Miosha, the ones Seia can't use were swapped for Seia's)
const ModE = {
    Bruh: '<:OrinBruh:1160295126996881448>',
    Doi: '<:LYG_KeqingDoi:1086190826536849499>',
    Menacing: '<:SeiaMenacing:1244890322090201162>',
    Sip: '<:SeiaSip:1244890166116618340>',
    What: '<:CirnoWhat:1150565251562078249>',
    Police: '<:OrinPolice:1152868958148501534>',
    Orin: '<:JustOrin:1156221079988215879>'
}

// Answers whether the interaction was deferred or not (a modal command checks before deferring)
const Answer = (interaction, payload) => (interaction.deferred || interaction.replied)
    ? interaction.editReply(payload)
    : interaction.reply({ ...payload, flags: MessageFlags.Ephemeral })

// Mod commands: only the Mod roles of the server (Utils/config.js Roles[guildId].Mod). Bot owners need one too.
// Returns the member, or null after telling them they can't
async function RequireMod(interaction, LangKey) {
    const member = interaction.member ?? await interaction.guild.members.fetch(interaction.user.id).catch(() => null)
    if (member && IsMod(member)) return member
    const vi = (LangKey === 'vi')
    await Answer(interaction, {
        embeds: [SeiaEmbed(interaction, 'DarkAqua')
            .setTitle(`${ModE.Bruh} ${vi ? 'Không đủ thẩm quyền' : 'Not enough authority'}`)
            .setDescription(`${ModE.Doi} | ${vi ? 'Bạn không có role Mod của server này, làm thế nào bạn dùng được lệnh này hả???' : 'You don\'t have a Mod role of this server, how could you use this command???'}`)]
    })
    return null
}

// Why Seia won't do it to that user (null = fine). member = null when they aren't in the server.
// Perm: 'bannable' / 'kickable' / 'moderatable' = can Seia do it (role hierarchy + permissions).
// Bots can only be banned / kicked (a raid bot), warning or restricting them is pointless
function TargetProblem(interaction, user, member, LangKey, Perm) {
    const vi = (LangKey === 'vi')
    if (user.id === interaction.user.id) return vi ? 'Tự xử chính mình à? Thôi đừng mà...' : 'Punishing yourself? Please don\'t...'
    if (user.id === interaction.client.user.id) return vi ? 'Em đã làm gì sai mà Sensei định xử em vậy?' : 'What did I do wrong for you to punish me, Sensei?'
    if (user.bot && !['bannable', 'kickable'].includes(Perm)) return vi ? `${user} là bot mà, xử bot làm gì?` : `${user} is a bot, why bother?`
    if (user.id === interaction.guild.ownerId) return vi ? 'Đó là chủ server mà, em không dám đâu!' : 'That\'s the server owner, I wouldn\'t dare!'
    if (member && IsMod(member)) return vi ? `${user} cũng có role Mod, Mod không xử Mod được nha!` : `${user} has a Mod role too, mods can't punish mods!`
    if (member && Perm && !member[Perm]) return vi ? `Em không đủ quyền với ${user} (role của họ cao hơn em, hoặc em thiếu quyền)...` : `I can't do that to ${user} (their role is above mine, or I'm missing the permission)...`
    return null
}

// Reason typed by the mod, or the default one (Harsh = for punishments, Miosha's line)
function Reason(interaction, LangKey, Harsh = true) {
    const typed = interaction.options.getString('reason')?.trim()
    if (typed) return typed
    if (LangKey === 'vi') return (Harsh) ? 'Không có lí do nào cả, thẳng tay thi hành án' : 'Không có lí do nào cả'
    return (Harsh) ? 'No reason at all, straight to the sentence' : 'No reason given'
}

// Lines of a moderation log entry: `${emoji} Action: X` + "> line" each
const LogText = (vi, Emoji, Action, Lines) => `${Emoji} **__${vi ? 'Hành động' : 'Action'}: ${Action}__**\n\n${Lines.map(l => `> ${l}`).join('\n')}`

// Reason saved in Discord's audit log (Seia is the one who does it, so the mod's name goes there)
const AuditReason = (interaction, reason) => `${reason} - by ${interaction.user.username}`.slice(0, 512)

// Posts in the moderation log channel of the server (Config.Channels.ModLog), nothing when there's none
async function ModLog(interaction, Color, Desc) {
    const id = Config.Channels.ModLog?.[interaction.guild.id]
    if (!id) return
    const channel = interaction.guild.channels.cache.get(id) || await interaction.guild.channels.fetch(id).catch(() => null)
    await channel?.send({ embeds: [SeiaEmbed(interaction, Color).setTitle('Yurizono Seia - Logger').setDescription(Desc)], allowedMentions: { parse: [] } })
        .catch(err => Log.Warn(`Mod log (${interaction.guild.name}): ${err.message}`))
}

module.exports = { ModE, Answer, RequireMod, TargetProblem, Reason, AuditReason, ModLog, LogText }
