const { ChannelType, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

module.exports = async (client, message) => {
    if (message.author.bot) return
    if (!message.content) return
    if (message.channel.type === ChannelType.DM || message.channel.type === ChannelType.GroupDM) return
    if (message.guild.id !== process.env.GUILD_ID) return

    const iuser = await message.guild.members.fetch(message.author.id)
    const Channel = client.channels.cache.get('1165537322943643678')

    let DelContent = message.content
    let desc = `Oh my~ Looks like someone deleted their message! What does it contain anyway? <:seiaheh:1244128244664504392>\n<:seiaehem:1244128370669650060> Message Author: ${message.member}\n> Channel: ${message.channel}`

    let AttachedFiles = message.attachments.map(att => att.url)
    console.log(AttachedFiles)
    let url = '', urlvalues = ''
    for (var i = 0; i < AttachedFiles.length; i++) {
        url += `[Attachment ${Number(i + 1)}](${AttachedFiles[i]})\n`
        urlvalues += `> ${url}`
    }

    const DelEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: `${message.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
        .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Delete Message')
        .setDescription(desc)
        .addFields({
            name: '<:seiaehem:1244129111169826829> Deleted Message Content',
            value: DelContent,
            inline: true
        })
        .setTimestamp()
        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
    if (AttachedFiles.length === 0) {
        await Channel.send({
            embeds: [DelEmbed]
        })
    } else {
        const DelEmbed_List = []
        for (var i in AttachedFiles) {
            DelEmbed_List[i] = new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({ name: `${message.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Delete Message')
                .setDescription(desc)
                .addFields(
                    {
                        name: '<:seiaehem:1244129111169826829> Deleted Message Content',
                        value: DelContent,
                        inline: true
                    },
                    {
                        name: '<:mikaeat:1254109782592327783> Deleted Attachments',
                        value: urlvalues,
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await Channel.send({
                embeds: [DelEmbed_List[i]]
            })
            return
        }
    }
}