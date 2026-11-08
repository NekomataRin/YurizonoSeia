const { Guilds } = require('../../Utils/Ranking/guilds')
const Level = require('../../Database/Ranking/Leveling')
const Log = require('../../Utils/logger')

// Ranking roles of a server (Utils/Ranking/guilds.js RankRoles), null = that server has none
function RankRolesOf(guildId) {
    const Roles = Guilds[guildId]?.RankRoles
    if (!Roles) return null
    const Levels = Roles.Levels || [], TotalExp = Roles.TotalExp || []
    return { Levels, TotalExp, LevelIds: Levels.map(m => m.Role) }
}

// Role of the highest milestone reached in that server (null below the first one)
function LevelRole(guildId, level) {
    let best = null
    for (const m of RankRolesOf(guildId)?.Levels || []) if (level >= m.Level && (!best || m.Level > best.Level)) best = m
    return best?.Role ?? null
}

// When Discord refuses (missing Manage Roles, role above the bot...) stop trying in that server for 10 minutes,
// so every message doesn't spam the API with the same error
const PauseUntil = new Map()
const Paused = (guild) => Date.now() < (PauseUntil.get(guild.id) || 0)
function Failed(guild, err) {
    PauseUntil.set(guild.id, Date.now() + 10 * 60 * 1000)
    Log.Error(`Ranking roles (${guild.name || guild.id}) paused for 10 minutes: ${err.message}`)
}

/*
Gives / removes the ranking roles of a member (servers with RankRoles only).
Returns the IDs of the roles that were just given.
- Normal (every EXP gain): gives the milestone role of their level when they don't have it yet,
  and removes their other level roles. Never takes a role away otherwise.
- Sync = true (/exp-set): level roles match the level exactly.
TotalExp roles are given once reached and never removed.
*/
async function UpdateRankRoles(member, { level, total }, Sync = false) {
    const Roles = RankRolesOf(member?.guild?.id)
    if (!Roles || !member.roles?.cache || Paused(member.guild)) return []

    const has = (id) => member.roles.cache.has(id)
    const target = LevelRole(member.guild.id, level)
    const add = [], remove = []

    if (target && !has(target)) add.push(target)
    if (Sync || add.length) remove.push(...Roles.LevelIds.filter(id => id !== target && has(id)))
    for (const t of Roles.TotalExp) if (total >= t.Total && !has(t.Role)) add.push(t.Role)
    if (!add.length && !remove.length) return []

    const granted = []
    try {
        for (const id of add) {
            await member.roles.add(id, 'Ranking milestone')
            granted.push(id)
        }
        for (const id of remove) await member.roles.remove(id, 'Ranking milestone')
    } catch (err) {
        Failed(member.guild, err)
    }
    return granted
}

// Startup: members whose level already passed a milestone get its role right away,
// not only on their next message. Only adds missing roles (same rule as above), no messages.
// Returns how many members got a role
async function SyncAllRankRoles(guild) {
    const Roles = RankRolesOf(guild.id)
    if (!Roles) return 0

    //Only users past the first level / total EXP milestone
    const Reached = []
    if (Roles.Levels.length) Reached.push({ level: { $gte: Math.min(...Roles.Levels.map(m => m.Level)) } })
    if (Roles.TotalExp.length) Reached.push({ total: { $gte: Math.min(...Roles.TotalExp.map(t => t.Total)) } })
    if (!Reached.length) return 0

    const Ranked = await Level.find({ GuildID: guild.id, $or: Reached }).select('-_id UserID level total').lean()
    if (!Ranked.length) return 0

    const members = await guild.members.fetch()
    let changed = 0
    for (const data of Ranked) {
        const member = members.get(data.UserID)
        if (member && (await UpdateRankRoles(member, data)).length) changed++
        if (Paused(guild)) break //Discord refused, no point trying the others
    }
    return changed
}

// /leaderboard-reset: removes the level roles from every member (TotalExp roles stay). Returns how many members changed
async function ClearLevelRoles(guild) {
    const LevelIds = RankRolesOf(guild.id)?.LevelIds || []
    if (!LevelIds.length) return 0
    const members = await guild.members.fetch()

    let cleared = 0
    for (const member of members.values()) {
        const owned = LevelIds.filter(id => member.roles.cache.has(id))
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

module.exports = { UpdateRankRoles, SyncAllRankRoles, ClearLevelRoles, LevelRole, RankRolesOf }
