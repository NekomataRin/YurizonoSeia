const { SlashCommandBuilder, EmbedBuilder, Emoji } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const wait = require('node:timers/promises').setTimeout;
const cdSchema = require('../../Database/cooldown')
const chalk = require('chalk')
const QuickMathDb = require('../../Database/quickmath')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quick-math')
        .setDescription('Test your mental calculating skills, obviously lol')
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('The difficulty you choose for the game')
                .addChoices(
                    {
                        name: '[Easy]',
                        value: 'Easy',
                    },
                    {
                        name: '[Normal]',
                        value: 'Normal'
                    },
                    {
                        name: '[Hard]',
                        value: 'Hard'
                    },
                    {
                        name: '[Lunatic]',
                        value: 'Lunatic'
                    },
                    {
                        name: '[Extra]',
                        value: 'Extra'
                    },
                    {
                        name: '[Phantasm]',
                        value: 'Phantasm'
                    },
                    {
                        name: '[Asian]',
                        value: 'Asian'
                    })
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const cdtime = 20000
        const Difficulties = ['easy', 'normal', 'hard', 'lunatic', 'extra', 'phantasm', 'asian']
        const Timer = [25, 20, 18, 16, 14, 12, 10]
        const MultiList = [0.5, 1, 2, 2.5, 3, 5, 10]
        const StackAdd = [5, 4.5, 4, 3.5, 3, 2.5, 2]
        const EmojiList = [
            '<:MomoiNi:1260866228671479849>',
            '<:mikaeat:1254109782592327783>',
            '<:seiaheh:1244128244664504392>',
            '<:SerikaPray:1242841678214205451>',
            '<:Shirokope:1240988164512809040>',
            '<:WakamoCoffee:1259326736240214097>',
            '<:HinaMoyai:1244964434963857499>'
        ]
        const ColorList = [
            '#038cfc',
            '#03fc66',
            '#e8fc03',
            '#fca503',
            '#c603fc',
            '#fc032c',
            '#1a1a1a'
        ]
        let DifficultyKey = interaction.options.getString('difficulty')
        let Difficulty = DifficultyKey.toLowerCase(), level = 0
        let OriginalDiff = DifficultyKey.toLowerCase()
        let OfficialKey = DifficultyKey
        let OriginalColor = ColorList[Difficulties.indexOf(Difficulty)]
        let OriginalEmoji = EmojiList[Difficulties.indexOf(Difficulty)]

        function GetDiffValue(level, Difficulty) {
            level = Number(level)
            let DiffValue = Number(Difficulties.indexOf(Difficulty) + 1)
            const value = (level ** 3) + (2 * DiffValue ** 2) + (3 * level) + (4 * DiffValue)
            return Number(value)
        }

        function Random(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }

        var TreeNode = function (left, right, operator) {
            this.left = left;
            this.right = right;
            this.operator = operator;

            this.toString = function () {
                let rng = Math.floor(Math.random() * 3)
                if (rng === 2 && level >= 4) {
                    return '(' + left + ' ' + operator + ' ' + right + ')';
                } else {
                    return left + ' ' + operator + ' ' + right
                }

            }
        }

        var x = ['/', '*', '-', '+'];

        function buildTree(numNodes) {
            if (numNodes === 1)
                return Random(1, GetDiffValue(level, Difficulty));

            var numLeft = Math.floor(numNodes / 2);
            var leftSubTree = buildTree(numLeft);
            var numRight = Math.ceil(numNodes / 2);
            var rightSubTree = buildTree(numRight);

            var m = Random(0, x.length);
            var str = x[m];
            return new TreeNode(leftSubTree, rightSubTree, str);
        }

        function CreateEqt(level) {
            let input = 2
            for (var i = 0; i <= level; i++) {
                if (i % 2 === 1 && i > 2) {
                    input++
                }
            }
            let temp = buildTree(input).toString()
            let result = eval(temp)
            return [temp, result.toFixed(2)]
        }

        function SetTime(Time, att, lvl) {
            Time = Timer[Difficulties.indexOf(Difficulty)]
            for (var i = 0; i <= Number(lvl); i++) {
                if (i % 2 === 1 && i > 2) {
                    Time += StackAdd[Difficulties.indexOf(Difficulty)]
                }
            }
            switch (att) {
                case 1:
                    return Time
                case 2:
                    return Time * 0.8
                case 3:
                    return Time * 0.5
                default:
                    return Time * 0.0001
            }
        }

        function AttemptsCalc(n) {
            let Multi = MultiList[Difficulties.indexOf(OriginalDiff)]
            switch (n) {
                case 1:
                    return Multi
                case 2:
                    return Multi * 1 / 3
                case 3:
                    return Multi * 1 / 6
                default:
                    return Multi * 0.0001
            }
        }

        let ChannelKey = false
        const MathChannel = '1152752837298765845'
        if (interaction.channel.id === MathChannel) ChannelKey = true
        if (!ChannelKey) {
            return interaction.editReply(`<:SeiaMuted:1244890584276008970> Oi! You can't use this command here!`)
        }

        cdSchema.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                cdSchema.create({
                    UserID: interaction.user.id,
                    QuickMath: Date.now()
                })
                await interaction.editReply('<:seiaconcerned:1244129048494473246> Well, since you haven\'t in cooldown database yet... now you can try again')
            } else {
                const cduser = data.UserID
                const CDTime = data.QuickMath
                console.log(chalk.yellow('[Command: QuickMath]') + ` ${cduser}, ${CDTime}, ${Date.now()}`)

                if (CDTime > Date.now()) {
                    const cdembed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`**Command - Cooldown**`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(` <:seiaconcerned:1244129048494473246> | ${interaction.user} Sensei! Can you please stop doing that command again? I'm exhausted, I can take a rest too, you know? I'm not some sort of a real robot who can repeatedly do this for you!\n-# You can use this command again in: <t:${Math.floor(CDTime/1000)}:R>`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({ embeds: [cdembed] })
                } else {
                    let strictkey = false, count = 0, EqtResultDesc, Desc, MsgCount = 1, key = 0, score = 0, eqtcount = 1, scoreadd = 0
                    let KeyTime = Timer[Difficulties.indexOf(Difficulty)], Color = ColorList[Difficulties.indexOf(Difficulty)], Emoji = EmojiList[Difficulties.indexOf(Difficulty)]
                    let ReqLevel = 4, TimeResult, RunTime

                    const StartEmbed = new EmbedBuilder()
                        .setColor(OriginalColor)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                        .setTitle(`${OriginalEmoji} **Minigame - QuickMath**`)
                        .setDescription(`**Difficulty** \`${OfficialKey}\` | **Attempt Timer** \`${KeyTime}s\`\nGood Luck! For the best experiences, please **don't** use any form of calculation helpers like **caculator, bots, A.I, other ppl, etc.**\n> Notes:\n> 1. You can write \`2 Digits Decimal Number\` for your answer\n> 2. If you Give Up, just write \`stop\` to stop the game.\n> 3. **Attempt Timer** will be decreased on each **Attempt**, even if you chat, it counts as an **Attempt**. You only have \`3\` Attempts`)
                        .setTimestamp()
                    await interaction.followUp({
                        embeds: [StartEmbed]
                    })
                    await wait(2500)
                    while (key === 0) {
                        if (!strictkey) {
                            strictkey = true
                            if (count % 20 === 0) {
                                count = 0
                                level++
                            }

                            RunTime = SetTime(KeyTime, MsgCount, level)
                            if (count === 0 && Number(level) === Number(ReqLevel) && Difficulty !== Difficulties[6]) {
                                Difficulty = Difficulties[Difficulties.indexOf(Difficulty) + 1]
                                DifficultyKey = Difficulty.slice(0, 1).toUpperCase() + Difficulty.slice(1)
                                KeyTime = Timer[Difficulties.indexOf(Difficulty)], Color = ColorList[Difficulties.indexOf(Difficulty)], Emoji = EmojiList[Difficulties.indexOf(Difficulty)]
                                RunTime = SetTime(KeyTime, MsgCount, level)
                                const DiffUpEmbed = new EmbedBuilder()
                                    .setColor(Color)
                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                    .setTitle(`${Emoji} **Minigame - QuickMath**`)
                                    .setDescription(`## Difficulty Up!\n**Difficulty** \`${DifficultyKey}\` | **Attempt Timer** \`${RunTime}s\`\nGood Luck! Still on the same sentence: please **don't** use any form of calculation helpers like **caculator, bots, A.I, other ppl, etc.**, and you only have \`3\` Attempts!\n> Note: **The Final Result** is the original difficulty you put (${OfficialKey}) as the scoring method.`)
                                    .setTimestamp()
                                await interaction.followUp({
                                    embeds: [DiffUpEmbed]
                                })
                                ReqLevel = ReqLevel + 2
                                await wait(2500)
                            }

                            if (count === 0 && Number(level) > 2 && (Number(level) % 2) === 1) {
                                RunTime = SetTime(KeyTime, MsgCount, level)
                                const ExtendedTimeEmbed = new EmbedBuilder()
                                    .setColor(Color)
                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                    .setTitle(`${Emoji} **Minigame - QuickMath**`)
                                    .setDescription(`## Timer Range Extended!\n**Difficulty** \`${DifficultyKey}\` | **Attempt Timer** \`${RunTime}s\`\nGood Luck! Still on the same sentence: please **don't** use any form of calculation helpers like **caculator, bots, A.I, other ppl, etc.**, and you only have \`3\` Attempts!\n> Note: **The Final Result** is the original difficulty you put (${OfficialKey}) as the scoring method.`)
                                    .setTimestamp()
                                await interaction.followUp({
                                    embeds: [ExtendedTimeEmbed]
                                })
                                await wait(2500)
                            }
                            const OfficialEqt = CreateEqt(level)
                            const PreEqt = OfficialEqt

                            Desc = `**Difficulty** \`${DifficultyKey}\` | **Level** \`${level}\` | **Question** \`${count + 1}\` | **Score** \`${score}\` \n\`\`\`js\n${OfficialEqt[0]}\`\`\``

                            const RunEmbed = new EmbedBuilder()
                                .setColor(Color)
                                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                .setTitle(`${Emoji} **Minigame - QuickMath**`)
                                .setDescription(`${Desc}`)
                                .setTimestamp()
                            let ReplyMsg = await interaction.followUp({
                                embeds: [RunEmbed]
                            })

                            const QstTime = ReplyMsg.createdTimestamp

                            const msg = await interaction.fetchReply()

                            while (strictkey && key === 0) {
                                try {
                                    const filter = m => {
                                        if (m.author.bot) return
                                        if (m.author.id === interaction.user.id && m.channel.id === interaction.channel.id) {
                                            return true
                                        } else {
                                            return false
                                        }
                                    }

                                    const collector = await interaction.channel.awaitMessages({ msg, filter, time: Number(RunTime) * 1000, errors: ['time'], max: 1 })
                                    let Result = Number(collector.first().content)
                                    if (Result.toFixed(2) === OfficialEqt[1]) {
                                        
                                        eqtcount++
                                        TimeResult = (Date.now() - QstTime) / 1000
                                        let TimeScore = TimeResult.toFixed(2)
                                        TimeResult = TimeResult.toFixed(2) + 's'
                                        scoreadd = Math.max(Number(eqtcount + (1-(TimeScore/RunTime)) * Number(Difficulties.indexOf(Difficulty) + 1) * AttemptsCalc(MsgCount)), 0)
                                        scoreadd = scoreadd.toFixed(1)
                                        score += Number(scoreadd)
                                        score = Number(score.toFixed(1))

                                        EqtResultDesc = `**Difficulty** \`${DifficultyKey}\` | **Level** \`${level}\` | **Question** \`${count + 1}\` | **Score** \`${score}\` \`(+${scoreadd})\`\n> **Solving Time** \`${TimeResult}\` | **Attempts Used** \`${MsgCount}\`\n\`\`\`js\n${PreEqt[0]} = ${PreEqt[1]}\n\`\`\``
                                        let EditedEmbed = new EmbedBuilder()
                                            .setColor(Color)
                                            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                            .setTitle(`${Emoji} **Minigame - QuickMath**`)
                                            .setDescription(`${EqtResultDesc}`)
                                            .setTimestamp()

                                        await ReplyMsg.edit({
                                            embeds: [EditedEmbed]
                                        })

                                        MsgCount = 1
                                        key = 0
                                        strictkey = false
                                        count++
                                    } else {
                                        MsgCount++
                                        TimeResult = 0
                                        RunTime = SetTime(KeyTime, MsgCount, level)
                                        let n = collector.first().content
                                        if (n.toLowerCase() === 'stop') {
                                            MsgCount = 4
                                            RunTime = 0.0001
                                        }
                                    }
                                } catch {
                                    data.QuickMath = Date.now() + cdtime
                                    data.save()
                                    key++
                                    let Desc2 = `## Game Over!\n**Difficulty** \`${OfficialKey}\` | **Level** \`${level}\` | **Question** \`${count + 1}\` | **Score** \`${score}\` \n\`\`\`js\n${OfficialEqt[0]} = ${OfficialEqt[1]}\`\`\``
                                    const GameOverEmbed = new EmbedBuilder()
                                        .setColor(OriginalColor)
                                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                        .setTitle(`${OriginalEmoji} **Minigame - QuickMath**`)
                                        .setDescription(Desc2)
                                        .setTimestamp()
                                    await ReplyMsg.edit({
                                        embeds: [GameOverEmbed]
                                    })
                                    //return
                                    if (score > 0) {
                                        QuickMathDb.findOne({ UserID: interaction.user.id, GameKey: OfficialKey }, async (err, data1) => {
                                            if (err) throw err
                                            if (!data1) {
                                                QuickMathDb.create({
                                                    UserID: interaction.user.id,
                                                    GameKey: OfficialKey,
                                                    Level: level,
                                                    Score: score
                                                })
                                            } else {
                                                if (score > data1.Score) {
                                                    data1.Level = level
                                                    data1.Score = score
                                                    data1.save()
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    }
}