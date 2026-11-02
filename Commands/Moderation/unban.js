const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { ModE, RequireMod, Reason, AuditReason, ModLog, LogText } = require('../../Functions/Moderation/mod')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('-Mod Only- Unban someone (by their user ID)')
        .setDescriptionLocalizations({ vi: '-Mod Only- Gỡ ban một người (bằng ID của họ)' })
        .addStringOption(option =>
            option.setName('user-id')
                .setDescription('ID of the banned user')
                .setDescriptionLocalizations({ vi: 'ID của người bị ban' })
                .setMinLength(17)
                .setMaxLength(20)
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

        const id = interaction.options.getString('user-id').trim()
        const reason = Reason(interaction, LangKey, false)
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle('Yurizono Seia - Unban').setDescription(desc)

        try {
            if (!/^\d{17,20}$/.test(id)) throw new Error('invalid ID')
            await interaction.guild.bans.remove(id, AuditReason(interaction, reason))
        } catch {
            return interaction.editReply({ embeds: [Embed('Red', vi
                ? `${ModE.Doi} | ID \`${id}\` không bị ban (hoặc không tồn tại), thì làm sao em gỡ ban được?`
                : `${ModE.Doi} | \`${id}\` isn't banned (or doesn't exist), so how could I unban it?`)] })
        }

        await interaction.editReply({ embeds: [Embed('Green', vi ? `${ModE.Sip} | Đã gỡ ban <@${id}>\n> **Lí do gỡ ban:** ${reason}` : `${ModE.Sip} | Unbanned <@${id}>\n> **Reason:** ${reason}`)] })
        await ModLog(interaction, 'Green', LogText(vi, ModE.Sip, vi ? 'Gỡ ban' : 'Unban', vi
            ? [`**ID người dùng:** \`${id}\` (<@${id}>)`, `**Lí do gỡ ban:** ${reason}`, `**Người thực hiện:** ${interaction.user}`]
            : [`**User ID:** \`${id}\` (<@${id}>)`, `**Reason:** ${reason}`, `**By:** ${interaction.user}`]))
    }
}
