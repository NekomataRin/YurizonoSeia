const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const Langugage = require('../../Database/lang-setup')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-language')
        .setDescription('Setup your default language of this bot for responding - Default: "en-US"')
        .setDescriptionLocalizations({ vi: 'Setup ngôn ngữ hệ thống cho phản hồi của bot - Mặc định: "en-US"' })
        .addStringOption(option =>
            option.setName('lang-key')
                .setDescription('Choose your default language')
                .addChoices(
                    {
                        name: '[vi] - Tiếng Việt',
                        value: 'vi'
                    },
                    {
                        name: '[en-US] - English (US)',
                        value: 'en-US'
                    })
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const langkey = interaction.options.getString('lang-key')

        const descs = {
            'vi': {
                Color: "Red",
                Title: [
                    "Thiết lập ngôn ngữ mặc định thành công",
                    "Chỉnh sửa ngôn ngữ mặc định thành công",
                    "Chỉnh sửa ngôn ngữ mặc định"
                ],
                Desc: [
                    `Đã thiết lập ngôn ngữ chính của Sensei thành \`${langkey}\` - Tiếng Việt`,
                    `Đã chỉnh sửa ngôn ngữ chính của Sensei thành \`${langkey}\` - Tiếng Việt`,
                    `Sensei à... Ngôn ngữ mặc định đã là \`${langkey}\` - Tiếng Việt thì cần gì phải đổi ạ?`
                ]
            },
            'en-US': {
                Color: "Blue",
                Title: [
                    "Successfully setup Default Language",
                    "Successfully edited Default Language",
                    "Editing Default Language"
                ],
                Desc: [
                    `Successfully setup Sensei's Default Language to \`${langkey}\` - English (US)`,
                    `Successfully change Sensei's Default Language to \`${langkey}\` - English (US)`,
                    `Sensei... Your default language is already \`${langkey}\` - English (US), isn't that the language you chose?`
                ]
            }
        }[langkey]

        //0 = first time, 1 = changed, 2 = same as before
        const before = await Langugage.findOneAndUpdate({ UserID: interaction.user.id }, { $set: { Lang: langkey } }, { upsert: true }).lean()
        const value = (!before) ? 0 : (before.Lang !== langkey) ? 1 : 2

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, descs.Color)
                .setTitle(`<:seiaconcerned:1244128341540208793> • **${descs.Title[value]}**`)
                .setDescription(`<:seiaehem:1244128370669650060> • ${descs.Desc[value]}`)]
        })
    }
}
