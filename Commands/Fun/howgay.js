const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

const ImgList = require('../../Assets/Howgay/Texts/imglist')
const Denied_Cases = require('../../Assets/Howgay/Texts/denied')
const Cases = require('../../Assets/Howgay/Texts/allcases')
const wait = require('node:timers/promises').setTimeout
const cdSchema = require('../../Database/cooldown')
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
        const cdtime = 45000

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
            var DescArr = [], GayEmbeds = [], Emoji, Comment
            if (!AvgChr) {
                var rng = Math.random() * 101.1
                rng = (Math.floor(rng * 10) / 10).toFixed(1)
                //rng = 72.7 //Tesing Purposes, Only Removed When You Do That

                //Normal Entry
                for (var i in NumEntry) {
                    if (rng < NumEntry[i]) {
                        Color = Cases.Colors.NormalCases[i]
                        Emoji = Cases.EmojisNormal[i]
                        ImgLink = new AttachmentBuilder(ImgList.Default.value)
                        ImgCtx = ImgList.Default.ctx
                        Comment = Cases.NormalCases[`Case-${i}`][Math.floor(Math.random() * Cases.NormalCases[`Case-${i}`].length)]
                        break
                    }
                }
                if (rng <= 1) {
                    const index = Math.floor(Math.random() * ImgList.GigaChad.length)
                    ImgLink = new AttachmentBuilder(ImgList.GigaChad[index].value)
                    ImgCtx = ImgList.GigaChad[index].ctx
                }
                if (rng >= 100) {
                    const index = Math.floor(Math.random() * ImgList.Gay.length)
                    ImgLink = new AttachmentBuilder(ImgList.Gay[index].value)
                    ImgCtx = ImgList.Gay[index].ctx
                }
                //Special Cases
                for (var i in SpecialEntry) {
                    if (Number(rng) === SpecialEntry[i]) {
                        ImgLink = new AttachmentBuilder(Cases.SpecialCases[`Case${rng}`].img)
                        ImgCtx = Cases.SpecialCases[`Case${rng}`].ctx
                        Emoji = Cases.SpecialCases[`Case${rng}`].emoji
                        Color = Cases.Colors.SpecialCases
                        Comment = Cases.SpecialCases[`Case${rng}`].desc
                        break
                    }
                }

                DescArr.push(`## ${Emoji} - Gayness Test Result\n▸ The gayness of ${target} is \`${rng}%\`\n### > Comments:\n\n ${Comment}`)

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
                let avgrng = 0, rnglist = []
                for (var i = 0; i < 3; i++) {
                    let temp = Math.random() * 101.1
                    temp = (Math.floor(temp * 10) / 10).toFixed(1)
                    rnglist.push(temp)
                    DescArr.push(`▸ **Attempt ${i + 1}:** The gayness of ${target} is \`${rnglist[i]}%\`\n`)
                    avgrng += Number(rnglist[i])
                }

                avgrng /= 3
                avgrng = (Math.floor(avgrng * 10) / 10).toFixed(1)
                //avgrng = 72.7 //Tesing Purposes, Only Removed When You Do That
                for (var i in NumEntry) {
                    if (avgrng < NumEntry[i]) {
                        Color = Cases.Colors.NormalCases[i]
                        Emoji = Cases.EmojisNormal[i]
                        ImgLink = new AttachmentBuilder(ImgList.Default.value)
                        ImgCtx = ImgList.Default.ctx
                        Comment = Cases.NormalCases[`Case-${i}`][Math.floor(Math.random() * Cases.NormalCases[`Case-${i}`].length)]
                        break
                    }
                }
                if (avgrng <= 1) {
                    const index = Math.floor(Math.random() * ImgList.GigaChad.length)
                    ImgLink = new AttachmentBuilder(ImgList.GigaChad[index].value)
                    ImgCtx = ImgList.GigaChad[index].ctx
                }
                if (avgrng >= 100) {
                    const index = Math.floor(Math.random() * ImgList.Gay.length)
                    ImgLink = new AttachmentBuilder(ImgList.Gay[index].value)
                    ImgCtx = ImgList.Gay[index].ctx
                }
                //Special Cases
                for (var i in SpecialEntry) {
                    if (Number(avgrng) === SpecialEntry[i]) {
                        ImgLink = new AttachmentBuilder(Cases.SpecialCases[`Case${avgrng}`].img)
                        ImgCtx = Cases.SpecialCases[`Case${avgrng}`].ctx
                        Emoji = Cases.SpecialCases[`Case${avgrng}`].emoji
                        Color = Cases.Colors.SpecialCases
                        Comment = Cases.SpecialCases[`Case${avgrng}`].desc
                        break
                    }
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
                    }
                }
            }
        })
    }
}