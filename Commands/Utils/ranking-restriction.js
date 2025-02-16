const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const Level = require('../../Database/Leveling')
const FooterEmbeds = require('../../Utils/embed')
const BotOwner = require('../../Utils/owners')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking-restriction')
        .setDescription('-Owner Only- Restrict a user from getting some aspect from the ranking system')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to restrict')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('restrict-code')
                .setDescription('The Restriction Code for that user, with detail explanation')
                .addChoices(
                    {
                        name: '[Code-0] - No Restrictions',
                        value: 'Code-0'
                    },
                    {
                        name: '[Code-1] - No Exp',
                        value: 'Code-1'
                    },
                    {
                        name: `[Code-2] - 50% Exp`,
                        value: `Code-2`
                    },
                    {
                        name: `[Code-3] - 25% Exp`,
                        value: `Code-3`
                    },
                )
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const user = await interaction.options.getUser('user')
        const restrict_key = await interaction.options.getString('restrict-code')

        let key = false
        for (var i in BotOwner) {
            if (interaction.user.id === BotOwner[i]) {
                key = true
                break
            }
        }

        if (!key) {
            const NoPerm = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • No permissions')
                .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [NoPerm]
            })
        } else {
            Level.findOne({ GuildID: interaction.guild.id, UserID: user.id }, async (err, data) => {
                if (err) throw err
                if (!data) return
                else {
                    data.restrict = restrict_key
                    if (['Code-1', 'Code-2', 'Code-3'].includes(restrict_key)) {
                        const RestrictEmbed = new EmbedBuilder()
                            .setColor('Red')
                            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                            .setTitle('<:seiaconcerned:1244129048494473246> • Ranking Restricted!')
                            .setDescription(`<:seiaehem:1244129111169826829> • User: ${user} | Restrict Key: ${restrict_key}`)
                            .setTimestamp()
                            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                        await interaction.editReply({
                            embeds: [RestrictEmbed]
                        })
                    } else if (restrict_key === 'Code-0') {
                        const UnrestrictEmbed = new EmbedBuilder()
                            .setColor('Green')
                            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                            .setTitle('<:seiaconcerned:1244129048494473246> • Ranking Unrestricted!')
                            .setDescription(`<:seiaehem:1244129111169826829> • User: ${user} | Restrict Key: ${restrict_key}`)
                            .setTimestamp()
                            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                        await interaction.editReply({
                            embeds: [UnrestrictEmbed]
                        })
                    }

                    data.save()
                }
            })
        }
    }
}