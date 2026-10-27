const Config = require('../../Utils/config')
const Log = require('../../Utils/logger')

const ERR_EMOJI = '<a:SeiaMuted:1336385867136241705>'

// Discord invite links (+ the usual invite redirect sites)
const inviteRegex = /(?:https?:\/\/)?(?:www\.)?(?:discord(?:app)?\.com\/invite|discord\.(?:gg|io|me|li))\/[\w-]+/gi

// true when the invite leads to this server. Invites that can't be read (expired, fake,
// redirect sites) count as other servers.
async function IsOwnInvite(client, link, guildId) {
    try {
        const invite = await client.fetchInvite(link)
        return invite.guild?.id === guildId
    } catch {
        return false
    }
}

// Deletes messages advertising other servers (main server only).
// Returns true when the message was deleted.
async function BlockInvites(client, message) {
    if (!message.inGuild() || message.author?.bot) return false
    if (message.guild.id !== process.env.GUILD_ID) return false
    if (Config.Channels.InviteAllowed.includes(message.channel.id)) return false

    const links = message.content?.match(inviteRegex) || []
    if (links.length === 0) return false

    for (const link of links) {
        if (await IsOwnInvite(client, link, message.guild.id)) continue

        Log.Debug(`Blocked invite from ${message.author.id}: ${link}`)
        await message.channel.send(`${ERR_EMOJI} ${message.author} Sensei! You cannot advertising other servers here!`).catch(() => {})
        await message.delete().catch(() => {})
        return true
    }
    return false
}

module.exports = { BlockInvites }
