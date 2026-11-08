const { MessageFlags } = require('discord.js')
const wait = require('node:timers/promises').setTimeout
const Restriction = require('../../Database/Moderation/restrictions')
const { DbReady } = require('../../Database/connect')
const { SeiaEmbed } = require('../../Utils/embed')
const { SavedLanguage, LocaleLang } = require('../../Utils/language')
const Clock = require('../../Utils/clock')

// Commands a restricted member can still use
const Allowed = ['help', 'setup-language']

// Active /restrict of a member on a server, null = none (an expired one is deleted)
async function ActiveRestriction(GuildID, UserID) {
    const R = await Restriction.findOne({ GuildID, UserID }).lean()
    if (!R) return null
    if (R.Until != null && R.Until <= Clock.Now()) {
        await Restriction.deleteOne({ _id: R._id }).catch(() => {})
        return null
    }
    return R
}

// "until <t:...>" text of a restriction
const UntilText = (R, vi) => (R.Until == null) ? (vi ? '**vô thời hạn**' : '**forever**') : `<t:${Math.floor(R.Until / 1000)}> (<t:${Math.floor(R.Until / 1000)}:R>)`

// Called before every command: true = blocked (Seia already answered, only them can see it).
// Runs before the command answers Discord (3s max): a down / slow database lets the command through
async function BlockRestricted(interaction) {
    if (Allowed.includes(interaction.commandName) || !DbReady()) return false
    const R = await Promise.race([
        ActiveRestriction(interaction.guildId, interaction.user.id).catch(() => null),
        wait(1000).then(() => null)
    ])
    if (!R) return false

    const vi = ((await SavedLanguage(interaction.user.id).catch(() => null)) || LocaleLang(interaction)) === 'vi'
    await interaction.reply({
        embeds: [SeiaEmbed(interaction, 'Red')
            .setTitle(`<:SeiaMenacing:1244890322090201162> ${vi ? 'Bị hạn chế dùng lệnh' : 'Restricted from commands'}`)
            .setDescription(vi
                ? `<:LYG_KeqingDoi:1086190826536849499> | Sensei đang bị hạn chế dùng lệnh của Seia ở server này đến ${UntilText(R, vi)}\n> **Lí do:** ${R.Reason}`
                : `<:LYG_KeqingDoi:1086190826536849499> | You're restricted from using Seia's commands on this server until ${UntilText(R, vi)}\n> **Reason:** ${R.Reason}`)],
        flags: MessageFlags.Ephemeral
    }).catch(() => {})
    return true
}

module.exports = { ActiveRestriction, BlockRestricted, UntilText, Allowed }
