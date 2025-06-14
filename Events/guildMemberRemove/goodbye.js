const ServerData = require('../../Database/Server/memberlist')
const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const { getFonts } = require('../../Functions/getFont')
getFonts()

const Canvas = require('@napi-rs/canvas')
const FooterEmbeds = require('../../Utils/embed')

module.exports = async (client, member) => {
    const Background = './Assets/MemberLogging/goodbye.png'

    //const guild = await client.guilds.fetch('1084992874212495390')
    //if (guild.id !== '1084992874212495390') return
    const guild = await client.guilds.fetch(process.env.GUILD_ID)
    if (guild.id !== process.env.GUILD_ID) return
    const vmember = await member.user.username
    const totalmember = guild.memberCount
    console.log(vmember, totalmember)

    //const channel = await client.channels.fetch('1084992874212495393')
    const channel = await client.channels.fetch('900760471517429781')

    const uavt = member.user.avatarURL({ dynamic: true, size: 512, extension: 'png' })

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
    ctx.fillText(`Remaining: ${totalmember}`, 170, 450)

    //Date
    ctx.textAlign = 'right'
    const date = new Date()
    let date1 = date.toTimeString()
    let date2 = date.toDateString()
    date1 = date1.slice(0, 5)
    date2 = date2.split(' ')
    date2 = `${date2[2]} ${date2[1]} ${date2[3]}`
    const GeneratedDate = `${date2} | ${date1}`

    ctx.fillText(GeneratedDate, 1140, 450)

    //Overall Styles
    ctx.strokeStyle = '#ffddca'
    ctx.lineWidth = 8

    //Avt Icon
    const avt = await Canvas.loadImage(uavt)
    ctx.beginPath()
    ctx.arc(640, 440, 120, 0, 2 * Math.PI)
    ctx.closePath()

    ctx.clip()
    ctx.drawImage(avt, 520, 320, 240, 240)
    ctx.stroke()
    
    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), { name: `welcome.png` })
    const WelcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: `${vmember}`, iconURL: `${uavt}` })
        .setTitle('<:SerikaZad:1230835627080286300> **Member Just Left The Server!**')
        .setDescription(`### <:CastoriceBlush:1360457584309440563> **<@${member.user.id}> Just left the server \`${guild.name}\n> Looks like they are not slacking anymore, or just got kicked by the server's owner lmao...`)
        .setImage('attachment://welcome.png')
        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
        .setColor('#cae1ff')
        .setThumbnail(`${uavt}`)

    await channel.send({
        embeds: [WelcomeEmbed],
        files: [attachment]
    })
}
