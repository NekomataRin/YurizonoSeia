const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

const { GetOmikujiCard } = require('../../Assets/Omikuji/Texts/getembed')
const cdSchema = require('../../Database/cooldown')
const Omikuji = require('../../Database/Fun/omikuji')
const OmikujiBonus = require('../../Database/Fun/omikuji-bonus')
const chalk = require('chalk')
const { Key } = require('../../Assets/Omikuji/Texts/cases')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('omikuji')
        .setDescription('-Daily- Get your desired fate of today (Reset Time: 22:00 UTC)'),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        function DailyCD() {
            const nowUtc = new Date()
            const currentYearUtc = nowUtc.getUTCFullYear()
            const currentMonthUtc = nowUtc.getUTCMonth()
            const currentDayUtc = nowUtc.getUTCDate()

            const cooldownTimeUtc = Date.UTC(
                currentYearUtc,
                currentMonthUtc,
                currentDayUtc,
                22, 0, 0, 0
            )
            console.log(cooldownTimeUtc)
            const Daily_CD = cooldownTimeUtc
            return Daily_CD
        }
        const Daily_CD = DailyCD()

        const channelid = '1358995524551839805' //'1356147272030879885' //Debug: Only Remove When Testing 
        if (interaction.channel.id !== channelid) {
            const ErrEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Err - Wrong Channel`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`<:SeiaMuted:1244890584276008970> Oi, this isn't the channel for you to use this command, please go to <#${channelid}> to use it!`)
                .setTimestamp(Date.now())
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [ErrEmbed]
            })
        }


        //20 Rolls Bonus (Cuz Of The Bug Fixing)
        const eventtime = 1746377999000
        if (Date.now() <= eventtime) {
            OmikujiBonus.findOne({ GuildID: interaction.guild.id }, async (err, datan) => {
                if (err) throw err
                if (!datan) {
                    OmikujiBonus.create({
                        GuildID: interaction.guild.id,
                        UserStats: [
                            {
                                UserID: interaction.user.id,
                                Pulls: 1
                            }
                        ]
                    })
                }
                if (datan) {
                    const UserStats = datan.UserStats
                    datan.UserStats = []
                    let index = 0

                    for (var i in UserStats) {
                        if (UserStats[i].UserID === interaction.user.id) {
                            UserStats[i].Pulls++
                            Pulls = UserStats[i].Pulls
                            break
                        }
                        index = i
                    }

                    if (Number(index) === UserStats.length - 1) {
                        if (interaction.user.id !== UserStats[index].UserID) {
                            UserStats.push({
                                UserID: interaction.user.id,
                                Pulls: 1
                            })
                        }
                    }
                    for (var i in UserStats) {
                        datan.UserStats.push(UserStats[i])
                    }
                    datan.save()
                }
            })
        } else {
            OmikujiBonus.findOne({ GuildID: interaction.guild.id }, async (err, datae) => {
                if (err) throw err
                if (!datae) return
                else {
                    const Stats = datae.UserStats
                    datae.UserStats = []
                    for (var i in Stats) {
                        Stats[i].Pulls = 0
                        datae.UserStats.push(Stats[i])
                    }
                    datae.save()
                }
            })
        }

        //Actual Run
        cdSchema.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                cdSchema.create({
                    UserID: interaction.user.id,
                    Omikuji: Date.now()
                })
                return interaction.editReply('<:seiaconcerned:1244129048494473246> Well, since you haven\'t in cooldown database yet... now you can try again')
            } else {
                const cduser = data.UserID
                const CDTime = data.Omikuji
                console.log(chalk.yellow('[Command: Omikuji]') + ` ${cduser}, ${CDTime}, ${Date.now()}`)

                let Bypass = false
                if (Date.now() <= eventtime) {
                    const KeyCheck = await OmikujiBonus.findOne({ GuildID: interaction.guild.id }).select('-_id UserStats')
                    if (!KeyCheck) Bypass = true
                    else {
                        const UserStats = KeyCheck.UserStats
                        for (var i in UserStats) {
                            if (UserStats[i].UserID === interaction.user.id) {
                                if (Number(UserStats[i].Pulls) <= 20) Bypass = true
                                break
                            }
                        }
                    }
                }

                let cdkey = (Bypass) ? Bypass : CDTime < Date.now()
                //cdkey = true //Debug: Only remove when testing
                //if (Date.now() < CDTime) {
                if (!cdkey) {
                    const cdembed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`**Command - Cooldown**`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(` <:seiaconcerned:1244129048494473246> | ${interaction.user} Sensei! Can you please stop doing that command again? I'm exhausted, I can take a rest too, you know? I'm not some sort of a real robot who can repeatedly do this for you!\n-# You can use this command again in: <t:${Math.floor(CDTime / 1000)}:R>`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({ embeds: [cdembed] })
                } else {
                    data.Omikuji = Daily_CD
                    data.save()
                    const Data = await GetOmikujiCard(interaction.user.id)
                    if (['SS-Tier', 'EX-Tier'].includes(Data[1])) {
                        await interaction.editReply({
                            embeds: [Data[2].setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })],
                            files: [Data[3]]
                        })
                    }
                    else await interaction.editReply({
                        embeds: [Data[2].setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })]
                    })

                    //return //Debug: Only Remove When Testing
                    Omikuji.findOne({ GuildId: interaction.guild.id }, async (err, data1) => {
                        if (err) return err
                        if (!data1) {
                            console.log(Data[0], Data[1])
                            return Omikuji.create({
                                GuildId: interaction.guild.id,
                                UserRecords: [
                                    {
                                        UserID: interaction.user.id,
                                        "C-Tier": (Data[1] === 'C-Tier') ? 1 : 0,
                                        "B-Tier": (Data[1] === 'B-Tier') ? 1 : 0,
                                        "A-Tier": (Data[1] === 'A-Tier') ? 1 : 0,
                                        "S-Tier": (Data[1] === 'S-Tier') ? 1 : 0,
                                        "SS-Tier": [
                                            (Data[1] === 'SS-Tier' && Data[0] === 0) ? 1 : 0,
                                            (Data[1] === 'SS-Tier' && Data[0] === 1) ? 1 : 0,
                                            (Data[1] === 'SS-Tier' && Data[0] === 2) ? 1 : 0
                                        ],
                                        "EX-Tier": (Data[1] === 'EX-Tier') ? 1 : 0
                                    }
                                ],
                                TypeRecords: [{
                                    "C-Tier": (Data[1] === 'C-Tier') ? 1 : 0,
                                    "B-Tier": (Data[1] === 'B-Tier') ? 1 : 0,
                                    "A-Tier": (Data[1] === 'A-Tier') ? 1 : 0,
                                    "S-Tier": (Data[1] === 'S-Tier') ? 1 : 0,
                                    "SS-Tier": [
                                        (Data[1] === 'SS-Tier' && Data[0] === 0) ? 1 : 0,
                                        (Data[1] === 'SS-Tier' && Data[0] === 1) ? 1 : 0,
                                        (Data[1] === 'SS-Tier' && Data[0] === 2) ? 1 : 0
                                    ],
                                    "EX-Tier": (Data[1] === 'EX-Tier') ? 1 : 0
                                }]
                            })
                        } else {
                            const UserRecordsArr = data1.UserRecords
                            const Index = Data[0], Key = Data[1]
                            console.log(Index, Key)

                            //User Records
                            if (UserRecordsArr.length > 0) {
                                let index = 0
                                for (var i in UserRecordsArr) {
                                    if (UserRecordsArr[i].UserID === interaction.user.id) {
                                        if (["SS-Tier"].includes(Key)) UserRecordsArr[i][Key][Index] += 1
                                        else UserRecordsArr[i][Key] += 1
                                        break
                                    }
                                    index = i
                                }
                                if (Number(index) === UserRecordsArr.length - 1) {
                                    const UserObj_Push = {
                                        UserID: interaction.user.id,
                                        "C-Tier": (Key === 'C-Tier') ? 1 : 0,
                                        "B-Tier": (Key === 'B-Tier') ? 1 : 0,
                                        "A-Tier": (Key === 'A-Tier') ? 1 : 0,
                                        "S-Tier": (Key === 'S-Tier') ? 1 : 0,
                                        "SS-Tier": [
                                            (Key === 'SS-Tier' && Index === 0) ? 1 : 0,
                                            (Key === 'SS-Tier' && Index === 1) ? 1 : 0,
                                            (Key === 'SS-Tier' && Index === 2) ? 1 : 0
                                        ],
                                        "EX-Tier": (Key === 'EX-Tier') ? 1 : 0
                                    }
                                    if (UserObj_Push.UserID !== UserRecordsArr[index].UserID)
                                        UserRecordsArr.push(UserObj_Push)
                                }
                            } else {
                                const UserObj = {
                                    UserID: interaction.user.id,
                                    "C-Tier": (Key === 'C-Tier') ? 1 : 0,
                                    "B-Tier": (Key === 'B-Tier') ? 1 : 0,
                                    "A-Tier": (Key === 'A-Tier') ? 1 : 0,
                                    "S-Tier": (Key === 'S-Tier') ? 1 : 0,
                                    "SS-Tier": [
                                        (Key === 'SS-Tier' && Index === 0) ? 1 : 0,
                                        (Key === 'SS-Tier' && Index === 1) ? 1 : 0,
                                        (Key === 'SS-Tier' && Index === 2) ? 1 : 0
                                    ],
                                    "EX-Tier": (Key === 'EX-Tier') ? 1 : 0
                                }
                                UserRecordsArr.push(UserObj)
                            }

                            //Type Records

                            const Obj = data1.TypeRecords
                            if (Obj.length > 0) {
                                if (Key === "SS-Tier") Obj[0][Key][Index] += 1
                                else Obj[0][Key] += 1
                            }

                            data1.UserRecords = [], data1.TypeRecords = []
                            for (var i in UserRecordsArr) {
                                data1.UserRecords.push(UserRecordsArr[i])
                            }
                            data1.TypeRecords.push(Obj[0])
                            data1.save()
                        }
                    })
                }
            }
        })
    }
}
