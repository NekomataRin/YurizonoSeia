const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { OnCooldown } = require('../../Utils/cooldown')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('View an avatar of a user, or yourself')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Show the user\'s avatar')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('option')
                .setDescription('Show the options for this command')
                .addChoices(
                    {
                        name: '[Banner]',
                        value: 'banner'
                    },
                    {
                        name: '[Guild]',
                        value: 'guild'
                    },
                    {
                        name: '[Guild + Banner]',
                        value: 'gnb'
                    }
                )
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const cdtime = 5000

        if (await OnCooldown(interaction, 'Avatar', 'en-US', cdtime)) return

        const OptionKey = interaction.options.getString('option') || 'none'
        const Guild = ['guild', 'gnb'].includes(OptionKey)
        const ShowBanner = ['banner', 'gnb'].includes(OptionKey)
        const target = interaction.options.getUser('user') || interaction.user

        //Guild = server avatar/banner (falls back to the global one)
        const user = (Guild)
            ? await interaction.guild.members.fetch({ user: target.id, force: true }).catch(() => null) || await target.fetch(true)
            : await target.fetch(true)
        const Scope = (Guild) ? 'Guild' : 'Global'

        const Url = (extension) => user.displayAvatarURL({ size: 2048, extension })
        const AvatarEmbed = SeiaEmbed(interaction, 'Blue')
            .setTitle(`<:seiaehem:1244128370669650060> **Avatar Displayer** (${Scope})`)
            .setDescription(`[PNG Format](${Url('png')}) • [JPG Format](${Url('jpg')}) • [WEBP Format](${Url('webp')})\n> <:SeiaPeek:1244890461592621147> **(User: ${user})**`)
            .setImage(Url('png'))
        await interaction.editReply({ embeds: [AvatarEmbed] })

        if (!ShowBanner) return
        //Server banner first (Guild options), then the global banner
        let BannerURL = (Guild) ? user.bannerURL?.({ size: 2048, extension: 'png' }) : null
        if (!BannerURL) BannerURL = (await target.fetch(true)).bannerURL({ size: 2048, extension: 'png' })
        if (!BannerURL) return

        await interaction.followUp({
            embeds: [SeiaEmbed(interaction, 'Blue')
                .setTitle(`<:seiaehem:1244128370669650060> **Banner Displayer** (${Scope})`)
                .setDescription(`[Banner_URL](${BannerURL})\n> <:SeiaPeek:1244890461592621147> **(User: ${user})**`)
                .setImage(BannerURL)]
        })
    }
}
