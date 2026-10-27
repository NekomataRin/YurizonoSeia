const { ChannelType } = require('discord.js')
const { Guilds, RankRoles } = require('../../Utils/Ranking/guilds')
const { CategoryMatches } = require('../../Functions/Ranking/exp-channels')
const { SyncAllRankRoles } = require('../../Functions/Ranking/rank-roles')
const Log = require('../../Utils/logger')

// Startup report: which categories give EXP, and can Seia manage the ranking roles?
module.exports = async (client) => {
    for (const [guildId, GuildConfig] of Object.entries(Guilds)) {
        const guild = client.guilds.cache.get(guildId)
        if (!guild || !GuildConfig.ExpCategories) continue

        const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory)
        const found = categories.filter(c => CategoryMatches(c, GuildConfig.ExpCategories))
        const missing = GuildConfig.ExpCategories.filter(entry => !categories.some(c => CategoryMatches(c, [entry])))
        Log.Info(`Ranking (${guild.name}) - EXP categories: ${found.map(c => c.name).join(', ') || 'none!'}`)
        if (missing.length) Log.Warn(`Ranking (${guild.name}) - categories not found: ${missing.join(', ')}. Server categories: ${categories.map(c => c.name).join(', ')}`)

        const excluded = guild.channels.cache.filter(c => found.has(c.parentId) && GuildConfig.NoExpChannels.includes(c.id))
        if (excluded.size) Log.Info(`Ranking (${guild.name}) - no EXP in: ${excluded.map(c => `#${c.name}`).join(', ')}`)
    }

    const main = client.guilds.cache.get(process.env.GUILD_ID)
    if (!main) return
    for (const { Role } of [...RankRoles.Levels, ...RankRoles.TotalExp]) {
        const role = main.roles.cache.get(Role)
        if (!role) Log.Warn(`Ranking role ${Role} doesn't exist in ${main.name}`)
        else if (!role.editable) Log.Warn(`Seia can't give the role @${role.name} (needs Manage Roles + her role above it)`)
    }

    //Members already past a milestone get its role now (in the background, the bot doesn't wait for it)
    SyncAllRankRoles(main)
        .then(count => Log.Info(`Ranking roles synced: ${count} member(s) got their missing role`))
        .catch(err => Log.Error('Ranking role sync failed:', err.message))
}
