const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const FooterEmbeds = require('../../Utils/embed')
const PendingMatches = require('../../Database/Tournaments/pending-matches')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('schedule-confirm')
        .setDescription('-Referee Only- Confirm the status of the match schedule')
        .addStringOption(option =>
            option.setName('match-name')
                .setDescription('Getting available matches, and choose one for confirming')
                .setAutocomplete(true)
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('confirm')
                .setDescription('Confirm the status (true - accepted, false - denied)')
                .setRequired(true)
        ),

    async autocomplete(interaction) {
        let MatchLists = await PendingMatches.find({ GuildID: interaction.guild.id }).select('-_id Matches')
        let choices = []
        const focusedValue = interaction.options.getFocused()
        for (var i in MatchLists) {
            choices.push(MatchLists[i].Matches[i][0])
        }
        let filtered = choices.filter(choice => choice.startsWith(focusedValue))
        filtered = filtered.slice(0, 24)
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        )
    },

    async execute(interaction) {
        await interaction.deferReply()
        return interaction.editReply("This command is not supported anymore...")

        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const Match_Channel = await interaction.guild.channels.fetch('1246610295133044746')
        const Match_Chat = await interaction.guild.channels.fetch('1244862784932413441')

        const RefereeList = await interaction.guild.roles.cache.get('1240650723860156466').members.map(m => m.user.id)

        const usekey = (RefereeList.indexOf(interaction.user.id) !== -1) ? true : false
        if (!usekey) {
            const NoPerm = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244128341540208793> • No permissions')
                .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [NoPerm]
            })
        } else {

            const MatchName = interaction.options.getString('match-name')
            let ConfirmKey = interaction.options.getBoolean('confirm')

            let PendingList = await PendingMatches.find({ GuildID: interaction.guild.id }).select('-_id Matches')
            let MatchInfo, MatchIndex = -1
            for (var i in PendingList) {
                if (PendingList[i].Matches[i].indexOf(MatchName) !== -1) {
                    MatchInfo = PendingList[i].Matches[i]
                    MatchIndex = i
                    break
                }
            }

            let ErrKey = false
            if ((Number(MatchInfo[3]) * 1000) < Date.now()) {
                ConfirmKey = false
                ErrKey = true
            }
            let Status = (ConfirmKey) ? 'ACCEPTED' : 'DECLINED'
            let Color = (ConfirmKey) ? 'Green' : 'Red'

            let Desc = `<:seiaehem:1244129111169826829> **Match Name:** \`${MatchInfo[0]}\`\n\n> **Players:** <@${MatchInfo[1]}> - <@${MatchInfo[2]}>\n> **Scheduled Time:** <t:${MatchInfo[3]}> (<t:${MatchInfo[3]}:R>)\n> **Referee:** ${interaction.user}`
            if (ErrKey) {
                Status = 'REMOVED BY DEFAULT'
                Color = 'DarkButNotBlack'
                Desc = `Because the timestamp is in the past, so your match was removed by default, ok?`
            }

            const ScheduleEmbedStatus = new EmbedBuilder()
                .setColor(Color)
                .setTitle(`<:seiaconcerned:1244128341540208793> **Match Schedule - Status - ${Status}**`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(Desc)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            if (ConfirmKey) {
                await Match_Channel.send({
                    content: `<@${MatchInfo[1]}> and <@${MatchInfo[2]}>, Please prepare yourself for the upcoming match, good luck!`,
                    embeds: [ScheduleEmbedStatus]
                })
                await interaction.editReply({
                    content: 'Alright, the match has been accepted, I\'ll send this embed to the schedule channel then',
                    embeds: [ScheduleEmbedStatus]
                })
            } else {
                await Match_Chat.send({
                    content: `<@${MatchInfo[1]}> and <@${MatchInfo[2]}>, Your match has been declined, here's the reason why, please re-schedule the match again!`,
                    embeds: [ScheduleEmbedStatus]
                })
                await interaction.editReply({
                    content: 'Alright, the match has been declined, so this embed won\'t be sent to the schedule channel',
                    embeds: [ScheduleEmbedStatus]
                })
            }

            PendingMatches.findOne({ GuildID: interaction.guild.id }, async (err, data) => {
                if (err) throw err
                if (!data) return
                else {
                    let AllMatches = data.Matches
                    data.Matches = AllMatches.filter(n => n !== AllMatches[MatchIndex])
                    data.save()
                }
            })
        }
    }
}