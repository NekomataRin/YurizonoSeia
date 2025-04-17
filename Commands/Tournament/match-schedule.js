const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const FooterEmbeds = require('../../Utils/embed')
const PendingMatches = require('../../Database/Tournaments/pending-matches')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('match-schedule')
        .setDescription('-Testing- Set the match schedule between 2 players')
        .addStringOption(option =>
            option.setName('match-name')
                .setDescription('The match name will be held')
                .setMaxLength(50)
                .setMinLength(1)
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you will set schedule (they will confirm the button)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Match time (24 hours format) [e.g: 17:00]')
                .setMaxLength(5)
                .setMinLength(5)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Date of the match (yyyy-mm-dd) [e.g: 2024-07-27]')
                .setMinLength(10)
                .setMaxLength(10)
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('timezone')
                .setDescription('Timezone for the match (-12 to 14) [default: 0]')
                .setMinValue(-12)
                .setMaxValue(14)
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const timereg = /\b(2[0-3]|[01]?[0-9]):([0-5]?[0-9])\b/g
        const datereg = /^\d{4}[-/](0[1-9]|1[012])[-/](0[1-9]|[12][0-9]|3[01])$/g

        let errcode = []
        /*
        * Errcode:
        * all 0s - Working Normally
        * [0] - Invalid Time
        * [1] - Invalid Date
        * [2] - Same User
        * [3] - Bots
        * [4] - Date In The Past
        */

        const MatchName = interaction.options.getString('match-name')
        const MatchUser = interaction.options.getUser('user')

        const TimeString = interaction.options.getString('time')
        const DateString = interaction.options.getString('date')
        let TimeZoneString = interaction.options.getInteger('timezone') || 'Z'
        let MatchTimeString = ''

        errcode.push((!TimeString.match(timereg)) ? 1 : 0)
        errcode.push((!DateString.match(datereg)) ? 1 : 0)
        errcode.push((MatchUser.id === interaction.user.id) ? 1 : 0)
        errcode.push((MatchUser.bot) ? 1 : 0)

        if (TimeZoneString > 0) {
            TimeZoneString = (TimeZoneString < 10) ? `+0${TimeZoneString}:00` : `+${TimeZoneString}:00`
        } else if (TimeZoneString < 0) {
            TimeZoneString = Math.abs(TimeZoneString)
            TimeZoneString = (TimeZoneString < 10) ? `-0${TimeZoneString}:00` : TimeZoneString = `-${TimeZoneString}:00`
        }

        if (errcode.indexOf(1) === -1) {
            MatchTimeString = `${DateString}T${TimeString}${TimeZoneString}`
            let date = new Date(MatchTimeString)
            date = date.getTime()
            errcode.push((date < Date.now()) ? 1 : 0)
            MatchTimeString = Number(date) / 1000
        } else {
            errcode.push(0)
        }

        let ErrorDesc = '', errcount = 0, temperr = []
        const ErrDesc = [
            'Invalid Time Format - You must provided the apporiate time of the `24 hours time` format!\n',
            'Invalid Date Format - You must provided the apporiate date of the `yyyy-mm-dd` or `yyyy/mm/dd` format!\n',
            'Same User - Seriously? You scheduled your match... with yourself?\n',
            'Bot - Seriously? Bot can play osudroid!relax? They aren\'t NeuroSama, dude? Even me, I\'m also trigger this error, you know?\n',
            'Date In The Past - You can\'t schedule your match in the past...\n'
        ]

        for (var i in errcode) {
            errcount = (errcode[i] === 1) ? errcount + 1 : errcount
            if (errcode[i] === 1) {
                temperr.push(ErrDesc[i])
            }
        }

        if (errcount > 0) {
            ErrorDesc = (errcount === 1) ? 'Error! Received one error while you were running the command!\n\n' : 'Error! Received two or more errors while you were running the command!\n\n'
            for (var i in temperr) {
                ErrorDesc += temperr[i]
            }
        }

        if (errcode.indexOf(1) !== -1) {
            const ErrorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(`<:seiaconcerned:1244129048494473246> **Error while executing command**`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`<:seiaehem:1244129111169826829> ${ErrorDesc}`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [ErrorEmbed]
            })
            return
        } else {
            const StatusButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('y')
                        .setLabel('Accept')
                        .setEmoji('1244128244664504392')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('n')
                        .setLabel('Decline')
                        .setEmoji('1254109782592327783')
                        .setStyle(ButtonStyle.Danger)
                )

            const ScheduleEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle(`<:seiaconcerned:1244129048494473246> **Match Schedule - Disscussing Time**`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`<:seiaehem:1244129111169826829> **Match Name:** \`${MatchName}\`\n\n> **Players:** ${interaction.user} - ${MatchUser}\n> **Scheduled Time:** <t:${MatchTimeString}> (<t:${MatchTimeString}:R>)\n\n> ${MatchUser} will have \`3 Minutes\` to respond to this message by clicking one of those two buttons below.\n-# Notice: After the given time, if the user hasn't showed up yet, the schedule will be automatically discarded without logs. -Nekomata Rin`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                content: `${MatchUser}`,
                embeds: [ScheduleEmbed],
                components: [StatusButton]
            })
            const RefChannel = await interaction.guild.channels.fetch('1262757968575729726')

            const filter = a => a.user.id === MatchUser.id;
            const message = await interaction.fetchReply()
            const collector = interaction.channel.createMessageComponentCollector({ message, filter, time: 300000 })
            collector.on('collect', async (a) => {
                await a.deferUpdate()
                switch (a.customId) {
                    case 'y':
                        {
                            const ScheduleEmbedStatus = new EmbedBuilder()
                                .setColor('Yellow')
                                .setTitle(`<:seiaconcerned:1244129048494473246> **Match Schedule - Status - PENDING**`)
                                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                .setDescription(`<:seiaehem:1244129111169826829> **Match Name:** \`${MatchName}\`\n\n> **Players:** ${interaction.user} - ${MatchUser}\n> **Scheduled Time:** <t:${MatchTimeString}> (<t:${MatchTimeString}:R>)`)
                                .setTimestamp()
                                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                            await interaction.editReply({
                                content: `<:seiaehem:1244129111169826829> Alright, please wait for a referee shows up and ref your match, please wait!`,
                                components: [],
                                embeds: []
                            })
                            await RefChannel.send({
                                embeds: [ScheduleEmbedStatus]
                            })
                            PendingMatches.findOne({ GuildID: interaction.guild.id }, async (err, data) => {
                                if (err) throw err
                                if (!data) {
                                    PendingMatches.create({
                                        GuildID: interaction.guild.id,
                                        Matches: [[MatchName, interaction.user.id, MatchUser.id, MatchTimeString]]
                                    })
                                } else {
                                    data.Matches.push([MatchName, interaction.user.id, MatchUser.id, MatchTimeString])
                                    data.save()
                                }
                            })
                            break
                        }
                    case 'n':
                        {
                            const ScheduleEmbedStatus = new EmbedBuilder()
                                .setColor('Red')
                                .setTitle(`<:seiaconcerned:1244129048494473246> **Match Schedule - Status - DENIED**`)
                                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                .setDescription(`<:seiaehem:1244129111169826829> **Match Name:** \`${MatchName}\`\n\n> **Players:** ${interaction.user} - ${MatchUser}\n> **Scheduled Time:** <t:${MatchTimeString}> (<t:${MatchTimeString}:R>)`)
                                .setTimestamp()
                                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                            await interaction.editReply({
                                content: `<:seiaehem:1244129111169826829> Alright, even your match schedule is declined, but I still do the log for the ref thred to let them know`,
                                components: [],
                                embeds: []
                            })
                            await RefChannel.send({
                                embeds: [ScheduleEmbedStatus]
                            })
                            break
                        }
                    default: return
                }
            })
        }
    }
}
