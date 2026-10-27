const { SlashCommandBuilder } = require('discord.js')

const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')
const { SendPages } = require('../../Utils/pages')
const { LeaderboardPages, ServerMembers } = require('../../Functions/Fun/leaderboard')
const QM = require('../../Assets/QuickMath/config')
const QuickMathDb = require('../../Database/Fun/quickmath')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quick-math-top')
        .setDescription('Show the best /quick-math scores of the server')
        .setDescriptionLocalizations({ vi: 'Bảng xếp hạng điểm cao nhất /quick-math của server' })
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('The difficulty of the leaderboard - Default: Easy')
                .setDescriptionLocalizations({ vi: 'Độ khó của bảng xếp hạng - Mặc định: Easy' })
                .addChoices(
                    { name: '[Easy]', value: 'Easy' },
                    { name: '[Normal]', value: 'Normal' },
                    { name: '[Hard]', value: 'Hard' },
                    { name: '[Lunatic]', value: 'Lunatic' },
                    { name: '[Extra]', value: 'Extra' },
                    { name: '[Phantasm]', value: 'Phantasm' },
                    { name: '[Asian]', value: 'Asian' })
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'MinigameTop', LangKey, 10000)) return

        const GameKey = interaction.options.getString('difficulty') || 'Easy'
        const idx = QM.Difficulties.indexOf(GameKey.toLowerCase())

        //Best scores of this difficulty, only players who are in this server
        const Records = await QuickMathDb.find({ GameKey, Score: { $gt: 0 } }).sort({ Score: -1, Level: -1, Date: 1 }).lean()
        const InServer = await ServerMembers(interaction.guild, Records.map(r => r.UserID))
        const Entries = Records.filter(r => InServer.has(r.UserID)).map(r => ({
            UserID: r.UserID,
            Value: r.Score,
            Line: `• **${vi ? 'Điểm' : 'Score'}:** \`${r.Score}\` • **Level:** \`${r.Level}\`${(r.Date) ? ` • <t:${Math.floor(r.Date / 1000)}:R>` : ''}`
        }))

        const Pages = LeaderboardPages(interaction, {
            Title: `${QM.Emojis[idx]} **${vi ? 'Bảng Xếp Hạng' : 'Leaderboard'} - QuickMath** \`(${GameKey})\``,
            Color: QM.Colors[idx],
            Entries,
            Empty: vi ? `<:seiaconcerned:1244128341540208793> Chưa ai có điểm ở độ khó \`${GameKey}\` cả... Thử \`/quick-math\` đi nào!` : `<:seiaconcerned:1244128341540208793> Nobody has a score in \`${GameKey}\` yet... Try \`/quick-math\`!`,
            You: (e) => vi ? `-# Hạng của cậu: **#${e.Rank}** • Điểm \`${e.Value}\`` : `-# Your rank: **#${e.Rank}** • Score \`${e.Value}\``,
            NoYou: vi ? `-# Cậu chưa có điểm ở độ khó này` : `-# You don't have a score in this difficulty yet`
        })
        await SendPages(interaction, Pages, (i, n) => `| ${vi ? 'Trang' : 'Page'} ${i + 1}/${n} |`)
    }
}
