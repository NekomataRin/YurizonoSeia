const Config = require('../../Utils/config')
const BotOwner = require('../../Utils/owners')
const Log = require('../../Utils/logger')
const BotRole = require('../../Database/Server/bot-roles')

// guildId -> [{ Setting, RoleID }] of the owner-only roles that are set up
const Active = new Map()

const IsOwner = (id) => BotOwner.includes(id)

// Config.OwnerRoles { guildId: { RoleName: settings } } -> [{ Guild, Name, ...settings }]
function OwnerRoleList() {
    return Object.entries(Config.OwnerRoles || {}).flatMap(([Guild, roles]) =>
        Object.entries(roles).map(([Name, Setting]) => ({ Guild, Name, ...Setting }))
    )
}

// What was saved the first time: { RoleID, Placed } (database down = null, then the role is found by name)
async function SavedRole(Setting) {
    try {
        return await BotRole.findOne({ GuildID: Setting.Guild, Name: Setting.Name }).lean()
    } catch {
        return null
    }
}

// Moves the role to Setting.Position. Only this role is sent: discord.js role.setPosition() renumbers
// every role, and roles sharing a position (bots at the bottom) would put it one place too low
async function Place(guild, role, Setting) {
    try {
        await guild.roles.setPositions([{ role: role.id, position: Setting.Position }])
        return true
    } catch (err) {
        Log.Warn(`${Setting.Name}: cannot move it to position ${Setting.Position} (${err.message}), trying again on the next start`)
        return false
    }
}

// Discord can't send "ephemeral" messages outside a command, so the closest thing:
// a DM (only they see it), or a ping in NoticeChannel that is deleted after NoticeSeconds when DMs are closed
async function Notify(member, Setting) {
    if (member.user?.bot) return null
    const text = `${member} ${Setting.Notice}`
    const dm = await member.send(`${text}\n-# Role \`${Setting.Name}\` • ${member.guild.name}`).catch(() => null)
    if (dm) return 'dm'

    const channel = member.guild.channels.cache.get(Setting.NoticeChannel)
    const msg = await channel?.send({ content: text, allowedMentions: { users: [member.id] } }).catch(() => null)
    if (!msg) return null
    setTimeout(() => msg.delete().catch(() => {}), (Setting.NoticeSeconds ?? 10) * 1000)
    return 'channel'
}

// Takes the role back from someone who isn't an owner
async function Revoke(member, Setting, RoleID) {
    try {
        await member.roles.remove(RoleID, `${Setting.Name} is only for the bot owners`)
    } catch (err) {
        Log.Error(`${Setting.Name}: cannot remove it from ${member.user.username}:`, err.message)
        return false
    }
    Log.Info(`${Setting.Name}: removed from ${member.user.username} (${member.id}), not an owner`)
    await Notify(member, Setting)
    return true
}

// Startup: makes the role the first time (at Setting.Position), gives it to the owners, takes it from everyone else
async function SetupOwnerRole(client, Setting) {
    const guild = client.guilds.cache.get(Setting.Guild)
    if (!guild) return null

    const Saved = await SavedRole(Setting)
    let role = guild.roles.cache.get(Saved?.RoleID) || guild.roles.cache.find(r => r.name === Setting.Name)
    let created = false
    if (!role) {
        role = await guild.roles.create({
            name: Setting.Name,
            permissions: [],
            hoist: Boolean(Setting.Hoist),
            mentionable: false,
            ...(Setting.Color ? { colors: { primaryColor: Setting.Color } } : {}),
            reason: 'Owner-only role made by Seia'
        })
        created = true
    }
    // Moved once: right after it's made, or on the next start if that failed.
    // A role found by name (not made by Seia) stays where it is
    const Placed = (created || (Saved?.RoleID === role.id && !Saved.Placed)) ? await Place(guild, role, Setting) : true

    const list = (Active.get(guild.id) || []).filter(e => e.Setting.Name !== Setting.Name)
    Active.set(guild.id, [...list, { Setting, RoleID: role.id }])
    await BotRole.updateOne({ GuildID: guild.id, Name: Setting.Name }, { $set: { RoleID: role.id, Placed } }, { upsert: true })
        .catch(err => Log.Warn(`${Setting.Name}: cannot save the role ID (${err.message}), it will be found by name next time`))

    let given = 0, removed = 0
    const members = await guild.members.fetch()
    for (const member of members.values()) {
        const has = member.roles.cache.has(role.id)
        if (IsOwner(member.id) && !has) {
            await member.roles.add(role.id, 'Owner-only role')
                .then(() => given++)
                .catch(err => Log.Error(`${Setting.Name}: cannot give it to ${member.user.username}:`, err.message))
        } else if (!IsOwner(member.id) && has) {
            if (await Revoke(member, Setting, role.id)) removed++
        }
    }
    const Made = (created) ? `made${(Placed) ? ` at position ${Setting.Position}` : ''}, ` : ''
    Log.Info(`${Setting.Name} (${guild.name}): ${Made}given to ${given} owner(s), removed from ${removed} member(s)`)
    return { role, created, placed: Placed, given, removed }
}

async function SetupOwnerRoles(client) {
    for (const Setting of OwnerRoleList()) {
        await SetupOwnerRole(client, Setting).catch(err => Log.Error(`Owner role ${Setting.Name}:`, err.message))
    }
}

// guildMemberUpdate: someone who isn't an owner got an owner-only role -> it's removed right away
async function CheckMember(member) {
    if (IsOwner(member.id)) return 0
    let removed = 0
    for (const { Setting, RoleID } of Active.get(member.guild?.id) || []) {
        if (member.roles.cache.has(RoleID) && await Revoke(member, Setting, RoleID)) removed++
    }
    return removed
}

// guildMemberAdd: an owner who joins gets the owner-only roles of that server
async function GiveOwner(member) {
    if (!IsOwner(member.id)) return 0
    let given = 0
    for (const { RoleID } of Active.get(member.guild?.id) || []) {
        if (member.roles.cache.has(RoleID)) continue
        await member.roles.add(RoleID, 'Owner-only role').then(() => given++)
    }
    return given
}

module.exports = { SetupOwnerRoles, SetupOwnerRole, CheckMember, GiveOwner, OwnerRoleList }
