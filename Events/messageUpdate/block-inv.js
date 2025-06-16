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
    if (!message.partial) {
        if (message.author.bot) return
        if (message.channel.type === ChannelType.DM) return

        let n = await message.fetch()
        if (allowedChannels.includes(message.channel.id)) return
        const content = n.content

        console.log(content)
        let inviteCode
        const matches = [...content.matchAll(inviteRegex)]
        console.log(matches)
        if (matches.length === 1) {
            inviteCode = matches[0][0]
            const invite = await client.fetchInvite(inviteCode)

            if (inviteRegex.test(content)) {
                if (invite.guild?.id === message.guild.id) return
                await message.channel.send(`${ERR_EMOJI} ${message.author} Sensei! You cannot advertising other servers here!`)
                await message.delete()
            }
            return
        }

        if (matches.length > 0) {
            let key = true
            for (var i in matches) {
                let guild0 = await client.fetchInvite(matches[i][0])
                let id = guild0.guild?.id
                if (id !== n.guild.id) {
                    key = false
                    break
                }
            }
            if (!key) {
                await n.channel.send(`${ERR_EMOJI} ${n.author} Sensei! You cannot advertising other servers here!`)
                return n.delete()
            }
        }

        if (matches.length === 0) return
    } else {
        let n = await message.fetch()
        if (n.author.bot) return
        if (n.channel.type === ChannelType.DM) return

        if (allowedChannels.includes(n.channel.id)) return
        const content = n.content

        let inviteCode
        const matches = [...content.matchAll(inviteRegex)]
        console.log(matches.length)
        if (matches.length === 1) {
            inviteCode = matches[0][0]
            const invite = await client.fetchInvite(inviteCode)

            if (inviteRegex.test(content)) {
                if (invite.guild?.id === message.guild.id) return
                await n.channel.send(`${ERR_EMOJI} ${n.author} Sensei! You cannot advertising other servers here!`)
                await n.delete()
            }
            return
        }
        else if (matches.length > 0) {
            let key = true
            for (var i in matches) {
                let guild0 = await client.fetchInvite(matches[i][0])
                let id = guild0.guild?.id
                if (id !== n.guild.id) {
                    key = false
                    break
                }
            }
            if (!key) {
                await n.channel.send(`${ERR_EMOJI} ${n.author} Sensei! You cannot advertising other servers here!`)
                await n.delete()
            }
            return
        }

        if (matches.length === 0) return
    }

}
