const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { ModE, RequireMod, TargetProblem, Reason, AuditReason, ModLog, LogText } = require('../../Functions/Moderation/mod')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('-Mod Only- Ban someone from the server')
        .setDescriptionLocalizations({ vi: '-Mod Only- Ban một người khỏi server' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who you want to ban')
                .setDescriptionLocalizations({ vi: 'Người bạn muốn ban' })
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
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle('Yurizono Seia - Ban').setDescription(desc)

        //Someone who already left can still be banned (by ID)
        const problem = TargetProblem(interaction, target, member, LangKey, 'bannable')
        if (problem) return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${problem}`)] })

        try {
            await interaction.guild.bans.create(target.id, { reason: AuditReason(interaction, reason) })
        } catch (err) {
            return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${vi ? `Em không ban được ${target}` : `I couldn't ban ${target}`}: \`${err.message}\``)] })
        }

        await interaction.editReply({ embeds: [Embed('Red', vi ? `${ModE.Menacing} | Đã ban ${target}\n> **Lí do:** ${reason}` : `${ModE.Menacing} | Banned ${target}\n> **Reason:** ${reason}`)] })
        await ModLog(interaction, 'Red', LogText(vi, ModE.Menacing, 'Ban', vi
            ? [`**Người dùng:** ${target} (\`${target.id}\`)`, `**Lí do:** ${reason}`, `**Người thực hiện:** ${interaction.user}`]
            : [`**User:** ${target} (\`${target.id}\`)`, `**Reason:** ${reason}`, `**By:** ${interaction.user}`]))
    }
}
