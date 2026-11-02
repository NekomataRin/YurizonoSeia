const { SlashCommandBuilder } = require('discord.js')

const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')
const { SendPages } = require('../../Utils/pages')
const { ReqExp } = require('../../Utils/Ranking/lvlcalc')
const { LeaderboardPages } = require('../../Functions/Fun/leaderboard')
const Level = require('../../Database/Ranking/Leveling')
const { FindCard } = require('../../Assets/RankCards')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show the EXP leaderboard of the server')
        .setDescriptionLocalizations({ vi: 'Hiển thị bảng xếp hạng EXP của server' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'Top', LangKey, 30000)) return

        //Everyone of this server by total EXP (same total = same rank)
        const Users = await Level.find({ GuildID: interaction.guild.id }).sort({ total: -1, _id: 1 }).lean()
        const Entries = Users.map(u => {
            const Req = ReqExp(u.level)
            const Restricted = ['Code-1', 'Code-2', 'Code-3'].includes(u.restrict)
            return {
                UserID: u.UserID,
                Value: u.total,
                Line: `• [${FindCard(u.background).Emoji}] **${vi ? 'Tổng PP' : 'Total PP'}:** \`${u.total}\` • **Level:** \`${u.level}\` • **${vi ? 'Tiến độ' : 'Progress'}:** \`[${(u.exp / Req * 100).toFixed(2)}%] ${u.exp}/${Req}\``
                    + ((Restricted) ? `\n-# ${vi ? 'Người dùng này đang bị hạn chế' : 'This user is restricted'} (\`${u.restrict}\`)` : '')
            }
        })

        const Pages = LeaderboardPages(interaction, {
            Title: `<:seiaheh:1244128244664504392> **${vi ? 'Bảng Xếp Hạng Server' : 'Server Leaderboard'}** - ${interaction.guild.name}`,
            Color: 'Yellow',
            Entries,
            Empty: vi ? '<:seiaconcerned:1244128341540208793> Hmm... bảng xếp hạng vẫn còn trống trơn... Chắc thời gian sẽ trả lời thôi?' : '<:seiaconcerned:1244128341540208793> Hmm... looks like the leaderboard\'s so empty right now... Maybe time will tell the answer?',
            You: (e) => vi ? `-# Hạng của cậu: **#${e.Rank}** • Tổng PP \`${e.Value}\`` : `-# Your rank: **#${e.Rank}** • Total PP \`${e.Value}\``,
            NoYou: vi ? '-# Cậu chưa có EXP ở server này, chat để lên bảng nhé!' : '-# You have no EXP on this server yet, chat to get on the board!'
        })
        await SendPages(interaction, Pages, (i, n) => `| ${vi ? 'Trang' : 'Page'} ${i + 1}/${n} |`)
    }
}
