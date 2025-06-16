const { ChannelType, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

module.exports = async (client, message) => {
    if (message.channel.type === ChannelType.DM || message.channel.type === ChannelType.GroupDM) return
    if (message.guild.id !== process.env.GUILD_ID) return
    const Channel = client.channels.cache.get('1165537322943643678')
    if (!message.partial) {
        if (message.author.bot) return
        if (!message.content) return
        const iuser = await message.guild.members.fetch(message.author.id)

        let n = await message.fetch().catch(e => { return null })
        if(!n) return
        let EditedContent = n.content, PreContent = message.content
        if (EditedContent === PreContent) return
        let desc = `Ufufu~ Looks like someone edited their message! Are they hiding something? Or maybe they just made a typo / mistake?\n<:seiaehem:1244128370669650060> Message Author: ${message.member}\n> Channel: ${message.channel}`
        if (EditedContent.length > 1024 || PreContent.length > 1024) {
            const EditEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({ name: `${message.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244128341540208793> • Log Action: Edit Message')
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
                .setTitle('<:seiaconcerned:1244128341540208793> • Log Action: Edit Message')
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
    } else {
        let n = await message.fetch().catch(e => { return null })
        if(!n) return
        if (n.author.bot) return
        if (!n.content) return

        const iuser = await message.guild.members.fetch(n.author.id)

        let EditedContent = n.content
        let desc = `Ufufu~ Looks like someone edited their message! Are they hiding something? Or maybe they just made a typo / mistake?\n<:seiaehem:1244128370669650060> Message Author: ${iuser}\n> Channel: ${message.channel}\n-# > Note: This message is partial, so I cannot get the previous edited content!`
        if (EditedContent.length > 1024) {
            const EditEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({ name: `${n.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244128341540208793> • Log Action: Edit Message')
                .setDescription(`${desc}\nWell... i think nope, absolutely nope, this message is too long!`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return Channel.send({
                embeds: [EditEmbed]
            })
        } else {
            const EditEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({ name: `${n.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244128341540208793> • Log Action: Edit Message')
                .setDescription(desc)
                .addFields(
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
}