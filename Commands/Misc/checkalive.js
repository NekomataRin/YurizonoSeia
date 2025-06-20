const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk')

const cdSchema = require('../../Database/cooldown')
const FooterEmbeds = require('../../Utils/embed')
const cdtxts = require('../../Assets/Defaults/cooldown')
const Language = require('../../Database/lang-setup')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkalive')
        .setDescription('Check the bot\'s current status in the server'),
    async execute(interaction) {
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        await interaction.deferReply()
        const cdtime = 5000

        //Language Setup
        let LangKey
        const LanguageKey = await Language.findOne({ UserID: interaction.user.id }).select('-_id Lang')
        if (!LanguageKey) {
            const ResponseEmbed = new EmbedBuilder()
                .setColor("Yellow")
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle(`<:seiaconcerned:1244128341540208793> • **Language Is Not Set**`)
                .setDescription(`<:seiaehem:1244128370669650060> • Sensei! Please use \`/setup-language\` command in order to use the command! Since v1.4.0, my dad updated my code and added Vietnamese language for this!\n-# > And he is too lazy to add proper vietnamese embed for this lmao`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [ResponseEmbed]
            })
        }

        LangKey = LanguageKey.Lang

        cdSchema.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                cdSchema.create({
                    UserID: interaction.user.id,
                    CheckAlive: Date.now()
                })
                await interaction.editReply(cdtxts[LangKey].new)
            } else {
                const cduser = data.UserID
                const CDTime = data.CheckAlive
                console.log(chalk.yellow('[Command: Checkalive]') + ` ${cduser}, ${CDTime}, ${Date.now()}`)

                //Uptime Calc (Basic Lol)
                let totalSeconds = (interaction.client.uptime / 1000)
                let days = Math.floor(totalSeconds / 86400)
                totalSeconds %= 86400
                let hours = Math.floor(totalSeconds / 3600)
                totalSeconds %= 3600
                let minutes = Math.floor(totalSeconds / 60)
                let seconds = Math.floor(totalSeconds % 60)
                if (minutes < 10) {
                    minutes = `0${minutes}`
                }
                if (seconds < 10) {
                    seconds = `0${seconds}`
                }

                const Desc = {
                    'vi': `> Server: **${interaction.guild.name}**\n\n> Ping hiện tại: **${interaction.client.ws.ping}**ms\n> Thời gian hoạt động: **${days}**d **${hours}**h **${minutes}**m **${seconds}**s`,
                    'en-US': `> Server: **${interaction.guild.name}**\n\n> Current ping: **${interaction.client.ws.ping}**ms\n> Bot uptime: **${days}**d **${hours}**h **${minutes}**m **${seconds}**s`
                }
                const embed = new EmbedBuilder()
                    .setColor('White')
                    .setTitle(`<:seiaconcerned:1244128341540208793> ${(LangKey === 'vi') ? '**Kiểm tra một vài thông tin của bot trong server' : '**Checking some information from the bot in the server...**'}`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription(Desc[LangKey])
                    .setTimestamp(Date.now())
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

                if (CDTime > Date.now()) {
                    const cdembed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`**Command - Cooldown**`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(`${cdtxts[LangKey].cd[0]} ${interaction.user} ${cdtxts[LangKey].cd[1]} <t:${Math.floor(CDTime / 1000)}:R>`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({ embeds: [cdembed] })
                }
                else {
                    data.CheckAlive = Date.now() + cdtime
                    data.save()
                    await interaction.editReply({ embeds: [embed] })
                }
            }
        })
    }
}