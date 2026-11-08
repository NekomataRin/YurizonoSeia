const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed, AvatarOf } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Show some info about a user (or yourself)')
        .setDescriptionLocalizations({ vi: 'Kiểm tra thông tin của một người dùng (hoặc của bạn)' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who - Default: you')
                .setDescriptionLocalizations({ vi: 'Người dùng cần xem - Mặc định: bạn' })
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'UserInfo', LangKey, 10000)) return

        const user = interaction.options.getUser('user') || interaction.user
        const member = await interaction.guild.members.fetch(user.id).catch(() => null)
        const Arrow = '<a:LYG_Arrow:1093051541667196949>'
        const Time = (ms) => `<t:${Math.floor(ms / 1000)}> (<t:${Math.floor(ms / 1000)}:R>)`

        const Lines = [
            `${Arrow} **${vi ? 'Tên user' : 'User'}:** ${user} (\`${user.username}\`)${(user.bot) ? ' • 🤖 Bot' : ''}`,
            `${Arrow} **User ID:** \`${user.id}\``,
            `${Arrow} **${vi ? 'Ngày tạo tài khoản' : 'Account created'}:** ${Time(user.createdTimestamp)}`,
            (member) ? `${Arrow} **${vi ? 'Ngày tham gia server' : 'Joined the server'}:** ${Time(member.joinedTimestamp)}` : `${Arrow} **${vi ? 'Không có ở trong server này' : 'Not in this server'}**`
        ]
        if (member) Lines.push(`${Arrow} **${vi ? 'Role cao nhất' : 'Highest role'}:** ${(member.roles.highest.id === interaction.guild.id) ? '@everyone' : member.roles.highest} • **${vi ? 'Số role' : 'Roles'}:** \`${member.roles.cache.size - 1}\``)

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(`<:mikaeat:1254109782592327783> **${vi ? 'Thông tin của user' : 'User Info'}**`)
                .setDescription(Lines.join('\n'))
                .setThumbnail(AvatarOf(member || user))]
        })
    }
}
