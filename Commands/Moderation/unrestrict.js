const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Restriction = require('../../Database/Moderation/restrictions')
const { ActiveRestriction } = require('../../Functions/Moderation/restrict')
const { RequireMod, ModLog, LogText } = require('../../Functions/Moderation/mod')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unrestrict')
        .setDescription('-Mod/Owner Only- Let someone use Seia\'s commands again')
        .setDescriptionLocalizations({ vi: '-Mod/Owner Only- Gỡ cấm dùng lệnh cho một người' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who you want to unrestrict')
                .setDescriptionLocalizations({ vi: 'Người bạn muốn gỡ cấm' })
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        //Mod roles of this server or a bot owner (one of the Moderation exceptions)
        if (!await RequireMod(interaction, LangKey, true)) return

        const target = interaction.options.getUser('user')
        if (!await ActiveRestriction(interaction.guild.id, target.id)) {
            return interaction.editReply({ embeds: [SeiaEmbed(interaction, 'Gold')
                .setTitle(`<:KikyouWhat:1415972956567375925> **${vi ? 'Không bị cấm' : 'Not restricted'}**`)
                .setDescription(vi ? `<a:ShirokoOk:1230150661589438464> • ${target} làm gì có bị cấm đâu mà gỡ nhỉ?` : `<a:ShirokoOk:1230150661589438464> • ${target} isn't restricted, so there's nothing to remove`)] })
        }

        await Restriction.deleteOne({ GuildID: interaction.guild.id, UserID: target.id })
        await interaction.editReply({ embeds: [SeiaEmbed(interaction, 'DarkGreen')
            .setTitle(`<:ReisaHappy:1257570012646871150> **${vi ? 'Đã gỡ cấm dùng lệnh' : 'Unrestricted'}**`)
            .setDescription(vi ? `<a:ShirokoOk:1230150661589438464> • ${target} đã có thể dùng lệnh của Seia trở lại` : `<a:ShirokoOk:1230150661589438464> • ${target} can use Seia's commands again`)] })
        await ModLog(interaction, 'DarkGreen', LogText(vi, '<:ReisaHappy:1257570012646871150>', 'Unrestrict', vi
            ? [`**Người dùng:** ${target} (\`${target.id}\`)`, `**Người thực hiện:** ${interaction.user}`]
            : [`**User:** ${target} (\`${target.id}\`)`, `**By:** ${interaction.user}`]))
    }
}
