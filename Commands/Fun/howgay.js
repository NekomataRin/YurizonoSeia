const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

const ImgList = require('../../Assets/Howgay/Texts/imglist')
const Denied_Cases = require('../../Assets/Howgay/Texts/denied')
const Denied_CasesVN = require('../../Assets/Howgay/Texts/denied-vn')

const Cases = require('../../Assets/Howgay/Texts/allcases')
const CasesVN = require('../../Assets/Howgay/Texts/allcases-vn')

const wait = require('node:timers/promises').setTimeout
const cdSchema = require('../../Database/cooldown')
const HowgayList = require('../../Database/Fun/howgay')
const chalk = require('chalk')

const cdtxts = require('../../Assets/Defaults/cooldown')
const Language = require('../../Database/lang-setup')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('howgay')
        .setDescription('Checking a user is gay or not in the server')
        .setDescriptionLocalizations({
            vi: "Kiểm tra người dùng nào đó có bị gay hay không trong server"
        })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to check')
                .setDescriptionLocalizations({ vi: 'Người dùng mà bạn muốn kiểm tra' })
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('avg')
                .setDescription('Check average on how gay (3 times), this is optional')
                .setDescriptionLocalizations({ vi: "Kiểm tra độ gay trung bình (3 lần), cái này tuỳ chọn" })
                .setRequired(false)
        ),
    async execute(interaction) {

        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const cdtime = 20000 //0 //Debug

        //Language Setup
        let LangKey
        const LanguageKey = await Language.findOne({ UserID: interaction.user.id }).select('-_id Lang')
        if (!LanguageKey) {
            const ResponseEmbed = new EmbedBuilder()
                .setColor("Yellow")
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle(`<:seiaconcerned:1244128341540208793> • **Language Is Not Set**`)
                .setDescription(`<:seiaehem:1244128370669650060> • Sensei! Please use \`/setup-language\` command in order to use the command! Since v1.4.0, my dad updated my code and added Vietnamese language for this!\n-# > And he is too lazy to add proper vietnamese embed for this lmao`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [ResponseEmbed]
            })
        }

        LangKey = LanguageKey.Lang

        let HowGayCases = {}, RejectedCases = {}
        switch (LangKey) {
            case "vi":
                {
                    HowGayCases = CasesVN
                    RejectedCases = Denied_CasesVN
                    break
                }
            case "en-US":
            default:
                {
                    HowGayCases = Cases
                    RejectedCases = Denied_Cases
                    break
                }
        }
        const target = await interaction.options.getUser('user') || interaction.user
        const tuser = await interaction.guild.members.fetch(target.id)

        const AvgChr = await interaction.options.getBoolean('avg') || false
        const NumEntry = HowGayCases.Ranges.NormalCases
        const SpecialEntry = HowGayCases.Ranges.SpecialCases
        const FactorEntry = HowGayCases.Ranges.FactorEntry
        const FactorValues = HowGayCases.Ranges.FactorValues

        let Desc, Color, RunKey, ImgLink, ImgCtx
        //Bypassed HowGayCases
        for (var i in RejectedCases) {
            if (target.id === RejectedCases[i].id) {
                Color = HowGayCases.Colors.Rejected
                Desc = RejectedCases[i].desc
                ImgLink = new AttachmentBuilder(RejectedCases[i].img)
                ImgCtx = RejectedCases[i].ctx
                RunKey = 'Denied'
                break
            }
        }

        if (target.bot && target.id !== '1244213929438089286') {
            Desc = (LangKey === 'vi') ? `<a:YaeSlap:1251733720600412240> Oi, bạn không thể dùng lệnh \`/howgay\` lên bot! (${target}), làm ơn hãy check người khác đi!` : `<a:YaeSlap:1251733720600412240> Oi, you can't check \`/howgay\` command on a bot! (${target}), please go check someone else!`
            Color = HowGayCases.Colors.Rejected
            ImgLink = new AttachmentBuilder(ImgList.Rejected.None.value)
            ImgCtx = ImgList.Rejected.None.ctx
            RunKey = 'Denied'
        }

        if (RunKey === 'Denied') {
            const DeniedEmbed = new EmbedBuilder()
                .setColor(Color)
                .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Kiểm tra độ gay của ai đó` : `🏳️‍🌈 Checking gayness of a user`)
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
                rng = Math.random() * 101.0001
                //rng = 0.5 //Tesing Purposes, Only Remove When You Do That
                rng = (Math.floor(rng * 1000) / 1000).toFixed(4)

                //Normal Entry
                for (var i in NumEntry) {
                    if (rng < NumEntry[i]) {
                        Color = HowGayCases.Colors.NormalCases[i]
                        Emoji = HowGayCases.EmojisNormal[i]
                        ImgLink = new AttachmentBuilder(ImgList.Default.value)
                        ImgCtx = ImgList.Default.ctx
                        Comment = HowGayCases.NormalCases[`Case-${i}`][Math.floor(Math.random() * HowGayCases.NormalCases[`Case-${i}`].length)]
                        typeindex = i
                        break
                    }
                }

                //Special HowGayCases
                let detect_rng = Number(rng).toFixed(1)
                if (SpecialEntry.includes(detect_rng)) {
                    ImgLink = new AttachmentBuilder(HowGayCases.SpecialCases[`Case${detect_rng}`].img)
                    ImgCtx = HowGayCases.SpecialCases[`Case${detect_rng}`].ctx
                    Emoji = HowGayCases.SpecialCases[`Case${detect_rng}`].emoji
                    Color = HowGayCases.Colors.SpecialCases
                    Comment = HowGayCases.SpecialCases[`Case${detect_rng}`].desc
                    specialnum = detect_rng
                    spkey = true
                }

                const ResultArr = {
                    "vi": ["Kết Quả Kiểm Tra Độ Gay", "Độ gay của", "là", "Nhận xét:", "Chỉ Số Gay:"],
                    "en-US": ["Gayness Test Result", "The gayness of", "is", "Comments:", "Gay Factor:"]
                }

                let factorStr = ''
                for (var i in FactorEntry) {
                    if (Number(rng) < FactorEntry[i]) {
                        factorStr = `${ResultArr[LangKey][5]} \`${FactorValues[i]}\``
                        break
                    }
                }
                DescArr.push(`## ${Emoji} - ${ResultArr[LangKey][0]}\n▸ ${ResultArr[LangKey][1]} ${target} ${ResultArr[LangKey][2]} \`${rng}%\`\n▸ ${factorStr}\n### > ${ResultArr[LangKey][3]}\n\n ${Comment}`)

                if (rng <= 1) {
                    const index = Math.floor(Math.random() * ImgList.GigaChad.length)
                    ImgLink = new AttachmentBuilder(ImgList.GigaChad[index].value)
                    ImgCtx = ImgList.GigaChad[index].ctx
                    if (interaction.guild.id === process.env.GUILD_ID) {
                        if (tuser.roles.cache.has("1162944612508377088")) {
                            DescArr[0] += (LangKey === 'vi') ? `\n-# > Đã gỡ <@&1162944612508377088> cho ${target}, well, vì chính bản thân họ đã chứng minh họ là con người chính hiệu.` : `\n-# > Successfully removed <@&1162944612508377088> to ${target}, well then, since they proved themselves to be a real person.`
                        } else if (!tuser.roles.cache.has("1171750121109733438")) {
                            DescArr[0] += (LangKey === 'vi') ? `\n-# > Đã thêm <@&1171750121109733438> cho ${target}. Chúc mừng anh bạn nhá, giờ đã là GIGA CHAD rôi đấy!` : `\n-# > Successfully added <@&1171750121109733438> to ${target}. Congratulations, you're the real chad here!`
                        } else {
                            DescArr[0] += (LangKey === 'vi') ? `\n-# Anh bạn à, kĩ năng rizz của ngài cao quá so với chúng sinh rồi, chả lẽ phải gọi ngài là TERACHAD?` : `\n-# Bro, your rizz level is too high for us now, what do we call, a TERACHAD?`
                        }
                    }
                }
                if (rng >= 100) {
                    const index = Math.floor(Math.random() * ImgList.Gay.length)
                    ImgLink = new AttachmentBuilder(ImgList.Gay[index].value)
                    ImgCtx = ImgList.Gay[index].ctx
                    if (interaction.guild.id === process.env.GUILD_ID) {
                        if (tuser.roles.cache.has("1171750121109733438")) {
                            DescArr[0] += (LangKey === 'vi') ? `\n-# > Đã gỡ <@&1171750121109733438> cho ${target}, well tệ đấy, anh bạn mất đi danh hiệu rồi còn dâu, lol.` : `\n-# > Successfully removed <@&1171750121109733438> to ${target}, well too bad, bro lost your title lol.`
                        } else if (!tuser.roles.cache.has("1162944612508377088")) {
                            DescArr[0] += (LangKey === 'vi') ? `\n-# > Đã thêm <@&1162944612508377088> cho ${target}. Chúc mừng, giờ thì mọi anh em trong làng biết là bạn bị GAY` : `\n-# > Successfully added <@&1162944612508377088> to ${target}. Congratulations, now everyone knows that you are GAY`
                        } else {
                            DescArr[0] += (LangKey === 'vi') ? `\n-# Lmao, Bạn đã gay rồi, giờ lại còn nhận cái chỉ số này nữa, thật đáng xấu hổ mà.` : `\n-# Lmao, you're already gay, and now you got this value again, what a pity.`
                        }
                    }
                }
                GayEmbeds[0] = new EmbedBuilder()
                    .setColor(Color)
                    .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Kiểm tra độ gay của ai đó` : `🏳️‍🌈 Checking gayness of a user`)
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
                    let temp = Math.random() * 101.0001
                    temp = (Math.floor(temp * 1000) / 1000).toFixed(4)
                    rnglist.push(temp)
                    DescArr.push((LangKey === 'vi') ? `▸ **Lần ${i + 1}:** Chỉ số gay của ${target} là \`${rnglist[i]}%\`\n` : `▸ **Attempt ${i + 1}:** The gayness of ${target} is \`${rnglist[i]}%\`\n`)
                    avgrng += Number(rnglist[i])
                }

                avgrng /= 3
                //avgrng = 100.5 //Tesing Purposes, Only Remove When You Do That
                avgrng = (Math.floor(avgrng * 1000) / 1000).toFixed(4)

                //Normal Entry
                for (var i in NumEntry) {
                    if (avgrng < NumEntry[i]) {
                        Color = HowGayCases.Colors.NormalCases[i]
                        Emoji = HowGayCases.EmojisNormal[i]
                        ImgLink = new AttachmentBuilder(ImgList.Default.value)
                        ImgCtx = ImgList.Default.ctx
                        Comment = HowGayCases.NormalCases[`Case-${i}`][Math.floor(Math.random() * HowGayCases.NormalCases[`Case-${i}`].length)]
                        typeindex = i
                        break
                    }
                }
                //Special Cases
                let detect_rng = Number(avgrng).toFixed(1)
                if (SpecialEntry.includes(detect_rng)) {
                    ImgLink = new AttachmentBuilder(HowGayCases.SpecialCases[`Case${detect_rng}`].img)
                    ImgCtx = HowGayCases.SpecialCases[`Case${detect_rng}`].ctx
                    Emoji = HowGayCases.SpecialCases[`Case${detect_rng}`].emoji
                    Color = HowGayCases.Colors.SpecialCases
                    Comment = HowGayCases.SpecialCases[`Case${detect_rng}`].desc
                    specialnum = detect_rng
                    spkey = true
                }

                const ResultArr = {
                    "vi": ["Kết Quả Kiểm Tra Độ Gay", "Độ gay sau khi tính toán của", "là", "Nhận xét:", "Chỉ Số Gay:"],
                    "en-US": ["Gayness Test Result", "The calculated gayness of", "is", "Comments:", "Gay Factor:"]
                }
                let factorStr = ''
                for (var i in FactorEntry) {
                    if (Number(avgrng) < FactorEntry[i]) {
                        factorStr = `${ResultArr[LangKey][5]} \`${FactorValues[i]}\``
                        break
                    }
                }

                DescArr.push(`## ${Emoji} - ${ResultArr[LangKey][0]}\n▸ ${ResultArr[LangKey][1]} ${target} ${ResultArr[LangKey][2]} \`${avgrng}%\`\n▸ ${factorStr}\n### > ${ResultArr[LangKey][3]}\n ${Comment}`)
                let OfficialDesc = ''
                for (var i = 0; i < 3; i++) {
                    OfficialDesc += DescArr[i]
                    GayEmbeds[i] = new EmbedBuilder()
                        .setColor('White')
                        .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Kiểm tra độ gay của ai đó` : `🏳️‍🌈 Checking gayness of a user`)
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
                    if (interaction.guild.id === process.env.GUILD_ID) {
                        if (tuser.roles.cache.has("1162944612508377088")) {
                            DescArr[3] += (LangKey === 'vi') ? `\n-# > Đã gỡ <@&1162944612508377088> cho ${target}, well, vì chính bản thân họ đã chứng minh họ là con người chính hiệu.` : `\n-# > Successfully removed <@&1162944612508377088> to ${target}, well then, since they proved themselves to be a real person.`
                        } else if (!tuser.roles.cache.has("1171750121109733438")) {
                            DescArr[3] += (LangKey === 'vi') ? `\n-# > Đã thêm <@&1171750121109733438> cho ${target}. Chúc mừng anh bạn nhá, giờ đã là GIGA CHAD rôi đấy!` : `\n-# > Successfully added <@&1171750121109733438> to ${target}. Congratulations, you're the real chad here!`
                        } else {
                            DescArr[3] += (LangKey === 'vi') ? `\n-# Anh bạn à, kĩ năng rizz của ngài cao quá so với chúng sinh rồi, chả lẽ phải gọi ngài là TERACHAD?` : `\n-# Bro, your rizz level is too high for us now, what do we call, a TERACHAD?`
                        }
                    }
                }
                if (avgrng >= 100) {
                    const index = Math.floor(Math.random() * ImgList.Gay.length)
                    ImgLink = new AttachmentBuilder(ImgList.Gay[index].value)
                    ImgCtx = ImgList.Gay[index].ctx
                    if (interaction.guild.id === process.env.GUILD_ID) {
                        if (tuser.roles.cache.has("1171750121109733438")) {
                            DescArr[3] += (LangKey === 'vi') ? `\n-# > Đã gỡ <@&1171750121109733438> cho ${target}, well tệ đấy, anh bạn mất đi danh hiệu rồi còn dâu, lol.` : `\n-# > Successfully removed <@&1171750121109733438> to ${target}, well too bad, bro lost your title lol.`
                        } else if (!tuser.roles.cache.has("1162944612508377088")) {
                            DescArr[3] += (LangKey === 'vi') ? `\n-# > Đã thêm <@&1162944612508377088> cho ${target}. Chúc mừng, giờ thì mọi anh em trong làng biết là bạn bị GAY` : `\n-# > Successfully added <@&1162944612508377088> to ${target}. Congratulations, now everyone knows that you are GAY`
                        } else {
                            DescArr[3] += (LangKey === 'vi') ? `\n-# Lmao, Bạn đã gay rồi, giờ lại còn nhận cái chỉ số này nữa, thật đáng xấu hổ mà.` : `\n-# Lmao, you're already gay, and now you got this value again, what a pity.`
                        }
                    }
                }

                OfficialDesc += DescArr[3]
                GayEmbeds[3] = new EmbedBuilder()
                    .setColor(Color)
                    .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Kiểm tra độ gay của ai đó` : `🏳️‍🌈 Checking gayness of a user`)
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
                await interaction.editReply(cdtxts[LangKey].new)
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
                        .setDescription(`${cdtxts[LangKey].cd[0]} ${interaction.user} ${cdtxts[LangKey].cd[1]} <t:${Math.floor(CDTime / 1000)}:R>`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({ embeds: [cdembed] })
                } else {
                    data.HowGay = Date.now() + cdtime
                    data.save()

                    let RoleKey = false
                    const WaitingEmbed = new EmbedBuilder()
                        .setColor('White')
                        .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Kiểm tra độ gay của ai đó` : `🏳️‍🌈 Checking gayness of a user`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription((LangKey === 'vi') ? `<:SeiaSip:1244890166116618340> Hệ thống đang kiểm tra độ gay của ${target}... Xin vui lòng chờ...` : `<:SeiaSip:1244890166116618340> The system is checking the gayness of ${target}... Please wait...`)
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
                        if (finalvalue <= 1 && interaction.guild.id === process.env.GUILD_ID) {
                            if (tuser.roles.cache.has("1162944612508377088")) {
                                await tuser.roles.remove('1162944612508377088')
                            } else if (!tuser.roles.cache.has("1171750121109733438")) {
                                await tuser.roles.add('1171750121109733438')
                            }
                        }

                        if (finalvalue >= 100 && interaction.guild.id === process.env.GUILD_ID) {
                            if (tuser.roles.cache.has("1171750121109733438")) {
                                await tuser.roles.remove('1171750121109733438')
                            } else if (!tuser.roles.cache.has("1162944612508377088")) {
                                await tuser.roles.add('1162944612508377088')
                            }
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
                            finalvalue = rng || avgrng
                            const UserRecordsArr = data1.UserRecords, TypeRecords = data1.TypeRecords
                            if (UserRecordsArr.length > 0) {
                                let index = 0
                                for (var i in UserRecordsArr) {
                                    //console.log(UserRecordsArr[i].id)
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

                                        //console.log(UserRecordsArr[i].values.max, UserRecordsArr[i].values.min, UserRecordsArr[i].values.maxavg, UserRecordsArr[i].values.minavg)
                                        break
                                    }
                                    index = i
                                }
                                //console.log(index, Number(index) === UserRecordsArr.length - 1)
                                if (Number(index) === UserRecordsArr.length - 1) {
                                    let key = (AvgChr) ? 'avg' : 'nonavg'
                                    const Obj = {
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

                                    if (Obj.id !== UserRecordsArr[index].id) {
                                        UserRecordsArr.push(Obj)
                                        UserRecordsArr[UserRecordsArr.length - 1].values.run[key].unshift(Number(finalvalue))
                                        UserRecordsArr[UserRecordsArr.length - 1].values.max = Math.max(...UserRecordsArr[UserRecordsArr.length - 1].values.run.nonavg)
                                        UserRecordsArr[UserRecordsArr.length - 1].values.min = Math.min(...UserRecordsArr[UserRecordsArr.length - 1].values.run.nonavg)
                                        UserRecordsArr[UserRecordsArr.length - 1].values.maxavg = Math.max(...UserRecordsArr[UserRecordsArr.length - 1].values.run.avg)
                                        UserRecordsArr[UserRecordsArr.length - 1].values.minavg = Math.min(...UserRecordsArr[UserRecordsArr.length - 1].values.run.avg)
                                    }
                                }
                            } else {
                                let key = (AvgChr) ? 'avg' : 'nonavg'
                                const obj = {
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
                                UserRecordsArr.push(obj)
                                UserRecordsArr[0].values.run[key].unshift(Number(finalvalue))
                                UserRecordsArr[0].values.max = Math.max(...UserRecordsArr[0].values.run.nonavg)
                                UserRecordsArr[0].values.min = Math.min(...UserRecordsArr[0].values.run.nonavg)
                                UserRecordsArr[0].values.maxavg = Math.max(...UserRecordsArr[0].values.run.avg)
                                UserRecordsArr[0].values.minavg = Math.min(...UserRecordsArr[0].values.run.avg)
                            }

                            //console.log(UserRecordsArr)
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
                            //console.log(typeindex)
                            const NormalIndexes = Object.keys(NormalCasesList)
                            //console.log(NormalIndexes)
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
                                if (Number(finalvalue).toFixed(1) === SpecialIndexes[i]) {
                                    SpecialCasesList[Number(finalvalue).toFixed(1)] = Number(SpecialCasesList[Number(finalvalue).toFixed(1)]) + 1
                                    break
                                }
                            }
                            TypeRecordsArr[1] = SpecialCasesList

                            data1.UserRecords = [], data1.TypeRecords = []


                            for (var i in UserRecordsArr) {
                                data1.UserRecords.push(UserRecordsArr[i])
                            }

                            for (var j in TypeRecords) {
                                data1.TypeRecords.push(TypeRecords[j])
                            }
                            data1.save()
                        }
                    })
                }
            }
        })
    }
}