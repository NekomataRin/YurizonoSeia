const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const ProtectedRoles = require('../../Utils/whitelistedrole')
const BotOwner = require('../../Utils/owners')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('-Mod Only- Ban a user in this server with a reason')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Specify the user you want to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Add a reason why you ban that user (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const target = interaction.options.getUser('user')
        const reason = interaction.options.getString('reason') || 'There is no reason provided, so it\'s automatically executed.'

        const member = await interaction.guild.members.fetch(target.id)
        const usemem = await interaction.guild.members.fetch(interaction.user.id)
        const logchannel = await interaction.guild.channels.fetch('1244996189510697043')
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const DMUser = member

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

        const ErrBan = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Ban')
            .setDescription('<:seiaehem:1244129111169826829> • I am so sorry, but I do not have enough permissions to ban this user...')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const BanEmbed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Ban')
            .setDescription(`<:SeiaMenacing:1244890322090201162> (oh, looks like you wanna get banned from the server, right? alright, let me do the job for you, farewell.)\n> Banned User: ${target}\n> Responsible Mod: ${interaction.user}`)
            .addFields({
                name: 'Ban Reason',
                value: reason
            })
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        let key = false
        for (var i in ProtectedRoles) {
            if (member.roles.cache.has(ProtectedRoles[i])) {
                key = true
                break
            }
        }

        for (var i in BotOwner) {
            if (member.id === BotOwner[i]) {
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
                    embeds: [ErrBan]
                })
            }
            else {
                await member.ban()
                await interaction.editReply({
                    embeds: [BanEmbed]
                })

                await DMUser.send({
                    embeds: [BanEmbed]
                }).catch(async err => {
                    console.error(err.toString())
                    logchannel.send({
                        content: '<:seiaehem:1244129111169826829> Oh well uhh, seems like this user has closed their DMs... Which means I cannot get to contact them, so....',
                        embeds: [BanEmbed]
                    })
                })
            }

            const LogEmbed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Ban')
                .setDescription(`<:SeiaMenacing:1244890322090201162> Banned User: ${target}\n> Responsible Mod: ${interaction.user}`)
                .addFields({
                    name: 'Ban Reason',
                    value: reason
                })
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

            logchannel.send({
                embeds: [LogEmbed]
            })
        }

    }
}