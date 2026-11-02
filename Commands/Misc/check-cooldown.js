const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const cdSchema = require('../../Database/cooldown')
const Clock = require('../../Utils/clock')
const { ActiveRestriction, UntilText } = require('../../Functions/Moderation/restrict')

// Cooldown field (Database/cooldown.js) -> commands it belongs to
const Commands = [
    ['HowGay', '/howgay'], ['Omikuji', '/omikuji'], ['QuickMath', '/quick-math'], ['Game2048', '/game-2048'],
    ['MinigameTop', '/quick-math-top • /game-2048-top'], ['Coinflip', '/coinflip'], ['Dice', '/dice'], ['Shiprate', '/shiprate'],
    ['Rank', '/rank'], ['Top', '/leaderboard'], ['Pick', '/pick'], ['Roll', '/roll'], ['NumberConvert', '/number-convert'],
    ['CheckAlive', '/checkalive'], ['Avatar', '/avatar'], ['ServerInfo', '/server-info'], ['UserInfo', '/user-info']
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-cooldown')
        .setDescription('Check the cooldowns of the commands for you (or someone else)')
        .setDescriptionLocalizations({ vi: 'Kiểm tra cooldown các lệnh của bạn (hoặc của người khác)' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Whose cooldowns - Default: yours')
                .setDescriptionLocalizations({ vi: 'Người bạn muốn xem cooldown - Mặc định: bạn' })
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        const user = interaction.options.getUser('user') || interaction.user
        const [data, Restricted] = await Promise.all([
            cdSchema.findOne({ UserID: user.id }).lean(),
            ActiveRestriction(interaction.guild.id, user.id)
        ])
        const now = Clock.Now()

        const Lines = Commands.map(([Key, Name]) => {
            const Until = Number(data?.[Key]) || 0
            return `> **${Name}:** ${(Until > now) ? `<t:${Math.floor(Until / 1000)}:R>` : (vi ? 'Có thể dùng' : 'Ready')}`
        })
        const RestrictLine = (Restricted) ? `\n\n<:OrinMenace:1169857691456372766> **${vi ? 'Đang bị cấm dùng lệnh đến' : 'Restricted from commands until'}** ${UntilText(Restricted, vi)}` : ''

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(`<a:LYG_Clock:1084322030331105370> **Command - Check Cooldown**`)
                .setDescription(`${vi ? `Cooldown các lệnh của ${user}` : `Command cooldowns of ${user}`}\n\n${Lines.join('\n')}${RestrictLine}`)]
        })
    }
}
