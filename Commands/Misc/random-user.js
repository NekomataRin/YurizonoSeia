const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed, AvatarOf } = require('../../Utils/embed')
const Rejected = require('../../Assets/Howgay/rejected')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random-user')
        .setDescription('Pick a random user who aren\'t OFFLINE or BOT (with some exception)'),

    async execute(interaction) {
        await interaction.deferReply()

        const allMembers = await interaction.guild.members.fetch({ withPresences: true })
        const onlineMembers = allMembers.filter(member =>
            member.presence && member.presence.status !== 'offline' && !member.user.bot && !Rejected[member.user.id]
        )

        if (onlineMembers.size === 0) {
            return interaction.editReply('<:seiaconcerned:1244128341540208793> Hmm... nobody is online right now, Dad. Try again later!')
        }

        const target = onlineMembers.random()
        const rollNo = Math.floor(Math.random() * 10) + 1

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(`<:seiaconcerned:1244128341540208793> Daily **\`/howgay\`** 'Random Victim'`)
                .setDescription(`<:seiaheh:1244128244664504392> Dad! Here's your today "victim"!\n> **User:** ${target}\n> **Number of Rolls:** **\`${rollNo}\`**`)
                .setThumbnail(AvatarOf(target))]
        })
    }
}
