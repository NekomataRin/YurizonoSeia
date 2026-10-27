const cdSchema = require('../Database/cooldown')
const cdtxts = require('../Assets/Defaults/cooldown')
const { SeiaEmbed } = require('./embed')
const Clock = require('./clock')

// Time (ms, Discord's clock) the command `Key` can be used again by that user (0 = right now)
async function GetCooldown(UserID, Key) {
    const data = await cdSchema.findOne({ UserID }).select(`-_id ${Key}`).lean()
    return Number(data?.[Key]) || 0
}

async function SetCooldown(UserID, Key, Until) {
    await cdSchema.updateOne({ UserID }, { $set: { [Key]: String(Until) } }, { upsert: true })
}

// true = still on cooldown (Seia already replied with the time left).
// Time (ms) > 0 starts the cooldown right away, leave it out to call SetCooldown later.
async function OnCooldown(interaction, Key, LangKey = 'en-US', Time = 0) {
    const Until = await GetCooldown(interaction.user.id, Key)
    if (Until > Clock.Now()) {
        const txt = cdtxts[LangKey] || cdtxts['en-US']
        const CooldownEmbed = SeiaEmbed(interaction, 'Red')
            .setTitle('**Command - Cooldown**')
            .setDescription(`${txt.cd[0]} ${interaction.user} ${txt.cd[1]} <t:${Math.floor(Until / 1000)}:R>`)
        await interaction.editReply({ content: '', embeds: [CooldownEmbed], components: [], files: [] })
        return true
    }
    if (Time > 0) await SetCooldown(interaction.user.id, Key, Clock.Now() + Time)
    return false
}

module.exports = { OnCooldown, GetCooldown, SetCooldown }
