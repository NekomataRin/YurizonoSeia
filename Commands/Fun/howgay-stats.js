const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

const Cases = require('../../Assets/Howgay/Texts/allcases')
const HowgayList = require('../../Database/Fun/howgay')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('howgay-stats')
        .setDescription('See the stats of /howgay on User or Server'),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const Selector = new UserSelectMenuBuilder()
            .setCustomId('user-selector')
            .setPlaceholder('Please Choose A User')
            .setMinValues(1)
            .setMaxValues(1)

        const SkipButton = new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('[Skip]')
            .setEmoji('1356028568961941636')
            .setStyle(ButtonStyle.Secondary)

        const UserRow = new ActionRowBuilder()
            .addComponents(Selector)

        const SkipRow = new ActionRowBuilder()
            .addComponents(SkipButton)

        const HowGayStats = new EmbedBuilder()
            .setColor('White')
            .setTitle(`🏳️‍🌈 Checking Gayness Stats Of A User`)
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setDescription(`Please choose the user you want to check the stats, or press [<:HikariREE:1356028568961941636> Skip] for the server's stats`)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const InputEmbed = await interaction.editReply({
            embeds: [HowGayStats],
            components: [UserRow, SkipRow]
        })

        let runkey = 0, targetid
        const collectorFilter = i => i.user.id = interaction.user.id
        const confirm = await InputEmbed.awaitMessageComponent({ filter: collectorFilter, time: 30000, errors: ['time'] })
        if (confirm.customId === 'user-selector') {
            runkey = 1
            targetid = confirm.values[0]
            const WaitEmbed = new EmbedBuilder()
                .setColor('White')
                .setTitle(`🏳️‍🌈 Checking Gayness Stats Of A User`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`Please wait for the stats of <@${targetid}>...`)
                .setTimestamp(Date.now())
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [WaitEmbed],
                components: []
            })
        } else if (confirm.customId === 'skip') {
            runkey = 2
        } else {
            const ErrEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Err - Timed Out`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`Bro, you forget to choose anything, please try again!`)
                .setTimestamp(Date.now())
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [ErrEmbed],
                components: []
            })
        }

        if (runkey === 1) {
            const HowGayData_Another = await HowgayList.findOne({ GuildId: interaction.guild.id }).select('-_id UserRecords')
            const tuser = await interaction.guild.members.fetch(targetid)

            let responsekey = false, UserObj = {}
            const UserData = HowGayData_Another.UserRecords
            for (var i in UserData) {
                if (UserData[i].id === targetid) {
                    responsekey = true
                    UserObj = UserData[i]
                    break
                }
            }

            const desc = (!responsekey) ?
                `<a:SeiaMuted:1336385867136241705> Well, <@${targetid}> doesn't have any stats for this (maybe they are in the rejection list or have never tested before, lmao)` :
                `### User: <@${targetid}>\n▸ **Non-Average:** (Max: \`${Number(UserObj.values.max).toFixed(1)}%\` -- Min: \`${Number(UserObj.values.min).toFixed(1)}%\`)\n▸ **Average:** (Max: \`${Number(UserObj.values.maxavg).toFixed(1)}%\` -- Min: \`${Number(UserObj.values.minavg).toFixed(1)}%\`)`

            const ResponseEmbed = new EmbedBuilder()
                .setColor('White')
                .setTitle(`🏳️‍🌈 Checking Gayness Stats Of A User`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(desc)
                .setTimestamp(Date.now())
                .setThumbnail(tuser.displayAvatarURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [ResponseEmbed],
            })
        }

        if (runkey === 2) {
            const HowgayData = await HowgayList.findOne({ GuildId: interaction.guild.id }).select('-_id TypeRecords')
            const NormalTypes = HowgayData.TypeRecords[0], SpecialCases = HowgayData.TypeRecords[1]

            let desc = `## Server: ${interaction.guild.name}\n### Normal Cases:\n`
            desc += `▸ ${Cases.EmojisNormal[0]} \`${NormalTypes[0].name}\` **(0.0% - 1.0%)**: **\`[${NormalTypes[0].value}]\`**\n`
            const Keys = Object.keys(NormalTypes)
            for (var i = 1; i < Keys.length - 1; i++) {
                desc += `▸ ${Cases.EmojisNormal[i]} \`${NormalTypes[i].name}\` **(${Number(Cases.Ranges.NormalCases[i - 1]).toFixed(1)}% - ${Number(Number(Cases.Ranges.NormalCases[i]) - 0.1).toFixed(1)}%)**: **\`[${NormalTypes[i].value}]\`**\n`
            }
            desc += `▸ ${Cases.EmojisNormal[7]} \`${NormalTypes[7].name}\` **(100.0% - 101.0%)**: **\`[${NormalTypes[7].value}]\`**\n`

            desc += `\n### Special Cases\n`
            const keys = Object.keys(SpecialCases)
            for (var i in keys) {
                let key = `Case${keys[i]}`
                desc += `▸ ${Cases.SpecialCases[key].emoji} \`${Cases.SpecialCases[key].name}\` **(${keys[i]}%)**: **\`[${SpecialCases[keys[i]]}]\`**\n`
            }

            const HowGayStat_Server = new EmbedBuilder()
                .setColor('White')
                .setTitle(`🏳️‍🌈 Checking Gayness Stats Of The Server`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(desc)
                .setTimestamp(Date.now())
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [HowGayStat_Server],
                components: []
            })
        }
    }
}