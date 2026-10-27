const { EmbedBuilder } = require('discord.js')
const { Footer, Cut } = require('../../Utils/embed')
const Config = require('../../Utils/config')
const Clock = require('../../Utils/clock')

// A message that wasn't in the cache (partial) only counts as edited when Discord's
// edit time is this recent. Link previews, pins, threads... also fire messageUpdate
// but don't change the edit time, so they are not logged anymore.
const FRESH_EDIT_MS = 60000

module.exports = async (client, oldMessage, newMessage) => {
    if (!newMessage.inGuild() || newMessage.guild.id !== process.env.GUILD_ID) return

    if (newMessage.partial) newMessage = await newMessage.fetch().catch(() => null)
    if (!newMessage || newMessage.author.bot || !newMessage.content) return

    //Only real edits have an edit time
    if (!newMessage.editedTimestamp) return
    if (oldMessage.partial) {
        if (Clock.Now() - newMessage.editedTimestamp > FRESH_EDIT_MS) return
    } else if (oldMessage.content === newMessage.content) return

    const Channel = client.channels.cache.get(Config.Channels.MessageLog)
    if (!Channel) return

    let desc = `Ufufu~ Looks like someone edited their message! Are they hiding something? Or maybe they just made a typo / mistake?\n<:seiaehem:1244128370669650060> Message Author: ${newMessage.author}\n> Channel: ${newMessage.channel}\n> [Jump to message](${newMessage.url})`
    if (oldMessage.partial) desc += `\n-# > Note: This message is partial, so I cannot get the previous edited content!`

    const EditEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: newMessage.author.username, iconURL: (newMessage.member || newMessage.author).displayAvatarURL({ size: 512 }) })
        .setTitle('<:seiaconcerned:1244128341540208793> • Log Action: Edit Message')
        .setDescription(desc)
        .setTimestamp()
        .setFooter(Footer())

    if (!oldMessage.partial && oldMessage.content) {
        EditEmbed.addFields({ name: '<:NoaNoted:1247028261847040050> Old Message Content', value: Cut(oldMessage.content), inline: true })
    }
    EditEmbed.addFields({ name: '<:SeiaPeek:1244890461592621147> New Message Content', value: Cut(newMessage.content), inline: true })

    await Channel.send({ embeds: [EditEmbed] })
}
