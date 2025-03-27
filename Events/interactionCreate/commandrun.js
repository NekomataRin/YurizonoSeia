//const chalk = require('chalk')

module.exports = async (client, interaction) => {
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
