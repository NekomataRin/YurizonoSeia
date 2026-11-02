const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const UserCards = require('../../Database/Ranking/usercards')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('background-view')
        .setDescription('View a user\'s Rank Card list')
        .setDescriptionLocalizations({ vi: 'Xem danh sách rank card của một người dùng' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User you want to see the list')
                .setDescriptionLocalizations({ vi: 'Người dùng bạn muốn xem danh sách' })
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        const user = interaction.options.getUser('user') || interaction.user

        const data = await UserCards.findOne({ UserID: user.id }).select('-_id Cards').lean()
        const Cards = data?.Cards || []

        const desc = (Cards.length === 0)
            ? (vi ? `<:seiaehem:1244128370669650060> Tiếc ghê, ${user} chưa có rank card nào ngoài \`none\` cả, heh...` : `<:seiaehem:1244128370669650060> Unfortunately, ${user} has no rank cards other than \`none\`, heh...`)
            : (vi ? `<:seiaehem:1244128370669650060> Danh sách rank card của: ${user}\nRank card: \`none\`, ${Cards.map(card => `\`${card}\``).join(', ')}` : `<:seiaehem:1244128370669650060> Rank Card List Of User: ${user}\nRank Cards: \`none\`, ${Cards.map(card => `\`${card}\``).join(', ')}`)

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'DarkGreen')
                .setTitle((Cards.length === 0) ? `<:seiaconcerned:1244128341540208793> **${vi ? 'Không có dữ liệu' : 'No data provided'}**` : `<:seiaconcerned:1244128341540208793> **${vi ? 'Dữ liệu rank card' : 'Rank Cards Data'}**`)
                .setDescription(desc)]
        })
    }
}
