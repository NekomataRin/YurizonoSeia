const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const Config = require('../../Utils/config')
const Level = require('../../Database/Ranking/Leveling')
const BotOwner = require('../../Utils/owners')
const { ClearLevelRoles } = require('../../Functions/Ranking/rank-roles')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-rank')
        .setDescription('-Mod/Owner Only- Reset all exp in the server'),

    async execute(interaction) {
        await interaction.deferReply()

        const member = await interaction.guild.members.fetch(interaction.user.id)
        if (!member.roles.cache.has(Config.Roles.Mod) && !BotOwner.includes(interaction.user.id)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle('<:seiaconcerned:1244128341540208793> • No permissions')
                    .setDescription('<:seiaehem:1244128370669650060> • You do not have enough permissions to run this command...')]
            })
        }

        const ChoicesButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('yes')
                    .setLabel('| Yes')
                    .setEmoji('1384989806593048727')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('no')
                    .setLabel('| No')
                    .setEmoji('1138231827140706304')
                    .setStyle(ButtonStyle.Secondary)
            )

        const message = await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle('<:seiaconcerned:1244128341540208793> • Reset Rank - Notice')
                .setDescription('<:SeiaSip:1244890166116618340> • Are you sure you want to reset all ranking data from all server members? Before you do, here are some things before you proceed:\n1. This will delete all EXP data\n2. Once this process has been done, it cannot be reverted back')],
            components: [ChoicesButton]
        })

        //1 minute to answer, then the buttons go away
        const choice = await message.awaitMessageComponent({ filter: a => a.user.id === interaction.user.id, time: 60000 }).catch(() => null)
        if (!choice || choice.customId === 'no') {
            const ResetReject = SeiaEmbed(interaction, 'Green')
                .setTitle('<:seiaconcerned:1244128341540208793> • Reset Rank - Aborted')
                .setDescription('<:SeiaSip:1244890166116618340> • Well, the server\'s exp leaderboard is still the same as before...')
            return (choice) ? choice.update({ embeds: [ResetReject], components: [] }) : interaction.editReply({ embeds: [ResetReject], components: [] })
        }

        await choice.update({
            embeds: [SeiaEmbed(interaction, 'Yellow')
                .setTitle('<:seiaconcerned:1244128341540208793> • Reset Rank - Proceeding')
                .setDescription('<:SeiaSip:1244890166116618340> • Resetting the server\'s exp system... Please wait...')],
            components: []
        })
        await wait(3000)

        //EXP goes back to 0. Users with a background or a restriction keep their document so those aren't lost
        const GuildID = interaction.guild.id
        await Level.updateMany({ GuildID }, { $set: { exp: 0, level: 0, total: 0 } })
        await Level.deleteMany({ GuildID, background: { $in: ['none', null] }, restrict: { $in: ['Code-0', null] } })

        //Level roles go too (main server). The 10000 total EXP role is permanent and stays
        const Cleared = await ClearLevelRoles(interaction.guild)

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'Red')
                .setTitle('<:seiaconcerned:1244128341540208793> • Reset Rank - Done!')
                .setDescription(`<:seiaheh:1244128244664504392> • The server members' ranking data has been deleted, hope you won't regret it, heehee${(Cleared) ? `\n> Removed the ranking roles from \`${Cleared}\` members` : ''}`)]
        })
    }
}
