const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const UserCards = require('../../Database/Ranking/usercards')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('background-view')
        .setDescription('View a user\'s Rank Card list')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User you want to see the list')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const user = interaction.options.getUser('user') || interaction.user

        const data = await UserCards.findOne({ UserID: user.id }).select('-_id Cards').lean()
        const Cards = data?.Cards || []

        const desc = (Cards.length === 0)
            ? `<:seiaehem:1244128370669650060> Unfortunately, ${user} has no rank cards other than \`none\`, heh...`
            : `<:seiaehem:1244128370669650060> Rank Card List Of User: ${user}\nRank Cards: \`none\`, ${Cards.map(card => `\`${card}\``).join(', ')}`

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'DarkGreen')
                .setTitle((Cards.length === 0) ? `<:seiaconcerned:1244128341540208793> **No data provided**` : `<:seiaconcerned:1244128341540208793> **Rank Cards Data**`)
                .setDescription(desc)]
        })
    }
}
