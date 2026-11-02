const { SlashCommandBuilder, ChannelType, ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { SavedLanguage, AskLanguage, LocaleLang } = require('../../Utils/language')
const Config = require('../../Utils/config')
const Log = require('../../Utils/logger')
const { ModE, RequireMod } = require('../../Functions/Moderation/mod')

// One box of the form. Label: 45 characters max, description: 100 (Discord)
const Box = (label, description, input) => new LabelBuilder().setLabel(label).setDescription(description).setTextInputComponent(input)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('-Mod Only- Post an announcement in a channel (opens a form)')
        .setDescriptionLocalizations({ vi: '-Mod Only- Đăng thông báo cho cả server vào một kênh (mở form để nhập)' })
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Where to post the announcement')
                .setDescriptionLocalizations({ vi: 'Kênh bạn muốn đăng thông báo' })
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true)),

    async execute(interaction) {
        //No deferReply here: the form (modal) must be Seia's first answer, within 3 seconds.
        //So the saved language is only waited for 1s, after that the form follows the Discord language
        const Saved = await Promise.race([SavedLanguage(interaction.user.id).catch(() => undefined), wait(1000).then(() => undefined)])
        if (Saved === null) return AskLanguage(interaction)
        const LangKey = Saved || LocaleLang(interaction)
        const vi = (LangKey === 'vi')
        if (!await RequireMod(interaction, LangKey)) return

        const channel = interaction.options.getChannel('channel')
        const Ping = Config.Roles[interaction.guild.id]?.AnnouncePing
        const ModalID = `announcement-${interaction.id}`

        await interaction.showModal(new ModalBuilder()
            .setCustomId(ModalID)
            .setTitle(vi ? 'Bạn sẽ thông báo gì cho server?' : 'What will you announce?')
            .addLabelComponents(
                Box(vi ? 'Tiêu đề' : 'Title', vi ? 'Tiêu đề của thông báo' : 'Title of the announcement',
                    new TextInputBuilder().setCustomId('title').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(256).setRequired(true)),
                Box(vi ? 'Nội dung' : 'Announcement', vi ? 'Nội dung của thông báo' : 'What you want to say',
                    new TextInputBuilder().setCustomId('desc').setStyle(TextInputStyle.Paragraph).setMinLength(1).setMaxLength(4000).setRequired(true)),
                Box(vi ? 'Tin nhắn đi kèm' : 'Message above it',
                    (Ping) ? (vi ? 'Không bắt buộc, để trống = ping role thông báo của server' : 'Optional, empty = pings the announcement role') : (vi ? 'Không bắt buộc, vd: @everyone' : 'Optional, e.g. @everyone'),
                    new TextInputBuilder().setCustomId('context').setStyle(TextInputStyle.Short).setMaxLength(255).setRequired(false)),
                Box(vi ? 'Link ảnh' : 'Image link', vi ? 'Không bắt buộc, ảnh trong embed (https://...)' : 'Optional, image in the embed (https://...)',
                    new TextInputBuilder().setCustomId('image').setStyle(TextInputStyle.Short).setMaxLength(1000).setRequired(false))
            ))

        //15 minutes to write it. Closing the form = nothing happens
        const submit = await interaction.awaitModalSubmit({ filter: i => i.customId === ModalID && i.user.id === interaction.user.id, time: 15 * 60 * 1000 }).catch(() => null)
        if (!submit) return
        await submit.deferReply({ flags: MessageFlags.Ephemeral })

        const Field = (id) => submit.fields.getTextInputValue(id)?.trim() || ''
        const Context = Field('context') || ((Ping) ? `<@&${Ping}>` : '')
        const Image = Field('image')
        const ValidImage = /^https:\/\/\S+$/i.test(Image)

        const Announce = SeiaEmbed(interaction).setTitle(Field('title')).setDescription(Field('desc'))
        if (ValidImage) Announce.setImage(Image)

        try {
            await channel.send({ content: Context || undefined, embeds: [Announce] })
        } catch (err) {
            Log.Error(`Announcement (${interaction.guild.name}) - cannot post in #${channel.name}:`, err.message)
            return submit.editReply({ embeds: [SeiaEmbed(interaction, 'DarkButNotBlack')
                .setTitle(`${ModE.Bruh} **${vi ? 'Không gửi được thông báo' : 'Could not post it'}**`)
                .setDescription(vi ? `Uhh, em không gửi được vào ${channel}: \`${err.message}\`\n-# Kiểm tra lại quyền của em trong kênh đó nhé (xem kênh, gửi tin nhắn, nhúng link)` : `Uhh, I couldn't post in ${channel}: \`${err.message}\`\n-# Check my permissions there (view channel, send messages, embed links)`)] })
        }

        const ImageNote = (Image && !ValidImage) ? (vi ? '\n-# Link ảnh không hợp lệ (phải bắt đầu bằng `https://`) nên em bỏ qua nhé' : '\n-# The image link was not valid (it must start with `https://`), so I skipped it') : ''
        await submit.editReply({ content: `${vi ? 'Đã gửi thông báo đến' : 'Announcement sent to'} ${channel}${ImageNote}` })
    }
}
