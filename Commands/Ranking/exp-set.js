const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { FromTotal } = require('../../Utils/Ranking/lvlcalc')
const Level = require('../../Database/Ranking/Leveling')
const BotOwner = require('../../Utils/owners')
const { UpdateRankRoles } = require('../../Functions/Ranking/rank-roles')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exp-set')
        .setDescription('-NekoRin\'s Only- Set the total EXP of a user (or yours)')
        .setDescriptionLocalizations({ vi: '-NekoRin\'s Only- Đặt tổng EXP cho một người dùng (hoặc cho bạn)' })
        .addIntegerOption(option =>
            option.setName('total-exp')
                .setDescription('Set the total exp of that user')
                .setDescriptionLocalizations({ vi: 'Tổng EXP của người dùng đó' })
                .setMinValue(0)
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to set exp to')
                .setDescriptionLocalizations({ vi: 'Người dùng bạn muốn đặt EXP' })
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        //Only the first 2 owners
        if (!BotOwner.slice(0, 2).includes(interaction.user.id)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Không đủ quyền' : 'No permissions'}`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? 'Sensei không có đủ quyền để dùng lệnh này...' : 'You do not have enough permissions to run this command...'}`)]
            })
        }

        const user = interaction.options.getUser('user') || interaction.user
        const Total_Exp = interaction.options.getInteger('total-exp')
        const { level, exp } = FromTotal(Total_Exp)

        const before = await Level.findOneAndUpdate(
            { GuildID: interaction.guild.id, UserID: user.id },
            { $set: { exp, level, total: Total_Exp } },
            { upsert: true }
        ).lean()

        //Ranking roles follow the new level exactly (servers with RankRoles)
        const member = await interaction.guild.members.fetch(user.id).catch(() => null)
        const Granted = await UpdateRankRoles(member, { level, total: Total_Exp }, true)
        const GrantedNotes = Granted.map(id => `\n> Granted ${user} role - <@&${id}>`).join('')
        const L = vi ? { User: 'Người dùng', Total: 'Tổng EXP' } : { User: 'User', Total: 'Total Exp' }

        const ResultEmbed = (!before)
            ? SeiaEmbed(interaction, 'Green')
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Dữ liệu rank mới' : 'New Rank Data'}`)
                .setDescription(`<:seiaehem:1244128370669650060> • ${L.User}: ${user} | ${L.Total}: ${Total_Exp} | Level: ${level} | Exp: ${exp}${GrantedNotes}`)
            : SeiaEmbed(interaction, 'Blue')
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Đã sửa dữ liệu rank' : 'Edited Rank Data'}`)
                .setDescription(`<:seiaehem:1244128370669650060> • ${L.User}: ${user} | ${L.Total}: ${before.total} >> ${Total_Exp} | Level: ${before.level} >> ${level} | Exp: ${before.exp} >> ${exp}${GrantedNotes}`)

        await interaction.editReply({ embeds: [ResultEmbed] })
    }
}
