const { EmbedBuilder, SlashCommandAssertions, SlashCommandBuilder } = require('discord.js')
const BotOwners = require('../../Utils/owners')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify-mem')
        .setDescription('-Neko Rin\'s Only- Verify the member of the Server Partner - LazyGang')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to verify')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()
        return interaction.editReply('This command is NO LONGER Supported, Sorry!')
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const user = interaction.options.getUser('user')
        const tuser = await interaction.guild.members.fetch(user.id)

        let key = false
        if (BotOwners.includes(interaction.user.id)) {
            key = true
        }

        if (!key) {
            const NoPerm = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244128341540208793> • No permissions')
                .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [NoPerm]
            })
        }

        await interaction.guild.members.fetch()
        const role = await interaction.guild.roles.cache.find(role => role.id === '1272334059992911965')
        if (role.members.map(m => m.id).includes(user.id)) return interaction.editReply(`<:seiaconcerned:1244128341540208793> There's no need to verify them... They got the role already...`)
        else {
            await tuser.roles.add('1272334059992911965')
            const Verify = new EmbedBuilder()
                .setColor('Yellow')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaheh:1244128244664504392> • Member Verified Successfully.')
                .setDescription(`<:seiaehem:1244129111169826829> • ${user} has been verified to be the member of Lazy Gang based on the original server, welcome to the branch!`)
                .setTimestamp()
                .setThumbnail(tuser.displayAvatarURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

            await interaction.editReply({
                embeds: [Verify]
            })
        }
    }
}