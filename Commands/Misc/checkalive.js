const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkalive')
        .setDescription('Check the bot\'s current status in the server'),

    async execute(interaction) {
        await interaction.deferReply()
        const cdtime = 5000

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        if (await OnCooldown(interaction, 'CheckAlive', LangKey, cdtime)) return

        //Uptime Calc (Basic Lol)
        let totalSeconds = Math.floor(interaction.client.uptime / 1000)
        const days = Math.floor(totalSeconds / 86400)
        totalSeconds %= 86400
        const hours = Math.floor(totalSeconds / 3600)
        totalSeconds %= 3600
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
        const seconds = String(totalSeconds % 60).padStart(2, '0')

        const Desc = {
            'vi': `> Server: **${interaction.guild.name}**\n\n> Ping hiện tại: **${interaction.client.ws.ping}**ms\n> Thời gian hoạt động: **${days}**d **${hours}**h **${minutes}**m **${seconds}**s`,
            'en-US': `> Server: **${interaction.guild.name}**\n\n> Current ping: **${interaction.client.ws.ping}**ms\n> Bot uptime: **${days}**d **${hours}**h **${minutes}**m **${seconds}**s`
        }

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(`<:seiaconcerned:1244128341540208793> ${(LangKey === 'vi') ? '**Kiểm tra một vài thông tin của bot trong server**' : '**Checking some information from the bot in the server...**'}`)
                .setDescription(Desc[LangKey])]
        })
    }
}
