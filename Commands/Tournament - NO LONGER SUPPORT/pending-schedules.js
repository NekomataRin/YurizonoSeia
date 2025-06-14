const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const FooterEmbeds = require('../../Utils/embed')
const PendingMatches = require('../../Database/Tournaments/pending-matches')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pending-matches')
        .setDescription('-Referee Only- Show the list of pending matches available'),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        return editReply('This command is NO LONGER Supported, Sorry!')

        const RefereeList = await interaction.guild.roles.cache.get('1240650723860156466').members.map(m => m.user.id)

        const usekey = (RefereeList.indexOf(interaction.user.id) !== -1) ? true : false

        if (!usekey) {
            const NoPerm = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • No permissions')
                .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [NoPerm]
            })
        } else {
            PendingMatches.findOne({ GuildID: interaction.guild.id }, async (err, data) => {
                if (err) throw err
                if (!data) return
                else {
                    let Matches = data.Matches
                    let MatchDesc = (Matches.length === 0) ? 'Currently, there\'s no pending matches available, please try again later!\n\n' : 'Here are the list of pending matches, please take a look!\n\n'
                    if (Matches.length > 0) {
                        for (var i in Matches) {
                            MatchDesc += `> Match ${Number(i) + 1}\n**Match Name:** \`${Matches[i][0]}\`\n**Players:** <@${Matches[i][1]}> - <@${Matches[i][2]}>\n**Scheduled Time:** <t:${Matches[i][3]}> (<t:${Matches[i][3]}:R>)\n\n`
                        }
                    }

                    const PendingMatchesEmbed = new EmbedBuilder()
                        .setColor('Blue')
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setTitle('<:seiaconcerned:1244129048494473246> • Pending Matches List')
                        .setDescription(`<:seiaehem:1244129111169826829> • ${MatchDesc}`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({
                        embeds: [PendingMatchesEmbed]
                    })
                }
            })
        }
    }
}