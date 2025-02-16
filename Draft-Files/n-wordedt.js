const { EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../Utils/embed')
const WarnList = require('../Database/warnsys')
const NWordList = require('../Database/n-word')
const ProtectedRoles = require('../Utils/whitelistedrole')
const chalk = require('chalk')

module.exports = async (client, message) => {
    if (message.author.bot) return
    if (message.guild.id !== '1095653998389907468') return
   
    for (var i in ProtectedRoles) {
        const prole = await message.guild.roles.cache.get(ProtectedRoles[i])
        if (message.member.roles.cache.has(prole.id))
            return
    }
    const iuser = await message.guild.members.fetch(message.author.id)
    const Channel = client.channels.cache.get('1244996189510697043')
    let n = await message.fetch()

    const reg = /[nN][\W_]*[iI][\W_]*[gG][\W_]*[gG][\W_]*([aA]|[eE][rR])/g
    let CheckMsg1 = message.content.toLowerCase()
    let CheckMsg2 = n.content.toLowerCase()
    let detect = CheckMsg1.match(reg) || CheckMsg2.match(reg) 
    console.log(chalk.yellow('[DEBUG]'), detect)

    const reason = `N-Word abusing, according to **Rule 9** <:SeiaMuted:1244890584276008970>`

    const WarnEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setAuthor({ name: `${message.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
        .setTitle('<:seiaconcerned:1244129048494473246> • Warn')
        .setDescription(`<:seiaehem:1244129111169826829> (hmm... your actions are my concerning right now, I'll warn you because your actions violated the rules.)\n> Warned User: ${message.member}\n> Responsible Mod: <@1244213929438089286>`)
        .addFields({
            name: 'Warn Reason',
            value: reason
        })
        .setTimestamp()
        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

    const LogEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setAuthor({ name: `${message.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
        .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Warn')
        .setDescription(`<:seiaehem:1244129111169826829> Warned User: ${message.member}\n> Responsible Mod: <@1244213929438089286>`)
        .addFields({
            name: 'Warn Reason',
            value: reason
        })
        .setTimestamp()
        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

    if (!detect) return
    else {
        NWordList.findOne({ UserID: message.author.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                NWordList.create({
                    UserID: message.author.id,
                    NWords: 1
                })
                await message.channel.send({
                    content: `<:SeiaMuted:1244890584276008970> Ayo! Please chill, this is not a good thing to say then!`
                })
                await message.delete()
                return
            } else {
                data.NWords++
                data.save()
                if (data.NWords % 5 === 0) {
                    WarnList.findOne({ UserID: message.author.id }, async (err, data1) => {
                        if (err) throw err
                        if (!data1) {
                            WarnList.create({
                                UserID: message.author.id,
                                Reason: [reason]
                            })
                            await message.channel.send({
                                embeds: [WarnEmbed]
                            })
                            await Channel.send({
                                embeds: [LogEmbed]
                            })
                        } else {
                            data1.Reason.push(reason)
                            data1.save()
                            await message.channel.send({
                                embeds: [WarnEmbed]
                            })
                            await Channel.send({
                                embeds: [LogEmbed]
                            })
                        }
                    })
                    await message.delete()
                } else {
                    await message.channel.send({
                        content: `<:SeiaMuted:1244890584276008970> Ayo! Please chill, this is not a good thing to say then!`
                    })
                    await message.delete()
                    return
                }
            }
        })
    }
}