const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Level = require('../../Database/Ranking/Leveling')
const { RequireMod } = require('../../Functions/Moderation/mod')
const { ClearLevelRoles } = require('../../Functions/Ranking/rank-roles')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard-reset')
        .setDescription('-Mod/Owner Only- Reset the EXP of everyone on this server (cannot be undone)')
        .setDescriptionLocalizations({ vi: '-Mod/Owner Only- Reset EXP của mọi người trong server này (không hoàn tác được)' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        //Mod roles of this server (Utils/config.js Roles) or a bot owner
        if (!await RequireMod(interaction, LangKey, true)) return

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
                    .setEmoji('1230898036205682778')
                    .setStyle(ButtonStyle.Secondary)
            )

        const message = await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Reset Bảng Xếp Hạng - Lưu ý' : 'Leaderboard Reset - Notice'}`)
                .setDescription(vi
                    ? '<:SeiaSip:1244890166116618340> • Sensei có chắc muốn reset toàn bộ dữ liệu ranking của mọi thành viên trong server này không? Trước khi làm, có vài điều cần biết:\n1. Toàn bộ EXP sẽ bị xoá\n2. Đã làm rồi thì không thể hoàn tác được nữa\n3. Rank card đã mở khoá và background đang dùng vẫn được giữ'
                    : '<:SeiaSip:1244890166116618340> • Are you sure you want to reset all ranking data from all members of this server? Before you do, here are some things before you proceed:\n1. This will delete all EXP data\n2. Once this process has been done, it cannot be reverted back\n3. Unlocked rank cards and equipped backgrounds are kept')],
            components: [ChoicesButton]
        })

        //1 minute to answer, then the buttons go away
        const choice = await message.awaitMessageComponent({ filter: a => a.user.id === interaction.user.id, time: 60000 }).catch(() => null)
        if (!choice || choice.customId === 'no') {
            const ResetReject = SeiaEmbed(interaction, 'Green')
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Reset Bảng Xếp Hạng - Đã huỷ' : 'Leaderboard Reset - Aborted'}`)
                .setDescription(vi ? '<:SeiaSip:1244890166116618340> • Bảng xếp hạng EXP của server vẫn y như cũ nhé...' : '<:SeiaSip:1244890166116618340> • Well, the server\'s exp leaderboard is still the same as before...')
            return (choice) ? choice.update({ embeds: [ResetReject], components: [] }) : interaction.editReply({ embeds: [ResetReject], components: [] })
        }

        await choice.update({
            embeds: [SeiaEmbed(interaction, 'Yellow')
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Reset Bảng Xếp Hạng - Đang tiến hành' : 'Leaderboard Reset - Proceeding'}`)
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
                .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Reset Bảng Xếp Hạng - Xong!' : 'Leaderboard Reset - Done!'}`)
                .setDescription(vi
                    ? `<:seiaheh:1244128244664504392> • Dữ liệu ranking của các thành viên đã bị xoá, mong là Sensei không hối hận nha, hihi${(Cleared) ? `\n> Đã gỡ role ranking của \`${Cleared}\` thành viên` : ''}`
                    : `<:seiaheh:1244128244664504392> • The server members' ranking data has been deleted, hope you won't regret it, heehee${(Cleared) ? `\n> Removed the ranking roles from \`${Cleared}\` members` : ''}`)]
        })
    }
}
