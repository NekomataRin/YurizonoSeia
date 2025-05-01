const { request } = require('undici')
const { AttachmentBuilder } = require('discord.js')
const Canvas = require('@napi-rs/canvas')
const { getFonts } = require('../../getFont')
const BannerObj = require('../../../Assets/DroidRx/Texts/dr-banner')
getFonts()

const GetDroidRxUser = async (uid, key, discordid, bindedkey) => {
    const url = `https://v4rx.me/api/get_user/?id=${uid}`
    const Check = await request(url)
    const Result = await Check.body.json()

    if (['error'].includes(Object.keys(Result)[0])) return false
    let Background = BannerObj[key].image, Color = BannerObj[key].color, DiscordUser = discordid

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

    const RankingColor = Ranking_Level(Result.stats.rank)

    //RankCard Size
    const canvas = Canvas.createCanvas(934, 282)
    const ctx = canvas.getContext('2d')

    //RankCard Background
    const background = await Canvas.loadImage(Background)
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    //Detail 1 - Frame 1
    ctx.strokeStyle = Color
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    //Detail 2 - Fill Frame 1 
    ctx.globalAlpha = 0.5
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(17, 282)
    ctx.lineTo(132, 0)
    ctx.lineTo(345, 0)
    ctx.lineTo(229, 282)
    ctx.lineTo(17, 282)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = Color
    ctx.lineWidth = 4
    ctx.stroke()

    ctx.fillStyle = '#B7B7B7'
    ctx.globalAlpha = 0.85
    ctx.beginPath()
    ctx.roundRect(56, 222, 164, 47, [22])
    ctx.fill()
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = '#000000'
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.roundRect(369, 20, 475, 78, [22])
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = Color
    ctx.stroke()

    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.roundRect(326, 130, 517, 125, [30])
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = Color
    ctx.stroke()

    //Detail 3 - Ranking Level
    ctx.globalAlpha = 1.0
    ctx.fillStyle = RankingColor
    ctx.textAlign = 'left'
    ctx.font = '700 23px Ubuntu'
    ctx.fillText(`#${Result.stats.rank}`, 68, 254)

    //Detail 4 - Username - UserID
    ctx.fillStyle = Color
    ctx.font = '700 30px Ubuntu'
    ctx.fillText(Result.name, 383, 55)
    ctx.font = '700 18px Ubuntu'
    ctx.fillText(`User ID: ${Result.id}`, 383, 85)

    //Detail 5 - Result Details
    function fillMixedText(args, x, y, spacing) {
        let DefaultSpacing = 25
        let DefaultStyle = ctx.fillStyle = '#ffffff'
        let DefaultFont = ctx.font = 'normal 400 25px Ubuntu'
        const default_x = x
        ctx.save()
        args.forEach(({ text, fillStyle, font, endl }) => {
            ctx.fillStyle = fillStyle || DefaultStyle
            ctx.font = font || DefaultFont
            ctx.fillText(text, x, y)
            if (endl) {
                y += spacing || DefaultSpacing
                x = default_x
            } else {
                x += ctx.measureText(text).width
            }
        })
    }

    const UserDataDetails = [
        { text: 'Total PP: ', fillStyle: Color, font: '700 18px Ubuntu', endl: false },
        { text: `${Result.stats.pp}`, fillStyle: '#ffffff', font: '400 18px Ubuntu', endl: true },
        { text: 'Accuracy: ', fillStyle: Color, font: '700 18px Ubuntu', endl: false },
        { text: `${Result.stats.accuracy.toFixed(2)}%`, fillStyle: '#ffffff', font: '400 18px Ubuntu', endl: true },
        { text: 'Plays: ', fillStyle: Color, font: '700 18px Ubuntu', endl: false },
        { text: `${Result.stats.plays}`, fillStyle: '#ffffff', font: '400 18px Ubuntu', endl: true },
        { text: 'Ranked | Total Score: ', fillStyle: Color, font: '700 18px Ubuntu', endl: false },
        { text: `${Result.stats.ranked_score} | ${Result.stats.total_score}`, fillStyle: '#ffffff', font: '400 18px Ubuntu', endl: true }
    ]

    fillMixedText(UserDataDetails, 342, 160)

    //Detail 6 - Avatar
    const AvtUrl = `https://v4rx.me/user/avatar/${Result.id}.png/`
    let Status = false
    const { headers } = await request(AvtUrl)
    Status = (headers['content-type'] === 'image/png')
    ctx.strokeStyle = Color
    const avatar = await Canvas.loadImage(Status ? AvtUrl : './Assets/DroidRx/Images/Constants/pfp-default.png')
    ctx.beginPath()
    ctx.roundRect(136, 9, 136, 136, [28])
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, 136, 9, 136, 136)
    ctx.stroke()

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), { name: `rank.png` })

    return {
        UserInfo: Result,
        Image: attachment,
        Ctx: 'attachment://rank.png',
        BindedTo: (!bindedkey) ? '***`-Currently Not Binded-`***' : `<@${DiscordUser}>`,
        Color: Color
    }
}

module.exports = { GetDroidRxUser }