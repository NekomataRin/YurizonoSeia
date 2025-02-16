const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const ProtectedRoles = require('../../Utils/whitelistedrole')
const BotOwner = require('../../Utils/owners')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('-Mod Only- Kick a user in this server with a reason')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Specify the reason why you want to kick that user')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const target = interaction.options.getUser('user')
        const reason = interaction.options.getString('reason') || 'No reason provided, so it\'s automatically executed.'

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

        const ErrKick = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Kick')
            .setDescription('<:seiaehem:1244129111169826829> • I am so sorry, but I do not have enough permissions to kick this user...')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const KickEmbed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Kick')
            .setDescription(`<:SeiaSip:1244890166116618340> (oh, according to the info i got from the server, your actions will be judged. in this case, i have to kick your butts out of this server, bye bye!)\n> Kicked User: ${target}\n> Responsible Mod: ${interaction.user}`)
            .addFields({
                name: 'Kick Reason',
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
                    embeds: [ErrKick]
                })
            }
            else {
                await member.kick()
                await interaction.editReply({
                    embeds: [KickEmbed]
                })
                await DMUser.send({
                    embeds: [KickEmbed]
                }).catch(async err => {
                    console.error(err.toString())
                    logchannel.send({
                        content: '<:seiaehem:1244129111169826829> Oh well uhh, seems like this user has closed their DMs... Which means I cannot get to contact them, so....',
                        embeds: [KickEmbed]
                    })
                })
            }

            const LogEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Kick')
                .setDescription(`<:SeiaSip:1244890166116618340> Kicked User: ${target}\n> Responsible Mod: ${interaction.user}`)
                .addFields({
                    name: 'Kick Reason',
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