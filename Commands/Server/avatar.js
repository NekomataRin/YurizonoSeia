const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('View the avatar (and banner) of a user, or yours')
        .setDescriptionLocalizations({ vi: 'Xem avatar (và banner) của một người dùng, hoặc của bạn' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Whose avatar - Default: yours')
                .setDescriptionLocalizations({ vi: 'Người dùng cần xem avatar - Mặc định: bạn' })
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option')
                .setDescription('What to show - Default: the global avatar')
                .setDescriptionLocalizations({ vi: 'Hiển thị gì - Mặc định: avatar chung' })
                .addChoices(
                    { name: '[Banner]', value: 'banner', name_localizations: { vi: '[Banner] Avatar + banner chung' } },
                    { name: '[Guild]', value: 'guild', name_localizations: { vi: '[Guild] Avatar trong server' } },
                    { name: '[Guild + Banner]', value: 'gnb', name_localizations: { vi: '[Guild + Banner] Avatar + banner trong server' } })
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'Avatar', LangKey, 5000)) return

        const OptionKey = interaction.options.getString('option') || 'none'
        const Guild = ['guild', 'gnb'].includes(OptionKey)
        const ShowBanner = ['banner', 'gnb'].includes(OptionKey)
        const target = interaction.options.getUser('user') || interaction.user

        //Global profile (the banner needs a forced fetch) + the server profile for the Guild options
        const user = await target.fetch(true).catch(() => target)
        const member = (Guild) ? await interaction.guild.members.fetch({ user: target.id, force: true }).catch(() => null) : null
        const Peek = `> <:SeiaPeek:1244890461592621147> **(User: ${target})**`

        //Server avatar when they have one, else the global one (the title says which one is shown)
        const Source = (member?.avatar) ? member : user
        const Url = (extension) => Source.displayAvatarURL({ size: 2048, extension, forceStatic: true })
        const Links = [`[PNG](${Url('png')})`, `[JPG](${Url('jpg')})`, `[WEBP](${Url('webp')})`]
        if (Source.avatar?.startsWith('a_')) Links.push(`[GIF](${Source.displayAvatarURL({ size: 2048, extension: 'gif' })})`)
        let AvatarNote = ''
        if (Guild && !member) AvatarNote = vi ? '\n-# Người này không có trong server, đây là avatar chung' : '\n-# Not in this server, this is their global avatar'
        else if (Guild && !member.avatar) AvatarNote = vi ? '\n-# Không có avatar riêng trong server, đây là avatar chung' : '\n-# No server avatar, this is their global one'

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'Blue')
                .setTitle(`<:seiaehem:1244128370669650060> **Avatar Displayer** (${(member?.avatar) ? 'Guild' : 'Global'})`)
                .setDescription(`${Links.join(' • ')}\n${Peek}${AvatarNote}`)
                .setImage(Source.displayAvatarURL({ size: 2048 }))]
        })
        if (!ShowBanner) return

        //Server banner first ([Guild + Banner]), then the global one
        const GuildBanner = (member) ? member.bannerURL({ size: 2048 }) : null
        const Banner = GuildBanner || user.bannerURL({ size: 2048 })
        if (!Banner) {
            return interaction.followUp({
                embeds: [SeiaEmbed(interaction, 'Grey')
                    .setTitle('<:seiaehem:1244128370669650060> **Banner Displayer**')
                    .setDescription(vi ? `${Peek}\n${target} không có banner nào cả${(Guild) ? ' (cả banner trong server lẫn banner chung)' : ''}` : `${Peek}\n${target} has no banner${(Guild) ? ' (neither a server banner nor a global one)' : ''}`)]
            })
        }
        const BannerNote = (Guild && !GuildBanner) ? (vi ? '\n-# Không có banner riêng trong server, đây là banner chung' : '\n-# No server banner, this is their global one') : ''
        await interaction.followUp({
            embeds: [SeiaEmbed(interaction, 'Blue')
                .setTitle(`<:seiaehem:1244128370669650060> **Banner Displayer** (${(GuildBanner) ? 'Guild' : 'Global'})`)
                .setDescription(`[Banner_URL](${Banner})\n${Peek}${BannerNote}`)
                .setImage(Banner)]
        })
    }
}
