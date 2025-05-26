const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const DrxUsers = require('../../Database/DroidRx/drxuserdata')
const { request } = require('undici')
const { DroidRxMods } = require('../../Functions/DroidRx/Get/dr_Mods')
const PlayEmoList = require('../../Assets/DroidRx/Texts/play_emo')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recent5')
        .setDescription('Show the user\'s recent plays (max limit: 100 plays)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to get recent plays')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The id of a player (in case they haven\'t bound)'))
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('The page to display their recent plays')
                .setMinValue(1)
                .setMaxValue(20)),

    async execute(interaction) {
        await interaction.deferReply()

        let UserID = interaction.options.getInteger('id')
        const guser = interaction.options.getUser('user') || interaction.user
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const GetID = await DrxUsers.findOne({ DiscordID: guser.id })
        if (!GetID) {
            const InvalidID = new EmbedBuilder()
                .setColor('DarkButNotBlack')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Error: Invalid User ID')
                .setDescription(`<:seiaehem:1244129111169826829> • There's no ID provided, either the user hasn't bound their account or the id itself is not provided, so I cannot look up for their recent play!`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidID]
            })
        } else {
            if (!UserID) UserID = GetID.UserID
        }


        let page = interaction.options.getInteger('page') || 1
        const a = await request(`https://v4rx.me/api/get_user/?id=${UserID}`)
        const ProfileResult = await a.body.json()
        const Keys = Object.keys(ProfileResult)
        if (['error'].includes(Keys[0])) {
            const InvalidUser = new EmbedBuilder()
                .setColor('DarkButNotBlack')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Error: User not Found')
                .setDescription(`<:seiaehem:1244129111169826829> • There\'s no user with this id ${UserID}, so I cannot find their recent plays!`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidUser]
            })
        }

        const TotalPlays = (ProfileResult.stats.plays >= 100) ? 100 : ProfileResult.stats.plays

        const AvtUrl = `https://v4rx.me/user/avatar/${UserID}.png/`
        const b = await request(`https://v4rx.me/api/get_scores/?limit=${TotalPlays}&id=${UserID}`)
        const OverallList = await b.body.json()
        const PlaysDescArr = []
        for (var i in OverallList) {
            PlaysDescArr.push(`### \`${Number(i) + 1}\` **${OverallList[i].beatmap.artist} - ${OverallList[i].beatmap.title} [${OverallList[i].beatmap.version}]**\n▸ **Mods:** \`${DroidRxMods(OverallList[i].mods)}\`\n> **▸ PP:** \`${OverallList[i].pp.toFixed(2)}\` **• Rating:** ${PlayEmoList.rating[OverallList[i].rank]}\n> **▸ Score:** \`${OverallList[i].score}\` **• Accuracy: ** \`${OverallList[i].acc.toFixed(2)}%\`\n> **▸ Combo:** \`${OverallList[i].combo}x/${OverallList[i].beatmap.max_combo}x\`\n${PlayEmoList.hits.hit300} \`${OverallList[i].hit300}\` | ${PlayEmoList.hits.hit100} \`${OverallList[i].hit100}\` | ${PlayEmoList.hits.hit50} \`${OverallList[i].hit50}\` | ${PlayEmoList.hits.hitmiss} \`${OverallList[i].hitmiss}\`\n> **▸ Submitted At:** **<t:${Math.floor(OverallList[i].date/1000)}> (<t:${Math.floor(OverallList[i].date/1000)}:R>)**\n\n`)
        }

        const EmbedDesc = []
        let tempstr = ''
        for (var i in PlaysDescArr) {
            tempstr += PlaysDescArr[i]
            if (i > 0 && i % 5 === 4) {
                EmbedDesc.push(tempstr)
                tempstr = ''
            }
        }

        let listlen = EmbedDesc.length
        const EmbedList = []
        for (var i in EmbedDesc) {
            EmbedList[i] = new EmbedBuilder()
                .setColor('Aqua')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle(`<:seiaconcerned:1244129048494473246> • Recent Plays Of: ${ProfileResult.name} \`[${ProfileResult.id}]\``)
                .setDescription(`${EmbedDesc[i]}`)
                .setThumbnail(AvtUrl)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
        }

        function ListMovingButton(count = page) {
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
                        .setLabel(`| Page: ${count + 1}/${listlen} |`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('rpage')
                        .setEmoji('1086297678624854077')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === listlen - 1),
                    new ButtonBuilder()
                        .setCustomId('5pright')
                        .setEmoji('1247028616609534072')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === listlen - 1)
                )
            return ListButton
        }
        page--

        await interaction.editReply({
            embeds: [EmbedList[page]],
            components: [ListMovingButton(page)]
        })

        const filter = a => a.user.id === interaction.user.id;
        const message = await interaction.fetchReply()
        const collector = interaction.channel.createMessageComponentCollector({ message, filter, time: 300000 })

        collector.on('collect', async (a) => {
            await a.deferUpdate()
            switch (a.customId) {
                case ('lpage'):
                    {
                        page--
                        await interaction.editReply({
                            embeds: [EmbedList[page]],
                            components: [ListMovingButton(page)]
                        })
                        break
                    }
                case ('rpage'):
                    {
                        page++
                        await interaction.editReply({
                            embeds: [EmbedList[page]],
                            components: [ListMovingButton(page)]
                        })
                        break
                    }
                case ('5pleft'):
                    {
                        page = (page < 5) ? 0 : page - 5
                        await interaction.editReply({
                            embeds: [EmbedList[page]],
                            components: [ListMovingButton(page)]
                        })
                        break
                    }
                case ('5pright'):
                    {
                        page = (page + 5 > listlen - 1) ? listlen - 1 : page + 5
                        await interaction.editReply({
                            embeds: [EmbedList[page]],
                            components: [ListMovingButton(page)]
                        })
                        break
                    }
                default: return
            }
        })
    }

}