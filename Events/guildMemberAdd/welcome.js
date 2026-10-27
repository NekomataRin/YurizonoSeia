const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const path = require('path')
const ServerData = require('../../Database/Server/memberlist')
const { MemberCard } = require('../../Functions/Server/member-card')
const { Footer } = require('../../Utils/embed')
const Config = require('../../Utils/config')

const ImageList = {
    welcome: path.join(__dirname, '..', '..', 'Assets', 'MemberLogging', 'welcome.png'),
    welcome_back: path.join(__dirname, '..', '..', 'Assets', 'MemberLogging', 'welcomeback.png')
}

module.exports = async (client, member) => {
    if (member.guild.id !== process.env.GUILD_ID) return

    const guild = member.guild
    const channel = await client.channels.fetch(Config.Channels.Welcome).catch(() => null)
    if (!channel) return

    //Joined before = "Welcome back", first time = remember them
    const checkkey = Boolean(await ServerData.exists({ GuildID: guild.id, 'MemberList.UserId': member.user.id }))
    if (!checkkey && !member.user.bot) {
        await ServerData.updateOne({ GuildID: guild.id }, { $push: { MemberList: { UserId: member.user.id, joined: true } } }, { upsert: true })
    }

    const Image = await MemberCard({
        user: member.user,
        Background: (checkkey) ? ImageList.welcome_back : ImageList.welcome,
        Label: `Member no. ${guild.memberCount}`,
        StrokeColor: '#cae1ff'
    })
    const attachment = new AttachmentBuilder(Image, { name: `welcome.png` })
    const uavt = member.user.displayAvatarURL({ size: 512 })

    const title = (!checkkey) ? `<:CastoriceMelon:1384990166619394089> **Welcome To The Server!**` : `<:CastoriceSip:1360440195966570701> **Welcome Back To The Server!**`
    const desc = (!checkkey) ? `**Welcome <@${member.user.id}> to server \`${guild.name}\`**` : `**Welcome back <@${member.user.id}> to server \`${guild.name}\`**`
    const WelcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: member.user.username, iconURL: uavt })
        .setTitle(title)
        .setDescription(`### ${desc}\n\n▸ <:NagisaTea:1245235614274555914> Please enjoy your stay at the server! (Although it is already dead, hehe...)`)
        .setImage('attachment://welcome.png')
        .setFooter(Footer())
        .setColor('#cae1ff')
        .setThumbnail(uavt)

    await channel.send({ embeds: [WelcomeEmbed], files: [attachment] })
}
