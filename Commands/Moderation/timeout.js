const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { ParseDuration, FormatDuration } = require('../../Utils/duration')
const Clock = require('../../Utils/clock')
const { ModE, RequireMod, TargetProblem, Reason, AuditReason, ModLog, LogText } = require('../../Functions/Moderation/mod')

// Discord allows 28 days at most (1 minute less, so a slow request never goes over)
const MaxTimeout = 28 * 86400000

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('-Mod Only- Timeout someone for a while (0 = remove their timeout)')
        .setDescriptionLocalizations({ vi: '-Mod Only- Timeout (rọ mõm) một người trong một khoảng thời gian (0 = gỡ timeout)' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who you want to timeout')
                .setDescriptionLocalizations({ vi: 'Người bạn muốn timeout' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('How long: 10m, 1h, 1d, 1h30m... (max 28d, 0 = remove)')
                .setDescriptionLocalizations({ vi: 'Bao lâu: 10m, 1h, 1d, 1h30m... (tối đa 28d, 0 = gỡ timeout)' })
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

        const target = interaction.options.getUser('user')
        const member = await interaction.guild.members.fetch(target.id).catch(() => null)
        const ms = ParseDuration(interaction.options.getString('duration'))
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle('Yurizono Seia - Timeout').setDescription(desc)

        if (ms === null || ms === Infinity) {
            return interaction.editReply({ embeds: [Embed('Red', vi ? `${ModE.Doi} | Hãy nhập thời gian hợp lệ đi bạn!!! (vd: \`10m\`, \`1h\`, \`1d\`, \`1h30m\`, \`0\` để gỡ)` : `${ModE.Doi} | Please type a valid duration!!! (e.g. \`10m\`, \`1h\`, \`1d\`, \`1h30m\`, \`0\` to remove)`)] })
        }
        if (!member) return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${vi ? `${target} đâu có ở trong server này?` : `${target} isn't in this server`}`)] })
        const problem = TargetProblem(interaction, target, member, LangKey, 'moderatable')
        if (problem) return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${problem}`)] })

        const reason = Reason(interaction, LangKey, ms > 0)
        const Capped = ms > MaxTimeout
        const Time = Math.min(ms, MaxTimeout)
        try {
            //Until = Discord's time (the phone's clock can be wrong)
            await member.disableCommunicationUntil((Time > 0) ? Clock.Now() + Math.min(Time, MaxTimeout - 60000) : null, AuditReason(interaction, reason))
        } catch (err) {
            return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${vi ? `Em không timeout được ${target}` : `I couldn't timeout ${target}`}: \`${err.message}\``)] })
        }

        if (Time === 0) {
            await interaction.editReply({ embeds: [Embed('Green', vi ? `${ModE.Sip} | Đã gỡ timeout cho ${target}\n> **Lí do gỡ timeout:** ${reason}` : `${ModE.Sip} | Removed ${target}'s timeout\n> **Reason:** ${reason}`)] })
            return ModLog(interaction, 'Green', LogText(vi, ModE.Sip, vi ? 'Gỡ timeout' : 'Remove timeout', vi
                ? [`**Người dùng:** ${target} (\`${target.id}\`)`, `**Lí do gỡ timeout:** ${reason}`, `**Người thực hiện:** ${interaction.user}`]
                : [`**User:** ${target} (\`${target.id}\`)`, `**Reason:** ${reason}`, `**By:** ${interaction.user}`]))
        }

        const End = Math.floor((Clock.Now() + Time) / 1000)
        const Length = `**${FormatDuration(Time, LangKey)}** (<t:${End}> | <t:${End}:R>)`
        const Note = (Capped) ? (vi ? '\n-# Thời gian bạn nhập quá 28 ngày, Discord chỉ cho timeout tối đa 28 ngày thôi' : '\n-# That was more than 28 days, Discord only allows 28 days at most') : ''
        await interaction.editReply({ embeds: [Embed('Red', vi
            ? `${ModE.Sip} | Đã timeout ${target}\n> **Thời gian:** ${Length}\n> **Lí do:** ${reason}${Note}`
            : `${ModE.Sip} | ${target} is timed out\n> **Duration:** ${Length}\n> **Reason:** ${reason}${Note}`)] })
        await ModLog(interaction, 'Red', LogText(vi, ModE.Sip, 'Timeout', vi
            ? [`**Người dùng:** ${target} (\`${target.id}\`)`, `**Thời gian:** ${Length}`, `**Lí do:** ${reason}`, `**Người thực hiện:** ${interaction.user}`]
            : [`**User:** ${target} (\`${target.id}\`)`, `**Duration:** ${Length}`, `**Reason:** ${reason}`, `**By:** ${interaction.user}`]))
    }
}
