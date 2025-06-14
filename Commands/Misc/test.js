const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ModalBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Testing purposes for some future commands...'),

    async execute(interaction) {

        const channel = await interaction.guild.channels.fetch('1244130808680153098')
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const Form = new ModalBuilder()
            .setCustomId('regform')
            .setTitle('Test Form - For Future Purposes')

        const Name = new TextInputBuilder()
            .setCustomId('name_')
            .setStyle(TextInputStyle.Short)
            .setLabel('Your Discord Username - e.g @nekorin727')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)

        const InGameName = new TextInputBuilder()
            .setCustomId('ign_')
            .setStyle(TextInputStyle.Short)
            .setLabel('Your In Game Name - e.g Kiryuu Kikyou')
            .setMinLength(1)
            .setMaxLength(255)
            .setRequired(true)

        const YourOpinions = new TextInputBuilder()
            .setCustomId('opinions_')
            .setStyle(TextInputStyle.Paragraph)
            .setLabel('Your Opinions About This...')
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(false)

        const NameTxt = new ActionRowBuilder().addComponents(Name)
        const InGameNameText = new ActionRowBuilder().addComponents(InGameName)
        const Opinions = new ActionRowBuilder().addComponents(YourOpinions)

        Form.addComponents(NameTxt, InGameNameText, Opinions)

        await interaction.showModal(Form)
        const ModalResponse = await interaction.awaitModalSubmit({
            filter: (i) =>
                i.customId === 'regform' && i.user.id === interaction.user.id,
            time: 300000
        }).catch(err => {
            console.error(err.toString())
            const NoData = new EmbedBuilder()
                .setColor('Yellow')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244128341540208793> • No Data')
                .setDescription(`<:seiaehem:1244129111169826829> • Well, ${interaction.user}... you ran out of time to submit this form... please try again...`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            interaction.followUp({
                embeds: [NoData],
                ephemeral: true
            })
        })
        if (ModalResponse) {
            const UserName = ModalResponse.fields.getTextInputValue('name_')
            const UserInGameName = ModalResponse.fields.getTextInputValue('ign_')
            const UserOpinions = ModalResponse.fields.getTextInputValue('opinions_') || 'No opinions provided...'

            const ResponseEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244128341540208793> • Player\'s Info')
                .setDescription(`<:seiaehem:1244129111169826829> • Form details:\n> <:SeiaPeek:1244890461592621147> **Username:** \`${UserName}\`\n> <:SeiaSip:1244890166116618340> **In Game Name:** \`${UserInGameName}\`\n> <:seiaheh:1244128244664504392> **User's Opinions:** ${UserOpinions}`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

            await channel.send({
                embeds: [ResponseEmbed]
            })

            await ModalResponse.reply({
                content: `<:seiaheh:1244128244664504392> • Ok, I collected your form answer then, anyways, this is just a testing command, not the official one, okay?`,
                ephemeral: true
            })
        }
    }
}