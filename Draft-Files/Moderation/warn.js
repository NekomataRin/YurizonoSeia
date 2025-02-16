const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const WarnList = require('../../Database/warnsys')
const ProtectedRoles = require('../../Utils/whitelistedrole')
const BotOwner = require('../../Utils/owners')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('-Mod Only- Warn a user violated the rules')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason why you warn them')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()

        const target = interaction.options.getUser('user')
        const reason = interaction.options.getString('reason') || 'No reason provided, automatically executed...'

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

        const ErrWarn = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Warn')
            .setDescription('<:seiaehem:1244129111169826829> • You know, i do not have enough permissions to warn this user...')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const WarnEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Warn')
            .setDescription(`<:seiaehem:1244129111169826829> (hmm... your actions are my concerning right now, I'll warn you because your actions violated the rules.)\n> Warned User: ${target}\n> Responsible Mod: ${interaction.user}`)
            .addFields(
                {
                    name: 'Warn Reason',
                    value: reason
                }
            )
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
            //return
            if (key) {
                return interaction.editReply({
                    embeds: [ErrWarn]
                })
            } else {
                await interaction.editReply({
                    embeds: [WarnEmbed]
                })
                const LogEmbed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Warn')
                    .setDescription(`<:seiaehem:1244129111169826829> Warned User: ${target}\n> Responsible Mod: ${interaction.user}`)
                    .addFields({
                        name: 'Warn Reason',
                        value: reason
                    })
                    .setTimestamp()
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                logchannel.send({
                    embeds: [LogEmbed]
                })
                WarnList.findOne({ UserID: target.id }, async (err, data) => {
                    if (err) throw err
                    if (!data) {
                        WarnList.create({
                            UserID: target.id,
                            Reason: [reason]
                        })
                    } else {
                        data.Reason.push(reason)
                        data.save()
                    }
                })
            }
        }
    }
}