const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const WarnList = require('../../Database/warnsys')
const ProtectedRoles = require('../../Utils/whitelistedrole')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-warn')
        .setDescription('-Mod Only- Delete a warn case for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to delete their warning')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('pos')
                .setDescription('The position of warning you want to delete')
                .setMinValue(1)
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const target = interaction.options.getUser('user')
        const pos = interaction.options.getInteger('pos')

        const member = await interaction.guild.members.fetch(target.id)
        const usemem = await interaction.guild.members.fetch(interaction.user.id)
        const logchannel = await interaction.guild.channels.fetch('1244996189510697043')
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        var usingkey = false
        if (usemem.roles.cache.has('1244608723737903165')) {
            usingkey = true
        }

        const NoPerm = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • No permissions')
            .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const ErrDel = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Delete Warn')
            .setDescription('<:seiaehem:1244129111169826829> • You know, i do not have enough permissions to warn this user, then what\'s this for...?')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        let key = false
        for (var i in ProtectedRoles) {
            if (member.roles.cache.has(ProtectedRoles[i])) {
                key = true
                break
            }
        }

        if (!usingkey) {
            return interaction.editReply({
                embeds: [NoPerm]
            })
        } else {
            if (key) {
                return interaction.editReply({
                    embeds: [ErrDel]
                })
            } else {
                WarnList.findOne({ UserID: target.id }, async (err, data) => {
                    if (err) throw err
                    if (!data) {
                        const NoData = new EmbedBuilder()
                            .setColor('Yellow')
                            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                            .setTitle('<:seiaconcerned:1244129048494473246> • No Data')
                            .setDescription(`<:seiaehem:1244129111169826829> (umm... they're doing good, then what's the purpose of doing this?)`)
                            .setTimestamp()
                            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                        return interaction.editReply({
                            embed: [NoData]
                        })
                    } if(data) {
                        if (pos - 1 >= data.Reason.length) {
                            const OverData = new EmbedBuilder()
                                .setColor('Yellow')
                                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                .setTitle('<:seiaconcerned:1244129048494473246> • Over Data')
                                .setDescription(`<:seiaehem:1244129111169826829> (umm... the number you chose is out of range... how do I remove their warn?)`)
                                .setTimestamp()
                                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                            return interaction.editReply({
                                embed: [OverData]
                            })
                        } else {
                            const DelEmbed = new EmbedBuilder()
                                .setColor('Green')
                                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                .setTitle('<:seiaconcerned:1244129048494473246> • Delete Warn')
                                .setDescription(`<:seiaehem:1244129111169826829> (alright, I've reviewed your appeal, then this case i'll forgive you)\n> Unwarned User: ${target}\n> Responsible Mod: ${interaction.user}`)
                                .addFields({
                                    name: 'Deleted Reason',
                                    value: data.Reason[pos - 1]
                                })
                                .setTimestamp()
                                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                            await interaction.editReply({
                                embeds: [DelEmbed]
                            })
                            const LogEmbed = new EmbedBuilder()
                                .setColor('Green')
                                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Deleted Warn')
                                .setDescription(`<:seiaehem:1244129111169826829> Unwarned User: ${target}\n> Responsible Mod: ${interaction.user}`)
                                .addFields({
                                    name: 'Deleted Reason',
                                    value: data.Reason[pos - 1]
                                })
                                .setTimestamp()
                                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                            logchannel.send({
                                embeds: [LogEmbed]
                            })
                            data.Reason.splice(pos - 1, 1)
                            data.save()
                        }
                    }
                })
            }
        }
    }

}