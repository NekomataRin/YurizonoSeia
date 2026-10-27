const { SlashCommandBuilder } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown, SetCooldown } = require('../../Utils/cooldown')
const Clock = require('../../Utils/clock')
const Config = require('../../Utils/config')
const QM = require('../../Assets/QuickMath/config')
const { CreateEqt, IsCorrect, SetTime, AttemptsCalc } = require('../../Functions/Fun/quick-math')
const QuickMathDb = require('../../Database/Fun/quickmath')

const { Difficulties, Timer, Emojis: EmojiList, Colors: ColorList } = QM

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quick-math')
        .setDescription('Test your mental calculating skills, obviously lol')
        .setDescriptionLocalizations({ vi: 'Kiểm tra khả năng tính nhẩm của bạn, rõ rồi còn gì lol' })
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('The difficulty you choose for the game')
                .setDescriptionLocalizations({ vi: 'Độ khó bạn chọn cho game' })
                .addChoices(
                    { name: '[Easy]', value: 'Easy' },
                    { name: '[Normal]', value: 'Normal' },
                    { name: '[Hard]', value: 'Hard' },
                    { name: '[Lunatic]', value: 'Lunatic' },
                    { name: '[Extra]', value: 'Extra' },
                    { name: '[Phantasm]', value: 'Phantasm' },
                    { name: '[Asian]', value: 'Asian' })
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()
        const cdtime = 20000

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        if (!Config.Channels.QuickMath.includes(interaction.channel.id)) {
            return interaction.editReply(vi ? `<:SeiaMuted:1244890584276008970> Oi! Bạn không thể dùng lệnh này đây được!` : `<:SeiaMuted:1244890584276008970> Oi! You can't use this command here!`)
        }
        if (await OnCooldown(interaction, 'QuickMath', LangKey)) return

        const OfficialKey = interaction.options.getString('difficulty')
        const OriginalDiff = OfficialKey.toLowerCase()
        const OriginalColor = ColorList[Difficulties.indexOf(OriginalDiff)]
        const OriginalEmoji = EmojiList[Difficulties.indexOf(OriginalDiff)]

        let Difficulty = OriginalDiff, DifficultyKey = OfficialKey
        let KeyTime = Timer[Difficulties.indexOf(Difficulty)], Color = OriginalColor, Emoji = OriginalEmoji
        let level = 0, count = 0, MsgCount = 1, score = 0, eqtcount = 1, ReqLevel = 4, RunTime

        // Follow-ups stop working after 15 minutes, long games continue as normal messages
        const Send = async (payload) => interaction.followUp(payload).catch(() => interaction.channel.send(payload))
        const GameEmbed = (desc, color = Color, emoji = Emoji) => SeiaEmbed(interaction, color)
            .setTitle(`${emoji} **Minigame - QuickMath**`)
            .setDescription(desc)

        await Send({
            embeds: [GameEmbed(vi
                ? `**Độ khó** \`${OfficialKey}\` | **Thời Gian Trả Lời** \`${KeyTime}s\`\nChúc may mắn nhé! Để có trải nghiệm tốt nhất, làm ơn **đừng** có dùng các công cụ hỗ trợ tính toán như **máy tính, bot, A.I, người dùng khác, v.v.**\n> Ghi chú:\n> 1. Bạn có thể ghi\`2 Chữ số thập phân\` cho câu trả lời của bạn\n> 2. Nếu muốn bỏ cuộc, chỉ cần ghi \`stop\` để xin dừng cuộc chơi tại đây.\n> 3. **Thời Gian Trả Lời** sẽ bị giảm dần sau mỗi **Lượt**, ngay cả khi bạn chat, nó sẽ tính vào **Lượt** của bạn. Bạn chỉ có \`3\` Lượt thôi đấy`
                : `**Difficulty** \`${OfficialKey}\` | **Attempt Timer** \`${KeyTime}s\`\nGood Luck! For the best experiences, please **don't** use any form of calculation helpers like **caculator, bots, A.I, other ppl, etc.**\n> Notes:\n> 1. You can write \`2 Digits Decimal Number\` for your answer\n> 2. If you Give Up, just write \`stop\` to stop the game.\n> 3. **Attempt Timer** will be decreased on each **Attempt**, even if you chat, it counts as an **Attempt**. You only have \`3\` Attempts`,
                OriginalColor, OriginalEmoji)]
        })
        await wait(2500)

        const filter = m => !m.author.bot && m.author.id === interaction.user.id && m.channel.id === interaction.channel.id

        while (true) {
            //Every 20 questions: level up
            if (count % 20 === 0) {
                count = 0
                level++
            }
            RunTime = SetTime(Difficulty, MsgCount, level)

            //Difficulty up every 2 levels from level 4 (until Asian)
            if (count === 0 && level === ReqLevel && Difficulty !== Difficulties[6]) {
                Difficulty = Difficulties[Difficulties.indexOf(Difficulty) + 1]
                DifficultyKey = Difficulty.slice(0, 1).toUpperCase() + Difficulty.slice(1)
                KeyTime = Timer[Difficulties.indexOf(Difficulty)], Color = ColorList[Difficulties.indexOf(Difficulty)], Emoji = EmojiList[Difficulties.indexOf(Difficulty)]
                RunTime = SetTime(Difficulty, MsgCount, level)
                await Send({
                    embeds: [GameEmbed(vi
                        ? `## Lên Độ Khó!\n**Độ Khó** \`${DifficultyKey}\` | **Thời Gian Trả Lời** \`${RunTime}s\`\nChúc may mắn nhé! Vẫn câu nói cũ: làm ơn **đừng** có dùng các công cụ hỗ trợ tính toán như **máy tính, bot, A.I, người dùng khác, v.v.**, và bạn chỉ có \`3\` Lượt thôi đấy nhé!\n> Ghi chú: **Kết Quả Cuối Cùng** sẽ là độ khó mà bạn đã đặt lúc đầu (${OfficialKey}) như là phần tính điểm.`
                        : `## Difficulty Up!\n**Difficulty** \`${DifficultyKey}\` | **Attempt Timer** \`${RunTime}s\`\nGood Luck! Still on the same sentence: please **don't** use any form of calculation helpers like **caculator, bots, A.I, other ppl, etc.**, and you only have \`3\` Attempts!\n> Note: **The Final Result** is the original difficulty you put (${OfficialKey}) as the scoring method.`)]
                })
                ReqLevel = ReqLevel + 2
                await wait(2500)
            }

            //More time on odd levels from level 3 (until CapLevel, after that nothing changes anymore)
            if (count === 0 && level > 2 && level % 2 === 1 && level <= QM.CapLevel) {
                RunTime = SetTime(Difficulty, MsgCount, level)
                await Send({
                    embeds: [GameEmbed(`## Timer Range Extended!\n**Difficulty** \`${DifficultyKey}\` | **Attempt Timer** \`${RunTime}s\`\nGood Luck! Still on the same sentence: please **don't** use any form of calculation helpers like **caculator, bots, A.I, other ppl, etc.**, and you only have \`3\` Attempts!\n> Note: **The Final Result** is the original difficulty you put (${OfficialKey}) as the scoring method.`)]
                })
                await wait(2500)
            }

            const Eqt = CreateEqt(level, Difficulty)
            const ReplyMsg = await Send({
                embeds: [GameEmbed(vi
                    ? `**Độ Khó** \`${DifficultyKey}\` | **Level** \`${level}\` | **Câu** \`${count + 1}\` | **Điểm** \`${score}\` \n\`\`\`js\n${Eqt.Text}\`\`\``
                    : `**Difficulty** \`${DifficultyKey}\` | **Level** \`${level}\` | **Question** \`${count + 1}\` | **Score** \`${score}\` \n\`\`\`js\n${Eqt.Text}\`\`\``)]
            })
            const QstTime = ReplyMsg.createdTimestamp

            //Wait for the answer (every message counts as an attempt)
            let solved = false
            while (!solved) {
                const collected = await interaction.channel.awaitMessages({ filter, time: Number(RunTime) * 1000, errors: ['time'], max: 1 }).catch(() => null)

                //Time's up / gave up / 3 wrong attempts -> Game Over
                if (!collected) {
                    await SetCooldown(interaction.user.id, 'QuickMath', Clock.Now() + cdtime)

                    //Best score per difficulty (for /quick-math-top)
                    let NewBest = false
                    if (score > 0) {
                        const best = await QuickMathDb.findOne({ UserID: interaction.user.id, GameKey: OfficialKey }).lean()
                        if (!best || score > Number(best.Score)) {
                            await QuickMathDb.updateOne({ UserID: interaction.user.id, GameKey: OfficialKey }, { $set: { Level: level, Score: score, Date: Clock.Now() } }, { upsert: true })
                            NewBest = true
                        }
                    }

                    await ReplyMsg.edit({
                        embeds: [GameEmbed(vi
                            ? `## Trò Chơi Kết Thúc!\n**Độ Khó** \`${OfficialKey}\` | **Level** \`${level}\` | **Câu** \`${count + 1}\` | **Điểm** \`${score}\` \n\`\`\`js\n${Eqt.Text} = ${Eqt.Answer}\`\`\`${NewBest ? '\n> 🏆 **Kỷ lục mới!** Xem bảng xếp hạng bằng `/quick-math-top`' : ''}`
                            : `## Game Over!\n**Difficulty** \`${OfficialKey}\` | **Level** \`${level}\` | **Question** \`${count + 1}\` | **Score** \`${score}\` \n\`\`\`js\n${Eqt.Text} = ${Eqt.Answer}\`\`\`${NewBest ? '\n> 🏆 **New best score!** See the leaderboard with `/quick-math-top`' : ''}`,
                            OriginalColor, OriginalEmoji)]
                    }).catch(() => {})
                    return
                }

                const Answer = collected.first()
                const content = Answer.content
                if (IsCorrect(content, Eqt)) {
                    eqtcount++
                    //Both times come from Discord (question posted -> answer sent), so a wrong phone clock
                    //can't make the time negative (= free points) or too long
                    const SentAt = Answer.createdTimestamp ?? Clock.Now()
                    const TimeScore = Math.max((SentAt - QstTime) / 1000, 0).toFixed(2)
                    const scoreadd = Math.max(Number(eqtcount + (1 - (TimeScore / RunTime)) * Number(Difficulties.indexOf(Difficulty) + 1) * AttemptsCalc(OriginalDiff, MsgCount)), 0).toFixed(1)
                    score = Number((score + Number(scoreadd)).toFixed(1))

                    await ReplyMsg.edit({
                        embeds: [GameEmbed(vi
                            ? `**Độ khó** \`${DifficultyKey}\` | **Level** \`${level}\` | **Câu** \`${count + 1}\` | **Điểm** \`${score}\` \`(+${scoreadd})\`\n> **Thời Gian Giải** \`${TimeScore}s\` | **Số Lượt Đã Dùng** \`${MsgCount}\`\n\`\`\`js\n${Eqt.Text} = ${Eqt.Answer}\n\`\`\``
                            : `**Difficulty** \`${DifficultyKey}\` | **Level** \`${level}\` | **Question** \`${count + 1}\` | **Score** \`${score}\` \`(+${scoreadd})\`\n> **Solving Time** \`${TimeScore}s\` | **Attempts Used** \`${MsgCount}\`\n\`\`\`js\n${Eqt.Text} = ${Eqt.Answer}\n\`\`\``)]
                    }).catch(() => {})

                    MsgCount = 1
                    count++
                    solved = true
                } else {
                    MsgCount++
                    RunTime = SetTime(Difficulty, MsgCount, level)
                    if (content.trim().toLowerCase() === 'stop') {
                        MsgCount = 4
                        RunTime = 0.0001
                    }
                }
            }
        }
    }
}
