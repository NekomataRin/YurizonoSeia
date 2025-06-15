const { ChannelType, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

module.exports = async (client, message) => {
    if (message.author.bot) return
    if (message.channel.type === ChannelType.DM || message.channel.type === ChannelType.GroupDM) return
    if (message.guild.id !== process.env.GUILD_ID) return

    const iuser = await message.guild.members.fetch(message.author.id)
    const Channel = client.channels.cache.get('1165537322943643678')
    
    let n = await message.fetch()
    let EditedContent = n.content, PreContent = message.content
    if (EditedContent === PreContent) return
    let desc = `Ufufu~ Looks like someone edited their message! Are they hiding something? Or maybe they just made a typo / mistake?\n<:seiaehem:1244129111169826829> Message Author: ${message.member}\n> Channel: ${message.channel}`
    if (EditedContent.length > 1024 || PreContent.length > 1024) {
        const EditEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: `${message.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Edit Message')
            .setDescription(`${desc}\nWell... i think nope, absolutely nope, this message is too long!`)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
        return Channel.send({
            embeds: [EditEmbed]
        })
    } else {
        const EditEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: `${message.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Edit Message')
            .setDescription(desc)
            .addFields(
                {
                    name: '<:NoaNoted:1247028261847040050> Old Message Content',
                    value: PreContent,
                    inline: true
                },
                {
                    name: '<:SeiaPeek:1244890461592621147> New Message Content',
                    value: EditedContent,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        await Channel.send({
            embeds: [EditEmbed]
        })
    }
}