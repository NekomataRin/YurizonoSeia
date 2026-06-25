const chalk = require('chalk')
const cron = require('node-cron')
const { EmbedBuilder } = require('discord.js')

const FooterEmbeds = require('../../Utils/embed')

module.exports = async (client) => {
    console.log(`${chalk.cyanBright('[LOG]')} ${chalk.yellowBright(client.user.tag)} Is Online!`)
}