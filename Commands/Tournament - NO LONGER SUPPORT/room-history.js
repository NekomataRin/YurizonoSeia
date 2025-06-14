const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { request } = require('undici')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('room-history')
        .setDescription('Get the room history of the match from a tournament')
        .addNumberOption(option =>
            option.setName('room-id')
                .setDescription('The room id to show history')
                .setMinValue(1)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('sort-method')
                .setDescription('Sorting method for the match, depending on the tourney')
                .addChoices(
                    {
                        name: '[Aim Cup]',
                        value: 'aim'
                    },
                    {
                        name: '[Standard]',
                        value: 'std'
                    }
                )
                .setRequired(true))
        .addStringOption(option =>
            option.setName('match-type')
                .setDescription('The match type (1v1 - Qualifier)')
                .addChoices(
                    {
                        name: `[1v1]`,
                        value: `solo`
                    },
                    {
                        name: `[Qualifier]`,
                        value: `qlfr`
                    })
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('ref-id')
                .setDescription('The room\'s referee\'s id - (Please specify the room id)')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const Focused = interaction.options.getFocused(true)
        let room_id = interaction.options.getNumber('room-id') || 1

        const LinkReq = await request(`https://droidpp.osudroid.moe/api/tournament/getrooms_history?id=${room_id}`)
        const Result = await LinkReq.body.json()
        let choices = []

        if (Result.length > 0) {
            for (var i in Result[0].scores) {
                choices.push(`${Result[0].scores[i].user_id} | ${Result[0].scores[i].user_name}`)
            }
        } else
            choices.push('ERROR 404 - Room Not Found')

        const filtered = choices.filter(choice => choice.startsWith(Focused.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice.split('|')[0] })),
        )
    },

    async execute(interaction) {
        await interaction.deferReply()
        return interaction.editReply('This command is NO LONGER Supported, Sorry!')

        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const room_id = interaction.options.getNumber('room-id')
        const Ref_id = interaction.options.getString('ref-id') || 0
        const SortMethod = interaction.options.getString('sort-method')
        const MatchType = interaction.options.getString('match-type')

        if (Ref_id === 'ERROR 404 - Room Not Found') {
            const ErrEmbed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244128341540208793> • Error - Room Not Found')
                .setDescription(`<:seiaehem:1244129111169826829> • I cannot retrieve the history of this room id (${room_id}) for you because there's no data from the link.`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [ErrEmbed]
            })
        }

        const LinkReq = await request(`https://droidpp.osudroid.moe/api/tournament/getrooms_history?id=${room_id}`)
        const Result = await LinkReq.body.json()

        let MapName = [], Scores = [], MapHashes = []
        for (var i in Result) {
            MapName.push(Result[i].map_name)
            Scores.push(Result[i].scores)
            MapHashes.push(Result[i].map_hash)
        }

        const MapDetails = [], IDList = []
        for (var i in MapHashes) {
            const MapIDReq = await request(`https://osu.direct/api/md5/${MapHashes[i]}`)
            const MapID = await MapIDReq.body.json()
            MapDetails.push(MapID)
            IDList.push(MapDetails[i].BeatmapID)
        }

        const BackgroundLink = []
        for (var i in IDList) {
            BackgroundLink.push(`https://osu.direct/api/media/background/${IDList[i]}`)
        }

        const ModsObj = {
            '|': '',
            'a': "AT",
            'b': 'TC',
            'c': 'NC',
            'd': 'DT',
            'e': 'EZ',
            'f': 'PF',
            'h': 'HD',
            'i': 'FL',
            'm': 'CS',
            'n': 'NF',
            'P': 'AP',
            'r': 'HR',
            's': 'PR',
            't': 'HT',
            'u': 'SD',
            'v': 'V2',
            'x': 'RX'
        }

        function RetrieveMods(str) {
            let Mods = ''
            let Substr = str.split('|')
            if (Substr[0].length > 0) {
                for (var i in Substr[0]) {
                    if (Object.keys(ModsObj).includes(Substr[0][i])) {
                        Mods += ModsObj[Substr[0][i]]
                    }
                }
            }
            if (Substr[1].length > 0) Mods += ` ${Substr[1]}`
            if (Substr[0].length === 0) Mods = 'No Mod'
            return Mods
        }

        let MapScores = [], RefName = 'None', Participants = []
        for (var i in Scores) {
            MapScores.push([MapName[i]])
            for (j in Scores[i]) {
                if (Number(Scores[i][j].user_id) !== Number(Ref_id)) {

                    if (MatchType === 'solo') {
                        if (Participants.indexOf(Scores[i][j].user_name) === -1) {
                            Participants.push(Scores[i][j].user_name)
                        }
                    }

                    let Accuracy = Number(Scores[i][j].accuracy) * 100
                    Accuracy = Accuracy.toFixed(2)
                    let ModSymb = Scores[i][j].play_mod
                    let PlayMod = RetrieveMods(ModSymb)
                    MapScores[i].push([Scores[i][j].user_name, Scores[i][j].score, Accuracy, Scores[i][j].hit0, PlayMod, Scores[i][j].user_id])
                } else {
                    RefName = `${Scores[i][j].user_name} [${Ref_id}]`
                }
            }
        }

        function SortColAim(a, b) {
            if (Number(a[3]) < Number(b[3])) return -1
            else if (Number(a[3]) > Number(b[3])) return 1
            else {
                if (Number(a[2]) === Number(b[2])) return 0
                else return (Number(a[2]) < Number(b[2])) ? 1 : -1
            }
        }

        function SortColDefault(a, b) {
            if (Number(a[1]) < Number(b[1])) return 1
            else if (Number(a[1]) > Number(b[1])) return -1
            else {
                if (Number(a[2]) === Number(b[2])) return 0
                else return (Number(a[2]) < Number(b[2])) ? 1 : -1
            }
        }

        for (var i = 0; i < MapScores.length; i++) {
            MapScores[i].shift()
            if (SortMethod === 'aim') MapScores[i] = MapScores[i].sort(SortColAim)
            if (SortMethod === 'std') MapScores[i] = MapScores[i].sort(SortColDefault)
        }

        let MatchScore
        if (MatchType === 'solo') {
            MatchScore = [0, 0]
        }

        let DescMethod = []
        if (SortMethod === 'aim') DescMethod[0] = 'Aim Cup'
        if (SortMethod === 'std') DescMethod[0] = 'Standard'
        if (MatchType === 'solo') DescMethod[1] = '1v1'
        if (MatchType === 'qlfr') DescMethod[1] = 'Qualifier'

        const HistoryEmbed = []
        let count_1 = 0, MapDetailsDesc
        for (var i = MapScores.length - 1; i >= 0; i--) {
            if (MapScores[i].length > 0) {
                MapDetailsDesc = `### __Map Name:__ ${MapName[i]}\n\n`
                if (MatchType === 'solo') {
                    if (MapScores[i].length === 2 && Participants.length === 2) {
                        if (MapScores[i][0][0] === Participants[0]) {
                            MatchScore[0]++
                        }
                        if (MapScores[i][0][0] === Participants[1]) {
                            MatchScore[1]++
                        }
                        let DetailedScoring = `> **Score Match:** \`${Participants[0]}\` **${MatchScore[0]} - ${MatchScore[1]}** \`${Participants[1]}\`\n\n`
                        MapDetailsDesc += DetailedScoring
                    }
                    for (var j = 0; j < MapScores[i].length; j++) {
                        if (j === 0) {
                            MapDetailsDesc += `[👑] **Player:** \`${MapScores[i][j][0]} [${MapScores[i][j][5]}]\` ▸ **Score:** \`${MapScores[i][j][1]}\`\n▸ **Accuracy:** \`${MapScores[i][j][2]}%\` ▸ **Misses:** \`${MapScores[i][j][3]}\`\n▸ **Mods:** \`${MapScores[i][j][4]}\`\n`
                        } else {
                            MapDetailsDesc += `[🏳] **Player:** \`${MapScores[i][j][0]} [${MapScores[i][j][5]}]\` ▸ **Score:** \`${MapScores[i][j][1]}\`\n▸ **Accuracy:** \`${MapScores[i][j][2]}%\` ▸ **Misses:** \`${MapScores[i][j][3]}\`\n▸ **Mods:** \`${MapScores[i][j][4]}\`\n`
                        }
                    }
                }
                if (MatchType === 'qlfr') {
                    for (var j = 0; j < MapScores[i].length; j++) {
                        MapDetailsDesc += `**\`[No. ${Number(j) + 1}]\`** **Player:** \`${MapScores[i][j][0]} [${MapScores[i][j][5]}]\` ▸ **Score:** \`${MapScores[i][j][1]}\`\n▸ **Accuracy:** \`${MapScores[i][j][2]}%\` ▸ **Misses:** \`${MapScores[i][j][3]}\`\n▸ **Mods:** \`${MapScores[i][j][4]}\`\n`
                    }
                }
                HistoryEmbed[count_1] = new EmbedBuilder()
                    .setColor('Yellow')
                    .setAuthor({ name: `${interaction.user.username} `, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })} ` })
                    .setTitle('<:seiaconcerned:1244128341540208793> • Match Room History - Data Retrieved')
                    .setDescription(`▸ ** Room ID:** \`${room_id}\` ▸ **Referee:** \`${RefName}\`\n▸ **Match Type:** \`${DescMethod[1]}\` ▸ **Sorting Method:** \`${DescMethod[0]}\` \n${MapDetailsDesc}`)
                    .setTimestamp()
                    .setThumbnail(BackgroundLink[i])
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                count_1++
            }
        }
        await interaction.editReply({
            embeds: [HistoryEmbed[0]],
            components: [ListMovingButton(0)]
        })

        function ListMovingButton(count) {
            const ListButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('5pleft')
                        .setEmoji('1247028605775511562')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === 0),
                    new ButtonBuilder()
                        .setCustomId('lpage')
                        .setEmoji('1086297531379613767')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === 0),
                    new ButtonBuilder()
                        .setCustomId('pages')
                        .setLabel(`| Page: ${count + 1}/${HistoryEmbed.length} |`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('rpage')
                        .setEmoji('1086297678624854077')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === HistoryEmbed.length - 1),
                    new ButtonBuilder()
                        .setCustomId('5pright')
                        .setEmoji('1247028616609534072')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === HistoryEmbed.length - 1)
                )
            return ListButton
        }

        const filter = a => a.user.id === interaction.user.id;
        const message = await interaction.fetchReply()
        const collector = interaction.channel.createMessageComponentCollector({ message, filter, time: 300000 })

        let count = 0

        collector.on('collect', async (a) => {
            await a.deferUpdate()
            switch (a.customId) {
                case ('lpage'):
                    {
                        count--
                        await interaction.editReply({
                            embeds: [HistoryEmbed[count]],
                            components: [ListMovingButton(count)],
                        })
                        break
                    }
                case ('rpage'):
                    {
                        count++
                        await interaction.editReply({
                            embeds: [HistoryEmbed[count]],
                            components: [ListMovingButton(count)],
                        })
                        break
                    }
                case ('5pleft'):
                    {
                        if (count < 5) {
                            count = 0
                        } else {
                            count -= 5
                        }
                        await interaction.editReply({
                            embeds: [HistoryEmbed[count]],
                            components: [ListMovingButton(count)],
                        })
                        break
                    }
                case ('5pright'):
                    {
                        if (count + 5 > HistoryEmbed.length - 1) {
                            count = HistoryEmbed.length - 1
                        } else {
                            count += 5
                        }
                        await interaction.editReply({
                            embeds: [HistoryEmbed[count]],
                            components: [ListMovingButton(count)],
                        })
                        break
                    }
                default: return
            }
        })
    }
}