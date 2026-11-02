const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Clock = require('../../Utils/clock')
const Warns = require('../../Database/Moderation/warns')
const { ModE, RequireMod, TargetProblem, ModLog, LogText } = require('../../Functions/Moderation/mod')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('-Mod Only- Warn someone (saved, see them with /warn-list)')
        .setDescriptionLocalizations({ vi: '-Mod Only- Cảnh cáo một người (được lưu lại, xem bằng /warn-list)' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who you want to warn')
                .setDescriptionLocalizations({ vi: 'Người bạn muốn cảnh cáo' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Why (optional)')
                .setDescriptionLocalizations({ vi: 'Lí do cảnh cáo (không bắt buộc)' })
                .setMaxLength(400)
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (!await RequireMod(interaction, LangKey)) return

        const target = interaction.options.getUser('user')
        const member = await interaction.guild.members.fetch(target.id).catch(() => null)
        const reason = interaction.options.getString('reason')?.trim() || `${ModE.What} ${vi ? 'Không có lí do nào cả...' : 'No reason at all...'}`
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle('Yurizono Seia - Warn').setDescription(desc)

        if (!member) return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${vi ? `${target} đâu có ở trong server này?` : `${target} isn't in this server`}`)] })
        const problem = TargetProblem(interaction, target, member, LangKey)
        if (problem) return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${problem}`)] })

        const data = await Warns.findOneAndUpdate(
            { GuildID: interaction.guild.id, UserID: target.id },
            { $push: { Warns: { Reason: reason, ModID: interaction.user.id, Date: Clock.Now() } } },
            { upsert: true, new: true }
        ).lean()
        const Count = data.Warns.length

        await interaction.editReply({ embeds: [Embed('Yellow', vi
            ? `${ModE.Menacing} | Đã cảnh cáo ${target} (lần thứ **${Count}**)\n> **Lí do:** ${reason}`
            : `${ModE.Menacing} | Warned ${target} (warning **#${Count}**)\n> **Reason:** ${reason}`)] })
        await ModLog(interaction, 'Yellow', LogText(vi, ModE.Menacing, 'Warn', vi
            ? [`**Người dùng:** ${target} (\`${target.id}\`)`, `**Lí do:** ${reason}`, `**Số lần cảnh cáo:** ${Count}`, `**Người thực hiện:** ${interaction.user}`]
            : [`**User:** ${target} (\`${target.id}\`)`, `**Reason:** ${reason}`, `**Warnings:** ${Count}`, `**By:** ${interaction.user}`]))
    }
}
