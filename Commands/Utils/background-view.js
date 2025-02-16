const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const UserCards = require('../../Database/usercards')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('background-view')
        .setDescription('View a user\'s Rank Card list')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User you want to see the list')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const user = await interaction.options.getUser('user') || interaction.user
        
        UserCards.findOne({ UserID: user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                const NoData = new EmbedBuilder()
                    .setColor('DarkGreen')
                    .setTitle(`<:seiaconcerned:1244129048494473246> **No data provided**`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription(`<:seiaehem:1244129111169826829> Unfortunately, ${user} has no rank cards other than \`none\`, heh...`)
                    .setTimestamp()
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                await interaction.editReply({
                    embeds: [NoData]
                })
            } else {
                const Cards = data.Cards
                let n = ''
                for (var i in Cards) {
                    n += `\`${Cards[i]}\`, `
                }
                const ViewKey = new EmbedBuilder()
                    .setColor('DarkGreen')
                    .setTitle(`<:seiaconcerned:1244129048494473246> **Rank Cards Data**`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription(`<:seiaehem:1244129111169826829> Rank Card List Of User: ${user}\nRank Cards: \`none\`, ${n}`)
                    .setTimestamp()
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                await interaction.editReply({
                    embeds: [ViewKey]
                })
            }
        })
    }
}