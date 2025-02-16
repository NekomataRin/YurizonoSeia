const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js')
const chalk = require('chalk')

const Canvas = require('@napi-rs/canvas')
const Level = require('../../Database/Leveling')
const cdSchema = require('../../Database/cooldown')
const LvlCalc = require('../../Utils/lvlcalc')
const RankingArr = require('../../Assets/RankCards/rankcardarr')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check a user\'s rank, or your rank in the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User where you want to check the ranking')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply()

        const cdtime = 10000
        var user = interaction.options.getUser('user') || interaction.user

        const user_ = await interaction.guild.members.fetch(user.id)
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        let key
        let RankKey = await Level.findOne({ UserID: user.id }).select('-_id background')
        if (!RankKey) {
            key = 'none'
        } else {
            key = RankKey.background
        }

        var Background, Color, ImgLink, Emoji, Title
        for (var i in RankingArr) {
            if (key === RankingArr[i][0]) {
                Background = RankingArr[i][1]
                Color = RankingArr[i][2]
                ImgLink = RankingArr[i][3]
                Emoji = RankingArr[i][4]
                Title = RankingArr[i][5]
                break
            }
            Background = RankingArr[0][1]
            Color = RankingArr[0][2]
            ImgLink = RankingArr[0][3]
            Emoji = RankingArr[0][4]
            Title = RankingArr[0][5]
        }

        const FetchedLevel = await Level.findOne({
            UserID: user.id,
            GuildID: interaction.guild.id
        })

        if (!FetchedLevel) {
            const NoData = new EmbedBuilder()
                .setColor('DarkGreen')
                .setTitle(`<:seiaconcerned:1244129048494473246> **No ranking data provided**`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`<:seiaehem:1244129111169826829> Unfortunately, ${user} has no ranking data, please try again later...`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [NoData]
            })
            return
        }

        let AllLevels = await Level.find({ GuildID: interaction.guild.id }).select('-_id UserID total retrict')
        AllLevels.sort((a, b) => {
            if (Number(a.total) < Number(b.total)) return 1
            if (Number(a.total) > Number(b.total)) return -1
            return 0
        })

        let CurrentRank = AllLevels.findIndex((lvl) => lvl.UserID === user.id) + 1
        let RestrictKey = await Level.findOne({ GuildID: interaction.guild.id, UserID: user.id }).select('-_id restrict')

        function Ranking_Level(CurrentRank) {
            var RankColor
            if (CurrentRank < 2) {
                RankColor = '#FFDE00'
            } else if (CurrentRank < 3) {
                RankColor = '#818181'
            } else if (CurrentRank < 4) {
                RankColor = '#BD9000'
            } else if (CurrentRank <= 10) {
                RankColor = '#FF4E4E'
            } else if (CurrentRank <= 50) {
                RankColor = '#2D62FF'
            } else if (CurrentRank <= 100) {
                RankColor = '#00FF30'
            } else {
                RankColor = '#000000'
            }
            return RankColor
        }

        let ReqExp = LvlCalc(FetchedLevel.level)
        let RankingColor = (RestrictKey.restrict === 'Code-1') ? '#000000' : Ranking_Level(CurrentRank)
        if (RestrictKey.restrict === 'Code-1') {
            Background = RankingArr[0][1]
            ImgLink = RankingArr[0][3]
            Emoji = RankingArr[0][4]
            Color = '#000000' 
            Title = `Restricted: ${RestrictKey.restrict}`
        }
        if (RestrictKey.restrict === 'Code-2') {
            Color = '#abad03'
            RankingColor = '#abad03' 
            Title = `Restricted: ${RestrictKey.restrict}`
        }

        if (RestrictKey.restrict === 'Code-3') {
            Color = '#ad0303'
            RankingColor = '#ad0303'
            Title = `Restricted: ${RestrictKey.restrict}`
        }

        //RankCard Size
        const canvas = Canvas.createCanvas(934, 282)
        const context = canvas.getContext('2d')

        //RankCard Background
        const background = await Canvas.loadImage(Background)
        context.drawImage(background, 0, 0, canvas.width, canvas.height)

        //Detail 1 - Frame 1
        context.strokeStyle = Color
        context.strokeRect(0, 0, canvas.width, canvas.height)

        //Detail 2 - Fill Frame 1 
        context.globalAlpha = 0.5
        context.fillStyle = '#4F4F4F'
        context.beginPath()
        context.moveTo(17, 282)
        context.lineTo(132, 0)
        context.lineTo(345, 0)
        context.lineTo(229, 282)
        context.lineTo(17, 282)
        context.closePath()
        context.fill()

        context.fillStyle = Color
        context.lineWidth = 4
        context.stroke()

        context.fillStyle = '#B7B7B7'
        context.globalAlpha = 0.85
        context.beginPath()
        context.roundRect(56, 222, 164, 47, [22])
        context.fill()
        context.closePath()
        context.stroke()

        context.fillStyle = '#4F4F4F'
        context.globalAlpha = 0.5
        context.beginPath()
        context.roundRect(369, 20, 475, 78, [22])
        context.closePath()
        context.fill()
        context.fillStyle = Color
        context.stroke()

        context.fillStyle = '#4F4F4F'
        context.beginPath()
        context.roundRect(326, 130, 517, 125, [30])
        context.closePath()
        context.fill()
        context.fillStyle = Color
        context.stroke()

        //Detail 3 - Icon
        context.globalAlpha = 1.0
        const iconimg = await Canvas.loadImage(ImgLink)
        context.drawImage(iconimg, 197, 200, 38, 38)

        //Detail 4 - Ranking Level
        context.globalAlpha = 1.0
        context.fillStyle = RankingColor
        context.textAlign = 'left'
        context.font = 'bold 23px Ubuntu'
        const ranktxt = `#${CurrentRank}`
        context.fillText(ranktxt, 68, 254)

        //Detail 5 - Username + Title
        context.fillStyle = Color
        context.font = 'bold 30px Ubuntu'
        context.fillText(user.username, 383, 55)

        context.font = 'bold 20px Ubuntu'
        context.fillText(Title, 382, 85)
        //Detail 6: Hexagon Level Lol
        context.beginPath()
        context.moveTo(346, 174)
        context.lineTo(384, 152)
        context.lineTo(422, 174)
        context.lineTo(422, 218)
        context.lineTo(384, 240)
        context.lineTo(346, 218)
        context.lineTo(346, 174)
        context.closePath()
        context.lineWidth = 6
        context.stroke()
        context.fillStyle = '#707070'
        context.fill()
        context.textAlign = 'center'
        context.fillStyle = '#FFFFFF'
        context.font = 'bold 30px Ubuntu'
        const lvltxt = `${FetchedLevel.level}`
        context.fillText(lvltxt, 384, 208)

        //Detail 7: Ranking Progress + Exp
        context.fillStyle = '#212121'
        context.strokeStyle = Color
        context.lineWidth = 1
        context.beginPath()
        context.roundRect(428, 174, 400, 44, [0, 90, 90, 0])
        context.fill()
        context.stroke()

        context.fillStyle = Color
        context.beginPath()
        const NewWidth = FetchedLevel.exp / ReqExp
        NewWidth.toFixed(2)
        context.roundRect(428, 174, NewWidth * 400, 44, [0, 90, 90, 0])
        context.fill()
        context.strokeStyle = '#FFFFFF'
        context.stroke()

        context.fillStyle = '#FFFFFF'
        context.textAlign = 'left'
        context.font = 'bold 12px Ubuntu'
        const totalexp = `Total PP • ${FetchedLevel.total}`
        context.fillText(totalexp, 65, 213)

        context.textAlign = 'center'
        context.font = 'bold 18px Ubuntu'
        const Progressnum = FetchedLevel.exp / ReqExp * 100
        const Progress = `${Progressnum.toFixed(2)}%`
        const Progresstxt = `[${Progress}] ${FetchedLevel.exp}/${ReqExp}`
        context.fillText(Progresstxt, 620, 164)

        //Detail 8 - Avatar

        context.strokeStyle = Color
        const avatar = await Canvas.loadImage(user_.displayAvatarURL({ extension: 'jpg' }))
        context.beginPath()
        context.roundRect(136, 9, 136, 136, [28])
        context.closePath()
        context.clip()
        context.drawImage(avatar, 136, 9, 136, 136)
        context.stroke()

        const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), { name: `${user.id}-rank.png` })

        cdSchema.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                cdSchema.create({
                    UserID: interaction.user.id,
                    Rank: Date.now()
                })
                await interaction.editReply('<:seiaconcerned:1244129048494473246> Well, since you haven\'t in cooldown database yet... now you can try again')

            } else {
                const cduser = data.UserID
                const CDTime = data.Rank
                console.log(chalk.yellow('[Command: Rank]') + ` ${cduser}, ${CDTime}, ${Date.now()}`)

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
                    data.Rank = Date.now() + cdtime
                    data.save()

                    let desc = `[${Emoji}] ${user}'s Ranking`
                    if (['Code-1', 'Code-2', 'Code-3'].includes(RestrictKey.restrict)) {
                        desc += `\n==THIS USER HAS BEEN RESTRICTED [${RestrictKey.restrict}]==`
                    }

                    const RankEmbed = new EmbedBuilder()
                        .setColor(Color)
                        .setTitle(`**Server Ranking**`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(desc)
                        .setTimestamp()
                        .setImage(`attachment://${user.id}-rank.png`)
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

                    await interaction.editReply({
                        embeds: [RankEmbed],
                        files: [attachment]
                    })
                }
            }
        })
    }
}