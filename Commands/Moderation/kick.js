const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { ModE, RequireMod, TargetProblem, Reason, AuditReason, ModLog, LogText } = require('../../Functions/Moderation/mod')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('-Mod Only- Kick someone from the server')
        .setDescriptionLocalizations({ vi: '-Mod Only- Kick một người khỏi server' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who you want to kick')
                .setDescriptionLocalizations({ vi: 'Người bạn muốn kick' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Why (optional)')
                .setDescriptionLocalizations({ vi: 'Lí do (không bắt buộc)' })
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
        const reason = Reason(interaction, LangKey)
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle('Yurizono Seia - Kick').setDescription(desc)

        if (!member) return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${vi ? `${target} đâu có ở trong server này mà kick?` : `${target} isn't in this server, nothing to kick`}`)] })
        const problem = TargetProblem(interaction, target, member, LangKey, 'kickable')
        if (problem) return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${problem}`)] })

        try {
            await member.kick(AuditReason(interaction, reason))
        } catch (err) {
            return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${vi ? `Em không kick được ${target}` : `I couldn't kick ${target}`}: \`${err.message}\``)] })
        }

        await interaction.editReply({ embeds: [Embed('Orange', vi ? `${ModE.Menacing} | Đã kick ${target}\n> **Lí do:** ${reason}` : `${ModE.Menacing} | Kicked ${target}\n> **Reason:** ${reason}`)] })
        await ModLog(interaction, 'Orange', LogText(vi, ModE.Menacing, 'Kick', vi
            ? [`**Người dùng:** ${target} (\`${target.id}\`)`, `**Lí do:** ${reason}`, `**Người thực hiện:** ${interaction.user}`]
            : [`**User:** ${target} (\`${target.id}\`)`, `**Reason:** ${reason}`, `**By:** ${interaction.user}`]))
    }
}
