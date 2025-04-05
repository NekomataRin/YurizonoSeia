const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk')
const cdSchema = require('../../Database/cooldown')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Show some infos of the server'),

    async execute(interaction) {
        await interaction.deferReply()
        const cdtime = 10000

        const owner = await interaction.guild.fetchOwner()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        var Bots = await interaction.guild.members.cache.filter(member => member.user.bot).size

        const AllChannel = await interaction.guild.channels.cache.filter(c => c.type !== 4).size
        const Txt = await interaction.guild.channels.cache.filter(c => c.type === 0).size
        const Voice = await interaction.guild.channels.cache.filter(c => c.type === 2).size
        const Thread = await interaction.guild.channels.cache.filter(c => c.type === 10 || c.type === 11 || c.type === 12).size
        const Announcement = await interaction.guild.channels.cache.filter(c => c.type === 5).size
        const Forum = await interaction.guild.channels.cache.filter(c => c.type === 15).size
        const Stage = await interaction.guild.channels.cache.filter(c => c.type === 13).size

        const ServerEmbed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle(`<:seiaheh:1244128244664504392> **Server Info**`)
            .setDescription(`According to what I know, here's the information about this server\n<:SeiaConfused:1244890143333158932> **Server Name:** \`${interaction.guild.name}\`\n> **Server ID:** \`${interaction.guild.id}\`\n> <:SeiaSip:1244890166116618340> **Server Owner:** ${owner} (\`${owner.id}\`)\n> <:seiaehem:1244128370669650060> **Creation Time:** <t:${Math.floor(interaction.guild.createdTimestamp / 1000)}>\n> <:SeiaPeek:1244890461592621147> **Server Thumbnail:** [Thumbnail_URL](${interaction.guild.iconURL({ dynamic: true, size: 512, extension: 'png' })})`)
            .addFields(
                {
                    name: '<:mikaeat:1254109782592327783> Members',
                    value: `**Total:** ${interaction.guild.memberCount}\n> **Users:** ${interaction.guild.memberCount - Bots}\n> **Bots:** ${Bots}`,
                    inline: true
                },
                {
                    name: '<:NagisaTea:1245235614274555914> Channels',
                    value: `**Total:** ${AllChannel}\n> **Text Channels:** ${Txt}\n> **Voice Channels:** ${Voice}\n> **Announcement Channels:** ${Announcement}\n> **Threads:** ${Thread}\n> **Forums:** ${Forum}\n> **Stages:** ${Stage}`,
                    inline: true
                },
            )
            .setColor('White')
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        cdSchema.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                cdSchema.create({
                    UserID: interaction.user.id,
                    ServerInfo: Date.now()
                })
                await interaction.editReply('<:seiaconcerned:1244129048494473246> Well, since you haven\'t in cooldown database yet... now you can try again')
            } else {
                const cduser = data.UserID
                const CDTime = data.ServerInfo
                console.log(chalk.yellow('[Command: ServerInfo]') + ` ${cduser}, ${CDTime}, ${Date.now()}`)

                if (CDTime > Date.now()) {
                    const cdembed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`**Command - Cooldown**`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(` <:seiaconcerned:1244129048494473246> | ${interaction.user} Sensei! Can you please stop doing that command again? I'm exhausted, I can take a rest too, you know? I'm not some sort of a real robot who can repeatedly do this for you!\n-# You can use this command again in: <t:${Math.floor(CDTime/1000)}:R>`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({ embeds: [cdembed] })
                } else {
                    data.ServerInfo = Date.now() + cdtime
                    data.save() 
                    await interaction.editReply({
                        embeds: [ServerEmbed]
                    })
                }
            }
        })
    }
}