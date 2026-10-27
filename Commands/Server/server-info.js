const { SlashCommandBuilder, ChannelType } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { OnCooldown } = require('../../Utils/cooldown')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Show some infos of the server'),

    async execute(interaction) {
        await interaction.deferReply()
        const cdtime = 10000

        if (await OnCooldown(interaction, 'ServerInfo', 'en-US', cdtime)) return

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

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(`<:seiaheh:1244128244664504392> **Server Info**`)
                .setDescription(`According to what I know, here's the information about this server\n<:SeiaConfused:1244890143333158932> **Server Name:** \`${guild.name}\`\n> **Server ID:** \`${guild.id}\`\n> <:SeiaSip:1244890166116618340> **Server Owner:** ${owner} (\`${owner.id}\`)\n> <:seiaehem:1244128370669650060> **Creation Time:** <t:${Math.floor(guild.createdTimestamp / 1000)}>\n> <:SeiaPeek:1244890461592621147> **Server Thumbnail:** [Thumbnail_URL](${guild.iconURL({ size: 512, extension: 'png' })})`)
                .addFields(
                    {
                        name: '<:mikaeat:1254109782592327783> Members',
                        value: `**Total:** ${guild.memberCount}\n> **Users:** ${guild.memberCount - Bots}\n> **Bots:** ${Bots}`,
                        inline: true
                    },
                    {
                        name: '<:NagisaTea:1245235614274555914> Channels',
                        value: `**Total:** ${AllChannel}\n> **Text Channels:** ${Txt}\n> **Voice Channels:** ${Voice}\n> **Announcement Channels:** ${Announcement}\n> **Threads:** ${Thread}\n> **Forums:** ${Forum}\n> **Stages:** ${Stage}`,
                        inline: true
                    },
                )
                .setThumbnail(guild.iconURL({ size: 512 }))]
        })
    }
}
