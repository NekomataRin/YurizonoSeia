const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const path = require('path')
const { MemberCard } = require('../../Functions/Server/member-card')
const { Footer } = require('../../Utils/embed')
const Config = require('../../Utils/config')

const Background = path.join(__dirname, '..', '..', 'Assets', 'MemberLogging', 'goodbye.png')

module.exports = async (client, member) => {
    if (member.guild.id !== process.env.GUILD_ID) return

    const guild = member.guild
    const channel = await client.channels.fetch(Config.Channels.Goodbye).catch(() => null)
    if (!channel) return

    //Left members can be partial, get the full user first
    const user = (member.user.partial) ? await member.user.fetch() : member.user

    const Image = await MemberCard({
        user,
        Background,
        Label: `Remaining: ${guild.memberCount}`,
        StrokeColor: '#ffddca'
    })
    const attachment = new AttachmentBuilder(Image, { name: `welcome.png` })
    const uavt = user.displayAvatarURL({ size: 512 })

    const GoodbyeEmbed = new EmbedBuilder()
        .setAuthor({ name: user.username, iconURL: uavt })
        .setTitle('<:SerikaZad:1230835627080286300> **Member Just Left The Server!**')
        .setDescription(`### <:CastoriceTired:1384989806593048727> **<@${user.id}> Just left the server** \`${guild.name}\`\n> Looks like they are not slacking anymore, or just got kicked by the server's owner lmao...`)
        .setImage('attachment://welcome.png')
        .setFooter(Footer())
        .setColor('#cae1ff')
        .setThumbnail(uavt)

    await channel.send({ embeds: [GoodbyeEmbed], files: [attachment] })
}
