const { Footer } = require('../../Utils/embed')
const { EmbedBuilder } = require('discord.js')
const Level = require('../../Database/Ranking/Leveling')
const { ReqExp } = require('../../Utils/Ranking/lvlcalc')
const { Guilds, Exp, Restrictions } = require('../../Utils/Ranking/guilds')
const { GivesExp } = require('../../Functions/Ranking/exp-channels')
const { UpdateRankRoles } = require('../../Functions/Ranking/rank-roles')
const Clock = require('../../Utils/clock')

// guildId-userId of people who just got EXP (each message can't give EXP before this runs out)
const cd = new Set()

// min <= result < max
function Random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

module.exports = async (client, message) => {
    if (message.author.bot || !message.inGuild()) return
    if ((message.content.length) <= 1) return

    //Only some categories / channels give EXP (Utils/Ranking/guilds.js)
    const GuildConfig = Guilds[message.guild.id]
    if (!GuildConfig || !GivesExp(message.channel, GuildConfig)) return

    const cdKey = `${message.guild.id}-${message.author.id}`
    if (cd.has(cdKey)) return

    //Event EXP lol
    const Rates = (Clock.Now() < Exp.Event.End * 1000) ? Exp.Event : Exp.Normal
    let xpToGive = Random(...Rates.Exp)
    const expCD = Random(...Rates.Cooldown) * 1000

    //Cooldown starts right away, so 2 fast messages can't both give EXP
    cd.add(cdKey)
    setTimeout(() => cd.delete(cdKey), expCD)

    const data = await Level.findOne({ GuildID: message.guild.id, UserID: message.author.id })
    if (!data) {
        await Level.create({
            UserID: message.author.id,
            GuildID: message.guild.id,
            exp: xpToGive,
            level: 0,
            total: xpToGive,
            background: 'none',
            restrict: 'Code-0'
        })
        return
    }

    xpToGive = Math.floor(xpToGive * (Restrictions[data.restrict] ?? 1))
    if (xpToGive <= 0) return

    data.exp += xpToGive
    data.total += xpToGive

    const oldLevel = data.level
    while (data.exp >= ReqExp(data.level)) {
        data.exp -= ReqExp(data.level)
        data.level += 1
    }
    await data.save()

    //Milestone roles (main server) -> "> Granted @user role - @role" lines
    const Granted = await UpdateRankRoles(message.member, data)
    const GrantedNotes = Granted.map(id => `\n> Granted ${message.member} role - <@&${id}>`).join('')
    if (data.level === oldLevel && !GrantedNotes) return

    const Channel = client.channels.cache.get(GuildConfig.LevelUpChannel) || message.channel

    //New role without a level up (10000 total EXP, or a role they should already have)
    if (data.level === oldLevel) {
        const RoleEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle(`<:seiaheh:1244128244664504392> **Ranking - New Role**`)
            .setAuthor({ name: message.author.username, iconURL: (message.member || message.author).displayAvatarURL({ size: 512 }) })
            .setDescription(`<:SeiaPeek:1244890461592621147> **${message.member}** reached a new ranking milestone!${GrantedNotes}`)
            .setTimestamp()
            .setFooter(Footer())
        return Channel.send({ content: `<@${message.author.id}>`, embeds: [RoleEmbed] })
    }

    //Level up message
    const LevelUpMsg = [
        `<:SeiaPeek:1244890461592621147> Eh... looks like **${message.member}** has ~~Ascended To Heaven~~, I mean, ascended to a higher level...\n> **Current level:** \`${oldLevel}\` >>> \`${data.level}\``,
        `<:SeiaPeek:1244890461592621147> **${message.member}** has raised their sword, raising their level to a whole new one...\n> **Current level:** \`${oldLevel}\` >>> \`${data.level}\``,
        `<:seiaehem:1244128370669650060> **${message.member} Sensei**, in the past, I dreamed you level up and now, you've done it so quickly... don't give up your work, Sensei!\n> **Current level:** \`${oldLevel}\` >>> \`${data.level}\``,
        `<:seiaehem:1244128370669650060> Hmm... i wonder what **${message.member} Sensei** is doing right now... Ah, Sensei got level up recently, so i want to cheer Sensei then...\n> **Current level:** \`${oldLevel}\` >>> \`${data.level}\``,
        `<:seiaheh:1244128244664504392> **${message.member} Sensei** has successfully raised his gyatt level! Now Sensei's gyatt level is ${data.level}\n> **Current level:** \`${oldLevel}\` >>> \`${data.level}\` `,
        `<:SeiaPeek:1244890461592621147> Embraced by the flame **${message.member}** can not see anything right now... But the memories of their levels forever remains... They got level up to that higher level, to their top of this server, you know?\n> **Current Level:** \`${oldLevel}\` >>> \`${data.level}\``,
    ]

    const LevelUpEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle(`<:seiaheh:1244128244664504392> **Ranking - Level Up**`)
        .setAuthor({ name: message.author.username, iconURL: (message.member || message.author).displayAvatarURL({ size: 512 }) })
        .setDescription(LevelUpMsg[Math.floor(Math.random() * LevelUpMsg.length)] + GrantedNotes)
        .setTimestamp()
        .setFooter(Footer())

    await Channel.send({ content: `<@${message.author.id}>`, embeds: [LevelUpEmbed] })
}
