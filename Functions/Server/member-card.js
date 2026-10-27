const { GetCanvas } = require('../getFont')

// Welcome / Welcome back / Goodbye image (1280x960)
// Label: text above the date line, e.g. 'Member no. 123' or 'Remaining: 122'
async function MemberCard({ user, Background, Label, StrokeColor }) {
    const Canvas = GetCanvas()
    const vmember = user.username

    //Canvas Size
    const canvas = Canvas.createCanvas(1280, 960)
    const ctx = canvas.getContext('2d')

    //Background
    const background = await Canvas.loadImage(Background)
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    //Username
    ctx.fillStyle = '#ffffff'
    ctx.lineWidth = 2

    let px = (vmember.length <= 20) ? 35 : 35 * Number(20 / vmember.length)
    ctx.font = `700 ${px}px Ubuntu`
    ctx.textAlign = 'center'
    ctx.fillText(vmember, 640, 720)

    //Member Count
    ctx.textAlign = 'left'
    ctx.font = `700 27px Ubuntu`
    ctx.fillText(Label, 170, 450)

    //Date (dd Mon yyyy | hh:mm)
    ctx.textAlign = 'right'
    const date = new Date()
    const [, Mon, dd, yyyy] = date.toDateString().split(' ')
    ctx.fillText(`${dd} ${Mon} ${yyyy} | ${date.toTimeString().slice(0, 5)}`, 1140, 450)

    //Overall Styles
    ctx.strokeStyle = StrokeColor
    ctx.lineWidth = 8

    //Avt Icon (static png, so animated avatars still work)
    const avt = await Canvas.loadImage(user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 512 }))
    ctx.beginPath()
    ctx.arc(640, 440, 120, 0, 2 * Math.PI)
    ctx.closePath()

    ctx.clip()
    ctx.drawImage(avt, 520, 320, 240, 240)
    ctx.stroke()

    return canvas.toBuffer('image/png')
}

module.exports = { MemberCard }
