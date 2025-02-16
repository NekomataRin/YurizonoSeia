//const chalk = require('chalk')
const BlackListedUsers = require('../../Utils/blacklistusers')

module.exports = async (client, interaction) => {
    if(BlackListedUsers.indexOf(interaction.user.id) !== -1) return interaction.reply('Unfortunately, I am sorry, but you do not have access to this command since you\'re banned.')
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        //console.error(`${chalk.red('[ERROR]')} There Are No Command Fits The Name As ${interaction.commandName}`);
        return;
    }
    if (interaction.isAutocomplete()) {
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            let a = error.toString()
            console.error(error);
            console.error(a)
        }
    }

    if (!interaction.isChatInputCommand()) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        let a = error.toString()
        console.error(error);
        console.error(a)
    }

    if (!interaction.isButton()) return;
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.isModalSubmit()) return;

    //console.log(interaction)
}
