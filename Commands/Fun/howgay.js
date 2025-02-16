const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const Denied_Cases = require('../../Assets/Howgay/Texts/denied')
const ImgArr = require('../../Assets/Howgay/CaseImg/_imgarr')
const Cases = require('../../Assets/Howgay/Texts/normalcases')
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
        const AvgChr = await interaction.options.getBoolean('avg') || false
        const NumEntry = [10, 25, 50, 75, 90, 100, 101]
        const SpecialEntry = [40.3, 40.4, 63.0, 72.7, 91.1, 99.9]

        let Desc, Color, RunKey, ImgLink, ImgCtx
        //Bypassed Cases
        for (var i in Denied_Cases[0]) {
            if (target.id === Denied_Cases[0][i]) {
                RunKey = 'Denied'
                break
            }
        }

        if (RunKey === 'Denied') {
            Color = Cases[0][7]
            if (target.id === Denied_Cases[0][0]) {
                ImgLink = new AttachmentBuilder(ImgArr[0][0])
                ImgCtx = ImgArr[1][0]
                Desc = Denied_Cases[1][0]
            } else {
                ImgLink = new AttachmentBuilder(ImgArr[0][1])
                ImgCtx = ImgArr[1][1]
            }
            for (var i = 1; i < Denied_Cases[0].length; i++) {
                if (target.id === Denied_Cases[0][i]) {
                    Desc = Denied_Cases[1][i]
                    break
                }
            }

            if (target.bot && target.id !== '1244213929438089286') {
                Desc = `<a:YaeSlap:1251733720600412240> Oi, you can't check \`/howgay\` command on a bot! (${target}), please go check someone else!`
                ImgLink = new AttachmentBuilder(ImgArr[0][1])
                ImgCtx = ImgArr[1][1]
            }
            switch (target.id) {
                case '751225225047179324':
                    {
                        ImgLink = new AttachmentBuilder(ImgArr[0][0])
                        ImgCtx = ImgArr[1][0]
                        break
                    }
                case '879893732302921738':
                    {
                        ImgLink = new AttachmentBuilder(ImgArr[2][5])
                        ImgCtx = ImgArr[3][5]
                        break
                    }
            }

            const DeniedEmbed = new EmbedBuilder()
                .setColor(Color)
                .setTitle(`🏳️‍🌈 Checking gayness of a user`)
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
                    if (rng <= NumEntry[i]) {
                        Color = Cases[0][i]
                        Emoji = Cases[3][i]
                        ImgLink = new AttachmentBuilder(ImgArr[0][2])
                        ImgCtx = ImgArr[1][2]
                        Comment = Cases[1][i][Math.floor(Math.random() * Cases[1][i].length)]
                        break
                    }
                }
                if (rng <= 10) {
                    ImgLink = new AttachmentBuilder(ImgArr[0][3])
                    ImgCtx = ImgArr[1][3]
                }
                if (rng > 100) {
                    ImgLink = new AttachmentBuilder(ImgArr[0][4])
                    ImgCtx = ImgArr[1][4]
                }
                //Special Cases
                for (var i in SpecialEntry) {
                    if (Number(rng) === SpecialEntry[i]) {
                        ImgLink = new AttachmentBuilder(ImgArr[2][i])
                        ImgCtx = ImgArr[3][i]
                        Emoji = Cases[4][i]
                        Color = Cases[0][7]
                        Comment = Cases[2][i]
                        break
                    }
                }

                DescArr.push(`## ${Emoji} - The gayness of ${target} is \`${rng}%\`\n> Comments: ${Comment}`)

                GayEmbeds[0] = new EmbedBuilder()
                    .setColor(Color)
                    .setTitle(`🏳️‍🌈 Checking gayness of a user`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription(DescArr[0])
                    .setTimestamp()
                    .setImage(ImgCtx)
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            } else {
                let avgrng = 0, rnglist = []
                for (var i = 0; i < 3; i++) {
                    let temp = Math.random() * 101.1
                    temp = (Math.floor(temp * 10) / 10).toFixed(1)
                    rnglist.push(temp)
                    DescArr.push(`- **Attempt ${i + 1}:** The gayness of ${target} is \`${rnglist[i]}%\`\n`)
                    avgrng += Number(rnglist[i])
                }

                avgrng /= 3
                avgrng = (Math.floor(avgrng * 10) / 10).toFixed(1)
                //avgrng = 72.7 //Tesing Purposes, Only Removed When You Do That
                for (var i in NumEntry) {
                    if (avgrng <= NumEntry[i]) {
                        Color = Cases[0][i]
                        Emoji = Cases[3][i]
                        ImgLink = new AttachmentBuilder(ImgArr[0][2])
                        ImgCtx = ImgArr[1][2]
                        Comment = Cases[1][i][Math.floor(Math.random() * Cases[1][i].length)]
                        break
                    }
                }
                if (avgrng <= 10) {
                    ImgLink = new AttachmentBuilder(ImgArr[0][3])
                    ImgCtx = ImgArr[1][3]
                }
                if (avgrng > 100) {
                    ImgLink = new AttachmentBuilder(ImgArr[0][4])
                    ImgCtx = ImgArr[1][4]
                }
                //Special Cases
                for (var i in SpecialEntry) {
                    if (Number(avgrng) === SpecialEntry[i]) {
                        ImgLink = new AttachmentBuilder(ImgArr[2][i])
                        ImgCtx = ImgArr[3][i]
                        Emoji = Cases[4][i]
                        Color = Cases[0][7]
                        Comment = Cases[2][i]
                        break
                    }
                }

                DescArr.push(`## ${Emoji} - The calculated gayness of ${target} is \`${avgrng}%\`\n> Comments: ${Comment}`)
                let OfficialDesc = ''
                for (var i = 0; i < 3; i++) {
                    OfficialDesc += DescArr[i]
                    GayEmbeds[i] = new EmbedBuilder()
                        .setColor('White')
                        .setTitle(`🏳️‍🌈 Checking gayness of a user`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(OfficialDesc)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                }

                OfficialDesc += DescArr[3]
                GayEmbeds[3] = new EmbedBuilder()
                    .setColor(Color)
                    .setTitle(`🏳️‍🌈 Checking gayness of a user`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription(OfficialDesc)
                    .setTimestamp()
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
                        .setDescription(` <:seiaconcerned:1244129048494473246> | ${interaction.user} Sensei! Can you please stop doing that command again? I'm exhausted, I can take a rest too, you know? I'm not some sort of a real robot who can repeatedly do this for you!`)
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