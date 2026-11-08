const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Level = require('../../Database/Ranking/Leveling')
const BotOwner = require('../../Utils/owners')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exp-penalty')
        .setDescription('-Owner Only- Lower (or stop) the EXP a user gets on this server')
        .setDescriptionLocalizations({ vi: '-Owner Only- Giảm (hoặc chặn) EXP một người dùng nhận được ở server này' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who gets the penalty')
                .setDescriptionLocalizations({ vi: 'Người bị phạt' })
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The penalty code (how much EXP they still get)')
                .setDescriptionLocalizations({ vi: 'Mã phạt (họ còn nhận được bao nhiêu EXP)' })
                .addChoices(
                    { name: '[Code-0] - No Penalty', value: 'Code-0', name_localizations: { vi: '[Code-0] - Không phạt' } },
                    { name: '[Code-1] - No Exp', value: 'Code-1', name_localizations: { vi: '[Code-1] - Không nhận EXP' } },
                    { name: '[Code-2] - 50% Exp', value: 'Code-2', name_localizations: { vi: '[Code-2] - 50% EXP' } },
                    { name: '[Code-3] - 25% Exp', value: 'Code-3', name_localizations: { vi: '[Code-3] - 25% EXP' } },
                )
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        if (!BotOwner.includes(interaction.user.id)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Không đủ quyền' : 'No permissions'}`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? 'Sensei không có đủ quyền để dùng lệnh này...' : 'You do not have enough permissions to run this command...'}`)]
            })
        }

        const user = interaction.options.getUser('user')
        const restrict_key = interaction.options.getString('code')

        const data = await Level.findOneAndUpdate(
            { GuildID: interaction.guild.id, UserID: user.id },
            { $set: { restrict: restrict_key } },
            { new: true }
        ).lean()

        if (!data) {
            return interaction.editReply(vi ? '<:seiaheh:1244128244664504392> • Có vẻ người dùng này chưa hoạt động ở server... Thử lại sau nhé...' : '<:seiaheh:1244128244664504392> • Looks like the user you chose is currently not active yet... Please try again later...')
        }

        const Restricted = (restrict_key !== 'Code-0')
        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, (Restricted) ? 'Red' : 'Green')
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${(Restricted) ? (vi ? 'Đã phạt EXP!' : 'EXP Penalty Set!') : (vi ? 'Đã gỡ phạt EXP!' : 'EXP Penalty Removed!')}`)
                .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? 'Người dùng' : 'User'}: ${user} | ${vi ? 'Mã phạt' : 'Penalty Code'}: ${restrict_key}`)]
        })
    }
}
