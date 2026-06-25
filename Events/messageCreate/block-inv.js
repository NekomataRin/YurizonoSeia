const { ChannelType } = require('discord.js')

// Emoji for error
const ERR_EMOJI = '<a:SeiaMuted:1336385867136241705>'

// Regex to match Discord invite links
const inviteRegex = /(https?:\/\/|http?:\/\/)?(www.)?(discord.gg|discord.io|discord.me|discord.li|discordapp.com\/invite|discord.com\/invite)\/[^\s\/]+?(?=\b)/gi

// Channels allowed to share invites (add your channel IDs here)
const allowedChannels = [
    '900752742228844564',
    '953468782297366568',
    '901069937903296512',
    '953887368182661190'
]

module.exports = async (client, message) => {
    if (message.author.bot) return
    if (message.channel.type === ChannelType.DM) return
    if (message.guild.id !== process.env.GUILD_ID) return
    
    // If the channel is allowed, skip
    if (allowedChannels.includes(message.channel.id)) return

    const content = message.content
    let inviteCode
    const matches = [...content.matchAll(inviteRegex)]

    if (matches.length === 1) {
        inviteCode = matches[0][0]
    }

    if (matches.length > 0) {
        let key = true
        for (var i in matches) {
            let guild0 = await client.fetchInvite(matches[i][0])
            let id = guild0.guild?.id
            if (id !== message.guild.id) {
                key = false
                break
            }
        }
        if (!key) {
            await message.channel.send(`${ERR_EMOJI} ${message.author} Sensei! You cannot advertising other servers here!`)
            await message.delete()
        }
        return
    }

    if (matches.length === 0) return

    const invite = await client.fetchInvite(inviteCode)

    if (inviteRegex.test(content)) {
        if (invite.guild?.id === message.guild.id) return
        await message.channel.send(`${ERR_EMOJI} ${message.author} Sensei! You cannot advertising other servers here!`)
        await message.delete()
    }
}
