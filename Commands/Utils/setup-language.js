const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
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
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

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
        }

        Langugage.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                Langugage.create({
                    UserID: interaction.user.id,
                    Lang: langkey
                })

                const ResponseEmbed = new EmbedBuilder()
                    .setColor(descs[langkey].Color)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setTitle(`<:seiaconcerned:1244128341540208793> • **${descs[langkey].Title[0]}**`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${descs[langkey].Desc[0]}`)
                    .setTimestamp()
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                return interaction.editReply({
                    embeds: [ResponseEmbed]
                })
            }
            if (data) {
                const value = (langkey !== data.Lang) ? 1 : 2
                if (langkey !== data.Lang) {
                    data.Lang = langkey
                    data.save()
                }
                const ResponseEmbed = new EmbedBuilder()
                    .setColor(descs[langkey].Color)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setTitle(`<:seiaconcerned:1244128341540208793> • **${descs[langkey].Title[value]}**`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${descs[langkey].Desc[value]}`)
                    .setTimestamp()
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                return interaction.editReply({
                    embeds: [ResponseEmbed]
                })
            }
        })
    }
}