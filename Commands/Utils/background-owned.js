const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { UnlockedCards } = require('../../Functions/Ranking/cards')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('background-owned')
        .setDescription('See the rank cards a user (or you) unlocked on this server')
        .setDescriptionLocalizations({ vi: 'Xem các rank card một người dùng (hoặc bạn) đã mở khoá ở server này' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Whose cards - Default: yours')
                .setDescriptionLocalizations({ vi: 'Card của ai - Mặc định: của bạn' })
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        const user = interaction.options.getUser('user') || interaction.user

        //Cards unlocked on this server (each server has its own list)
        const Cards = await UnlockedCards(interaction.guild.id, user.id)

        const desc = (Cards.length === 0)
            ? (vi ? `<:seiaehem:1244128370669650060> Tiếc ghê, ${user} chưa có rank card nào ngoài \`none\` ở server này cả, heh...` : `<:seiaehem:1244128370669650060> Unfortunately, ${user} has no rank cards other than \`none\` on this server, heh...`)
            : (vi ? `<:seiaehem:1244128370669650060> Danh sách rank card của: ${user} (server này)\nRank card: \`none\`, ${Cards.map(card => `\`${card}\``).join(', ')}` : `<:seiaehem:1244128370669650060> Rank Card List Of User: ${user} (this server)\nRank Cards: \`none\`, ${Cards.map(card => `\`${card}\``).join(', ')}`)

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'DarkGreen')
                .setTitle((Cards.length === 0) ? `<:seiaconcerned:1244128341540208793> **${vi ? 'Không có dữ liệu' : 'No data provided'}**` : `<:seiaconcerned:1244128341540208793> **${vi ? 'Dữ liệu rank card' : 'Rank Cards Data'}**`)
                .setDescription(desc)]
        })
    }
}
