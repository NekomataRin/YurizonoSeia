const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

const ImgList = require('../../Assets/Howgay/Texts/imglist')
const Denied_Cases = require('../../Assets/Howgay/Texts/denied')
const Cases = require('../../Assets/Howgay/Texts/allcases')
const wait = require('node:timers/promises').setTimeout
const cdSchema = require('../../Database/cooldown')
const HowgayList = require('../../Database/Fun/howgay')
const chalk = require('chalk')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('howgay')
        .setDescription('Checking a user is gay or not in the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to check')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('avg')
                .setDescription('Check average on how gay (3 times), this is optional')
                .setRequired(false)
        ),
    async execute(interaction) {

        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const cdtime = 20000 //0 //Debug

        const target = await interaction.options.getUser('user') || interaction.user
        const tuser = await interaction.guild.members.fetch(target.id)

        const AvgChr = await interaction.options.getBoolean('avg') || false
        const NumEntry = Cases.Ranges.NormalCases
        const SpecialEntry = Cases.Ranges.SpecialCases

        let Desc, Color, RunKey, ImgLink, ImgCtx
        //Bypassed Cases
        for (var i in Denied_Cases) {
            if (target.id === Denied_Cases[i].id) {
                Color = Cases.Colors.Rejected
                Desc = Denied_Cases[i].desc
                ImgLink = new AttachmentBuilder(Denied_Cases[i].img)
                ImgCtx = Denied_Cases[i].ctx
                RunKey = 'Denied'
                break
            }
        }

        if (target.bot && target.id !== '1244213929438089286') {
            Desc = `<a:YaeSlap:1251733720600412240> Oi, you can't check \`/howgay\` command on a bot! (${target}), please go check someone else!`
            Color = Cases.Colors.Rejected
            ImgLink = new AttachmentBuilder(ImgList.Rejected.None.value)
            ImgCtx = ImgList.Rejected.None.ctx
            RunKey = 'Denied'
        }

        if (RunKey === 'Denied') {
            const DeniedEmbed = new EmbedBuilder()
                .setColor(Color)
                .setTitle(`🏳️‍🌈 Checking gayness of a user`)
                .setThumbnail(tuser.displayAvatarURL({ dynamic: true, size: 512 }))
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(Desc)
                .setTimestamp()
                .setImage(ImgCtx)
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [DeniedEmbed],
                files: [ImgLink]
            })
        } else {
            var DescArr = [], GayEmbeds = [], Emoji, Comment, rng, avgrng, typeindex, spkey = false
            if (!AvgChr) {
                rng = Math.random() * 101.1
                //rng = 0.5 //Tesing Purposes, Only Remove When You Do That
                rng = (Math.floor(rng * 10) / 10).toFixed(1)

                //Normal Entry
                for (var i in NumEntry) {
                    if (rng < NumEntry[i]) {
                        Color = Cases.Colors.NormalCases[i]
                        Emoji = Cases.EmojisNormal[i]
                        ImgLink = new AttachmentBuilder(ImgList.Default.value)
                        ImgCtx = ImgList.Default.ctx
                        Comment = Cases.NormalCases[`Case-${i}`][Math.floor(Math.random() * Cases.NormalCases[`Case-${i}`].length)]
                        typeindex = i
                        break
                    }
                }

                //Special Cases
                if (SpecialEntry.includes(Number(rng))) {
                    ImgLink = new AttachmentBuilder(Cases.SpecialCases[`Case${rng}`].img)
                    ImgCtx = Cases.SpecialCases[`Case${rng}`].ctx
                    Emoji = Cases.SpecialCases[`Case${rng}`].emoji
                    Color = Cases.Colors.SpecialCases
                    Comment = Cases.SpecialCases[`Case${rng}`].desc
                    specialnum = rng
                    spkey = true
                }

                DescArr.push(`## ${Emoji} - Gayness Test Result\n▸ The gayness of ${target} is \`${rng}%\`\n### > Comments:\n\n ${Comment}`)
                if (rng <= 1) {
                    const index = Math.floor(Math.random() * ImgList.GigaChad.length)
                    ImgLink = new AttachmentBuilder(ImgList.GigaChad[index].value)
                    ImgCtx = ImgList.GigaChad[index].ctx
                    if (tuser.roles.cache.has("1356679121996087487")) {
                        DescArr[0] += `\n-# > Successfully removed <@&1356679121996087487> to ${target}, well then, since they proved themselves to be a real person.`
                    } else if (!tuser.roles.cache.has("1356678602028093490")) {
                        DescArr[0] += `\n-# > Successfully added <@&1356678602028093490> to ${target}. Congratulations, you're the real chad here!`
                    } else {
                        DescArr[0] += `\n-# Bro, your rizz level is too high for us now, what do we call, a TERACHAD?`
                    }
                }
                if (rng >= 100) {
                    const index = Math.floor(Math.random() * ImgList.Gay.length)
                    ImgLink = new AttachmentBuilder(ImgList.Gay[index].value)
                    ImgCtx = ImgList.Gay[index].ctx
                    if (tuser.roles.cache.has("1356678602028093490")) {
                        DescArr[0] += `\n-# > Successfully removed <@&1356678602028093490> to ${target}, well too bad, bro lost your title lol.`
                    } else if (!tuser.roles.cache.has("1356679121996087487")) {
                        DescArr[0] += `\n-# > Successfully added <@&1356679121996087487> to ${target}. Congratulations, now everyone knows that you are GAY`
                    } else {
                        DescArr[0] += `\n-# Lmao, you're already gay, and now you got this value again, what a pity.`
                    }
                }
                GayEmbeds[0] = new EmbedBuilder()
                    .setColor(Color)
                    .setTitle(`🏳️‍🌈 Checking gayness of a user`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription(DescArr[0])
                    .setTimestamp()
                    .setThumbnail(tuser.displayAvatarURL({ dynamic: true, size: 512 }))
                    .setImage(ImgCtx)
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            } else {
                avgrng = 0
                let rnglist = []
                for (var i = 0; i < 3; i++) {
                    let temp = Math.random() * 101.1
                    temp = (Math.floor(temp * 10) / 10).toFixed(1)
                    rnglist.push(temp)
                    DescArr.push(`▸ **Attempt ${i + 1}:** The gayness of ${target} is \`${rnglist[i]}%\`\n`)
                    avgrng += Number(rnglist[i])
                }

                avgrng /= 3
                //avgrng = 100.5 //Tesing Purposes, Only Remove When You Do That
                avgrng = (Math.floor(avgrng * 10) / 10).toFixed(1)

                //Normal Entry
                for (var i in NumEntry) {
                    if (avgrng < NumEntry[i]) {
                        Color = Cases.Colors.NormalCases[i]
                        Emoji = Cases.EmojisNormal[i]
                        ImgLink = new AttachmentBuilder(ImgList.Default.value)
                        ImgCtx = ImgList.Default.ctx
                        Comment = Cases.NormalCases[`Case-${i}`][Math.floor(Math.random() * Cases.NormalCases[`Case-${i}`].length)]
                        typeindex = i
                        break
                    }
                }
                //Special Cases
                if (SpecialEntry.includes(Number(avgrng))) {
                    ImgLink = new AttachmentBuilder(Cases.SpecialCases[`Case${avgrng}`].img)
                    ImgCtx = Cases.SpecialCases[`Case${avgrng}`].ctx
                    Emoji = Cases.SpecialCases[`Case${avgrng}`].emoji
                    Color = Cases.Colors.SpecialCases
                    Comment = Cases.SpecialCases[`Case${avgrng}`].desc
                    specialnum = avgrng
                    spkey = true
                }

                DescArr.push(`## ${Emoji} - Gayness test result\n▸ The calculated gayness of ${target} is \`${avgrng}%\`\n\n### > Comments:\n ${Comment}`)
                let OfficialDesc = ''
                for (var i = 0; i < 3; i++) {
                    OfficialDesc += DescArr[i]
                    GayEmbeds[i] = new EmbedBuilder()
                        .setColor('White')
                        .setTitle(`🏳️‍🌈 Checking gayness of a user`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(OfficialDesc)
                        .setTimestamp()
                        .setThumbnail(tuser.displayAvatarURL({ dynamic: true, size: 512 }))
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                }

                if (avgrng <= 1) {
                    const index = Math.floor(Math.random() * ImgList.GigaChad.length)
                    ImgLink = new AttachmentBuilder(ImgList.GigaChad[index].value)
                    ImgCtx = ImgList.GigaChad[index].ctx
                    if (tuser.roles.cache.has("1356679121996087487")) {
                        tuser.roles.remove('1356679121996087487')
                        DescArr[3] += `\n-# > Successfully removed <@&1356679121996087487> to ${target}, well then, since they proved themselves to be a real person.`
                    } else if (!tuser.roles.cache.has("1356678602028093490")) {
                        tuser.roles.add('1356678602028093490')
                        DescArr[3] += `\n-# > Successfully added <@&1356678602028093490> to ${target}. Congratulations, you're the real chad here!`
                    } else {
                        DescArr[3] += `\n-# Bro, your rizz level is too high for us now, what do we call, a TERACHAD?`
                    }
                }
                if (avgrng >= 100) {
                    const index = Math.floor(Math.random() * ImgList.Gay.length)
                    ImgLink = new AttachmentBuilder(ImgList.Gay[index].value)
                    ImgCtx = ImgList.Gay[index].ctx
                    if (tuser.roles.cache.has("1356678602028093490")) {
                        DescArr[3] += `\n-# > Successfully removed <@&1356678602028093490> to ${target}, well too bad, bro lost your title lol.`
                    } else if (!tuser.roles.cache.has("1356679121996087487")) {
                        DescArr[3] += `\n-# > Successfully added <@&1356679121996087487> to ${target}. Congratulations, now everyone knows that you are GAY`
                    } else {
                        DescArr[3] += `\n-# Lmao, you're already gay, and now you got this value again, what a pity.`
                    }
                }

                OfficialDesc += DescArr[3]
                GayEmbeds[3] = new EmbedBuilder()
                    .setColor(Color)
                    .setTitle(`🏳️‍🌈 Checking gayness of a user`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription(OfficialDesc)
                    .setTimestamp()
                    .setThumbnail(tuser.displayAvatarURL({ dynamic: true, size: 512 }))
                    .setImage(ImgCtx)
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            }
        }
        cdSchema.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                cdSchema.create({
                    UserID: interaction.user.id,
                    HowGay: Date.now()
                })
                await interaction.editReply('<:seiaconcerned:1244129048494473246> Well, since you haven\'t in cooldown database yet... now you can try again')
            }
            else {
                const cduser = data.UserID
                const CDTime = data.HowGay
                console.log(chalk.yellow('[Command: Howgay]') + ` ${cduser}, ${CDTime}, ${Date.now()}`)

                if (CDTime > Date.now()) {
                    const cdembed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`**Command - Cooldown**`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(` <:seiaconcerned:1244129048494473246> | ${interaction.user} Sensei! Can you please stop doing that command again? I'm exhausted, I can take a rest too, you know? I'm not some sort of a real robot who can repeatedly do this for you!\n-# You can use this command again in: <t:${Math.floor(CDTime / 1000)}:R>`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({ embeds: [cdembed] })
                } else {
                    data.HowGay = Date.now() + cdtime
                    data.save()

                    let RoleKey = false
                    const WaitingEmbed = new EmbedBuilder()
                        .setColor('White')
                        .setTitle(`🏳️‍🌈 Checking gayness of a user`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(`<:SeiaSip:1244890166116618340> The system is checking the gayness of ${target}... Please wait...`)
                        .setTimestamp()
                        .setThumbnail(tuser.displayAvatarURL({ dynamic: true, size: 512 }))
                        .setImage(ImgCtx)
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({
                        embeds: [WaitingEmbed]
                    })

                    await wait(2000)
                    if (!AvgChr) {
                        await interaction.editReply({
                            embeds: [GayEmbeds[0]],
                            files: [ImgLink]
                        })
                        RoleKey = true
                    } else {
                        for (var i = 0; i <= 3; i++) {
                            await wait(500)
                            if (i === 3) {
                                await interaction.editReply({
                                    embeds: [GayEmbeds[i]],
                                    files: [ImgLink]
                                })
                            } else {
                                await interaction.editReply({
                                    embeds: [GayEmbeds[i]]
                                })
                            }
                        }
                        RoleKey = true
                    }

                    if (RoleKey) {
                        finalvalue = rng || avgrng
                        if (finalvalue <= 1) {
                            if (tuser.roles.cache.has("1356679121996087487")) {
                                await tuser.roles.remove('1356679121996087487')
                            } else if (!tuser.roles.cache.has("1356678602028093490")) {
                                await tuser.roles.add('1356678602028093490')
                            }
                        }

                        if (finalvalue >= 100) {
                            if (tuser.roles.cache.has("1356678602028093490")) {
                                await tuser.roles.remove('1356678602028093490')
                            } else if (!tuser.roles.cache.has("1356679121996087487")) {
                                await tuser.roles.add('1356679121996087487')
                            }
                        }

                        HowgayList.findOne({ GuildId: interaction.guild.id }, async (err, data1) => {
                            if (err) return err
                            if (!data1) {
                                return HowgayList.create({
                                    GuildId: interaction.guild.id,
                                    UserRecords: [],
                                    TypeRecords: []
                                })
                            }
                            if (data1) {
                                //Save Record For User 
                                const UserRecordsArr = data1.UserRecords, TypeRecords = data1.TypeRecords
                                if (UserRecordsArr.length > 0) {
                                    let index = 0
                                    for (var i in UserRecordsArr) {
                                        if (UserRecordsArr[i].id === target.id) {
                                            let key = (AvgChr) ? 'avg' : 'nonavg'
                                            UserRecordsArr[i].values.run[key].unshift(Number(finalvalue))
                                            const Arr = UserRecordsArr[i].values.run[key]
                                            UserRecordsArr[i].values.run[key] = Arr.slice(0, 101)
                                            if (AvgChr) {
                                                UserRecordsArr[i].values.maxavg = Math.max(...Arr)
                                                UserRecordsArr[i].values.minavg = Math.min(...Arr)
                                            } else {
                                                UserRecordsArr[i].values.max = Math.max(...Arr)
                                                UserRecordsArr[i].values.min = Math.min(...Arr)
                                            }
                                            UserRecordsArr[i].total.normal += 1
                                            UserRecordsArr[i].total.special += (spkey) ? 1 : 0

                                            console.log(UserRecordsArr[i].values.max, UserRecordsArr[i].values.min, UserRecordsArr[i].values.maxavg, UserRecordsArr[i].values.minavg)
                                            break
                                        }
                                        index = i
                                    }
                                    
                                    if (Number(index) === UserRecordsArr.length - 1 && UserRecordsArr.length > 1) {
                                        let key = (AvgChr) ? 'avg' : 'nonavg'
                                        UserRecordsArr.push(
                                            {
                                                id: target.id,
                                                values: {
                                                    run: {
                                                        nonavg: [],
                                                        avg: []
                                                    },
                                                    max: 0,
                                                    min: 0,
                                                    maxavg: 0,
                                                    minavg: 0
                                                },
                                                total: {
                                                    normal: 1,
                                                    special: (spkey) ? 1 : 0
                                                }
                                            }
                                        )
                                        UserRecordsArr[UserRecordsArr.length - 1].values.run[key].unshift(Number(finalvalue))
                                        UserRecordsArr[UserRecordsArr.length - 1].values.max = Math.max(...UserRecordsArr[UserRecordsArr.length - 1].values.run.nonavg)
                                        UserRecordsArr[UserRecordsArr.length - 1].values.min = Math.min(...UserRecordsArr[UserRecordsArr.length - 1].values.run.nonavg)
                                        UserRecordsArr[UserRecordsArr.length - 1].values.maxavg = Math.max(...UserRecordsArr[UserRecordsArr.length - 1].values.run.avg)
                                        UserRecordsArr[UserRecordsArr.length - 1].values.minavg = Math.min(...UserRecordsArr[UserRecordsArr.length - 1].values.run.avg)
                                    }
                                } else {
                                    let key = (AvgChr) ? 'avg' : 'nonavg'
                                    UserRecordsArr.push(
                                        {
                                            id: target.id,
                                            values: {
                                                run: {
                                                    nonavg: [],
                                                    avg: []
                                                },
                                                max: 0,
                                                min: 0,
                                                maxavg: 0,
                                                minavg: 0
                                            },
                                            total: {
                                                normal: 1,
                                                special: (spkey) ? 1 : 0
                                            }
                                        }
                                    )
                                    UserRecordsArr[0].values.run[key].unshift(Number(finalvalue))
                                    UserRecordsArr[0].values.max = Math.max(...UserRecordsArr[0].values.run.nonavg)
                                    UserRecordsArr[0].values.min = Math.min(...UserRecordsArr[0].values.run.nonavg)
                                    UserRecordsArr[0].values.maxavg = Math.max(...UserRecordsArr[0].values.run.avg)
                                    UserRecordsArr[0].values.minavg = Math.min(...UserRecordsArr[0].values.run.avg)
                                }


                                //Log Generated
                                const TypeRecordsArr = TypeRecords
                                const NormalCasesList = {
                                    0: {
                                        name: 'Type-0',
                                        value: (TypeRecordsArr.length > 0) ? TypeRecordsArr[0][0].value : 0
                                    },
                                    1: {
                                        name: 'Type-1',
                                        value: (TypeRecordsArr.length > 0) ? TypeRecordsArr[0][1].value : 0
                                    },
                                    2: {
                                        name: 'Type-2',
                                        value: (TypeRecordsArr.length > 0) ? TypeRecordsArr[0][2].value : 0
                                    },
                                    3: {
                                        name: 'Type-3',
                                        value: (TypeRecordsArr.length > 0) ? TypeRecordsArr[0][3].value : 0
                                    },
                                    4: {
                                        name: 'Type-4',
                                        value: (TypeRecordsArr.length > 0) ? TypeRecordsArr[0][4].value : 0
                                    },
                                    5: {
                                        name: 'Type-5',
                                        value: (TypeRecordsArr.length > 0) ? TypeRecordsArr[0][5].value : 0
                                    },
                                    6: {
                                        name: 'Type-6',
                                        value: (TypeRecordsArr.length > 0) ? TypeRecordsArr[0][6].value : 0
                                    },
                                    7: {
                                        name: 'Type-7',
                                        value: (TypeRecordsArr.length > 0) ? TypeRecordsArr[0][7].value : 0
                                    },
                                }

                                const SpecialCasesList = {
                                    "32.0": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["32.0"] : 0,
                                    "40.3": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["40.3"] : 0,
                                    "40.4": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["40.4"] : 0,
                                    "42.0": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["42.0"] : 0,
                                    "49.9": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["49.9"] : 0,
                                    "63.0": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["63.0"] : 0,
                                    "72.7": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["72.7"] : 0,
                                    "91.1": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["91.1"] : 0,
                                    "96.9": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["96.9"] : 0,
                                    "99.9": (TypeRecordsArr.length > 0) ? TypeRecordsArr[1]["99.9"] : 0
                                }

                                //Normal Cases
                                console.log(typeindex)
                                const NormalIndexes = Object.keys(NormalCasesList)
                                console.log(NormalIndexes)
                                for (var i in NormalIndexes) {
                                    if (NormalIndexes[i] === typeindex) {
                                        NormalCasesList[i].value += 1
                                        break
                                    }
                                }
                                TypeRecordsArr[0] = NormalCasesList

                                //Special Cases
                                const SpecialIndexes = Object.keys(SpecialCasesList)
                                for (var i in SpecialIndexes) {
                                    if (finalvalue === SpecialIndexes[i]) {
                                        SpecialCasesList[finalvalue] = Number(SpecialCasesList[finalvalue]) + 1
                                        break
                                    }
                                }
                                TypeRecordsArr[1] = SpecialCasesList

                                data1.UserRecords = [], data1.TypeRecords = []
                                function ArrPush(arr = [], item = []) {
                                    for (var i in arr) {
                                        item.push(arr[i])
                                    }
                                    return arr
                                }
                                const GeneralArr = [UserRecordsArr, TypeRecordsArr],
                                    ItemArr = [data1.UserRecords, data1.TypeRecords]

                                for (var i in GeneralArr) {
                                    ArrPush(GeneralArr[i], ItemArr[i])
                                }
                                data1.save()
                            }
                        })
                    }
                }
            }
        })
    }
}