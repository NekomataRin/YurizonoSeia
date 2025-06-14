const ServerData = require('../../Database/Server/memberlist')
const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const { getFonts } = require('../../Functions/getFont')
getFonts()

const Canvas = require('@napi-rs/canvas')
const FooterEmbeds = require('../../Utils/embed')

module.exports = async (client, member) => {
    const ImageList = {
        welcome: './Assets/MemberLogging/welcome.png',
        welcome_back: './Assets/MemberLogging/welcomeback.png'
    }

    //const guild = await client.guilds.fetch('1084992874212495390')
    //if (guild.id !== '1084992874212495390') return
    const guild = await client.guilds.fetch(process.env.GUILD_ID)
    if (guild.id !== process.env.GUILD_ID) return
    const vmember = member.user.username
    const totalmember = guild.memberCount
    console.log(vmember, totalmember)

    //const channel = await client.channels.fetch('1084992874212495393')
    const channel = await client.channels.fetch('1383346586087719003')

    let checkkey = false
    let key = await ServerData.findOne({ GuildID: process.env.GUILD_ID }).select('-_id MemberList')
    for (var i in key.MemberList) {
        if (key.MemberList[i].UserId === member.user.id) {
            checkkey = true
            break
        }
    }

    if (!checkkey) {
        ServerData.findOne({ GuildID: process.env.GUILD_ID }, async (err, data) => {
            if (err) throw err
            if (data) {
                const arr = data.MemberList
                data.MemberList = []
                console.log(member.user.bot)
                if(!member.user.bot)
                    arr.push({ UserId: member.user.id, joined: true })
                arr.forEach(e => data.MemberList.push(e))
                data.save()
            }
        })
    }

    let imagekey = (checkkey) ? 'welcome_back' : 'welcome'
    const Background = ImageList[imagekey]

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
    ctx.fillText(`Member no. ${totalmember}`, 170, 450)

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
    ctx.strokeStyle = '#cae1ff'
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

    const title = (!checkkey) ? `<:MomoiHug:1255720676149428316> **Welcome To The Server!**` : `<:CastoriceSip:1360440195966570701> **Welcome Back To The Server!**`
    const desc = (!checkkey) ? `**Welcome <@${member.user.id}> to server \`${guild.name}\`**` : `**Welcome back <@${member.user.id}> to server \`${guild.name}\`**`
    const WelcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: `${vmember}`, iconURL: `${uavt}` })
        .setTitle(`${title}`)
        .setDescription(`### ${desc}\n\n▸ <:NagisaTea:1245235614274555914> Please enjoy your stay at the server! (Although it is already dead, hehe...)`)
        .setImage('attachment://welcome.png')
        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
        .setColor('#cae1ff')
        .setThumbnail(`${uavt}`)

    await channel.send({
        embeds: [WelcomeEmbed],
        files: [attachment]
    })
}
