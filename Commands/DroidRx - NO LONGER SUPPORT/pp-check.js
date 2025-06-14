const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, User } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const DrxUsers = require('../../Database/DroidRx/drxuserdata')
const { request } = require('undici')
const { DroidRxMods } = require('../../Functions/DroidRx/Get/dr_Mods')
const PlayEmoList = require('../../Assets/DroidRx/Texts/play_emo')
const { getMap } = require('../../Functions/DroidRx/Get/dr_GetMap')
const { GetSR } = require('../../Functions/DroidRx/Get/dr_SR')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pp-check')
        .setDescription('Check a user\'s top plays, or yours')
        .addUserOption(option => option.setName('user')
            .setDescription('The user you wanted to get top plays')
            .setRequired(false))
        .addIntegerOption(option => option.setName('id')
            .setDescription('The user\'s in game id')
            .setMinValue(1)
            .setRequired(false))
        .addIntegerOption(option => option.setName('page')
            .setDescription('The page to display their top plays')
            .setMinValue(1)
            .setMaxValue(20)
            .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()
        let UserID = interaction.options.getInteger('id')
        const guser = interaction.options.getUser('user') || interaction.user
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        return interaction.editReply('This command is NO LONGER Supported, Sorry!')
        const GetID = await DrxUsers.findOne({ DiscordID: guser.id })
        if (!GetID && !UserID) {
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

        const AvtUrl = `https://v4rx.me/user/avatar/${UserID}.png/`
        const b = await request(`https://v4rx.me/api/top_scores/?id=${UserID}`)
        const TopPlays = await b.body.json()
        const PlaysLimit = ProfileResult.stats.plays
        const MapScores = await request(`https://v4rx.me/api/get_scores/?limit=${PlaysLimit}&id=${UserID}`)
        const MapScoresInfo = await MapScores.body.json()

        const DescList = []
        for (var i in TopPlays) {
            const Result = await getMap(TopPlays[i].pp, MapScoresInfo)
            const SR = `${await GetSR(Result[2], DroidRxMods(TopPlays[i].mods))}★`
            DescList.push(`### \`${Number(i) + 1}\` **${SR} | ${Result[0]}**\n **▸ Mods:** \`${DroidRxMods(TopPlays[i].mods)}\`\n> **▸ PP:** \`${TopPlays[i].pp.toFixed(2)}\` **• Rating:** ${PlayEmoList.rating[TopPlays[i].rank]}\n> **▸ Score:** \`${TopPlays[i].score}\` **• Accuracy: ** \`${TopPlays[i].acc.toFixed(2)}%\`\n> **▸ Combo:** \`${TopPlays[i].combo}x/${Result[1]}x\`\n${PlayEmoList.hits.hit300} \`${TopPlays[i].hit300}\` | ${PlayEmoList.hits.hit100} \`${TopPlays[i].hit100}\` | ${PlayEmoList.hits.hit50} \`${TopPlays[i].hit50}\` | ${PlayEmoList.hits.hitmiss} \`${TopPlays[i].hitmiss}\`\n> **▸ Submitted At:** <t:${Math.floor(TopPlays[i].date / 1000)}> (<t:${Math.floor(TopPlays[i].date / 1000)}:R>)\n\n`)
        }

        const EmbedDesc = []
        let tempstr = `\n> **Total PP:** \`${ProfileResult.stats.pp}\`\n> **Ranking:** \`${ProfileResult.stats.rank}\`\n\n`
        for (var i in DescList) {
            tempstr += DescList[i]
            if (i > 0 && i % 5 === 4 || i == DescList.length - 1) {
                EmbedDesc.push(tempstr)
                tempstr = `\n> **Total PP:** \`${ProfileResult.stats.pp}\`\n> **Ranking:** \`${ProfileResult.stats.rank}\`\n\n`
            }
        }

        let listlen = EmbedDesc.length
        page = (page <= listlen - 1) ? page : listlen - 1

        const EmbedList = []
        for (var i in EmbedDesc) {
            EmbedList[i] = new EmbedBuilder()
                .setColor('Aqua')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle(`<:seiaconcerned:1244129048494473246> • Top Plays Of: \`${ProfileResult.name}\` \`[${ProfileResult.id}]\``)
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
