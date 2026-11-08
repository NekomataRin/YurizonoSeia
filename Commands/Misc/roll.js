const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a random number - Default: 0 to 100')
        .setDescriptionLocalizations({ vi: 'Roll một số ngẫu nhiên trong khoảng - Mặc định: 0 đến 100' })
        .addIntegerOption(option =>
            option.setName('minlimit')
                .setDescription('Lowest number - Default: 0')
                .setDescriptionLocalizations({ vi: 'Giới hạn dưới - Mặc định: 0' })
                .setMinValue(0)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('maxlimit')
                .setDescription('Highest number - Default: 100')
                .setDescriptionLocalizations({ vi: 'Giới hạn trên - Mặc định: 100' })
                .setMinValue(0)
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'Roll', LangKey, 10000)) return

        //Typed the other way around? Swap them
        let Min = interaction.options.getInteger('minlimit') ?? 0
        let Max = interaction.options.getInteger('maxlimit') ?? 100
        if (Min > Max) [Min, Max] = [Max, Min]
        const Result = Math.floor(Math.random() * (Max - Min + 1)) + Min

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'DarkButNotBlack')
                .setTitle('<a:ShirokoSparkle:1230151011205648504> **Number Roll**')
                .setDescription(vi ? `> ${interaction.user} đã roll được **${Result}** điểm\n-# Khoảng: \`${Min}\` - \`${Max}\`` : `> ${interaction.user} rolled **${Result}** points\n-# Range: \`${Min}\` - \`${Max}\``)]
        })
    }
}
