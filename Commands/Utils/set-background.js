const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Level = require('../../Database/Ranking/Leveling')
const UserCards = require('../../Database/Ranking/usercards')

// 'none' (default card) + every card the user unlocked
async function UnlockedCards(UserID) {
    const data = await UserCards.findOne({ UserID }).select('-_id Cards').lean()
    return ['none', ...(data?.Cards || [])]
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-background')
        .setDescription('Set your rank card in this server')
        .setDescriptionLocalizations({ vi: 'Đặt rank card của bạn trong server này' })
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('The rank card you unlocked')
                .setDescriptionLocalizations({ vi: 'Rank card bạn đã mở khoá' })
                .setAutocomplete(true)
                .setRequired(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase()
        const filtered = (await UnlockedCards(interaction.user.id)).filter(choice => choice.startsWith(focusedValue)).slice(0, 25)
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })))
    },

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        const key = interaction.options.getString('keyword').trim().toLowerCase()

        if (!(await UnlockedCards(interaction.user.id)).includes(key)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle(vi ? 'Lỗi - Key không hợp lệ' : 'Error - Invalid Key')
                    .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? 'Em không đặt được key này vì nó không có trong danh sách card của Sensei, xin lỗi nha!' : 'I cannot set this key because it is invalid from the database, sorry!'}`)]
            })
        }

        const data = await Level.findOne({ GuildID: interaction.guild.id, UserID: interaction.user.id })
        if (!data) {
            return interaction.editReply(vi ? '<:seiaheh:1244128244664504392> • Có vẻ Sensei chưa hoạt động ở server này... Chat một chút rồi thử lại sau nhé...' : '<:seiaheh:1244128244664504392> • Looks like you are currently not active yet in this server... Please chat a bit and try again later...')
        }

        if (key === 'none' && data.background === key) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'DarkButNotBlack')
                    .setTitle(`<:seiaheh:1244128244664504392> • ${vi ? 'Bỏ qua key' : 'Key skipped'}`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? `Vì Sensei ghi '\`${key}\`' nên em bỏ qua luôn nhé...` : `Since you wrote '\`${key}\`', I skipped this for you then...`}`)]
            })
        }

        data.background = key
        await data.save()

        const desc = (key === 'none')
            ? (vi ? `Đã khôi phục background mặc định cho <@${interaction.user.id}>` : `Successfully restored the default card background for <@${interaction.user.id}>`)
            : (vi ? `Đã đặt background rank card '\`${key}\`' cho <@${interaction.user.id}>` : `Successfully set the rank card background '\`${key}\`' for <@${interaction.user.id}>`)
        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'Yellow')
                .setTitle(`<:seiaheh:1244128244664504392> • ${vi ? 'Đã đặt key thành công.' : 'The key has been successfully set.'}`)
                .setDescription(`<:seiaehem:1244128370669650060> • ${desc}`)]
        })
    }
}
