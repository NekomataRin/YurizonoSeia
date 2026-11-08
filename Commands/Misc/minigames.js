const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const QM = require('../../Assets/QuickMath/config')
const Game2048_Modes = require('../../Functions/Fun/Game-2048/2048-Modes')

const Capital = (s) => s[0].toUpperCase() + s.slice(1)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minigames')
        .setDescription('How to play Seia\'s minigames')
        .setDescriptionLocalizations({ vi: 'Hiển thị thông tin về các minigame của Seia' })
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Which minigame')
                .setDescriptionLocalizations({ vi: 'Minigame bạn muốn xem thông tin' })
                .addChoices(
                    { name: 'Quick Math', value: 'quick-math' },
                    { name: 'Game 2048', value: 'game-2048' })
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        if (interaction.options.getString('game') === 'quick-math') {
            const Diff = QM.Difficulties.map((d, i) => `> - ${QM.Emojis[i]} **${Capital(d)}**: \`${QM.Timer[i]}s\` • ${vi ? 'hệ số điểm' : 'score'} \`x${QM.MultiList[i]}\``).join('\n')
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction)
                    .setTitle('<a:LYG_TighnariNotes:1090126010571300874> **Minigame - Quick Math**')
                    .setDescription(vi
                        ? `<:MikaDonut1:1416618285285376061> **Tìm kết quả của một phép toán nhanh trong thời gian giới hạn**\nCấu trúc lệnh: **/quick-math [difficulty]**\n<a:LYG_Clock:1084322030331105370> **CD:** 20 giây sau mỗi ván\n\n<:KazusaThumbsup:1245237990108696667> Game có **${QM.Difficulties.length} độ khó** (thời gian mỗi câu • hệ số điểm):\n${Diff}\n\n> **Easy:** chỉ số dương, nhân chia trong bảng cửu chương\n> **Normal → Lunatic:** số nguyên, có số âm, phép chia luôn chia hết\n> **Extra, Phantasm:** cộng trừ số thập phân, nhân chia số nguyên\n> **Asian:** không giới hạn, vẫn là Asian thôi =)))\n\n<:KikyouPout:1415973965788090370> **Luật chơi:**\n> 1. Độ khó tăng dần trong ván (level 4, 6, 8...), hệ số điểm vẫn theo độ khó lúc bắt đầu\n> 2. Mỗi câu có **3 lần thử**, lần 2 và 3 chỉ còn 80% / 50% thời gian\n> 3. Trả lời tối đa 2 chữ số thập phân (\`3,75\` hay \`3.75\` đều được)\n> 4. Đừng dùng máy tính, bot, A.I hay nhờ người khác nhé!\n\n<:SeiaMenacing:1244890322090201162> Kỷ lục được lưu theo từng server: \`/quick-math-top\``
                        : `<:MikaDonut1:1416618285285376061> **Find the answer of quick equations before the time runs out**\nCommand: **/quick-math [difficulty]**\n<a:LYG_Clock:1084322030331105370> **CD:** 20 seconds after each game\n\n<:KazusaThumbsup:1245237990108696667> There are **${QM.Difficulties.length} difficulties** (time per question • score multiplier):\n${Diff}\n\n> **Easy:** positive numbers only, × ÷ within the times tables\n> **Normal → Lunatic:** integers, negative numbers, divisions always exact\n> **Extra, Phantasm:** + − with decimals, × ÷ with integers\n> **Asian:** no limits, still Asian =)))\n\n<:KikyouPout:1415973965788090370> **Rules:**\n> 1. The difficulty goes up during the game (level 4, 6, 8...), the score multiplier stays the starting one\n> 2. **3 attempts** per question, the 2nd and 3rd only get 80% / 50% of the time\n> 3. Answers have 2 decimals at most (\`3,75\` or \`3.75\` both work)\n> 4. No calculators, bots, A.I or friends please!\n\n<:SeiaMenacing:1244890322090201162> Best scores are saved per server: \`/quick-math-top\``)]
            })
        }

        const Modes = Object.entries(Game2048_Modes).map(([key, m]) => `> **${m.name}** (\`${key}\`): ${(vi) ? m.descVi || m.desc : m.desc}`).join('\n')
        await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle('<a:LYG_TighnariNotes:1090126010571300874> **Minigame - Game 2048**')
                .setDescription(vi
                    ? `<:MikaDonut1:1416618285285376061> **Gộp các ô cùng số để đạt tới ô 2048 (và hơn nữa!)**\nCấu trúc lệnh: **/game-2048 [game-key]**\n<a:LYG_Clock:1084322030331105370> **CD:** 20 giây sau mỗi ván\n\n<:KazusaThumbsup:1245237990108696667> **Các chế độ:**\n${Modes}\n\n<:KikyouPout:1415973965788090370> **Luật chơi:**\n> 1. Dùng các nút mũi tên để dồn các ô, 2 ô cùng số gộp thành 1\n> 2. Được Undo 1 lần sau mỗi nước đi\n> 3. Hết nước đi là kết thúc ván, dừng giữa chừng thì ván được lưu lại để \`[Load Game]\` chơi tiếp\n\n<:SeiaMenacing:1244890322090201162> Kỷ lục của từng chế độ được lưu theo từng server: \`/game-2048-top\``
                    : `<:MikaDonut1:1416618285285376061> **Merge the same tiles to reach 2048 (and beyond!)**\nCommand: **/game-2048 [game-key]**\n<a:LYG_Clock:1084322030331105370> **CD:** 20 seconds after each game\n\n<:KazusaThumbsup:1245237990108696667> **Modes:**\n${Modes}\n\n<:KikyouPout:1415973965788090370> **Rules:**\n> 1. Slide the tiles with the arrow buttons, 2 same tiles merge into 1\n> 2. You can undo once after each move\n> 3. The game ends when no move is left, a game you stop is saved so you can \`[Load Game]\` later\n\n<:SeiaMenacing:1244890322090201162> Best scores of each mode are saved per server: \`/game-2048-top\``)]
        })
    }
}
