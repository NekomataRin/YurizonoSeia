const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ModalBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tourney-form')
        .setDescription('Give us about your thoughts for the next tournament aspect')
        .addStringOption(option =>
            option.setName('statement')
                .setDescription('Your statement of the thing (Yes/No)')
                .addChoices(
                    { name: "[Yes]", value: "Yes" },
                    { name: "[No]", value: "No" }
                )
                .setRequired(true)),

    async execute(interaction) {

        const channel = await interaction.guild.channels.fetch('1249352286602526831')
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const UserStatements = await interaction.options.getString('statement')
    
        function ReturnStr(UserStatements) {
            let str
            if(UserStatements === 'Yes') {
                return str = 'Reason why you chose "Yes" for the answer'
            } else {
                return str = 'Reason why you chose "No for the answer'
            }
        }
        const SuggestForm = new ModalBuilder()
            .setCustomId('suggestform')
            .setTitle('Will EZ Mod Be Kept In The 2nd Tournament?')

        const Name = new TextInputBuilder()
            .setCustomId('name_')
            .setStyle(TextInputStyle.Short)
            .setLabel('Your Discord username - e.g @nekorin727')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)

        const InGameName = new TextInputBuilder()
            .setCustomId('ign_')
            .setStyle(TextInputStyle.Short)
            .setLabel('Your in game name - e.g KiryuuKikyou')
            .setMinLength(1)
            .setMaxLength(255)
            .setRequired(true)

        const YourOpinions = new TextInputBuilder()
            .setCustomId('opinions_')
            .setStyle(TextInputStyle.Paragraph)
            .setLabel(ReturnStr(UserStatements))
            .setMaxLength(2000)
            .setRequired(true)

        const NameTxt = new ActionRowBuilder().addComponents(Name)
        const InGameNameText = new ActionRowBuilder().addComponents(InGameName)
        const Opinions = new ActionRowBuilder().addComponents(YourOpinions)

        SuggestForm.addComponents(NameTxt, InGameNameText, Opinions)

        await interaction.showModal(SuggestForm)
        const ModalResponse = await interaction.awaitModalSubmit({
            filter: (i) =>
                i.customId === 'suggestform' && i.user.id === interaction.user.id,
            time: 300000
        }).catch(err => {
            console.error(err.toString())
            const NoData = new EmbedBuilder()
                .setColor('Yellow')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • No Data')
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
            const UserOpinions = ModalResponse.fields.getTextInputValue('opinions_')

            const ResponseEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Opinions From The User For The \`EZ\` Mod')
                .setDescription(`## **<:seiaehem:1244129111169826829> • Answer Details**\n\n> <:SeiaPeek:1244890461592621147> **Username:** \`${UserName}\`\n> <:SeiaSip:1244890166116618340> **In Game Name:** \`${UserInGameName}\`\n> <:seiaheh:1244128991628103700> **User's Statements**: \`${UserStatements}\`\n> <:SeiaSip:1244890166116618340> **User's Reason:**\n ${UserOpinions}`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

            await channel.send({
                embeds: [ResponseEmbed]
            })

            await ModalResponse.reply({
                content: `<:seiaheh:1244128991628103700> • Ok, I collected your form answer then, thanks so much for your thoughts!`,
                ephemeral: true
            })
        }
    }
}