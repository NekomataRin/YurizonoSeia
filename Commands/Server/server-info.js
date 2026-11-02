const { SlashCommandBuilder, ChannelType } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Show some infos of the server')
        .setDescriptionLocalizations({ vi: 'Hiển thị thông tin của server' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'ServerInfo', LangKey, 10000)) return

        const guild = interaction.guild
        const owner = await guild.fetchOwner()
        const Bots = guild.members.cache.filter(member => member.user.bot).size

        const Channels = guild.channels.cache
        const Count = (...types) => Channels.filter(c => types.includes(c.type)).size
        const AllChannel = Channels.filter(c => c.type !== ChannelType.GuildCategory).size
        const Txt = Count(ChannelType.GuildText)
        const Voice = Count(ChannelType.GuildVoice)
        const Thread = Count(ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread)
        const Announcement = Count(ChannelType.GuildAnnouncement)
        const Forum = Count(ChannelType.GuildForum)
        const Stage = Count(ChannelType.GuildStageVoice)
        const L = vi
            ? { Intro: 'Theo những gì em biết, đây là thông tin của server này', Name: 'Tên server', Owner: 'Chủ server', Created: 'Ngày tạo', Thumb: 'Ảnh server', Members: 'Thành viên', Total: 'Tổng', Users: 'Người dùng', Bots: 'Bot', Chans: 'Kênh', Text: 'Kênh văn bản', Voice: 'Kênh thoại', Ann: 'Kênh thông báo', Threads: 'Chủ đề (thread)', Forums: 'Forum', Stages: 'Stage' }
            : { Intro: 'According to what I know, here\'s the information about this server', Name: 'Server Name', Owner: 'Server Owner', Created: 'Creation Time', Thumb: 'Server Thumbnail', Members: 'Members', Total: 'Total', Users: 'Users', Bots: 'Bots', Chans: 'Channels', Text: 'Text Channels', Voice: 'Voice Channels', Ann: 'Announcement Channels', Threads: 'Threads', Forums: 'Forums', Stages: 'Stages' }

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(`<:seiaheh:1244128244664504392> **${vi ? 'Thông Tin Server' : 'Server Info'}**`)
                .setDescription(`${L.Intro}\n<:SeiaConfused:1244890143333158932> **${L.Name}:** \`${guild.name}\`\n> **Server ID:** \`${guild.id}\`\n> <:SeiaSip:1244890166116618340> **${L.Owner}:** ${owner} (\`${owner.id}\`)\n> <:seiaehem:1244128370669650060> **${L.Created}:** <t:${Math.floor(guild.createdTimestamp / 1000)}>\n> <:SeiaPeek:1244890461592621147> **${L.Thumb}:** [Thumbnail_URL](${guild.iconURL({ size: 512, extension: 'png' })})`)
                .addFields(
                    {
                        name: `<:mikaeat:1254109782592327783> ${L.Members}`,
                        value: `**${L.Total}:** ${guild.memberCount}\n> **${L.Users}:** ${guild.memberCount - Bots}\n> **${L.Bots}:** ${Bots}`,
                        inline: true
                    },
                    {
                        name: `<:NagisaTea:1245235614274555914> ${L.Chans}`,
                        value: `**${L.Total}:** ${AllChannel}\n> **${L.Text}:** ${Txt}\n> **${L.Voice}:** ${Voice}\n> **${L.Ann}:** ${Announcement}\n> **${L.Threads}:** ${Thread}\n> **${L.Forums}:** ${Forum}\n> **${L.Stages}:** ${Stage}`,
                        inline: true
                    },
                )
                .setThumbnail(guild.iconURL({ size: 512 }))]
        })
    }
}
