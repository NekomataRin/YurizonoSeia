const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const ProtectedRoles = require('../../Utils/whitelistedrole')
const BotOwner = require('../../Utils/owners')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('-Mod Only- Timeout a user with the provided time and reason')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User you want to timeout')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('How long will this timeout last (e.g: 1d12h) [clear: untimeout]')
                .setMaxLength(12)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Provide a reason why you want to timeout that user')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const target = interaction.options.getUser('user')
        const duration = interaction.options.getString('duration')
        const reason = interaction.options.getString('reason') || 'No reason provided, automatically executed.'

        const member = await interaction.guild.members.fetch(target.id)
        const usemem = await interaction.guild.members.fetch(interaction.user.id)
        const logchannel = await interaction.guild.channels.fetch('1244996189510697043')
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const DMUser = member

        const format = /\d{1,2}[dhms]/g
        let TimeDuration = 0, TimeContext = ''

        const TimeFormat = duration.match(format)

        var usingkey = false
        if (usemem.roles.cache.has('1244608723737903165')) {
            usingkey = true
        }

        if (duration === 'clear') {
            TimeDuration = 0
        } else {
            TimeFormat.sort((a, b) => {
                if (a[a.length - 1] > b[b.length - 1]) return 1
                if (a[a.length - 1] < b[b.length - 1]) return -1
                return 0
            })
            for (var i in TimeFormat) {
                let Text, NumberText
                if (TimeFormat[i].length === 2) {
                    Text = TimeFormat[i][1]
                    NumberText = TimeFormat[i][0]
                } else {
                    Text = TimeFormat[i][2]
                    NumberText = TimeFormat[i][0] + TimeFormat[i][1]
                }
                switch (Text) {
                    case 'd':
                        {
                            TimeDuration += Number(NumberText) * 86400000
                            break
                        }
                    case 'h':
                        {
                            TimeDuration += Number(NumberText) * 3600000
                            break
                        }
                    case 'm':
                        {
                            TimeDuration += Number(NumberText) * 60000
                            break
                        }
                    case 's':
                        {
                            TimeDuration += Number(NumberText) * 1000
                            break
                        }
                    default:
                        TimeDuration += 0
                }
            }
        }

        let ContextCalc = TimeDuration / 1000

        let days = Math.floor(ContextCalc / 86400)
        ContextCalc %= 86400
        if (days > 0) TimeContext += ` ${days} Day`
        if (days > 1) TimeContext += `s`

        let hours = Math.floor(ContextCalc / 3600)
        ContextCalc %= 3600
        if (hours > 0) TimeContext += ` ${hours} Hour`
        if (hours > 1) TimeContext += `s`

        let minutes = Math.floor(ContextCalc / 60)
        if (minutes > 0) TimeContext += ` ${minutes} Minute`
        if (minutes > 1) TimeContext += `s`
        ContextCalc %= 60

        let seconds = Math.floor(ContextCalc)
        if (seconds > 0) TimeContext += ` ${seconds} Second`
        if (seconds > 1) TimeContext += `s`

        if (TimeDuration - (28 * 86400000) > 0) {
            TimeDuration = 28 * 86400000
            TimeContext = ` 28 Days, due to the limitation of timeout duration of Discord <:seiaheh:1244128991628103700>`
        }

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

        const Timestamp = Math.floor((Date.now() + TimeDuration) / 1000)

        let Desc = '', LogDesc = ''
        if (TimeDuration !== 0) {
            Desc = `<:SeiaMuted:1244890584276008970> • (do you even let me and others take a rest? Even me, I'm also a human, you know?)\n> Timeouted User: ${target}\n> Responsible Mod: ${interaction.user}`
            LogDesc = `<:SeiaMuted:1244890584276008970> Timeouted User: ${target}\n> Responsible Mod: ${interaction.user}`
        } else {
            Desc = `<:SeiaSip:1244890166116618340> • (well, at least i'm in a good mood right now, you can talk if you like...)\n> Untimeouted User: ${target}\n> Resonsible Mod: ${interaction.user}`
            LogDesc = `<:SeiaSip:1244890166116618340> Untimeouted User: ${target}\n> Resonsible Mod: ${interaction.user}`
        }

        const NoPerm = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • No permissions')
            .setDescription(Desc)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const ErrTimeout = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Timeout')
            .setDescription('<:seiaehem:1244129111169826829> • You know, i do not have enough permissions to timeout this user...')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const TimeoutEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Timeout')
            .setDescription(Desc)
            .addFields(
                {
                    name: 'Timeout Duration',
                    value: `${TimeContext} (Until <t:${Timestamp}>)`
                },
                {
                    name: 'Timeout Reason',
                    value: reason
                }
            )
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const UntimeoutEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Timeout')
            .setDescription(Desc)
            .addFields(
                {
                    name: 'Untimeout Reason',
                    value: reason
                }
            )
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const LogEmbed1 = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Timeout')
            .setDescription(LogDesc)
            .addFields(
                {
                    name: 'Timeout Duration',
                    value: `${TimeContext} (Until <t:${Timestamp}>)`
                },
                {
                    name: 'Timeout Reason',
                    value: reason
                }
            )
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const LogEmbed2 = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Log Action: Untimeout')
            .setDescription(LogDesc)
            .addFields(
                {
                    name: 'Untimeout Reason',
                    value: reason
                }
            )
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        if (!usingkey) {
            return interaction.editReply({
                embeds: [NoPerm]
            })
        } else {
            if (key) {
                return interaction.editReply({
                    embeds: [ErrTimeout]
                })
            }
            else {
                if (TimeDuration !== 0) {
                    await member.timeout(TimeDuration)
                    await interaction.editReply({
                        embeds: [TimeoutEmbed]
                    })
                    logchannel.send({
                        embeds: [LogEmbed1]
                    })
                    await DMUser.send({
                        embeds: [TimeoutEmbed]
                    }).catch(async err => {
                        console.error(err.toString())
                        logchannel.send({
                            content: '<:seiaehem:1244129111169826829> Oh well uhh, seems like this user has closed their DMs... Which means I cannot get to contact them, so....',
                            embeds: [TimeoutEmbed]
                        })
                    })
                } else {
                    await member.timeout(null)
                    await interaction.editReply({
                        embeds: [UntimeoutEmbed]
                    })
                    logchannel.send({
                        embeds: [LogEmbed2]
                    })
                    await DMUser.send({
                        embeds: [UntimeoutEmbed]
                    }).catch(async err => {
                        console.error(err.toString())
                        logchannel.send({
                            content: '<:seiaehem:1244129111169826829> Well, looks like the user\'s closed their DM... I can\'t contact with they so...',
                            embeds: [UntimeoutEmbed]
                        })
                    })
                }
            }
        }
    }
}