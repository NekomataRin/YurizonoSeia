const { EmbedBuilder } = require('discord.js')
const { Footer, Cut } = require('../../Utils/embed')
const Config = require('../../Utils/config')
const { WasDeletedByBot } = require('../../Utils/bot-deleted')

module.exports = async (client, message) => {
    //Not cached = nothing to show
    if (message.partial || !message.inGuild()) return
    if (message.author.bot) return
    if (message.guild.id !== process.env.GUILD_ID) return
    if (WasDeletedByBot(message.id)) return

    const AttachedFiles = message.attachments.map(att => att.url)
    if (!message.content && AttachedFiles.length === 0) return

    const Channel = client.channels.cache.get(Config.Channels.MessageLog)
    if (!Channel) return

    const DelEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: message.author.username, iconURL: (message.member || message.author).displayAvatarURL({ size: 512 }) })
        .setTitle('<:seiaconcerned:1244128341540208793> • Log Action: Delete Message')
        .setDescription(`Oh my~ Looks like someone deleted their message! What does it contain anyway? <:seiaheh:1244128244664504392>\n<:seiaehem:1244128370669650060> Message Author: ${message.author}\n> Channel: ${message.channel}`)
        .addFields({
            name: '<:seiaehem:1244128370669650060> Deleted Message Content',
            value: Cut(message.content || '*(no text)*'),
            inline: true
        })
        .setTimestamp()
        .setFooter(Footer())

    if (AttachedFiles.length > 0) {
        DelEmbed.addFields({
            name: '<:mikaeat:1254109782592327783> Deleted Attachments',
            value: Cut(AttachedFiles.map((url, i) => `> [Attachment ${i + 1}](${url})`).join('\n')),
            inline: true
        })
    }

    await Channel.send({ embeds: [DelEmbed] })
}
