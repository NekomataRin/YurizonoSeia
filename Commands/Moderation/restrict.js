const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { ParseDuration, FormatDuration } = require('../../Utils/duration')
const Clock = require('../../Utils/clock')
const Restriction = require('../../Database/Moderation/restrictions')
const { UntilText } = require('../../Functions/Moderation/restrict')
const { ModE, RequireMod, TargetProblem, Reason, ModLog, LogText } = require('../../Functions/Moderation/mod')

// Longer than 100 years = forever
const ForeverAfter = 100 * 365 * 86400000

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restrict')
        .setDescription('-Mod/Owner Only- Stop someone from using Seia\'s commands for a while (except /help)')
        .setDescriptionLocalizations({ vi: '-Mod/Owner Only- Cấm một người dùng lệnh của Seia trong một khoảng thời gian (trừ /help)' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who you want to restrict')
                .setDescriptionLocalizations({ vi: 'Người bạn muốn cấm dùng lệnh' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('How long: 30m, 2h, 1d, 1w... or perm (forever)')
                .setDescriptionLocalizations({ vi: 'Bao lâu: 30m, 2h, 1d, 1w... hoặc perm (vô thời hạn)' })
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
        //Mod roles of this server or a bot owner (one of the Moderation exceptions)
        if (!await RequireMod(interaction, LangKey, true)) return

        const target = interaction.options.getUser('user')
        const member = await interaction.guild.members.fetch(target.id).catch(() => null)
        const ms = ParseDuration(interaction.options.getString('duration'))
        const reason = Reason(interaction, LangKey)
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle('Yurizono Seia - Restriction').setDescription(desc)

        if (ms === null) return interaction.editReply({ embeds: [Embed('Red', vi ? `${ModE.Doi} | Hãy nhập giá trị thời gian hợp lệ đi bạn!!! (vd: \`30m\`, \`2h\`, \`1d\`, \`1w\`, \`perm\`)` : `${ModE.Doi} | Please type a valid duration!!! (e.g. \`30m\`, \`2h\`, \`1d\`, \`1w\`, \`perm\`)`)] })
        if (ms === 0) return interaction.editReply({ embeds: [Embed('Green', vi ? `${ModE.Bruh} | Thời gian là **0** thì cấm ${target} dùng lệnh để làm gì?` : `${ModE.Bruh} | **0** time? Then why restrict ${target} at all?`)] })
        const problem = TargetProblem(interaction, target, member, LangKey)
        if (problem) return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${problem}`)] })

        const Until = (ms > ForeverAfter) ? null : Clock.Now() + ms
        const Saved = await Restriction.findOneAndUpdate(
            { GuildID: interaction.guild.id, UserID: target.id },
            { $set: { Until, Reason: reason, ModID: interaction.user.id, Date: Clock.Now() } },
            { upsert: true, new: true }
        ).lean()

        const Length = (Until == null) ? (vi ? '**vô thời hạn**' : '**forever**') : `**${FormatDuration(ms, LangKey)}** - ${UntilText(Saved, vi)}`
        await interaction.editReply({ embeds: [Embed('Red', vi
            ? `<:SeiaMenacing:1244890322090201162> | Đã cấm ${target} dùng lệnh của Seia ở server này\n> **Thời gian:** ${Length}\n> **Lí do:** ${reason}`
            : `<:SeiaMenacing:1244890322090201162> | ${target} can't use Seia's commands on this server\n> **Duration:** ${Length}\n> **Reason:** ${reason}`)] })
        await ModLog(interaction, 'Red', LogText(vi, '<:SeiaMenacing:1244890322090201162>', 'Restrict', vi
            ? [`**Người dùng:** ${target} (\`${target.id}\`)`, `**Thời gian:** ${Length}`, `**Lí do:** ${reason}`, `**Người thực hiện:** ${interaction.user}`]
            : [`**User:** ${target} (\`${target.id}\`)`, `**Duration:** ${Length}`, `**Reason:** ${reason}`, `**By:** ${interaction.user}`]))
    }
}
