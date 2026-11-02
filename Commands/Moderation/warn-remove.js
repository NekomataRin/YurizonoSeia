const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Warns = require('../../Database/Moderation/warns')
const { ModE, RequireMod, ModLog, LogText } = require('../../Functions/Moderation/mod')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn-remove')
        .setDescription('-Mod Only- Remove one warning of someone (number from /warn-list)')
        .setDescriptionLocalizations({ vi: '-Mod Only- Xoá một cảnh cáo của một người (số thứ tự trong /warn-list)' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Whose warning')
                .setDescriptionLocalizations({ vi: 'Người bạn muốn xoá cảnh cáo' })
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Number of the warning in /warn-list')
                .setDescriptionLocalizations({ vi: 'Số thứ tự của cảnh cáo trong /warn-list' })
                .setMinValue(1)
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (!await RequireMod(interaction, LangKey)) return

        const target = interaction.options.getUser('user')
        const pos = interaction.options.getInteger('position')
        const data = await Warns.findOne({ GuildID: interaction.guild.id, UserID: target.id }).lean()
        const List = data?.Warns || []
        const Embed = (color, title, desc) => SeiaEmbed(interaction, color).setTitle(title).setDescription(desc)

        if (!List.length) {
            return interaction.editReply({ embeds: [Embed('Green', vi ? '**Không có cảnh cáo**' : '**No warnings**', vi ? `${ModE.Doi} | ${target} hiện không có lần cảnh cáo nào` : `${ModE.Doi} | ${target} has no warnings`)] })
        }
        if (pos > List.length) {
            return interaction.editReply({ embeds: [Embed('Yellow', vi ? '**Quá giới hạn**' : '**Out of range**', vi
                ? `${ModE.Doi} | Bạn nhập số nằm ngoài số lượng cảnh cáo của ${target} rồi! (hiện có **${List.length}**)`
                : `${ModE.Doi} | ${target} only has **${List.length}** warning(s)!`)] })
        }

        const Removed = List[pos - 1]
        await Warns.updateOne({ _id: data._id }, { $set: { Warns: List.filter((_, i) => i !== pos - 1) } })

        await interaction.editReply({ embeds: [Embed('Green', vi ? '**Đã xoá cảnh cáo**' : '**Warning removed**', vi
            ? `${ModE.Orin} Đã xoá cảnh cáo số **${pos}** của ${target}\n> **Nội dung cảnh cáo:** ${Removed.Reason}`
            : `${ModE.Orin} Removed warning **#${pos}** of ${target}\n> **Warning:** ${Removed.Reason}`)] })
        await ModLog(interaction, 'Green', LogText(vi, ModE.Orin, vi ? 'Xoá cảnh cáo' : 'Remove warning', vi
            ? [`**Người dùng:** ${target} (\`${target.id}\`)`, `**Nội dung cảnh cáo khi xoá:** ${Removed.Reason}`, `**Người thực hiện:** ${interaction.user}`]
            : [`**User:** ${target} (\`${target.id}\`)`, `**Removed warning:** ${Removed.Reason}`, `**By:** ${interaction.user}`]))
    }
}
