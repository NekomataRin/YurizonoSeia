const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const Level = require('../../Database/Ranking/Leveling')
const BotOwner = require('../../Utils/owners')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking-restriction')
        .setDescription('-Owner Only- Restrict a user from getting some aspect from the ranking system')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to restrict')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('restrict-code')
                .setDescription('The Restriction Code for that user, with detail explanation')
                .addChoices(
                    {
                        name: '[Code-0] - No Restrictions',
                        value: 'Code-0'
                    },
                    {
                        name: '[Code-1] - No Exp',
                        value: 'Code-1'
                    },
                    {
                        name: `[Code-2] - 50% Exp`,
                        value: `Code-2`
                    },
                    {
                        name: `[Code-3] - 25% Exp`,
                        value: `Code-3`
                    },
                )
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        if (!BotOwner.includes(interaction.user.id)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle('<:seiaconcerned:1244128341540208793> • No permissions')
                    .setDescription('<:seiaehem:1244128370669650060> • You do not have enough permissions to run this command...')]
            })
        }

        const user = interaction.options.getUser('user')
        const restrict_key = interaction.options.getString('restrict-code')

        const data = await Level.findOneAndUpdate(
            { GuildID: interaction.guild.id, UserID: user.id },
            { $set: { restrict: restrict_key } },
            { new: true }
        ).lean()

        if (!data) {
            return interaction.editReply('<:seiaheh:1244128244664504392> • Looks like the user you chose is currently not active yet... Please try again later...')
        }

        const Restricted = (restrict_key !== 'Code-0')
        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, (Restricted) ? 'Red' : 'Green')
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${(Restricted) ? 'Ranking Restricted!' : 'Ranking Unrestricted!'}`)
                .setDescription(`<:seiaehem:1244128370669650060> • User: ${user} | Restrict Key: ${restrict_key}`)]
        })
    }
}
