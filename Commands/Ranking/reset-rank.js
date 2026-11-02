const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Level = require('../../Database/Ranking/Leveling')
const BotOwner = require('../../Utils/owners')
const { IsMod } = require('../../Utils/mod')
const { ClearLevelRoles } = require('../../Functions/Ranking/rank-roles')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-rank')
        .setDescription('-Mod/Owner Only- Reset all exp in the server')
        .setDescriptionLocalizations({ vi: '-Mod/Owner Only- Reset toàn bộ EXP trong server' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        //Mod roles of this server (Utils/config.js Roles) or a bot owner
        const member = await interaction.guild.members.fetch(interaction.user.id)
        if (!IsMod(member) && !BotOwner.includes(interaction.user.id)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Không đủ quyền' : 'No permissions'}`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? 'Sensei không có đủ quyền để dùng lệnh này...' : 'You do not have enough permissions to run this command...'}`)]
            })
        }

        const ChoicesButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('yes')
                    .setLabel(vi ? '| Có' : '| Yes')
                    .setEmoji('1384989806593048727')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('no')
                    .setLabel(vi ? '| Không' : '| No')
                    .setEmoji('1138231827140706304')
                    .setStyle(ButtonStyle.Secondary)
            )

        const message = await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Reset Rank - Lưu ý' : 'Reset Rank - Notice'}`)
                .setDescription(vi
                    ? '<:SeiaSip:1244890166116618340> • Sensei có chắc muốn reset toàn bộ dữ liệu ranking của mọi thành viên không? Trước khi làm, có vài điều cần biết:\n1. Toàn bộ EXP sẽ bị xoá\n2. Đã làm rồi thì không thể hoàn tác được nữa'
                    : '<:SeiaSip:1244890166116618340> • Are you sure you want to reset all ranking data from all server members? Before you do, here are some things before you proceed:\n1. This will delete all EXP data\n2. Once this process has been done, it cannot be reverted back')],
            components: [ChoicesButton]
        })

        //1 minute to answer, then the buttons go away
        const choice = await message.awaitMessageComponent({ filter: a => a.user.id === interaction.user.id, time: 60000 }).catch(() => null)
        if (!choice || choice.customId === 'no') {
            const ResetReject = SeiaEmbed(interaction, 'Green')
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Reset Rank - Đã huỷ' : 'Reset Rank - Aborted'}`)
                .setDescription(vi ? '<:SeiaSip:1244890166116618340> • Bảng xếp hạng EXP của server vẫn y như cũ nhé...' : '<:SeiaSip:1244890166116618340> • Well, the server\'s exp leaderboard is still the same as before...')
            return (choice) ? choice.update({ embeds: [ResetReject], components: [] }) : interaction.editReply({ embeds: [ResetReject], components: [] })
        }

        await choice.update({
            embeds: [SeiaEmbed(interaction, 'Yellow')
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Reset Rank - Đang tiến hành' : 'Reset Rank - Proceeding'}`)
                .setDescription(vi ? '<:SeiaSip:1244890166116618340> • Đang reset hệ thống EXP của server... Xin chờ một chút...' : '<:SeiaSip:1244890166116618340> • Resetting the server\'s exp system... Please wait...')],
            components: []
        })
        await wait(3000)

        //EXP goes back to 0. Users with a background or a restriction keep their document so those aren't lost
        const GuildID = interaction.guild.id
        await Level.updateMany({ GuildID }, { $set: { exp: 0, level: 0, total: 0 } })
        await Level.deleteMany({ GuildID, background: { $in: ['none', null] }, restrict: { $in: ['Code-0', null] } })

        //Level roles go too (servers with RankRoles in Utils/Ranking/guilds.js). TotalExp roles are permanent and stay
        const Cleared = await ClearLevelRoles(interaction.guild)

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'Red')
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Reset Rank - Xong!' : 'Reset Rank - Done!'}`)
                .setDescription(vi
                    ? `<:seiaheh:1244128244664504392> • Dữ liệu ranking của các thành viên đã bị xoá, mong là Sensei không hối hận nha, hihi${(Cleared) ? `\n> Đã gỡ role ranking của \`${Cleared}\` thành viên` : ''}`
                    : `<:seiaheh:1244128244664504392> • The server members' ranking data has been deleted, hope you won't regret it, heehee${(Cleared) ? `\n> Removed the ranking roles from \`${Cleared}\` members` : ''}`)]
        })
    }
}
