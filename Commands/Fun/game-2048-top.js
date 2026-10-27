const { SlashCommandBuilder } = require('discord.js')

const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')
const { SendPages } = require('../../Utils/pages')
const { LeaderboardPages } = require('../../Functions/Fun/leaderboard')
const { Game2048_Modes } = require('../../Functions/Fun/Game-2048/Game-2048')
const EmojisGame_2048 = require('../../Assets/Game-2048/game-emojis')
const Game2048Best = require('../../Database/Fun/game-2048-best')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game-2048-top')
        .setDescription('Show the best /game-2048 scores of the server')
        .setDescriptionLocalizations({ vi: 'Bảng xếp hạng điểm cao nhất /game-2048 của server' })
        .addStringOption(option => option.setName('game-key')
            .setDescription('The game mode of the leaderboard - Default: default')
            .setDescriptionLocalizations({ vi: 'Chế độ game của bảng xếp hạng - Mặc định: default' })
            .addChoices(
                { name: '[Default]', value: 'default' },
                { name: '[Hidden]', value: 'hidden' },
                { name: '[Swap]', value: 'swap' },
                { name: '[Anomaly]', value: 'anomaly' })
            .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'MinigameTop', LangKey, 10000)) return

        const mode = interaction.options.getString('game-key') || 'default'
        const Mode = Game2048_Modes[mode]

        //Best game of each player in this mode, on this server
        const Records = await Game2048Best.find({ guildID: interaction.guild.id, mode, score: { $gt: 0 } }).sort({ score: -1, tile: -1, date: 1 }).lean()
        const Entries = Records.map(r => ({
            UserID: r.userID,
            Value: r.score,
            Line: `• **${vi ? 'Điểm' : 'Score'}:** \`${r.score}\` • **${vi ? 'Ô Lớn Nhất' : 'Best Tile'}:** ${EmojisGame_2048[r.tile] || ''} \`${r.tile}\` • **${vi ? 'Số Bước' : 'Moves'}:** \`${r.moves}\`${(r.date) ? ` • <t:${Math.floor(r.date / 1000)}:R>` : ''}`
        }))

        const Pages = LeaderboardPages(interaction, {
            Title: `**${vi ? 'Bảng Xếp Hạng' : 'Leaderboard'} - Game 2048** \`(Mode: ${Mode.name})\``,
            Color: 'Yellow',
            Entries,
            Empty: vi ? `<:seiaconcerned:1244128341540208793> Chưa ai chơi chế độ \`${Mode.name}\` ở server này cả... Thử \`/game-2048\` đi nào!` : `<:seiaconcerned:1244128341540208793> Nobody has played \`${Mode.name}\` on this server yet... Try \`/game-2048\`!`,
            You: (e) => vi ? `-# Hạng của cậu: **#${e.Rank}** • Điểm \`${e.Value}\`` : `-# Your rank: **#${e.Rank}** • Score \`${e.Value}\``,
            NoYou: vi ? `-# Cậu chưa có điểm ở chế độ này` : `-# You don't have a score in this mode yet`
        })
        await SendPages(interaction, Pages, (i, n) => `| ${vi ? 'Trang' : 'Page'} ${i + 1}/${n} |`)
    }
}
