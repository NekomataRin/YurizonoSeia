const { ChannelType, EmbedBuilder } = require('discord.js')
const Level = require('../../Database/Leveling')
const cd = new Set()
const WhiteListedChannel = require('../../Utils/rankchannels')
const LevelCalc = require('../../Utils/lvlcalc')
const FooterEmbeds = require('../../Utils/embed')
    
module.exports = async (client, message) => {
    if (message.author.bot) return
    if (message.channel.type === ChannelType.DM || message.channel.type === ChannelType.GroupDM) return
    if (message.guild.id !== '1095653998389907468' || cd.has(message.author.id)) return
    if ((message.content.length) <= 1) return

    const iuser = await message.guild.members.fetch(message.author.id)
    const Channel = client.channels.cache.get('1152752837298765845')

    function Random(max, min) {
        return Math.floor(Math.random() * (max - min)) + min
    }

    let key = false
    for (i in WhiteListedChannel[0]) {
        if (message.channel.id === WhiteListedChannel[0][i])
            key = true
    }
    if (!key) { return }

    let xpToGive = Random(5, 1)
    let expCD = Random(15, 5) * 1000

    if (WhiteListedChannel[1].indexOf(message.channel.id) !== -1) {
        if (Date.now() < 1743724799 * 1000) {
            xpToGive = Random(15, 3)
            expCD = Random(25, 10) * 1000
        } //Event Exp Lol */
    }
    console.log(`User: ${message.author.id} | Channel: ${message.channel.id} | Exp: ${xpToGive}`)

    Level.findOne({ UserID: message.author.id, GuildID: message.guild.id }, async (err, data) => {
        if (err) throw err
        if (!data) {
            await Level.create({
                UserID: message.author.id,
                GuildID: message.guild.id,
                exp: xpToGive,
                level: 0,
                total: xpToGive,
                background: 'none',
                restrict: `Code-0`
            })
            cd.add(message.author.id)
            setTimeout(() => {
                cd.delete(message.author.id)
            }, expCD)
        } else {
            switch (data.restrict) {
                case 'Code-1':
                    {
                        return
                    }
                case 'Code-2':
                    {
                        xpToGive = Math.floor(xpToGive * 0.5)
                        break
                    }
                case 'Code-3':
                    {
                        xpToGive = Math.floor(xpToGive * 0.25)
                        break
                    }
                default:
                    {
                        xpToGive *= 1
                    }
            }

            data.exp += xpToGive
            data.total += xpToGive
            if (data.exp >= LevelCalc(data.level)) {
                data.exp -= LevelCalc(data.level)
                data.level += 1

                const LevelUpMsg = [
                    `<:SeiaPeek:1244890461592621147> Eh... looks like **${message.member}** has ~~Ascended To Heaven~~, I mean, ascended to a higher level...\n> **Current level:** \`${data.level - 1}\` >>> \`${data.level}\``,
                    `<:SeiaPeek:1244890461592621147> **${message.member}** has raised their sword, raising their level to a whole new one...\n> **Current level:** \`${data.level - 1}\` >>> \`${data.level}\``,
                    `<:seiaehem:1244129111169826829> **${message.member} Sensei**, in the past, I dreamed you level up and now, you've done it so quickly... don't give up your work, Sensei!\n> **Current level:** \`${data.level - 1}\` >>> \`${data.level}\``,
                    `<:seiaehem:1244129111169826829> Hmm... i wonder what **${message.member} Sensei** is doing right now... Ah, Sensei got level up recently, so i want to cheer Sensei then...\n> **Current level:** \`${data.level - 1}\` >>> \`${data.level}\``,
                    `<:seiaheh:1244128244664504392> **${message.member} Sensei** has successfully raised his gyatt level! Now Sensei's gyatt level is ${data.level}\n> **Current level:** \`${data.level - 1}\` >>> \`${data.level}\` `,
                    `<:SeiaPeek:1244890461592621147> Embraced by the flame **${message.member}** can not see anything right now... But the memories of their levels forever remains... They got level up to that higher level, to their top of this server, you know?\n> **Current Level:** \`${data.level - 1}\` >>> \`${data.level}\``,
                ]

                const LevelUpEmbed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setTitle(`<:seiaheh:1244128244664504392> **Ranking - Level Up**`)
                    .setAuthor({ name: `${message.author.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription(LevelUpMsg[Math.floor(Math.random() * LevelUpMsg.length)])
                    .setTimestamp()
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

                Channel.send({
                    content: `<@${message.member.id}>`,
                    embeds: [LevelUpEmbed]
                })
            }

            data.save()
            cd.add(message.author.id)
            setTimeout(() => {
                cd.delete(message.author.id)
            }, expCD)
        }
    })
}