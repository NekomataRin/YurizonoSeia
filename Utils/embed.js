const { EmbedBuilder } = require('discord.js')

const CreatedYear = new Date(1716717600 * 1000).getFullYear()

const FooterIcons = [
    'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia0.png',
    'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia1.png',
    'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia2.png',
    'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia3.png',
    'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia4.png'
]

// Footer text + a random Seia icon (the year is read on every call, so it stays right after New Year)
function Footer() {
    return {
        text: `©${CreatedYear}-${new Date().getFullYear()} • Yurizono Seia ▸ LYG Code V2 by nekorin727`,
        iconURL: FooterIcons[Math.floor(Math.random() * FooterIcons.length)]
    }
}

// Avatar of a GuildMember (server avatar) or a User
function AvatarOf(target, size = 512) {
    return target?.displayAvatarURL?.({ size }) ?? null
}

// Embed author = who used the command (server avatar when they have one)
function Author(interaction) {
    const member = (interaction.member?.displayAvatarURL) ? interaction.member : interaction.user
    return { name: interaction.user.username, iconURL: AvatarOf(member) }
}

// The base embed of every command: author, timestamp, footer
function SeiaEmbed(interaction, color = 'White') {
    return new EmbedBuilder()
        .setColor(color)
        .setAuthor(Author(interaction))
        .setTimestamp()
        .setFooter(Footer())
}

// Cuts a text so it fits in an embed field (1024) or description (4096)
function Cut(text, max = 1024) {
    text = String(text ?? '')
    return (text.length > max) ? text.slice(0, max - 3) + '...' : text
}

module.exports = { Footer, Author, SeiaEmbed, AvatarOf, Cut }
