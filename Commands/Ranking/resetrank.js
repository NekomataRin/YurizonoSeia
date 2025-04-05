const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const wait = require('node:timers/promises').setTimeout
const FooterEmbeds = require('../../Utils/embed')
const Level = require('../../Database/Ranking/Leveling')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetrank')
        .setDescription('-Mod Only- Reset all exp in the server'),

    async execute(interaction) {
        await interaction.deferReply()

        const ChoicesButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('yes')
                    .setLabel('| Yes')
                    .setEmoji('1244129048494473246')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('no')
                    .setLabel('| No')
                    .setEmoji('1244129111169826829')
                    .setStyle(ButtonStyle.Secondary)
            )

        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const usemem = await interaction.guild.members.fetch(interaction.user.id)
        var usingkey = false
        if (usemem.roles.cache.has('1244608723737903165')) {
            usingkey = true
        }

        const NoPerm = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • No permissions')
            .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        if (!usingkey) {
            return interaction.editReply({
                embeds: [NoPerm]
            })
        } else {
            const ResetChoice = new EmbedBuilder()
                .setColor('White')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Reset Rank - Notice')
                .setDescription('<:SeiaSip:1244890166116618340> • Are you sure you want to reset all ranking data from all server members? Before you do, here are some things before you proceed:\n1. This will delete all EXP data\n2. Once this process has been done, it cannot be reverted back')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [ResetChoice],
                components: [ChoicesButton]
            })

            const ResetConfirm = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Reset Rank - Done!')
                .setDescription('<:seiaheh:1244128244664504392> • The server members\' ranking data has been deleted, hope you won\'t regret it, heehee')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

            const ResetDoing = new EmbedBuilder()
                .setColor('Yellow')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Reset Rank - Proceeding')
                .setDescription('<:SeiaSip:1244890166116618340> • Resetting the server\'s exp system... Please wait...')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

            const ResetReject = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Reset Rank - Aborted')
                .setDescription('<:SeiaSip:1244890166116618340> • Well, the server\'s exp leaderboard is still the same as before...')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

            const user = interaction.user.id
            const message = await interaction.fetchReply()
            const filter = a => a.user.id === user;
            const collector = interaction.channel.createMessageComponentCollector({ message, filter })
            collector.on('collect', async a => {
                if (a.customId === 'yes') {
                    await interaction.editReply({
                        embeds: [ResetDoing],
                        components: []
                    })
                    
                    await wait(3000)
                    await Level.updateMany({ GuildID: interaction.guild.id },
                        {
                            $set: {
                                exp: 0,
                                level: 0,
                                total: 0
                            }
                        }
                    )

                    await interaction.editReply({
                        embeds: [ResetConfirm]
                    })
                }
                if (a.customId === 'no') {
                    await interaction.editReply({
                        embeds: [ResetReject],
                        components: []
                    })
                }
            })
        }
    }
}