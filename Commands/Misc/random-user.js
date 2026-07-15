const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk')

const FooterEmbeds = require('../../Utils/embed')
const Denied_Cases = require('../../Assets/Howgay/Texts/denied')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random-user')
        .setDescription('Pick a random user who aren\'t OFFLINE or BOT (with some exception)'),
    async execute(interaction) {
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        await interaction.deferReply()
        const bypassed = []
        for (var i in Denied_Cases) {
            bypassed.push(Denied_Cases[i].id)
        }

        const allMembers = await interaction.guild.members.fetch({ withPresences: true })
        const onlineMembers = allMembers.filter(member => {
            if (!member.presence) return false
            if (member.user.bot) return false
            if (bypassed.includes(member.user.id)) return false
            return member.presence.status !== 'offline'
        })

        const rng = Math.floor(Math.random() * onlineMembers.size)
        const memberIdList = onlineMembers.map(member => member.user.id)

        const targetId = memberIdList[rng]
        const rollNo = Number(Math.floor(Math.random() * 10)) + 1

        const target = await interaction.guild.members.fetch(targetId)

        const embed = new EmbedBuilder()
            .setColor('White')
            .setTitle(`<:seiaconcerned:1244128341540208793> Daily **\`/howgay\`** 'Random Victim'`)
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setDescription(`<:seiaheh:1244128244664504392> Dad! Here's your today "victim"!\n> **User:** ${target}\n> **Number of Rolls:** **\`${rollNo}\`**`)
            .setTimestamp(Date.now())
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        await interaction.editReply({
            embeds: [embed],
        })
    }
}