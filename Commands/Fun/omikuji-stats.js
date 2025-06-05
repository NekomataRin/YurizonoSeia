const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

const Omikuji = require('../../Database/Fun/omikuji')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('omikuji-stats')
        .setDescription('Show the stats of the user\'s daily omikuji usage, or server'),

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

        const OmiStats = new EmbedBuilder()
            .setColor('White')
            .setTitle(`🎋 Checking Omikuji Stats Of A User`)
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setDescription(`Please choose the user you want to check the stats, or press [<:HikariREE:1356028568961941636> Skip] for the server's stats`)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const InputEmbed = await interaction.editReply({
            embeds: [OmiStats],
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
                .setTitle(`🎋 Checking Omikuji Stats Of A User`)
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
            const Omikuji_Another = await Omikuji.findOne({ GuildId: interaction.guild.id }).select('-_id UserRecords')
            const tuser = await interaction.guild.members.fetch(targetid)

            let responsekey = false, UserObj = {}
            const UserData = Omikuji_Another.UserRecords

            for (var i in UserData) {
                if (UserData[i].UserID === targetid) {
                    responsekey = true
                    UserObj = UserData[i]
                    break
                }
            }

            let total = 0
            if (responsekey) {
                const SSArr = UserObj['SS-Tier']
                for (var i in Object.keys(UserObj)) {
                    let Key = Object.keys(UserObj)[i]

                    if (Key !== 'SS-Tier' && Key !== 'UserID') {
                        total += UserObj[Key]
                    }
                }
                for (var i in Object.keys(SSArr)) {
                    total += SSArr[i]
                }
                
            }
            const desc = (!responsekey) ?
                `<a:SeiaMuted:1336385867136241705> Well, <@${targetid}> doesn't have any stats for this, which means they have never test their daily luck, after all...` :
                `### User: <@${targetid}>\n▸ **Total Checking Usage:** \`${total}\`\n• **C-Tier:** \`${UserObj['C-Tier']}\`\n• **B-Tier:** \`${UserObj['B-Tier']}\`\n• **A-Tier:** \`${UserObj['A-Tier']}\`\n• **S-Tier:** \`${UserObj['S-Tier']}\`\n• **SS-Tier:**\n> ▸ **Youko:** \`${UserObj['SS-Tier'][0]}\`\n> ▸ **Nakao:** \`${UserObj['SS-Tier'][1]}\`\n> ▸ **Rin:** \`${UserObj['SS-Tier'][2]}\`\n• **EX-Tier:** \`${UserObj['EX-Tier']}\``

            const ResponseEmbed = new EmbedBuilder()
                .setColor('White')
                .setTitle(`🎋 Checking Omikuji Stats Of A User`)
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
            const OmikujiData = await Omikuji.findOne({ GuildId: interaction.guild.id }).select('-_id TypeRecords')
            if (OmikujiData.TypeRecords.length === 0) {
                const OmiServer = new EmbedBuilder()
                    .setColor('White')
                    .setTitle(`🎋 Checking Omikuji Stats Of The Server`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription(`<a:SeiaMuted:1336385867136241705> Well, server **${interaction.guild.name}** doesn't have actual data for this... please try again later.`)
                    .setTimestamp(Date.now())
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                return interaction.editReply({
                    embeds: [OmiServer],
                    components: []
                })
            }

            let total = 0
            const SSArr = OmikujiData.TypeRecords[0]['SS-Tier']
            for (var i in Object.keys(OmikujiData.TypeRecords[0])) {
                let Key = Object.keys(OmikujiData.TypeRecords[0])[i]

                if (Key !== 'SS-Tier') {
                    total += OmikujiData.TypeRecords[0][Key]
                }
            }
            for (var i in Object.keys(SSArr)) {
                total += SSArr[i]
            }

            const desc = `### Server: \`${interaction.guild.name}\`\n▸ **Total Checking Usage:** \`${total}\`\n• **C-Tier:** \`${OmikujiData.TypeRecords[0]['C-Tier']}\`\n• **B-Tier:** \`${OmikujiData.TypeRecords[0]['B-Tier']}\`\n• **A-Tier:** \`${OmikujiData.TypeRecords[0]['A-Tier']}\`\n• **S-Tier:** \`${OmikujiData.TypeRecords[0]['S-Tier']}\`\n• **SS-Tier:**\n> ▸ **Youko:** \`${OmikujiData.TypeRecords[0]['SS-Tier'][0]}\`\n> ▸ **Nakao:** \`${OmikujiData.TypeRecords[0]['SS-Tier'][1]}\`\n> ▸ **Rin:** \`${OmikujiData.TypeRecords[0]['SS-Tier'][2]}\`\n• **EX-Tier:** \`${OmikujiData.TypeRecords[0]['EX-Tier']}\``
            const OmiStat_Server = new EmbedBuilder()
                .setColor('White')
                .setTitle(`🎋 Checking Omikuji Stats Of The Server`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(desc)
                .setTimestamp(Date.now())
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [OmiStat_Server],
                components: []
            })
        }
    }
}