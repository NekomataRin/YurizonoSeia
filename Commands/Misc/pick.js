const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

const Random = (arr) => arr[Math.floor(Math.random() * arr.length)]
const Answers = {
    'vi': ['Em chọn cái này: ', 'Theo em thì là cái này: ', 'Lựa chọn của em đây: ', 'Em chọn cho Sensei cái này: ', 'Đây, ổn chứ Sensei? '],
    'en-US': ['I pick this one: ', 'I\'d go with this: ', 'Here\'s my choice: ', 'I choose this for you: ', 'Here, is this okay? ']
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pick')
        .setDescription('Let Seia pick one of your options at random')
        .setDescriptionLocalizations({ vi: 'Để Seia chọn ngẫu nhiên một trong các lựa chọn của bạn' })
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Your options, separated by commas: pizza, sushi, phở')
                .setDescriptionLocalizations({ vi: 'Các lựa chọn, ngăn cách bằng dấu phẩy: pizza, sushi, phở' })
                .setMaxLength(1000)
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        const Options = interaction.options.getString('options').split(',').map(o => o.trim()).filter(Boolean)
        const Embed = (desc) => SeiaEmbed(interaction, 'DarkButNotBlack').setTitle(`<a:ShirokoSparkle:1230151011205648504> **${vi ? 'Ý trời mà Sensei nhận được' : 'The heavens have decided'}**`).setDescription(desc)
        if (!Options.length) return interaction.editReply({ embeds: [Embed(vi ? '> Sensei chưa ghi lựa chọn nào cả... Ví dụ: `pizza, sushi, phở`' : '> You didn\'t write any option... e.g. `pizza, sushi, phở`')] })
        if (await OnCooldown(interaction, 'Pick', LangKey, 10000)) return

        await interaction.editReply({ embeds: [Embed(`> ${interaction.user} | ${Random(Answers[LangKey])}**${Random(Options)}**`)] })
    }
}
