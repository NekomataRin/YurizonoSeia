const { ChannelType } = require('discord.js')
const { Guilds } = require('../../Utils/Ranking/guilds')
const { CategoryMatches } = require('../../Functions/Ranking/exp-channels')
const { SyncAllRankRoles, RankRolesOf } = require('../../Functions/Ranking/rank-roles')
const Log = require('../../Utils/logger')

// Startup report of every ranking server: which categories give EXP, and can Seia manage the ranking roles?
module.exports = async (client) => {
    for (const [guildId, GuildConfig] of Object.entries(Guilds)) {
        const guild = client.guilds.cache.get(guildId)
        if (!guild) continue

        if (GuildConfig.ExpCategories) {
            const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory)
            const found = categories.filter(c => CategoryMatches(c, GuildConfig.ExpCategories))
            const missing = GuildConfig.ExpCategories.filter(entry => !categories.some(c => CategoryMatches(c, [entry])))
            Log.Info(`Ranking (${guild.name}) - EXP categories: ${found.map(c => c.name).join(', ') || 'none!'}`)
            if (missing.length) Log.Warn(`Ranking (${guild.name}) - categories not found: ${missing.join(', ')}. Server categories: ${categories.map(c => c.name).join(', ')}`)

            const excluded = guild.channels.cache.filter(c => found.has(c.parentId) && (GuildConfig.NoExpChannels || []).includes(c.id))
            if (excluded.size) Log.Info(`Ranking (${guild.name}) - no EXP in: ${excluded.map(c => `#${c.name}`).join(', ')}`)
        }

        const Roles = RankRolesOf(guildId)
        if (!Roles) continue
        for (const { Role } of [...Roles.Levels, ...Roles.TotalExp]) {
            const role = guild.roles.cache.get(Role)
            if (!role) Log.Warn(`Ranking (${guild.name}) - role ${Role} doesn't exist`)
            else if (!role.editable) Log.Warn(`Ranking (${guild.name}) - Seia can't give the role @${role.name} (needs Manage Roles + her role above it)`)
        }

        //Members already past a milestone get its role now (in the background, the bot doesn't wait for it)
        SyncAllRankRoles(guild)
            .then(count => Log.Info(`Ranking roles (${guild.name}) synced: ${count} member(s) got their missing role`))
            .catch(err => Log.Error(`Ranking role sync (${guild.name}) failed:`, err.message))
    }
}
