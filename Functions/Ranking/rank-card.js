const { GetCanvas } = require('../getFont')

// Color of the "#rank" text
function RankColor(rank) {
    if (rank < 2) return '#FFDE00'
    if (rank < 3) return '#818181'
    if (rank < 4) return '#BD9000'
    if (rank <= 10) return '#FF4E4E'
    if (rank <= 50) return '#2D62FF'
    if (rank <= 100) return '#00FF30'
    return '#000000'
}

/*
Draws the rank card (934x282)
- Card: { Background, Color, ImgLink, Title } of the equipped background
- Data: { level, exp, total }, ReqExp: EXP needed for the next level
- RankingColor: color of the "#rank" text
*/
async function RankCard({ user, avatarURL, Card, Data, Rank, ReqExp, RankingColor }) {
    const Canvas = GetCanvas()
    const { Background, Color, ImgLink, Title } = Card

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
    context.fillStyle = '#000000'
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

    context.fillStyle = '#000000'
    context.globalAlpha = 0.5
    context.beginPath()
    context.roundRect(369, 20, 475, 78, [22])
    context.closePath()
    context.fill()
    context.fillStyle = Color
    context.stroke()

    context.fillStyle = '#000000'
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
    context.font = '700 23px Ubuntu'
    context.fillText(`#${Rank}`, 68, 254)

    //Detail 5 - Username + Title
    context.fillStyle = Color
    context.font = '700 30px Ubuntu'
    context.fillText(user.username, 383, 55)

    context.font = '700 17.5px Ubuntu'
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
    context.font = '700 30px Ubuntu'
    context.fillText(`${Data.level}`, 384, 208)

    //Detail 7: Ranking Progress + Exp
    context.fillStyle = '#212121'
    context.strokeStyle = Color
    context.lineWidth = 1
    context.beginPath()
    context.roundRect(428, 174, 400, 44, [0, 90, 90, 0])
    context.fill()
    context.stroke()

    const Progress = Math.min(Math.max(Data.exp / ReqExp, 0), 1)
    context.fillStyle = Color
    context.beginPath()
    context.roundRect(428, 174, Progress * 400, 44, [0, 90, 90, 0])
    context.fill()
    context.strokeStyle = '#FFFFFF'
    context.stroke()

    context.fillStyle = '#FFFFFF'
    context.textAlign = 'left'
    context.font = '700 12px Ubuntu'
    context.fillText(`Total PP • ${Data.total}`, 65, 213)

    context.textAlign = 'center'
    context.font = '700 18px Ubuntu'
    context.fillText(`[${(Data.exp / ReqExp * 100).toFixed(2)}%] ${Data.exp}/${ReqExp}`, 620, 164)

    //Detail 8 - Avatar
    context.strokeStyle = Color
    const avatar = await Canvas.loadImage(avatarURL)
    context.beginPath()
    context.roundRect(136, 9, 136, 136, [28])
    context.closePath()
    context.clip()
    context.drawImage(avatar, 136, 9, 136, 136)
    context.stroke()

    return canvas.toBuffer('image/png')
}

module.exports = { RankCard, RankColor }
