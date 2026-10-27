const { RankRoles } = require('../../Utils/Ranking/guilds')
const Level = require('../../Database/Ranking/Leveling')
const Log = require('../../Utils/logger')

const LevelRoleIds = RankRoles.Levels.map(m => m.Role)

// Role of the highest milestone reached (null below the first one)
function LevelRole(level) {
    let role = null
    for (const m of RankRoles.Levels) if (level >= m.Level) role = m.Role
    return role
}

// When Discord refuses (missing Manage Roles, role above the bot...) stop trying for 10 minutes,
// so every message doesn't spam the API with the same error
let PauseUntil = 0
function Failed(err) {
    PauseUntil = Date.now() + 10 * 60 * 1000
    Log.Error(`Ranking roles paused for 10 minutes: ${err.message}`)
}

/*
Gives / removes the ranking roles of a member (main server only).
Returns the IDs of the roles that were just given.
- Normal (every EXP gain): gives the milestone role of their level when they don't have it yet,
  and removes their other level roles. Never takes a role away otherwise.
- Sync = true (/set-exp): level roles match the level exactly.
TotalExp roles are given once reached and never removed.
*/
async function UpdateRankRoles(member, { level, total }, Sync = false) {
    if (!member?.roles?.cache || member.guild?.id !== process.env.GUILD_ID) return []
    if (Date.now() < PauseUntil) return []

    const has = (id) => member.roles.cache.has(id)
    const target = LevelRole(level)
    const add = [], remove = []

    if (target && !has(target)) add.push(target)
    if (Sync || add.length) remove.push(...LevelRoleIds.filter(id => id !== target && has(id)))
    for (const t of RankRoles.TotalExp) if (total >= t.Total && !has(t.Role)) add.push(t.Role)
    if (!add.length && !remove.length) return []

    const granted = []
    try {
        for (const id of add) {
            await member.roles.add(id, 'Ranking milestone')
            granted.push(id)
        }
        for (const id of remove) await member.roles.remove(id, 'Ranking milestone')
    } catch (err) {
        Failed(err)
    }
    return granted
}

// Startup: members whose level already passed a milestone get its role right away,
// not only on their next message. Only adds missing roles (same rule as above), no messages.
// Returns how many members got a role
async function SyncAllRankRoles(guild) {
    if (guild.id !== process.env.GUILD_ID) return 0
    const FirstLevel = Math.min(...RankRoles.Levels.map(m => m.Level))
    const FirstTotal = Math.min(...RankRoles.TotalExp.map(t => t.Total))
    const Ranked = await Level.find({ GuildID: guild.id, $or: [{ level: { $gte: FirstLevel } }, { total: { $gte: FirstTotal } }] })
        .select('-_id UserID level total').lean()
    if (!Ranked.length) return 0

    const members = await guild.members.fetch()
    let changed = 0
    for (const data of Ranked) {
        const member = members.get(data.UserID)
        if (member && (await UpdateRankRoles(member, data)).length) changed++
        if (Date.now() < PauseUntil) break //Discord refused, no point trying the others
    }
    return changed
}

// /reset-rank: removes the level roles from every member (TotalExp roles stay). Returns how many members changed
async function ClearLevelRoles(guild) {
    if (guild.id !== process.env.GUILD_ID) return 0
    const members = await guild.members.fetch()

    let cleared = 0
    for (const member of members.values()) {
        const owned = LevelRoleIds.filter(id => member.roles.cache.has(id))
        if (!owned.length) continue
        try {
            for (const id of owned) await member.roles.remove(id, 'Ranking reset')
            cleared++
        } catch (err) {
            Log.Error(`Cannot remove ranking roles from ${member.user.username}:`, err.message)
        }
    }
    return cleared
}

module.exports = { UpdateRankRoles, SyncAllRankRoles, ClearLevelRoles, LevelRole, LevelRoleIds }
